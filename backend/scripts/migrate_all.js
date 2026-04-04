require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function run() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    process.exit(0);
  }

  console.log(`Found ${files.length} migration file(s):\n`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log('');

  try {
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);

      console.log(`Executing ${file}...`);
      for (const stmt of statements) {
        await pool.query(stmt);
      }
      console.log(`✓ ${file} completed.\n`);
    }

    console.log('✓ All migrations applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('✗ Migration failed:', err.message || err);
    process.exit(1);
  }
}

run();
