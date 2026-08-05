export interface ExtraItemPersistenceData {
  id: number;
  name: string;
  cost: number;
  createdAt?: Date;
  userId: string;
}

export interface ExtraItemCreateData {
  name: string;
  cost: number;
  userId: string;
}

export type ExtraItemUpdateData = Partial<ExtraItemCreateData>;

export class ExtraItem {
  private constructor(
    private readonly _id: number,
    private _name: string,
    private _cost: number,
    private readonly _userId: string,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: ExtraItemCreateData): ExtraItem {
    const validatedName = ExtraItem.validateName(data.name);
    const validatedCost = ExtraItem.validateCost(data.cost);

    return new ExtraItem(0, validatedName, validatedCost, data.userId);
  }

  static fromPersistence(data: ExtraItemPersistenceData): ExtraItem {
    return new ExtraItem(data.id, data.name, data.cost, data.userId, data.createdAt || new Date());
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

  private static validateCost(cost: number): number {
    if (typeof cost !== 'number' || Number.isNaN(cost) || cost < 0) {
      throw new Error('Cost must be a non-negative number');
    }

    return cost;
  }

  update(data: ExtraItemUpdateData): void {
    if (data.name !== undefined) this._name = ExtraItem.validateName(data.name);
    if (data.cost !== undefined) this._cost = ExtraItem.validateCost(data.cost);
  }

  get id(): number {
    return this._id;
  }
  get name(): string {
    return this._name;
  }
  get cost(): number {
    return this._cost;
  }
  get userId(): string {
    return this._userId;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): Omit<ExtraItemPersistenceData, 'id' | 'createdAt'> {
    return {
      name: this._name,
      cost: this._cost,
      userId: this._userId,
    };
  }

  toResponse(): {
    id: number;
    name: string;
    cost: number;
    createdAt: Date;
  } {
    return {
      id: this._id,
      name: this._name,
      cost: this._cost,
      createdAt: this._createdAt,
    };
  }

  equals(other: ExtraItem): boolean {
    return this._id === other._id;
  }
}
