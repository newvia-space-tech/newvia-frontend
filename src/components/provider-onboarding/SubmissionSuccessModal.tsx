'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmissionSuccessModal({ 
  isOpen, 
  onClose 
}: SubmissionSuccessModalProps) {

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
      <div className="relative bg-white rounded-xl w-[600px] overflow-hidden">
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
        <div className="flex flex-col items-center justify-center pb-10 px-5">
          {/* Success Icon */}
          <div className="relative w-[250px] h-[250px] mb-6 flex items-center justify-center">
            <Image
              src="/figma-assets/success.gif"
              alt="Success"
              width={250}
              height={250}
              className="w-full h-full object-contain"
              unoptimized
            />
          </div>

          {/* Text Content */}
          <div className="flex flex-col gap-1.5 items-center justify-center w-[350px]">
            <h2 
              className="text-2xl font-semibold text-black text-center"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
                lineHeight: '32px'
              }}
            >
              Your listing is under review 🎉
            </h2>
            <p 
              className="text-lg font-medium text-[#797e84] text-center"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 500,
                lineHeight: '24px'
              }}
            >
              We&apos;ll notify you once it&apos;s approved. This usually takes within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

