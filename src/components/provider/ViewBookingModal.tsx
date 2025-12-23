'use client';

import React from 'react';
import Image from 'next/image';
import { X, Phone } from 'lucide-react';

interface BookingDetails {
  id: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  pricing: string;
  duration: string;
  status: 'upcoming' | 'past' | 'cancelled';
  serviceCharge?: number;
  discount?: number;
  totalPaid?: number;
  currency?: string;
}

interface ViewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
}

const getStatusBadgeColor = (status: string): { bg: string; text: string; dot: string } => {
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

const getStatusLabel = (status: string): string => {
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

export default function ViewBookingModal({ isOpen, onClose, booking }: ViewBookingModalProps) {
  if (!isOpen || !booking) return null;

  const statusColors = getStatusBadgeColor(booking.status);

  // Calculate payment details
  const serviceCharge = booking.serviceCharge || parseFloat(booking.pricing.replace(/[^\d.]/g, '')) || 0;
  const discount = booking.discount || 0;
  const totalPaid = booking.totalPaid || (serviceCharge - discount);
  const currency = booking.currency || 'RM';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl"
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
            Booking Details
          </h2>
          <button
            onClick={onClose}
            className="bg-white p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-5">
          <div className="flex flex-col gap-6">
            {/* Customer Info & Status */}
            <div className="flex items-end justify-between">
              <div className="flex gap-3 items-center">
                {booking.customerAvatar ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={booking.customerAvatar}
                      alt={booking.customerName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <span
                      className="text-base text-black"
                      style={{
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 500
                      }}
                    >
                      {booking.customerName.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <h3
                    className="text-lg font-medium text-black"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '28px'
                    }}
                  >
                    {booking.customerName}
                  </h3>
                  {booking.customerPhone && (
                    <div className="flex gap-2 items-center">
                      <Phone size={18} className="text-[#797e84]" />
                      <p
                        className="text-base text-[#797e84]"
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {booking.customerPhone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusColors.bg}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                <span
                  className={`text-sm ${statusColors.text}`}
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  {getStatusLabel(booking.status)}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#e5e7ea]" />

            {/* Service Details */}
            <div className="flex flex-col gap-3">
              <h3
                className="text-lg font-medium text-black"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  lineHeight: '28px'
                }}
              >
                Service Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Service */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm text-[#797e84]"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Service
                  </label>
                  <p
                    className="text-base text-black"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    {booking.serviceName}
                  </p>
                </div>

                {/* Date & Time */}
                <div className="flex flex-col gap-1.5">
                  <label
                    className="text-sm text-[#797e84]"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Date & Time
                  </label>
                  <p
                    className="text-base text-black"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    {booking.scheduledDate} at {booking.scheduledTime}
                  </p>
                </div>

                {/* Pricing */}
                <div className="flex flex-col gap-1.5">
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
                    {booking.pricing}
                  </p>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
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
                    {booking.duration}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="flex flex-col gap-3">
              <h3
                className="text-lg font-medium text-black"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  lineHeight: '28px'
                }}
              >
                Payment Details
              </h3>
              <div className="bg-[#f8f9f8] rounded-xl p-4 flex flex-col gap-4">
                {/* Service Charge */}
                <div className="flex items-center justify-between">
                  <p
                    className="text-base text-black"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    Service Charge
                  </p>
                  <p
                    className="text-base text-black font-semibold"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 600,
                      lineHeight: '24px'
                    }}
                  >
                    {currency} {serviceCharge.toFixed(2)}
                  </p>
                </div>

                {/* Discount */}
                {discount > 0 && (
                  <div className="flex items-center justify-between">
                    <p
                      className="text-base text-[#797e84]"
                      style={{
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Discount
                    </p>
                    <p
                      className="text-base text-[#797e84] font-semibold"
                      style={{
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      -{currency} {discount.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Divider */}
                {discount > 0 && <div className="h-px bg-[#e5e7ea]" />}

                {/* Total Paid */}
                <div className="flex items-center justify-between">
                  <p
                    className="text-base text-black"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    Total Paid
                  </p>
                  <p
                    className="text-base text-black font-semibold"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 600,
                      lineHeight: '24px'
                    }}
                  >
                    {currency} {totalPaid.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

