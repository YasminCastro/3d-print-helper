import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { BrandsController } from '@controllers/brands.controller';
import { createBrandSchema, updateBrandSchema } from '@dtos/brands.dto';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class BrandsRoute implements Routes {
  public router: Router = Router();
  public path = '/brands';

  constructor(@inject(BrandsController) private brandsController: BrandsController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.brandsController.getBrands);
    this.router.get(`${this.path}/:id`, this.brandsController.getBrandById);
    this.router.post(
      this.path,
      ValidationMiddleware(createBrandSchema),
      this.brandsController.createBrand,
    );
    this.router.put(
      `${this.path}/:id`,
      ValidationMiddleware(updateBrandSchema),
      this.brandsController.updateBrand,
    );
    this.router.delete(`${this.path}/:id`, this.brandsController.deleteBrand);
  }
}
