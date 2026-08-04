import { singleton } from 'tsyringe';
import { PrintCategory } from '@entities/print-category.entity';
import { prisma } from '@config/prisma';

export interface IPrintCategoriesRepository {
  findAll(userId: string): Promise<PrintCategory[]>;
  findById(id: number, userId: string): Promise<PrintCategory | undefined>;
  findByName(name: string, userId: string): Promise<PrintCategory | undefined>;
  save(category: PrintCategory): Promise<PrintCategory>;
  update(id: number, userId: string, category: PrintCategory): Promise<PrintCategory | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
}

@singleton()
export class PrintCategoriesRepository implements IPrintCategoriesRepository {
  async findAll(userId: string): Promise<PrintCategory[]> {
    const rows = await prisma.printCategory.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return rows.map((row) => PrintCategory.fromPersistence(row));
  }

  async findById(id: number, userId: string): Promise<PrintCategory | undefined> {
    const row = await prisma.printCategory.findFirst({ where: { id, userId } });
    return row ? PrintCategory.fromPersistence(row) : undefined;
  }

  async findByName(name: string, userId: string): Promise<PrintCategory | undefined> {
    const row = await prisma.printCategory.findFirst({
      where: { userId, name: { equals: name, mode: 'insensitive' } },
    });
    return row ? PrintCategory.fromPersistence(row) : undefined;
  }

  async save(category: PrintCategory): Promise<PrintCategory> {
    const row = await prisma.printCategory.create({ data: category.toPersistence() });
    return PrintCategory.fromPersistence(row);
  }

  async update(id: number, userId: string, category: PrintCategory): Promise<PrintCategory | undefined> {
    const exists = await prisma.printCategory.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.printCategory.update({ where: { id }, data: category.toPersistence() });
    return PrintCategory.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.printCategory.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.printCategory.delete({ where: { id } });
    return true;
  }
}
