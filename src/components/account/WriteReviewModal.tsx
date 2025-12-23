'use client';

import React, { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: string;
  serviceName?: string;
  onSubmit?: (rating: number, review: string) => void;
  isSubmitting?: boolean;
  error?: string;
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  appointmentId,
  serviceName,
  onSubmit,
  isSubmitting = false,
  error
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  // Disable background scrolling when modal is open
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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setReview('');
      setHoveredRating(0);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (rating > 0 && review.trim() && !isSubmitting) {
      onSubmit?.(rating, review.trim());
    }
  };

  const isSubmitDisabled = rating === 0 || !review.trim() || isSubmitting;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[12px] w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-[12px] pt-[16px] px-[20px]">
          <h2 
            className="text-[20px] font-bold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 700,
              lineHeight: '28px'
            }}
          >
            Share Your Experience
          </h2>
          <button
            onClick={onClose}
            className="bg-white p-[8px] hover:bg-gray-100 rounded-[6px] transition-colors"
          >
            <X className="w-5 h-5 text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-[16px] pb-[20px] pt-[12px] px-[20px]">
          {/* Satisfaction Question Section */}
          <div className="bg-[#f8f9f8] flex flex-col gap-[16px] items-center justify-center p-[16px] rounded-[12px] w-full">
            <p 
              className="text-[16px] text-black text-center leading-[1.6]"
              style={{ 
                fontFamily: 'Ubuntu, sans-serif',
                fontWeight: 400,
                lineHeight: '25.6px'
              }}
            >
              Are you satisfied with the service that you have received from new via ?
            </p>
            
            {/* Star Rating */}
            <div className="flex gap-1 items-center h-[24px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={
                      star <= (hoveredRating || rating)
                        ? 'text-[#ffde82] fill-[#ffde82]'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Textarea */}
          <div className="flex flex-col gap-[8px] w-full">
            <label 
              className="text-[14px] text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px'
              }}
            >
              Write your review
            </label>
            <div className="border border-[#e5e7ea] rounded-[8px] h-[120px] relative">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Enter"
                className="w-full h-full px-[14px] py-[12px] rounded-[8px] resize-none focus:outline-none focus:border-[#6290f2]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  fontSize: '16px',
                  lineHeight: '24px',
                  color: review ? '#000000' : '#797e84'
                }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center" style={{ fontFamily: 'Lato, sans-serif' }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className={`w-full min-h-[40px] px-[16px] py-[12px] rounded-[8px] transition-all ${
              isSubmitDisabled
                ? 'bg-[#6290f2] opacity-30 cursor-not-allowed'
                : 'bg-[#6290f2] hover:bg-[#5280e2] cursor-pointer'
            }`}
            style={{
              fontFamily: 'Lato, sans-serif',
              fontWeight: 400,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#FFFFFF'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}

