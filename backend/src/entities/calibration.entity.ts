export interface CalibrationPersistenceData {
  id: number;
  slicer: string;
  filamentId?: number | null;
  status?: string | null;
  calibrationDate?: string | null;
  bedTempFirstLayer?: number | null;
  bedTempOtherLayers?: number | null;
  nozzleTempInitial?: number | null;
  nozzleTempFinal?: number | null;
  maxVolumetricSpeed?: number | null;
  pressureAdvance?: number | null;
  flowRatio?: number | null;
  retractionDistance?: number | null;
  notes?: string | null;
  createdAt?: Date;
  userId: string;
}

export interface CalibrationCreateData {
  slicer: string;
  filamentId?: number | null;
  status?: string | null;
  calibrationDate?: string | null;
  bedTempFirstLayer?: number | null;
  bedTempOtherLayers?: number | null;
  nozzleTempInitial?: number | null;
  nozzleTempFinal?: number | null;
  maxVolumetricSpeed?: number | null;
  pressureAdvance?: number | null;
  flowRatio?: number | null;
  retractionDistance?: number | null;
  notes?: string | null;
  userId: string;
}

export type CalibrationUpdateData = Partial<CalibrationCreateData>;

export class Calibration {
  private constructor(
    private readonly _id: number,
    private _slicer: string,
    private _filamentId: number | null,
    private _status: string | null,
    private _calibrationDate: string | null,
    private _bedTempFirstLayer: number | null,
    private _bedTempOtherLayers: number | null,
    private _nozzleTempInitial: number | null,
    private _nozzleTempFinal: number | null,
    private _maxVolumetricSpeed: number | null,
    private _pressureAdvance: number | null,
    private _flowRatio: number | null,
    private _retractionDistance: number | null,
    private _notes: string | null,
    private readonly _userId: string,
    private readonly _createdAt: Date = new Date(),
  ) {}

  static create(data: CalibrationCreateData): Calibration {
    const validatedSlicer = Calibration.validateSlicer(data.slicer);
    const validatedFilamentId = Calibration.validateFilamentId(data.filamentId);

    return new Calibration(
      0,
      validatedSlicer,
      validatedFilamentId,
      data.status ?? null,
      data.calibrationDate ?? null,
      data.bedTempFirstLayer ?? null,
      data.bedTempOtherLayers ?? null,
      data.nozzleTempInitial ?? null,
      data.nozzleTempFinal ?? null,
      data.maxVolumetricSpeed ?? null,
      data.pressureAdvance ?? null,
      data.flowRatio ?? null,
      data.retractionDistance ?? null,
      data.notes ?? null,
      data.userId,
    );
  }

  static fromPersistence(data: CalibrationPersistenceData): Calibration {
    return new Calibration(
      data.id,
      data.slicer,
      data.filamentId ?? null,
      data.status ?? null,
      data.calibrationDate ?? null,
      data.bedTempFirstLayer ?? null,
      data.bedTempOtherLayers ?? null,
      data.nozzleTempInitial ?? null,
      data.nozzleTempFinal ?? null,
      data.maxVolumetricSpeed ?? null,
      data.pressureAdvance ?? null,
      data.flowRatio ?? null,
      data.retractionDistance ?? null,
      data.notes ?? null,
      data.userId,
      data.createdAt || new Date(),
    );
  }

  private static validateSlicer(slicer: string): string {
    if (!slicer || typeof slicer !== 'string') {
      throw new Error('Slicer is required');
    }

    const trimmedSlicer = slicer.trim();

    if (trimmedSlicer.length === 0) {
      throw new Error('Slicer cannot be empty');
    }

    return trimmedSlicer;
  }

  private static validateFilamentId(filamentId?: number | null): number | null {
    if (filamentId === undefined || filamentId === null) return null;

    if (!Number.isInteger(filamentId) || filamentId <= 0) {
      throw new Error('Filament id must be a positive integer');
    }

    return filamentId;
  }

