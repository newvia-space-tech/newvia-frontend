'use client';

import React from 'react';
import { ArrowLeft, Store, MapPin, Tag, Clock, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useAdminProviderDetail } from '@/hooks/admin/useAdminProviderDetail';

interface VerificationDetailProps {
  businessId: string;
  onBack: () => void;
  onApprove: (businessId: string) => void;
  onReject: (businessId: string) => void;
}

// Helper function to format time from timestamp
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

// Helper function to get day name from day number
const getDayName = (day: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day] || 'Unknown';
};

// Helper function to format working hours
const formatWorkingHours = (hours: Array<{ day: number; is_open: boolean; start_time: number; end_time: number }>) => {
  return hours.map(hour => ({
    day: getDayName(hour.day),
    hours: hour.is_open 
      ? `${formatTime(hour.start_time)} to ${formatTime(hour.end_time)}`
      : 'Closed'
  }));
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string): string => {
  if (amount === 0) {
    return 'Free';
  }
  const currencySymbol = currency.toUpperCase() === 'MYR' ? 'RM' : currency.toUpperCase() || '';
  return `${currencySymbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format duration
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} minutes`;
};

// Helper function to format address
const formatAddress = (addressLine1: string, addressLine2: string, city: string, state: string, postalCode: string): string => {
  const parts = [addressLine1, addressLine2, city, state, postalCode].filter(Boolean);
  return parts.join(', ');
};

export default function VerificationDetail({
  businessId,
  onBack,
  onApprove,
  onReject
}: VerificationDetailProps) {
  const { adminToken } = useAuth();
  const { data, isLoading, error } = useAdminProviderDetail(adminToken, businessId);

  const handleApprove = () => {
    onApprove(businessId);
  };

  const handleReject = () => {
    onReject(businessId);
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8f9f8]">
        {/* Header */}
        <div className="bg-white shadow-[1px_2px_24px_0px_rgba(0,0,0,0.08)] sticky top-0 z-10">
          <div className="flex items-center justify-between px-[60px] py-3">
            <button
              onClick={onBack}
              className="bg-[#f8f9f8] rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-black" />
            </button>
          </div>
        </div>

        {/* Loading Content */}
        <div className="px-[60px] py-5 max-w-[1320px] mx-auto">
          <div className="mb-5">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-lg p-5 mb-5">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-1/2 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#f8f9f8]">
        {/* Header */}
        <div className="bg-white shadow-[1px_2px_24px_0px_rgba(0,0,0,0.08)] sticky top-0 z-10">
          <div className="flex items-center justify-between px-[60px] py-3">
            <button
              onClick={onBack}
              className="bg-[#f8f9f8] rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} className="text-black" />
            </button>
          </div>
        </div>

        {/* Error Content */}
        <div className="px-[60px] py-5 max-w-[1320px] mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Failed to load provider details. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.payload) {
    return null;
  }

  const provider = data.payload;
  const address = formatAddress(
    provider.address_line_1,
    provider.address_line_2,
    provider.city_name,
    provider.state_name,
    provider.postal_code
  );
  const workingHours = formatWorkingHours(provider.business_hours);
  const galleryImages = provider.images.map(img => img.image);

  return (
    <div className="bg-[#f8f9f8]">
      {/* Header */}
      <div className="bg-white shadow-[1px_2px_24px_0px_rgba(0,0,0,0.08)] sticky top-0 z-10">
        <div className="flex items-center justify-between px-[60px] py-3">
          <button
            onClick={onBack}
            className="bg-[#f8f9f8] rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} className="text-black" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-[60px] py-5 max-w-[1320px] mx-auto">
        {/* Title */}
        <div className="mb-5">
          <h1
            className="text-xl font-semibold text-black"
            style={{
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
              lineHeight: '28px'
            }}
          >
            Review & Approve
          </h1>
        </div>

        {/* Business Info Section */}
        <div className="bg-white rounded-lg p-5 mb-5">
          <div className="flex items-center gap-1.5 mb-4">
            <Store size={20} className="text-black" />
            <h2
              className="text-base font-semibold text-black"
              style={{
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
                lineHeight: '24px'
              }}
            >
              Business Info
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {/* First Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Business Name
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.business_name}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Business Registration Number
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.business_registration_number || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Category
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.category || 'N/A'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <p
                className="text-sm text-[#797e84]"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Description
              </p>
              <p
                className="text-base text-black"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                {provider.description || 'No description provided.'}
              </p>
            </div>

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Gallery
                </p>
                <div className="flex gap-3">
                  {galleryImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative w-[120px] h-[120px] rounded-xl overflow-hidden bg-[#e0e2e6]"
                    >
                      <Image
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location & Availability Section */}
        <div className="bg-white rounded-lg p-5 mb-5">
          <div className="flex items-center gap-1.5 mb-4">
            <MapPin size={20} className="text-black" />
            <h2
              className="text-base font-semibold text-black"
              style={{
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
                lineHeight: '24px'
              }}
            >
              Location & Availability
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            {/* Address */}
            <div className="flex flex-col gap-2">
              <p
                className="text-sm text-[#797e84]"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Address
              </p>
              <p
                className="text-base text-black"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                {address}
              </p>
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  City
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.city_name || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  State
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.state_name || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Postal Code
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.postal_code || 'N/A'}
                </p>
              </div>
            </div>

            {/* Business Phone, Social Media, Free Consultancy */}
            <div className="grid grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Business Phone Number
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.phone_number || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Social Media
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.social_media_url || 'N/A'}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Free Consultancy
                </p>
                <p
                  className="text-base text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                >
                  {provider.is_free_consultancy ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            {workingHours.length > 0 && (
              <div className="flex flex-col gap-2">
                <p
                  className="text-sm text-[#797e84]"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Working Hours
                </p>
                <div className="flex flex-col gap-2">
                  {workingHours.map((wh, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg py-2"
                    >
                      <p
                        className="text-base text-black w-[100px]"
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {wh.day}
                      </p>
                      <p
                        className="text-base text-black"
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {wh.hours}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Services & Pricing Section */}
        {provider.service && provider.service.length > 0 && (
          <div className="bg-white rounded-lg p-5 mb-5">
            <div className="flex items-center gap-1.5 mb-4">
              <Tag size={20} className="text-black" />
              <h2
                className="text-base font-semibold text-black"
                style={{
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 600,
                  lineHeight: '24px'
                }}
              >
                Services & Pricing
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {provider.service.map((service, index) => (
                <div key={service.id}>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h3
                        className="text-base font-semibold text-black"
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        {service.name}
                      </h3>
                      {service.description && (
                        <p
                          className="text-base text-[#797e84]"
                          style={{
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <Clock size={18} className="text-[#797e84]" />
                        <p
                          className="text-base text-[#797e84]"
                          style={{
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          {formatDuration(service.duration_minutes)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tag size={18} className="text-[#797e84]" />
                        <p
                          className="text-base text-[#797e84]"
                          style={{
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          {formatCurrency(service.price, service.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {index < provider.service.length - 1 && (
                    <div className="h-px bg-[#e5e7ea] my-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 py-3">
          <button
            onClick={handleReject}
            className="bg-[#fcebeb] border border-[#fcebeb] flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors"
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
              Reject
            </span>
          </button>
          <button
            onClick={handleApprove}
            className="bg-black flex items-center gap-2 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Check size={18} className="text-white" />
            <span
              className="text-base text-white"
              style={{
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px'
              }}
            >
              Approve
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
