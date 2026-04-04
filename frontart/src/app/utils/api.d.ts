// Type declarations for api.js
export function apiRequest(endpoint: string, options?: RequestInit): Promise<any>;
export function login(email: string, password: string): Promise<any>;
export function register(username: string, displayName: string, email: string, password: string, phone?: string): Promise<any>;
export function verifyEmail(token: string): Promise<any>;
export function resendVerification(email: string): Promise<any>;
export function forgotPassword(email: string): Promise<any>;
export function verifyOtp(email: string, otp: string): Promise<any>;
export function resetPassword(email: string, newPassword: string, confirmPassword: string): Promise<any>;
export function getMe(): Promise<any>;
export function logout(): Promise<any>;
export function refreshToken(refreshToken: string): Promise<any>;

// Artist application
export function applyArtist(formData: FormData): Promise<any>;
export function sendArtistEmailOtp(): Promise<any>;
export function verifyArtistEmailOtp(otp: string): Promise<any>;
export function getMyArtistApplication(): Promise<any>;
export function checkStudentSubmissionAvailability(params?: { username?: string; email?: string }): Promise<any>;
export function submitStudentArtworkSubmission(formData: FormData): Promise<any>;
export function getStudentArtworkPublishingSetting(): Promise<any>;
export function updateStudentArtworkPublishingSetting(enabled: boolean): Promise<any>;

// Admin artist application
export function getArtistApplicationStats(): Promise<any>;
export function getArtistApplications(params?: Record<string, any>): Promise<any>;
export function getArtistApplicationDetails(applicationId: string): Promise<any>;
export function markApplicationUnderReview(applicationId: string): Promise<any>;
export function approveArtistApplication(applicationId: string, adminNotes?: string): Promise<any>;
export function rejectArtistApplication(applicationId: string, rejectionReason?: string, adminNotes?: string, cooldownDays?: number): Promise<any>;
export function sendArtistSuggestion(applicationId: string, suggestion: string): Promise<any>;
export function deleteArtistApplication(applicationId: string): Promise<any>;

// User APIs
export function updateProfile(profileData: any): Promise<any>;
export function changePassword(passwordData: any): Promise<any>;
export function getAddresses(): Promise<any>;
export function addAddress(addressData: any): Promise<any>;
export function updateAddress(addressId: string, addressData: any): Promise<any>;
export function deleteAddress(addressId: string): Promise<any>;
export function setDefaultAddress(addressId: string): Promise<any>;
export function applyForArtist(applicationData: any): Promise<any>;
export function getArtistStatus(): Promise<any>;
export function requestProfileEdit(editData: any): Promise<any>;

// Admin user management
export function getAllUsers(params?: Record<string, any>): Promise<any>;
export function getPendingArtistApplications(): Promise<any>;
export function reviewArtistApplication(userId: string, reviewData: any): Promise<any>;
export function updateUserRole(userId: string, roleData: any): Promise<any>;
export function toggleUserStatus(userId: string): Promise<any>;

// Products
export function getProducts(params?: Record<string, any>): Promise<any>;
export function getProductBySlug(slug: string): Promise<any>;
export function getCategories(): Promise<any>;
export function toggleLike(productId: string): Promise<any>;
export function getMyProducts(): Promise<any>;
export function getMyRequests(): Promise<any>;
export function markRequestSeen(requestId: string): Promise<any>;
export function requestCreateProduct(formData: FormData): Promise<any>;
export function requestEditProduct(productId: string, formData: FormData): Promise<any>;
export function requestDeleteProduct(productId: string): Promise<any>;
export function createProduct(formData: FormData): Promise<any>;
export function adminGetPendingRequests(): Promise<any>;
export function adminGetRequestDetails(requestId: string): Promise<any>;
export function adminApproveRequest(requestId: string, adminNote?: string): Promise<any>;
export function adminRejectRequest(requestId: string, rejectionReason?: string, adminNote?: string): Promise<any>;
export function adminGetAllProducts(params?: Record<string, any>): Promise<any>;
export function adminCreateProduct(formData: FormData): Promise<any>;
export function adminEditProduct(productId: string, formData: FormData): Promise<any>;
export function adminDeleteProduct(productId: string): Promise<any>;
export function adminGetAllServices(params?: Record<string, any>): Promise<any>;

