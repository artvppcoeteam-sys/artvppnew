# ArtVPP API Endpoints Documentation

> **For Frontend Developers**  
> Last Updated: February 18, 2026  
> Base URL: `http://localhost:5000/api/v1`

---

## Quick Reference

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/auth` | Login, register, password reset |
| User | `/user` | Profile & address management |
| Artist | `/artist` | Artist application flow |
| Products | `/products` | Product CRUD & browsing |
| Cart | `/cart` | Shopping cart management |
| Orders | `/orders` | Order creation & management |
| Wishlist | `/wishlist` | Save products for later |
| Reviews | `/reviews` | Product reviews & ratings |
| Coupons | `/coupons` | Discount codes |
| Notifications | `/notifications` | In-app notifications |
| Services | `/services` | Creative services (Photography, etc.) |
| Workshops | `/workshops` | Art workshops & classes |

---

## Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Token Types
- **Access Token**: Short-lived (15 min), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access tokens

---

## 📘 Auth Endpoints (`/api/v1/auth`)

### Register User

```http
POST /api/v1/auth/register
```

**Rate Limit**: 10 requests / 15 minutes

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "9876543210"
}
```

**Validation Rules**:
- `username`: 3-30 characters, letters, numbers, underscores only
- `email`: Valid email format (dots and + addressing preserved)
- `password`: Min 8 chars, must contain uppercase, lowercase, and number
- `phone`: Exactly 10 digits

**Success Response** (201):
```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "email": "john@example.com",
    "username": "john_doe"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

---

### Verify Email

```http
POST /api/v1/auth/verify-email
```

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login."
}
```

---

### Resend Verification Email

```http
POST /api/v1/auth/resend-verification
```

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Verification email sent! Please check your inbox."
}
```

---

### Login

```http
POST /api/v1/auth/login
```

**Rate Limit**: 10 requests / 15 minutes

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Welcome back, john_doe!",
  "data": {
    "user": {
      "_id": "65abc123...",
      "username": "john_doe",
      "email": "john@example.com",
      "avatar": null,
      "role": "user",
      "isVerified": true,
      "artistRequest": {
        "status": "none"
      },
      "createdAt": "2026-02-10T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response** (403):
```json
{
  "success": false,
  "message": "Please verify your email before logging in",
  "code": "EMAIL_NOT_VERIFIED"
}
```

---

### Refresh Token

```http
POST /api/v1/auth/refresh-token
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Forgot Password

```http
POST /api/v1/auth/forgot-password
```

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent to your email. Valid for 10 minutes."
}
```

---

### Verify OTP

```http
POST /api/v1/auth/verify-otp/:email
```

**URL Params**: `email` - User's email

**Request Body**:
```json
{
  "otp": "123456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password."
}
```

---

### Reset Password

```http
POST /api/v1/auth/reset-password/:email
```

**URL Params**: `email` - User's email

**Request Body**:
```json
{
  "newPassword": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password reset successfully. Please login with your new password."
}
```

---

### Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "_id": "65abc123...",
      "username": "john_doe",
      "email": "john@example.com",
      "avatar": "https://res.cloudinary.com/...",
      "role": "user",
      "isVerified": true,
      "artistRequest": {
        "status": "pending",
        "requestedAt": "2026-02-12T14:00:00.000Z"
      }
    }
  }
}
```

---

### Google OAuth Login

```http
GET /api/v1/auth/google
```

**Usage**: Redirect user to this URL. After Google login, user is redirected to:
- Success: `{CLIENT_URL}/auth-success?token=<jwt_token>`
- Failure: `{CLIENT_URL}/login?error=google_failed`

---

## 📘 User Endpoints (`/api/v1/user`)

### Update Profile

