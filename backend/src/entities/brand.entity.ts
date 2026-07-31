export interface BrandPersistenceData {
  id: number;
  name: string;
  whereToBuy?: string | null;
  avgPriceMin?: number | null;
  avgPriceMax?: number | null;
  filamentTypes?: string | null;
  bestColors?: string | null;
  purchased?: number | null;
  notes?: string | null;
  createdAt?: Date;
}

export interface BrandCreateData {
  name: string;
  whereToBuy?: string | null;
  avgPriceMin?: number | null;
  avgPriceMax?: number | null;
  filamentTypes?: string[] | null;
  bestColors?: string[] | null;
  purchased?: boolean | null;
  notes?: string | null;
}

export type BrandUpdateData = Partial<BrandCreateData>;

export class FilamentBrand {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private _whereToBuy: string | null,
    private _avgPriceMin: number | null,
    private _avgPriceMax: number | null,
    private _filamentTypes: string[],
    private _bestColors: string[],
    private _purchased: boolean,
    private _notes: string | null,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: BrandCreateData): FilamentBrand {
    const validatedName = FilamentBrand.validateName(data.name);

    return new FilamentBrand(
      0,
      validatedName,
      data.whereToBuy ?? null,
      data.avgPriceMin ?? null,
      data.avgPriceMax ?? null,
      data.filamentTypes ?? [],
      data.bestColors ?? [],
      data.purchased ?? false,
      data.notes ?? null,
    );
  }

  static fromPersistence(data: BrandPersistenceData): FilamentBrand {
    return new FilamentBrand(
      data.id,
      data.name,
      data.whereToBuy ?? null,
      data.avgPriceMin ?? null,
      data.avgPriceMax ?? null,
      FilamentBrand.splitCsv(data.filamentTypes),
      FilamentBrand.splitCsv(data.bestColors),
      data.purchased === 1,
      data.notes ?? null,
      data.createdAt || new Date(),
    );
  }

  private static splitCsv(value?: string | null): string[] {
    return value ? value.split(',').filter(Boolean) : [];
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

  update(data: BrandUpdateData): void {
    if (data.name !== undefined) this._name = FilamentBrand.validateName(data.name);
    if (data.whereToBuy !== undefined) this._whereToBuy = data.whereToBuy;
    if (data.avgPriceMin !== undefined) this._avgPriceMin = data.avgPriceMin;
    if (data.avgPriceMax !== undefined) this._avgPriceMax = data.avgPriceMax;
    if (data.filamentTypes !== undefined) this._filamentTypes = data.filamentTypes ?? [];
    if (data.bestColors !== undefined) this._bestColors = data.bestColors ?? [];
    if (data.purchased !== undefined) this._purchased = data.purchased ?? false;
    if (data.notes !== undefined) this._notes = data.notes;
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get whereToBuy(): string | null {
    return this._whereToBuy;
  }
  get avgPriceMin(): number | null {
    return this._avgPriceMin;
  }
  get avgPriceMax(): number | null {
    return this._avgPriceMax;
  }
  get filamentTypes(): string[] {
    return [...this._filamentTypes];
  }
  get bestColors(): string[] {
    return [...this._bestColors];
  }
  get purchased(): boolean {
    return this._purchased;
  }
  get notes(): string | null {
    return this._notes;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): Omit<BrandPersistenceData, 'id' | 'createdAt'> {
    return {
      name: this._name,
      whereToBuy: this._whereToBuy,
      avgPriceMin: this._avgPriceMin,
      avgPriceMax: this._avgPriceMax,
      filamentTypes: this._filamentTypes.length ? this._filamentTypes.join(',') : null,
      bestColors: this._bestColors.length ? this._bestColors.join(',') : null,
      purchased: this._purchased ? 1 : 0,
      notes: this._notes,
    };
  }

  toResponse(): {
    id: number;
    name: string;
    whereToBuy: string | null;
    avgPriceMin: number | null;
    avgPriceMax: number | null;
    filamentTypes: string[];
    bestColors: string[];
    purchased: boolean;
    notes: string | null;
    createdAt: Date;
  } {
    return {
      id: this._id,
      name: this._name,
      whereToBuy: this._whereToBuy,
      avgPriceMin: this._avgPriceMin,
      avgPriceMax: this._avgPriceMax,
      filamentTypes: this._filamentTypes,
      bestColors: this._bestColors,
      purchased: this._purchased,
      notes: this._notes,
      createdAt: this._createdAt,
    };
  }

  equals(other: FilamentBrand): boolean {
    return this._id === other._id;
  }
}
