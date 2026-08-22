import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runMigrations(db) {
  console.log('🔄 Checking database migrations...');

  // Ensure schema_migrations table exists
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT UNIQUE NOT NULL,
      description TEXT,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const getApplied = db.prepare('SELECT version FROM schema_migrations');
  const appliedRows = getApplied.all();
  const appliedSet = new Set(appliedRows.map(r => r.version));

  let appliedCount = 0;

  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    if (!appliedSet.has(version)) {
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      // Run each migration inside a transaction
      const applyTransaction = db.transaction(() => {
        db.exec(sqlContent);
        db.prepare('INSERT INTO schema_migrations (version, description) VALUES (?, ?)').run(version, `Applied migration ${file}`);
      });

      applyTransaction();
      console.log(`  ✅ Applied migration: ${file}`);
      appliedCount++;
    }
  }

  if (appliedCount === 0) {
    console.log('  ✨ All migrations are up to date.');
  } else {
    console.log(`  🎉 Successfully applied ${appliedCount} migration(s).`);
  }
}