```http
PUT /api/v1/user/profile
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body** (all optional):
```json
{
  "username": "john_updated",
  "bio": "Digital artist specializing in portraits",
  "phone": "9876543210",
  "college": "Art College Mumbai"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### Change Password (When Logged In)

```http
PUT /api/v1/user/change-password
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

---

## 📘 Artist Application Endpoints (`/api/v1/artist`)

### Submit Artist Application

```http
POST /api/v1/artist/apply
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Required Access**: User must be verified (`isVerified: true`)

**Form Data Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `profilePicture` | File | ✅ | Single image (max 10MB) |
| `artworks` | File[] | ✅ | Exactly 5 images (max 10MB each) |
| `fullName` | String | ✅ | 3-100 characters |
| `bio` | String | ✅ | Min 15 words, 50-1000 chars |
| `secondaryPhone` | String | ✅ | 10 digits (different from primary) |
| `secondaryEmail` | String | ✅ | Business email (different from primary) |
| `street` | String | ✅ | Street address |
| `city` | String | ✅ | City |
| `state` | String | ✅ | State |
| `pincode` | String | ✅ | 6 digits |
| `country` | String | ❌ | Default: "India" |
| `instagram` | String | ❌ | Instagram URL/handle |
| `twitter` | String | ❌ | Twitter URL/handle |
| `facebook` | String | ❌ | Facebook URL |
| `linkedin` | String | ❌ | LinkedIn URL |
| `youtube` | String | ❌ | YouTube URL |
| `behance` | String | ❌ | Behance URL |
| `dribbble` | String | ❌ | Dribbble URL |
| `otherSocial` | String | ❌ | Any other social link |
| `portfolioWebsite` | String | ❌ | Portfolio website URL |
| `artworkTitles` | String | ❌ | JSON array: `["Title1", "Title2", ...]` |
| `artworkDescriptions` | String | ❌ | JSON array: `["Desc1", "Desc2", ...]` |

**Note**: Primary email and phone are automatically taken from the user's account.

**JavaScript Example** (Web):
```javascript
const formData = new FormData();

// Single file
formData.append('profilePicture', profilePicFile);

// Multiple files (exactly 5)
artworkFiles.forEach(file => {
  formData.append('artworks', file);
});

// Text fields
formData.append('fullName', 'John Doe');
formData.append('bio', 'I am a digital artist with 5 years of experience creating unique artworks...');
formData.append('secondaryPhone', '9876543210');
formData.append('secondaryEmail', 'johndoe.business@example.com');
formData.append('street', '123 Art Street');
formData.append('city', 'Mumbai');
formData.append('state', 'Maharashtra');
formData.append('pincode', '400001');
formData.append('instagram', 'https://instagram.com/johndoe');

// Optional: artwork titles/descriptions
formData.append('artworkTitles', JSON.stringify(['Sunset', 'Portrait', 'Abstract', 'Nature', 'City']));

const response = await fetch('/api/v1/artist/apply', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  },
  body: formData
});
```

**React Native Example**:
```javascript
const formData = new FormData();

formData.append('profilePicture', {
  uri: profilePic.uri,
  type: 'image/jpeg',
  name: 'profile.jpg'
});

artworks.forEach((artwork, index) => {
  formData.append('artworks', {
    uri: artwork.uri,
    type: 'image/jpeg',
    name: `artwork_${index}.jpg`
  });
});

formData.append('fullName', 'John Doe');
// ... other fields

const response = await fetch(`${API_URL}/artist/apply`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Application submitted successfully! Please verify your email.",
  "data": {
    "applicationId": "65def456...",
    "status": "pending",
    "emailVerified": false,
    "submittedAt": "2026-02-13T10:00:00.000Z"
  }
}
```

**Error Responses**:
```json
// Already an artist
{
  "success": false,
  "message": "You are already an artist"
}

// Pending application exists
{
  "success": false,
  "message": "You already have a pending application"
}

// Cooldown period
{
  "success": false,
  "message": "You can reapply after 03/15/2026",
  "data": {
    "canReapplyAfter": "2026-03-15T00:00:00.000Z"
  }
}

// Wrong number of artworks
{
  "success": false,
  "message": "Exactly 5 artworks are required. You uploaded 3"
}
```

---

### Send Email OTP

```http
POST /api/v1/artist/send-email-otp
Authorization: Bearer <access_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "OTP sent to your email. Valid for 10 minutes.",
  "data": {
    "email": "jo***@example.com"
  }
}
```

---

### Verify Email OTP

```http
POST /api/v1/artist/verify-email-otp
Authorization: Bearer <access_token>
```

**Request Body**:
```json
{
  "otp": "123456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Email verified successfully! Your application is now under review.",
  "data": {
    "applicationId": "65def456...",
    "status": "pending",
    "emailVerified": true
  }
}
```

---

### Get My Application Status

```http
GET /api/v1/artist/my-application
Authorization: Bearer <access_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Application fetched successfully",
  "data": {
    "hasApplication": true,
    "application": {
      "_id": "65def456...",
      "userId": "65abc123...",
      "fullName": "John Doe",
      "profilePicture": {
        "url": "https://res.cloudinary.com/..."
      },
      "bio": "I am a digital artist...",
      "phone": {
        "number": "9876543210",
        "isVerified": false
      },
      "email": {
        "address": "john@example.com",
        "isVerified": true
      },
      "address": {
        "street": "123 Art Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      },
      "artworks": [
        {
          "url": "https://res.cloudinary.com/...",
          "title": "Sunset",
          "description": "A beautiful sunset painting"
        }
        // ... 4 more artworks
      ],
      "socialMedia": {
        "instagram": "https://instagram.com/johndoe",
        "twitter": null,
        // ...
      },
      "portfolioWebsite": "https://johndoe.art",
      "status": "pending",
      "submittedAt": "2026-02-13T10:00:00.000Z",
      "applicationVersion": 1
    }
  }
}
```

**No Application Response** (404):
```json
{
  "success": false,
  "message": "No application found",
  "data": {
    "hasApplication": false
  }
}
```

---

## 📘 Admin Endpoints (`/api/v1/artist/admin`)

> **Access**: Admin only (`role: "admin"`)

### Get Application Statistics

```http
GET /api/v1/artist/admin/stats
Authorization: Bearer <admin_access_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Stats fetched successfully",
  "data": {
    "stats": {
      "pending": 15,
      "under_review": 3,
      "approved": 45,
      "rejected": 12,
      "total": 75
    },
    "recentApplications": 8,
    "dailyTrend": [
      { "_id": "2026-02-07", "count": 2 },
      { "_id": "2026-02-08", "count": 3 },
      { "_id": "2026-02-09", "count": 1 },
      { "_id": "2026-02-10", "count": 0 },
      { "_id": "2026-02-11", "count": 2 },
      { "_id": "2026-02-12", "count": 4 },
      { "_id": "2026-02-13", "count": 3 }
    ]
  }
}
```

---

### Get All Applications

```http
GET /api/v1/artist/admin/applications
Authorization: Bearer <admin_access_token>
```

**Query Parameters**:

| Param | Type | Default | Options |
|-------|------|---------|---------|
| `status` | String | `pending` | `pending`, `under_review`, `approved`, `rejected`, `all` |
| `page` | Number | `1` | Any positive integer |
| `limit` | Number | `10` | 1-100 |
| `sortBy` | String | `submittedAt` | `submittedAt`, `fullName`, `status` |
| `sortOrder` | String | `desc` | `asc`, `desc` |

**Example**:
```
GET /api/v1/artist/admin/applications?status=pending&page=1&limit=10&sortOrder=desc
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": {
    "applications": [
      {
        "_id": "65def456...",
        "userId": {
          "_id": "65abc123...",
          "username": "john_doe",
          "email": "john@example.com",
          "avatar": null,
          "createdAt": "2026-02-01T..."
        },
        "fullName": "John Doe",
        "profilePicture": { "url": "..." },
        "bio": "Digital artist...",
        "status": "pending",
        "submittedAt": "2026-02-13T..."
        // ... other fields
      }
      // ... more applications
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2,
      "hasMore": true
    },
    "statusCounts": {
      "pending": 15,
      "under_review": 3,
      "approved": 45,
      "rejected": 12,
      "total": 75
    }
  }
}
```

---

### Get Application Details

```http
GET /api/v1/artist/admin/applications/:applicationId
Authorization: Bearer <admin_access_token>
```

**URL Params**: `applicationId` - Application ObjectId

**Success Response** (200):
```json
{
  "success": true,
  "message": "Application details fetched",
  "data": {
    "application": {
      "_id": "65def456...",
      "userId": {
        "_id": "65abc123...",
        "username": "john_doe",
        "email": "john@example.com",
        "avatar": null,
        "createdAt": "2026-02-01T...",
        "isVerified": true,
        "role": "user"
      },
      "fullName": "John Doe",
      "profilePicture": {
        "url": "https://res.cloudinary.com/..."
      },
      "bio": "I am a digital artist with 5 years of experience specializing in portraits and landscapes...",
      "phone": {
        "number": "9876543210",
        "isVerified": false
      },
      "email": {
        "address": "john@example.com",
        "isVerified": true
      },
      "address": {
        "street": "123 Art Street",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001",
        "country": "India"
      },
      "artworks": [
        {
          "url": "https://res.cloudinary.com/...",
          "title": "Sunset Over Mountains",
          "description": "Oil painting depicting a vibrant sunset"
        },
        // ... 4 more artworks
      ],
      "socialMedia": {
        "instagram": "https://instagram.com/johndoe_art",
        "behance": "https://behance.net/johndoe",
        "twitter": null,
        "facebook": null,
        "linkedin": null,
        "youtube": null,
        "dribbble": null,
        "other": null
      },
      "portfolioWebsite": "https://johndoe.art",
      "status": "pending",
      "reviewedBy": null,
      "reviewedAt": null,
      "rejectionReason": null,
      "submittedAt": "2026-02-13T10:00:00.000Z",
      "applicationVersion": 1
    }
  }
}
```

---

### Mark as Under Review

```http
PUT /api/v1/artist/admin/applications/:applicationId/review
Authorization: Bearer <admin_access_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Application marked as under review",
  "data": {
    "applicationId": "65def456...",
    "status": "under_review"
  }
}
```

---

### Approve Application

```http
PUT /api/v1/artist/admin/applications/:applicationId/approve
Authorization: Bearer <admin_access_token>
```

**Request Body** (optional):
```json
{
  "adminNotes": "Great portfolio, approved!"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Application approved successfully! Artist has been notified.",
  "data": {
    "applicationId": "65def456...",
    "status": "approved",
    "userId": "65abc123...",
    "approvedAt": "2026-02-13T15:30:00.000Z"
  }
}
```

**Side Effects**:
- User's `role` changes from `user` to `artist`
- Approval email sent to artist
- User's `artistRequest.status` updated

---

### Reject Application

```http
PUT /api/v1/artist/admin/applications/:applicationId/reject
Authorization: Bearer <admin_access_token>
```

**Request Body**:
```json
{
  "rejectionReason": "Portfolio needs more variety. Please include different art styles.",
  "adminNotes": "Internal: Suggest reapplying after improving portfolio",
  "cooldownDays": 3
}
```

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `rejectionReason` | ❌ | null | Message shown to artist (can be empty) |
| `adminNotes` | ❌ | null | Internal notes (not shown to artist) |
| `cooldownDays` | ❌ | **3** | Days before reapplication allowed (0-365) |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Application rejected. Artist has been notified.",
  "data": {
    "applicationId": "65def456...",
    "status": "rejected",
    "rejectionReason": "Portfolio needs more variety...",
    "canReapplyAfter": "2026-02-16T15:30:00.000Z"
  }
}
```

**Side Effects**:
- Rejection email sent to artist (includes reason if provided)
- Cooldown period set

---

### Delete Application

```http
DELETE /api/v1/artist/admin/applications/:applicationId
Authorization: Bearer <admin_access_token>
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