  update(data: CalibrationUpdateData): void {
    if (data.slicer !== undefined) this._slicer = Calibration.validateSlicer(data.slicer);
    if (data.filamentId !== undefined)
      this._filamentId = Calibration.validateFilamentId(data.filamentId);
    if (data.status !== undefined) this._status = data.status;
    if (data.calibrationDate !== undefined) this._calibrationDate = data.calibrationDate;
    if (data.bedTempFirstLayer !== undefined) this._bedTempFirstLayer = data.bedTempFirstLayer;
    if (data.bedTempOtherLayers !== undefined) this._bedTempOtherLayers = data.bedTempOtherLayers;
    if (data.nozzleTempInitial !== undefined) this._nozzleTempInitial = data.nozzleTempInitial;
    if (data.nozzleTempFinal !== undefined) this._nozzleTempFinal = data.nozzleTempFinal;
    if (data.maxVolumetricSpeed !== undefined)
      this._maxVolumetricSpeed = data.maxVolumetricSpeed;
    if (data.pressureAdvance !== undefined) this._pressureAdvance = data.pressureAdvance;
    if (data.flowRatio !== undefined) this._flowRatio = data.flowRatio;
    if (data.retractionDistance !== undefined)
      this._retractionDistance = data.retractionDistance;
    if (data.notes !== undefined) this._notes = data.notes;
  }

  get id(): number {
    return this._id;
  }
  get slicer(): string {
    return this._slicer;
  }
  get filamentId(): number | null {
    return this._filamentId;
  }
  get status(): string | null {
    return this._status;
  }
  get calibrationDate(): string | null {
    return this._calibrationDate;
  }
  get bedTempFirstLayer(): number | null {
    return this._bedTempFirstLayer;
  }
  get bedTempOtherLayers(): number | null {
    return this._bedTempOtherLayers;
  }
  get nozzleTempInitial(): number | null {
    return this._nozzleTempInitial;
  }
  get nozzleTempFinal(): number | null {
    return this._nozzleTempFinal;
  }
  get maxVolumetricSpeed(): number | null {
    return this._maxVolumetricSpeed;
  }
  get pressureAdvance(): number | null {
    return this._pressureAdvance;
  }
  get flowRatio(): number | null {
    return this._flowRatio;
  }
  get retractionDistance(): number | null {
    return this._retractionDistance;
  }
  get notes(): string | null {
    return this._notes;
  }
  get userId(): string {
    return this._userId;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  toPersistence(): Omit<CalibrationPersistenceData, 'id' | 'createdAt'> {
    return {
      slicer: this._slicer,
      filamentId: this._filamentId,
      status: this._status,
      calibrationDate: this._calibrationDate,
      bedTempFirstLayer: this._bedTempFirstLayer,
      bedTempOtherLayers: this._bedTempOtherLayers,
      nozzleTempInitial: this._nozzleTempInitial,
      nozzleTempFinal: this._nozzleTempFinal,
      maxVolumetricSpeed: this._maxVolumetricSpeed,
      pressureAdvance: this._pressureAdvance,
      flowRatio: this._flowRatio,
      retractionDistance: this._retractionDistance,
      notes: this._notes,
      userId: this._userId,
    };
  }

  toResponse(): {
    id: number;
    slicer: string;
    filamentId: number | null;
    status: string | null;
    calibrationDate: string | null;
    bedTempFirstLayer: number | null;
    bedTempOtherLayers: number | null;
    nozzleTempInitial: number | null;
    nozzleTempFinal: number | null;
    maxVolumetricSpeed: number | null;
    pressureAdvance: number | null;
    flowRatio: number | null;
    retractionDistance: number | null;
    notes: string | null;
    createdAt: Date;
  } {
    return {
      id: this._id,
      slicer: this._slicer,
      filamentId: this._filamentId,
      status: this._status,
      calibrationDate: this._calibrationDate,
      bedTempFirstLayer: this._bedTempFirstLayer,
      bedTempOtherLayers: this._bedTempOtherLayers,
      nozzleTempInitial: this._nozzleTempInitial,
      nozzleTempFinal: this._nozzleTempFinal,
      maxVolumetricSpeed: this._maxVolumetricSpeed,
      pressureAdvance: this._pressureAdvance,
      flowRatio: this._flowRatio,
      retractionDistance: this._retractionDistance,
      notes: this._notes,
      createdAt: this._createdAt,
    };
  }

  equals(other: Calibration): boolean {
    return this._id === other._id;
  }
}
