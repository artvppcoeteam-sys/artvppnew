const pool = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ message: 'Not authenticated' });

    const result = await pool.query('SELECT role, artist_status FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(401).json({ message: 'User not found' });

    const user = result.rows[0];
    if (user.role === 'artist' || user.artist_status === 'approved') return next();

    return res.status(403).json({ message: 'Artist access required' });
  } catch (err) {
    console.error('requireArtist error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
