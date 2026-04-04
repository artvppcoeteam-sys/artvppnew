# ArtVPP Database Schema Documentation

> **For Frontend Developers**  
> Last Updated: February 18, 2026

---

## Overview

This document describes the MongoDB database schema for the ArtVPP e-commerce platform. Use this as a reference when building frontend components and understanding API responses.

**Total Collections**: 15

---

## Collections

### 1. Users Collection

Stores all user accounts (buyers, artists, admins).

```javascript
{
  _id: ObjectId,                    // Unique identifier
  username: String,                 // Display name (3-30 chars)
  email: String,                    // Unique, lowercase
  password: String,                 // Hashed (not returned in API)
  googleId: String,                 // For Google OAuth users
  avatar: String,                   // Profile picture URL
  
  // Role-based access
  role: "user" | "artist" | "admin", // Default: "user"
  
  // Artist application status (quick reference)
  artistRequest: {
    status: "none" | "pending" | "approved" | "rejected",
    requestedAt: Date,
    reviewedAt: Date,
    reviewedBy: ObjectId,           // Admin who reviewed
    rejectionReason: String
  },
  
  // Account status
  isVerified: Boolean,              // Email verified?
  isActive: Boolean,                // Account active?
  lastLogin: Date,
  
  // Profile info
  phone: String,                    // Required during registration (10 digits)
  bio: String,                      // Optional
  college: String,                  // Optional
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

#### User Roles Explained

| Role | Description | Permissions |
|------|-------------|-------------|
| `user` | Regular buyer (default) | Browse, buy products, like, add to cart, apply to become artist |
| `artist` | Verified seller | All user permissions + create/manage products, receive orders |
| `admin` | Administrator | All permissions + manage users, approve/reject artist applications |

---

### 2. Artist Applications Collection

Stores detailed artist application data.

```javascript
{
  _id: ObjectId,                    // Application ID
  userId: ObjectId,                 // Reference to User
  
  // Personal Information
  fullName: String,                 // Required, 3-100 chars
  profilePicture: {
    url: String,                    // Cloudinary URL
    publicId: String                // For deletion (internal use)
  },
  bio: String,                      // Required, min 15 words, 50-1000 chars
  
  // Contact Information (Primary - from user account, non-editable)
  primaryEmail: String,             // User's verified email
  primaryPhone: String,             // User's phone (if set)
  
  // Contact Information (Secondary - entered in application form)
  secondaryEmail: {
    address: String,                // Required, different from primary
    isVerified: Boolean,            // Must be true before approval
    otp: String,                    // OTP for verification (internal)
    otpExpiry: Date                 // OTP expiration (internal)
  },
  secondaryPhone: {
    number: String,                 // 10 digits, required
    isVerified: Boolean             // Phone verification (future)
  },
  
  // Address
  address: {
    street: String,                 // Required
    city: String,                   // Required
    state: String,                  // Required
    pincode: String,                // 6 digits, required
    country: String                 // Default: "India"
  },
  
  // Portfolio - 5 Artworks (REQUIRED)
  artworks: [
    {
      url: String,                  // Cloudinary URL
      publicId: String,             // For deletion
      title: String,                // Optional, max 100 chars
      description: String           // Optional, max 500 chars
    }
  ],                                // Exactly 5 items required
  
  // Social Media (all optional)
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    linkedin: String,
    youtube: String,
    behance: String,
    dribbble: String,
    other: String
  },
  
  portfolioWebsite: String,         // Optional, valid URL
  
  // Application Status
  status: "pending" | "under_review" | "approved" | "rejected",
  reviewedBy: ObjectId,             // Admin who reviewed
  reviewedAt: Date,
  rejectionReason: String,          // Optional (can be null even if rejected)
  adminNotes: String,               // Internal notes (not shown to artist)
  
  // Reapplication
  canReapplyAfter: Date,            // If rejected, cooldown period
  applicationVersion: Number,       // Increments if reapplying
  
  // Timestamps
  submittedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Application Status Flow

```
┌─────────────┐     ┌───────────────┐     ┌──────────┐
│   PENDING   │ ──► │ UNDER_REVIEW  │ ──► │ APPROVED │
└─────────────┘     └───────────────┘     └──────────┘
                           │
                           ▼
                    ┌──────────┐
                    │ REJECTED │
                    └──────────┘
                           │
                           ▼ (after cooldown)
                    ┌─────────────┐
                    │   PENDING   │ (new application)
                    └─────────────┘
```

