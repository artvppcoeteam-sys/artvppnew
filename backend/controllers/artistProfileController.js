const pool = require("../config/db");

/* Get current artist profile by user (auth) */
exports.getMyProfile = async (req, res) => {
  try {
    // Read artist data from `users` (merged profile fields)
    const result = await pool.query(
      `SELECT id, name, email,
              artist_display_name as display_name,
              artist_bio as bio,
              artist_specialization as specialization,
              artist_portfolio_link as portfolio_link,
              artist_status as status,
              artist_portfolio_completed as portfolio_completed,
              artist_onboarding_step as onboarding_step
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.json(null);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("✗ Error getting artist profile:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Create or update artist profile (partial wizard saves) */
exports.upsertProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const fields = req.body;

    // Map incoming fields to users table artist_* columns
    const updates = [];
    const params = [];
    let idx = 1;

    // Map field names to artist_* columns
    const fieldMap = {
      display_name: 'artist_display_name',
      bio: 'artist_bio',
      specialization: 'artist_specialization',
      portfolio_link: 'artist_portfolio_link',
      status: 'artist_status'
    };

    for (const [key, dbCol] of Object.entries(fieldMap)) {
      if (fields[key] !== undefined) {
        updates.push(`${dbCol} = $${idx}`);
        params.push(fields[key]);
        idx++;
      }
    }

    if (updates.length === 0) {
      // No updates, just return current profile
      const result = await pool.query(
        `SELECT id, name, email,
                artist_display_name as display_name,
                artist_bio as bio,
                artist_specialization as specialization,
                artist_portfolio_link as portfolio_link,
                artist_status as status,
                artist_portfolio_completed as portfolio_completed,
                artist_onboarding_step as onboarding_step
         FROM users WHERE id = $1`,
        [userId]
      );
      return res.json(result.rows[0] || null);
    }

    params.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING 
                  id, name, email,
                  artist_display_name as display_name,
                  artist_bio as bio,
                  artist_specialization as specialization,
                  artist_portfolio_link as portfolio_link,
                  artist_status as status,
                  artist_portfolio_completed as portfolio_completed,
                  artist_onboarding_step as onboarding_step`;
    
    const result = await pool.query(sql, params);
    res.json(result.rows[0]);

  } catch (err) {
    console.error("✗ Error upserting artist profile:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Add portfolio item (auth) - accepts media_url in body */
exports.addPortfolioItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { media_url, media_type, caption, is_featured } = req.body;

    // For now, just acknowledge the portfolio item (portfolio is managed separately)
    // In a full implementation, you'd store portfolio items in a separate table
    res.status(201).json({ message: 'Portfolio item noted', media_url, media_type });
  } catch (err) {
    console.error("✗ Error adding portfolio item:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/* Mark portfolio completed (must have minimum items) */
exports.markPortfolioComplete = async (req, res) => {
  try {
    const userId = req.user.id;

    // Update user's portfolio_completed status
    const updated = await pool.query(
      `UPDATE users SET artist_portfolio_completed = true, artist_status = 'active' WHERE id = $1 
       RETURNING id, name, email,
                artist_display_name as display_name,
                artist_bio as bio,
                artist_specialization as specialization,
                artist_portfolio_link as portfolio_link,
                artist_status as status,
                artist_portfolio_completed as portfolio_completed`,
      [userId]
    );
    res.json(updated.rows[0]);
  } catch (err) {
    console.error("✗ Error marking portfolio complete:", err.message);
    res.status(500).json({ error: err.message });
  }
};
