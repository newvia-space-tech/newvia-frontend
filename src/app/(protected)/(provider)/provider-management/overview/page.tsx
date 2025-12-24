'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import { useAuth } from '@/context/AuthContext';
import { useProviderKPIs } from '@/hooks/business/useProviderKPIs';
import { useBookingReviewDashboard } from '@/hooks/business/useBookingReviewDashboard';
import { 
  Bell, 
  Coins, 
  CalendarCheck, 
  Star, 
  Users,
  ChevronRight,
  ImageOff
} from 'lucide-react';

export default function OverviewPage() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const bellButtonRef = useRef<HTMLDivElement>(null);
  const { user, authToken } = useAuth();
  
  // Fetch KPIs data
  const { data: kpisData, isLoading: isLoadingKPIs, error: kpisError } = useProviderKPIs(
    user?.businessId || null,
    user?.id || null,
    authToken
  );

  // Fetch Booking-Review Dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard, error: dashboardError } = useBookingReviewDashboard(
    user?.businessId || null,
    user?.id || null,
    authToken
  );

  const kpis = kpisData?.payload;
  const upcomingBookings = dashboardData?.payload?.upcoming_booking?.items || [];
  const recentReviews = dashboardData?.payload?.latest_reviews?.items || [];
  const upcomingBookingsHasMore = dashboardData?.payload?.upcoming_booking?.nextPage !== null;
  const recentReviewsHasMore = dashboardData?.payload?.latest_reviews?.nextPage !== null;

  // Helper function to format timestamp to readable date
  const formatBookingDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const formatted = date.toLocaleString('en-US', options);
    // Convert to desired format: "2024-01-15 at 10:00 am"
    const [datePart, timePart] = formatted.split(', ');
    const [month, day, year] = datePart.split('/');
    return `${year}-${month}-${day} at ${timePart.toLowerCase()}`;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number, currency?: string) => {
    return `${currency || 'RM'} ${amount.toFixed(2)}`;
  };

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleCloseNotification = () => {
    setIsNotificationOpen(false);
  };

  const getNotificationPosition = () => {
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      };
    }
    return { top: 80, right: 36 };
  };

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <ProviderSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center justify-between pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            {isLoadingKPIs ? (
              <div className="flex gap-3 items-center">
                <div className="w-[42px] h-[42px] bg-gray-200 animate-pulse rounded-full" />
                <div className="flex flex-col gap-2">
                  <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ) : kpisError ? (
              <div className="flex gap-3 items-center">
                <div className="w-[42px] h-[42px] bg-gray-100 rounded-full flex items-center justify-center">
                  <ImageOff size={20} className="text-gray-400" />
                </div>
                <div className="flex flex-col items-start">
                  <h1 
                    className="text-base font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '24px'
                    }}
                  >
                    Business Dashboard
                  </h1>
                  <p 
                    className="text-sm text-red-500"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Failed to load business information
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 items-center">
                <div className="w-[42px] h-[42px] relative bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {kpis?.business_image ? (
                    <Image
                      src={kpis.business_image}
                      alt="Business Logo"
                      width={42}
                      height={42}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <h1 
                    className="text-base font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '24px'
                    }}
                  >
                    {kpis?.business_name || 'Business Dashboard'}
                  </h1>
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    {kpis ? `${kpis.business_address}, ${kpis.city_name}, ${kpis.state_name} – ${kpis.postal_code}` : 'Loading...'}
                  </p>
                </div>
              </div>
            )}
            {/* Bell icon commented out for now
            <div 
              ref={bellButtonRef}
              className="bg-white rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors relative"
              onClick={handleBellClick}
            >
              <Bell size={20} className="text-black" />
              Notification badge
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </div>
            */}
          </div>
        </div>

        {/* Notification Modal */}
        {/* <NotificationModal
          isOpen={isNotificationOpen}
          onClose={handleCloseNotification}
          position={getNotificationPosition()}
        /> */}

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
          {/* Statistics Cards */}
          {isLoadingKPIs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="h-7 w-24 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="w-11 h-11 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              ))}
            </div>
          ) : kpisError ? (
            <div className="bg-white rounded-lg p-8 mb-4 text-center">
              <p className="text-red-500 text-base" style={{ fontFamily: 'Lato, sans-serif' }}>
                {kpisError.message || 'Failed to load KPIs data'}
              </p>
            </div>
          ) : !kpis ? (
            <div className="bg-white rounded-lg p-8 mb-4 text-center">
              <p className="text-gray-500 text-base" style={{ fontFamily: 'Lato, sans-serif' }}>
                No data available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-4">
              {/* Monthly Earnings */}
              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Monthly Earnings
                  </p>
                  <p 
                    className="text-xl font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '28px'
                    }}
                  >
                    {kpis.currency} {kpis.monthly_earning.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg p-2 shrink-0 bg-[#ffde82]">
                  <Coins size={20} className="text-black" />
                </div>
              </div>

              {/* Total Bookings */}
              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Total Bookings
                  </p>
                  <p 
                    className="text-xl font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '28px'
                    }}
                  >
                    {kpis.total_bookings.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg p-2 shrink-0 bg-[#ffde82]">
                  <CalendarCheck size={20} className="text-black" />
                </div>
              </div>

              {/* Average Rating */}
              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Average Rating
                  </p>
                  <p 
                    className="text-xl font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '28px'
                    }}
                  >
                    {kpis.average_ratings || 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg p-2 shrink-0 bg-[#ffde82]">
                  <Star size={20} className="text-black" />
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-white rounded-lg p-4 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Total Customers
                  </p>
                  <p 
                    className="text-xl font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '28px'
                    }}
                  >
                    {kpis.total_customers.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg p-2 shrink-0 bg-[#ffde82]">
                  <Users size={20} className="text-black" />
                </div>
              </div>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Upcoming Bookings */}
            <div className="bg-white rounded-lg p-4 sm:p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col gap-0.5">
                  <h2 
                    className="text-base font-medium text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '24px'
                    }}
                  >
                    Upcoming Bookings
                  </h2>
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Your next 5 appointments
                  </p>
                </div>
                {upcomingBookingsHasMore && (
                  <button className="flex gap-1 items-center cursor-pointer">
                    <span 
                      className="text-sm text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      View more
                    </span>
                    <ChevronRight 
                      size={16} 
                      className=" text-[#797e84]" 
                    />
                  </button>
                )}
              </div>

              {isLoadingDashboard ? (
                <div className="flex flex-col gap-6">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex gap-3 items-center flex-1">
                        <div className="w-2 h-2 bg-gray-200 animate-pulse rounded-full" />
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                          <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
                        <div className="h-4 w-36 bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : dashboardError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
                    {dashboardError.message || 'Failed to load bookings'}
                  </p>
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
                    No upcoming bookings
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-2 h-2 rounded-full bg-[#425f4d] shrink-0" />
                        <div className="flex flex-col gap-1">
                          <p 
                            className="text-base font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '24px'
                            }}
                          >
                            {booking.user_first_name} {booking.user_last_name}
                          </p>
                          <p 
                            className="text-sm text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            {booking.service_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <p 
                          className="text-base font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '24px'
                          }}
                        >
                          {formatCurrency(booking.final_amount_charged, kpis?.currency)}
                        </p>
                        <p 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          {formatBookingDate(booking.booking_start_time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg p-4 sm:p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex flex-col gap-0.5">
                  <h2 
                    className="text-base font-medium text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '24px'
                    }}
                  >
                    Recent Reviews
                  </h2>
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Latest customer feedback
                  </p>
                </div>
                {recentReviewsHasMore && (
                  <button className="flex gap-1 items-center cursor-pointer">
                    <span 
                      className="text-sm text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      View all
                    </span>
                    <ChevronRight 
                      size={16} 
                      className=" text-[#797e84]" 
                    />
                  </button>
                )}
              </div>

              {isLoadingDashboard ? (
                <div className="flex flex-col gap-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-[#f8f9f8] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2 items-center flex-1">
                          <div className="w-9 h-9 bg-gray-200 animate-pulse rounded-full" />
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-4 h-4 bg-gray-200 animate-pulse rounded" />
                          ))}
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                    </div>
                  ))}
                </div>
              ) : dashboardError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
                    {dashboardError.message || 'Failed to load reviews'}
                  </p>
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm" style={{ fontFamily: 'Lato, sans-serif' }}>
                    No reviews yet
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-[#f8f9f8] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2 items-center">
                          {review.user_profile_photo ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={review.user_profile_photo}
                                alt={`${review.user_first_name} ${review.user_last_name}`}
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                              <span className="text-xs text-gray-600 font-medium">
                                {review.user_first_name.charAt(0)}{review.user_last_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <p 
                              className="text-base font-medium text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 500,
                                lineHeight: '24px'
                              }}
                            >
                              {review.user_first_name} {review.user_last_name}
                            </p>
                            <p 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              {review.service_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-[#ffde82] text-[#ffde82]' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

