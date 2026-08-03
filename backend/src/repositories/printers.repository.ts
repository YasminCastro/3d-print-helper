import { singleton } from 'tsyringe';
import { Printer } from '@entities/printer.entity';
import { prisma } from '@config/prisma';

export interface IPrintersRepository {
  findAll(userId: string): Promise<Printer[]>;
  findById(id: number, userId: string): Promise<Printer | undefined>;
  save(printer: Printer): Promise<Printer>;
  update(id: number, userId: string, printer: Printer): Promise<Printer | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
}

@singleton()
export class PrintersRepository implements IPrintersRepository {
  async findAll(userId: string): Promise<Printer[]> {
    const rows = await prisma.printer.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return rows.map((row) => Printer.fromPersistence(row));
  }

  async findById(id: number, userId: string): Promise<Printer | undefined> {
    const row = await prisma.printer.findFirst({ where: { id, userId } });
    return row ? Printer.fromPersistence(row) : undefined;
  }

  async save(printer: Printer): Promise<Printer> {
    const row = await prisma.printer.create({ data: printer.toPersistence() });
    return Printer.fromPersistence(row);
  }

  async update(id: number, userId: string, printer: Printer): Promise<Printer | undefined> {
    const exists = await prisma.printer.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.printer.update({ where: { id }, data: printer.toPersistence() });
    return Printer.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.printer.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.printer.delete({ where: { id } });
    return true;
  }
}