**Side Effects**:
- All uploaded images deleted from Cloudinary
- User's `artistRequest.status` reset to `none` (unless approved)

---

## Error Handling

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "bio", "message": "Bio must have at least 15 words. Current: 10 words" },
    { "field": "pincode", "message": "Pincode must be 6 digits" }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### Token Expired (401)
```json
{
  "success": false,
  "message": "Invalid or expired access token"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Application not found"
}
```

### Rate Limited (429)
```json
{
  "success": false,
  "message": "Too many authentication attempts, please try again after 15 minutes"
}
```

---

## Testing with Postman

1. Import collection from `backend/docs/ArtVPP.postman_collection.json` (if available)
2. Set environment variables:
   - `BASE_URL`: `http://localhost:5000/api/v1`
   - `ACCESS_TOKEN`: (set after login)
   - `REFRESH_TOKEN`: (set after login)
3. For file uploads, use "form-data" body type in Postman

---

## 📘 Product Endpoints (`/api/v1/products`)

### Get All Products (Public)

```http
GET /api/v1/products?page=1&limit=12&category=painting&search=sunset
```

**Query Params**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 12 | Items per page |
| category | String | - | Filter by category |
| minPrice | Number | - | Minimum price filter |
| maxPrice | Number | - | Maximum price filter |
| search | String | - | Text search in title/description |
| artist | ObjectId | - | Filter by artist ID |
| sortBy | String | createdAt | Sort field |
| sortOrder | String | desc | asc or desc |

