import { injectable, inject } from 'tsyringe';
import {
  PrintQueueItem,
  type PrintQueueItemCreateData,
  type PrintQueueItemUpdateData,
} from '@entities/print-queue-item.entity';
import { Print } from '@entities/print.entity';
import { HttpException } from '@exceptions/httpException';
import { ExtraItemsRepository } from '@repositories/extra-items.repository';
import type { IExtraItemsRepository } from '@repositories/extra-items.repository';
import { FilamentsRepository } from '@repositories/filaments.repository';
import type { IFilamentsRepository } from '@repositories/filaments.repository';
import { PrintCategoriesRepository } from '@repositories/print-categories.repository';
import type { IPrintCategoriesRepository } from '@repositories/print-categories.repository';
import { PrintersRepository } from '@repositories/printers.repository';
import type { IPrintersRepository } from '@repositories/printers.repository';
import { PrintQueueRepository } from '@repositories/print-queue.repository';
import type {
  IPrintQueueRepository,
  PaginatedResult,
  PaginationParams,
} from '@repositories/print-queue.repository';
import { PrintsService } from '@services/prints.service';
import { calculatePrintCosts, computeMaterialMaxPrices } from '@utils/printCalculations';

export interface MarkAsPrintedData {
  printDate?: string | null;
  result?: string | null;
  saleValueActual?: number | null;
  photo?: { filename: string; mimeType: string; data: Buffer } | null;
}

@injectable()
export class PrintQueueService {
  constructor(
    @inject(PrintQueueRepository) private printQueueRepository: IPrintQueueRepository,
    @inject(PrintCategoriesRepository) private printCategoriesRepository: IPrintCategoriesRepository,
    @inject(PrintersRepository) private printersRepository: IPrintersRepository,
    @inject(FilamentsRepository) private filamentsRepository: IFilamentsRepository,
    @inject(ExtraItemsRepository) private extraItemsRepository: IExtraItemsRepository,
    @inject(PrintsService) private printsService: PrintsService,
  ) {}

  async getAllQueueItems(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<PrintQueueItem>> {
    return this.printQueueRepository.findAll(userId, pagination);
  }

  async getQueueItemById(id: number, userId: string): Promise<PrintQueueItem> {
    const queueItem = await this.printQueueRepository.findById(id, userId);
    if (!queueItem) throw new HttpException(404, 'Print queue item not found');
    return queueItem;
  }

  async createQueueItem(data: PrintQueueItemCreateData): Promise<PrintQueueItem> {
    const queueItem = PrintQueueItem.create(data);
    await this.applyCalculations(queueItem);
    return this.printQueueRepository.save(queueItem);
  }

  async updateQueueItem(
    id: number,
    userId: string,
    data: PrintQueueItemUpdateData,
  ): Promise<PrintQueueItem> {
    const existing = await this.printQueueRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Print queue item not found');

    existing.update(data);
    await this.applyCalculations(existing);

    const updated = await this.printQueueRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Print queue item not found');
    return updated;
  }

  async deleteQueueItem(id: number, userId: string): Promise<void> {
    const deleted = await this.printQueueRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Print queue item not found');
  }

  async markAsPrinted(id: number, userId: string, data: MarkAsPrintedData): Promise<Print> {
    const queueItem = await this.printQueueRepository.findById(id, userId);
    if (!queueItem) throw new HttpException(404, 'Print queue item not found');

    let print = await this.printsService.createPrint({
      name: queueItem.name,
      durationMinutes: queueItem.durationMinutes,
      categoryId: queueItem.categoryId,
      printerId: queueItem.printerId,
      printLink: queueItem.printLink,
      notes: queueItem.notes,
      profitPercent: queueItem.profitPercent,
      userId: queueItem.userId,
      printDate: data.printDate ?? null,
      status: 'pronto',
      result: data.result ?? null,
      saleValueActual: data.saleValueActual ?? null,
      filaments: queueItem.filaments.map((filament) => ({
        filamentId: filament.filamentId,
        grams: filament.grams,
      })),
      extraItems: queueItem.extraItems.map((extraItem) => ({
        extraItemId: extraItem.extraItemId,
        quantity: extraItem.quantity,
      })),
    });

    if (data.photo) {
      print = await this.printsService.setPhoto(print.id, userId, data.photo);
    }

    await this.printQueueRepository.delete(id, userId);

    return print;
  }

  private async applyCalculations(queueItem: PrintQueueItem): Promise<void> {
    const printer = queueItem.printerId
      ? await this.printersRepository.findById(queueItem.printerId, queueItem.userId)
      : undefined;

    const filaments = await this.filamentsRepository.findAll(queueItem.userId);
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

    const extraItems = await this.extraItemsRepository.findAll(queueItem.userId);
    const extraItemsById = new Map(extraItems.map((extraItem) => [extraItem.id, { cost: extraItem.cost }]));

    const calculations = calculatePrintCosts({
      durationMinutes: queueItem.durationMinutes,
      profitPercent: queueItem.profitPercent,
      printFilaments: queueItem.filaments.map((filament) => ({
        grams: filament.grams,
        filamentId: filament.filamentId,
      })),
      printExtraItems: queueItem.extraItems.map((extraItem) => ({
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

    queueItem.applyCalculations(calculations);
  }
}
