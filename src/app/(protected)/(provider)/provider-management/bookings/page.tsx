'use client';

import React, { useState } from 'react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import ViewBookingModal from '@/components/provider/ViewBookingModal';
import CancelBookingModal from '@/components/provider/CancelBookingModal';
import { useAuth } from '@/context/AuthContext';
import { useBookingManagement } from '@/hooks/business/useBookingManagement';
import { useCancelBooking } from '@/hooks/business/useCancelBooking';
import { Eye, X } from 'lucide-react';

type BookingStatus = 'upcoming' | 'past' | 'cancelled';

interface Booking {
  id: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  pricing: string;
  duration: string;
  status: BookingStatus;
  serviceCharge?: number;
  discount?: number;
  totalPaid?: number;
  currency?: string;
}

const getStatusBadgeColor = (status: BookingStatus): { bg: string; text: string; dot: string } => {
  switch (status) {
    case 'upcoming':
      return {
        bg: 'border-[#e5e7ea]',
        text: 'text-[#fab12f]',
        dot: 'bg-[#fab12f]'
      };
    case 'past':
      return {
        bg: 'border-[#e5e7ea]',
        text: 'text-[#1fc16b]',
        dot: 'bg-[#1fc16b]'
      };
    case 'cancelled':
      return {
        bg: 'border-[#fcebeb]',
        text: 'text-[#e43636]',
        dot: 'bg-[#e43636]'
      };
    default:
      return {
        bg: 'border-[#e5e7ea]',
        text: 'text-gray-600',
        dot: 'bg-gray-600'
      };
  }
};

const getStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case 'upcoming':
      return 'Upcoming';
    case 'past':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<{ id: string; customerName: string; serviceName: string } | null>(null);

  const { user, authToken } = useAuth();

  // Fetch bookings based on active tab
  const { data: bookingsData, isLoading, error, refetch } = useBookingManagement(
    user?.businessId || null,
    user?.id || null,
    activeTab,
    authToken
  );

  // Cancel booking mutation
  const cancelBookingMutation = useCancelBooking(authToken);

  const bookings = bookingsData?.payload || [];

  // Get counts for each tab
  const { data: upcomingData } = useBookingManagement(user?.businessId || null, user?.id || null, 'upcoming', authToken);
  const { data: pastData } = useBookingManagement(user?.businessId || null, user?.id || null, 'past', authToken);
  const { data: cancelledData } = useBookingManagement(user?.businessId || null, user?.id || null, 'cancelled', authToken);

  const upcomingCount = upcomingData?.payload?.length || 0;
  const pastCount = pastData?.payload?.length || 0;
  const cancelledCount = cancelledData?.payload?.length || 0;

  // Helper function to format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
  };

  const handleView = (bookingId: string) => {
    const apiBooking = bookings.find(b => b.id === bookingId);
    if (apiBooking) {
      // Map API data to Booking interface
      const mappedBooking: Booking = {
        id: apiBooking.id,
        customerName: `${apiBooking.user_first_name} ${apiBooking.user_last_name}`,
        customerAvatar: apiBooking.user_profile_photo,
        customerPhone: apiBooking.user_phone_number,
        serviceName: apiBooking.service_name,
        scheduledDate: formatDate(apiBooking.booking_start_time),
        scheduledTime: formatTime(apiBooking.booking_start_time),
        pricing: `RM ${apiBooking.final_amount_charged.toFixed(2)}`,
        duration: formatDuration(apiBooking.service_duration),
        status: activeTab,
        serviceCharge: apiBooking.original_price,
        discount: apiBooking.total_discount_amount,
        totalPaid: apiBooking.final_amount_charged,
        currency: 'RM'
      };
      setSelectedBooking(mappedBooking);
      setIsViewModalOpen(true);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCancelClick = (bookingId: string) => {
    const apiBooking = bookings.find(b => b.id === bookingId);
    if (apiBooking) {
      setBookingToCancel({
        id: bookingId,
        customerName: `${apiBooking.user_first_name} ${apiBooking.user_last_name}`,
        serviceName: apiBooking.service_name
      });
      setIsCancelModalOpen(true);
    }
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setBookingToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel || !user?.businessId || !user?.id) return;

    try {
      await cancelBookingMutation.mutateAsync({
        business_id: user.businessId,
        booking_id: bookingToCancel.id,
        user_id: user.id
      });
      
      handleCloseCancelModal();
      refetch(); // Refresh the bookings list
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <ProviderSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            <h1 
              className="text-lg sm:text-xl font-bold text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 700,
                lineHeight: '28px'
              }}
            >
              Bookings Management
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-9 py-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-0 border-b border-[#e5e7ea] mb-4 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 sm:px-4 py-2 sm:py-3 transition-colors relative min-h-[36px] flex-shrink-0 whitespace-nowrap text-[13px] sm:text-[14px] cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'text-black'
                  : 'text-[#797e84] hover:text-black'
              }`}
              style={{
                fontFamily: 'Lato, sans-serif',
                fontWeight: activeTab === 'upcoming' ? 500 : 400,
                lineHeight: '20px'
              }}
            >
              Upcoming ({upcomingCount})
              {activeTab === 'upcoming' && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-3 sm:px-4 py-2 sm:py-3 transition-colors relative min-h-[36px] flex-shrink-0 whitespace-nowrap text-[13px] sm:text-[14px] cursor-pointer ${
                activeTab === 'past'
                  ? 'text-black'
                  : 'text-[#797e84] hover:text-black'
              }`}
              style={{
                fontFamily: 'Lato, sans-serif',
                fontWeight: activeTab === 'past' ? 500 : 400,
                lineHeight: '20px'
              }}
            >
              Past ({pastCount})
              {activeTab === 'past' && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-3 sm:px-4 py-2 sm:py-3 transition-colors relative min-h-[36px] flex-shrink-0 whitespace-nowrap text-[13px] sm:text-[14px] cursor-pointer ${
                activeTab === 'cancelled'
                  ? 'text-black'
                  : 'text-[#797e84] hover:text-black'
              }`}
              style={{
                fontFamily: 'Lato, sans-serif',
                fontWeight: activeTab === 'cancelled' ? 500 : 400,
                lineHeight: '20px'
              }}
            >
              Cancelled ({cancelledCount})
              {activeTab === 'cancelled' && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black" />
              )}
            </button>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-5">
                  <div className="flex gap-8 items-center">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex gap-2 items-center">
                        <div className="w-9 h-9 bg-gray-200 animate-pulse rounded-full" />
                        <div className="flex flex-col gap-2 flex-1">
                          <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
                          <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="h-12 flex-1 bg-gray-200 animate-pulse rounded" />
                        <div className="h-12 flex-1 bg-gray-200 animate-pulse rounded" />
                        <div className="h-12 flex-1 bg-gray-200 animate-pulse rounded" />
                        <div className="h-12 w-32 bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="w-px h-[100px] bg-gray-200" />
                    <div className="flex gap-3">
                      <div className="h-10 w-24 bg-gray-200 animate-pulse rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p 
                className="text-base text-red-500"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                {error.message || 'Failed to load bookings'}
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p 
                className="text-base text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                No {activeTab} bookings found.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((apiBooking) => {
                const statusColors = getStatusBadgeColor(activeTab);
                const customerName = `${apiBooking.user_first_name} ${apiBooking.user_last_name}`;
                
                return (
                  <div key={apiBooking.id} className="bg-white rounded-lg p-4 sm:p-5">
                    <div className={`flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 ${activeTab === 'past' ? 'items-end' : 'items-center'}`}>
                      {/* Left Section - Booking Info */}
                      <div className="flex-1 flex flex-col gap-3 w-full lg:w-auto">
                        {/* Customer Info */}
                        <div className="flex gap-2 items-center">
                          {apiBooking.user_profile_photo ? (
                            <img
                              src={apiBooking.user_profile_photo}
                              alt={customerName}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                              <span 
                                className="text-sm text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500
                                }}
                              >
                                {apiBooking.user_first_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex flex-col">
                            <h3 
                              className="text-lg font-medium text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 500,
                                lineHeight: '28px'
                              }}
                            >
                              {customerName}
                            </h3>
                            <p 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              {apiBooking.service_name}
                            </p>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
                          <div className="flex flex-col gap-1 w-full sm:w-[260px]">
                            <label 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              Scheduled on
                            </label>
                            <p 
                              className="text-base text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '24px'
                              }}
                            >
                              {formatDate(apiBooking.booking_start_time)} at {formatTime(apiBooking.booking_start_time)}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1 flex-1">
                            <label 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              Pricing
                            </label>
                            <p 
                              className="text-base text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '24px'
                              }}
                            >
                              RM {apiBooking.final_amount_charged.toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1 flex-1">
                            <label 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              Duration
                            </label>
                            <p 
                              className="text-base text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '24px'
                              }}
                            >
                              {formatDuration(apiBooking.service_duration)}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              Status
                            </label>
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${statusColors.bg} whitespace-nowrap`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                              <span 
                                className={`text-sm ${statusColors.text}`}
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '20px'
                                }}
                              >
                                {getStatusLabel(activeTab)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="hidden lg:block w-px h-[100px] bg-gray-200" />
                      <div className="lg:hidden w-full h-px bg-gray-200" />

                      {/* Right Section - Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-end w-full lg:w-auto">
                        <button
                          onClick={() => handleView(apiBooking.id)}
                          className="flex gap-2 items-center px-4 py-1.5 border border-[#e5e7ea] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <Eye size={18} className="text-black" />
                          <span 
                            className="text-base text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '24px'
                            }}
                          >
                            View
                          </span>
                        </button>
                        {activeTab === 'upcoming' && (
                          <button
                            onClick={() => handleCancelClick(apiBooking.id)}
                            className="flex gap-2 items-center px-4 py-1.5 border border-[#fcebeb] rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <X size={18} className="text-[#e43636]" />
                            <span 
                              className="text-base text-[#e43636]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '24px'
                              }}
                            >
                              Cancel
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* View Booking Modal */}
      <ViewBookingModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        booking={selectedBooking}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={cancelBookingMutation.isPending}
        customerName={bookingToCancel?.customerName}
        serviceName={bookingToCancel?.serviceName}
      />
    </div>
  );
}

