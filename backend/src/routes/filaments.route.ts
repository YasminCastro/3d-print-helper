import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { FilamentsController } from '@controllers/filaments.controller';
import { createFilamentSchema, updateFilamentSchema } from '@dtos/filaments.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class FilamentsRoute implements Routes {
  public router: Router = Router();
  public path = '/filaments';

  constructor(@inject(FilamentsController) private filamentsController: FilamentsController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, AuthMiddleware, this.filamentsController.getFilaments);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.filamentsController.getFilamentById);
    this.router.post(
      this.path,
      AuthMiddleware,
      ValidationMiddleware(createFilamentSchema),
      this.filamentsController.createFilament,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updateFilamentSchema),
      this.filamentsController.updateFilament,
    );
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.filamentsController.deleteFilament);
  }
}
