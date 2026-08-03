import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { JournalController } from '@controllers/journal.controller';
import {
  addJournalPhotoSchema,
  createJournalEntrySchema,
  updateJournalEntrySchema,
} from '@dtos/journal.dto';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@middlewares/auth.middleware';
import { ValidationMiddleware } from '@middlewares/validation.middleware';

@injectable()
export class JournalRoute implements Routes {
  public router: Router = Router();
  public path = '/journal-entries';

  constructor(@inject(JournalController) private journalController: JournalController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, AuthMiddleware, this.journalController.getEntries);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.journalController.getEntryById);
    this.router.post(
      this.path,
      AuthMiddleware,
      ValidationMiddleware(createJournalEntrySchema),
      this.journalController.createEntry,
    );
    this.router.put(
      `${this.path}/:id`,
      AuthMiddleware,
      ValidationMiddleware(updateJournalEntrySchema),
      this.journalController.updateEntry,
    );
    this.router.delete(`${this.path}/:id`, AuthMiddleware, this.journalController.deleteEntry);

    this.router.post(
      `${this.path}/:id/photos`,
      AuthMiddleware,
      ValidationMiddleware(addJournalPhotoSchema),
      this.journalController.addPhoto,
    );
    this.router.get(
      `${this.path}/photos/:photoId`,
      AuthMiddleware,
      this.journalController.getPhoto,
    );
    this.router.delete(
      `${this.path}/photos/:photoId`,
      AuthMiddleware,
      this.journalController.deletePhoto,
    );
  }
}
