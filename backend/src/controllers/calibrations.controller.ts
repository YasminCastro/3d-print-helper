import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  type CalibrationCreateData,
  type CalibrationUpdateData,
} from '@entities/calibration.entity';
import { HttpException } from '@exceptions/httpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { CalibrationsService } from '@services/calibrations.service';
import { asyncHandler } from '@utils/asyncHandler';

function parseCalibrationId(rawId: unknown): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, 'Invalid calibration id');
  }
  return id;
}

@injectable()
export class CalibrationsController {
  constructor(
    @inject(CalibrationsService) private readonly calibrationsService: CalibrationsService,
  ) {}

  getCalibrations = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const calibrations = await this.calibrationsService.getAllCalibrations(user.id);
    res.json({
      data: calibrations.map((calibration) => calibration.toResponse()),
      message: 'findAll',
    });
  });

  getCalibrationById = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseCalibrationId(req.params.id);
    const calibration = await this.calibrationsService.getCalibrationById(id, user.id);

    res.json({ data: calibration.toResponse(), message: 'findById' });
  });

  createCalibration = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const calibrationData: CalibrationCreateData = { ...req.body, userId: user.id };
    const calibration = await this.calibrationsService.createCalibration(calibrationData);

    res.status(201).json({ data: calibration.toResponse(), message: 'create' });
  });

  updateCalibration = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseCalibrationId(req.params.id);
    const updateData: CalibrationUpdateData = req.body;
    const calibration = await this.calibrationsService.updateCalibration(
      id,
      user.id,
      updateData,
    );

    res.json({ data: calibration.toResponse(), message: 'update' });
  });

  deleteCalibration = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseCalibrationId(req.params.id);
    await this.calibrationsService.deleteCalibration(id, user.id);

    res.status(204).json({ message: 'delete' });
  });
}
