'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ExitConfirmationModal({ 
  isOpen, 
  onClose,
  onConfirm
}: ExitConfirmationModalProps) {

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay with blur */}
      <div 
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl w-[500px] overflow-hidden">
        {/* Header with close button */}
        <div className="flex items-end justify-end px-5 pt-5 pb-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center pb-8 px-8">
          {/* Warning Icon */}
          <div className="w-16 h-16 mb-6 flex items-center justify-center rounded-full bg-red-50">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-3 items-center justify-center mb-6">
            <h2 
              className="text-xl font-semibold text-black text-center"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
              }}
            >
              Exit Onboarding?
            </h2>
            <p 
              className="text-base font-medium text-[#797e84] text-center"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 500,
              }}
            >
              Your progress will be lost if you exit now. Are you sure you want to continue?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#e5e7ea] rounded-lg text-base font-medium text-[#797e84] hover:bg-gray-50 transition-colors"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 rounded-lg text-base font-medium text-white hover:bg-red-700 transition-colors"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

