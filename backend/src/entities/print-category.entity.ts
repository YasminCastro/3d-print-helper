export interface PrintCategoryPersistenceData {
  id: number;
  name: string;
  color?: string | null;
  createdAt?: Date;
  userId: string;
}

export interface PrintCategoryCreateData {
  name: string;
  color?: string | null;
  userId: string;
}

export type PrintCategoryUpdateData = Partial<PrintCategoryCreateData>;

export class PrintCategory {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private _color: string | null,
    private readonly _userId: string,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: PrintCategoryCreateData): PrintCategory {
    return new PrintCategory(0, PrintCategory.validateName(data.name), data.color ?? null, data.userId);
  }

  static fromPersistence(data: PrintCategoryPersistenceData): PrintCategory {
    return new PrintCategory(
      data.id,
      data.name,
      data.color ?? null,
      data.userId,
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

  update(data: PrintCategoryUpdateData): void {
    if (data.name !== undefined) this._name = PrintCategory.validateName(data.name);
    if (data.color !== undefined) this._color = data.color;
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get color(): string | null {
    return this._color;
  }
  get userId(): string {
    return this._userId;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): Omit<PrintCategoryPersistenceData, 'id' | 'createdAt'> {
    return {
      name: this._name,
      color: this._color,
      userId: this._userId,
    };
  }

  toResponse(): { id: number; name: string; color: string | null; createdAt: Date } {
    return {
      id: this._id,
      name: this._name,
      color: this._color,
      createdAt: this._createdAt,
    };
  }

  equals(other: PrintCategory): boolean {
    return this._id === other._id;
  }
}
