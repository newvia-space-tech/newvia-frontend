'use client';

import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  customerName?: string;
  serviceName?: string;
}

export default function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  customerName,
  serviceName,
}: CancelBookingModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[480px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2
            className="text-xl font-semibold text-black"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
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
        <div className="px-5 pb-5">
          <div className="flex flex-col gap-6">
            {/* Warning Icon & Message */}
            <div className="flex flex-col gap-4 items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#fcebeb] flex items-center justify-center">
                <AlertCircle size={32} className="text-[#e43636]" />
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-lg font-medium text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    lineHeight: '28px'
                  }}
                >
                  Are you sure you want to cancel this booking?
                </p>
                {customerName && serviceName && (
                  <div className="flex flex-col gap-1">
                    <p
                      className="text-base text-[#797e84]"
                      style={{
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      <span className="font-medium text-black">{customerName}</span>
                      {' • '}
                      {serviceName}
                    </p>
                  </div>
                )}
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  This action cannot be undone. The customer will be notified about the cancellation.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e5e7ea]" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-[#e5e7ea] rounded-lg text-base text-black hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-[#e43636] rounded-lg text-base text-white hover:bg-[#c92a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  lineHeight: '24px'
                }}
              >
                {isLoading ? 'Cancelling...' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

