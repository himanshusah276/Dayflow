import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { runMigrations } from '../database/migrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'dayflow.db');

let db;

try {
  // Use Node.js built-in high-performance SQLite (Node 22+)
  const { DatabaseSync } = await import('node:sqlite');
  db = new DatabaseSync(dbPath);

  // Add transaction wrapper method
  db.transaction = (fn) => {
    return (...args) => {
      db.exec('BEGIN');
      try {
        const result = fn(...args);
        db.exec('COMMIT');
        return result;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    };
  };

  // Add pragma helper
  db.pragma = (pragmaStr) => {
    db.exec(`PRAGMA ${pragmaStr}`);
  };

  // Helper to sanitize parameters: convert undefined to null
  const sanitizeParams = (params) => {
    return params.map(p => (p === undefined ? null : p));
  };

  // Wrap statement methods to ensure parameters are sanitized and lastInsertRowid is BigInt-safe
  const originalPrepare = db.prepare.bind(db);
  db.prepare = (sql) => {
    const stmt = originalPrepare(sql);
    const origRun = stmt.run.bind(stmt);
    const origGet = stmt.get.bind(stmt);
    const origAll = stmt.all.bind(stmt);

    stmt.run = (...params) => {
      const cleanParams = sanitizeParams(params);
      const res = origRun(...cleanParams);
      if (res && typeof res.lastInsertRowid === 'bigint') {
        res.lastInsertRowid = Number(res.lastInsertRowid);
      }
      return res;
    };

    stmt.get = (...params) => {
      const cleanParams = sanitizeParams(params);
      return origGet(...cleanParams);
    };

    stmt.all = (...params) => {
      const cleanParams = sanitizeParams(params);
      return origAll(...cleanParams);
    };

    return stmt;
  };

} catch (e) {
  // Fallback to better-sqlite3
  const { default: Database } = await import('better-sqlite3');
  db = new Database(dbPath);
}

// Enable foreign keys & WAL mode for high concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run pending migrations
runMigrations(db);

export default db;
