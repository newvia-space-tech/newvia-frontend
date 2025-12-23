'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLES } from '@/lib/constants';
import { useBookingDataGuard } from '@/hooks/booking/useBookingDataGuard';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Clear booking_data when navigating away from booking flow
  useBookingDataGuard();

  return (
    <ProtectedRoute roles={[ROLES?.customer]} redirectTo="/auth/login/customer">
      {children}
    </ProtectedRoute>
  );
}