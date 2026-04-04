# ArtVPP - Student Art Marketplace Platform

> **A MERN stack e-commerce platform connecting student artists with buyers**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)


---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Contributing](#contributing)

---

## 🎨 About

**ArtVPP** is a secure, production-ready e-commerce platform built specifically for student artists to showcase and sell their artwork. The platform features a robust admin approval system, role-based access control, and comprehensive security measures.

### Key Highlights
-  **105+ RESTful API Endpoints**
-  **Admin Verification System** - All artist actions require admin approval
-  **Secure Authentication** - JWT tokens, bcrypt hashing, email verification
-  **Payment Integration** - Razorpay payment gateway
-  **Cloud Storage** - Cloudinary for image uploads
-  **Production Ready** - Complete security implementation

---

##  Features

### User Features
- Secure registration & login (email + Google OAuth)
- Email verification with OTP
- Shopping cart & wishlist
- Secure checkout with Razorpay
- Order tracking
- Like & save products
- Product reviews & ratings
- In-app notifications
- Address management
- Coupon codes

### Artist Features
- **Request-based product management** (admin approval required)
- Dashboard to view products & orders
- Track sales & analytics
- **Cannot directly edit/delete products** - all changes go through admin
- Profile edit requests (name, phone, email, location require admin approval)
- Create services (Photography, Design, etc.)
- Host workshops & classes

### Admin Features
-  User management (activate/deactivate accounts)
-  Approve/reject artist applications
-  Approve/reject product creation/edit/delete requests
-  Approve/reject artist profile updates
-  Category management
-  Coupon management
-  Review moderation
-  Dashboard with statistics
-  View all orders, products, users
-  Configure reapplication cooldown for rejected artists

---
---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account (for image storage)
- Gmail account (for sending emails)
- Razorpay account (for payments)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/atharva-pc/artvpp.git
   cd artvpp
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env based on .env.example
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

3. **Frontend Setup**
   ```bash
   cd ../frontart
   npm install
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite**
- **Tailwind CSS 4** for styling
- **React Router Dom 7** for routing
- **Framer Motion** for animations
- **Lucide React** for icons
- **Shadcn/UI** & **Radix UI** primitives

### Backend
The backend is built with Node.js and Express, following ES Modules (ESM) syntax.
- **Entry Point**: `backend/server.js` (Primary ESM entry point)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport.js
- **File Storage**: Cloudinary integration
- **Payments**: Razorpay integration
- **Nodemailer** for email notifications

---

##  Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/artvpp

# JWT Secrets (generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Frontend URL
CLIENT_URL=http://localhost:3000

# Email (Gmail)
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

##  API Documentation

Comprehensive API documentation is available at [`backend/docs/API_ENDPOINTS.md`](./backend/docs/API_ENDPOINTS.md)

### Quick Reference

| Module | Endpoints | Base Path |
|--------|-----------|-----------|
| Authentication | 10 | `/api/v1/auth` |
| User Management | 7 | `/api/v1/user` |
| Artist Applications | 10 | `/api/v1/artist` |
| Products | 12 | `/api/v1/products` |
| Cart | 5 | `/api/v1/cart` |
| Orders | 8 | `/api/v1/orders` |
| Wishlist | 6 | `/api/v1/wishlist` |
| Reviews | 9 | `/api/v1/reviews` |
| Coupons | 7 | `/api/v1/coupons` |
| Notifications | 6 | `/api/v1/notifications` |
| Services | 12 | `/api/v1/services` |
| Workshops | 13 | `/api/v1/workshops` |

**Total: 105 API Endpoints**

### Example API Call

```javascript
// Register a new user
const response = await fetch('http://localhost:5000/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123'
  })
});
```

---

##  Security Features

 **Authentication & Authorization**
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 days expiry)
- Password hashing with bcrypt (10 salt rounds)
- Email verification required
- Google OAuth integration
- Role-based access control (User, Artist, Admin)

 **Input Validation & Sanitization**
- express-validator for all inputs
- NoSQL injection prevention
- XSS protection via Helmet.js
- File type and size validation
- Request body size limits

 **Rate Limiting**
- General: 100 requests / 15 minutes
- Auth endpoints: 10 requests / 15 minutes
- Brute force protection

 **Data Protection**
- Sensitive data excluded from queries
- CORS properly configured
- Environment variables for secrets
- Sanitized error messages

 **Admin Verification System**
- All artist product actions require admin approval
- Artist profile changes require admin approval
- Email notifications on approval/rejection

See [`backend/docs/SECURITY_REPORT.md`](./backend/docs/SECURITY_REPORT.md) for complete security checklist.

---

##  Admin Approval Workflow

### Product Management Flow
```
Artist submits product → Admin Dashboard → Admin reviews → Approve/Reject → Artist notified via email
```

| Action | Artist Can Do Directly? | Requires Admin Approval? |
|--------|------------------------|-------------------------|
| Create product | ❌ | ✅ |
| Edit product | ❌ | ✅ |
| Delete product | ❌ | ✅ |
| View own products | ✅ | - |

### Profile Management Flow (Artists)
| Field | Artist Can Edit Directly? | Requires Admin Approval? |
|-------|--------------------------|-------------------------|
| Name | ❌ | ✅ |
| Phone | ❌ | ✅ |
| Email | ❌ | ✅ |
| Location/Address | ❌ | ✅ |
| Bio | ✅ | - |
| College | ✅ | - |

---

##  For Frontend Developers

### Quick Start for Tomorrow's Homepage/Products Page

#### Fetch Products
```javascript
// Get all products (public)
const fetchProducts = async () => {
  const response = await fetch('http://localhost:5000/api/v1/products?page=1&limit=12');
  const data = await response.json();
  return data.data.products;
};

