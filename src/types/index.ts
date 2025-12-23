// Component Props Types
export interface HeaderProps {
  variant?: 'Default Home' | 'Internal Page' | 'After Login';
  theme?: 'light' | 'dark';
  logoSrc?: string;
}

export interface SliderProps {
  variant?: 'Default' | 'Variant2' | 'Variant3';
}

// Search Types
export interface SearchFormData {
  query: string;
  location: string;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  isActive?: boolean;
}

// Auth Types
export type UserRole = string;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: number;
  roleId?: string;
  // Provider-specific fields
  businessId?: string | null;
  isReviewed?: boolean;
  isOnboarded?: boolean;
}

// Provider KPIs Types
export interface ProviderKPIs {
  business_id: string;
  business_name: string;
  business_address: string;
  city_name: string;
  state_name: string;
  postal_code: string;
  business_image: string;
  total_bookings: number;
  total_customers: number;
  average_ratings: string;
  total_reviews: number;
  monthly_earning: number;
  currency: string;
}

export interface ProviderKPIsResponse {
  status: boolean;
  message: string;
  payload: ProviderKPIs;
}

// Provider Booking & Review Dashboard Types
export interface UpcomingBooking {
  id: string;
  created_at: number;
  business_id: string;
  user_id: string;
  services_id: string;
  booking_start_time: number;
  booking_end_time: number;
  status: string;
  final_amount_charged: number;
  user_first_name: string;
  user_last_name: string;
  service_name: string;
}

// Provider Booking Management Types
export interface BookingManagement {
  id: string;
  business_id: string;
  user_id: string;
  services_id: string;
  booking_start_time: number;
  booking_end_time: number;
  original_price: number;
  total_discount_amount: number;
  final_amount_charged: number;
  user_first_name: string;
  user_last_name: string;
  user_phone_number: string;
  user_profile_photo: string;
  service_name: string;
  service_duration: number;
}

export interface BookingManagementResponse {
  status: boolean;
  message: string;
  payload: BookingManagement[];
}

export interface CancelBookingRequest {
  business_id: string;
  booking_id: string;
  user_id: string;
}

export interface CancelBookingResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

// Provider Review Management Types
export interface ReviewDashboardItem {
  id: string;
  created_at: number;
  business_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  is_flagged: boolean;
  is_deleted: boolean;
  service_id: string;
  user_first_name: string;
  user_last_name: string;
  user_profile_photo: string;
  service_name: string | null;
}

export interface ReviewAnalytics {
  total_reviews: number;
  avg_rating: string;
  cnt_5: number;
  cnt_4: number;
  cnt_3: number;
  cnt_2: number;
  cnt_1: number;
}

export interface ReviewManagementPayload {
  review_dashboard: ReviewDashboardItem[];
  review_analytics: ReviewAnalytics[];
}

export interface ReviewManagementResponse {
  status: boolean;
  message: string;
  payload: ReviewManagementPayload;
}

export interface FlagReviewRequest {
  review_id: string;
  flag_reason: string;
  user_id: string;
  business_id: string;
}

export interface FlagReviewResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

// Business Info Types
export interface BusinessInfo {
  id: string;
  owner_user_id: string;
  business_name: string;
  description: string;
  phone_number: string;
  social_media_url: string;
  business_registration_number: string;
  business_category_id: string;
  category_name?: string; // Optional for backward compatibility
}

export interface BusinessInfoResponse {
  status: boolean;
  message: string;
  payload: BusinessInfo;
}

export interface EditBusinessInfoRequest {
  business_id: string;
  user_id: string;
  business_category_id: string;
  business_name: string;
  business_registration_number: string;
  description: string;
  phone_number: string;
  social_media_url: string;
}

export interface EditBusinessInfoResponse {
  response: {
    status: boolean;
    message: string;
    payload: {
      id: string;
      owner_user_id: string;
      business_name: string;
      description: string;
      phone_number: string;
      social_media_url: string;
      business_category_id: string;
      business_registration_number: string;
    };
  };
}

export interface LatestReview {
  id: string;
  created_at: number;
  business_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  is_flagged: boolean;
  user_first_name: string;
  user_last_name: string;
  user_profile_photo: string;
  service_name: string;
}

export interface PaginatedResponse<T> {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  itemsTotal: number;
  pageTotal: number;
  items: T[];
}

export interface BookingReviewDashboard {
  upcoming_booking: PaginatedResponse<UpcomingBooking>;
  latest_reviews: PaginatedResponse<LatestReview>;
}

export interface BookingReviewDashboardResponse {
  status: boolean;
  message: string;
  payload: BookingReviewDashboard;
}

