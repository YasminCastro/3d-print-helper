import { singleton } from 'tsyringe';
import { PrintQueueItem } from '@entities/print-queue-item.entity';
import type { PrintQueueSortOption } from '@dtos/print-queue.dto';
import { prisma } from '@config/prisma';
import type { Prisma } from '@/generated/prisma/client';

const printQueueSelect = {
  id: true,
  name: true,
  durationMinutes: true,
  categoryId: true,
  printerId: true,
  printLink: true,
  notes: true,
  profitPercent: true,
  filamentCost: true,
  printCost: true,
  saleValue: true,
  saleValueWorstCase: true,
  createdAt: true,
  userId: true,
  filaments: { select: { id: true, position: true, filamentId: true, grams: true } },
  extraItems: { select: { id: true, position: true, extraItemId: true, quantity: true } },
} as const;

export interface PrintQueueFilters {
  search?: string;
  categoryIds?: number[];
  printerIds?: number[];
}

export interface PaginationParams extends PrintQueueFilters {
  page: number;
  limit: number;
  sort?: PrintQueueSortOption;
}

function buildWhere(userId: string, filters: PrintQueueFilters): Prisma.PrintQueueItemWhereInput {
  const where: Prisma.PrintQueueItemWhereInput = { userId };

  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  if (filters.categoryIds?.length) {
    where.categoryId = { in: filters.categoryIds };
  }
  if (filters.printerIds?.length) {
    where.printerId = { in: filters.printerIds };
  }

  return where;
}

const sortToOrderBy: Record<PrintQueueSortOption, Prisma.PrintQueueItemOrderByWithRelationInput[]> = {
  newest: [{ createdAt: 'desc' }],
  oldest: [{ createdAt: 'asc' }],
  name_asc: [{ name: 'asc' }],
  name_desc: [{ name: 'desc' }],
  duration_desc: [{ durationMinutes: { sort: 'desc', nulls: 'last' } }],
  duration_asc: [{ durationMinutes: { sort: 'asc', nulls: 'last' } }],
  sale_value_desc: [{ saleValue: { sort: 'desc', nulls: 'last' } }],
  sale_value_asc: [{ saleValue: { sort: 'asc', nulls: 'last' } }],
};

export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export interface IPrintQueueRepository {
  findAll(userId: string, pagination: PaginationParams): Promise<PaginatedResult<PrintQueueItem>>;
  findById(id: number, userId: string): Promise<PrintQueueItem | undefined>;
  save(queueItem: PrintQueueItem): Promise<PrintQueueItem>;
  update(id: number, userId: string, queueItem: PrintQueueItem): Promise<PrintQueueItem | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
}

@singleton()
export class PrintQueueRepository implements IPrintQueueRepository {
  async findAll(
    userId: string,
    { page, limit, sort, ...filters }: PaginationParams,
  ): Promise<PaginatedResult<PrintQueueItem>> {
    const where = buildWhere(userId, filters);

    const [rows, total] = await Promise.all([
      prisma.printQueueItem.findMany({
        where,
        orderBy: sortToOrderBy[sort ?? 'newest'],
        skip: (page - 1) * limit,
        take: limit,
        select: printQueueSelect,
      }),
      prisma.printQueueItem.count({ where }),
    ]);
    return { items: rows.map((row) => PrintQueueItem.fromPersistence(row)), total };
  }

  async findById(id: number, userId: string): Promise<PrintQueueItem | undefined> {
    const row = await prisma.printQueueItem.findFirst({
      where: { id, userId },
      select: printQueueSelect,
    });
    return row ? PrintQueueItem.fromPersistence(row) : undefined;
  }

  async save(queueItem: PrintQueueItem): Promise<PrintQueueItem> {
    const row = await prisma.printQueueItem.create({
      data: {
        ...queueItem.toPersistence(),
        filaments: {
          create: queueItem.filaments.map(({ position, filamentId, grams }) => ({
            position,
            filamentId,
            grams,
          })),
        },
        extraItems: {
          create: queueItem.extraItems.map(({ position, extraItemId, quantity }) => ({
            position,
            extraItemId,
            quantity,
          })),
        },
      },
      select: printQueueSelect,
    });
    return PrintQueueItem.fromPersistence(row);
  }

  async update(
    id: number,
    userId: string,
    queueItem: PrintQueueItem,
  ): Promise<PrintQueueItem | undefined> {
    const exists = await prisma.printQueueItem.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.$transaction(async (tx) => {
      await tx.printQueueFilament.deleteMany({ where: { queueItemId: id } });
      await tx.printQueueExtraItem.deleteMany({ where: { queueItemId: id } });

      return tx.printQueueItem.update({
        where: { id },
        data: {
          ...queueItem.toPersistence(),
          filaments: {
            create: queueItem.filaments.map(({ position, filamentId, grams }) => ({
              position,
              filamentId,
              grams,
            })),
          },
          extraItems: {
            create: queueItem.extraItems.map(({ position, extraItemId, quantity }) => ({
              position,
              extraItemId,
              quantity,
            })),
          },
        },
        select: printQueueSelect,
      });
    });

    return PrintQueueItem.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.printQueueItem.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.printQueueItem.delete({ where: { id } });
    return true;
  }
}