// Get product categories
const fetchCategories = async () => {
  const response = await fetch('http://localhost:5000/api/v1/products/categories');
  const data = await response.json();
  return data.data.categories;
};

// Get single product
const fetchProduct = async (slug) => {
  const response = await fetch(`http://localhost:5000/api/v1/products/slug/${slug}`);
  const data = await response.json();
  return data.data.product;
};
```

#### API Response Structure
```javascript
{
  success: true,
  data: {
    products: [
      {
        _id: "...",
        title: "Sunset Mountains",
        slug: "sunset-mountains-abc123",
        description: "Beautiful oil painting...",
        images: [{ url: "https://res.cloudinary.com/..." }],
        price: 2500,
        comparePrice: 3000,
        discountPercentage: 17,
        category: "painting",
        artist: { username: "artist1", avatar: "..." },
        likesCount: 45
      }
    ],
    pagination: { total: 100, page: 1, pages: 9 }
  }
}
```

---

##  Database Schema

See [`backend/docs/DATABASE_SCHEMA.md`](./backend/docs/DATABASE_SCHEMA.md) for complete schema documentation.

### Main Collections (15 total)
- **users** - User accounts (user, artist, admin)
- **artistApplications** - Artist verification requests
- **sessions** - User session tracking
- **products** - Products with verification status
- **carts** - Shopping carts
- **orders** - Orders with payment tracking
- **wishlists** - User saved products
- **reviews** - Product reviews & ratings
- **coupons** - Discount codes
- **couponUsages** - Track coupon usage
- **notifications** - In-app notifications
- **services** - Creative services offered by artists
- **serviceBookings** - Service bookings
- **workshops** - Art workshops & classes
- **workshopRegistrations** - Workshop attendees
- **pendingActions** - Product/profile edit requests
- **categories** - Product categories (admin-managed)

---

##  Deployment

### Before Going Live

1. **Update Environment**
   ```env
   NODE_ENV=production
   CLIENT_URL=https://yourdomain.com
   ```

2. **Generate Strong Secrets**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Set up HTTPS** (SSL certificate)

4. **Update CORS Origins** in production

5. **Consider Email Provider Upgrade**
   - Gmail has 500 emails/day limit
   - Use SendGrid, Mailgun, or AWS SES for production

6. **Enable Database Backups** on MongoDB Atlas

---

<p align="center">Made with ❤️ by ArtVPP Team</p>

