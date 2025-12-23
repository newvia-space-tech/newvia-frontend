'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Check, Star } from 'lucide-react';
import { AdminReviewManagement } from '@/types';

interface AdminFlagReviewActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: AdminReviewManagement | null;
  onApprove: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export default function AdminFlagReviewActionModal({
  isOpen,
  onClose,
  review,
  onApprove,
  onReject,
  isLoading = false
}: AdminFlagReviewActionModalProps) {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow || 'auto';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  if (!isOpen || !review) return null;

  const customerName = `${review.customer_first_name} ${review.customer_last_name}`;
  const initials = `${review.customer_first_name.charAt(0)}${review.customer_last_name.charAt(0)}`;
  const serviceName = review.service || 'N/A';
  
  // Construct flagged by name
  const getFlaggedByName = () => {
    if (review.flagged_by_first_name && review.flagged_by_last_name) {
      return `${review.flagged_by_first_name} ${review.flagged_by_last_name} (Provider)`;
    }
    if (review.flagged_by_first_name) {
      return `${review.flagged_by_first_name} (Provider)`;
    }
    return review.provider || 'Unknown';
  };
  
  const flaggedByName = getFlaggedByName();
  
  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const timeAgo = formatDate(review.created_at);

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'fill-[#fab12f] text-[#fab12f]' : 'text-[#e5e7ea]'}
      />
    ));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 pt-4 px-5 border-b border-[#e5e7ea]">
          <h2 
            className="text-xl font-bold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 700,
              lineHeight: '28px'
            }}
          >
            Flagged Review - Action Required
          </h2>
          <button
            onClick={onClose}
            className="bg-white p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X size={20} className="text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 items-start pb-5 pt-3 px-5">
          {/* Flagging Details */}
          <div className="bg-[#f8f9f8] flex flex-col gap-4 items-start justify-center p-4 rounded-lg w-full">
            <div className="flex flex-col gap-1.5 items-start w-full">
              <p 
                className="text-sm text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Flagged By
              </p>
              <p 
                className="text-base text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                {flaggedByName}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 items-start w-full">
              <p 
                className="text-sm text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Reason
              </p>
              <p 
                className="text-base text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                {review.flag_reason || 'No reason provided'}
              </p>
            </div>
          </div>

          {/* Review Content */}
          <div className="border border-[#e5e7ea] flex flex-col items-start justify-center p-4 rounded-lg w-full">
            <div className="flex flex-col gap-4 items-start w-full">
              {/* Review Header */}
              <div className="flex items-center justify-between w-full">
                <div className="flex gap-3 items-center">
                  {/* Customer Avatar */}
                  {review.customer_profile_pic ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={review.customer_profile_pic}
                        alt={customerName}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                      <span 
                        className="text-sm text-gray-600"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500
                        }}
                      >
                        {initials}
                      </span>
                    </div>
                  )}
                  {/* Customer Name and Service */}
                  <div className="flex flex-col items-start">
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
                      className="text-sm text-[#797e84] truncate max-w-[200px]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                      title={serviceName}
                    >
                      {serviceName}
                    </p>
                  </div>
                </div>
                {/* Rating and Date */}
                <div className="flex flex-col items-end justify-center">
                  <div className="flex gap-1 items-center h-6">
                    {renderStars(review.rating)}
                  </div>
                  <p 
                    className="text-sm text-[#797e84]"
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
              {/* Review Comment */}
              <p 
                className="text-base text-black w-full"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                {review.comment}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-end w-full">
            <button
              onClick={onApprove}
              disabled={isLoading}
              className="flex-1 bg-[#e9f9f0] flex gap-2 items-center justify-center px-4 py-2.5 rounded-lg hover:bg-[#d4f5e3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
            >
              <Check size={18} className="text-[#1fc16b] shrink-0" />
              <p 
                className="text-base text-[#1fc16b]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                Approve
              </p>
            </button>
            <button
              onClick={onReject}
              disabled={isLoading}
              className="flex-1 bg-[#fcebeb] flex gap-2 items-center justify-center px-4 py-2.5 rounded-lg hover:bg-[#f9d5d5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
            >
              <X size={18} className="text-[#e43636] shrink-0" />
              <p 
                className="text-base text-[#e43636]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                Reject
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

