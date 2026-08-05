import { injectable, inject } from 'tsyringe';
import { Print, type PrintCreateData, type PrintUpdateData } from '@entities/print.entity';
import {
  PrintCategory,
  type PrintCategoryCreateData,
  type PrintCategoryUpdateData,
} from '@entities/print-category.entity';
import { HttpException } from '@exceptions/httpException';
import { ExtraItemsRepository } from '@repositories/extra-items.repository';
import type { IExtraItemsRepository } from '@repositories/extra-items.repository';
import { FilamentsRepository } from '@repositories/filaments.repository';
import type { IFilamentsRepository } from '@repositories/filaments.repository';
import { PrintCategoriesRepository } from '@repositories/print-categories.repository';
import type { IPrintCategoriesRepository } from '@repositories/print-categories.repository';
import { PrintersRepository } from '@repositories/printers.repository';
import type { IPrintersRepository } from '@repositories/printers.repository';
import { PrintsRepository } from '@repositories/prints.repository';
import type { IPrintsRepository, PrintPhotoBinary } from '@repositories/prints.repository';
import { calculatePrintCosts, computeMaterialMaxPrices } from '@utils/printCalculations';

@injectable()
export class PrintsService {
  constructor(
    @inject(PrintsRepository) private printsRepository: IPrintsRepository,
    @inject(PrintCategoriesRepository) private printCategoriesRepository: IPrintCategoriesRepository,
    @inject(PrintersRepository) private printersRepository: IPrintersRepository,
    @inject(FilamentsRepository) private filamentsRepository: IFilamentsRepository,
    @inject(ExtraItemsRepository) private extraItemsRepository: IExtraItemsRepository,
  ) {}

  async getAllCategories(userId: string): Promise<PrintCategory[]> {
    return this.printCategoriesRepository.findAll(userId);
  }

  async createCategory(data: PrintCategoryCreateData): Promise<PrintCategory> {
    const existing = await this.printCategoriesRepository.findByName(data.name, data.userId);
    if (existing) return existing;

    const category = PrintCategory.create(data);
    return this.printCategoriesRepository.save(category);
  }

  async updateCategory(
    id: number,
    userId: string,
    data: PrintCategoryUpdateData,
  ): Promise<PrintCategory> {
    const existing = await this.printCategoriesRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Print category not found');

    existing.update(data);

    const updated = await this.printCategoriesRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Print category not found');
    return updated;
  }

  async deleteCategory(id: number, userId: string): Promise<void> {
    const deleted = await this.printCategoriesRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Print category not found');
  }

  async getAllPrints(userId: string): Promise<Print[]> {
    return this.printsRepository.findAll(userId);
  }

  async getPrintById(id: number, userId: string): Promise<Print> {
    const print = await this.printsRepository.findById(id, userId);
    if (!print) throw new HttpException(404, 'Print not found');
    return print;
  }

  async createPrint(data: PrintCreateData): Promise<Print> {
    const print = Print.create(data);
    await this.applyCalculations(print);
    return this.printsRepository.save(print);
  }

  async updatePrint(id: number, userId: string, data: PrintUpdateData): Promise<Print> {
    const existing = await this.printsRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Print not found');

    existing.update(data);
    await this.applyCalculations(existing);

    const updated = await this.printsRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Print not found');
    return updated;
  }

  async deletePrint(id: number, userId: string): Promise<void> {
    const deleted = await this.printsRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Print not found');
  }

  async setPhoto(
    id: number,
    userId: string,
    photo: { filename: string; mimeType: string; data: Buffer },
  ): Promise<Print> {
    const print = await this.printsRepository.setPhoto(id, userId, photo);
    if (!print) throw new HttpException(404, 'Print not found');
    return print;
  }

  async removePhoto(id: number, userId: string): Promise<Print> {
    const print = await this.printsRepository.removePhoto(id, userId);
    if (!print) throw new HttpException(404, 'Print not found');
    return print;
  }

  async getPhotoBinary(id: number, userId: string): Promise<PrintPhotoBinary> {
    const photo = await this.printsRepository.getPhotoBinary(id, userId);
    if (!photo) throw new HttpException(404, 'Print photo not found');
    return photo;
  }

  private async applyCalculations(print: Print): Promise<void> {
    const printer = print.printerId
      ? await this.printersRepository.findById(print.printerId, print.userId)
      : undefined;

    const filaments = await this.filamentsRepository.findAll(print.userId);
    const filamentsById = new Map(
      filaments.map((filament) => [
        filament.id,
        {
          material: filament.material,
          minPricePaid: filament.minPricePaid,
          maxPricePaid: filament.maxPricePaid,
        },
      ]),
    );
    const materialMaxPrices = computeMaterialMaxPrices(
      filaments.map((filament) => ({
        material: filament.material,
        pricePerKg: filament.maxPricePaid ?? filament.minPricePaid,
      })),
    );

    const extraItems = await this.extraItemsRepository.findAll(print.userId);
    const extraItemsById = new Map(extraItems.map((extraItem) => [extraItem.id, { cost: extraItem.cost }]));

    const calculations = calculatePrintCosts({
      durationMinutes: print.durationMinutes,
      profitPercent: print.profitPercent,
      printFilaments: print.filaments.map((filament) => ({
        grams: filament.grams,
        filamentId: filament.filamentId,
      })),
      printExtraItems: print.extraItems.map((extraItem) => ({
        quantity: extraItem.quantity,
        extraItemId: extraItem.extraItemId,
      })),
      printer: printer
        ? {
            powerConsumptionW: printer.powerConsumptionW,
            energyCostPerKwh: printer.energyCostPerKwh,
            maintenanceCostPerHour: printer.maintenanceCostPerHour,
          }
        : null,
      filamentsById,
      extraItemsById,
      materialMaxPrices,
    });

    print.applyCalculations(calculations);
  }
}
