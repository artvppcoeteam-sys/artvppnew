const pool = require('../config/db');
(async () => {
  try {
    console.log('Altering artist_profiles table...');
    await pool.query(`ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS specialization TEXT;`);
    await pool.query(`ALTER TABLE artist_profiles ADD COLUMN IF NOT EXISTS portfolio_link TEXT;`);
    console.log('Columns added (if they were missing).');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error altering table:', err.message || err);
    process.exit(1);
  }
})();
