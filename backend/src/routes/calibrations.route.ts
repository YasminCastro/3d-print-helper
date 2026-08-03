import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { CalibrationsController } from '@controllers/calibrations.controller';
import { createCalibrationSchema, updateCalibrationSchema } from '@dtos/calibrations.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class CalibrationsRoute implements Routes {
  public router: Router = Router();
  public path = '/calibrations';

  constructor(
    @inject(CalibrationsController) private calibrationsController: CalibrationsController,
  ) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, AuthMiddleware, this.calibrationsController.getCalibrations);
    this.router.get(
      `${this.path}/:id`,
      AuthMiddleware,
      this.calibrationsController.getCalibrationById,
    );
    this.router.post(
      this.path,
      AuthMiddleware,
      ValidationMiddleware(createCalibrationSchema),
      this.calibrationsController.createCalibration,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updateCalibrationSchema),
      this.calibrationsController.updateCalibration,
    );
    this.router.delete(
      `${this.path}/:id`,
      AuthMiddleware,
      this.calibrationsController.deleteCalibration,
    );
  }
}
