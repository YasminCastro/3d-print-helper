export interface PrinterPersistenceData {
  id: number;
  name: string;
  model?: string | null;
  brand?: string | null;
  powerConsumptionW?: number | null;
  maintenanceCostPerHour?: number | null;
  purchasePrice?: number | null;
  lifespanHours?: number | null;
  energyCostPerKwh?: number | null;
  createdAt?: Date;
}

export interface PrinterCreateData {
  name: string;
  model?: string | null;
  brand?: string | null;
  powerConsumptionW?: number | null;
  maintenanceCostPerHour?: number | null;
  purchasePrice?: number | null;
  lifespanHours?: number | null;
  energyCostPerKwh?: number | null;
}

export type PrinterUpdateData = Partial<PrinterCreateData>;

export class Printer {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private _model: string | null,
    private _brand: string | null,
    private _powerConsumptionW: number | null,
    private _maintenanceCostPerHour: number | null,
    private _purchasePrice: number | null,
    private _lifespanHours: number | null,
    private _energyCostPerKwh: number | null,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: PrinterCreateData): Printer {
    const validatedName = Printer.validateName(data.name);

    return new Printer(
      0,
      validatedName,
      data.model ?? null,
      data.brand ?? null,
      data.powerConsumptionW ?? null,
      data.maintenanceCostPerHour ?? null,
      data.purchasePrice ?? null,
      data.lifespanHours ?? null,
      data.energyCostPerKwh ?? null,
    );
  }

  static fromPersistence(data: PrinterPersistenceData): Printer {
    return new Printer(
      data.id,
      data.name,
      data.model ?? null,
      data.brand ?? null,
      data.powerConsumptionW ?? null,
      data.maintenanceCostPerHour ?? null,
      data.purchasePrice ?? null,
      data.lifespanHours ?? null,
      data.energyCostPerKwh ?? null,
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

    if (trimmedName.length > 150) {
      throw new Error('Name is too long (max 150 characters)');
    }

    return trimmedName;
  }

  update(data: PrinterUpdateData): void {
    if (data.name !== undefined) this._name = Printer.validateName(data.name);
    if (data.model !== undefined) this._model = data.model;
    if (data.brand !== undefined) this._brand = data.brand;
    if (data.powerConsumptionW !== undefined) this._powerConsumptionW = data.powerConsumptionW;
    if (data.maintenanceCostPerHour !== undefined)
      this._maintenanceCostPerHour = data.maintenanceCostPerHour;
    if (data.purchasePrice !== undefined) this._purchasePrice = data.purchasePrice;
    if (data.lifespanHours !== undefined) this._lifespanHours = data.lifespanHours;
    if (data.energyCostPerKwh !== undefined) this._energyCostPerKwh = data.energyCostPerKwh;
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get model(): string | null {
    return this._model;
  }
  get brand(): string | null {
    return this._brand;
  }
  get powerConsumptionW(): number | null {
    return this._powerConsumptionW;
  }
  get maintenanceCostPerHour(): number | null {
    return this._maintenanceCostPerHour;
  }
  get purchasePrice(): number | null {
    return this._purchasePrice;
  }
  get lifespanHours(): number | null {
    return this._lifespanHours;
  }
  get energyCostPerKwh(): number | null {
    return this._energyCostPerKwh;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): Omit<PrinterPersistenceData, 'id' | 'createdAt'> {
    return {
      name: this._name,
      model: this._model,
      brand: this._brand,
      powerConsumptionW: this._powerConsumptionW,
      maintenanceCostPerHour: this._maintenanceCostPerHour,
      purchasePrice: this._purchasePrice,
      lifespanHours: this._lifespanHours,
      energyCostPerKwh: this._energyCostPerKwh,
    };
  }

  toResponse(): {
    id: number;
    name: string;
    model: string | null;
    brand: string | null;
    powerConsumptionW: number | null;
    maintenanceCostPerHour: number | null;
    purchasePrice: number | null;
    lifespanHours: number | null;
    energyCostPerKwh: number | null;
    createdAt: Date;
  } {
    return {
      id: this._id,
      name: this._name,
      model: this._model,
      brand: this._brand,
      powerConsumptionW: this._powerConsumptionW,
      maintenanceCostPerHour: this._maintenanceCostPerHour,
      purchasePrice: this._purchasePrice,
      lifespanHours: this._lifespanHours,
      energyCostPerKwh: this._energyCostPerKwh,
      createdAt: this._createdAt,
    };
  }

  equals(other: Printer): boolean {
    return this._id === other._id;
  }
}
