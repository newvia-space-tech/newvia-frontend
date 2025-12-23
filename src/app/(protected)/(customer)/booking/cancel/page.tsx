'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { useAuth } from '@/context/AuthContext';
import { getPaymentStatus } from '@/services/booking/booking';

export default function BookingCancelPage() {
  const router = useRouter();
  const { user, authToken } = useAuth();
  
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'checking' | 'success' | 'cancelled' | 'failed' | 'pending' | 'invalid'>('loading');
  const [hasChecked, setHasChecked] = useState(false);

  // Read payment_id from localStorage on mount
  // DO NOT clear booking_data here - it needs to be preserved for retry
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedPaymentId = localStorage.getItem('payment_id');
    if (!storedPaymentId) {
      setPaymentStatus('invalid');
      return;
    }
    
    setPaymentId(storedPaymentId);
    // Note: booking_data is NOT cleared here - it's needed for retry
  }, []);

  // Check payment status once
  useEffect(() => {
    if (!paymentId || !user?.id || !authToken || hasChecked || paymentStatus === 'invalid') return;

    const checkPaymentStatus = async () => {
      setHasChecked(true);
      setPaymentStatus('checking');

      try {
        const response = await getPaymentStatus(paymentId, user.id, authToken);
        const status = response.payload;

        if (status === 'successful') {
          // Redirect to success page immediately
          setPaymentStatus('success');
          router.push('/booking/success');
        } else if (status === 'pending' || status === 'cancelled' || status === 'failed') {
          setPaymentStatus(status);
        } else {
          setPaymentStatus('cancelled');
        }
      } catch (err) {
        console.error('Failed to check payment status:', err);
        // Assume cancelled if check fails
        setPaymentStatus('cancelled');
      }
    };

    checkPaymentStatus();
  }, [paymentId, user?.id, authToken, hasChecked, paymentStatus, router]);

  // Handle retry payment - redirect to booking page with booking_data
  const handleRetryPayment = () => {
    if (typeof window === 'undefined') return;
    
    // Clear old payment data
    localStorage.removeItem('payment_id');
    localStorage.removeItem('idempotency_key');
    
    // Read booking_data from localStorage
    const storedBookingData = localStorage.getItem('booking_data');
    
    if (!storedBookingData) {
      // If booking_data is missing, redirect to booking page with error
      router.push('/booking?error=session_expired');
      return;
    }
    
    try {
      const bookingData = JSON.parse(storedBookingData);
      const { businessId, serviceId } = bookingData;
      
      if (businessId && serviceId) {
        // Redirect to booking page with business_id and service_id
        // booking_data will be preserved and form will be pre-filled
        router.push(`/booking?business_id=${businessId}&service_id=${serviceId}`);
      } else {
        // Invalid booking_data structure, redirect with error
        router.push('/booking?error=session_expired');
      }
    } catch (error) {
      console.error('Failed to parse booking_data:', error);
      // Invalid booking_data, redirect with error
      router.push('/booking?error=session_expired');
    }
  };

  // Loading state
  if (paymentStatus === 'loading' || paymentStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#f8f9f8]">
        <UnifiedHeader showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6290f2]"></div>
        </div>
      </div>
    );
  }

  // Invalid payment session
  if (paymentStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-[#f8f9f8]">
        <UnifiedHeader showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-sm mx-auto px-4">
            <div className="w-40 h-40 sm:w-[180px] sm:h-[180px] mx-auto mb-6 sm:mb-8 flex items-center justify-center">
              <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-24 h-24 sm:w-32 sm:h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mb-6 sm:mb-8">
              <h2 
                className="text-xl sm:text-[22px] font-bold text-black leading-[28px]"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Payment Failed!
              </h2>
              <p 
                className="text-sm sm:text-[15px] font-medium text-[#797e84] leading-[20px]"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                No active payment found. Please try again.
              </p>
            </div>
            <button
              onClick={handleRetryPayment}
              className="w-full sm:w-auto bg-[#6290f2] text-white rounded-lg px-4 py-2.5 hover:bg-[#4a7ae8] transition-colors text-sm font-normal leading-[20px]"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Retry Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success redirect (shouldn't be visible, but handle just in case)
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen bg-[#f8f9f8]">
        <UnifiedHeader showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg text-black mb-4">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  // Cancelled/Failed state - matches Figma design
  return (
    <div className="min-h-screen bg-[#f8f9f8] relative">
      <UnifiedHeader showSearchBar={false} />
      
      {/* Main Content - Centered */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center w-full max-w-[380px]">
          {/* Cross Symbol Icon */}
          <div className="relative w-40 h-40 sm:w-[180px] sm:h-[180px] mb-6 sm:mb-8">
            {/* Red circle with X icon - matches Figma design */}
            <div className="w-full h-full bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-24 h-24 sm:w-32 sm:h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="flex flex-col gap-1.5 sm:gap-2 items-center px-4 sm:px-5 w-full mb-6 sm:mb-8">
            <div className="flex flex-col gap-1 sm:gap-1.5 items-center text-center w-full">
              <h2 
                className="text-xl sm:text-[22px] font-bold text-black leading-[28px] sm:leading-[30px] w-full"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Payment Failed!
              </h2>
              <p 
                className="text-sm sm:text-[15px] font-medium text-[#797e84] leading-[20px] sm:leading-[22px] w-full"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                We couldn&apos;t process your order this time.
                <br />
                Please check your payment method or try again.
              </p>
            </div>
          </div>

          {/* Retry Payment Button */}
          <button
            onClick={handleRetryPayment}
            className="bg-[#6290f2] text-white rounded-lg px-4 sm:px-4 py-2.5 sm:py-2.5 min-h-[36px] w-full hover:bg-[#4a7ae8] transition-colors flex items-center justify-center"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            <span className="text-sm font-normal leading-[20px] whitespace-pre">
              Retry Payment
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

