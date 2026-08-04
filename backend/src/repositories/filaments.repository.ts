import { singleton } from 'tsyringe';
import { Filament } from '@entities/filament.entity';
import { prisma } from '@config/prisma';

export interface IFilamentsRepository {
  findAll(userId: string): Promise<Filament[]>;
  findById(id: number, userId: string): Promise<Filament | undefined>;
  save(filament: Filament): Promise<Filament>;
  update(id: number, userId: string, filament: Filament): Promise<Filament | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
}

function toCreateData(filament: Filament) {
  const { brandId, userId, ...rest } = filament.toPersistence();

  return {
    ...rest,
    ...(brandId != null ? { brand: { connect: { id: brandId } } } : {}),
    user: { connect: { id: userId } },
  };
}

function toUpdateData(filament: Filament) {
  const { brandId, userId: _userId, ...rest } = filament.toPersistence();

  return {
    ...rest,
    brand: brandId != null ? { connect: { id: brandId } } : { disconnect: true },
  };
}

@singleton()
export class FilamentsRepository implements IFilamentsRepository {
  async findAll(userId: string): Promise<Filament[]> {
    const rows = await prisma.filament.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return rows.map((row) => Filament.fromPersistence(row));
  }

  async findById(id: number, userId: string): Promise<Filament | undefined> {
    const row = await prisma.filament.findFirst({ where: { id, userId } });
    return row ? Filament.fromPersistence(row) : undefined;
  }

  async save(filament: Filament): Promise<Filament> {
    const row = await prisma.filament.create({ data: toCreateData(filament) });
    return Filament.fromPersistence(row);
  }

  async update(id: number, userId: string, filament: Filament): Promise<Filament | undefined> {
    const exists = await prisma.filament.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.filament.update({
      where: { id },
      data: toUpdateData(filament),
    });
    return Filament.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.filament.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.filament.delete({ where: { id } });
    return true;
  }
}
