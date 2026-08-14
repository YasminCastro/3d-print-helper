import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { PrintQueueController } from '@controllers/print-queue.controller';
import {
  createPrintQueueItemSchema,
  markPrintQueueItemAsPrintedSchema,
  updatePrintQueueItemSchema,
} from '@dtos/print-queue.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class PrintQueueRoute implements Routes {
  public router: Router = Router();
  public path = '/print-queue';

  constructor(@inject(PrintQueueController) private printQueueController: PrintQueueController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, AuthMiddleware, this.printQueueController.getQueueItems);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.printQueueController.getQueueItemById);
    this.router.post(
      this.path,
      AuthMiddleware,
      ValidationMiddleware(createPrintQueueItemSchema),
      this.printQueueController.createQueueItem,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updatePrintQueueItemSchema),
      this.printQueueController.updateQueueItem,
    );
    this.router.delete(
      `${this.path}/:id`,
      AuthMiddleware,
      this.printQueueController.deleteQueueItem,
    );

    this.router.post(
      `${this.path}/:id/mark-printed`,
      AuthMiddleware,
      ValidationMiddleware(markPrintQueueItemAsPrintedSchema),
      this.printQueueController.markPrinted,
    );
  }
}
