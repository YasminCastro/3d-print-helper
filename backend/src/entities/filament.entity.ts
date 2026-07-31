export interface FilamentPersistenceData {
  id: number;
  name: string;
  availability?: string | null;
  lastPurchaseDate?: string | null;
  material?: string | null;
  brandId?: number | null;
  purchaseLink?: string | null;
  saleName?: string | null;
  minPricePaid?: number | null;
  maxPricePaid?: number | null;
  nozzleTempMin?: number | null;
  nozzleTempMax?: number | null;
  bedTempMin?: number | null;
  bedTempMax?: number | null;
  purchaseBatch?: string | null;
  rating?: number | null;
  color?: string | null;
  createdAt?: Date;
}

export interface FilamentCreateData {
  name: string;
  availability?: string | null;
  lastPurchaseDate?: string | null;
  material?: string | null;
  brandId?: number | null;
  purchaseLink?: string | null;
  saleName?: string | null;
  minPricePaid?: number | null;
  maxPricePaid?: number | null;
  nozzleTempMin?: number | null;
  nozzleTempMax?: number | null;
  bedTempMin?: number | null;
  bedTempMax?: number | null;
  purchaseBatch?: string | null;
  rating?: number | null;
  color?: string | null;
}

export type FilamentUpdateData = Partial<FilamentCreateData>;

