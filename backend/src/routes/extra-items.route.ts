import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { ExtraItemsController } from '@controllers/extra-items.controller';
import { createExtraItemSchema, updateExtraItemSchema } from '@dtos/extra-items.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class ExtraItemsRoute implements Routes {
  public router: Router = Router();
  public path = '/extra-items';

  constructor(@inject(ExtraItemsController) private extraItemsController: ExtraItemsController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, AuthMiddleware, this.extraItemsController.getExtraItems);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.extraItemsController.getExtraItemById);
    this.router.post(
      this.path,
      AuthMiddleware,
      ValidationMiddleware(createExtraItemSchema),
      this.extraItemsController.createExtraItem,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updateExtraItemSchema),
      this.extraItemsController.updateExtraItem,
    );
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.extraItemsController.deleteExtraItem);
  }
}
