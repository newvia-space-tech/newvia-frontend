const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const X_BRANCH = process.env.NEXT_PUBLIC_X_BRANCH;
const X_DATA_SOURCE = process.env.NEXT_PUBLIC_X_DATA_SOURCE;

if (!BACKEND_API_URL) {
  throw new Error('NEXT_PUBLIC_BACKEND_API_URL environment variable is required');
}

// API request helper with auth token
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  authToken?: string
): Promise<Response> => {
  const url = `${BACKEND_API_URL}${endpoint}`;
  
  // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
  const isFormData = options.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  // Add x-branch header if environment variable is set
  if (X_BRANCH) {
    headers['x-branch'] = X_BRANCH;
  }

  // Add x-data-source header if environment variable is set
  if (X_DATA_SOURCE) {
    headers['x-data-source'] = X_DATA_SOURCE;
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token is invalid
  if (response.status === 401) {
    // Check if this is an admin API call (admin endpoints typically start with 'admin/')
    const isAdminEndpoint = endpoint.startsWith('admin/');
    
    if (isAdminEndpoint) {
      // Clear admin token from localStorage
      localStorage.removeItem('adminToken');
      // Redirect to admin login page
      window.location.href = '/auth/login/admin';
    } else {
      // Clear user token from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login page
      window.location.href = '/auth/login/customer';
    }
    throw new Error('Authentication failed');
  }

  return response;
};

// Generic API call with auth
export const authenticatedApiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  authToken: string
): Promise<T> => {
  const response = await apiRequest(endpoint, options, authToken);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API request failed');
  }

  return response.json();
};

