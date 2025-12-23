import { AppointmentsResponse, NextAvailabilityResponse } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Customer: Get appointments
export const getCustomerAppointments = async (userId: string, filter: 'upcoming' | 'past' | 'cancelled', authToken: string): Promise<AppointmentsResponse> => {
  const response = await apiRequest(`customer/my-appoinments?user_id=${userId}&filter=${filter}`, { method: 'GET' }, authToken);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch appointments');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch appointments');
  }

  return data;
};

// Customer: Get next availability for bookings (requires authentication)
export const getNextAvailability = async (
  date: number,
  businessId: string,
  serviceId: string,
  authToken: string
): Promise<NextAvailabilityResponse> => {
  const response = await apiRequest(
    `bookings/next-availability?date=${date}&business_id=${businessId}&services_id=${serviceId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch next availability');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch next availability');
  }

  return data;
};

// Create Stripe checkout session
export interface CreateCheckoutSessionRequest {
  user_id: string;
  business_id: string;
  service_id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  phone_number: string;
  success_url: string;
  cancel_url: string;
  service_time_slot: number;
  currency: string;
  idempotency_key: string;
}

export interface CreateCheckoutSessionResponse {
  status: boolean;
  message: string;
  payload: {
    url: string;
    payment_id: string;
  };
}

export const createCheckoutSession = async (
  payload: CreateCheckoutSessionRequest,
  authToken: string
): Promise<CreateCheckoutSessionResponse> => {
  const response = await apiRequest(
    'payment/create-checkout-session',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Handle 400 errors - extract message key
    if (response.status === 400) {
      const errorMessage = errorData.message || 'Failed to create checkout session';
      throw new Error(errorMessage);
    }
    const errorMessage = errorData.message || 'Failed to create checkout session';
    throw new Error(errorMessage);
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to create checkout session');
  }

  return data;
};

// Get payment status
export interface PaymentStatusResponse {
  status: boolean;
  message: string;
  payload: 'pending' | 'successful' | 'failed' | 'cancelled';
}

export const getPaymentStatus = async (
  paymentId: string,
  userId: string,
  authToken: string
): Promise<PaymentStatusResponse> => {
  const response = await apiRequest(
    `payment/payment-status?payment_id=${paymentId}&user_id=${userId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch payment status');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch payment status');
  }

  return data;
};

// Get booking detail
export interface BookingDetail {
  id: string;
  customer_id: string;
  business_id: string;
  service_id: string;
  status: string;
  amount_paid: number;
  gross_price: number;
  total_discount: number;
  booking_start_time: number;
  service_name: string;
  service_duration_minutes: number;
  business_name: string;
  address_line_1: string;
  address_line_2: string;
  postal_code: string;
  phone_number: string;
  social_media_url: string;
  cities_id: string;
  state_id: string;
  business_images: Array<{
    image: string;
    is_thumbnail: boolean;
  }>;
}

export interface BookingDetailResponse {
  status: boolean;
  message: string;
  payload: BookingDetail;
}

export const getBookingDetail = async (
  paymentId: string,
  userId: string,
  authToken: string
): Promise<BookingDetailResponse> => {
  const response = await apiRequest(
    `bookings/booking-detail?user_id=${userId}&payment_id=${paymentId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch booking detail');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch booking detail');
  }

  return data;
};

// Get booking discount
export interface BookingDiscountPayload {
  amount_paid_by_customer: number;
  total_discount: number;
  voucher_discount_amount: number;
  first_time_booking_discount: number;
  gross_amount: number;
  refer_code_discounted_amount: number;
}

export interface BookingDiscountResponse {
  status: boolean;
  message: string;
  payload: BookingDiscountPayload;
}

export const getBookingDiscount = async (
  businessId: string,
  userId: string,
  serviceId: string,
  authToken: string
): Promise<BookingDiscountResponse> => {
  const response = await apiRequest(
    `bookings/discount?business_id=${businessId}&user_id=${userId}&service_id=${serviceId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch booking discount');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch booking discount');
  }

  return data;
};

// Customer: Cancel booking
export interface CancelBookingRequest {
  booking_id: string;
  user_id: string;
}

export interface CancelBookingResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

export const cancelBooking = async (
  payload: CancelBookingRequest,
  authToken: string
): Promise<CancelBookingResponse> => {
  const response = await apiRequest(
    'customer/cancel-booking',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to cancel booking');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to cancel booking');
  }

  return data;
};

// Customer: Get invoice/receipt
export interface InvoiceResponse {
  status: boolean;
  message: string;
  payload: string; // HTML content
}

export const getCustomerInvoice = async (
  userId: string,
  bookingId: string,
  authToken: string
): Promise<InvoiceResponse> => {
  const response = await apiRequest(
    `customer/invoice?user_id=${userId}&booking_id=${bookingId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch invoice');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch invoice');
  }

  return data;
};

