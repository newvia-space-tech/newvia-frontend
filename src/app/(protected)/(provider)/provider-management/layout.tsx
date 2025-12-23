import { ReactNode } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLES } from '@/lib/constants';

interface ProviderManagementLayoutProps {
  children: ReactNode;
}

export default function ProviderManagementLayout({ children }: ProviderManagementLayoutProps) {
  return (
    <ProtectedRoute roles={[ROLES.provider]} redirectTo="/auth/login/provider">
      {children}
    </ProtectedRoute>
  );
}

