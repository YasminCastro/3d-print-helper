export interface PrintQueueFilamentData {
  id?: number;
  position: number;
  filamentId: number | null;
  grams: number | null;
}

export interface PrintQueueFilamentInput {
  filamentId?: number | null;
  grams?: number | null;
}

export interface PrintQueueExtraItemData {
  id?: number;
  position: number;
  extraItemId: number | null;
  quantity: number | null;
}

export interface PrintQueueExtraItemInput {
  extraItemId?: number | null;
  quantity?: number | null;
}

export interface PrintQueueCalculations {
  filamentCost: number;
  printCost: number;
  saleValue: number;
  saleValueWorstCase: number;
}

export interface PrintQueueItemPersistenceData {
  id: number;
  name: string;
  durationMinutes?: number | null;
  categoryId?: number | null;
  printerId?: number | null;
  printLink?: string | null;
  notes?: string | null;
  profitPercent?: number | null;
  filamentCost?: number | null;
  printCost?: number | null;
  saleValue?: number | null;
  saleValueWorstCase?: number | null;
  createdAt?: Date;
  userId: string;
  filaments?: { id: number; position: number; filamentId: number | null; grams: number | null }[];
  extraItems?: {
    id: number;
    position: number;
    extraItemId: number | null;
    quantity: number | null;
  }[];
}

export interface PrintQueueItemCreateData {
  name: string;
  durationMinutes?: number | null;
  categoryId?: number | null;
  printerId?: number | null;
  printLink?: string | null;
  notes?: string | null;
  profitPercent?: number | null;
  userId: string;
  filaments?: PrintQueueFilamentInput[];
  extraItems?: PrintQueueExtraItemInput[];
}

export type PrintQueueItemUpdateData = Partial<PrintQueueItemCreateData>;