**Categories**: `painting`, `sketch`, `digital-art`, `photography`, `sculpture`, `crafts`, `prints`, `merchandise`, `other`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "title": "Sunset Mountains",
        "slug": "sunset-mountains-abc123",
        "description": "Beautiful oil painting...",
        "images": [{ "url": "https://...", "publicId": "..." }],
        "price": 2500,
        "comparePrice": 3000,
        "discountPercentage": 17,
        "category": "painting",
        "tags": ["landscape", "oil"],
        "stock": 1,
        "artist": { "_id": "...", "username": "artist1", "avatar": "..." },
        "likesCount": 45,
        "rating": { "average": 4.5, "count": 12 }
      }
    ],
    "pagination": { "total": 100, "page": 1, "limit": 12, "pages": 9 }
  }
}
```

---

### Get Product by Slug

```http
GET /api/v1/products/:slug
```

---

### Get Categories

```http
GET /api/v1/products/categories
```

**Response**:
```json
{
  "success": true,
  "data": {
    "categories": [
      { "_id": "painting", "count": 45 },
      { "_id": "digital-art", "count": 32 }
    ]
  }
}
```

---

### Create Product (Artist)

```http
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| images | File[] | ✅ | 1-5 product images (max 10MB each) |
| title | String | ✅ | 3-100 characters |
| description | String | ✅ | 20-2000 characters |
| price | Number | ✅ | Price in ₹ (min 1) |
| comparePrice | Number | ❌ | Original price for discount display |
| category | String | ✅ | Product category |
| tags | String | ❌ | Comma-separated tags |
| stock | Number | ❌ | Default: 1 |
| isDigital | Boolean | ❌ | Default: false |
| dimensions | JSON | ❌ | `{"length":10,"width":8,"unit":"cm"}` |
| weight | JSON | ❌ | `{"value":500,"unit":"g"}` |