export interface AuthContextType {
  user: User | null;
  authToken: string | null;
  adminToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  isLoggingOut: boolean;
  login: (token: string, user: User) => void;
  adminLogin: (token: string) => void;
  logout: () => void;
  adminLogout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export interface GoogleAuthResponse {
  authToken: string;
  user: User;
}

export interface CreateAccountRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  referCode?: string;
  countryCode: string;
  mobileNumber: string;
  role: UserRole;
  agreedToTerms: boolean;
}

export interface GoogleAuthRequest {
  code: string;
  redirect_uri: string;
  role: UserRole;
}

export interface PostMessageData {
  type: 'GOOGLE_AUTH_SUCCESS' | 'GOOGLE_AUTH_ERROR';
  token?: string;
  user?: User;
  error?: string;
}

// API Types (for future use)
export interface WellnessService {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  rating: number;
  imageUrl: string;
  category: string;
}

export interface BookingData {
  serviceId: string;
  date: string;
  time: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

// Public API: Categories
export interface Category {
  id: string;
  created_at: number;
  name: string;
  description: string;
  is_active: boolean;
  updated_at: number | null;
}

// Public API: Major Cities
export interface MajorCity {
  city_id: string;
  name: string;
  image_url: string;
  service_count: number;
}

// Public API: Trusted Partners
export interface TrustedPartner {
  business_id: string;
  business_name: string;
  total_reviews: number;
  avg_rating: string;
  thumbnail_image: string | null;
}

// Public API: Today's Top Picks
export interface TodayTopPick {
  business_id: string;
  services_id?: string;
  bookings_count?: number;
  business_name: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  country_code: string;
  phone_number: string;
  avg_rating: string;
  total_ratings: number;
  thumbnail_image: string;
  tags: string;
}

// Public API: Blogs
export interface Blog {
  id: string;
  author_id: string;
  blog_category_id: string;
  title: string;
  slug: string;
  content: string;
  minutes_read: number;
  blog_image: string;
  blog_category_name: string;
  published_at?: number;
}

export interface BlogsResponse {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  itemsTotal: number;
  pageTotal: number;
  items: Blog[];
}

export interface BlogDetail extends Blog {
  published_at: number;
}

// Public API: Today's Discounts
export interface Discount {
  id: string;
  type: 'percent' | 'off';
  service_id: string;
  image: string;
  valid_till: number;
  description: string;
  value: number;
  created_at?: number;
  business_id?: string;
}

export interface BusinessDiscountsResponse {
  status: boolean;
  message: string;
  payload: {
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
    offset: number;
    perPage: number;
    itemsTotal: number;
    pageTotal: number;
    items: Discount[];
  };
}

// Public API: States
export interface State {
  id: string;
  created_at: number;
  name: string;
  cities_id: string;
  is_active: boolean;
  updated_at: number | null;
}

// Public API: Cities
export interface City {
  id: string;
  created_at: number;
  name: string;
  image_url: string;
  is_active: boolean;
  updated_at: number | null;
}

export interface CitiesResponse {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal: number;
  pageTotal: number;
  items: City[];
}

// Public API: Priority Listing
export interface PriorityListing {
  business_id: string;
  business_name: string;
  description: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  country_code: string;
  phone_number: string;
  addons: string;
  avg_rating: string;
  total_reviews: number;
  image: string;
}

export interface PriorityListingResponse {
  status: boolean;
  message: string;
  payload: PriorityListing[];
}

// Public API: Business Listing
export interface BusinessListing {
  business_id: string;
  services_id: string;
  bookings_count: number;
  business_name: string;
  description: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  country_code: string;
  phone_number: string;
  addons: string;
  avg_rating: string;
  total_reviews: number;
  thumbnail_image: string;
  tags: string | null;
}

export interface BusinessListingResponse {
  status: boolean;
  message: string;
  payload: BusinessListing[];
}

// Public API: Service Listing
export interface Service {
  id: string;
  created_at: number;
  business_id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  updated_at: number | null;
  created_by: string;
  is_deleted: boolean;
  hide_price: number;
  next_available: number;
}

export interface ServiceListingResponse {
  status: boolean;
  message: string;
  payload: {
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
    offset: number;
    perPage: number;
    itemsTotal: number;
    pageTotal: number;
    items: Service[];
  };
}

// Protected API: Add Service
export interface AddServiceRequest {
  business_id: string;
  user_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

export interface AddServiceResponse {
  status: boolean;
  message: string;
  payload: Service;
}

// Protected API: Edit Service
export interface EditServiceRequest {
  business_id: string;
  user_id: string;
  service_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface EditServiceResponse {
  status: boolean;
  message: string;
  payload: Service;
}

// Public API: Business Detail
export interface OnlineConsultancy {
  id: string;
  created_at: number;
  addon_type: string;
  is_active: boolean;
  customer_description: string;
  image: string;
  amount: number;
  title: string;
}

export interface BusinessDetail {
  id: string;
  business_name: string;
  description: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  country_code: string;
  phone_number: string;
  social_media_url: string;
  cities_id: string;
  addons: string[];
  is_free_consultancy: boolean;
  review_average: number;
  review_count: number;
  is_favourite?: boolean;
  onine_consultancy?: OnlineConsultancy;
}

export interface BusinessDetailResponse {
  status: boolean;
  message: string;
  payload: BusinessDetail;
}

// Public API: Business Hours
export interface BusinessHourDay {
  day: number; // 1 = Monday, 2 = Tuesday, ..., 6 = Saturday
  is_open: boolean;
  start_time: number;
  end_time: number;
}

export interface BusinessHour {
  id: string;
  created_at: number;
  business_id: string;
  is_deleted: boolean;
  business_hours: BusinessHourDay[];
}

export interface BusinessHoursResponse {
  status: boolean;
  message: string;
  payload: BusinessHour;
}

// Location Availability Types
export interface LocationAvailability {
  id: string;
  owner_user_id: string;
  business_name: string;
  address_line_1: string;
  postal_code: string;
  country_code: string;
  phone_number: string;
  is_free_consultancy: boolean;
  cities_id: string;
  state_id: string;
  state_name: string;
  city_name: string;
}

export interface LocationAvailabilityResponse {
  status: boolean;
  message: string;
  payload: LocationAvailability;
}

export interface EditBusinessLocationRequest {
  user_id: string;
  business_id: string;
  business_address: string;
  city_id: string;
  state_id: string;
  postal_code: string;
}

export interface EditBusinessLocationResponse {
  response: {
    status: boolean;
    message: string;
    payload?: unknown;
  };
}

export interface EditWorkingHoursRequest {
  business_id: string;
  user_id: string;
  working_hours: Array<{
    day: number;
    is_open: boolean;
    start_time: number;
    end_time: number;
  }>;
}

export interface EditWorkingHoursResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

// Public API: Business Reviews
export interface BusinessReview {
  id: string;
  created_at: number;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string;
  service_name: string;
  user_first_name: string;
  user_last_name: string;
  user_profile_pic: string;
}

export interface BusinessReviewsResponse {
  status: boolean;
  message: string;
  payload: {
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
    offset: number;
    perPage: number;
    itemsTotal: number;
    pageTotal: number;
    items: BusinessReview[];
  };
}

// Public API: Business Images
export interface BusinessImageItem {
  image: string;
  is_thumbnail: boolean;
}

export interface BusinessImage {
  id: string;
  created_at: number;
  updated_at: number | null;
  business_id: string;
  is_deleted: boolean;
  business_images: BusinessImageItem[];
}

export interface BusinessImagesResponse {
  status: boolean;
  message: string;
  payload: BusinessImage;
}

// Protected API: Edit Business Images
export interface EditBusinessImagesRequest {
  business_id: string;
  user_id: string;
  business_images: BusinessImageItem[];
}

export interface EditBusinessImagesResponse {
  status: boolean;
  message: string;
}

// Protected API: Upload Images
export interface UploadImagesRequest {
  images: File[];
  user_id: string;
}

export interface UploadImagesResponse {
  status: boolean;
  message: string;
  payload: string[]; // Array of image URLs
}

// Customer API: Appointments
export interface Appointment {
  business_id: string;
  user_id: string;
  services_id: string;
  booking_start_time: number;
  status: 'upcoming' | 'past' | 'cancelled';
  final_amount_charged: number;
  service_name: string;
  booking_id: string;
  business_name: string;
  business_address_line1: string;
  business_postal_code: string;
  business_addons: string;
  business_image: string;
}

export interface AppointmentsResponse {
  status: boolean;
  message: string;
  payload: Appointment[];
}

// Customer API: Favourites
export interface Favourite {
  favourite_id: string;
  favourited_at: number;
  business_id: string;
  business_name: string;
  description: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  cities_id: string;
  country_code: string;
  phone_number: string;
  social_media_url: string;
  thumbnail_image: string;
  avg_rating: string;
  total_reviews: number;
}

export interface FavouritesResponse {
  status: boolean;
  message: string;
  payload: Favourite[];
}

// Customer API: Profile
export interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  is_active: boolean;
  phone_number: string;
  dob: string;
  gender: string;
  profile_photo: string;
}

export interface CustomerProfileResponse {
  status: boolean;
  message: string;
  payload: CustomerProfile;
}

export interface ProviderProfile {
  id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  is_active: boolean;
  phone_number: string;
  dob: string | null;
  gender: string;
  profile_photo: string;
}

export interface ProviderProfileResponse {
  status: boolean;
  message: string;
  payload: ProviderProfile;
}

// Public API: Hero Section Videos
export interface HeroVideo {
  id: string;
  asset_url: string;
  is_active: boolean;
}

export interface HeroVideosResponse {
  status: boolean;
  message: string;
  payload: HeroVideo[];
}

// Public API: Next Availability
export interface TimeSlot {
  time: number; // Unix timestamp in milliseconds
  is_available: boolean;
}

export interface NextAvailabilityPayload {
  date: string; // Unix timestamp in milliseconds as string
  business_id: string;
  services_id: string;
}

export interface NextAvailabilityResponse {
  status: boolean;
  message: string;
  payload: TimeSlot[] | NextAvailabilityPayload;
}

// Admin API: KPIs
export interface AdminKPIs {
  total_customers: number;
  active_providers: number;
  monthly_revenue: number;
}

export interface AdminKPIsResponse {
  status: boolean;
  message: string;
  payload: AdminKPIs;
}

// Admin API: Recent Reviews
export interface AdminRecentReview {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string;
  service_id: string;
  service_name: string | null;
  service_duration_minutes: number | null;
  user_first_name: string;
  user_last_name: string;
  user_profile_pic: string;
}

export interface AdminRecentReviewsPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminRecentReview[];
}

export interface AdminRecentReviewsResponse {
  status: boolean;
  message: string;
  payload: AdminRecentReviewsPayload;
}

// Admin API: Provider Verification
export interface AdminProviderVerification {
  id: string;
  created_at: number;
  owner_user_id: string;
  business_name: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  country_code: string;
  phone_number: string;
  is_reviewed: boolean;
  is_deleted: boolean;
  rejected: boolean;
  city_name: string;
  state_name: string | null;
  owner_email_id: string;
}

export interface AdminProviderVerificationPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminProviderVerification[];
}

