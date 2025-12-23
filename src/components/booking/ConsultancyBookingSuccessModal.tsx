'use client';

import React, { useEffect } from 'react';
import { X, Calendar, Clock, Check } from 'lucide-react';
import { BookingFormData } from './OnlineConsultancyBookingModal';

interface ConsultancyBookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingFormData | null;
  businessName?: string;
  providerName?: string;
}

// Helper to format date for display
const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper to format time for display
const formatDisplayTime = (timeString: string, timezone: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  // Get timezone abbreviation
  const timezoneAbbr = new Intl.DateTimeFormat('en', {
    timeZone: timezone,
    timeZoneName: 'short',
  }).formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value || '';
  
  return `${displayHours}:${displayMinutes} ${ampm} ${timezoneAbbr}`;
};

export default function ConsultancyBookingSuccessModal({
  isOpen,
  onClose,
  bookingData,
  businessName = 'Expert',
  providerName,
}: ConsultancyBookingSuccessModalProps) {
  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !bookingData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-[480px] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#e5e7ea] bg-white">
          <h2
            className="text-lg sm:text-xl font-semibold text-black"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Booking Confirmed
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 sm:px-6 py-6">
          {/* Success Message */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-[#1fc16b]/10 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-[#1fc16b]" strokeWidth={3} />
            </div>
            <div className="text-center">
              <p
                className="text-base text-[#797e84]"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Your consultation has been scheduled successfully. Check your email for confirmation.
              </p>
            </div>
          </div>

          {/* Meeting Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#6290f2] flex-shrink-0" />
              <div>
                <p
                  className="text-xs text-gray-500 mb-0.5"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Date
                </p>
                <p
                  className="text-sm font-medium text-black"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {formatDisplayDate(bookingData.meetingDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#6290f2] flex-shrink-0" />
              <div>
                <p
                  className="text-xs text-gray-500 mb-0.5"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Time
                </p>
                <p
                  className="text-sm font-medium text-black"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {formatDisplayTime(bookingData.meetingTime, bookingData.timezone)}
                </p>
              </div>
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium bg-[#6290f2] text-white hover:bg-blue-600 transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

