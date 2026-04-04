const express = require('express');
const router = express.Router();
const pool = require('../config/db');

/* DEMO: Seed database with test data */
router.post('/seed', async (req, res) => {
  try {
    // Create demo users if they don't exist
    const demoUsers = [
      { id: 'demo-artist-1', email: 'artist1@demo.com', password: 'demo123', role: 'artist' },
      { id: 'demo-artist-2', email: 'artist2@demo.com', password: 'demo123', role: 'artist' },
      { id: 'demo-customer-1', email: 'customer1@demo.com', password: 'demo123', role: 'customer' },
      { id: 'demo-admin', email: 'admin@demo.com', password: 'demo123', role: 'admin' },
    ];

    for (const user of demoUsers) {
      await pool.query(
        `INSERT INTO users (id, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.email, user.password, user.role]
      );
    }

    // Create demo artist profiles
    const artistProfiles = [
      {
        id: 'profile-1',
        user_id: 'demo-artist-1',
        display_name: 'Luna - Digital Artist',
        bio: 'Specializing in anime and fantasy art. 5 years experience with digital illustration.',
        country: 'USA',
        languages: JSON.stringify(['English', 'Spanish']),
        years_experience: 5,
        styles: JSON.stringify(['Anime', 'Fantasy', 'Character Design']),
        mediums: JSON.stringify(['Digital']),
        typical_delivery_days: 7,
        accepts_custom_requests: true,
        accepts_rush: true,
        portfolio_completed: true,
        status: 'active',
      },
      {
        id: 'profile-2',
        user_id: 'demo-artist-2',
        display_name: 'Alex - Realistic Painter',
        bio: 'Oil and acrylic paintings. Portraits, landscapes, still life. 8 years professional.',
        country: 'Canada',
        languages: JSON.stringify(['English', 'French']),
        years_experience: 8,
        styles: JSON.stringify(['Realistic', 'Classical', 'Landscape']),
        mediums: JSON.stringify(['Oil', 'Acrylic', 'Watercolor']),
        typical_delivery_days: 14,
        accepts_custom_requests: true,
        accepts_rush: false,
        portfolio_completed: true,
        status: 'active',
      },
    ];

    for (const profile of artistProfiles) {
      await pool.query(
        `INSERT INTO artist_profiles (
          id, user_id, display_name, bio, country, languages, years_experience, 
          styles, mediums, typical_delivery_days, accepts_custom_requests, 
          accepts_rush, portfolio_completed, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (user_id) DO NOTHING`,
        [
          profile.id, profile.user_id, profile.display_name, profile.bio, profile.country,
          profile.languages, profile.years_experience, profile.styles, profile.mediums,
          profile.typical_delivery_days, profile.accepts_custom_requests, profile.accepts_rush,
          profile.portfolio_completed, profile.status
        ]
      );
    }

    // Add demo portfolio items
    const portfolioItems = [
      { artist_profile_id: 'profile-1', media_url: 'https://via.placeholder.com/400x300?text=Anime+Character', media_type: 'image' },
      { artist_profile_id: 'profile-1', media_url: 'https://via.placeholder.com/400x300?text=Fantasy+Scene', media_type: 'image' },
      { artist_profile_id: 'profile-1', media_url: 'https://via.placeholder.com/400x300?text=Character+Design', media_type: 'image' },
      { artist_profile_id: 'profile-2', media_url: 'https://via.placeholder.com/400x300?text=Portrait', media_type: 'image' },
      { artist_profile_id: 'profile-2', media_url: 'https://via.placeholder.com/400x300?text=Landscape', media_type: 'image' },
      { artist_profile_id: 'profile-2', media_url: 'https://via.placeholder.com/400x300?text=Still+Life', media_type: 'image' },
    ];

    for (const item of portfolioItems) {
      await pool.query(
        `INSERT INTO artist_portfolio (artist_profile_id, media_url, media_type)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [item.artist_profile_id, item.media_url, item.media_type]
      );
    }

    // Create demo services
    const demoServices = [
      {
        id: 'service-1',
        artist_id: 'demo-artist-1',
        title: 'Anime Character Commission',
        description: 'Custom anime character design with full body illustration. Perfect for OCs, fan art, or game characters. Includes color, shading, and background options.',
        art_type: 'Digital',
        style: 'Anime',
        medium: 'Digital',
        base_price: 75,
        delivery_days: 7,
        revisions: 2,
        status: 'approved',
      },
      {
        id: 'service-2',
        artist_id: 'demo-artist-1',
        title: 'Portrait Commission',
        description: 'Realistic digital portrait from your photo. High quality, detailed, professional. Great for profile pictures, gifts, or portfolio.',
        art_type: 'Digital',
        style: 'Realistic',
        medium: 'Digital',
        base_price: 100,
        delivery_days: 5,
        revisions: 3,
        status: 'approved',
      },
      {
        id: 'service-3',
        artist_id: 'demo-artist-2',
        title: 'Oil Painting Portrait',
        description: 'Hand-painted oil portrait on canvas. Classic, timeless, professional quality. Perfect for special occasions or treasured memories.',
        art_type: 'Traditional',
        style: 'Realistic',
        medium: 'Oil',
        base_price: 250,
        delivery_days: 14,
        revisions: 1,
        status: 'approved',
      },
      {
        id: 'service-4',
        artist_id: 'demo-artist-2',
        title: 'Landscape Painting',
        description: 'Custom landscape painting in watercolor or acrylic. Any location, any style. Perfect for home decor.',
        art_type: 'Traditional',
        style: 'Landscape',
        medium: 'Acrylic',
        base_price: 150,
        delivery_days: 10,
        revisions: 2,
        status: 'approved',
      },
    ];

    for (const svc of demoServices) {
      await pool.query(
        `INSERT INTO service_listings (
          id, artist_id, title, description, art_type, style, medium, 
          base_price, delivery_days, revisions, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING`,
        [
          svc.id, svc.artist_id, svc.title, svc.description, svc.art_type, svc.style,
          svc.medium, svc.base_price, svc.delivery_days, svc.revisions, svc.status
        ]
      );
    }

    // Create demo packages for each service
    const packages = [
      { service_id: 'service-1', package_name: 'Basic', price: 50, delivery_days: 10, revisions: 1 },
      { service_id: 'service-1', package_name: 'Standard', price: 75, delivery_days: 7, revisions: 2 },
      { service_id: 'service-1', package_name: 'Premium', price: 120, delivery_days: 5, revisions: 5 },
      { service_id: 'service-2', package_name: 'Basic', price: 75, delivery_days: 7, revisions: 2 },
      { service_id: 'service-2', package_name: 'Standard', price: 100, delivery_days: 5, revisions: 3 },
      { service_id: 'service-2', package_name: 'Premium', price: 150, delivery_days: 3, revisions: 5 },
      { service_id: 'service-3', package_name: 'Standard', price: 250, delivery_days: 14, revisions: 1 },
      { service_id: 'service-3', package_name: 'Premium', price: 400, delivery_days: 10, revisions: 2 },
      { service_id: 'service-4', package_name: 'Standard', price: 150, delivery_days: 10, revisions: 2 },
      { service_id: 'service-4', package_name: 'Premium', price: 250, delivery_days: 7, revisions: 3 },
    ];

    for (const pkg of packages) {
      await pool.query(
        `INSERT INTO service_packages (service_id, package_name, price, delivery_days, revisions)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [pkg.service_id, pkg.package_name, pkg.price, pkg.delivery_days, pkg.revisions]
      );
    }

    // Create demo add-ons
    const addons = [
      { service_id: 'service-1', title: 'Rush Delivery (3 days)', price: 25 },
      { service_id: 'service-1', title: 'Extra Revisions (2 more)', price: 20 },
      { service_id: 'service-2', title: 'Rush Delivery (2 days)', price: 30 },
      { service_id: 'service-2', title: 'Background Included', price: 50 },
      { service_id: 'service-3', title: 'Premium Canvas', price: 100 },
      { service_id: 'service-4', title: 'Framing Service', price: 75 },
    ];

    res.json({ 
      message: 'Demo data seeded successfully!',
      artists: artistProfiles.length
    });
  } catch (err) {
    console.error('Seed error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
