import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "print-helper.db");

function createConnection() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const database = new Database(DB_PATH);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
    CREATE TABLE IF NOT EXISTS printers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      model TEXT,
      brand TEXT,
      power_consumption_w REAL,
      maintenance_cost_per_hour REAL,
      purchase_price REAL,
      lifespan_hours INTEGER,
      energy_cost_per_kwh REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS filament_brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      where_to_buy TEXT,
      avg_price_min REAL,
      avg_price_max REAL,
      cost_benefit TEXT,
      filament_types TEXT,
      best_colors TEXT,
      purchased INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS filaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      availability TEXT,
      last_purchase_date TEXT,
      material TEXT,
      brand_id INTEGER REFERENCES filament_brands(id) ON DELETE SET NULL,
      purchase_link TEXT,
      sale_name TEXT,
      min_price_paid REAL,
      max_price_paid REAL,
      nozzle_temp_min INTEGER,
      nozzle_temp_max INTEGER,
      bed_temp_min INTEGER,
      bed_temp_max INTEGER,
      purchase_batch TEXT,
      rating INTEGER,
      color TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS calibrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slicer TEXT NOT NULL,
      filament_id INTEGER REFERENCES filaments(id) ON DELETE CASCADE,
      status TEXT,
      calibration_date TEXT,
      bed_temp_first_layer REAL,
      bed_temp_other_layers REAL,
      nozzle_temp_initial REAL,
      nozzle_temp_final REAL,
      max_volumetric_speed REAL,
      pressure_advance REAL,
      flow_ratio REAL,
      retraction_distance REAL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS print_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      material TEXT,
      nozzle_temp INTEGER,
      bed_temp INTEGER,
      print_speed INTEGER,
      layer_height REAL,
      retraction_distance REAL,
      retraction_speed REAL,
      fan_speed INTEGER,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const printerColumns = database
    .prepare("PRAGMA table_info(printers)")
    .all() as { name: string }[];
  const existingColumns = new Set(printerColumns.map((column) => column.name));

  const newPrinterColumns: Record<string, string> = {
    brand: "TEXT",
    power_consumption_w: "REAL",
    maintenance_cost_per_hour: "REAL",
    purchase_price: "REAL",
    lifespan_hours: "INTEGER",
    energy_cost_per_kwh: "REAL",
  };

  for (const [column, type] of Object.entries(newPrinterColumns)) {
    if (!existingColumns.has(column)) {
      database.exec(`ALTER TABLE printers ADD COLUMN ${column} ${type}`);
    }
  }

  const brandColumns = database
    .prepare("PRAGMA table_info(filament_brands)")
    .all() as { name: string }[];
  const existingBrandColumns = new Set(brandColumns.map((column) => column.name));

  if (!existingBrandColumns.has("filament_types")) {
    database.exec("ALTER TABLE filament_brands ADD COLUMN filament_types TEXT");
  }

  if (!existingBrandColumns.has("best_colors")) {
    database.exec("ALTER TABLE filament_brands ADD COLUMN best_colors TEXT");
  }

  if (!existingBrandColumns.has("purchased")) {
    database.exec("ALTER TABLE filament_brands ADD COLUMN purchased INTEGER");
  }

  const filamentColumns = database
    .prepare("PRAGMA table_info(filaments)")
    .all() as { name: string }[];
  const existingFilamentColumns = new Set(filamentColumns.map((column) => column.name));

  if (!existingFilamentColumns.has("brand_id")) {
    database.exec(
      "ALTER TABLE filaments ADD COLUMN brand_id INTEGER REFERENCES filament_brands(id)"
    );
  }

  if (!existingFilamentColumns.has("rating")) {
    database.exec("ALTER TABLE filaments ADD COLUMN rating INTEGER");
  }

  if (!existingFilamentColumns.has("color")) {
    database.exec("ALTER TABLE filaments ADD COLUMN color TEXT");
  }

  if (!existingFilamentColumns.has("availability")) {
    database.exec("ALTER TABLE filaments ADD COLUMN availability TEXT");
  }

  const calibrationColumns = database
    .prepare("PRAGMA table_info(calibrations)")
    .all() as { name: string }[];
  const existingCalibrationColumns = new Set(calibrationColumns.map((column) => column.name));

  const newCalibrationColumns: Record<string, string> = {
    bed_temp_first_layer: "REAL",
    bed_temp_other_layers: "REAL",
    nozzle_temp_initial: "REAL",
    nozzle_temp_final: "REAL",
    max_volumetric_speed: "REAL",
    pressure_advance: "REAL",
    flow_ratio: "REAL",
    retraction_distance: "REAL",
    notes: "TEXT",
  };

  for (const [column, type] of Object.entries(newCalibrationColumns)) {
    if (!existingCalibrationColumns.has(column)) {
      database.exec(`ALTER TABLE calibrations ADD COLUMN ${column} ${type}`);
    }
  }

  return database;
}

// Reused across hot-reloads in dev so we don't open a new connection per edit.
const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db = globalForDb.db ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
