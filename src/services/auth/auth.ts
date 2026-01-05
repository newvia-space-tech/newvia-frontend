import { GoogleAuthResponse, User, CreateAccountRequest, UserRole } from '@/types';
import { apiRequest } from '../common/apiRequest';

// API Error type
interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL environment variable is required');
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  authToken: string;
  user: User;
}

// Google OAuth callback
export const googleAuthCallback = async (code: string, role: 'customer' | 'provider'): Promise<GoogleAuthResponse> => {
  const response = await apiRequest('auth/google/continue', {
    method: 'POST',
    body: JSON.stringify({
      code,
      redirect_uri: `${APP_URL}/auth/callback`,
      role,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Google authentication failed');
  }

  const data = await response.json();
  
  // Transform the response to match our expected format
  return {
    authToken: data.payload.token,
    user: {
      id: data.payload.user.id,
      email: data.payload.user.email_id,
      name: `${data.payload.user.first_name} ${data.payload.user.last_name}`,
      role: role,
      avatar: data.payload.user.profile_photo,
      phone: data.payload.user.phone_number,
      // Provider-specific fields (only present for provider role)
      businessId: data.payload.business_id,
      isReviewed: data.payload.is_reviewed,
      isOnboarded: data.payload.is_onboarded,
    }
  };
};

// Login with email and password
export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
  const response = await apiRequest('auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: loginData.email,
      password: loginData.password,
      role: loginData.role,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'Login failed';
    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const data = await response.json();
  
  // Transform the response to match our expected format
  return {
    authToken: data.payload.token,
    user: {
      id: data.payload.user.id,
      email: data.payload.user.email_id,
      name: `${data.payload.user.first_name} ${data.payload.user.last_name}`,
      role: loginData.role,
      avatar: data.payload.user.profile_photo || '',
      firstName: data.payload.user.first_name,
      lastName: data.payload.user.last_name,
      createdAt: data.payload.user.created_at,
      // Provider-specific fields (only present for provider role)
      businessId: data.payload.business_id,
      isReviewed: data.payload.is_reviewed,
      isOnboarded: data.payload.is_onboarded,
    }
  };
};

// Validate current token and get user info
export const validateToken = async (token: string): Promise<User> => {
  const response = await apiRequest('/auth/me', {
    method: 'GET',
  }, token);

  if (!response.ok) {
    throw new Error('Token validation failed');
  }

  return response.json();
};

// Admin login
export interface AdminLoginRequest {
  email_id: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  user_id: string;
}

export const adminLogin = async (loginData: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await apiRequest('admin/login', {
    method: 'POST',
    body: JSON.stringify({
      email_id: loginData.email_id,
      password: loginData.password,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'Admin login failed';
    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const data = await response.json();
  
  return {
    token: data.payload.token,
    user_id: data.payload.user_id,
  };
};

// Create account
export const createAccount = async (accountData: CreateAccountRequest): Promise<string> => {
  // Transform data to match API format
  // Parse phone number - ensure it's a valid number
  const phoneNumber = accountData.mobileNumber.trim();
  if (!phoneNumber || isNaN(Number(phoneNumber))) {
    throw new Error('Invalid phone number');
  }

  const requestBody = {
    first_name: accountData.firstName,
    last_name: accountData.lastName,
    email: accountData.email,
    password: accountData.password,
    refer_code: accountData.referCode || '',
    role: accountData.role,
    phone_number: parseInt(phoneNumber, 10),
    country_code: accountData.countryCode,
  };

  const response = await apiRequest('auth/register', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'Account creation failed';
    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // 200 OK - registration successful, return message from API
  const successData = await response.json().catch(() => ({}));
  return successData.message || 'Account created successfully!';
};

// Update password
export interface UpdatePasswordRequest {
  new_password: string;
}

export interface UpdatePasswordResponse {
  status: boolean;
  message: string;
}

export const updatePassword = async (
  passwordData: UpdatePasswordRequest,
  authToken: string
): Promise<UpdatePasswordResponse> => {
  const response = await apiRequest('auth/update_password', {
    method: 'POST',
    body: JSON.stringify({
      new_password: passwordData.new_password,
    }),
  }, authToken);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'Failed to update password';
    const error = new Error(errorMessage) as ApiError;
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const data = await response.json();
  return data;
};

