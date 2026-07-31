import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { type FilamentCreateData, type FilamentUpdateData } from '@entities/filament.entity';
import { HttpException } from '@exceptions/httpException';
import { FilamentsService } from '@services/filaments.service';
import { asyncHandler } from '@utils/asyncHandler';

function parseFilamentId(rawId: unknown): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, 'Invalid filament id');
  }
  return id;
}

@injectable()
export class FilamentsController {
  constructor(@inject(FilamentsService) private readonly filamentsService: FilamentsService) {}

  getFilaments = asyncHandler(async (req: Request, res: Response) => {
    const filaments = await this.filamentsService.getAllFilaments();
    res.json({ data: filaments.map((filament) => filament.toResponse()), message: 'findAll' });
  });

  getFilamentById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseFilamentId(req.params.id);
    const filament = await this.filamentsService.getFilamentById(id);

    res.json({ data: filament.toResponse(), message: 'findById' });
  });

  createFilament = asyncHandler(async (req: Request, res: Response) => {
    const filamentData: FilamentCreateData = req.body;
    const filament = await this.filamentsService.createFilament(filamentData);

    res.status(201).json({ data: filament.toResponse(), message: 'create' });
  });

  updateFilament = asyncHandler(async (req: Request, res: Response) => {
    const id = parseFilamentId(req.params.id);
    const updateData: FilamentUpdateData = req.body;
    const filament = await this.filamentsService.updateFilament(id, updateData);

    res.json({ data: filament.toResponse(), message: 'update' });
  });

  deleteFilament = asyncHandler(async (req: Request, res: Response) => {
    const id = parseFilamentId(req.params.id);
    await this.filamentsService.deleteFilament(id);

    res.status(204).json({ message: 'delete' });
  });
}
