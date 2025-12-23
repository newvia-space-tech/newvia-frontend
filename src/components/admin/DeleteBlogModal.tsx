'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DeleteBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  blogTitle?: string;
  isLoading?: boolean;
}

export default function DeleteBlogModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  blogTitle,
  isLoading = false
}: DeleteBlogModalProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-xl w-full max-w-[500px] mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 sm:pt-5 pb-4">
          <h2 
            className="text-lg sm:text-xl font-bold text-black flex-1 pr-4"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 700,
              lineHeight: '28px'
            }}
          >
            Delete Blog Post
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          <p 
            className="text-sm sm:text-base text-[#797e84] mb-4 sm:mb-5"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 400,
              lineHeight: '24px'
            }}
          >
            {blogTitle ? (
              <>
                Are you sure you want to delete <strong>&quot;{blogTitle}&quot;</strong>? This action cannot be undone and the blog post will be permanently deleted.
              </>
            ) : (
              'Are you sure you want to delete this blog post? This action cannot be undone and the blog post will be permanently deleted.'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 sm:px-5 pb-4 sm:pb-5">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-[#f8f9f8] hover:bg-[#e8e9e8] text-black px-4 py-3 rounded-lg transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 500,
              lineHeight: '20px',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          
          {/* Delete Button */}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-[#fcebeb] hover:bg-[#fadada] text-[#e43636] px-4 py-3 rounded-lg transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 500,
              lineHeight: '20px',
              fontSize: '14px'
            }}
          >
            {isLoading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

