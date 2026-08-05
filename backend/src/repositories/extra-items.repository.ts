import { singleton } from 'tsyringe';
import { ExtraItem } from '@entities/extra-item.entity';
import { prisma } from '@config/prisma';

export interface IExtraItemsRepository {
  findAll(userId: string): Promise<ExtraItem[]>;
  findById(id: number, userId: string): Promise<ExtraItem | undefined>;
  save(extraItem: ExtraItem): Promise<ExtraItem>;
  update(id: number, userId: string, extraItem: ExtraItem): Promise<ExtraItem | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
}

@singleton()
export class ExtraItemsRepository implements IExtraItemsRepository {
  async findAll(userId: string): Promise<ExtraItem[]> {
    const rows = await prisma.extraItem.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return rows.map((row) => ExtraItem.fromPersistence(row));
  }

  async findById(id: number, userId: string): Promise<ExtraItem | undefined> {
    const row = await prisma.extraItem.findFirst({ where: { id, userId } });
    return row ? ExtraItem.fromPersistence(row) : undefined;
  }

  async save(extraItem: ExtraItem): Promise<ExtraItem> {
    const row = await prisma.extraItem.create({ data: extraItem.toPersistence() });
    return ExtraItem.fromPersistence(row);
  }

  async update(id: number, userId: string, extraItem: ExtraItem): Promise<ExtraItem | undefined> {
    const exists = await prisma.extraItem.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.extraItem.update({ where: { id }, data: extraItem.toPersistence() });
    return ExtraItem.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.extraItem.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.extraItem.delete({ where: { id } });
    return true;
  }
}
