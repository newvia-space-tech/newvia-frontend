'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute component restricts providers from accessing public pages.
 * If a provider tries to access a public page, they will be logged out.
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't check while loading
    if (loading) return;

    // If user is a provider, log them out
    if (user && user.role === 'provider') {
      // Log out the provider
      logout();
      // Redirect to provider login page with a message
      router.push('/auth/login/provider');
    }
  }, [user, loading, logout, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is a provider, show loading state while logging out
  if (user && user.role === 'provider') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Render public content for non-providers
  return <>{children}</>;
};

export default PublicRoute;

