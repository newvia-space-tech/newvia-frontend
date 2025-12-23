'use client';

import React, { useEffect } from 'react';
import { X, Coins, Download } from 'lucide-react';
import { AdminPaymentManagement } from '@/types';

interface PaymentDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payment: AdminPaymentManagement | null;
}

// Helper function to format date from timestamp
const formatDate = (timestamp: number | null | undefined): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format time from timestamp
const formatTime = (timestamp: number | null | undefined): string => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'RM 0.00';
  }
  return `RM ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format duration
const formatDuration = (minutes: number | null | undefined): string => {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return 'N/A';
  }
  return `${minutes} min`;
};

// Helper function to format payment method
const formatPaymentMethod = (method: string | null | undefined): 'Card' | 'Wallet' => {
  if (!method) return 'Card';
  const lowerMethod = method.toLowerCase();
  if (lowerMethod === 'wallet') return 'Wallet';
  return 'Card';
};

// Helper function to get status display
const getStatusDisplay = (status: string | null | undefined): { text: string; color: string; bgColor: string } => {
  if (!status) {
    return { text: 'Unknown', color: '#797e84', bgColor: '#f3f4f6' };
  }
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'succeeded') {
    return { text: 'Succeeded', color: '#1fc16b', bgColor: '#e9f9f0' };
  } else if (lowerStatus === 'pending') {
    return { text: 'Pending', color: '#fab12f', bgColor: '#fef3e2' };
  } else if (lowerStatus === 'failed') {
    return { text: 'Failed', color: '#e43636', bgColor: '#fee2e2' };
  }
  return { text: status, color: '#797e84', bgColor: '#f3f4f6' };
};

// Helper function to get commission percent display
const getCommissionPercent = (commissionType: string | null | undefined, commissionTypeAmount: number | null | undefined): string => {
  if (!commissionType || commissionTypeAmount === null || commissionTypeAmount === undefined) {
    return '0%';
  }
  if (commissionType.toLowerCase() === 'percent') {
    return `${commissionTypeAmount}%`;
  }
  return 'Fixed';
};

// Helper function to get processing fee percent display
const getProcessingFeePercent = (processingFeeType: string | null | undefined, processingTypeValue: number | null | undefined): string => {
  if (!processingFeeType || processingTypeValue === null || processingTypeValue === undefined) {
    return '0%';
  }
  if (processingFeeType.toLowerCase() === 'percent') {
    return `${processingTypeValue}%`;
  }
  return 'Fixed';
};

export default function PaymentDetailsDrawer({
  isOpen,
  onClose,
  payment
}: PaymentDetailsDrawerProps) {
  // Disable body scroll when drawer is open
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

  if (!payment) return null;

  // Format data from API response
  const customerName = `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim() || 'N/A';
  const grossAmount = payment.gross_amount || 0;
  const commissionAmount = payment.commission_amount || 0;
  const processingFeeAmount = payment.processing_fee_amount || 0;
  const voucherAmount = payment.voucher_discount_amount || 0;
  const netToProvider = payment.net_to_provider || 0;
  const platformTakeRate = payment.platform_take_rate !== null && payment.platform_take_rate !== undefined
    ? payment.platform_take_rate.toFixed(1)
    : '0.0';
  
  const statusDisplay = getStatusDisplay(payment.status);
  const commissionPercent = getCommissionPercent(payment.commission_type, payment.commission_type_amount);
  const processingFeePercent = getProcessingFeePercent(payment.processing_fee_type, payment.processing_type_value);

  return (
    <div 
      className="fixed inset-0 z-50"
      style={{
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity duration-300 ease-in-out"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          opacity: isOpen ? 1 : 0
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className="absolute bg-white h-[85vh] sm:h-full right-0 top-[60px] sm:top-0 w-full sm:w-[600px] flex flex-col overflow-hidden rounded-t-xl sm:rounded-none shadow-2xl"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 pt-4 sm:pt-5 px-4 sm:px-5 shrink-0 w-full border-b border-[#e5e7ea]">
          <div className="flex flex-col items-start justify-center shrink-0">
            <h2 
              className="text-lg sm:text-xl font-semibold text-black mb-1"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
                lineHeight: '28px'
              }}
            >
              Transaction Details
            </h2>
            <p 
              className="text-[#797e84] text-sm sm:text-base"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px'
              }}
            >
              {payment.transaction_id || 'N/A'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white flex items-center justify-center p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X size={20} className="text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Transaction Overview */}
          <div className="flex flex-col gap-4 sm:gap-6 items-start p-4 sm:p-5 shrink-0 w-full">
            <div className="bg-[#f8f9f8] flex flex-col gap-4 items-center justify-center p-3 sm:p-4 rounded-lg shrink-0 w-full">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 items-start shrink-0 w-full">
                {/* Status */}
                <div className="flex flex-col gap-1.5 items-start shrink-0">
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    Status
                  </p>
                  <div 
                    className="flex gap-1.5 items-center justify-center px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: statusDisplay.bgColor }}
                  >
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: statusDisplay.color }}
                    />
                    <p 
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px',
                        fontSize: '14px',
                        color: statusDisplay.color
                      }}
                    >
                      {statusDisplay.text}
                    </p>
                  </div>
                </div>

                {/* Customer */}
                <div className="flex flex-col gap-1.5 items-start shrink-0">
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    Customer
                  </p>
                  <p 
                    className="text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px',
                      fontSize: '16px'
                    }}
                  >
                    {customerName}
                  </p>
                </div>

                {/* Provider */}
                <div className="flex flex-col gap-1.5 items-start shrink-0">
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    Provider
                  </p>
                  <p 
                    className="text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px',
                      fontSize: '16px'
                    }}
                  >
                    {payment.business_name || 'N/A'}
                  </p>
                </div>

                {/* Gross Amount */}
                <div className="flex flex-col gap-1.5 items-start shrink-0">
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    Gross Amount
                  </p>
                  <p 
                    className="text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px',
                      fontSize: '16px'
                    }}
                  >
                    {formatCurrency(grossAmount)}
                  </p>
                </div>

                {/* Net to Provider */}
                <div className="flex flex-col gap-1.5 items-start shrink-0">
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    Net to Provider
                  </p>
                  <p 
                    className="text-[#1fc16b]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px',
                      fontSize: '16px'
                    }}
                  >
                    {formatCurrency(netToProvider)}
                  </p>
                </div>

                {/* Method */}
                <div className="flex flex-col gap-1.5 items-start shrink-0">
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    Method
                  </p>
                  <p 
                    className="text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px',
                      fontSize: '16px'
                    }}
                  >
                    {formatPaymentMethod(payment.payment_method)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="flex flex-col gap-4 items-start p-4 sm:p-5 shrink-0 w-full">
            <div className="flex gap-1.5 items-center justify-center shrink-0">
              <Coins size={20} className="text-black" />
              <p 
                className="text-black font-semibold"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 600,
                  lineHeight: '24px',
                  fontSize: '16px'
                }}
              >
                Payment Breakdown
              </p>
            </div>

            <div className="border border-[#e5e7ea] flex flex-col gap-3 items-start p-3 sm:p-4 rounded-lg shrink-0 w-full">
              {/* Gross Amount */}
              <div className="flex items-center justify-between shrink-0 w-full">
                <p 
                  className="text-[#797e84]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  Gross Amount
                </p>
                <p 
                  className="text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  {formatCurrency(grossAmount)}
                </p>
              </div>

              {/* Voucher Applied */}
              <div className="flex items-center justify-between shrink-0 w-full">
                <p 
                  className="text-[#797e84]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  Voucher Applied
                </p>
                <p 
                  className="text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  {voucherAmount > 0 ? `-${formatCurrency(voucherAmount)}` : formatCurrency(0)}
                </p>
              </div>

              {/* Platform Commission */}
              <div className="flex items-center justify-between shrink-0 w-full">
                <p 
                  className="text-[#797e84]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  Platform Commission ({commissionPercent})
                </p>
                <p 
                  className="text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  -{formatCurrency(commissionAmount)}
                </p>
              </div>

              {/* Processing Fee */}
              <div className="flex items-center justify-between shrink-0 w-full">
                <p 
                  className="text-[#797e84]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  Processing Fee ({processingFeePercent})
                </p>
                <p 
                  className="text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px',
                    fontSize: '16px'
                  }}
                >
                  -{formatCurrency(processingFeeAmount)}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-[#e5e7ea]" />

              {/* Net to Provider */}
              <div className="flex flex-col gap-2 items-start shrink-0 w-full">
                <div className="flex items-center justify-between shrink-0 w-full">
                  <p 
                    className="text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '28px',
                      fontSize: '18px'
                    }}
                  >
                    Net to Provider
                  </p>
                  <p 
                    className="text-[#1fc16b] font-medium"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '28px',
                      fontSize: '18px'
                    }}
                  >
                    {formatCurrency(netToProvider)}
                  </p>
                </div>
                <div className="flex items-center justify-between shrink-0 w-full">
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    Platform Take Rate
                  </p>
                  <p 
                    className="text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    {platformTakeRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 items-center justify-end p-4 sm:p-5 shrink-0 w-full border-t border-[#e5e7ea]">
          {/* <button
            onClick={() => {
              // TODO: Implement download receipt functionality
              console.log('Download receipt for', payment.transaction_id);
            }}
            className="border border-[#6290f2] flex gap-2 items-center justify-center px-4 py-2.5 rounded-lg w-full hover:bg-[#6290f2]/5 transition-colors"
          >
            <p 
              className="text-[#6290f2]"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                fontSize: '16px'
              }}
            >
              Download Receipt
            </p>
            <Download size={20} className="text-[#6290f2]" />
          </button> */}
        </div>
      </div>
    </div>
  );
}

