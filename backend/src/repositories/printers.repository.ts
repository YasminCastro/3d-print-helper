import { singleton } from 'tsyringe';
import { Printer } from '@entities/printer.entity';
import { prisma } from '@config/prisma';

export interface IPrintersRepository {
  findAll(): Promise<Printer[]>;
  findById(id: number): Promise<Printer | undefined>;
  save(printer: Printer): Promise<Printer>;
  update(id: number, printer: Printer): Promise<Printer | undefined>;
  delete(id: number): Promise<boolean>;
}

@singleton()
export class PrintersRepository implements IPrintersRepository {
  async findAll(): Promise<Printer[]> {
    const rows = await prisma.printer.findMany({ orderBy: { id: 'asc' } });
    return rows.map((row) => Printer.fromPersistence(row));
  }

  async findById(id: number): Promise<Printer | undefined> {
    const row = await prisma.printer.findUnique({ where: { id } });
    return row ? Printer.fromPersistence(row) : undefined;
  }

  async save(printer: Printer): Promise<Printer> {
    const row = await prisma.printer.create({ data: printer.toPersistence() });
    return Printer.fromPersistence(row);
  }

  async update(id: number, printer: Printer): Promise<Printer | undefined> {
    const exists = await prisma.printer.findUnique({ where: { id } });
    if (!exists) return undefined;

    const row = await prisma.printer.update({ where: { id }, data: printer.toPersistence() });
    return Printer.fromPersistence(row);
  }

  async delete(id: number): Promise<boolean> {
    const exists = await prisma.printer.findUnique({ where: { id } });
    if (!exists) return false;

    await prisma.printer.delete({ where: { id } });
    return true;
  }
}