---

### Update Product (Artist)

```http
PUT /api/v1/products/:productId
Authorization: Bearer <token>
```

---

### Delete Product (Artist)

```http
DELETE /api/v1/products/:productId
Authorization: Bearer <token>
```

---

### Get My Products (Artist)

```http
GET /api/v1/products/artist/my-products?status=active
Authorization: Bearer <token>
```

---

### Like/Unlike Product

```http
POST /api/v1/products/:productId/like
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Liked",
  "data": { "liked": true, "likesCount": 46 }
}
```

---

## 📘 Cart Endpoints (`/api/v1/cart`)

> All cart endpoints require authentication

### Get Cart

```http
GET /api/v1/cart
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [
        {
          "product": {
            "_id": "...",
            "title": "Sunset Mountains",
            "images": [...],
            "price": 2500,
            "stock": 3
          },
          "quantity": 2,
          "price": 2500
        }
      ],
      "totalItems": 2,
      "totalPrice": 5000
    }
  }
}
```

---

### Add to Cart

```http
POST /api/v1/cart/add
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "productId": "...",
  "quantity": 1
}
```

---

### Update Cart Item

```http
PUT /api/v1/cart/update
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "productId": "...",
  "quantity": 3
}
```
*Note: Setting quantity to 0 removes the item*

---

### Remove from Cart

```http
DELETE /api/v1/cart/remove/:productId
Authorization: Bearer <token>
```

---

### Clear Cart

```http
DELETE /api/v1/cart/clear
Authorization: Bearer <token>
```

---

## 📘 Order Endpoints (`/api/v1/orders`)

> All order endpoints require authentication

### Create Order

```http
POST /api/v1/orders
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "9876543210",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "paymentMethod": "razorpay",
  "customerNote": "Please handle with care"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ART2602ABC123",
      "items": [...],
      "subtotal": 5000,
      "shippingCost": 0,
      "total": 5000,
      "status": "pending",
      "payment": { "method": "razorpay", "status": "pending" }
    },
    "razorpayOrder": {
      "id": "order_xxx",
      "amount": 500000,
      "currency": "INR"
    },
    "razorpayKeyId": "rzp_xxx"
  }
}
```

---

### Verify Razorpay Payment

```http
POST /api/v1/orders/:orderId/verify-payment
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "xxx"
}
```

---

### Get My Orders

```http
GET /api/v1/orders?page=1&status=confirmed
Authorization: Bearer <token>
```

---

### Get Order Details

```http
GET /api/v1/orders/:orderId
Authorization: Bearer <token>
```

---

### Cancel Order

