import { injectable, inject } from 'tsyringe';
import { FilamentBrand, type BrandCreateData, type BrandUpdateData } from '@entities/brand.entity';
import { HttpException } from '@exceptions/httpException';
import { BrandsRepository } from '@repositories/brands.repository';
import type { IBrandsRepository } from '@repositories/brands.repository';

@injectable()
export class BrandsService {
  constructor(@inject(BrandsRepository) private brandsRepository: IBrandsRepository) {}

  async getAllBrands(userId: string): Promise<FilamentBrand[]> {
    return this.brandsRepository.findAll(userId);
  }

  async getBrandById(id: number, userId: string): Promise<FilamentBrand> {
    const brand = await this.brandsRepository.findById(id, userId);
    if (!brand) throw new HttpException(404, 'Brand not found');
    return brand;
  }

  async createBrand(data: BrandCreateData): Promise<FilamentBrand> {
    const brand = FilamentBrand.create(data);
    return this.brandsRepository.save(brand);
  }

  async updateBrand(id: number, userId: string, data: BrandUpdateData): Promise<FilamentBrand> {
    const existing = await this.brandsRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Brand not found');

    existing.update(data);

    const updated = await this.brandsRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Brand not found');
    return updated;
  }

  async deleteBrand(id: number, userId: string): Promise<void> {
    const deleted = await this.brandsRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Brand not found');
  }
}
