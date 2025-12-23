import { AdminKPIsResponse, AdminRecentReviewsResponse, AdminProviderVerificationResponse, AdminBookingManagementResponse, AdminReviewManagementResponse, AdminProviderDetailResponse, AdminCustomerManagementResponse, AdminPaymentManagementResponse, AdminProviderManagementResponse, AdminSettlePayoutResponse, AdminRefundManagementResponse, AdminSubscriptionPlansResponse, UpdateSubscriptionPlanRequest, UpdateSubscriptionPlanResponse } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Protected: Get admin KPIs (requires admin authentication)
export const getAdminKPIs = async (adminToken: string): Promise<AdminKPIsResponse> => {
  const response = await apiRequest(
    'admin/kpis',
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin KPIs');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin KPIs');
  }

  return data;
};

// Protected: Get admin recent reviews (requires admin authentication)
export const getAdminRecentReviews = async (
  adminToken: string,
  page: number = 1,
  perPage: number = 3
): Promise<AdminRecentReviewsResponse> => {
  const response = await apiRequest(
    `admin/recent-reviews?page=${page}&perPage=${perPage}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin recent reviews');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin recent reviews');
  }

  return data;
};

// Protected: Get admin provider verification (requires admin authentication)
export const getAdminProviderVerification = async (
  adminToken: string,
  filter: string = 'all',
  page: number = 1,
  perPage: number = 4
): Promise<AdminProviderVerificationResponse> => {
  const response = await apiRequest(
    `admin/provider-verification?filter=${filter}&page=${page}&perPage=${perPage}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin provider verification');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin provider verification');
  }

  return data;
};

// Protected: Get admin booking management (requires admin authentication)
export const getAdminBookingManagement = async (
  adminToken: string,
  filter: string = 'all',
  page: number = 1,
  perPage: number = 10,
  search: string = ''
): Promise<AdminBookingManagementResponse> => {
  const params = new URLSearchParams({
    filter,
    page: page.toString(),
    perPage: perPage.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  const response = await apiRequest(
    `admin/booking-management?${params.toString()}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin booking management');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin booking management');
  }

  return data;
};

// Protected: Get admin review management (requires admin authentication)
export const getAdminReviewManagement = async (
  adminToken: string,
  page: number = 1,
  perPage: number = 10
): Promise<AdminReviewManagementResponse> => {
  const response = await apiRequest(
    `admin/review-management?page=${page}&perPage=${perPage}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin review management');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin review management');
  }

  return data;
};

// Protected: Get admin customer management (requires admin authentication)
export const getAdminCustomerManagement = async (
  adminToken: string,
  page: number = 1,
  perPage: number = 10,
  search: string = ''
): Promise<AdminCustomerManagementResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  const response = await apiRequest(
    `admin/customer-management?${params.toString()}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin customer management');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin customer management');
  }

  return data;
};

// Protected: Flag/Unflag review (requires admin authentication)
export interface FlagUnflagReviewRequest {
  review_id: string;
  action: 'flag' | 'unflag';
}

export interface FlagUnflagReviewResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

export const flagUnflagReview = async (
  payload: FlagUnflagReviewRequest,
  adminToken: string
): Promise<FlagUnflagReviewResponse> => {
  const response = await apiRequest(
    'admin/flag-unflag-review',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to flag/unflag review');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to flag/unflag review');
  }

  return data;
};

// Protected: Get admin provider detail (requires admin authentication)
export const getAdminProviderDetail = async (
  adminToken: string,
  businessId: string
): Promise<AdminProviderDetailResponse> => {
  const response = await apiRequest(
    `admin/provider-detail?business_id=${businessId}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch provider detail');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch provider detail');
  }

  return data;
};

// Protected: Approve/Reject provider (requires admin authentication)
export interface ApproveRejectProviderRequest {
  business_id: string;
  rejection_reason?: string;
  action: 'approve' | 'reject';
}

export interface ApproveRejectProviderResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

export const approveRejectProvider = async (
  payload: ApproveRejectProviderRequest,
  adminToken: string
): Promise<ApproveRejectProviderResponse> => {
  const response = await apiRequest(
    'admin/reject-provider',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to approve/reject provider');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to approve/reject provider');
  }

  return data;
};

// Protected: Get admin payment management (requires admin authentication)
export const getAdminPaymentManagement = async (
  adminToken: string,
  page: number = 1,
  perPage: number = 10,
  search: string = ''
): Promise<AdminPaymentManagementResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  const response = await apiRequest(
    `admin/payment-management?${params.toString()}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin payment management');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin payment management');
  }

  return data;
};

// Protected: Get admin provider management (requires admin authentication)
export const getAdminProviderManagement = async (
  adminToken: string,
  page: number = 1,
  perPage: number = 10
): Promise<AdminProviderManagementResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });
  
  const response = await apiRequest(
    `admin/provider-management?${params.toString()}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch admin provider management');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch admin provider management');
  }

  return data;
};

// Protected: Get admin settle payout (requires admin authentication)
export const getAdminSettlePayout = async (
  adminToken: string,
  businessId: string,
  page: number = 1,
  perPage: number = 4
): Promise<AdminSettlePayoutResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
    business_id: businessId,
  });
  
  const response = await apiRequest(
    `admin/settle-payout?${params.toString()}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch settle payout data');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch settle payout data');
  }

  return data;
};

// Protected: Settle payout (requires admin authentication)
export interface SettlePayoutRequest {
  payment_id: string[];
}

export interface SettlePayoutResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

export const settlePayout = async (
  payload: SettlePayoutRequest,
  adminToken: string
): Promise<SettlePayoutResponse> => {
  const response = await apiRequest(
    'admin/settle-payout',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to settle payout');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to settle payout');
  }

  return data;
};

// Protected: Get admin refund management (requires admin authentication)
export const getAdminRefundManagement = async (
  adminToken: string,
  page: number = 1,
  perPage: number = 10,
  search: string = ''
): Promise<AdminRefundManagementResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    perPage: perPage.toString(),
  });
  
  if (search) {
    params.append('search', search);
  }
  
  const response = await apiRequest(
    `admin/refund-mgmt?${params.toString()}`,
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch refund management data');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch refund management data');
  }

  return data;
};

// Protected: Settle refund (requires admin authentication)
export interface SettleRefundRequest {
  refund_id: string;
}

export interface SettleRefundResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

export const settleRefund = async (
  payload: SettleRefundRequest,
  adminToken: string
): Promise<SettleRefundResponse> => {
  const response = await apiRequest(
    'admin/refund-mgmt',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to settle refund');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to settle refund');
  }

  return data;
};

// Protected: Get admin subscription plans (requires admin authentication)
export const getAdminSubscriptionPlans = async (
  adminToken: string
): Promise<AdminSubscriptionPlansResponse> => {
  const response = await apiRequest(
    'admin/subscription_plan',
    { method: 'GET' },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch subscription plans');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch subscription plans');
  }

  return data;
};

// Protected: Update admin subscription plan (requires admin authentication)
export const updateAdminSubscriptionPlan = async (
  payload: UpdateSubscriptionPlanRequest,
  adminToken: string
): Promise<UpdateSubscriptionPlanResponse> => {
  const response = await apiRequest(
    'admin/subscription',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    adminToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update subscription plan');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to update subscription plan');
  }

  return data;
};
