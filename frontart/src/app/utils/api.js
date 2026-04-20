const API_BASE = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE}${endpoint}`;
    const isFormData = options.body instanceof FormData;
    const baseHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };

    // Spread `options` first so our merged headers cannot be overwritten by `options.headers`.
    const config = {
        ...options,
        headers: {
            ...baseHeaders,
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    };

    if (isFormData && config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
    }

    let response;
    try {
        response = await fetch(url, config);
    } catch (networkError) {
        const hint = API_BASE.startsWith('/')
            ? 'Backend not reachable. Make sure the backend server is running and the Vite proxy is forwarding /api/v1 requests.'
            : 'API server not reachable. Check VITE_API_URL and that the backend is running.';
        throw new Error(`${hint} (${networkError?.message || 'network error'})`);
    }

    // If we get a 401 and have a refresh token, try to refresh.
    // Only skip when the failing call itself is refresh-token.
    if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken && endpoint !== '/auth/refresh-token') {
            try {
                const refreshResponse = await fetch(`${API_BASE}/auth/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken })
                });

                if (refreshResponse.ok) {
                    const refreshData = await refreshResponse.json();
                    if (refreshData.success) {
                        // Store new tokens
                        localStorage.setItem('token', refreshData.data.accessToken);
                        localStorage.setItem('refreshToken', refreshData.data.refreshToken);

                        // Retry the original request with new token
                        const newConfig = {
                            ...config,
                            headers: {
                                ...config.headers,
                                Authorization: `Bearer ${refreshData.data.accessToken}`
                            }
                        };
                        response = await fetch(url, newConfig);
                    }
                }
            } catch (refreshError) {
                // Refresh failed, continue with original error
                console.error('Token refresh failed:', refreshError);
            }
        }
    }

    if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        }
        const errorData = await response.json().catch(() => ({}));
        // Handle validation errors with details
        if (errorData.errors && Array.isArray(errorData.errors)) {
            const errorMessages = errorData.errors.map(e => e.message).join('. ');
            throw new Error(errorMessages || errorData.message || `HTTP error! status: ${response.status}`);
        }
        throw new Error(
            response.status === 401
                ? (errorData.message || 'Session expired. Please login again.')
                : (errorData.message || `HTTP error! status: ${response.status}`)
        );
    }
    return response.json();
};

// Auth APIs
export const login = (email, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
});

export const register = (username, displayName, email, password, phone) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, displayName, email, password, phone })
});

export const verifyEmail = (token) => apiRequest('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token })
});

export const resendVerification = (email) => apiRequest('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email })
});

export const forgotPassword = (email) => apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
});

export const verifyOtp = (email, otp) => apiRequest(`/auth/verify-otp/${email}`, {
    method: 'POST',
    body: JSON.stringify({ otp })
});

export const resetPassword = (email, newPassword, confirmPassword) => apiRequest(`/auth/reset-password/${email}`, {
    method: 'POST',
    body: JSON.stringify({ newPassword, confirmPassword })
});

export const getMe = () => apiRequest('/auth/me');

export const logout = () => apiRequest('/auth/logout', {
    method: 'POST'
});

export const refreshToken = (refreshToken) => apiRequest('/auth/refresh-token', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
});

// Artist application
export const applyArtist = (formData) => apiRequest('/artist/apply', {
    method: 'POST',
    body: formData
    // Don't set headers - apiRequest handles auth headers and Content-Type for FormData
});

// Artist application - send email OTP for secondary email verification
export const sendArtistEmailOtp = () => apiRequest('/artist/send-email-otp', {
    method: 'POST'
});

// Artist application - verify email OTP
export const verifyArtistEmailOtp = (otp) => apiRequest('/artist/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ otp })
});

// Artist application - get my application status
export const getMyArtistApplication = () => apiRequest('/artist/my-application');

// Student artwork public-link flow
export const checkStudentSubmissionAvailability = ({ username, email } = {}) => {
    const query = new URLSearchParams();
    if (username) query.set('username', username);
    if (email) query.set('email', email);
    return apiRequest(`/artist/student/check-availability${query.toString() ? `?${query.toString()}` : ''}`);
};

export const submitStudentArtworkSubmission = (formData) => apiRequest('/artist/student/submit', {
    method: 'POST',
    body: formData
});

export const getStudentArtworkPublishingSetting = () =>
    apiRequest('/artist/admin/settings/student-artwork-publishing');

