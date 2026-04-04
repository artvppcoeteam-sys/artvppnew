const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function run() {
  const file = path.join(__dirname, '..', 'migrations', '20260208_add_order_columns.sql');

    if (!fs.existsSync(file)) {
      console.error('Migration file not found:', file);
      process.exit(1);
    }

    const sql = fs.readFileSync(file, 'utf8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      for (const stmt of statements) {
        await pool.query(stmt);
      }
      console.log('Migration applied successfully.');
      process.exit(0);
    } catch (err) {
      console.error('Migration failed:', err.message || err);
      process.exit(1);
    }
    }

  run();
