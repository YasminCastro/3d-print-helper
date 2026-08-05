import { injectable, inject } from 'tsyringe';
import {
  ExtraItem,
  type ExtraItemCreateData,
  type ExtraItemUpdateData,
} from '@entities/extra-item.entity';
import { HttpException } from '@exceptions/httpException';
import { ExtraItemsRepository } from '@repositories/extra-items.repository';
import type { IExtraItemsRepository } from '@repositories/extra-items.repository';

@injectable()
export class ExtraItemsService {
  constructor(@inject(ExtraItemsRepository) private extraItemsRepository: IExtraItemsRepository) {}

  async getAllExtraItems(userId: string): Promise<ExtraItem[]> {
    return this.extraItemsRepository.findAll(userId);
  }

  async getExtraItemById(id: number, userId: string): Promise<ExtraItem> {
    const extraItem = await this.extraItemsRepository.findById(id, userId);
    if (!extraItem) throw new HttpException(404, 'Extra item not found');
    return extraItem;
  }

  async createExtraItem(data: ExtraItemCreateData): Promise<ExtraItem> {
    const extraItem = ExtraItem.create(data);
    return this.extraItemsRepository.save(extraItem);
  }

  async updateExtraItem(id: number, userId: string, data: ExtraItemUpdateData): Promise<ExtraItem> {
    const existing = await this.extraItemsRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Extra item not found');

    existing.update(data);

    const updated = await this.extraItemsRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Extra item not found');
    return updated;
  }

  async deleteExtraItem(id: number, userId: string): Promise<void> {
    const deleted = await this.extraItemsRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Extra item not found');
  }
}
