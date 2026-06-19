import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { initSql } from './schema.js';
import { seedDatabase } from './mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '../..');
const dataDir = path.join(projectRoot, 'data');
const dbPath = path.join(dataDir, 'app.db');

let dbInstance: Database.Database | null = null;

function ensureDataDir(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function initializeDatabase(db: Database.Database): void {
  db.exec(initSql);
  seedDatabase(db);
}

export function getDb(): Database.Database {
  if (!dbInstance) {
    ensureDataDir();
    dbInstance = new Database(dbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initializeDatabase(dbInstance);
  }
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export { dbPath };
