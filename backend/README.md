# ArtVPP Backend

Backend API for ArtVPP - Student Art Marketplace Platform

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Documentation

- **API Endpoints**: See `docs/API_ENDPOINTS.md`
- **Database Schema**: See `docs/DATABASE_SCHEMA.md`
- **Security Report**: See `docs/SECURITY_REPORT.md`

## API Base URL

```
http://localhost:5000/api/v1
```

## Key Features

- ✅ 105+ RESTful API endpoints
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (User, Artist, Admin)
- ✅ Admin approval system for all artist actions
- ✅ Razorpay payment integration
- ✅ Cloudinary image storage
- ✅ Email notifications (Nodemailer)
- ✅ Google OAuth integration
- ✅ Wishlist, Reviews, Coupons, Notifications
- ✅ Services & Workshops system
- ✅ Production-ready security

