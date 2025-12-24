'use client';

import React, { useState, useRef, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import PaymentDetailsDrawer from '@/components/admin/PaymentDetailsDrawer';
import { useAuth } from '@/context/AuthContext';
import { useAdminPaymentManagement } from '@/hooks/admin/useAdminPaymentManagement';
import { AdminPaymentManagement } from '@/types';
import { Bell, Search, ChevronLeft, ChevronRight } from 'lucide-react';

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
    return 'RM 0';
  }
  return `RM ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format currency without decimals
const formatCurrencyNoDecimals = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'RM 0';
  }
  return `RM ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentManagement | null>(null);
  const bellButtonRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);
  const { adminToken } = useAuth();
  const itemsPerPage = 10;

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: paymentsData, isLoading, error } = useAdminPaymentManagement(
    adminToken,
    currentPage,
    itemsPerPage,
    debouncedSearch
  );

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleCloseNotification = () => {
    setIsNotificationOpen(false);
  };

  const handleViewPayment = (payment: AdminPaymentManagement) => {
    setSelectedPayment(payment);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPayment(null);
  };

  const getNotificationPosition = () => {
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      };
    }
    return { top: 80, right: 36 };
  };

  const payments = paymentsData?.payload?.items || [];
  const totalItems = paymentsData?.payload?.itemsTotal || 0;
  const totalPages = paymentsData?.payload?.pageTotal || 1;
  const currentPageNum = paymentsData?.payload?.curPage || 1;
  const hasNextPage = paymentsData?.payload?.nextPage !== null;
  const hasPrevPage = paymentsData?.payload?.prevPage !== null;

  // Handle scroll to show/hide gradient
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setShowGradient(scrollLeft > 0);
  };

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center justify-between pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            <div className="flex flex-col gap-0.5">
              <h1 
                className="text-xl font-bold text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 700,
                  lineHeight: '28px'
                }}
              >
                Payment Management
              </h1>
            </div>
            {/* <div 
              ref={bellButtonRef}
              className="bg-white rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors relative"
              onClick={handleBellClick}
            >
              <Bell size={20} className="text-black" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </div> */}
          </div>
        </div>

        {/* Notification Modal */}
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={handleCloseNotification}
          position={getNotificationPosition()}
        />

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
          <div className="bg-white rounded-xl p-4 flex flex-col gap-4" style={{ padding: '16px' }}>
            {/* Search Bar */}
            <div className="border border-[#e5e7ea] flex gap-2.5 items-center h-11 px-3 rounded-lg w-full sm:w-[400px]">
              <Search size={20} className="text-[#9ea5ad] shrink-0" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm text-[#9ea5ad]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              />
            </div>

            {/* Table Container with Horizontal Scroll */}
            <div className="relative">
              <div 
                ref={tableScrollRef}
                onScroll={handleScroll}
                className="overflow-x-auto overflow-y-hidden rounded-md" 
                style={{ 
                  scrollbarWidth: 'thin',
                  width: '100%'
                }}
              >
                {/* Table */}
                <div className="flex flex-col min-w-max">
                  {/* Table Header */}
                  <div className="bg-[#f8f9f8] flex items-center px-6 py-3 gap-8" style={{ minWidth: '1600px' }}>
                    {/* Visible columns on initial load */}
                    <div className="min-w-[140px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Txn ID
                      </p>
                    </div>
                    <div className="min-w-[120px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Date/Time
                      </p>
                    </div>
                    <div className="min-w-[150px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Booking
                      </p>
                    </div>
                    <div className="min-w-[150px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Customer
                      </p>
                    </div>
                    <div className="min-w-[150px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Provider
                      </p>
                    </div>
                    <div className="min-w-[120px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Gross Payment
                      </p>
                    </div>
                    {/* Hidden columns - shown on scroll */}
                    <div className="w-[120px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Voucher
                      </p>
                    </div>
                    <div className="w-[120px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Commission
                      </p>
                    </div>
                    <div className="w-[120px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Processing Fee
                      </p>
                    </div>
                    <div className="w-[130px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Net to provider
                      </p>
                    </div>
                    <div className="w-[100px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Method
                      </p>
                    </div>
                    <div className="w-[90px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Action
                      </p>
                    </div>
                  </div>

                  {/* Table Rows */}
                  <div className="flex flex-col">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <p 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          Loading...
                        </p>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center py-8">
                        <p 
                          className="text-sm text-red-500"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          {error instanceof Error ? error.message : 'Failed to load payments'}
                        </p>
                      </div>
                    ) : payments.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <p 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          No payments found
                        </p>
                      </div>
                    ) : (
                      payments.map((payment, index) => {
                        const customerName = `${payment.customer_first_name || ''} ${payment.customer_last_name || ''}`.trim() || 'N/A';
                        const customerInitial = customerName !== 'N/A' ? customerName.charAt(0).toUpperCase() : '?';
                        const voucherAmount = payment.voucher_discount_amount || 0;
                        const voucherDisplay = voucherAmount > 0 ? `-${formatCurrency(voucherAmount)}` : formatCurrency(0);
                        
                        return (
                          <div
                            key={payment.id}
                            className={`flex items-center px-6 py-3 border-b border-[#e5e7ea] gap-8 ${
                              index === payments.length - 1 ? 'border-b-0' : ''
                            }`}
                            style={{ minWidth: '1600px' }}
                          >
                            {/* Visible columns on initial load */}
                            <div className="min-w-[140px] flex-1 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {payment.transaction_id || 'N/A'}
                              </p>
                            </div>
                            <div className="flex flex-col min-w-[120px] flex-1 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {payment.booking_start_time ? formatDate(payment.booking_start_time) : 'N/A'}
                              </p>
                              <p 
                                className="text-sm text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {payment.booking_start_time ? formatTime(payment.booking_start_time) : 'N/A'}
                              </p>
                            </div>
                            <div className="flex flex-col min-w-[150px] flex-1 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {payment.booking_name || 'N/A'}
                              </p>
                              <p 
                                className="text-sm text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatDuration(payment.booking_duration_mins)}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center min-w-[150px] flex-1 px-2">
                              {payment.customer_profile_pic ? (
                                <img 
                                  src={payment.customer_profile_pic} 
                                  alt={customerName}
                                  className="w-9 h-9 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                                  <span className="text-xs text-gray-600">
                                    {customerInitial}
                                  </span>
                                </div>
                              )}
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {customerName}
                              </p>
                            </div>
                            <div className="min-w-[150px] flex-1 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {payment.business_name || 'N/A'}
                              </p>
                            </div>
                            <div className="min-w-[120px] flex-1 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatCurrency(payment.gross_amount)}
                              </p>
                            </div>
                            {/* Hidden columns - shown on scroll */}
                            <div className="w-[120px] shrink-0 px-2">
                              <p 
                                className="text-sm font-medium"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px',
                                  color: '#fab12f'
                                }}
                              >
                                {voucherDisplay}
                              </p>
                            </div>
                            <div className="flex flex-col w-[120px] shrink-0 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatCurrency(payment.commission_amount)}
                              </p>
                              <p 
                                className="text-sm text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {getCommissionPercent(payment.commission_type, payment.commission_type_amount)}
                              </p>
                            </div>
                            <div className="w-[120px] shrink-0 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatCurrency(payment.processing_fee_amount)}
                              </p>
                            </div>
                            <div className="w-[130px] shrink-0 px-2">
                              <p 
                                className="text-sm font-medium"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px',
                                  color: '#1fc16b'
                                }}
                              >
                                {formatCurrency(payment.net_to_provider)}
                              </p>
                            </div>
                            <div className="w-[100px] shrink-0 px-2">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatPaymentMethod(payment.payment_method)}
                              </p>
                            </div>
                            <div className="w-[90px] shrink-0 px-2">
                              <button
                                onClick={() => handleViewPayment(payment)}
                                className="text-sm font-medium text-[#6290f2] underline hover:no-underline transition-all cursor-pointer"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                View
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              {/* Gradient fade indicator on left - only shows after scroll */}
              {showGradient && (
                <div 
                  className="absolute top-0 left-0 h-full w-[100px] pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(to right, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))'
                  }}
                />
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <p 
                  className="text-sm text-[#797e84]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    lineHeight: '20px'
                  }}
                >
                  Showing
                </p>
                <p 
                  className="text-sm font-medium text-black text-center"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    lineHeight: '20px'
                  }}
                >
                  {paymentsData?.payload?.itemsReceived || 0}
                </p>
                <p 
                  className="text-sm text-[#797e84]"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 500,
                    lineHeight: '20px'
                  }}
                >
                  of {totalItems}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <button 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={!hasPrevPage}
                  className={`border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center transition-colors cursor-pointer ${
                    hasPrevPage ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft size={20} className="text-[#797e84]" />
                </button>
                <div className="flex gap-0.5 items-center">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#6290f2] text-white'
                            : 'text-[#797e84] hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <span 
                          className="text-sm"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          {pageNum}
                        </span>
                      </button>
                    );
                  })}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center">
                        <span 
                          className="text-sm text-[#9ea5ad]"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            lineHeight: '21px'
                          }}
                        >
                          ...
                        </span>
                      </div>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-[#797e84] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span 
                          className="text-sm"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          {totalPages}
                        </span>
                      </button>
                    </>
                  )}
                </div>
                <button 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={!hasNextPage}
                  className={`border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center transition-colors cursor-pointer ${
                    hasNextPage ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight size={20} className="text-[#797e84]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Drawer */}
      <PaymentDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        payment={selectedPayment}
      />
    </div>
  );
}