export class Filament {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private _availability: string | null,
    private _lastPurchaseDate: string | null,
    private _material: string | null,
    private _brandId: number | null,
    private _purchaseLink: string | null,
    private _saleName: string | null,
    private _minPricePaid: number | null,
    private _maxPricePaid: number | null,
    private _nozzleTempMin: number | null,
    private _nozzleTempMax: number | null,
    private _bedTempMin: number | null,
    private _bedTempMax: number | null,
    private _purchaseBatch: string | null,
    private _rating: number | null,
    private _color: string | null,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: FilamentCreateData): Filament {
    const validatedName = Filament.validateName(data.name);
    const validatedRating = Filament.validateRating(data.rating);

    return new Filament(
      0,
      validatedName,
      data.availability ?? null,
      data.lastPurchaseDate ?? null,
      data.material ?? null,
      data.brandId ?? null,
      data.purchaseLink ?? null,
      data.saleName ?? null,
      data.minPricePaid ?? null,
      data.maxPricePaid ?? null,
      data.nozzleTempMin ?? null,
      data.nozzleTempMax ?? null,
      data.bedTempMin ?? null,
      data.bedTempMax ?? null,
      data.purchaseBatch ?? null,
      validatedRating,
      data.color ?? null,
    );
  }

  static fromPersistence(data: FilamentPersistenceData): Filament {
    return new Filament(
      data.id,
      data.name,
      data.availability ?? null,
      data.lastPurchaseDate ?? null,
      data.material ?? null,
      data.brandId ?? null,
      data.purchaseLink ?? null,
      data.saleName ?? null,
      data.minPricePaid ?? null,
      data.maxPricePaid ?? null,
      data.nozzleTempMin ?? null,
      data.nozzleTempMax ?? null,
      data.bedTempMin ?? null,
      data.bedTempMax ?? null,
      data.purchaseBatch ?? null,
      data.rating ?? null,
      data.color ?? null,
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

  private static validateRating(rating?: number | null): number | null {
    if (rating === undefined || rating === null) return null;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5');
    }

    return rating;
  }

  update(data: FilamentUpdateData): void {
    if (data.name !== undefined) this._name = Filament.validateName(data.name);
    if (data.availability !== undefined) this._availability = data.availability;
    if (data.lastPurchaseDate !== undefined) this._lastPurchaseDate = data.lastPurchaseDate;
    if (data.material !== undefined) this._material = data.material;
    if (data.brandId !== undefined) this._brandId = data.brandId;
    if (data.purchaseLink !== undefined) this._purchaseLink = data.purchaseLink;
    if (data.saleName !== undefined) this._saleName = data.saleName;
    if (data.minPricePaid !== undefined) this._minPricePaid = data.minPricePaid;
    if (data.maxPricePaid !== undefined) this._maxPricePaid = data.maxPricePaid;
    if (data.nozzleTempMin !== undefined) this._nozzleTempMin = data.nozzleTempMin;
    if (data.nozzleTempMax !== undefined) this._nozzleTempMax = data.nozzleTempMax;
    if (data.bedTempMin !== undefined) this._bedTempMin = data.bedTempMin;
    if (data.bedTempMax !== undefined) this._bedTempMax = data.bedTempMax;
    if (data.purchaseBatch !== undefined) this._purchaseBatch = data.purchaseBatch;
    if (data.rating !== undefined) this._rating = Filament.validateRating(data.rating);
    if (data.color !== undefined) this._color = data.color;
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get availability(): string | null {
    return this._availability;
  }
  get lastPurchaseDate(): string | null {
    return this._lastPurchaseDate;
  }
  get material(): string | null {
    return this._material;
  }
  get brandId(): number | null {
    return this._brandId;
  }
  get purchaseLink(): string | null {
    return this._purchaseLink;
  }
  get saleName(): string | null {
    return this._saleName;
  }
  get minPricePaid(): number | null {
    return this._minPricePaid;
  }
  get maxPricePaid(): number | null {
    return this._maxPricePaid;
  }
  get nozzleTempMin(): number | null {
    return this._nozzleTempMin;
  }
  get nozzleTempMax(): number | null {
    return this._nozzleTempMax;
  }
  get bedTempMin(): number | null {
    return this._bedTempMin;
  }
  get bedTempMax(): number | null {
    return this._bedTempMax;
  }
  get purchaseBatch(): string | null {
    return this._purchaseBatch;
  }
  get rating(): number | null {
    return this._rating;
  }
  get color(): string | null {
    return this._color;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): Omit<FilamentPersistenceData, 'id' | 'createdAt'> {
    return {
      name: this._name,
      availability: this._availability,
      lastPurchaseDate: this._lastPurchaseDate,
      material: this._material,
      brandId: this._brandId,
      purchaseLink: this._purchaseLink,
      saleName: this._saleName,
      minPricePaid: this._minPricePaid,
      maxPricePaid: this._maxPricePaid,
      nozzleTempMin: this._nozzleTempMin,
      nozzleTempMax: this._nozzleTempMax,
      bedTempMin: this._bedTempMin,
      bedTempMax: this._bedTempMax,
      purchaseBatch: this._purchaseBatch,
      rating: this._rating,
      color: this._color,
    };
  }

  toResponse(): {
    id: number;
    name: string;
    availability: string | null;
    lastPurchaseDate: string | null;
    material: string | null;
    brandId: number | null;
    purchaseLink: string | null;
    saleName: string | null;
    minPricePaid: number | null;
    maxPricePaid: number | null;
    nozzleTempMin: number | null;
    nozzleTempMax: number | null;
    bedTempMin: number | null;
    bedTempMax: number | null;
    purchaseBatch: string | null;
    rating: number | null;
    color: string | null;
    createdAt: Date;
  } {
    return {
      id: this._id,
      name: this._name,
      availability: this._availability,
      lastPurchaseDate: this._lastPurchaseDate,
      material: this._material,
      brandId: this._brandId,
      purchaseLink: this._purchaseLink,
      saleName: this._saleName,
      minPricePaid: this._minPricePaid,
      maxPricePaid: this._maxPricePaid,
      nozzleTempMin: this._nozzleTempMin,
      nozzleTempMax: this._nozzleTempMax,
      bedTempMin: this._bedTempMin,
      bedTempMax: this._bedTempMax,
      purchaseBatch: this._purchaseBatch,
      rating: this._rating,
      color: this._color,
      createdAt: this._createdAt,
    };
  }

  equals(other: Filament): boolean {
    return this._id === other._id;
  }
}