```http
PUT /api/v1/orders/:orderId/cancel
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

---

### Get Artist Orders

```http
GET /api/v1/orders/artist/orders?status=confirmed
Authorization: Bearer <token>
```

---

### Update Order Status (Artist)

```http
PUT /api/v1/orders/artist/:orderId/status
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "status": "shipped",
  "courier": "Delhivery",
  "trackingNumber": "DL123456789",
  "trackingUrl": "https://delhivery.com/track/DL123456789"
}
```

**Valid Status Transitions**:
- `confirmed` → `processing`
- `processing` → `shipped`
- `shipped` → `delivered`

---

## Order Status Flow

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓
 CANCELLED  CANCELLED (before shipping)
```

---

## 📘 Wishlist Endpoints (`/api/v1/wishlist`)

> All wishlist endpoints require authentication

### Get Wishlist

```http
GET /api/v1/wishlist
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "wishlist": {
      "_id": "...",
      "user": "...",
      "products": [
        {
          "_id": "...",
          "title": "Sunset Mountains",
          "images": [{ "url": "https://..." }],
          "price": 2500,
          "artist": { "_id": "...", "username": "artist1" }
        }
      ],
      "count": 5
    }
  }
}
```

---

### Add to Wishlist

```http
POST /api/v1/wishlist/add
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "productId": "65abc123..."
}
```

---

### Toggle Wishlist Item

```http
POST /api/v1/wishlist/toggle
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "productId": "65abc123..."
}
```

**Response**:
```json
{
  "success": true,
  "message": "Added to wishlist",
  "data": { "inWishlist": true }
}
```

---

### Check if Product in Wishlist

```http
GET /api/v1/wishlist/check/:productId
Authorization: Bearer <token>
```

---

### Remove from Wishlist

```http
DELETE /api/v1/wishlist/remove/:productId
Authorization: Bearer <token>
```

---

### Clear Wishlist

```http
DELETE /api/v1/wishlist/clear
Authorization: Bearer <token>
```

---

## 📘 Reviews Endpoints (`/api/v1/reviews`)

### Get Product Reviews (Public)

```http
GET /api/v1/reviews/product/:productId?page=1&limit=10&sort=recent
```

**Query Params**:
| Param | Default | Options |
|-------|---------|---------|
| page | 1 | Pagination |
| limit | 10 | Items per page |
| sort | recent | `recent`, `helpful`, `rating-high`, `rating-low` |

---

### Create Review

```http
POST /api/v1/reviews
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "productId": "65abc123...",
  "rating": 5,
  "title": "Amazing artwork!",
  "comment": "The quality exceeded my expectations.",
  "images": []
}
```

**Note**: Reviews require admin approval before appearing publicly. One review per product per user.

---

### Get My Reviews

```http
GET /api/v1/reviews/my-reviews?page=1&limit=10
Authorization: Bearer <token>
```

---

### Update Review

```http
PUT /api/v1/reviews/:id
Authorization: Bearer <token>
```

**Note**: Can only update within 30 days of creation.

---

### Delete Review

```http
DELETE /api/v1/reviews/:id
Authorization: Bearer <token>
```

---

### Mark Review Helpful

```http
POST /api/v1/reviews/:id/helpful
Authorization: Bearer <token>
```

---

### Admin: Get All Reviews

```http
GET /api/v1/reviews/admin/all?status=pending
Authorization: Bearer <admin_token>
```

---

### Admin: Approve Review

```http
POST /api/v1/reviews/admin/:id/approve
Authorization: Bearer <admin_token>
```

---

### Admin: Reject Review

```http
POST /api/v1/reviews/admin/:id/reject
Authorization: Bearer <admin_token>
```

**Request Body** (optional):
```json
{
  "reason": "Inappropriate content"
}
```

---

## 📘 Coupons Endpoints (`/api/v1/coupons`)

### Validate Coupon

```http
POST /api/v1/coupons/validate
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "code": "SAVE20",
  "cartTotal": 5000,
  "cartItems": [...]
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "coupon": {
      "code": "SAVE20",
      "description": "20% off on orders above ₹500",
      "type": "percentage",
      "value": 20,
      "maxDiscount": 500
    },
    "discount": 500,
    "finalTotal": 4500
  }
}
```

---

### Get Available Coupons

```http
GET /api/v1/coupons/available
Authorization: Bearer <token>
```

---

### Admin: Get All Coupons

```http
GET /api/v1/coupons/admin/all
Authorization: Bearer <admin_token>
```

