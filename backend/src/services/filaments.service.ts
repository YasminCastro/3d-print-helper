import { injectable, inject } from 'tsyringe';
import {
  Filament,
  type FilamentCreateData,
  type FilamentUpdateData,
} from '@entities/filament.entity';
import { HttpException } from '@exceptions/httpException';
import { FilamentsRepository } from '@repositories/filaments.repository';
import type { IFilamentsRepository } from '@repositories/filaments.repository';

@injectable()
export class FilamentsService {
  constructor(@inject(FilamentsRepository) private filamentsRepository: IFilamentsRepository) {}

  async getAllFilaments(userId: string): Promise<Filament[]> {
    return this.filamentsRepository.findAll(userId);
  }

  async getFilamentById(id: number, userId: string): Promise<Filament> {
    const filament = await this.filamentsRepository.findById(id, userId);
    if (!filament) throw new HttpException(404, 'Filament not found');
    return filament;
  }

  async createFilament(data: FilamentCreateData): Promise<Filament> {
    const filament = Filament.create(data);
    return this.filamentsRepository.save(filament);
  }

  async updateFilament(id: number, userId: string, data: FilamentUpdateData): Promise<Filament> {
    const existing = await this.filamentsRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Filament not found');

    existing.update(data);

    const updated = await this.filamentsRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Filament not found');
    return updated;
  }

  async deleteFilament(id: number, userId: string): Promise<void> {
    const deleted = await this.filamentsRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Filament not found');
  }
}
