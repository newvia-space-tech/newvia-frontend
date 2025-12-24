'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { Mail, MessageSquare, Clock, Shield, Download } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getPaymentStatus, getBookingDetail, BookingDetail } from '@/services/booking/booking';

// Helper function to format timestamp to time string
const formatTimeFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

// Helper function to format date
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper function to get day name
const getDayName = (timestamp: number): string => {
  const date = new Date(timestamp);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}${mins > 0 ? `, ${mins} min${mins > 1 ? 's' : ''}` : ''}`;
  }
  return `${mins} min${mins > 1 ? 's' : ''}`;
};

// Helper function to format address
const formatAddress = (bookingData: BookingDetail | null): string => {
  if (!bookingData) return '';
  const parts = [
    bookingData.address_line_1,
    bookingData.address_line_2,
    bookingData.postal_code
  ].filter(Boolean);
  return parts.join(', ');
};

type PaymentStatus = 'pending' | 'successful' | 'failed' | 'cancelled' | 'timeout' | 'loading' | 'invalid';

export default function BookingSuccessPage() {
  const router = useRouter();
  const { user, authToken } = useAuth();
  
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('loading');
  const [bookingData, setBookingData] = useState<BookingDetail | null>(null);
  const [businessImage, setBusinessImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingStartTimeRef = useRef<number | null>(null);
  const hasFetchedBookingRef = useRef(false);

  // Read payment_id from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedPaymentId = localStorage.getItem('payment_id');
    if (!storedPaymentId) {
      setPaymentStatus('invalid');
      return;
    }
    
    setPaymentId(storedPaymentId);
    pollingStartTimeRef.current = Date.now();
  }, []);

  // Poll payment status
  useEffect(() => {
    if (!paymentId || !user?.id || !authToken || paymentStatus === 'invalid') return;

    const pollPaymentStatus = async () => {
      try {
        const response = await getPaymentStatus(paymentId, user.id, authToken);
        const status = response.payload;

        if (status === 'successful') {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }

          // Fetch booking details if not already fetched
          if (!hasFetchedBookingRef.current) {
            hasFetchedBookingRef.current = true;
            try {
              const bookingResponse = await getBookingDetail(paymentId, user.id, authToken);
              const booking = bookingResponse.payload;
              setBookingData(booking);

              // Get thumbnail image
              if (booking.business_images && booking.business_images.length > 0) {
                const thumbnailImage = booking.business_images.find(img => img.is_thumbnail && img.image && img.image.trim() !== '');
                if (thumbnailImage) {
                  setBusinessImage(thumbnailImage.image);
                } else {
                  const firstValidImage = booking.business_images.find(img => img.image && img.image.trim() !== '');
                  if (firstValidImage) {
                    setBusinessImage(firstValidImage.image);
                  } else {
                    setBusinessImage(null);
                  }
                }
              } else {
                setBusinessImage(null);
              }

              // Clear localStorage
              localStorage.removeItem('payment_id');
              localStorage.removeItem('idempotency_key');
              // Clear booking_data on successful payment
              localStorage.removeItem('booking_data');
            } catch (err) {
              console.error('Failed to fetch booking details:', err);
              setError('Failed to load booking details');
            }
          }

          setPaymentStatus('successful');
        } else if (status === 'failed') {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPaymentStatus('failed');
        } else if (status === 'pending') {
          setPaymentStatus('pending');
          
          // Check for timeout (60 seconds)
          if (pollingStartTimeRef.current && Date.now() - pollingStartTimeRef.current > 60000) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            setPaymentStatus('timeout');
          }
        } else if (status === 'cancelled') {
          // Stop polling
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setPaymentStatus('cancelled');
        }
      } catch (err) {
        console.error('Failed to poll payment status:', err);
        // Don't stop polling on error, just log it
      }
    };

    // Poll immediately
    pollPaymentStatus();

    // Set up polling interval (every 3 seconds)
    pollingIntervalRef.current = setInterval(pollPaymentStatus, 3000);

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [paymentId, user?.id, authToken, paymentStatus]);

  // Handle retry payment
  const handleRetryPayment = () => {
    // Clear old payment data
    localStorage.removeItem('payment_id');
    localStorage.removeItem('idempotency_key');
    
    // Navigate back to booking page
    router.push('/booking');
  };

  // Handle back to services
  const handleBackToServices = () => {
    router.push('/services');
  };

  // Handle download receipt
  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download functionality
    console.log('Download receipt');
  };

  // Loading state (initial)
  if (paymentStatus === 'loading') {
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
          <div className="text-center">
            <p className="text-red-500 text-lg mb-4">Invalid or expired payment session.</p>
            <button
              onClick={handleBackToServices}
              className="px-6 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pending state
  if (paymentStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#f8f9f8]">
        <UnifiedHeader showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6290f2] mx-auto mb-4"></div>
            <p className="text-lg text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Verifying your payment. Please do not refresh.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Timeout state
  if (paymentStatus === 'timeout') {
    return (
      <div className="min-h-screen bg-[#f8f9f8]">
        <UnifiedHeader showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg text-black mb-4" style={{ fontFamily: 'Lato, sans-serif' }}>
              Payment is taking longer than expected.
            </p>
            <button
              onClick={handleBackToServices}
              className="px-6 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Back to Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-[#f8f9f8]">
        <UnifiedHeader showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Payment Failed
            </h2>
            <p className="text-[#797e84] mb-6" style={{ fontFamily: 'Lato, sans-serif' }}>
              Your payment could not be processed. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
<button
              onClick={handleRetryPayment}
              className="px-6 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
                Retry Payment
              </button>
              <button
                onClick={handleBackToServices}
                className="px-6 py-2 border border-[#6290f2] text-[#6290f2] rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Back to Services
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show booking confirmation
  if (paymentStatus === 'successful' && bookingData) {
    const formattedTime = `${formatTimeFromTimestamp(bookingData.booking_start_time)} (${getDayName(bookingData.booking_start_time)})`;

    return (
      <div className="min-h-screen bg-[#f8f9f8]">
        <UnifiedHeader showSearchBar={false} />
        
        <div className="px-4 sm:px-6 lg:px-8 xl:px-20 py-10 sm:py-16">
          <div className="max-w-4xl mx-auto flex flex-col gap-5 sm:gap-6">
            {/* Success Confirmation Card */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col gap-5 sm:gap-6 items-center">
                {/* Success Icon */}
                <div className="relative w-[200px] sm:w-[250px] h-[200px] sm:h-[250px] flex items-center justify-center">
                  <Image
                    src="/figma-assets/success.gif"
                    alt="Success"
                    width={250}
                    height={250}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                </div>

                {/* Success Message */}
                <div className="flex flex-col gap-1.5 sm:gap-2 items-center text-center max-w-[350px]">
                  <h1 
                    className="text-xl sm:text-2xl lg:text-3xl font-semibold text-black"
                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '32px' }}
                  >
                    Booking Confirmed!
                  </h1>
                  <p 
                    className="text-base sm:text-lg text-[#797e84]"
                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '24px' }}
                  >
                    Your wellness appointment has been successfully booked
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Details Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:gap-8">
                {/* Section Title */}
                <h2 
                  className="text-base sm:text-lg font-semibold text-black"
                  style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                >
                  Appointment Details
                </h2>

                <div className="flex flex-col gap-5 sm:gap-6">
                  {/* Business Info */}
                  <div className="flex gap-3 sm:gap-4 items-center">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {businessImage ? (
                        <Image
                          src={businessImage}
                          alt={bookingData.business_name}
                          width={60}
                          height={60}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="flex flex-col items-center gap-1 text-gray-400">
                            <svg 
                              className="w-6 h-6 sm:w-8 sm:h-8" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1.5} 
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                              />
                            </svg>
                            <span className="text-[8px] font-medium">No Image</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-lg sm:text-xl font-semibold text-black mb-1"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '28px' }}
                      >
                        {bookingData.business_name}
                      </h3>
                      <p 
                        className="text-sm sm:text-base text-[#797e84] truncate"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                      >
                        {formatAddress(bookingData)}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Appointment Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                    <div className="flex flex-col gap-2">
                      <p 
                        className="text-sm sm:text-base text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                      >
                        Date
                      </p>
                      <p 
                        className="text-sm sm:text-base font-semibold text-black"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                      >
                        {formatDate(bookingData.booking_start_time)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p 
                        className="text-sm sm:text-base text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                      >
                        Time
                      </p>
                      <p 
                        className="text-sm sm:text-base font-semibold text-black"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                      >
                        {formattedTime}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p 
                        className="text-sm sm:text-base text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                      >
                        Service
                      </p>
                      <p 
                        className="text-sm sm:text-base font-semibold text-black"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                      >
                        {bookingData.service_name}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <p 
                        className="text-sm sm:text-base text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                      >
                        Duration
                      </p>
                      <p 
                        className="text-sm sm:text-base font-semibold text-black"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                      >
                        {formatDuration(bookingData.service_duration_minutes)}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Payment Summary */}
                  <div className="flex flex-col gap-4 sm:gap-5">
                    <h3 
                      className="text-base sm:text-lg font-normal text-black"
                      style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '28px' }}
                    >
                      Payment Summary
                    </h3>
                    
                    <div className="flex flex-col gap-3 sm:gap-4">
                      <div className="flex justify-between items-center">
                        <p 
                          className="text-sm sm:text-base text-black"
                          style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                        >
                          Service Charge
                        </p>
                        <p 
                          className="text-sm sm:text-base font-semibold text-black"
                          style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                        >
                          RM {bookingData.gross_price.toFixed(2)}
                        </p>
                      </div>
                      
                      {bookingData.total_discount > 0 && (
                        <div className="flex justify-between items-center">
                          <p 
                            className="text-sm sm:text-base text-[#797e84]"
                            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                          >
                            Discount
                          </p>
                          <p 
                            className="text-sm sm:text-base font-semibold text-[#797e84]"
                            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                          >
                            -RM {bookingData.total_discount.toFixed(2)}
                          </p>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t border-gray-200"></div>

                      <div className="flex justify-between items-center">
                        <p 
                          className="text-sm sm:text-base text-black"
                          style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                        >
                          Total Paid
                        </p>
                        <p 
                          className="text-sm sm:text-base font-semibold text-black"
                          style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                        >
                          RM {bookingData.amount_paid.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Next Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:gap-8">
                <h2 
                  className="text-base sm:text-lg font-semibold text-black"
                  style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}
                >
                  What&apos;s Next?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Confirmation Email */}
                  <div className="flex gap-4 items-start">
                    <div className="bg-[rgba(98,144,242,0.1)] rounded-lg p-2 flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#6290f2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-sm sm:text-base font-medium text-black mb-1"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '24px' }}
                      >
                        Confirmation Email
                      </h3>
                      <p 
                        className="text-xs sm:text-sm text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                      >
                        You&apos;ll receive your booking details and receipt via email within 5 minutes.
                      </p>
                    </div>
                  </div>

                  {/* Visit Reminder */}
                  <div className="flex gap-4 items-start">
                    <div className="bg-[rgba(98,144,242,0.1)] rounded-lg p-2 flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-[#6290f2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-sm sm:text-base font-medium text-black mb-1"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '24px' }}
                      >
                        Visit Reminder
                      </h3>
                      <p 
                        className="text-xs sm:text-sm text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                      >
                        We&apos;ll send you a quick reminder with all the key details before your appointment.
                      </p>
                    </div>
                  </div>

                  {/* Arrive Early */}
                  <div className="flex gap-4 items-start">
                    <div className="bg-[rgba(98,144,242,0.1)] rounded-lg p-2 flex-shrink-0">
                      <Clock className="w-6 h-6 text-[#6290f2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-sm sm:text-base font-medium text-black mb-1"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '24px' }}
                      >
                        Arrive Early
                      </h3>
                      <p 
                        className="text-xs sm:text-sm text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                      >
                        Please arrive 10-15 minutes before your appointment time for check-in.
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="flex gap-4 items-start">
                    <div className="bg-[rgba(98,144,242,0.1)] rounded-lg p-2 flex-shrink-0">
                      <Shield className="w-6 h-6 text-[#6290f2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-sm sm:text-base font-medium text-black mb-1"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '24px' }}
                      >
                        Cancellation Policy
                      </h3>
                      <p 
                        className="text-xs sm:text-sm text-[#797e84]"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                      >
                        Free cancellation up to 24 hours before your appointment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Receipt Button */}
            <div className="flex justify-center">
              <button
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto border border-[#6290f2] rounded-lg px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 hover:bg-[#6290f2] hover:text-white transition-colors cursor-pointer"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                <span 
                  className="text-sm sm:text-base text-[#6290f2] hover:text-white transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                >
                  Download Receipt
                </span>
                <Download className="w-5 h-5 text-[#6290f2] hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback loading state
  return (
    <div className="min-h-screen bg-[#f8f9f8]">
      <UnifiedHeader showSearchBar={false} />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6290f2]"></div>
      </div>
    </div>
  );
}