export class PrintQueueItem {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private _durationMinutes: number | null,
    private _categoryId: number | null,
    private _printerId: number | null,
    private _printLink: string | null,
    private _notes: string | null,
    private _profitPercent: number | null,
    private _filamentCost: number | null,
    private _printCost: number | null,
    private _saleValue: number | null,
    private _saleValueWorstCase: number | null,
    private readonly _userId: string,
    private _filaments: PrintQueueFilamentData[],
    private _extraItems: PrintQueueExtraItemData[],
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: PrintQueueItemCreateData): PrintQueueItem {
    const validatedName = PrintQueueItem.validateName(data.name);

    return new PrintQueueItem(
      0,
      validatedName,
      data.durationMinutes ?? null,
      PrintQueueItem.validatePositiveId(data.categoryId),
      PrintQueueItem.validatePositiveId(data.printerId),
      data.printLink ?? null,
      data.notes ?? null,
      data.profitPercent ?? null,
      null,
      null,
      null,
      null,
      data.userId,
      PrintQueueItem.buildFilaments(data.filaments),
      PrintQueueItem.buildExtraItems(data.extraItems),
    );
  }

  static fromPersistence(data: PrintQueueItemPersistenceData): PrintQueueItem {
    return new PrintQueueItem(
      data.id,
      data.name,
      data.durationMinutes ?? null,
      data.categoryId ?? null,
      data.printerId ?? null,
      data.printLink ?? null,
      data.notes ?? null,
      data.profitPercent ?? null,
      data.filamentCost ?? null,
      data.printCost ?? null,
      data.saleValue ?? null,
      data.saleValueWorstCase ?? null,
      data.userId,
      (data.filaments ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((filament) => ({
          id: filament.id,
          position: filament.position,
          filamentId: filament.filamentId,
          grams: filament.grams,
        })),
      (data.extraItems ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((extraItem) => ({
          id: extraItem.id,
          position: extraItem.position,
          extraItemId: extraItem.extraItemId,
          quantity: extraItem.quantity,
        })),
      data.createdAt || new Date(),
    );
  }

  private static validateName(name: string): string {
    if (!name || typeof name !== 'string') {
      throw new Error('Name is required');
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
      throw new Error('Name cannot be empty');
    }

    return trimmedName;
  }

  private static validatePositiveId(id?: number | null): number | null {
    if (id === undefined || id === null) return null;

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Id must be a positive integer');
    }

    return id;
  }

  private static buildFilaments(filaments?: PrintQueueFilamentInput[]): PrintQueueFilamentData[] {
    return (filaments ?? [])
      .filter((filament) => filament.filamentId != null || filament.grams != null)
      .map((filament, index) => ({
        position: index,
        filamentId: filament.filamentId ?? null,
        grams: filament.grams ?? null,
      }));
  }

  private static buildExtraItems(extraItems?: PrintQueueExtraItemInput[]): PrintQueueExtraItemData[] {
    return (extraItems ?? [])
      .filter((extraItem) => extraItem.extraItemId != null || extraItem.quantity != null)
      .map((extraItem, index) => ({
        position: index,
        extraItemId: extraItem.extraItemId ?? null,
        quantity: extraItem.quantity ?? null,
      }));
  }

  update(data: PrintQueueItemUpdateData): void {
    if (data.name !== undefined) this._name = PrintQueueItem.validateName(data.name);
    if (data.durationMinutes !== undefined) this._durationMinutes = data.durationMinutes;
    if (data.categoryId !== undefined)
      this._categoryId = PrintQueueItem.validatePositiveId(data.categoryId);
    if (data.printerId !== undefined)
      this._printerId = PrintQueueItem.validatePositiveId(data.printerId);
    if (data.printLink !== undefined) this._printLink = data.printLink;
    if (data.notes !== undefined) this._notes = data.notes;
    if (data.profitPercent !== undefined) this._profitPercent = data.profitPercent;
    if (data.filaments !== undefined) this._filaments = PrintQueueItem.buildFilaments(data.filaments);
    if (data.extraItems !== undefined)
      this._extraItems = PrintQueueItem.buildExtraItems(data.extraItems);
  }

  applyCalculations(calculations: PrintQueueCalculations): void {
    this._filamentCost = calculations.filamentCost;
    this._printCost = calculations.printCost;
    this._saleValue = calculations.saleValue;
    this._saleValueWorstCase = calculations.saleValueWorstCase;
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get durationMinutes(): number | null {
    return this._durationMinutes;
  }
  get categoryId(): number | null {
    return this._categoryId;
  }
  get printerId(): number | null {
    return this._printerId;
  }
  get printLink(): string | null {
    return this._printLink;
  }
  get notes(): string | null {
    return this._notes;
  }
  get profitPercent(): number | null {
    return this._profitPercent;
  }
  get filamentCost(): number | null {
    return this._filamentCost;
  }
  get printCost(): number | null {
    return this._printCost;
  }
  get saleValue(): number | null {
    return this._saleValue;
  }
  get saleValueWorstCase(): number | null {
    return this._saleValueWorstCase;
  }
  get userId(): string {
    return this._userId;
  }
  get filaments(): PrintQueueFilamentData[] {
    return this._filaments;
  }
  get extraItems(): PrintQueueExtraItemData[] {
    return this._extraItems;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): {
    name: string;
    durationMinutes: number | null;
    categoryId: number | null;
    printerId: number | null;
    printLink: string | null;
    notes: string | null;
    profitPercent: number | null;
    filamentCost: number | null;
    printCost: number | null;
    saleValue: number | null;
    saleValueWorstCase: number | null;
    userId: string;
  } {
    return {
      name: this._name,
      durationMinutes: this._durationMinutes,
      categoryId: this._categoryId,
      printerId: this._printerId,
      printLink: this._printLink,
      notes: this._notes,
      profitPercent: this._profitPercent,
      filamentCost: this._filamentCost,
      printCost: this._printCost,
      saleValue: this._saleValue,
      saleValueWorstCase: this._saleValueWorstCase,
      userId: this._userId,
    };
  }

  toResponse(): {
    id: number;
    name: string;
    durationMinutes: number | null;
    categoryId: number | null;
    printerId: number | null;
    printLink: string | null;
    notes: string | null;
    profitPercent: number | null;
    filamentCost: number | null;
    printCost: number | null;
    saleValue: number | null;
    saleValueWorstCase: number | null;
    createdAt: Date;
    filaments: PrintQueueFilamentData[];
    extraItems: PrintQueueExtraItemData[];
  } {
    return {
      id: this._id,
      name: this._name,
      durationMinutes: this._durationMinutes,
      categoryId: this._categoryId,
      printerId: this._printerId,
      printLink: this._printLink,
      notes: this._notes,
      profitPercent: this._profitPercent,
      filamentCost: this._filamentCost,
      printCost: this._printCost,
      saleValue: this._saleValue,
      saleValueWorstCase: this._saleValueWorstCase,
      createdAt: this._createdAt,
      filaments: this._filaments,
      extraItems: this._extraItems,
    };
  }

  equals(other: PrintQueueItem): boolean {
    return this._id === other._id;
  }
}