export interface AdminProviderVerificationResponse {
  status: boolean;
  message: string;
  payload: AdminProviderVerificationPayload;
}

// Admin API: Provider Detail
export interface AdminProviderDetailImage {
  image: string;
  is_thumbnail: boolean;
}

export interface AdminProviderDetailBusinessHour {
  day: number;
  is_open: boolean;
  end_time: number;
  start_time: number;
}

export interface AdminProviderDetailService {
  id: string;
  created_at: number;
  business_id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  updated_at: number | null;
  created_by: string;
  is_deleted: boolean;
  currency: string;
}

export interface AdminProviderDetailPayload {
  id: string;
  owner_user_id: string;
  business_name: string;
  description: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  country_code: string;
  phone_number: string;
  social_media_url: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  is_free_consultancy: boolean;
  business_registration_number: string;
  business_hours: AdminProviderDetailBusinessHour[];
  images: AdminProviderDetailImage[];
  category: string;
  state_name: string;
  city_name: string;
  service: AdminProviderDetailService[];
}

export interface AdminProviderDetailResponse {
  status: boolean;
  message: string;
  payload: AdminProviderDetailPayload;
}

// Admin API: Customer Management
export interface AdminCustomerManagement {
  id: string;
  created_at: number;
  first_name: string;
  last_name: string;
  email_id: string;
  is_active: boolean;
  phone_number: string;
  profile_photo: string;
  total_bookings: number;
  total_money_spent: number;
}

