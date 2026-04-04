const pool = require('../config/db');
(async () => {
  try {
    const t = await pool.query("SELECT to_regclass('public.artist_profiles') as exists");
    console.log('artist_profiles exists:', t.rows[0].exists);
    const idx = await pool.query("SELECT to_regclass('public.idx_artist_profiles_user_id') as idx");
    console.log('index exists:', idx.rows[0].idx);
    await pool.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();