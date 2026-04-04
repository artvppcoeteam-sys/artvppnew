const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

/* Upload a single file to Cloudinary and return the URL */
const uploadBufferToCloudinary = async (buffer, mimetype, folder) => {
  if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
    throw new Error('Cloudinary not configured');
  }
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimetype};base64,${base64}`;
  const res = await cloudinary.uploader.upload(dataUri, { folder });
  return res.secure_url || res.url;
};

exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype, 'artist_profile_photos');
    // Optionally update artist_profiles.profile_photo here, but frontend will call upsert
    res.json({ url });
  } catch (err) {
    console.error('✗ Error uploading profile photo:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.uploadPortfolioItem = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await uploadBufferToCloudinary(req.file.buffer, req.file.mimetype, 'artist_portfolio');

    // Insert into artist_portfolio table
    const profileRes = await pool.query('SELECT id FROM artist_profiles WHERE user_id = $1', [req.user.id]);
    if (profileRes.rows.length === 0) return res.status(400).json({ error: 'Artist profile not found' });
    const profileId = profileRes.rows[0].id;

    const insert = await pool.query(
      `INSERT INTO artist_portfolio (artist_profile_id, media_url, media_type) VALUES ($1,$2,$3) RETURNING *`,
      [profileId, url, req.file.mimetype.startsWith('video/') ? 'video' : 'image']
    );

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error('✗ Error uploading portfolio item:', err.message);
    res.status(500).json({ error: err.message });
  }
};
// uploadServiceMedia removed (service feature deleted)
