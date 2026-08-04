export interface PrintCategoryPersistenceData {
  id: number;
  name: string;
  createdAt?: Date;
  userId: string;
}

export interface PrintCategoryCreateData {
  name: string;
  userId: string;
}

export type PrintCategoryUpdateData = Partial<PrintCategoryCreateData>;

export class PrintCategory {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private readonly _userId: string,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: PrintCategoryCreateData): PrintCategory {
    return new PrintCategory(0, PrintCategory.validateName(data.name), data.userId);
  }

  static fromPersistence(data: PrintCategoryPersistenceData): PrintCategory {
    return new PrintCategory(data.id, data.name, data.userId, data.createdAt || new Date());
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
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
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
      userId: this._userId,
    };
  }

  toResponse(): { id: number; name: string; createdAt: Date } {
    return {
      id: this._id,
      name: this._name,
      createdAt: this._createdAt,
    };
  }

  equals(other: PrintCategory): boolean {
    return this._id === other._id;
  }
}
