import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { PrintersController } from '@controllers/printers.controller';
import { createPrinterSchema, updatePrinterSchema } from '@dtos/printers.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class PrintersRoute implements Routes {
  public router: Router = Router();
  public path = '/printers';

  constructor(@inject(PrintersController) private printersController: PrintersController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, AuthMiddleware, this.printersController.getPrinters);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.printersController.getPrinterById);
    this.router.post(
      this.path,
      AuthMiddleware,
      ValidationMiddleware(createPrinterSchema),
      this.printersController.createPrinter,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updatePrinterSchema),
      this.printersController.updatePrinter,
    );
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.printersController.deletePrinter);
  }
}