export const updateStudentArtworkPublishingSetting = (enabled) =>
    apiRequest('/artist/admin/settings/student-artwork-publishing', {
        method: 'PUT',
        body: JSON.stringify({ enabled })
    });

// ===========================================
// ADMIN ARTIST APPLICATION APIs
// ===========================================

// Get application statistics
export const getArtistApplicationStats = () => apiRequest('/artist/admin/stats');

// Get all applications with filters
export const getArtistApplications = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/artist/admin/applications${query ? `?${query}` : ''}`);
};

// Get single application details
export const getArtistApplicationDetails = (applicationId) =>
    apiRequest(`/artist/admin/applications/${applicationId}`);

// Mark application as under review
export const markApplicationUnderReview = (applicationId) =>
    apiRequest(`/artist/admin/applications/${applicationId}/review`, {
        method: 'PUT'
    });

// Approve application
export const approveArtistApplication = (applicationId, adminNotes = '') =>
    apiRequest(`/artist/admin/applications/${applicationId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ adminNotes })
    });

// Reject application
export const rejectArtistApplication = (applicationId, rejectionReason = '', adminNotes = '', cooldownDays = 30) =>
    apiRequest(`/artist/admin/applications/${applicationId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ rejectionReason, adminNotes, cooldownDays })
    });

// Send suggestion to artist (custom endpoint - we'll create this)
export const sendArtistSuggestion = (applicationId, suggestion) =>
    apiRequest(`/artist/admin/applications/${applicationId}/suggestion`, {
        method: 'POST',
        body: JSON.stringify({ suggestion })
    });

// Delete application
export const deleteArtistApplication = (applicationId) =>
    apiRequest(`/artist/admin/applications/${applicationId}`, {
        method: 'DELETE'
    });

// ===========================================
// USER APIs
// ===========================================

// Profile management
export const updateProfile = (profileData) => apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
});

export const changePassword = (passwordData) => apiRequest('/user/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
});

// Address management
export const getAddresses = () => apiRequest('/user/addresses');
export const addAddress = (addressData) => apiRequest('/user/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData)
});
export const updateAddress = (addressId, addressData) => apiRequest(`/user/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(addressData)
});
export const deleteAddress = (addressId) => apiRequest(`/user/addresses/${addressId}`, {
    method: 'DELETE'
});
export const setDefaultAddress = (addressId) => apiRequest(`/user/addresses/${addressId}/default`, {
    method: 'POST'
});

// Artist application
export const applyForArtist = (applicationData) => apiRequest('/user/apply-artist', {
    method: 'POST',
    body: JSON.stringify(applicationData)
});
export const getArtistStatus = () => apiRequest('/user/artist-status');
export const requestProfileEdit = (editData) => apiRequest('/user/request-profile-edit', {
    method: 'POST',
    body: JSON.stringify(editData)
});

