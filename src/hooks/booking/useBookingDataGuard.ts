'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to clear booking_data when user navigates away from booking flow
 * Clears booking_data if:
 * - Route does NOT start with /booking
 * - AND no active payment retry is in progress (no payment_id in localStorage)
 */
export const useBookingDataGuard = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Don't clear if we're in the booking flow
    if (pathname?.startsWith('/booking')) {
      return;
    }

    // Don't clear if there's an active payment retry in progress
    const hasActivePayment = localStorage.getItem('payment_id');
    if (hasActivePayment) {
      return;
    }

    // Clear booking_data when leaving booking flow
    localStorage.removeItem('booking_data');
  }, [pathname]);
};


