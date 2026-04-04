import axios from 'axios';

// Detect environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===========================================
// AUTHENTICATION APIs
// ===========================================

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

export const resendVerification = async (email: string) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data;
};

// ===========================================
// CART APIs
// ===========================================

export const getCart = async () => {
  const response = await api.get('/cart');
  return response.data;
};

export const addToCart = async (productId: string, quantity: number = 1, options?: any) => {
  const response = await api.post('/cart', { productId, quantity, ...options });
  return response.data;
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  const response = await api.put(`/cart/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (itemId: string) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await api.delete('/cart');
  return response.data;
};

// ===========================================
// WISHLIST APIs
// ===========================================

export const getWishlist = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId: string) => {
  const response = await api.post('/wishlist', { productId });
  return response.data;
};

export const removeFromWishlist = async (productId: string) => {
  const response = await api.delete(`/wishlist/${productId}`);
  return response.data;
};

export const toggleWishlistItem = async (productId: string) => {
  const response = await api.post(`/wishlist/toggle`, { productId });
  return response.data;
};

export const toggleLike = async (productId: string) => {
  return toggleWishlistItem(productId);
};

// ===========================================
// PRODUCT APIs
// ===========================================

export const getProducts = async (params?: any) => {
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProduct = async (slug: string) => {
  const response = await api.get(`/products/slug/${slug}`);
  return response.data;
};

export const createProduct = async (productData: FormData) => {
  const response = await api.post('/products/artist', productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===========================================
// SERVICE APIs
// ===========================================

export const getServices = async (params?: any) => {
  const response = await api.get('/services', { params });
  return response.data;
};

export const getService = async (slug: string) => {
  const response = await api.get(`/services/slug/${slug}`);
  return response.data;
};

export const createService = async (serviceData: any) => {
  const response = await api.post('/services/artist', serviceData);
  return response.data;
};

export const uploadServiceImages = async (images: File[]) => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append('images', image);
  });

  const response = await api.post('/services/artist/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===========================================
// WORKSHOP APIs
// ===========================================

export const getWorkshops = async (params?: any) => {
  const response = await api.get('/workshops', { params });
  return response.data;
};

export const getWorkshop = async (slug: string) => {
  const response = await api.get(`/workshops/slug/${slug}`);
  return response.data;
};

export const createWorkshop = async (workshopData: any) => {
  const response = await api.post('/workshops/artist', workshopData);
  return response.data;
};

export const uploadWorkshopImages = async (images: File[]) => {
  const formData = new FormData();
  images.forEach((image, index) => {
    formData.append('images', image);
  });

  const response = await api.post('/workshops/artist/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===========================================
// ORDER APIs
// ===========================================

export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/orders');
  return response.data;
};

export const getOrder = async (orderId: string) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// ===========================================
// USER PROFILE APIs
// ===========================================

export const updateProfile = async (userData: any) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const uploadProfileImage = async (image: File) => {
  const formData = new FormData();
  formData.append('profileImage', image);

  const response = await api.post('/users/upload-profile-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===========================================
// ARTIST APPLICATION APIs
// ===========================================

export const submitArtistApplication = async (applicationData: FormData) => {
  const response = await api.post('/artist/apply', applicationData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ===========================================
// NOTIFICATION APIs
// ===========================================

export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

// ===========================================
// COUPON APIs
// ===========================================

export const getCoupons = async () => {
  const response = await api.get('/coupons');
  return response.data;
};

export const validateCoupon = async (code: string, amount: number) => {
  const response = await api.post('/coupons/validate', { code, amount });
  return response.data;
};

// ===========================================
// REVIEW APIs
// ===========================================

export const getProductReviews = async (productId: string) => {
  const response = await api.get(`/reviews/product/${productId}`);
  return response.data;
};

export const createReview = async (reviewData: {
  productId: string;
  rating: number;
  comment: string;
}) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

export const updateReview = async (reviewId: string, reviewData: any) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

export const deleteReview = async (reviewId: string) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};

// ===========================================
// ADMIN APIs
// ===========================================

// User Management
export const adminGetUsers = async (params?: any) => {
  const response = await api.get('/user/admin/users', { params });
  return response.data;
};

export const adminUpdateUserRole = async (userId: string, role: string) => {
  const response = await api.put(`/user/admin/role/${userId}`, { role });
  return response.data;
};

export const adminToggleUserStatus = async (userId: string) => {
  const response = await api.put(`/user/admin/status/${userId}`);
  return response.data;
};

// Artist Applications
export const adminGetPendingArtistApplications = async () => {
  const response = await api.get('/user/admin/artist-applications');
  return response.data;
};

export const adminReviewArtistApplication = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
  const response = await api.put(`/user/admin/review-artist/${userId}`, { action, reason });
  return response.data;
};

// Profile Edit Requests
export const adminGetProfileRequests = async () => {
  const response = await api.get('/user/admin/profile-requests');
  return response.data;
};

export const adminApproveProfileEdit = async (requestId: string) => {
  const response = await api.put(`/user/admin/profile-requests/${requestId}/approve`);
  return response.data;
};

export const adminRejectProfileEdit = async (requestId: string, reason: string) => {
  const response = await api.put(`/user/admin/profile-requests/${requestId}/reject`, { reason });
  return response.data;
};

// Product Management
export const adminGetAllProducts = async (params?: any) => {
  const response = await api.get('/products/admin/all', { params });
  return response.data;
};

export const adminCreateProduct = async (productData: FormData) => {
  const response = await api.post('/products/admin/create', productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const adminUpdateProduct = async (productId: string, productData: FormData) => {
  const response = await api.put(`/products/admin/${productId}`, productData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const adminDeleteProduct = async (productId: string) => {
  const response = await api.delete(`/products/admin/${productId}`);
  return response.data;
};

// Product Requests
export const adminGetPendingProductRequests = async () => {
  const response = await api.get('/products/admin/pending');
  return response.data;
};

export const adminGetProductRequestDetails = async (requestId: string) => {
  const response = await api.get(`/products/admin/pending/${requestId}`);
  return response.data;
};

export const adminApproveProductRequest = async (requestId: string) => {
  const response = await api.put(`/products/admin/pending/${requestId}/approve`);
  return response.data;
};

export const adminRejectProductRequest = async (requestId: string, reason: string) => {
  const response = await api.put(`/products/admin/pending/${requestId}/reject`, { reason });
  return response.data;
};

// Category Management
export const adminGetCategories = async () => {
  const response = await api.get('/products/admin/categories');
  return response.data;
};

export const adminCreateCategory = async (categoryData: { name: string; description?: string }) => {
  const response = await api.post('/products/admin/categories', categoryData);
  return response.data;
};

export const adminUpdateCategory = async (categoryId: string, categoryData: { name: string; description?: string }) => {
  const response = await api.put(`/products/admin/categories/${categoryId}`, categoryData);
  return response.data;
};

export const adminDeleteCategory = async (categoryId: string) => {
  const response = await api.delete(`/products/admin/categories/${categoryId}`);
  return response.data;
};

// Service Management
export const adminGetAllServices = async (params?: any) => {
  const response = await api.get('/services/admin/all', { params });
  return response.data;
};

export const adminApproveService = async (serviceId: string) => {
  const response = await api.post(`/services/admin/${serviceId}/approve`);
  return response.data;
};

export const adminRejectService = async (serviceId: string, reason: string) => {
  const response = await api.post(`/services/admin/${serviceId}/reject`, { reason });
  return response.data;
};

// Workshop Management
export const adminGetAllWorkshops = async (params?: any) => {
  const response = await api.get('/workshops/admin/all', { params });
  return response.data;
};

export const adminApproveWorkshop = async (workshopId: string) => {
  const response = await api.post(`/workshops/admin/${workshopId}/approve`);
  return response.data;
};

export const adminRejectWorkshop = async (workshopId: string, reason: string) => {
  const response = await api.post(`/workshops/admin/${workshopId}/reject`, { reason });
  return response.data;
};

// Order Management
export const adminGetAllOrders = async (params?: any) => {
  const response = await api.get('/orders/admin/all', { params });
  return response.data;
};

export const adminUpdateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.put(`/orders/admin/${orderId}/status`, { status });
  return response.data;
};

// Content Management
export const adminGetContent = async () => {
  const response = await api.get('/content/admin/all');
  return response.data;
};

export const adminCreateContent = async (contentData: any) => {
  const response = await api.post('/content/admin', contentData);
  return response.data;
};

export const adminUpdateContent = async (contentId: string, contentData: any) => {
  const response = await api.put(`/content/admin/${contentId}`, contentData);
  return response.data;
};

export const adminDeleteContent = async (contentId: string) => {
  const response = await api.delete(`/content/admin/${contentId}`);
  return response.data;
};

// Settings
export const adminGetSettings = async () => {
  const response = await api.get('/settings/admin');
  return response.data;
};

export const adminUpdateSettings = async (settings: any) => {
  const response = await api.put('/settings/admin', settings);
  return response.data;
};

// Reports & Analytics
export const adminGetRevenueReport = async (params?: any) => {
  const response = await api.get('/reports/admin/revenue', { params });
  return response.data;
};

export const adminGetUserReport = async (params?: any) => {
  const response = await api.get('/reports/admin/users', { params });
  return response.data;
};

export const adminGetProductReport = async (params?: any) => {
  const response = await api.get('/reports/admin/products', { params });
  return response.data;
};