// Admin user management
export const getAllUsers = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/user/admin/users${query ? `?${query}` : ''}`);
};
export const getPendingArtistApplications = () => apiRequest('/user/admin/artist-applications');
export const reviewArtistApplication = (userId, reviewData) => apiRequest(`/user/admin/review-artist/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
});
export const updateUserRole = (userId, roleData) => apiRequest(`/user/admin/role/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(roleData)
});
export const toggleUserStatus = (userId) => apiRequest(`/user/admin/status/${userId}`, {
    method: 'PUT'
});

// Admin profile edit requests
export const adminGetProfileRequests = () => apiRequest('/user/admin/profile-requests');
export const adminApproveProfileEdit = (requestId) => apiRequest(`/user/admin/profile-requests/${requestId}/approve`, {
    method: 'PUT'
});
export const adminRejectProfileEdit = (requestId) => apiRequest(`/user/admin/profile-requests/${requestId}/reject`, {
    method: 'PUT'
});

// ===========================================
// PRODUCT APIs
// ===========================================

// Public product APIs
export const getProducts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
};
export const getProductBySlug = (slug) => apiRequest(`/products/slug/${slug}`);
export const getCategories = () => apiRequest('/products/categories');

// User product APIs
export const toggleLike = (productId) => apiRequest(`/products/${productId}/like`, {
    method: 'POST'
});

// Artist product APIs
export const getMyProducts = () => apiRequest('/products/my-products');
export const getMyRequests = () => apiRequest('/products/my-requests');
export const markRequestSeen = (requestId) => apiRequest(`/products/requests/${requestId}/seen`, {
    method: 'PUT'
});
export const requestCreateProduct = (formData) => apiRequest('/products/request', {
    method: 'POST',
    headers: {}, // Let browser set content-type for FormData
    body: formData
});
export const requestEditProduct = (productId, formData) => apiRequest(`/products/${productId}/request-edit`, {
    method: 'PUT',
    headers: {}, // Let browser set content-type for FormData
    body: formData
});
export const requestDeleteProduct = (productId) => apiRequest(`/products/${productId}/request-delete`, {
    method: 'DELETE'
});

// Admin product APIs
export const adminGetCategories = () => apiRequest('/products/admin/categories');
export const adminCreateCategory = (categoryData) => apiRequest('/products/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData)
});
export const adminUpdateCategory = (categoryId, categoryData) => apiRequest(`/products/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData)
});
export const adminDeleteCategory = (categoryId) => apiRequest(`/products/admin/categories/${categoryId}`, {
    method: 'DELETE'
});
export const adminGetPendingRequests = () => apiRequest('/products/admin/pending');
export const adminGetRequestDetails = (requestId) => apiRequest(`/products/admin/pending/${requestId}`);
export const adminApproveRequest = (requestId, adminNote = '') => apiRequest(`/products/admin/pending/${requestId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ adminNote })
});
export const adminRejectRequest = (requestId, rejectionReason = '', adminNote = '') => apiRequest(`/products/admin/pending/${requestId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ rejectionReason, adminNote })
});
export const adminGetAllProducts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products/admin/all${query ? `?${query}` : ''}`);
};
export const adminCreateProduct = (formData) => apiRequest('/products/admin/create', {
    method: 'POST',
    headers: {}, // Let browser set content-type for FormData
    body: formData
});
export const adminEditProduct = (productId, formData) => apiRequest(`/products/admin/${productId}`, {
    method: 'PUT',
    headers: {}, // Let browser set content-type for FormData
    body: formData
});
export const adminDeleteProduct = (productId) => apiRequest(`/products/admin/${productId}`, {
    method: 'DELETE'
});

// Compatibility aliases used by some components
export const createProduct = requestCreateProduct;
export const getOrders = (params = {}) => getMyOrders(params);

// ===========================================
// CART APIs
// ===========================================

export const getCart = () => apiRequest('/cart');
export const addToCart = (cartData) => apiRequest('/cart/add', {
    method: 'POST',
    body: JSON.stringify(cartData)
});
export const updateCartItem = (updateData) => apiRequest('/cart/update', {
    method: 'PUT',
    body: JSON.stringify(updateData)
});
export const removeFromCart = (productId) => apiRequest(`/cart/remove/${productId}`, {
    method: 'DELETE'
});
export const clearCart = () => apiRequest('/cart/clear', {
    method: 'DELETE'
});

// ===========================================
// ORDER APIs
// ===========================================

export const createOrder = (orderData) => apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
});
export const verifyPayment = (orderId, paymentData) => apiRequest(`/orders/${orderId}/verify-payment`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
});
export const getMyOrders = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/orders${query ? `?${query}` : ''}`);
};
export const getOrderById = (orderId) => apiRequest(`/orders/${orderId}`);
export const cancelOrder = (orderId) => apiRequest(`/orders/${orderId}/cancel`, {
    method: 'PUT'
});

// Artist order APIs
export const getArtistOrders = () => apiRequest('/orders/artist/orders');
export const updateOrderStatus = (orderId, statusData) => apiRequest(`/orders/artist/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
});

// Admin order APIs
export const adminGetAllOrders = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/orders/admin/all${query ? `?${query}` : ''}`);
};
export const adminUpdateOrderStatus = (orderId, statusData) => apiRequest(`/orders/admin/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
});

// ===========================================
// WISHLIST APIs
// ===========================================

export const getWishlist = () => apiRequest('/wishlist');
export const addToWishlist = (productData) => apiRequest('/wishlist/add', {
    method: 'POST',
    body: JSON.stringify(productData)
});
export const removeFromWishlist = (productId) => apiRequest(`/wishlist/remove/${productId}`, {
    method: 'DELETE'
});
export const clearWishlist = () => apiRequest('/wishlist/clear', {
    method: 'DELETE'
});
export const checkWishlistItem = (productId) => apiRequest(`/wishlist/check/${productId}`);
export const toggleWishlistItem = (productData) => apiRequest('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify(productData)
});

// ===========================================
// REVIEW APIs
// ===========================================

// Public review APIs
export const getProductReviews = (productId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reviews/product/${productId}${query ? `?${query}` : ''}`);
};