---

### Admin: Create Coupon

```http
POST /api/v1/coupons/admin
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "code": "WELCOME10",
  "description": "10% off for new users",
  "type": "percentage",
  "value": 10,
  "minOrderValue": 500,
  "maxDiscount": 200,
  "usageLimit": 100,
  "userUsageLimit": 1,
  "validFrom": "2026-02-01",
  "validUntil": "2026-03-01",
  "applicableUsers": {
    "newUsersOnly": true
  }
}
```

---

### Admin: Update Coupon

```http
PUT /api/v1/coupons/admin/:id
Authorization: Bearer <admin_token>
```

---

### Admin: Delete Coupon

```http
DELETE /api/v1/coupons/admin/:id
Authorization: Bearer <admin_token>
```

---

### Admin: Get Coupon Usage Stats

```http
GET /api/v1/coupons/admin/:id/usage
Authorization: Bearer <admin_token>
```

---

## 📘 Notifications Endpoints (`/api/v1/notifications`)

> All notification endpoints require authentication

### Get Notifications

```http
GET /api/v1/notifications?page=1&limit=20
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "...",
        "type": "order",
        "title": "Order Shipped!",
        "message": "Your order #ART123 has been shipped",
        "isRead": false,
        "link": "/orders/65abc123",
        "createdAt": "2026-02-18T10:00:00.000Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 5 }
  }
}
```

---

### Get Unread Count

```http
GET /api/v1/notifications/unread-count
Authorization: Bearer <token>
```

---

### Mark as Read

