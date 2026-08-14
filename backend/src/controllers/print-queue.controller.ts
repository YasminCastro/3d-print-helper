import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import {
  type PrintQueueItemCreateData,
  type PrintQueueItemUpdateData,
} from '@entities/print-queue-item.entity';
import type { MarkPrintQueueItemAsPrintedDto } from '@dtos/print-queue.dto';
import { listPrintQueueQuerySchema } from '@dtos/print-queue.dto';
import { HttpException } from '@exceptions/httpException';
import { RequestWithUser } from '@interfaces/auth.interface';
import { PrintQueueService } from '@services/print-queue.service';
import { asyncHandler } from '@utils/asyncHandler';

const DEFAULT_PRINT_QUEUE_PAGE = 1;
const DEFAULT_PRINT_QUEUE_LIMIT = 24;

function parseId(rawId: unknown, label: string): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpException(400, `Invalid ${label} id`);
  }
  return id;
}

@injectable()
export class PrintQueueController {
  constructor(@inject(PrintQueueService) private readonly printQueueService: PrintQueueService) {}

  getQueueItems = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const query = listPrintQueueQuerySchema.parse(req.query);
    const page = query.page ?? DEFAULT_PRINT_QUEUE_PAGE;
    const limit = query.limit ?? DEFAULT_PRINT_QUEUE_LIMIT;

    const { items, total } = await this.printQueueService.getAllQueueItems(user.id, {
      page,
      limit,
      sort: query.sort,
      search: query.search,
      categoryIds: query.categoryId,
      printerIds: query.printerId,
    });

    res.json({
      data: items.map((queueItem) => queueItem.toResponse()),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      message: 'findAll',
    });
  });

  getQueueItemById = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print queue item');
    const queueItem = await this.printQueueService.getQueueItemById(id, user.id);

    res.json({ data: queueItem.toResponse(), message: 'findById' });
  });

  createQueueItem = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const queueItemData: PrintQueueItemCreateData = { ...req.body, userId: user.id };
    const queueItem = await this.printQueueService.createQueueItem(queueItemData);

    res.status(201).json({ data: queueItem.toResponse(), message: 'create' });
  });

  updateQueueItem = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print queue item');
    const updateData: PrintQueueItemUpdateData = req.body;
    const queueItem = await this.printQueueService.updateQueueItem(id, user.id, updateData);

    res.json({ data: queueItem.toResponse(), message: 'update' });
  });

  deleteQueueItem = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print queue item');
    await this.printQueueService.deleteQueueItem(id, user.id);

    res.status(204).json({ message: 'delete' });
  });

  markPrinted = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as RequestWithUser;
    const id = parseId(req.params.id, 'print queue item');
    const body = req.body as MarkPrintQueueItemAsPrintedDto;

    const print = await this.printQueueService.markAsPrinted(id, user.id, {
      printDate: body.printDate ?? null,
      result: body.result ?? null,
      saleValueActual: body.saleValueActual ?? null,
      photo: body.photo
        ? {
            filename: body.photo.filename,
            mimeType: body.photo.mimeType,
            data: Buffer.from(body.photo.data, 'base64'),
          }
        : null,
    });

    res.status(201).json({ data: print.toResponse(), message: 'markPrinted' });
  });
}