// User review APIs
export const createReview = (reviewData) => apiRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
});
export const getMyReviews = () => apiRequest('/reviews/my-reviews');
export const updateReview = (reviewId, reviewData) => apiRequest(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
});
export const deleteReview = (reviewId) => apiRequest(`/reviews/${reviewId}`, {
    method: 'DELETE'
});
export const markReviewHelpful = (reviewId) => apiRequest(`/reviews/${reviewId}/helpful`, {
    method: 'POST'
});

// Admin review APIs
export const adminGetAllReviews = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/reviews/admin/all${query ? `?${query}` : ''}`);
};
export const adminApproveReview = (reviewId) => apiRequest(`/reviews/admin/${reviewId}/approve`, {
    method: 'POST'
});
export const adminRejectReview = (reviewId) => apiRequest(`/reviews/admin/${reviewId}/reject`, {
    method: 'POST'
});

// ===========================================
// COUPON APIs
// ===========================================

// User coupon APIs
export const validateCoupon = (couponData) => apiRequest('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify(couponData)
});
export const getAvailableCoupons = () => apiRequest('/coupons/available');
export const getCoupons = getAvailableCoupons; // Alias for dashboard

// Admin coupon APIs
export const adminGetAllCoupons = () => apiRequest('/coupons/admin/all');
export const adminCreateCoupon = (couponData) => apiRequest('/coupons/admin', {
    method: 'POST',
    body: JSON.stringify(couponData)
});
export const adminUpdateCoupon = (couponId, couponData) => apiRequest(`/coupons/admin/${couponId}`, {
    method: 'PUT',
    body: JSON.stringify(couponData)
});
export const adminDeleteCoupon = (couponId) => apiRequest(`/coupons/admin/${couponId}`, {
    method: 'DELETE'
});
export const adminGetCouponUsage = (couponId) => apiRequest(`/coupons/admin/${couponId}/usage`);

// ===========================================
// NOTIFICATION APIs
// ===========================================

export const getNotifications = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/notifications${query ? `?${query}` : ''}`);
};
export const getUnreadCount = () => apiRequest('/notifications/unread-count');
export const markAsRead = (notificationId) => apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PUT'
});
export const markNotificationRead = markAsRead; // Alias for dashboard
export const markAllAsRead = () => apiRequest('/notifications/read-all', {
    method: 'PUT'
});
export const markAllNotificationsRead = markAllAsRead; // Alias for dashboard
export const deleteNotification = (notificationId) => apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE'
});
export const clearAllNotifications = () => apiRequest('/notifications/clear', {
    method: 'DELETE'
});

// ===========================================
// SERVICE APIs
// ===========================================

// Public service APIs
export const getServices = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/services${query ? `?${query}` : ''}`);
};
export const getServiceBySlug = (slug) => apiRequest(`/services/slug/${slug}`);
export const getServiceCategories = () => apiRequest('/services/categories');
export const getStudioHireConfig = () => apiRequest('/services/studio-hire');
export const bookStudioHire = (bookingData) => apiRequest('/services/studio-hire/book', {
    method: 'POST',
    body: JSON.stringify(bookingData)
});
export const adminUpdateStudioHireConfig = (studioData) => apiRequest('/services/studio-hire', {
    method: 'PUT',
    body: JSON.stringify(studioData)
});
export const adminUploadStudioHireImages = (formData) => apiRequest('/services/studio-hire/upload-images', {
    method: 'POST',
    headers: {},
    body: formData
});

// Platform landing page configs (Photography, Calligraphy, etc.)
export const getPlatformServiceConfig = (key) => apiRequest(`/services/platform/${encodeURIComponent(key)}`);
export const adminUpdatePlatformServiceConfig = (key, serviceData) => apiRequest(`/services/platform/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
});
export const adminUploadPlatformServiceImages = (key, formData) => apiRequest(`/services/platform/${encodeURIComponent(key)}/upload-images`, {
    method: 'POST',
    body: formData
});
export const bookPlatformService = (key, bookingData) => apiRequest(`/services/platform/${encodeURIComponent(key)}/book`, {
    method: 'POST',
    body: JSON.stringify(bookingData)
});

