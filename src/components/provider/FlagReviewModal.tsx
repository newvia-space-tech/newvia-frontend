'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FlagReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  reviewId?: string;
}

export default function FlagReviewModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  reviewId 
}: FlagReviewModalProps) {
  const [reason, setReason] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setReason('');
    }
  }, [isOpen]);

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

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      onClose();
    }
  };

  if (!isOpen) return null;

  const isDisabled = !reason.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-200">
          <h2 
            className="text-xl font-bold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 700,
              lineHeight: '28px'
            }}
          >
            Flag Review
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Reason Textarea */}
          <div className="flex flex-col gap-2">
            <label 
              className="text-sm text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px'
              }}
            >
              Please provide a reason for flagging this review.
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={5}
              className="w-full px-3.5 py-3 border border-[#e5e7ea] rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6290f2] focus:border-transparent resize-none"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                color: reason ? '#000000' : '#797e84',
                minHeight: '120px'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={`bg-[#e43636] text-white px-4 py-3 rounded-lg text-base font-normal transition-all min-h-[40px] ${
              isDisabled 
                ? 'opacity-30 cursor-not-allowed' 
                : 'hover:bg-[#d32f2f] cursor-pointer'
            }`}
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 400,
              lineHeight: '24px'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}


