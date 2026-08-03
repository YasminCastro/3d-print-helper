import { injectable, inject } from 'tsyringe';
import {
  JournalEntry,
  type JournalEntryCreateData,
  type JournalEntryUpdateData,
} from '@entities/journal-entry.entity';
import { HttpException } from '@exceptions/httpException';
import { JournalRepository } from '@repositories/journal.repository';
import type { IJournalRepository, JournalPhotoBinary } from '@repositories/journal.repository';

@injectable()
export class JournalService {
  constructor(@inject(JournalRepository) private journalRepository: IJournalRepository) {}

  async getAllEntries(userId: string): Promise<JournalEntry[]> {
    return this.journalRepository.findAll(userId);
  }

  async getEntryById(id: number, userId: string): Promise<JournalEntry> {
    const entry = await this.journalRepository.findById(id, userId);
    if (!entry) throw new HttpException(404, 'Journal entry not found');
    return entry;
  }

  async createEntry(data: JournalEntryCreateData): Promise<JournalEntry> {
    const entry = JournalEntry.create(data);
    return this.journalRepository.save(entry);
  }

  async updateEntry(
    id: number,
    userId: string,
    data: JournalEntryUpdateData,
  ): Promise<JournalEntry> {
    const existing = await this.journalRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Journal entry not found');

    existing.update(data);

    const updated = await this.journalRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Journal entry not found');
    return updated;
  }

  async deleteEntry(id: number, userId: string): Promise<void> {
    const deleted = await this.journalRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Journal entry not found');
  }

  async addPhoto(
    entryId: number,
    userId: string,
    photo: { filename: string; mimeType: string; data: Buffer },
  ): Promise<JournalEntry> {
    const entry = await this.journalRepository.addPhoto(entryId, userId, photo);
    if (!entry) throw new HttpException(404, 'Journal entry not found');
    return entry;
  }

  async deletePhoto(photoId: number, userId: string): Promise<void> {
    const deleted = await this.journalRepository.deletePhoto(photoId, userId);
    if (!deleted) throw new HttpException(404, 'Journal photo not found');
  }

  async getPhotoBinary(photoId: number, userId: string): Promise<JournalPhotoBinary> {
    const photo = await this.journalRepository.getPhotoBinary(photoId, userId);
    if (!photo) throw new HttpException(404, 'Journal photo not found');
    return photo;
  }
}
