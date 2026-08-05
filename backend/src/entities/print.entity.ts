export interface PrintFilamentData {
  id?: number;
  position: number;
  filamentId: number | null;
  grams: number | null;
}

export interface PrintFilamentInput {
  filamentId?: number | null;
  grams?: number | null;
}

export interface PrintExtraItemData {
  id?: number;
  position: number;
  extraItemId: number | null;
  quantity: number | null;
}

export interface PrintExtraItemInput {
  extraItemId?: number | null;
  quantity?: number | null;
}

export interface PrintCalculations {
  filamentCost: number;
  printCost: number;
  saleValue: number;
  saleValueWorstCase: number;
}

export interface PrintPersistenceData {
  id: number;
  name: string;
  photoFilename?: string | null;
  photoMimeType?: string | null;
  printDate?: string | null;
  durationMinutes?: number | null;
  status?: string | null;
  result?: string | null;
  categoryId?: number | null;
  printerId?: number | null;
  printLink?: string | null;
  profitPercent?: number | null;
  filamentCost?: number | null;
  printCost?: number | null;
  saleValue?: number | null;
  saleValueWorstCase?: number | null;
  saleValueActual?: number | null;
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

export interface PrintCreateData {
  name: string;
  printDate?: string | null;
  durationMinutes?: number | null;
  status?: string | null;
  result?: string | null;
  categoryId?: number | null;
  printerId?: number | null;
  printLink?: string | null;
  profitPercent?: number | null;
  saleValueActual?: number | null;
  userId: string;
  filaments?: PrintFilamentInput[];
  extraItems?: PrintExtraItemInput[];
}

export type PrintUpdateData = Partial<PrintCreateData>;

export class Print {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private _photoFilename: string | null,
    private _photoMimeType: string | null,
    private _printDate: string | null,
    private _durationMinutes: number | null,
    private _status: string | null,
    private _result: string | null,
    private _categoryId: number | null,
    private _printerId: number | null,
    private _printLink: string | null,
    private _profitPercent: number | null,
    private _filamentCost: number | null,
    private _printCost: number | null,
    private _saleValue: number | null,
    private _saleValueWorstCase: number | null,
    private _saleValueActual: number | null,
    private readonly _userId: string,
    private _filaments: PrintFilamentData[],
    private _extraItems: PrintExtraItemData[],
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: PrintCreateData): Print {
    const validatedName = Print.validateName(data.name);

    return new Print(
      0,
      validatedName,
      null,
      null,
      data.printDate ?? null,
      data.durationMinutes ?? null,
      data.status ?? null,
      data.result ?? null,
      Print.validatePositiveId(data.categoryId),
      Print.validatePositiveId(data.printerId),
      data.printLink ?? null,
      data.profitPercent ?? null,
      null,
      null,
      null,
      null,
      data.saleValueActual ?? null,
      data.userId,
      Print.buildFilaments(data.filaments),
      Print.buildExtraItems(data.extraItems),
    );
  }

