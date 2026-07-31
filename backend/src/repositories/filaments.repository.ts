import { singleton } from 'tsyringe';
import { Filament } from '@entities/filament.entity';
import { prisma } from '@config/prisma';

export interface IFilamentsRepository {
  findAll(): Promise<Filament[]>;
  findById(id: number): Promise<Filament | undefined>;
  save(filament: Filament): Promise<Filament>;
  update(id: number, filament: Filament): Promise<Filament | undefined>;
  delete(id: number): Promise<boolean>;
}

@singleton()
export class FilamentsRepository implements IFilamentsRepository {
  async findAll(): Promise<Filament[]> {
    const rows = await prisma.filament.findMany({ orderBy: { id: 'asc' } });
    return rows.map((row) => Filament.fromPersistence(row));
  }

  async findById(id: number): Promise<Filament | undefined> {
    const row = await prisma.filament.findUnique({ where: { id } });
    return row ? Filament.fromPersistence(row) : undefined;
  }

  async save(filament: Filament): Promise<Filament> {
    const row = await prisma.filament.create({ data: filament.toPersistence() });
    return Filament.fromPersistence(row);
  }

  async update(id: number, filament: Filament): Promise<Filament | undefined> {
    const exists = await prisma.filament.findUnique({ where: { id } });
    if (!exists) return undefined;

    const row = await prisma.filament.update({
      where: { id },
      data: filament.toPersistence(),
    });
    return Filament.fromPersistence(row);
  }

  async delete(id: number): Promise<boolean> {
    const exists = await prisma.filament.findUnique({ where: { id } });
    if (!exists) return false;

    await prisma.filament.delete({ where: { id } });
    return true;
  }
}