export interface AdminCustomerManagementPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminCustomerManagement[];
}

export interface AdminCustomerManagementResponse {
  status: boolean;
  message: string;
  payload: AdminCustomerManagementPayload;
}

// Admin API: Booking Management
export interface AdminBookingManagement {
  created_at: number;
  business_id: string;
  user_id: string;
  services_id: string;
  status: string;
  currency: string;
  user_first_name: string;
  user_last_name: string;
  user_profile_pic: string;
  service_name: string;
  service_duration_mins: number;
  provider_name: string;
  total_money_spent: number;
}

export interface AdminBookingManagementPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminBookingManagement[];
}

export interface AdminBookingManagementResponse {
  status: boolean;
  message: string;
  payload: AdminBookingManagementPayload;
}

// Admin API: Review Management
export interface AdminReviewManagement {
  id: string;
  created_at: number;
  business_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  is_flagged: boolean;
  is_deleted: boolean;
  customer_first_name: string;
  customer_last_name: string;
  customer_profile_pic: string;
  provider: string;
  service: string | null;
  flag_reason?: string;
  flagged_by_first_name?: string;
  flagged_by_last_name?: string;
}

export interface AdminReviewManagementPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminReviewManagement[];
}

export interface AdminReviewManagementResponse {
  status: boolean;
  message: string;
  payload: AdminReviewManagementPayload;
}

