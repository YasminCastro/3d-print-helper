import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  type JournalEntryCreateData,
  type JournalEntryUpdateData,
} from '@entities/journal-entry.entity';
import { HttpException } from '@exceptions/httpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { JournalService } from '@services/journal.service';
import { asyncHandler } from '@utils/asyncHandler';

function parseId(rawId: unknown, label: string): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, `Invalid ${label} id`);
  }
  return id;
}

@injectable()
export class JournalController {
  constructor(@inject(JournalService) private readonly journalService: JournalService) {}

  getEntries = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const entries = await this.journalService.getAllEntries(user.id);
    res.json({ data: entries.map((entry) => entry.toResponse()), message: 'findAll' });
  });

  getEntryById = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'journal entry');
    const entry = await this.journalService.getEntryById(id, user.id);

    res.json({ data: entry.toResponse(), message: 'findById' });
  });

  createEntry = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const entryData: JournalEntryCreateData = { ...req.body, userId: user.id };
    const entry = await this.journalService.createEntry(entryData);

    res.status(201).json({ data: entry.toResponse(), message: 'create' });
  });

  updateEntry = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'journal entry');
    const updateData: JournalEntryUpdateData = req.body;
    const entry = await this.journalService.updateEntry(id, user.id, updateData);

    res.json({ data: entry.toResponse(), message: 'update' });
  });

  deleteEntry = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'journal entry');
    await this.journalService.deleteEntry(id, user.id);

    res.status(204).json({ message: 'delete' });
  });

  addPhoto = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const entryId = parseId(req.params.id, 'journal entry');
    const { filename, mimeType, data } = req.body as {
      filename: string;
      mimeType: string;
      data: string;
    };

    let buffer: Buffer;
    try {
      buffer = Buffer.from(data, 'base64');
    } catch {
      throw new HttpException(400, 'Invalid photo data');
    }
    if (buffer.length === 0) throw new HttpException(400, 'Invalid photo data');

    const entry = await this.journalService.addPhoto(entryId, user.id, {
      filename,
      mimeType,
      data: buffer,
    });

    res.status(201).json({ data: entry.toResponse(), message: 'addPhoto' });
  });

  deletePhoto = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const photoId = parseId(req.params.photoId, 'journal photo');
    await this.journalService.deletePhoto(photoId, user.id);

    res.status(204).json({ message: 'deletePhoto' });
  });

  getPhoto = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const photoId = parseId(req.params.photoId, 'journal photo');
    const photo = await this.journalService.getPhotoBinary(photoId, user.id);

    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${photo.filename}"`);
    res.send(photo.data);
  });
}
