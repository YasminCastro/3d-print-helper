import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { type PrintCreateData, type PrintUpdateData } from '@entities/print.entity';
import {
  type PrintCategoryCreateData,
  type PrintCategoryUpdateData,
} from '@entities/print-category.entity';
import { HttpException } from '@exceptions/httpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { PrintsService } from '@services/prints.service';
import { asyncHandler } from '@utils/asyncHandler';

function parseId(rawId: unknown, label: string): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, `Invalid ${label} id`);
  }
  return id;
}

@injectable()
export class PrintsController {
  constructor(@inject(PrintsService) private readonly printsService: PrintsService) {}

  getCategories = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const categories = await this.printsService.getAllCategories(user.id);
    res.json({ data: categories.map((category) => category.toResponse()), message: 'findAll' });
  });

  createCategory = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const categoryData: PrintCategoryCreateData = { ...req.body, userId: user.id };
    const category = await this.printsService.createCategory(categoryData);

    res.status(201).json({ data: category.toResponse(), message: 'create' });
  });

  updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print category');
    const updateData: PrintCategoryUpdateData = req.body;
    const category = await this.printsService.updateCategory(id, user.id, updateData);

    res.json({ data: category.toResponse(), message: 'update' });
  });

  deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print category');
    await this.printsService.deleteCategory(id, user.id);

    res.status(204).json({ message: 'delete' });
  });

  getPrints = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const prints = await this.printsService.getAllPrints(user.id);
    res.json({ data: prints.map((print) => print.toResponse()), message: 'findAll' });
  });

  getPrintById = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print');
    const print = await this.printsService.getPrintById(id, user.id);

    res.json({ data: print.toResponse(), message: 'findById' });
  });

  createPrint = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const printData: PrintCreateData = { ...req.body, userId: user.id };
    const print = await this.printsService.createPrint(printData);

    res.status(201).json({ data: print.toResponse(), message: 'create' });
  });

  updatePrint = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print');
    const updateData: PrintUpdateData = req.body;
    const print = await this.printsService.updatePrint(id, user.id, updateData);

    res.json({ data: print.toResponse(), message: 'update' });
  });

  deletePrint = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print');
    await this.printsService.deletePrint(id, user.id);

    res.status(204).json({ message: 'delete' });
  });

  setPhoto = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print');
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

    const print = await this.printsService.setPhoto(id, user.id, { filename, mimeType, data: buffer });

    res.status(201).json({ data: print.toResponse(), message: 'setPhoto' });
  });

  removePhoto = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print');
    const print = await this.printsService.removePhoto(id, user.id);

    res.json({ data: print.toResponse(), message: 'removePhoto' });
  });

  getPhoto = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print');
    const photo = await this.printsService.getPhotoBinary(id, user.id);

    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${photo.filename}"`);
    res.send(photo.data);
  });
}
