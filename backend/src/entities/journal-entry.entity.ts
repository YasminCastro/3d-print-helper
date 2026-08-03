export interface JournalAttemptData {
  id?: number;
  position: number;
  attempt: string | null;
  worked: number | null;
}

export interface JournalPhotoData {
  id: number;
  filename: string;
  mimeType: string;
  createdAt: Date;
}

export interface JournalAttemptInput {
  attempt?: string | null;
  worked?: boolean | null;
}

export interface JournalEntryPersistenceData {
  id: number;
  title: string;
  entryDate?: string | null;
  filamentId?: number | null;
  status?: string | null;
  symptom?: string | null;
  possibleCauses?: string | null;
  notes?: string | null;
  createdAt?: Date;
  userId: string;
  attempts?: { id: number; position: number; attempt: string | null; worked: number | null }[];
  photos?: { id: number; filename: string; mimeType: string; createdAt: Date }[];
}

export interface JournalEntryCreateData {
  title: string;
  entryDate?: string | null;
  filamentId?: number | null;
  status?: string | null;
  symptom?: string | null;
  possibleCauses?: string | null;
  notes?: string | null;
  userId: string;
  attempts?: JournalAttemptInput[];
}

export type JournalEntryUpdateData = Partial<JournalEntryCreateData>;

export class JournalEntry {
  private constructor(
    private readonly _id: number,
    private _title: string,
    private _entryDate: string | null,
    private _filamentId: number | null,
    private _status: string | null,
    private _symptom: string | null,
    private _possibleCauses: string | null,
    private _notes: string | null,
    private readonly _userId: string,
    private _attempts: JournalAttemptData[],
    private readonly _photos: JournalPhotoData[],
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: JournalEntryCreateData): JournalEntry {
    const validatedTitle = JournalEntry.validateTitle(data.title);
    const validatedFilamentId = JournalEntry.validateFilamentId(data.filamentId);

    return new JournalEntry(
      0,
      validatedTitle,
      data.entryDate ?? null,
      validatedFilamentId,
      data.status ?? null,
      data.symptom ?? null,
      data.possibleCauses ?? null,
      data.notes ?? null,
      data.userId,
      JournalEntry.buildAttempts(data.attempts),
      [],
    );
  }

  static fromPersistence(data: JournalEntryPersistenceData): JournalEntry {
    return new JournalEntry(
      data.id,
      data.title,
      data.entryDate ?? null,
      data.filamentId ?? null,
      data.status ?? null,
      data.symptom ?? null,
      data.possibleCauses ?? null,
      data.notes ?? null,
      data.userId,
      (data.attempts ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((attempt) => ({
          id: attempt.id,
          position: attempt.position,
          attempt: attempt.attempt,
          worked: attempt.worked,
        })),
      (data.photos ?? []).map((photo) => ({
        id: photo.id,
        filename: photo.filename,
        mimeType: photo.mimeType,
        createdAt: photo.createdAt,
      })),
      data.createdAt || new Date(),
    );
  }

  private static validateTitle(title: string): string {
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required');
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      throw new Error('Title cannot be empty');
    }

    return trimmedTitle;
  }

  private static validateFilamentId(filamentId?: number | null): number | null {
    if (filamentId === undefined || filamentId === null) return null;

    if (!Number.isInteger(filamentId) || filamentId <= 0) {
      throw new Error('Filament id must be a positive integer');
    }

    return filamentId;
  }

  private static buildAttempts(attempts?: JournalAttemptInput[]): JournalAttemptData[] {
    return (attempts ?? [])
      .filter((attempt) => attempt.attempt || attempt.worked !== undefined)
      .map((attempt, index) => ({
        position: index,
        attempt: attempt.attempt ?? null,
        worked: attempt.worked === undefined || attempt.worked === null ? null : Number(attempt.worked),
      }));
  }

  update(data: JournalEntryUpdateData): void {
    if (data.title !== undefined) this._title = JournalEntry.validateTitle(data.title);
    if (data.entryDate !== undefined) this._entryDate = data.entryDate;
    if (data.filamentId !== undefined)
      this._filamentId = JournalEntry.validateFilamentId(data.filamentId);
    if (data.status !== undefined) this._status = data.status;
    if (data.symptom !== undefined) this._symptom = data.symptom;
    if (data.possibleCauses !== undefined) this._possibleCauses = data.possibleCauses;
    if (data.notes !== undefined) this._notes = data.notes;
    if (data.attempts !== undefined) this._attempts = JournalEntry.buildAttempts(data.attempts);
  }

  get id(): number {
    return this._id;
  }
  get title(): string {
    return this._title;
  }
  get entryDate(): string | null {
    return this._entryDate;
  }
  get filamentId(): number | null {
    return this._filamentId;
  }
  get status(): string | null {
    return this._status;
  }
  get symptom(): string | null {
    return this._symptom;
  }
  get possibleCauses(): string | null {
    return this._possibleCauses;
  }
  get notes(): string | null {
    return this._notes;
  }
  get userId(): string {
    return this._userId;
  }
  get attempts(): JournalAttemptData[] {
    return this._attempts;
  }
  get photos(): JournalPhotoData[] {
    return this._photos;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): {
    title: string;
    entryDate: string | null;
    filamentId: number | null;
    status: string | null;
    symptom: string | null;
    possibleCauses: string | null;
    notes: string | null;
    userId: string;
  } {
    return {
      title: this._title,
      entryDate: this._entryDate,
      filamentId: this._filamentId,
      status: this._status,
      symptom: this._symptom,
      possibleCauses: this._possibleCauses,
      notes: this._notes,
      userId: this._userId,
    };
  }

  toResponse(): {
    id: number;
    title: string;
    entryDate: string | null;
    filamentId: number | null;
    status: string | null;
    symptom: string | null;
    possibleCauses: string | null;
    notes: string | null;
    createdAt: Date;
    attempts: JournalAttemptData[];
    photos: JournalPhotoData[];
  } {
    return {
      id: this._id,
      title: this._title,
      entryDate: this._entryDate,
      filamentId: this._filamentId,
      status: this._status,
      symptom: this._symptom,
      possibleCauses: this._possibleCauses,
      notes: this._notes,
      createdAt: this._createdAt,
      attempts: this._attempts,
      photos: this._photos,
    };
  }

  equals(other: JournalEntry): boolean {
    return this._id === other._id;
  }
}
