import { singleton } from 'tsyringe';
import { FilamentBrand } from '@entities/brand.entity';
import { prisma } from '@config/prisma';

export interface IBrandsRepository {
  findAll(userId: string): Promise<FilamentBrand[]>;
  findById(id: number, userId: string): Promise<FilamentBrand | undefined>;
  save(brand: FilamentBrand): Promise<FilamentBrand>;
  update(id: number, userId: string, brand: FilamentBrand): Promise<FilamentBrand | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
}

@singleton()
export class BrandsRepository implements IBrandsRepository {
  async findAll(userId: string): Promise<FilamentBrand[]> {
    const rows = await prisma.filamentBrand.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return rows.map((row) => FilamentBrand.fromPersistence(row));
  }

  async findById(id: number, userId: string): Promise<FilamentBrand | undefined> {
    const row = await prisma.filamentBrand.findFirst({ where: { id, userId } });
    return row ? FilamentBrand.fromPersistence(row) : undefined;
  }

  async save(brand: FilamentBrand): Promise<FilamentBrand> {
    const row = await prisma.filamentBrand.create({ data: brand.toPersistence() });
    return FilamentBrand.fromPersistence(row);
  }

  async update(id: number, userId: string, brand: FilamentBrand): Promise<FilamentBrand | undefined> {
    const exists = await prisma.filamentBrand.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.filamentBrand.update({
      where: { id },
      data: brand.toPersistence(),
    });
    return FilamentBrand.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.filamentBrand.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.filamentBrand.delete({ where: { id } });
    return true;
  }
}