---

### 3. Sessions Collection

Tracks user login sessions.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,                 // Reference to User
  refreshToken: String,             // JWT refresh token (not returned)
  userAgent: String,                // Browser/app info
  ipAddress: String,
  deviceType: "web" | "mobile" | "unknown",
  isActive: Boolean,
  lastActivity: Date,
  expiresAt: Date,                  // Auto-deleted after expiry
  createdAt: Date,
  updatedAt: Date
}
```

---

## Data Types Reference

### Common Response Format

All API responses follow this structure:

```javascript
{
  success: Boolean,                 // true or false
  message: String,                  // Human-readable message
  data: Object | Array | null,      // Response data
  errors: Array                     // Validation errors (if any)
}
```

### Pagination Format

List endpoints return pagination info:

```javascript
{
  success: true,
  data: {
    items: [...],                   // Array of items
    pagination: {
      total: Number,                // Total items count
      page: Number,                 // Current page
      limit: Number,                // Items per page
      pages: Number,                // Total pages
      hasMore: Boolean              // More pages available?
    }
  }
}
```

---

## Image Specifications

### Profile Picture
- **Max Size**: 5 MB
- **Formats**: JPEG, PNG, WebP
- **Dimensions**: Auto-cropped to 500x500px (face detection)
- **Storage**: Cloudinary (`artvpp/profiles/`)

### Artworks
- **Max Size**: 10 MB each
- **Formats**: JPEG, PNG, WebP
- **Count**: Exactly 5 required for artist application
- **Dimensions**: Max width 1920px (auto-scaled)
- **Storage**: Cloudinary (`artvpp/artworks/`)

---

## Validation Rules Summary

### User Registration
| Field | Rules |
|-------|-------|
| username | Required, 3-30 chars, alphanumeric + underscore only |
| email | Required, valid email format |
| password | Required, min 8 chars, must have uppercase + lowercase + number |

### Artist Application
| Field | Rules |
|-------|-------|
| fullName | Required, 3-100 chars |
| bio | Required, min 15 words, max 1000 chars |
| phone | Required, exactly 10 digits |
| email | Optional (defaults to user's email), valid format |
| street | Required |
| city | Required |
| state | Required |
| pincode | Required, exactly 6 digits |
| profilePicture | Required, single image file |
| artworks | Required, exactly 5 image files |
| socialMedia.* | Optional, max 200 chars each |
| portfolioWebsite | Optional, valid URL |

---

## Error Codes Reference

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created (new resource) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not logged in or invalid token) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### Special Error Codes (in response body)

```javascript
{
  success: false,
  message: "...",
  code: "TOKEN_EXPIRED"    // Frontend can use this to trigger refresh
}

