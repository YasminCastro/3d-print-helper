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

  async getAllFilaments(): Promise<Filament[]> {
    return this.filamentsRepository.findAll();
  }

  async getFilamentById(id: number): Promise<Filament> {
    const filament = await this.filamentsRepository.findById(id);
    if (!filament) throw new HttpException(404, 'Filament not found');
    return filament;
  }

  async createFilament(data: FilamentCreateData): Promise<Filament> {
    const filament = Filament.create(data);
    return this.filamentsRepository.save(filament);
  }

  async updateFilament(id: number, data: FilamentUpdateData): Promise<Filament> {
    const existing = await this.filamentsRepository.findById(id);
    if (!existing) throw new HttpException(404, 'Filament not found');

    existing.update(data);

    const updated = await this.filamentsRepository.update(id, existing);
    if (!updated) throw new HttpException(404, 'Filament not found');
    return updated;
  }

  async deleteFilament(id: number): Promise<void> {
    const deleted = await this.filamentsRepository.delete(id);
    if (!deleted) throw new HttpException(404, 'Filament not found');
  }
}
