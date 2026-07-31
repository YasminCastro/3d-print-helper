import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { type BrandCreateData, type BrandUpdateData } from '@entities/brand.entity';
import { HttpException } from '@exceptions/httpException';
import { BrandsService } from '@services/brands.service';
import { asyncHandler } from '@utils/asyncHandler';

function parseBrandId(rawId: unknown): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, 'Invalid brand id');
  }
  return id;
}

@injectable()
export class BrandsController {
  constructor(@inject(BrandsService) private readonly brandsService: BrandsService) {}

  getBrands = asyncHandler(async (req: Request, res: Response) => {
    const brands = await this.brandsService.getAllBrands();
    res.json({ data: brands.map((brand) => brand.toResponse()), message: 'findAll' });
  });

  getBrandById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseBrandId(req.params.id);
    const brand = await this.brandsService.getBrandById(id);

    res.json({ data: brand.toResponse(), message: 'findById' });
  });

  createBrand = asyncHandler(async (req: Request, res: Response) => {
    const brandData: BrandCreateData = req.body;
    const brand = await this.brandsService.createBrand(brandData);

    res.status(201).json({ data: brand.toResponse(), message: 'create' });
  });

  updateBrand = asyncHandler(async (req: Request, res: Response) => {
    const id = parseBrandId(req.params.id);
    const updateData: BrandUpdateData = req.body;
    const brand = await this.brandsService.updateBrand(id, updateData);

    res.json({ data: brand.toResponse(), message: 'update' });
  });

  deleteBrand = asyncHandler(async (req: Request, res: Response) => {
    const id = parseBrandId(req.params.id);
    await this.brandsService.deleteBrand(id);

    res.status(204).json({ message: 'delete' });
  });
}
