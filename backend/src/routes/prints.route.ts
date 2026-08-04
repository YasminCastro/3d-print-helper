import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { PrintsController } from '@controllers/prints.controller';
import {
  addPrintPhotoSchema,
  createPrintCategorySchema,
  createPrintSchema,
  updatePrintCategorySchema,
  updatePrintSchema,
} from '@dtos/prints.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class PrintsRoute implements Routes {
  public router: Router = Router();
  public path = '/prints';
  public categoriesPath = '/print-categories';

  constructor(@inject(PrintsController) private printsController: PrintsController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.categoriesPath, AuthMiddleware, this.printsController.getCategories);
    this.router.post(
      this.categoriesPath,
      AuthMiddleware,
      ValidationMiddleware(createPrintCategorySchema),
      this.printsController.createCategory,
    );
    this.router.put(
      `${this.categoriesPath}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updatePrintCategorySchema),
      this.printsController.updateCategory,
    );
    this.router.delete(
      `${this.categoriesPath}/:id`,
      AuthMiddleware,
      this.printsController.deleteCategory,
    );

    this.router.get(this.path, AuthMiddleware, this.printsController.getPrints);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.printsController.getPrintById);
    this.router.post(
      this.path,
      AuthMiddleware,
      ValidationMiddleware(createPrintSchema),
      this.printsController.createPrint,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updatePrintSchema),
      this.printsController.updatePrint,
    );
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.printsController.deletePrint);

    this.router.put(
      `${this.path}/:id/photo`,
      AuthMiddleware,
      ValidationMiddleware(addPrintPhotoSchema),
      this.printsController.setPhoto,
    );
    this.router.get(`${this.path}/:id/photo`, AuthMiddleware, this.printsController.getPhoto);
    this.router.delete(`${this.path}/:id/photo`, AuthMiddleware, this.printsController.removePhoto);
  }
}
