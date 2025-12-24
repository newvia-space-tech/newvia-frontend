'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import { useAuth } from '@/context/AuthContext';
import { useAdminKPIs } from '@/hooks/admin/useAdminKPIs';
import { useAdminRecentReviews } from '@/hooks/admin/useAdminRecentReviews';
import { useAdminProviderVerification } from '@/hooks/admin/useAdminProviderVerification';
import { 
  Bell, 
  Users, 
  Coins,
  MapPin,
  Star,
  ChevronRight
} from 'lucide-react';

// Helper function to format time ago from timestamp
const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

// Helper function to format address
const formatAddress = (provider: { address_line_1: string; address_line_2: string; city_name: string; state_name: string | null; postal_code: string }): string => {
  const parts = [
    provider.address_line_1,
    provider.address_line_2,
    provider.city_name,
    provider.state_name,
    provider.postal_code
  ].filter(Boolean);
  return parts.join(', ');
};


export default function AdminOverviewPage() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const bellButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { adminToken } = useAuth();
  const { data: kpisData, isLoading: kpisLoading, error: kpisError } = useAdminKPIs(adminToken);
  const { data: recentReviewsData, isLoading: reviewsLoading, error: reviewsError } = useAdminRecentReviews(adminToken, 1, 3);
  const { data: providerVerificationData, isLoading: verificationLoading, error: verificationError } = useAdminProviderVerification(adminToken, 'all', 1, 4);

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

  // Format statistics from API data
  const statistics = kpisData?.payload ? [
    {
      label: 'Total Customers',
      value: kpisData.payload.total_customers.toLocaleString(),
      icon: Users,
      color: '#ffde82'
    },
    {
      label: 'Active Providers',
      value: kpisData.payload.active_providers.toLocaleString(),
      icon: Coins,
      color: '#ffde82'
    },
    {
      label: 'Monthly Revenue',
      value: `RM ${kpisData.payload.monthly_revenue.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`,
      icon: Coins,
      color: '#ffde82'
    }
  ] : [
    {
      label: 'Total Customers',
      value: '-',
      icon: Users,
      color: '#ffde82'
    },
    {
      label: 'Active Providers',
      value: '-',
      icon: Coins,
      color: '#ffde82'
    },
    {
      label: 'Monthly Revenue',
      value: '-',
      icon: Coins,
      color: '#ffde82'
    }
  ];

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center justify-between pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            <div className="flex flex-col gap-0.5">
              <h1 
                className="text-xl font-bold text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 700,
                  lineHeight: '28px'
                }}
              >
                Admin Dashboard
              </h1>
              <p 
                className="text-sm text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Overview of your New Via platform
              </p>
            </div>
            {/* <div 
              ref={bellButtonRef}
              className="bg-white rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors relative"
              onClick={handleBellClick}
            >
              <Bell size={20} className="text-black" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </div> */}
          </div>
        </div>

        {/* Notification Modal */}
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={handleCloseNotification}
          position={getNotificationPosition()}
        />

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4">
            {kpisLoading ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-7 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="rounded-lg p-2 shrink-0 bg-gray-200 w-9 h-9 animate-pulse" />
                </div>
              ))
            ) : kpisError ? (
              // Error state
              <div className="col-span-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  Failed to load KPIs. Please try again later.
                </p>
              </div>
            ) : (
              // Success state
              statistics.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 flex items-start justify-between"
                  >
                    <div className="flex flex-col gap-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        {stat.label}
                      </p>
                      <p 
                        className="text-xl font-bold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 700,
                          lineHeight: '28px'
                        }}
                      >
                        {stat.value}
                      </p>
                    </div>
                    <div 
                      className="rounded-lg p-2 shrink-0"
                      style={{ backgroundColor: stat.color }}
                    >
                      <IconComponent size={20} className="text-black" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {/* Provider Verification */}
            <div className="bg-white rounded-lg p-5 h-[438px] flex flex-col">
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
                    Provider Verification
                  </h2>
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Review and manage provider verification
                  </p>
                </div>
                {providerVerificationData?.payload && providerVerificationData.payload.pageTotal > 1 && (
                  <button 
                    className="flex gap-1 items-center hover:opacity-70 transition-opacity cursor-pointer"
                    onClick={() => {
                      router.push('/admin/verification');
                    }}
                  >
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
                      className="text-[#797e84]" 
                    />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 flex-1">
                {verificationLoading ? (
                  // Loading state
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-[#f8f9f8] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 items-center flex-1 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-gray-200 animate-pulse shrink-0" />
                          <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse shrink-0" />
                      </div>
                    </div>
                  ))
                ) : verificationError ? (
                  // Error state
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      Failed to load provider verification. Please try again later.
                    </p>
                  </div>
                ) : providerVerificationData?.payload?.items && providerVerificationData.payload.items.length > 0 ? (
                  // Success state
                  providerVerificationData.payload.items.map((provider) => {
                    const address = formatAddress(provider);
                    const timeAgo = formatTimeAgo(provider.created_at);
                    
                    return (
                      <div
                        key={provider.id}
                        className="bg-[#f8f9f8] rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-3 items-center flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${provider.is_reviewed ? 'bg-green-500' : 'bg-[#425f4d]'}`} />
                            <div className="flex flex-col gap-1 flex-1 min-w-0">
                              <p 
                                className="text-base font-medium text-black truncate"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '24px'
                                }}
                                title={provider.business_name}
                              >
                                {provider.business_name}
                              </p>
                              <div className="flex gap-1 items-center min-w-0">
                                <MapPin size={16} className="text-[#797e84] shrink-0" />
                                <p 
                                  className="text-sm text-[#797e84] truncate"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '20px'
                                  }}
                                  title={address}
                                >
                                  {address}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p 
                            className="text-sm text-[#797e84] shrink-0 whitespace-nowrap ml-2"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            {timeAgo}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Empty state
                  <div className="text-center py-8">
                    <p className="text-sm text-[#797e84]">
                      No provider verifications available
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg p-5 flex flex-col">
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
                {recentReviewsData?.payload && recentReviewsData.payload.pageTotal > 1 && (
                  <button 
                    className="flex gap-1 items-center hover:opacity-70 transition-opacity cursor-pointer"
                    onClick={() => {
                      router.push('/admin/review');
                    }}
                  >
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
                      className="text-[#797e84]" 
                    />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {reviewsLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-[#f8f9f8] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2 items-center">
                          <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                          <div className="flex flex-col gap-2">
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          ))}
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))
                ) : reviewsError ? (
                  // Error state
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                      Failed to load recent reviews. Please try again later.
                    </p>
                  </div>
                ) : recentReviewsData?.payload?.items && recentReviewsData.payload.items.length > 0 ? (
                  // Success state
                  recentReviewsData.payload.items.map((review) => {
                    const customerName = `${review.user_first_name} ${review.user_last_name}`;
                    const serviceName = review.service_name || 'Service';
                    const initials = `${review.user_first_name.charAt(0)}${review.user_last_name.charAt(0)}`;
                    
                    return (
                      <div
                        key={review.id}
                        className="bg-[#f8f9f8] rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex gap-2 items-center">
                            {review.user_profile_pic ? (
                              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                                <Image
                                  src={review.user_profile_pic}
                                  alt={customerName}
                                  width={36}
                                  height={36}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                                <span className="text-xs text-gray-600">
                                  {initials}
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
                                {customerName}
                              </p>
                              <p 
                                className="text-sm text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '20px'
                                }}
                              >
                                {serviceName}
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
                    );
                  })
                ) : (
                  // Empty state
                  <div className="text-center py-8">
                    <p className="text-sm text-[#797e84]">
                      No recent reviews available
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