// Cart
export function getCart(): Promise<any>;
export function addToCart(cartData: any): Promise<any>;
export function updateCartItem(updateData: any): Promise<any>;
export function removeFromCart(productId: string): Promise<any>;
export function clearCart(): Promise<any>;

// Orders
export function createOrder(orderData: any): Promise<any>;
export function verifyPayment(orderId: string, paymentData: any): Promise<any>;
export function getMyOrders(params?: Record<string, any>): Promise<any>;
export function getOrderById(orderId: string): Promise<any>;
export function cancelOrder(orderId: string): Promise<any>;
export function getOrders(params?: Record<string, any>): Promise<any>;
export function getArtistOrders(): Promise<any>;
export function updateOrderStatus(orderId: string, statusData: any): Promise<any>;
export function adminGetAllOrders(params?: Record<string, any>): Promise<any>;
export function adminUpdateOrderStatus(orderId: string, statusData: any): Promise<any>;

// Wishlist
export function getWishlist(): Promise<any>;
export function addToWishlist(productData: any): Promise<any>;
export function removeFromWishlist(productId: string): Promise<any>;
export function clearWishlist(): Promise<any>;
export function checkWishlistItem(productId: string): Promise<any>;
export function toggleWishlistItem(productData: any): Promise<any>;

// Reviews
export function getProductReviews(productId: string, params?: Record<string, any>): Promise<any>;
export function createReview(reviewData: any): Promise<any>;
export function getMyReviews(): Promise<any>;
export function updateReview(reviewId: string, reviewData: any): Promise<any>;
export function deleteReview(reviewId: string): Promise<any>;
export function markReviewHelpful(reviewId: string): Promise<any>;

// Coupons
export function validateCoupon(couponData: any): Promise<any>;
export function getAvailableCoupons(): Promise<any>;
export function getCoupons(): Promise<any>;

// Notifications
export function getNotifications(params?: Record<string, any>): Promise<any>;
export function getUnreadCount(): Promise<any>;
export function markAsRead(notificationId: string): Promise<any>;
export function markNotificationRead(notificationId: string): Promise<any>;
export function markAllAsRead(): Promise<any>;
export function markAllNotificationsRead(): Promise<any>;
export function deleteNotification(notificationId: string): Promise<any>;
export function clearAllNotifications(): Promise<any>;

// Services
export function getServices(params?: Record<string, any>): Promise<any>;
export function getServiceBySlug(slug: string): Promise<any>;
export function getServiceCategories(): Promise<any>;
export function getStudioHireConfig(): Promise<any>;
export function bookStudioHire(bookingData: any): Promise<any>;
export function adminUpdateStudioHireConfig(studioData: any): Promise<any>;
export function adminUploadStudioHireImages(formData: FormData): Promise<any>;
export function getPlatformServiceConfig(key: string): Promise<any>;
export function adminUpdatePlatformServiceConfig(key: string, serviceData: any): Promise<any>;
export function adminUploadPlatformServiceImages(key: string, formData: FormData): Promise<any>;
export function bookPlatformService(key: string, bookingData: any): Promise<any>;
export function bookService(serviceId: string, bookingData: any): Promise<any>;
export function getMyBookings(): Promise<any>;
export function cancelMyBooking(bookingId: string): Promise<any>;

// Workshops
export function getWorkshops(params?: Record<string, any>): Promise<any>;
export function getWorkshopBySlug(slug: string): Promise<any>;
export function getWorkshopById(id: string): Promise<any>;
export function getWorkshopCategories(): Promise<any>;
export function registerForWorkshop(workshopId: string, registrationData: any): Promise<any>;
export function getMyRegistrations(): Promise<any>;
export function cancelMyRegistration(registrationId: string): Promise<any>;

