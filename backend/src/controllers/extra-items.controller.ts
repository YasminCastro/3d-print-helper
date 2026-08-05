import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { type ExtraItemCreateData, type ExtraItemUpdateData } from '@entities/extra-item.entity';
import { HttpException } from '@exceptions/httpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { ExtraItemsService } from '@services/extra-items.service';
import { asyncHandler } from '@utils/asyncHandler';

function parseExtraItemId(rawId: unknown): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, 'Invalid extra item id');
  }
  return id;
}

@injectable()
export class ExtraItemsController {
  constructor(@inject(ExtraItemsService) private readonly extraItemsService: ExtraItemsService) {}

  getExtraItems = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const extraItems = await this.extraItemsService.getAllExtraItems(user.id);
    res.json({ data: extraItems.map((extraItem) => extraItem.toResponse()), message: 'findAll' });
  });

  getExtraItemById = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseExtraItemId(req.params.id);
    const extraItem = await this.extraItemsService.getExtraItemById(id, user.id);

    res.json({ data: extraItem.toResponse(), message: 'findById' });
  });

  createExtraItem = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const extraItemData: ExtraItemCreateData = { ...req.body, userId: user.id };
    const extraItem = await this.extraItemsService.createExtraItem(extraItemData);

    res.status(201).json({ data: extraItem.toResponse(), message: 'create' });
  });

  updateExtraItem = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseExtraItemId(req.params.id);
    const updateData: ExtraItemUpdateData = req.body;
    const extraItem = await this.extraItemsService.updateExtraItem(id, user.id, updateData);

    res.json({ data: extraItem.toResponse(), message: 'update' });
  });

  deleteExtraItem = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseExtraItemId(req.params.id);
    await this.extraItemsService.deleteExtraItem(id, user.id);

    res.status(204).json({ message: 'delete' });
  });
}
