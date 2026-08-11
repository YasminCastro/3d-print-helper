import { singleton } from 'tsyringe';
import { Print } from '@entities/print.entity';
import {
  printDurationRangeBounds,
  type PrintDurationRange,
  type PrintSortOption,
} from '@dtos/prints.dto';
import { prisma } from '@config/prisma';
import type { Prisma } from '@/generated/prisma/client';

const printSelect = {
  id: true,
  name: true,
  photoFilename: true,
  photoMimeType: true,
  printDate: true,
  durationMinutes: true,
  status: true,
  result: true,
  categoryId: true,
  printerId: true,
  printLink: true,
  notes: true,
  profitPercent: true,
  filamentCost: true,
  printCost: true,
  saleValue: true,
  saleValueWorstCase: true,
  saleValueActual: true,
  createdAt: true,
  userId: true,
  filaments: { select: { id: true, position: true, filamentId: true, grams: true } },
  extraItems: { select: { id: true, position: true, extraItemId: true, quantity: true } },
} as const;

export interface PrintPhotoBinary {
  filename: string;
  mimeType: string;
  data: Buffer;
}

export interface PrintFilters {
  search?: string;
  categoryIds?: number[];
  printerIds?: number[];
  statuses?: string[];
  results?: string[];
  durationRanges?: PrintDurationRange[];
}

export interface PaginationParams extends PrintFilters {
  page: number;
  limit: number;
  sort?: PrintSortOption;
}

function buildWhere(userId: string, filters: PrintFilters): Prisma.PrintWhereInput {
  const where: Prisma.PrintWhereInput = { userId };

  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' };
  }
  if (filters.categoryIds?.length) {
    where.categoryId = { in: filters.categoryIds };
  }
  if (filters.printerIds?.length) {
    where.printerId = { in: filters.printerIds };
  }
  if (filters.statuses?.length) {
    where.status = { in: filters.statuses };
  }
  if (filters.results?.length) {
    where.result = { in: filters.results };
  }
  if (filters.durationRanges?.length) {
    where.OR = filters.durationRanges.map((range) => {
      const bounds = printDurationRangeBounds[range];
      return {
        durationMinutes: {
          gte: bounds.min,
          ...(bounds.max != null ? { lte: bounds.max } : {}),
        },
      };
    });
  }

  return where;
}

const sortToOrderBy: Record<PrintSortOption, Prisma.PrintOrderByWithRelationInput[]> = {
  newest: [{ printDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
  oldest: [{ printDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
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

export interface IPrintsRepository {
  findAll(userId: string, pagination: PaginationParams): Promise<PaginatedResult<Print>>;
  findById(id: number, userId: string): Promise<Print | undefined>;
  save(print: Print): Promise<Print>;
  update(id: number, userId: string, print: Print): Promise<Print | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
  setPhoto(
    id: number,
    userId: string,
    photo: { filename: string; mimeType: string; data: Buffer },
  ): Promise<Print | undefined>;
  removePhoto(id: number, userId: string): Promise<Print | undefined>;
  getPhotoBinary(id: number, userId: string): Promise<PrintPhotoBinary | undefined>;
}

@singleton()
export class PrintsRepository implements IPrintsRepository {
  async findAll(
    userId: string,
    { page, limit, sort, ...filters }: PaginationParams,
  ): Promise<PaginatedResult<Print>> {
    const where = buildWhere(userId, filters);

    const [rows, total] = await Promise.all([
      prisma.print.findMany({
        where,
        orderBy: sortToOrderBy[sort ?? 'newest'],
        skip: (page - 1) * limit,
        take: limit,
        select: printSelect,
      }),
      prisma.print.count({ where }),
    ]);
    return { items: rows.map((row) => Print.fromPersistence(row)), total };
  }

  async findById(id: number, userId: string): Promise<Print | undefined> {
    const row = await prisma.print.findFirst({ where: { id, userId }, select: printSelect });
    return row ? Print.fromPersistence(row) : undefined;
  }

  async save(print: Print): Promise<Print> {
    const row = await prisma.print.create({
      data: {
        ...print.toPersistence(),
        filaments: {
          create: print.filaments.map(({ position, filamentId, grams }) => ({
            position,
            filamentId,
            grams,
          })),
        },
        extraItems: {
          create: print.extraItems.map(({ position, extraItemId, quantity }) => ({
            position,
            extraItemId,
            quantity,
          })),
        },
      },
      select: printSelect,
    });
    return Print.fromPersistence(row);
  }

  async update(id: number, userId: string, print: Print): Promise<Print | undefined> {
    const exists = await prisma.print.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.$transaction(async (tx) => {
      await tx.printFilament.deleteMany({ where: { printId: id } });
      await tx.printExtraItem.deleteMany({ where: { printId: id } });

      return tx.print.update({
        where: { id },
        data: {
          ...print.toPersistence(),
          filaments: {
            create: print.filaments.map(({ position, filamentId, grams }) => ({
              position,
              filamentId,
              grams,
            })),
          },
          extraItems: {
            create: print.extraItems.map(({ position, extraItemId, quantity }) => ({
              position,
              extraItemId,
              quantity,
            })),
          },
        },
        select: printSelect,
      });
    });

    return Print.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.print.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.print.delete({ where: { id } });
    return true;
  }

  async setPhoto(
    id: number,
    userId: string,
    photo: { filename: string; mimeType: string; data: Buffer },
  ): Promise<Print | undefined> {
    const exists = await prisma.print.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.print.update({
      where: { id },
      data: {
        photoFilename: photo.filename,
        photoMimeType: photo.mimeType,
        photoData: new Uint8Array(photo.data),
      },
      select: printSelect,
    });
    return Print.fromPersistence(row);
  }

  async removePhoto(id: number, userId: string): Promise<Print | undefined> {
    const exists = await prisma.print.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.print.update({
      where: { id },
      data: { photoFilename: null, photoMimeType: null, photoData: null },
      select: printSelect,
    });
    return Print.fromPersistence(row);
  }

  async getPhotoBinary(id: number, userId: string): Promise<PrintPhotoBinary | undefined> {
    const print = await prisma.print.findFirst({
      where: { id, userId },
      select: { photoFilename: true, photoMimeType: true, photoData: true },
    });
    if (!print || !print.photoData || !print.photoFilename || !print.photoMimeType) return undefined;

    return {
      filename: print.photoFilename,
      mimeType: print.photoMimeType,
      data: Buffer.from(print.photoData),
    };
  }
}
