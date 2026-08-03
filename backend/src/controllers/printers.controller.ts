import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { type PrinterCreateData, type PrinterUpdateData } from '@entities/printer.entity';
import { HttpException } from '@exceptions/httpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { PrintersService } from '@services/printers.service';
import { asyncHandler } from '@utils/asyncHandler';

function parsePrinterId(rawId: unknown): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, 'Invalid printer id');
  }
  return id;
}

@injectable()
export class PrintersController {
  constructor(@inject(PrintersService) private readonly printersService: PrintersService) {}

  getPrinters = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const printers = await this.printersService.getAllPrinters(user.id);
    res.json({ data: printers.map((printer) => printer.toResponse()), message: 'findAll' });
  });

  getPrinterById = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parsePrinterId(req.params.id);
    const printer = await this.printersService.getPrinterById(id, user.id);

    res.json({ data: printer.toResponse(), message: 'findById' });
  });

  createPrinter = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const printerData: PrinterCreateData = { ...req.body, userId: user.id };
    const printer = await this.printersService.createPrinter(printerData);

    res.status(201).json({ data: printer.toResponse(), message: 'create' });
  });

  updatePrinter = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parsePrinterId(req.params.id);
    const updateData: PrinterUpdateData = req.body;
    const printer = await this.printersService.updatePrinter(id, user.id, updateData);

    res.json({ data: printer.toResponse(), message: 'update' });
  });

  deletePrinter = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parsePrinterId(req.params.id);
    await this.printersService.deletePrinter(id, user.id);

    res.status(204).json({ message: 'delete' });
  });
}
