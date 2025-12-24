'use client';

import { ReactNode, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/lib/constants';

interface ProviderManagementLayoutProps {
  children: ReactNode;
}

function ProviderManagementContent({ children }: ProviderManagementLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useLayoutEffect(() => {
    if (loading) return;

    // If user is a provider and hasn't completed onboarding, redirect to onboarding
    if (user?.role === 'provider' && user?.isOnboarded === false) {
      router.replace('/provider-onboarding');
      return;
    }

    // If user is onboarded but not reviewed, they shouldn't be here
    if (user?.role === 'provider' && user?.isOnboarded === true && user?.isReviewed === false) {
      // Log them out or show a message - they shouldn't have access
      router.replace('/');
      return;
    }

    setIsCheckingOnboarding(false);
  }, [user, loading, router]);

  // Show loading while checking onboarding status
  if (loading || isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function ProviderManagementLayout({ children }: ProviderManagementLayoutProps) {
  return (
    <ProtectedRoute roles={[ROLES.provider]} redirectTo="/auth/login/provider">
      <ProviderManagementContent>{children}</ProviderManagementContent>
    </ProtectedRoute>
  );
}

