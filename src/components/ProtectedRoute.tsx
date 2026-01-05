'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  roles,
  redirectTo
}) => {
  const { isAuthenticated, loading, isLoggingOut, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Show loading spinner while checking authentication or logging out
  if (loading || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{isLoggingOut ? 'Logging out...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Include return URL (current path + search params) so user can be redirected back after login
    const returnUrl = typeof window !== 'undefined' 
      ? encodeURIComponent(window.location.pathname + window.location.search)
      : '';
    const loginUrl = redirectTo || '/auth/login/customer';
    const loginUrlWithReturn = returnUrl 
      ? `${loginUrl}${loginUrl.includes('?') ? '&' : '?'}returnUrl=${returnUrl}`
      : loginUrl;
    router.push(loginUrlWithReturn);
    return null;
  }

  // Enforce role-based access when roles are provided
  if (roles && user && !roles.includes(user.role)) {
    router.push(redirectTo || '/');
    return null;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