// Admin API: Payment Management
export interface AdminPaymentManagement {
  id: string;
  status: string;
  payment_method: string;
  currency: string;
  payout_done: boolean;
  transaction_id: string;
  booking_name: string;
  booking_duration_mins: number;
  business_name: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_profile_pic: string | null;
  gross_amount: number;
  voucher_discount_amount: number;
  commission_amount: number;
  commission_type_amount: number;
  commission_type: string;
  processing_fee_amount: number;
  net_to_provider: number;
  net_to_admin: number;
  booking_start_time: number;
  platform_take_rate: number;
  processing_fee_type: string;
  processing_type_value: number;
}

export interface AdminPaymentManagementPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminPaymentManagement[];
}

export interface AdminPaymentManagementResponse {
  status: boolean;
  message: string;
  payload: AdminPaymentManagementPayload;
}

export interface AdminProviderManagement {
  id: string;
  created_at: number;
  business_name: string;
  is_deleted: boolean;
  email_id: string;
  subscription: string;
  category: string;
  total_bookings: number;
  monthly_revenue: number;
  payout_done: boolean | null;
  total_commission: number;
  total_processing_fee: number;
  commission_type: string;
  commission_value: number;
  payment_processing_fee_type: string;
  payment_processing_fee_value: number;
  week_net_to_provider: number;
  average_rating: number;
  total_reviews: number;
}

export interface AdminProviderManagementPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminProviderManagement[];
}

export interface AdminProviderManagementResponse {
  status: boolean;
  message: string;
  payload: AdminProviderManagementPayload;
}

export interface SubscriptionPlanFeature {
  [key: string]: string | boolean;
  is_active: boolean;
}

export interface SubscriptionPlanFeaturesJson {
  features: SubscriptionPlanFeature[];
}

export interface SubscriptionPlan {
  id: string;
  created_at: number;
  title: string;
  monthly_price: number;
  features_json: SubscriptionPlanFeaturesJson;
  is_active: boolean;
  updated_at: number | null;
  subtitle: string;
  tag_line: string;
  type: string;
  currency?: string;
}

export interface NumericData {
  id: string;
  created_at: number;
  business_subscription_plan_id: string;
  commission_new_customer: number;
  commission_repeat_customer: number;
  commission_type: string;
  updated_at: number;
  is_deleted: boolean;
  payment_processing_fee: number;
  new_cust_comm_is_active: boolean;
  repeat_cust_comm_is_active: boolean;
}

export interface AdminSubscriptionPlansResponse {
  status: boolean;
  message: string;
  payload: {
    plan_data: SubscriptionPlan[];
    numeric_data: NumericData[];
  };
}

export interface UpdateSubscriptionPlanRequest {
  plan_id: string;
  currency: string;
  subtitle: string;
  tagline: string;
  price: number;
  features: {
    features: Array<{
      [key: string]: string | boolean;
      is_active: boolean;
    }>;
  };
  new_customer_commission: number;
  repeat_customer_commission: number;
  pay_proc_commission: number;
  new_cust_comm_is_active: boolean;
  repeat_cust_comm_is_active: boolean;
  title: string;
  is_active: boolean;
}

export interface UpdateSubscriptionPlanResponse {
  status: boolean;
  message: string;
  payload?: any;
}

export interface AdminSettlePayoutItem {
  id: string;
  created_at: number;
  booking_id: string;
  business_id: string;
  service_name: string;
  amount: number | null;
  commission: number | null;
  commission_type_value: number | null;
  commission_type: string | null;
}

export interface AdminSettlePayoutPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminSettlePayoutItem[];
}

export interface AdminSettlePayoutResponse {
  status: boolean;
  message: string;
  payload: AdminSettlePayoutPayload;
}

export interface AdminRefundManagement {
  id: string;
  refund_customer: boolean;
  user_first_name: string;
  user_last_name: string;
  user_profile_photo: string;
  business_name: string;
  service_name: string;
  transaction_id: string;
  amount: number | null;
  date: number;
}

export interface AdminRefundManagementPayload {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  itemsTotal: number;
  pageTotal: number;
  items: AdminRefundManagement[];
}

export interface AdminRefundManagementResponse {
  status: boolean;
  message: string;
  payload: AdminRefundManagementPayload;
}