  static fromPersistence(data: PrintPersistenceData): Print {
    return new Print(
      data.id,
      data.name,
      data.photoFilename ?? null,
      data.photoMimeType ?? null,
      data.printDate ?? null,
      data.durationMinutes ?? null,
      data.status ?? null,
      data.result ?? null,
      data.categoryId ?? null,
      data.printerId ?? null,
      data.printLink ?? null,
      data.profitPercent ?? null,
      data.filamentCost ?? null,
      data.printCost ?? null,
      data.saleValue ?? null,
      data.saleValueWorstCase ?? null,
      data.saleValueActual ?? null,
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

  private static buildFilaments(filaments?: PrintFilamentInput[]): PrintFilamentData[] {
    return (filaments ?? [])
      .filter((filament) => filament.filamentId != null || filament.grams != null)
      .map((filament, index) => ({
        position: index,
        filamentId: filament.filamentId ?? null,
        grams: filament.grams ?? null,
      }));
  }

  private static buildExtraItems(extraItems?: PrintExtraItemInput[]): PrintExtraItemData[] {
    return (extraItems ?? [])
      .filter((extraItem) => extraItem.extraItemId != null || extraItem.quantity != null)
      .map((extraItem, index) => ({
        position: index,
        extraItemId: extraItem.extraItemId ?? null,
        quantity: extraItem.quantity ?? null,
      }));
  }

  update(data: PrintUpdateData): void {
    if (data.name !== undefined) this._name = Print.validateName(data.name);
    if (data.printDate !== undefined) this._printDate = data.printDate;
    if (data.durationMinutes !== undefined) this._durationMinutes = data.durationMinutes;
    if (data.status !== undefined) this._status = data.status;
    if (data.result !== undefined) this._result = data.result;
    if (data.categoryId !== undefined)
      this._categoryId = Print.validatePositiveId(data.categoryId);
    if (data.printerId !== undefined) this._printerId = Print.validatePositiveId(data.printerId);
    if (data.printLink !== undefined) this._printLink = data.printLink;
    if (data.profitPercent !== undefined) this._profitPercent = data.profitPercent;
    if (data.saleValueActual !== undefined) this._saleValueActual = data.saleValueActual;
    if (data.filaments !== undefined) this._filaments = Print.buildFilaments(data.filaments);
    if (data.extraItems !== undefined) this._extraItems = Print.buildExtraItems(data.extraItems);
  }

  applyCalculations(calculations: PrintCalculations): void {
    this._filamentCost = calculations.filamentCost;
    this._printCost = calculations.printCost;
    this._saleValue = calculations.saleValue;
    this._saleValueWorstCase = calculations.saleValueWorstCase;
  }

  setPhoto(filename: string | null, mimeType: string | null): void {
    this._photoFilename = filename;
    this._photoMimeType = mimeType;
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get photoFilename(): string | null {
    return this._photoFilename;
  }
  get photoMimeType(): string | null {
    return this._photoMimeType;
  }
  get printDate(): string | null {
    return this._printDate;
  }
  get durationMinutes(): number | null {
    return this._durationMinutes;
  }
  get status(): string | null {
    return this._status;
  }
  get result(): string | null {
    return this._result;
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
  get saleValueActual(): number | null {
    return this._saleValueActual;
  }
  get userId(): string {
    return this._userId;
  }
  get filaments(): PrintFilamentData[] {
    return this._filaments;
  }
  get extraItems(): PrintExtraItemData[] {
    return this._extraItems;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): {
    name: string;
    photoFilename: string | null;
    photoMimeType: string | null;
    printDate: string | null;
    durationMinutes: number | null;
    status: string | null;
    result: string | null;
    categoryId: number | null;
    printerId: number | null;
    printLink: string | null;
    profitPercent: number | null;
    filamentCost: number | null;
    printCost: number | null;
    saleValue: number | null;
    saleValueWorstCase: number | null;
    saleValueActual: number | null;
    userId: string;
  } {
    return {
      name: this._name,
      photoFilename: this._photoFilename,
      photoMimeType: this._photoMimeType,
      printDate: this._printDate,
      durationMinutes: this._durationMinutes,
      status: this._status,
      result: this._result,
      categoryId: this._categoryId,
      printerId: this._printerId,
      printLink: this._printLink,
      profitPercent: this._profitPercent,
      filamentCost: this._filamentCost,
      printCost: this._printCost,
      saleValue: this._saleValue,
      saleValueWorstCase: this._saleValueWorstCase,
      saleValueActual: this._saleValueActual,
      userId: this._userId,
    };
  }

  toResponse(): {
    id: number;
    name: string;
    photoFilename: string | null;
    photoMimeType: string | null;
    printDate: string | null;
    durationMinutes: number | null;
    status: string | null;
    result: string | null;
    categoryId: number | null;
    printerId: number | null;
    printLink: string | null;
    profitPercent: number | null;
    filamentCost: number | null;
    printCost: number | null;
    saleValue: number | null;
    saleValueWorstCase: number | null;
    saleValueActual: number | null;
    createdAt: Date;
    filaments: PrintFilamentData[];
    extraItems: PrintExtraItemData[];
  } {
    return {
      id: this._id,
      name: this._name,
      photoFilename: this._photoFilename,
      photoMimeType: this._photoMimeType,
      printDate: this._printDate,
      durationMinutes: this._durationMinutes,
      status: this._status,
      result: this._result,
      categoryId: this._categoryId,
      printerId: this._printerId,
      printLink: this._printLink,
      profitPercent: this._profitPercent,
      filamentCost: this._filamentCost,
      printCost: this._printCost,
      saleValue: this._saleValue,
      saleValueWorstCase: this._saleValueWorstCase,
      saleValueActual: this._saleValueActual,
      createdAt: this._createdAt,
      filaments: this._filaments,
      extraItems: this._extraItems,
    };
  }

  equals(other: Print): boolean {
    return this._id === other._id;
  }
}