```http
PUT /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

---

### Mark All as Read

```http
PUT /api/v1/notifications/read-all
Authorization: Bearer <token>
```

---

### Delete Notification

```http
DELETE /api/v1/notifications/:id
Authorization: Bearer <token>
```

---

### Clear All Notifications

```http
DELETE /api/v1/notifications/clear
Authorization: Bearer <token>
```

---

## 📘 User Address Endpoints (`/api/v1/user/addresses`)

### Get All Addresses

```http
GET /api/v1/user/addresses
Authorization: Bearer <token>
```

---

### Add New Address

```http
POST /api/v1/user/addresses
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "type": "home",
  "fullName": "John Doe",
  "phone": "9876543210",
  "street": "123 Main Street",
  "landmark": "Near City Mall",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "isDefault": true
}
```

---

### Update Address

```http
PUT /api/v1/user/addresses/:addressId
Authorization: Bearer <token>
```

---

### Delete Address

```http
DELETE /api/v1/user/addresses/:addressId
Authorization: Bearer <token>
```

---

### Set Default Address

```http
POST /api/v1/user/addresses/:addressId/default
Authorization: Bearer <token>
```

---

## 📘 Services Endpoints (`/api/v1/services`)

### Get All Services (Public)

```http
GET /api/v1/services?page=1&limit=12&category=Media%20Services
```

**Categories**: `Media Services`, `Display Art`, `3D Art`, `Rental`, `Wall Art`, `Design Services`, `Educational`, `Other`

---

### Get Service by Slug

```http
GET /api/v1/services/slug/:slug
```

---

### Get Service Categories

```http
GET /api/v1/services/categories
```

---

### Book Service

```http
POST /api/v1/services/:id/book
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "pricingTier": "Standard",
  "requirements": "I need wedding photography for 200 guests...",
  "scheduledDate": "2026-03-15"
}
```

---

### Get My Bookings

```http
GET /api/v1/services/my-bookings
Authorization: Bearer <token>
```

---

### Cancel Booking

```http
POST /api/v1/services/bookings/:id/cancel
Authorization: Bearer <token>
```

---

### Artist: Create Service

```http
POST /api/v1/services/artist
Authorization: Bearer <artist_token>
```

---

### Artist: Get My Services

```http
GET /api/v1/services/artist/my-services
Authorization: Bearer <artist_token>
```

---

### Artist: Update Service

```http
PUT /api/v1/services/artist/:id
Authorization: Bearer <artist_token>
```

---

### Artist: Get Service Bookings

```http
GET /api/v1/services/artist/bookings
Authorization: Bearer <artist_token>
```

---

### Artist: Update Booking Status

```http
PUT /api/v1/services/artist/bookings/:id/status
Authorization: Bearer <artist_token>
```

**Request Body**:
```json
{
  "status": "confirmed"
}
```

**Status Flow**: `pending` → `confirmed` → `in_progress` → `completed`

---

### Admin: Get All Services

```http
GET /api/v1/services/admin/all
Authorization: Bearer <admin_token>
```

---

### Admin: Approve Service

```http
POST /api/v1/services/admin/:id/approve
Authorization: Bearer <admin_token>
```

---

### Admin: Reject Service

```http
POST /api/v1/services/admin/:id/reject
Authorization: Bearer <admin_token>
```

---

## 📘 Workshops Endpoints (`/api/v1/workshops`)

### Get All Workshops (Public)

```http
GET /api/v1/workshops?page=1&limit=12&level=Beginner
```

**Levels**: `Beginner`, `Intermediate`, `Advanced`, `All Levels`

---

### Get Workshop by Slug

```http
GET /api/v1/workshops/slug/:slug
```

---

### Get Workshop by ID

```http
GET /api/v1/workshops/:id
```

---

### Get Workshop Categories

```http
GET /api/v1/workshops/categories
```

---

### Register for Workshop

```http
POST /api/v1/workshops/:id/register
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "paymentMethod": "razorpay"
}
```

---

### Get My Registrations

```http
GET /api/v1/workshops/user/my-registrations
Authorization: Bearer <token>
```

---

### Cancel Registration

```http
POST /api/v1/workshops/user/registrations/:id/cancel
Authorization: Bearer <token>
```

---

### Artist: Create Workshop

```http
POST /api/v1/workshops/artist
Authorization: Bearer <artist_token>
```

**Request Body**:
```json
{
  "title": "Watercolor Basics Workshop",
  "description": "Learn fundamental watercolor techniques...",
  "price": 1500,
  "duration": "2 days (6 hours)",
  "level": "Beginner",
  "maxSpots": 20,
  "startDate": "2026-03-15",
  "endDate": "2026-03-16",
  "locationType": "offline",
  "location": {
    "venue": "Art Studio, Mumbai",
    "address": "123 Art Street"
  }
}
```

---

### Artist: Get My Workshops

```http
GET /api/v1/workshops/artist/my-workshops
Authorization: Bearer <artist_token>
```

---

### Artist: Get Workshop Participants

```http
GET /api/v1/workshops/artist/:id/participants
Authorization: Bearer <artist_token>
```

---

### Artist: Mark Attendance

```http
PUT /api/v1/workshops/artist/registrations/:id/attendance
Authorization: Bearer <artist_token>
```

**Request Body**:
```json
{
  "attended": true
}
```

---

### Admin: Get All Workshops

```http
GET /api/v1/workshops/admin/all
Authorization: Bearer <admin_token>
```

---

### Admin: Approve Workshop

```http
POST /api/v1/workshops/admin/:id/approve
Authorization: Bearer <admin_token>
```

---

### Admin: Reject Workshop

```http
POST /api/v1/workshops/admin/:id/reject
Authorization: Bearer <admin_token>
```

---

## API Summary

| Module | Total Endpoints | Public | User | Artist | Admin |
|--------|-----------------|--------|------|--------|-------|
| Auth | 10 | 8 | 2 | - | - |
| User | 7 | - | 7 | - | - |
| Artist | 10 | - | 4 | - | 6 |
| Products | 12 | 4 | 3 | 3 | 2 |
| Cart | 5 | - | 5 | - | - |
| Orders | 8 | - | 5 | 2 | 1 |
| Wishlist | 6 | - | 6 | - | - |
| Reviews | 9 | 1 | 5 | - | 3 |
| Coupons | 7 | - | 2 | - | 5 |
| Notifications | 6 | - | 6 | - | - |
| Services | 12 | 3 | 3 | 4 | 2 |
| Workshops | 13 | 4 | 3 | 4 | 2 |
| **Total** | **105** | **20** | **46** | **13** | **21** |

---

## Environment Variables Required

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://...

# JWT Secrets (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=your_64_char_secret
JWT_REFRESH_SECRET=your_64_char_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail SMTP)
MAIL_USER=your_gmail@gmail.com
MAIL_PASS=your_app_password

# Payment (Razorpay)
RAZORPAY_KEY_ID=rzp_xxx
RAZORPAY_KEY_SECRET=xxx

# Frontend URL (for CORS & email links)
CLIENT_URL=http://localhost:5173

# Google OAuth (optional)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

---

## Contact

Backend Team - ArtVPP

