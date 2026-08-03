import { singleton } from 'tsyringe';
import { JournalEntry } from '@entities/journal-entry.entity';
import { prisma } from '@config/prisma';

const journalEntryInclude = {
  attempts: true,
  photos: { select: { id: true, filename: true, mimeType: true, createdAt: true } },
} as const;

export interface JournalPhotoBinary {
  filename: string;
  mimeType: string;
  data: Buffer;
}

export interface IJournalRepository {
  findAll(userId: string): Promise<JournalEntry[]>;
  findById(id: number, userId: string): Promise<JournalEntry | undefined>;
  save(entry: JournalEntry): Promise<JournalEntry>;
  update(id: number, userId: string, entry: JournalEntry): Promise<JournalEntry | undefined>;
  delete(id: number, userId: string): Promise<boolean>;
  addPhoto(
    entryId: number,
    userId: string,
    photo: { filename: string; mimeType: string; data: Buffer },
  ): Promise<JournalEntry | undefined>;
  deletePhoto(photoId: number, userId: string): Promise<boolean>;
  getPhotoBinary(photoId: number, userId: string): Promise<JournalPhotoBinary | undefined>;
}

@singleton()
export class JournalRepository implements IJournalRepository {
  async findAll(userId: string): Promise<JournalEntry[]> {
    const rows = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
      include: journalEntryInclude,
    });
    return rows.map((row) => JournalEntry.fromPersistence(row));
  }

  async findById(id: number, userId: string): Promise<JournalEntry | undefined> {
    const row = await prisma.journalEntry.findFirst({
      where: { id, userId },
      include: journalEntryInclude,
    });
    return row ? JournalEntry.fromPersistence(row) : undefined;
  }

  async save(entry: JournalEntry): Promise<JournalEntry> {
    const row = await prisma.journalEntry.create({
      data: {
        ...entry.toPersistence(),
        attempts: { create: entry.attempts.map(({ position, attempt, worked }) => ({ position, attempt, worked })) },
      },
      include: journalEntryInclude,
    });
    return JournalEntry.fromPersistence(row);
  }

  async update(id: number, userId: string, entry: JournalEntry): Promise<JournalEntry | undefined> {
    const exists = await prisma.journalEntry.findFirst({ where: { id, userId } });
    if (!exists) return undefined;

    const row = await prisma.$transaction(async (tx) => {
      await tx.journalAttempt.deleteMany({ where: { entryId: id } });

      return tx.journalEntry.update({
        where: { id },
        data: {
          ...entry.toPersistence(),
          attempts: {
            create: entry.attempts.map(({ position, attempt, worked }) => ({
              position,
              attempt,
              worked,
            })),
          },
        },
        include: journalEntryInclude,
      });
    });

    return JournalEntry.fromPersistence(row);
  }

  async delete(id: number, userId: string): Promise<boolean> {
    const exists = await prisma.journalEntry.findFirst({ where: { id, userId } });
    if (!exists) return false;

    await prisma.journalEntry.delete({ where: { id } });
    return true;
  }

  async addPhoto(
    entryId: number,
    userId: string,
    photo: { filename: string; mimeType: string; data: Buffer },
  ): Promise<JournalEntry | undefined> {
    const exists = await prisma.journalEntry.findFirst({ where: { id: entryId, userId } });
    if (!exists) return undefined;

    await prisma.journalPhoto.create({
      data: {
        entryId,
        filename: photo.filename,
        mimeType: photo.mimeType,
        data: new Uint8Array(photo.data),
      },
    });

    const row = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId },
      include: journalEntryInclude,
    });
    return row ? JournalEntry.fromPersistence(row) : undefined;
  }

  async deletePhoto(photoId: number, userId: string): Promise<boolean> {
    const photo = await prisma.journalPhoto.findFirst({
      where: { id: photoId, entry: { userId } },
    });
    if (!photo) return false;

    await prisma.journalPhoto.delete({ where: { id: photoId } });
    return true;
  }

  async getPhotoBinary(photoId: number, userId: string): Promise<JournalPhotoBinary | undefined> {
    const photo = await prisma.journalPhoto.findFirst({
      where: { id: photoId, entry: { userId } },
      select: { filename: true, mimeType: true, data: true },
    });
    return photo
      ? { filename: photo.filename, mimeType: photo.mimeType, data: Buffer.from(photo.data) }
      : undefined;
  }
}
