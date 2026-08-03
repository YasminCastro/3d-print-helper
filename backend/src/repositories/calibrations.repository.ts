import { singleton } from 'tsyringe';
import { Calibration } from '@entities/calibration.entity';
import { prisma } from '@config/prisma';

export interface ICalibrationsRepository {
  findAll(userId: string): Promise<Calibration[]>;
  findById(id: number, userId: string): Promise<Calibration | undefined>;
  save(calibration: Calibration): Promise<Calibration>;
  update(id: number, userId: string, calibration: Calibration): Promise<Calibration | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
}

@singleton()
export class CalibrationsRepository implements ICalibrationsRepository {
  async findAll(userId: string): Promise<Calibration[]> {
    const rows = await prisma.calibration.findMany({ where: { userId }, orderBy: { id: 'asc' } });
    return rows.map((row) => Calibration.fromPersistence(row));
  }

  async findById(id: number, userId: string): Promise<Calibration | undefined> {
    const row = await prisma.calibration.findFirst({ where: { id, userId } });
    return row ? Calibration.fromPersistence(row) : undefined;
  }

  async save(calibration: Calibration): Promise<Calibration> {
    const row = await prisma.calibration.create({ data: calibration.toPersistence() });
    return Calibration.fromPersistence(row);
  }

  async update(
    id: number,
    userId: string,
    calibration: Calibration,
  ): Promise<Calibration | undefined> {
    const exists = await prisma.calibration.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.calibration.update({
      where: { id },
      data: calibration.toPersistence(),
    });
    return Calibration.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.calibration.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.calibration.delete({ where: { id } });
    return true;
  }
}