{
  success: false,
  message: "Please verify your email before logging in",
  code: "EMAIL_NOT_VERIFIED"
}
```

---

## Notes for Frontend

1. **Token Storage**:
   - Web: Store in memory or httpOnly cookie
   - Mobile (React Native): Use `AsyncStorage` for refresh token, memory for access token

2. **Token Refresh**:
   - Access token expires in 15 minutes
   - Use refresh token to get new access token
   - If refresh fails, redirect to login

3. **File Uploads**:
   - Use `FormData` for multipart/form-data
   - Field names must match exactly: `profilePicture`, `artworks`

4. **Image URLs**:
   - All image URLs are direct Cloudinary links
   - Can add transformations via URL params if needed

5. **Dates**:
   - All dates are in ISO 8601 format (UTC)
   - Convert to local timezone on frontend

---

## Questions?

Contact the backend team:
- Check `API_ENDPOINTS.md` for API documentation
- All endpoints are prefixed with `/api/v1/`

---

## Additional Collections

### 4. Products Collection

```javascript
{
  _id: ObjectId,
  artist: ObjectId,                   // Reference to User
  title: String,                      // 3-100 chars
  slug: String,                       // URL-friendly unique identifier
  description: String,                // 20-2000 chars
  images: [{
    url: String,                      // Cloudinary URL
    publicId: String
  }],                                 // 1-5 images required
  price: Number,                      // Min ₹1
  comparePrice: Number,               // Original price for discounts
  category: String,                   // painting, sketch, digital-art, etc.
  tags: [String],                     // Search tags
  stock: Number,                      // Default: 1
  isDigital: Boolean,                 // Default: false
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: String                      // cm, inch
  },
  weight: {
    value: Number,
    unit: String                      // g, kg
  },
  status: String,                     // active, inactive, pending, rejected
  likes: [ObjectId],                  // Users who liked
  rating: {
    average: Number,                  // Auto-calculated from reviews
    count: Number
  },
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 5. Cart Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,                     // Reference to User (unique)
  items: [{
    product: ObjectId,                // Reference to Product
    quantity: Number,                 // Min: 1
    price: Number                     // Price at time of adding
  }],
  totalItems: Number,                 // Virtual field
  totalPrice: Number,                 // Virtual field
  createdAt: Date,
  updatedAt: Date
}
```

---

### 6. Orders Collection

```javascript
{
  _id: ObjectId,
  orderNumber: String,                // Unique, e.g., "ART2602ABC123"
  user: ObjectId,                     // Reference to User
  items: [{
    product: ObjectId,
    artist: ObjectId,
    title: String,
    image: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  subtotal: Number,
  shippingCost: Number,
  tax: Number,
  discount: Number,
  total: Number,
  coupon: {
    code: String,
    discountType: String,
    discountValue: Number,
    discountApplied: Number
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  status: String,                     // pending, confirmed, processing, shipped, delivered, cancelled, refunded
  payment: {
    method: String,                   // razorpay, cod, upi
    status: String,                   // pending, completed, failed, refunded
    razorpayOrderId: String,
    razorpayPaymentId: String
  },
  shipping: {
    courier: String,
    trackingNumber: String,
    trackingUrl: String,
    shippedAt: Date,
    deliveredAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

### 7. Wishlist Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,                     // Reference to User (unique)
  products: [ObjectId],               // Array of Product references
  createdAt: Date,
  updatedAt: Date
}
```

---

### 8. Reviews Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,                     // Reference to User
  product: ObjectId,                  // Reference to Product
  rating: Number,                     // 1-5 stars
  title: String,                      // Review title
  comment: String,                    // Review body
  images: [String],                   // Optional review images
  isVerifiedPurchase: Boolean,        // Auto-set if user bought product
  helpfulVotes: [{
    user: ObjectId,
    votedAt: Date
  }],
  helpfulCount: Number,
  status: String,                     // pending, approved, rejected
  rejectionReason: String,
  reviewedBy: ObjectId,               // Admin who moderated
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 9. Coupons Collection

```javascript
{
  _id: ObjectId,
  code: String,                       // Unique, uppercase
  description: String,
  type: String,                       // percentage, fixed
  value: Number,                      // Discount amount/percentage
  minOrderValue: Number,              // Minimum cart value
  maxDiscount: Number,                // Cap for percentage coupons
  usageLimit: Number,                 // Total uses allowed
  usedCount: Number,                  // Times used
  userUsageLimit: Number,             // Per user limit
  validFrom: Date,
  validUntil: Date,
  applicableFor: {
    categories: [String],
    products: [ObjectId],
    artists: [ObjectId]
  },
  applicableUsers: {
    users: [ObjectId],
    newUsersOnly: Boolean
  },
  isActive: Boolean,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 10. Coupon Usage Collection

```javascript
{
  _id: ObjectId,
  coupon: ObjectId,                   // Reference to Coupon
  user: ObjectId,                     // Reference to User
  order: ObjectId,                    // Reference to Order
  discountApplied: Number,
  createdAt: Date
}
```

---

### 11. Notifications Collection

```javascript
{
  _id: ObjectId,
  user: ObjectId,                     // Reference to User
  type: String,                       // order, artist, review, wishlist, message, system
  title: String,
  message: String,
  link: String,                       // URL to navigate to
  data: Object,                       // Additional metadata
  isRead: Boolean,                    // Default: false
  createdAt: Date
}
```

**Notification Types**:
- `order` - Order placed, shipped, delivered, cancelled
- `artist` - Application approved/rejected, product status
- `review` - Review approved/rejected
- `wishlist` - Price drop, back in stock
- `message` - Direct messages
- `system` - Announcements

---

### 12. Services Collection

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,                       // Unique
  description: String,
  category: String,                   // Media Services, Display Art, etc.
  icon: String,                       // Emoji or icon name
  images: [{
    url: String,
    publicId: String
  }],
  artist: ObjectId,                   // Service provider
  startingPrice: Number,
  pricing: [{
    name: String,                     // Basic, Standard, Premium, Custom
    price: Number,
    features: [String],
    deliveryTime: String
  }],
  deliveryTime: String,
  features: [String],
  customizable: Boolean,
  status: String,                     // pending, active, rejected
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 13. Service Bookings Collection

```javascript
{
  _id: ObjectId,
  bookingNumber: String,              // Unique
  service: ObjectId,                  // Reference to Service
  customer: ObjectId,                 // Reference to User
  artist: ObjectId,                   // Reference to User
  pricingTier: String,                // Basic, Standard, Premium, Custom
  price: Number,
  requirements: String,               // Customer's project details
  attachments: [String],              // Customer uploaded files
  status: String,                     // pending, confirmed, in_progress, completed, cancelled
  scheduledDate: Date,
  completedAt: Date,
  payment: {
    status: String,
    method: String,
    paidAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

### 14. Workshops Collection

```javascript
{
  _id: ObjectId,
  title: String,
  slug: String,                       // Unique
  description: String,
  instructor: ObjectId,               // Reference to User (artist)
  instructorName: String,
  images: [{
    url: String,
    publicId: String
  }],
  price: Number,                      // 0 for free workshops
  originalPrice: Number,
  duration: String,                   // "2 days (6 hours)"
  totalHours: Number,
  level: String,                      // Beginner, Intermediate, Advanced, All Levels
  startDate: Date,
  endDate: Date,
  schedule: [{
    day: String,
    time: String,
    topics: [String]
  }],
  maxSpots: Number,
  bookedSpots: Number,
  locationType: String,               // online, offline, hybrid
  location: {
    venue: String,
    address: String,
    city: String,
    meetingLink: String               // For online workshops
  },
  whatYouWillLearn: [String],
  requirements: [String],
  materialsProvided: Boolean,
  materialsList: [String],
  certificateOffered: Boolean,
  status: String,                     // pending, approved, rejected, completed
  views: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 15. Workshop Registrations Collection

```javascript
{
  _id: ObjectId,
  registrationNumber: String,         // Unique
  workshop: ObjectId,                 // Reference to Workshop
  user: ObjectId,                     // Reference to User
  instructor: ObjectId,               // Reference to User
  status: String,                     // registered, cancelled, completed
  payment: {
    status: String,
    method: String,
    amount: Number,
    paidAt: Date
  },
  attended: Boolean,                  // For attendance tracking
  certificateIssued: Boolean,
  certificateUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

### Pending Actions Collection

```javascript
{
  _id: ObjectId,
  actionType: String,                 // product_create, product_edit, product_delete, profile_edit
  userId: ObjectId,                   // Artist who requested
  productId: ObjectId,                // For product actions
  data: Object,                       // The requested changes
  images: [{
    url: String,
    publicId: String
  }],
  status: String,                     // pending, approved, rejected
  reviewedBy: ObjectId,               // Admin
  reviewedAt: Date,
  rejectionReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

### Categories Collection

```javascript
{
  _id: ObjectId,
  name: String,                       // Unique
  slug: String,
  description: String,
  image: {
    url: String,
    publicId: String
  },
  parentCategory: ObjectId,           // For subcategories
  isActive: Boolean,
  displayOrder: Number,
  productCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Collections Summary

| Collection | Purpose | Indexed Fields |
|------------|---------|----------------|
| users | User accounts | email, googleId, role, artistRequest.status |
| artistApplications | Artist verification | userId, status |
| sessions | Login sessions | userId, refreshToken |
| products | Product listings | artist, category, status, slug |
| carts | Shopping carts | user |
| orders | Order tracking | user, orderNumber, status |
| wishlists | Saved products | user |
| reviews | Product ratings | user, product, status |
| coupons | Discount codes | code, isActive |
| couponUsages | Coupon tracking | coupon, user |
| notifications | In-app alerts | user, isRead |
| services | Creative services | artist, category, status, slug |
| serviceBookings | Service orders | customer, artist, service |
| workshops | Art workshops | instructor, status, slug |
| workshopRegistrations | Workshop attendees | workshop, user |
| pendingActions | Approval queue | userId, actionType, status |
| categories | Product categories | slug, isActive |

