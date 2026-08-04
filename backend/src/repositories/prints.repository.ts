import { singleton } from 'tsyringe';
import { Print } from '@entities/print.entity';
import { prisma } from '@config/prisma';

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
  profitPercent: true,
  filamentCost: true,
  printCost: true,
  saleValue: true,
  saleValueWorstCase: true,
  createdAt: true,
  userId: true,
  filaments: { select: { id: true, position: true, filamentId: true, grams: true } },
} as const;

export interface PrintPhotoBinary {
  filename: string;
  mimeType: string;
  data: Buffer;
}

export interface IPrintsRepository {
  findAll(userId: string): Promise<Print[]>;
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
  async findAll(userId: string): Promise<Print[]> {
    const rows = await prisma.print.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
      select: printSelect,
    });
    return rows.map((row) => Print.fromPersistence(row));
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
