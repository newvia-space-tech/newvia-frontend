'use client';

import React, { useState, useEffect } from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import CustomerAccountSidebar from '@/components/customer-account/CustomerAccountSidebar';
import WriteReviewModal from '@/components/account/WriteReviewModal';
import CancelBookingModal from '@/components/account/CancelBookingModal';
import { Calendar, Clock3, MapPin, X, Download, Star, Repeat } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCustomerAppointments, getCustomerInvoice } from '@/services/booking/booking';
import { useAddReview } from '@/hooks/review/useAddReview';
import { useCancelBooking } from '@/hooks/booking/useCancelBooking';
import { Appointment } from '@/types';

export default function AppointmentsPage() {
  const { user, logout, loading: authLoading, authToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);

  // React Query mutation for adding reviews
  const addReviewMutation = useAddReview();
  
  // React Query mutation for canceling bookings
  const cancelBookingMutation = useCancelBooking(authToken);

  // Fetch appointments whenever the tab changes
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id || !authToken) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCustomerAppointments(user.id, activeTab, authToken);
        setAppointments(response.payload);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id, activeTab]);

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Format timestamp to readable time
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-white text-black';
      case 'past':
        return 'bg-white text-black';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleWriteReview = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleSubmitReview = async (rating: number, review: string) => {
    if (!selectedAppointment || !user?.id || !authToken) return;

    try {
      await addReviewMutation.mutateAsync({
        business_id: selectedAppointment.business_id,
        user_id: user.id,
        booking_id: selectedAppointment.booking_id,
        service_id: selectedAppointment.services_id,
        rating,
        comment: review.trim(),
        authToken,
      });

      // Success - close modal and reset state (mutation handles success in onSuccess)
      setIsReviewModalOpen(false);
      setSelectedAppointment(null);

      // Optionally refresh appointments to reflect any changes
      // This might be needed if the backend updates appointment status after review
      const response = await getCustomerAppointments(user.id, activeTab, authToken);
      setAppointments(response.payload);

    } catch (error) {
      // Error is already handled by the mutation's onError callback
      // We can add additional component-specific error handling here if needed
      console.error('Review submission error:', error);
    }
  };

  const handleCancelClick = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setIsCancelModalOpen(false);
    setAppointmentToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!appointmentToCancel || !user?.id) return;

    try {
      await cancelBookingMutation.mutateAsync({
        booking_id: appointmentToCancel.booking_id,
        user_id: user.id,
      });

      // Success - close modal and refresh appointments
      setIsCancelModalOpen(false);
      setAppointmentToCancel(null);

      // Refresh appointments to reflect the cancellation
      const response = await getCustomerAppointments(user.id, activeTab, authToken!);
      setAppointments(response.payload);
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Cancel booking error:', error);
    }
  };

  const handleDownloadReceipt = async (appointment: Appointment) => {
    if (!user?.id || !authToken) {
      console.error('User ID or auth token not available');
      return;
    }

    try {
      const response = await getCustomerInvoice(user.id, appointment.booking_id, authToken);
      
      if (response.payload) {
        // Create a Blob from the HTML content
        const blob = new Blob([response.payload], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Open in new tab with the blob URL
        const newWindow = window.open(url, '_blank');
        
        if (!newWindow) {
          // Fallback if popup is blocked
          alert('Please allow popups to download the receipt');
          URL.revokeObjectURL(url); // Clean up if window didn't open
        } else {
          // Clean up the URL after the window loads (optional, but good practice)
          newWindow.addEventListener('load', () => {
            // URL will be cleaned up when the window is closed
            // But we can also clean it up after a delay
            setTimeout(() => URL.revokeObjectURL(url), 100);
          });
        }
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert(error instanceof Error ? error.message : 'Failed to download receipt');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <UnifiedHeader showSearchBar={false} />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <CustomerAccountSidebar activeSection="appointments" />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex flex-col gap-4 sm:gap-5 items-start w-full">
            {/* Page Title */}
            <h2 
              className="text-xl sm:text-2xl font-semibold text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif', 
                fontWeight: 600, 
                lineHeight: '32px' 
              }}
            >
              My Appointments
            </h2>
            
            {/* Tab Navigation */}
            <div className="w-full border-b border-[#e5e7ea] overflow-x-auto">
              <div className="flex min-w-max">
                <button
                  onClick={() => setActiveTab('upcoming')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'upcoming'
                      ? 'border-black text-black'
                      : 'border-transparent text-[#9ea5ad]'
                  }`}
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 500,
                    lineHeight: '20px'
                  }}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActiveTab('past')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'past'
                      ? 'border-black text-black'
                      : 'border-transparent text-[#9ea5ad]'
                  }`}
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 500,
                    lineHeight: '20px'
                  }}
                >
                  Past
                </button>
                <button
                  onClick={() => setActiveTab('cancelled')}
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                    activeTab === 'cancelled'
                      ? 'border-black text-black'
                      : 'border-transparent text-[#9ea5ad]'
                  }`}
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 500,
                    lineHeight: '20px'
                  }}
                >
                  Cancelled
                </button>
              </div>
            </div>
            
            {/* Appointments List */}
            <div className="w-full">
              {loading ? (
                <div className="text-center py-12">
                  <p 
                    className="text-[#797e84] text-base"
                    style={{ 
                      fontFamily: 'Lato, sans-serif', 
                      fontWeight: 400, 
                      lineHeight: '24px' 
                    }}
                  >
                    Loading appointments...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p 
                    className="text-red-500 text-base"
                    style={{ 
                      fontFamily: 'Lato, sans-serif', 
                      fontWeight: 400, 
                      lineHeight: '24px' 
                    }}
                  >
                    {error}
                  </p>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-12">
                  <p 
                    className="text-[#797e84] text-base"
                    style={{ 
                      fontFamily: 'Lato, sans-serif', 
                      fontWeight: 400, 
                      lineHeight: '24px' 
                    }}
                  >
                    No {activeTab} appointments found
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment.booking_id}
                      className="border border-[#e5e7ea] rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center flex-1">
                          {/* Service Image */}
                          <div className="relative w-full sm:w-[170px] h-[200px] sm:h-[170px] rounded-xl overflow-hidden flex-shrink-0">
                            {appointment.business_image && appointment.business_image.trim() !== '' ? (
                              <img 
                                src={appointment.business_image} 
                                alt={appointment.service_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                  <svg 
                                    className="w-10 h-10" 
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
                                  <span className="text-xs font-medium">No Image</span>
                                </div>
                              </div>
                            )}
                            {/* Status Badge */}
                            <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}
                                 style={{ 
                                   fontFamily: 'Lato, sans-serif', 
                                   fontWeight: 400,
                                   lineHeight: '20px'
                                 }}>
                              {appointment.status === 'past' ? 'Completed' : appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </div>
                          </div>
                          
                          {/* Service Details */}
                          <div className="flex-1 space-y-2 sm:space-y-3">
                            <div>
                              <h3 
                                className="text-base sm:text-lg font-semibold text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif', 
                                  fontWeight: 600, 
                                  lineHeight: '24px' 
                                }}
                              >
                                {appointment.service_name}
                              </h3>
                              <p 
                                className="text-[#797e84] text-sm sm:text-base"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif', 
                                  fontWeight: 400, 
                                  lineHeight: '24px' 
                                }}
                              >
                                {appointment.business_name}
                              </p>
                            </div>
                            
                            {/* Appointment Details */}
                            <div className="space-y-1.5">
                              {/* Date */}
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#797e84] flex-shrink-0" />
                                <p 
                                  className="text-[#797e84] text-sm sm:text-base"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif', 
                                    fontWeight: 400, 
                                    lineHeight: '24px' 
                                  }}
                                >
                                  {formatDate(appointment.booking_start_time)}
                                </p>
                              </div>
                              
                              {/* Time */}
                              <div className="flex items-center gap-1.5">
                                <Clock3 className="w-4 h-4 sm:w-5 sm:h-5 text-[#797e84] flex-shrink-0" />
                                <p 
                                  className="text-[#797e84] text-sm sm:text-base"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif', 
                                    fontWeight: 400, 
                                    lineHeight: '24px' 
                                  }}
                                >
                                  {formatTime(appointment.booking_start_time)}
                                </p>
                              </div>
                              
                              {/* Location */}
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#797e84] flex-shrink-0" />
                                <p 
                                  className="text-[#797e84] text-sm sm:text-base break-words"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif', 
                                    fontWeight: 400, 
                                    lineHeight: '24px' 
                                  }}
                                >
                                  {appointment.business_address_line1}, {appointment.business_postal_code}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col items-stretch sm:items-end justify-start sm:justify-center gap-2 sm:gap-2 w-full sm:w-auto">
                          
                          {/* Action Buttons */}
                          {activeTab === 'upcoming' ? (
                            /* Cancel Button for Upcoming */
                            <button
                              onClick={() => handleCancelClick(appointment)}
                              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-[#fcebeb] rounded-lg hover:bg-red-50 transition-colors flex-1 sm:flex-initial cursor-pointer"
                            >
                              <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#e43636]" />
                              <span
                                className="text-[#e43636] text-sm sm:text-base"
                                style={{
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                Cancel
                              </span>
                            </button>
                          ) : activeTab === 'past' ? (
                            /* Action Buttons for Past/Completed */
                            <div className="flex flex-col gap-2 w-full sm:w-auto">
                              <button 
                                onClick={() => handleDownloadReceipt(appointment)}
                                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                              >
                                <Download className="w-4 h-4" />
                                <span
                                  className="text-sm sm:text-base"
                                  style={{
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '24px'
                                  }}
                                >
                                  Download Receipt
                                </span>
                              </button>
                              <button
                                onClick={() => handleWriteReview(appointment)}
                                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg hover:opacity-90 transition-colors cursor-pointer"
                                style={{ backgroundColor: '#FFDE82' }}
                              >
                                <Star className="w-4 h-4 text-black" />
                                <span
                                  className="text-black text-sm sm:text-base"
                                  style={{
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '24px'
                                  }}
                                >
                                  Write a review
                                </span>
                              </button>
                            </div>
                          ) : (
                            /* Book Again Button for Cancelled */
                            <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors w-full sm:w-auto cursor-pointer">
                              <Repeat className="w-4 h-4" />
                              <span
                                className="text-sm sm:text-base"
                                style={{
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                Book again
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        appointmentId={selectedAppointment?.booking_id}
        serviceName={selectedAppointment?.service_name}
        onSubmit={handleSubmitReview}
        isSubmitting={addReviewMutation.isPending}
        error={addReviewMutation.error?.message}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={cancelBookingMutation.isPending}
      />
    </div>
  );
}

