'use client';

import React, { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface Notification {
  id: string;
  category: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  section: 'today' | 'previous';
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { top: number; right: number };
}

// Mock notifications - replace with actual API calls
const mockNotifications: Notification[] = [
  {
    id: '1',
    category: 'Booking',
    message: 'New booking, reschedule, cancellation, no-show flag, customer check-in, video-call starting in 10 min.',
    timestamp: '20m ago',
    isRead: false,
    section: 'today'
  },
  {
    id: '2',
    category: 'Payments',
    message: 'Payment succeeded/failed, refund issued, payout scheduled/paid, payout failed (action needed).',
    timestamp: '20m ago',
    isRead: false,
    section: 'today'
  },
  {
    id: '3',
    category: 'Compliance',
    message: 'KYC required/expiring, document rejected (re-upload).',
    timestamp: 'Yesterday',
    isRead: true,
    section: 'previous'
  },
  {
    id: '4',
    category: 'Reviews',
    message: 'New review received, review flagged outcome.',
    timestamp: '30 sept',
    isRead: true,
    section: 'previous'
  }
];

export default function NotificationModal({ isOpen, onClose, position }: NotificationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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

  const todayNotifications = mockNotifications.filter(n => n.section === 'today');
  const previousNotifications = mockNotifications.filter(n => n.section === 'previous');

  const handleMarkAllAsRead = () => {
    // TODO: Implement mark all as read functionality
    console.log('Mark all as read');
  };

  const defaultPosition = position || { top: 80, right: 36 };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className="absolute bg-white rounded-lg shadow-lg w-[400px] max-h-[600px] overflow-hidden flex flex-col"
        style={{
          top: `${defaultPosition.top}px`,
          right: `${defaultPosition.right}px`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 
            className="text-lg font-medium text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 500,
              lineHeight: '28px'
            }}
          >
            Notifications
          </h2>
          <button
            onClick={handleMarkAllAsRead}
            className="flex gap-2 items-center px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Check size={16} className="text-[#6290f2]" />
            <span 
              className="text-sm text-[#6290f2]"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px'
              }}
            >
              Mark all as read
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex flex-col gap-6">
            {/* Today Section */}
            {todayNotifications.length > 0 && (
              <div className="flex flex-col gap-4">
                <p 
                  className="text-sm text-[#9ea5ad]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Today
                </p>
                <div className="flex flex-col gap-3">
                  {todayNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div className="flex gap-1 items-start">
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex gap-1.5 items-center">
                            {!notification.isRead && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#6290f2] shrink-0 mt-1" />
                            )}
                            <h3 
                              className="text-base font-medium text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 500,
                                lineHeight: '24px'
                              }}
                            >
                              {notification.category}
                            </h3>
                          </div>
                          <p 
                            className="text-sm text-[#797e84] pl-3"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            {notification.message}
                          </p>
                        </div>
                        <p 
                          className="text-xs text-[#9ea5ad] shrink-0 whitespace-nowrap"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '16px'
                          }}
                        >
                          {notification.timestamp}
                        </p>
                      </div>
                      {index < todayNotifications.length - 1 && (
                        <div className="h-px bg-gray-200 mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Previous Section */}
            {previousNotifications.length > 0 && (
              <div className="flex flex-col gap-4">
                <p 
                  className="text-sm text-[#9ea5ad]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Previous
                </p>
                <div className="flex flex-col gap-3">
                  {previousNotifications.map((notification, index) => (
                    <div key={notification.id}>
                      <div className="flex gap-1 items-start">
                        <div className="flex-1 flex flex-col gap-1">
                          <div className="flex gap-1.5 items-center">
                            {!notification.isRead && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#6290f2] shrink-0 mt-1" />
                            )}
                            <h3 
                              className="text-base font-medium text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 500,
                                lineHeight: '24px'
                              }}
                            >
                              {notification.category}
                            </h3>
                          </div>
                          <p 
                            className="text-sm text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            {notification.message}
                          </p>
                        </div>
                        <p 
                          className="text-xs text-[#9ea5ad] shrink-0 whitespace-nowrap"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '16px'
                          }}
                        >
                          {notification.timestamp}
                        </p>
                      </div>
                      {index < previousNotifications.length - 1 && (
                        <div className="h-px bg-gray-200 mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {todayNotifications.length === 0 && previousNotifications.length === 0 && (
              <div className="text-center py-8">
                <p 
                  className="text-sm text-[#9ea5ad]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  No notifications
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

