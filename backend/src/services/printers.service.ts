import { injectable, inject } from 'tsyringe';
import {
  Printer,
  type PrinterCreateData,
  type PrinterUpdateData,
} from '@entities/printer.entity';
import { HttpException } from '@exceptions/httpException';
import { PrintersRepository } from '@repositories/printers.repository';
import type { IPrintersRepository } from '@repositories/printers.repository';

@injectable()
export class PrintersService {
  constructor(@inject(PrintersRepository) private printersRepository: IPrintersRepository) {}

  async getAllPrinters(userId: string): Promise<Printer[]> {
    return this.printersRepository.findAll(userId);
  }

  async getPrinterById(id: number, userId: string): Promise<Printer> {
    const printer = await this.printersRepository.findById(id, userId);
    if (!printer) throw new HttpException(404, 'Printer not found');
    return printer;
  }

  async createPrinter(data: PrinterCreateData): Promise<Printer> {
    const printer = Printer.create(data);
    return this.printersRepository.save(printer);
  }

  async updatePrinter(id: number, userId: string, data: PrinterUpdateData): Promise<Printer> {
    const existing = await this.printersRepository.findById(id, userId);
    if (!existing) throw new HttpException(404, 'Printer not found');

    existing.update(data);

    const updated = await this.printersRepository.update(id, userId, existing);
    if (!updated) throw new HttpException(404, 'Printer not found');
    return updated;
  }

  async deletePrinter(id: number, userId: string): Promise<void> {
    const deleted = await this.printersRepository.delete(id, userId);
    if (!deleted) throw new HttpException(404, 'Printer not found');
  }
}
