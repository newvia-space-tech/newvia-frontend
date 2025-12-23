'use client';

import React, { useState, useRef, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import RefundSettleConfirmationModal from '@/components/admin/RefundSettleConfirmationModal';
import { useAuth } from '@/context/AuthContext';
import { useAdminRefundManagement } from '@/hooks/admin/useAdminRefundManagement';
import { useSettleRefund } from '@/hooks/admin/useSettleRefund';
import { AdminRefundManagement } from '@/types';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format time from timestamp
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

// Helper function to format currency
const formatCurrency = (amount: number | null): string => {
  const value = amount ?? 0;
  return `RM ${value.toFixed(2)}`;
};

export default function RefundPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<AdminRefundManagement | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);
  const { adminToken } = useAuth();
  const itemsPerPage = 10;

  // Settle refund mutation
  const settleRefundMutation = useSettleRefund(adminToken);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch refund data
  const { data: refundsData, isLoading, error } = useAdminRefundManagement(
    adminToken,
    currentPage,
    itemsPerPage,
    debouncedSearch
  );

  const refunds = refundsData?.payload?.items || [];
  const totalItems = refundsData?.payload?.itemsTotal || 0;
  const totalPages = refundsData?.payload?.pageTotal || 1;
  const hasNextPage = refundsData?.payload?.nextPage !== null;
  const hasPrevPage = refundsData?.payload?.prevPage !== null;

  // Handle scroll to show/hide gradient
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setShowGradient(scrollLeft > 0);
  };

  const getStatusBadge = () => {
    // Always show pending status
    return (
      <div className="border border-[#e5e7ea] flex gap-1.5 items-center justify-center px-2.5 py-0.5 rounded-full">
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: '#fab12f' }} 
        />
        <p 
          className="text-sm capitalize"
          style={{ 
            fontFamily: 'Lato, sans-serif',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#fab12f'
          }}
        >
          pending
        </p>
      </div>
    );
  };

  const handleSettlePayoutClick = (refund: AdminRefundManagement) => {
    setSelectedRefund(refund);
    setIsConfirmationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsConfirmationModalOpen(false);
    setSelectedRefund(null);
  };

  const handleConfirmSettle = async () => {
    if (!selectedRefund) return;

    try {
      await settleRefundMutation.mutateAsync({
        refund_id: selectedRefund.id
      });

      // Close modal on success
      handleCloseModal();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to settle refund:', error);
    }
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
                Refund Management
              </h1>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
          <div className="bg-white rounded-xl p-4 flex flex-col gap-4" style={{ padding: '16px' }}>
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
              {/* Search Bar */}
              <div className="border border-[#e5e7ea] flex gap-2.5 items-center h-11 px-3 rounded-lg w-full lg:w-[400px]">
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
                  <div className="bg-[#f8f9f8] flex items-center px-3 py-3 gap-4" style={{ minWidth: '1000px' }}>
                    <div className="flex-1 px-3 min-w-[140px]">
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
                    <div className="flex-1 px-3 min-w-[160px]">
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
                    <div className="flex-1 px-3 min-w-[140px]">
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
                    <div className="flex-1 px-3 min-w-[120px]">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Services
                      </p>
                    </div>
                    <div className="flex-1 px-3 min-w-[70px]">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Amount
                      </p>
                    </div>
                    <div className="flex-1 px-3 min-w-[100px]">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Date & Time
                      </p>
                    </div>
                    <div className="flex-1 px-3 min-w-[82px]">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Status
                      </p>
                    </div>
                    <div className="flex-1 px-3 min-w-[90px]">
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
                          Loading refunds...
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
                          {error instanceof Error ? error.message : 'Failed to load refunds'}
                        </p>
                      </div>
                    ) : refunds.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <p 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          No refunds found
                        </p>
                      </div>
                    ) : (
                      refunds.map((refund, index) => {
                        const customerName = `${refund.user_first_name} ${refund.user_last_name}`;
                        const customerInitial = refund.user_first_name?.charAt(0).toUpperCase() || 'U';
                        
                        return (
                          <div
                            key={refund.id}
                            className={`flex items-center px-3 py-3 border-b border-[#e5e7ea] gap-4 ${
                              index === refunds.length - 1 ? 'border-b-0' : ''
                            }`}
                            style={{ minWidth: '1000px' }}
                          >
                            <div className="flex-1 px-3 min-w-[140px]">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {refund.transaction_id}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center flex-1 px-3 min-w-[160px]">
                              {refund.user_profile_photo ? (
                                <img 
                                  src={refund.user_profile_photo} 
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
                            <div className="flex-1 px-3 min-w-[140px]">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {refund.business_name}
                              </p>
                            </div>
                            <div className="flex-1 px-3 min-w-[120px]">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {refund.service_name}
                              </p>
                            </div>
                            <div className="flex-1 px-3 min-w-[70px]">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatCurrency(refund.amount)}
                              </p>
                            </div>
                            <div className="flex flex-col flex-1 px-3 min-w-[100px]">
                              <p 
                                className="text-sm font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatDate(refund.date)}
                              </p>
                              <p 
                                className="text-sm text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                {formatTime(refund.date)}
                              </p>
                            </div>
                            <div className="flex-1 px-3 min-w-[82px]">
                              {getStatusBadge()}
                            </div>
                            <div className="flex-1 px-3 min-w-[90px]">
                              <button
                                onClick={() => handleSettlePayoutClick(refund)}
                                className="text-sm font-medium text-[#6290f2] underline hover:no-underline transition-all cursor-pointer"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '20px'
                                }}
                              >
                                Settle Payout
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
            {!isLoading && !error && refunds.length > 0 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex gap-2 items-center flex-wrap">
                  <p 
                    className="text-sm text-[#797e84] whitespace-nowrap"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '20px'
                    }}
                  >
                    Showing
                  </p>
                  <p 
                    className="text-sm font-medium text-black text-center whitespace-nowrap"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '20px'
                    }}
                  >
                    {refundsData?.payload?.itemsReceived || 0}
                  </p>
                  <p 
                    className="text-sm text-[#797e84] whitespace-nowrap"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '20px'
                    }}
                  >
                    of {totalItems}
                  </p>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={!hasPrevPage}
                    className={`border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center transition-colors ${
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
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
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
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#797e84] hover:bg-gray-50 transition-colors"
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
                    className={`border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center transition-colors ${
                      hasNextPage ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight size={20} className="text-[#797e84]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Refund Settle Confirmation Modal */}
      <RefundSettleConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmSettle}
        isLoading={settleRefundMutation.isPending}
      />
    </div>
  );
}

