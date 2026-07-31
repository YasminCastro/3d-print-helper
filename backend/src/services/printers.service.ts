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

  async getAllPrinters(): Promise<Printer[]> {
    return this.printersRepository.findAll();
  }

  async getPrinterById(id: number): Promise<Printer> {
    const printer = await this.printersRepository.findById(id);
    if (!printer) throw new HttpException(404, 'Printer not found');
    return printer;
  }

  async createPrinter(data: PrinterCreateData): Promise<Printer> {
    const printer = Printer.create(data);
    return this.printersRepository.save(printer);
  }

  async updatePrinter(id: number, data: PrinterUpdateData): Promise<Printer> {
    const existing = await this.printersRepository.findById(id);
    if (!existing) throw new HttpException(404, 'Printer not found');

    existing.update(data);

    const updated = await this.printersRepository.update(id, existing);
    if (!updated) throw new HttpException(404, 'Printer not found');
    return updated;
  }

  async deletePrinter(id: number): Promise<void> {
    const deleted = await this.printersRepository.delete(id);
    if (!deleted) throw new HttpException(404, 'Printer not found');
  }
}
