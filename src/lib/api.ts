/**
 * @deprecated This file is kept for backward compatibility.
 * Please import directly from the module-based services:
 * - @/services/auth/auth
 * - @/services/profile/profile
 * - @/services/business/business
 * - @/services/service/service
 * - @/services/booking/booking
 * - @/services/review/review
 * - @/services/favourite/favourite
 * - @/services/blog/blog
 * - @/services/city/city
 * - @/services/discount/discount
 * - @/services/landing/landing
 * - @/services/admin/admin
 * - @/services/common/apiRequest
 */

// Re-export all API functions from module-based services
export { apiRequest, authenticatedApiCall } from '@/services/common/apiRequest';
export { googleAuthCallback, validateToken, createAccount, login, adminLogin, type LoginRequest, type LoginResponse, type AdminLoginRequest, type AdminLoginResponse } from '@/services/auth/auth';
export { getCustomerProfile, updateCustomerProfile, type UpdateCustomerProfileRequest, type UpdateCustomerProfileResponse } from '@/services/profile/profile';
export { getBusinessDetail, getBusinessHours, getBusinessImages, getBusinessListing, getPriorityListing } from '@/services/business/business';
export { getCategories, getServiceListing } from '@/services/service/service';
export { getCustomerAppointments, getNextAvailability } from '@/services/booking/booking';
export { getBusinessReviews, addReview } from '@/services/review/review';
export { getCustomerFavourites } from '@/services/favourite/favourite';
export { getBlogs, getFeaturedBlogs, getBlogDetail } from '@/services/blog/blog';
export { getMajorCities, getAllCities } from '@/services/city/city';
export { getTodayDiscounts, getBusinessDiscounts } from '@/services/discount/discount';
export { getTrustedPartners, getTodayTopPicks, getHeroVideos } from '@/services/landing/landing';
export { getAdminKPIs, getAdminRecentReviews, getAdminProviderVerification, getAdminBookingManagement, getAdminReviewManagement } from '@/services/admin/admin';
