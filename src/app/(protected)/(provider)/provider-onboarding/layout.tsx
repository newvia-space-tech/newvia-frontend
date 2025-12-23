import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLES } from '@/lib/constants';

interface ProviderOnboardingLayoutProps {
  children: ReactNode;
}

export default function ProviderOnboardingLayout({ children }: ProviderOnboardingLayoutProps) {
  return (
    <ProtectedRoute roles={[ROLES.provider]} redirectTo="/">
      <div className="min-h-screen bg-[#f8f9f8]">
        {children}
      </div>
    </ProtectedRoute>
  );
}
