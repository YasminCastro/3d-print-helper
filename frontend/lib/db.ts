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
    CREATE TABLE IF NOT EXISTS print_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      printer_id INTEGER NOT NULL,
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

  return database;
}

// Reused across hot-reloads in dev so we don't open a new connection per edit.
const globalForDb = globalThis as unknown as { db?: Database.Database };

export const db = globalForDb.db ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