// User service APIs
export const bookService = (serviceId, bookingData) => apiRequest(`/services/${serviceId}/book`, {
    method: 'POST',
    body: JSON.stringify(bookingData)
});
export const getMyBookings = () => apiRequest('/services/my-bookings');
export const cancelMyBooking = (bookingId) => apiRequest(`/services/bookings/${bookingId}/cancel`, {
    method: 'POST'
});

// Artist service APIs
export const artistCreateService = (serviceData) => apiRequest('/services/artist', {
    method: 'POST',
    body: JSON.stringify(serviceData)
});
export const artistGetMyServices = () => apiRequest('/services/artist/my-services');
export const artistUpdateService = (serviceId, serviceData) => apiRequest(`/services/artist/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
});
export const artistGetServiceBookings = () => apiRequest('/services/artist/bookings');
export const artistUpdateBookingStatus = (bookingId, statusData) => apiRequest(`/services/artist/bookings/${bookingId}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
});

// Admin service APIs
export const adminGetAllServices = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/services/admin/all${query ? `?${query}` : ''}`);
};
export const adminApproveService = (serviceId) => apiRequest(`/services/admin/${serviceId}/approve`, {
    method: 'POST'
});
export const adminRejectService = (serviceId, reason = '') => apiRequest(`/services/admin/${serviceId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
});

// ===========================================
// WORKSHOP APIs
// ===========================================

// Public workshop APIs
export const getWorkshops = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/workshops${query ? `?${query}` : ''}`);
};
export const getWorkshopBySlug = (slug) => apiRequest(`/workshops/slug/${slug}`);
export const getWorkshopById = (id) => apiRequest(`/workshops/${id}`);
export const getWorkshopCategories = () => apiRequest('/workshops/categories');

// User workshop APIs
export const registerForWorkshop = (workshopId, registrationData) => apiRequest(`/workshops/${workshopId}/register`, {
    method: 'POST',
    body: JSON.stringify(registrationData)
});
export const getMyRegistrations = () => apiRequest('/workshops/user/my-registrations');
export const cancelMyRegistration = (registrationId) => apiRequest(`/workshops/user/registrations/${registrationId}/cancel`, {
    method: 'POST'
});

// Artist workshop APIs
export const artistCreateWorkshop = (workshopData) => apiRequest('/workshops/artist', {
    method: 'POST',
    body: JSON.stringify(workshopData)
});
export const artistGetMyWorkshops = () => apiRequest('/workshops/artist/my-workshops');
export const artistGetWorkshopParticipants = (workshopId) => apiRequest(`/workshops/artist/${workshopId}/participants`);
export const artistMarkAttendance = (registrationId, attendanceData) => apiRequest(`/workshops/artist/registrations/${registrationId}/attendance`, {
    method: 'PUT',
    body: JSON.stringify(attendanceData)
});

// Admin workshop APIs
export const adminGetAllWorkshops = () => apiRequest('/workshops/admin/all');
export const adminApproveWorkshop = (workshopId) => apiRequest(`/workshops/admin/${workshopId}/approve`, {
    method: 'POST'
});
export const adminRejectWorkshop = (workshopId) => apiRequest(`/workshops/admin/${workshopId}/reject`, {
    method: 'POST'
});
// ===========================================
// FEATURED ARTIST APIs
// ===========================================

export const getFeaturedArtists = () => apiRequest('/featured-artists');

export const adminGetFeaturedArtists = () => apiRequest('/featured-artists/admin/list');

export const createFeaturedArtist = (featuredData) => apiRequest('/featured-artists', {
    method: 'POST',
    body: JSON.stringify(featuredData)
});

export const updateFeaturedArtist = (id, featuredData) => apiRequest(`/featured-artists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(featuredData)
});

export const deleteFeaturedArtist = (id) => apiRequest(`/featured-artists/${id}`, {
    method: 'DELETE'
});

export const getArtistArtworksForFeatured = (id) => apiRequest(`/featured-artists/artists/${id}/artworks`);

export const updateArtistFeaturedArtworks = (id, artworkIds) => apiRequest(`/featured-artists/artists/${id}/featured-artworks`, {
    method: 'PUT',
    body: JSON.stringify({ artworkIds })
});

export const getPublicFeaturedArtworks = (id) => apiRequest(`/featured-artists/artists/${id}/public-featured-artworks`);

