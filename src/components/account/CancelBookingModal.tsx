'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CancelBookingModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCancelBooking = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleKeepBooking = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[480px] mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 pt-4 px-4">
          <h2
            className="text-xl font-bold text-black"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontWeight: 700,
              lineHeight: '28px'
            }}
          >
            Cancel Booking
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="bg-white p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          <p
            className="text-base text-[#797e84]"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontWeight: 400,
              lineHeight: '24px'
            }}
          >
            If you cancel within 24 hours of booking, you&apos;ll receive a full refund. Cancellations made after 24 hours will not be eligible for a refund.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 p-4">
          <button
            onClick={handleCancelBooking}
            disabled={isLoading}
            className="flex-1 h-11 px-4 py-3 bg-[#f8f9f8] rounded-lg text-sm text-black hover:bg-[#e8e9e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontWeight: 500,
              lineHeight: '20px'
            }}
          >
            {isLoading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
          <button
            onClick={handleKeepBooking}
            disabled={isLoading}
            className="flex-1 h-11 px-4 py-3 bg-black rounded-lg text-sm text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontWeight: 500,
              lineHeight: '20px'
            }}
          >
            Keep Booking
          </button>
        </div>
      </div>
    </div>
  );
}

