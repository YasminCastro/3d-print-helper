import { injectable, inject } from 'tsyringe';
import {
  Calibration,
  type CalibrationCreateData,
  type CalibrationUpdateData,
} from '@entities/calibration.entity';
import { HttpException } from '@exceptions/httpException';
import { CalibrationsRepository } from '@repositories/calibrations.repository';
import type { ICalibrationsRepository } from '@repositories/calibrations.repository';

@injectable()
export class CalibrationsService {
  constructor(
    @inject(CalibrationsRepository) private calibrationsRepository: ICalibrationsRepository,
  ) {}

  async getAllCalibrations(userId: string): Promise<Calibration[]> {
    return this.calibrationsRepository.findAll(userId);
  }

  async getCalibrationById(id: number, userId: string): Promise<Calibration> {
    const calibration = await this.calibrationsRepository.findById(id, userId);
    if (!calibration) throw new HttpException(404, 'Calibration not found');
    return calibration;
  }

  async createCalibration(data: CalibrationCreateData): Promise<Calibration> {
    const calibration = Calibration.create(data);
    return this.calibrationsRepository.save(calibration);
  }

  async updateCalibration(
    id: number,
    userId: string,
    data: CalibrationUpdateData,
  ): Promise<Calibration> {
    const existing = await this.calibrationsRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Calibration not found');

    existing.update(data);

    const updated = await this.calibrationsRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Calibration not found');
    return updated;
  }

  async deleteCalibration(id: number, userId: string): Promise<void> {
    const deleted = await this.calibrationsRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Calibration not found');
  }
}
