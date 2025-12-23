'use client';

import React, { useState, useRef } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import SettlePayoutModal from '@/components/admin/SettlePayoutModal';
import { useAuth } from '@/context/AuthContext';
import { useAdminProviderManagement } from '@/hooks/admin/useAdminProviderManagement';
import { AdminProviderManagement } from '@/types';
import { Bell, Search, ChevronLeft, ChevronRight, Star } from 'lucide-react';

// Helper function to format currency
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'RM 0';
  }
  return `RM ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to format currency with /mo
const formatCurrencyMonthly = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'RM 0/mo';
  }
  return `RM ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/mo`;
};

// Helper function to get processing fee percent display
const getProcessingFeePercent = (processingFeeType: string | null | undefined, processingFeeValue: number | null | undefined): string => {
  if (!processingFeeType || processingFeeValue === null || processingFeeValue === undefined) {
    return '(0%)';
  }
  if (processingFeeType.toLowerCase() === 'percent') {
    return `(${processingFeeValue}%)`;
  }
  return '(Fixed)';
};


export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSettlePayoutOpen, setIsSettlePayoutOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AdminProviderManagement | null>(null);
  const bellButtonRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [showGradient, setShowGradient] = useState(false);
  const { adminToken } = useAuth();
  const itemsPerPage = 10;

  // Fetch providers data
  const { data: providersData, isLoading, error } = useAdminProviderManagement(
    adminToken,
    currentPage,
    itemsPerPage
  );

  const providers = providersData?.payload?.items || [];
  const totalItems = providersData?.payload?.itemsTotal || 0;
  const totalPages = providersData?.payload?.pageTotal || 1;
  const hasNextPage = providersData?.payload?.nextPage !== null;
  const hasPrevPage = providersData?.payload?.prevPage !== null;

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleCloseNotification = () => {
    setIsNotificationOpen(false);
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

  const getStatusBadge = (isDeleted: boolean) => {
    const isActive = !isDeleted;
    return (
      <div className="border border-[#e5e7ea] flex gap-1.5 items-center justify-center px-2.5 py-0.5 rounded-full">
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: isActive ? '#1fc16b' : '#e43636' }} 
        />
        <p 
          className="text-sm"
          style={{ 
            fontFamily: 'Lato, sans-serif',
            fontWeight: 400,
            lineHeight: '20px',
            color: isActive ? '#1fc16b' : '#e43636'
          }}
        >
          {isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    );
  };

  const getPayoutBadge = (payoutDone: boolean | null) => {
    const isPaid = payoutDone === true;
    return (
      <div className="border border-[#e5e7ea] flex gap-1.5 items-center justify-center px-2.5 py-0.5 rounded-full">
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: isPaid ? '#1fc16b' : '#e43636' }} 
        />
        <p 
          className="text-sm"
          style={{ 
            fontFamily: 'Lato, sans-serif',
            fontWeight: 400,
            lineHeight: '20px',
            color: isPaid ? '#1fc16b' : '#e43636'
          }}
        >
          {isPaid ? 'Paid' : 'Pending'}
        </p>
      </div>
    );
  };

  const filteredProviders = providers.filter(provider => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      provider.business_name?.toLowerCase().includes(query) ||
      provider.email_id?.toLowerCase().includes(query) ||
      provider.category?.toLowerCase().includes(query)
    );
  });

  // Handle scroll to show/hide gradient
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setShowGradient(scrollLeft > 0);
  };

  // Calculate initial visible width (up to Proc. Fee)
  // Business (150) + Contact (130) + Status (80) + Category (120) + Subscription (120) + Monthly Revenue (110) + Proc. Fee (110) = 820px
  // But we want to fill the full width, so we'll use flex with proper spacing

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
                Provider Management
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
                  <div className="bg-[#f8f9f8] flex items-center px-6 py-3 gap-8" style={{ minWidth: '1776px' }}>
                    {/* Visible columns on initial load - these expand to fill width */}
                    <div className="min-w-[150px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Business
                      </p>
                    </div>
                    <div className="min-w-[200px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Contact
                      </p>
                    </div>
                    <div className="min-w-[80px] flex-1 px-2">
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
                    <div className="min-w-[120px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Category
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
                        Subscription
                      </p>
                    </div>
                    <div className="min-w-[110px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Monthly Revenue
                      </p>
                    </div>
                    <div className="min-w-[110px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Proc. Fee
                      </p>
                    </div>
                    {/* Hidden columns - shown on scroll */}
                    <div className="w-[110px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Total Commission
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
                        Payout
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
                        Week Net to Provider
                      </p>
                    </div>
                    <div className="w-[70px] shrink-0 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Rating
                      </p>
                    </div>
                    <div className="w-[50px] shrink-0 flex justify-center px-2">
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
                    {filteredProviders.map((provider, index) => (
                      <div
                        key={provider.id}
                        className={`flex items-center px-6 py-3 border-b border-[#e5e7ea] gap-8 ${
                          index === filteredProviders.length - 1 ? 'border-b-0' : ''
                        }`}
                        style={{ minWidth: '1776px' }}
                      >
                        {/* Visible columns on initial load - these expand to fill width */}
                        <div className="min-w-[150px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {provider.business_name}
                          </p>
                        </div>
                        <div className="flex flex-col min-w-[200px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {provider.email_id}
                          </p>
                        </div>
                        <div className="min-w-[80px] flex-1 px-2">
                          {getStatusBadge(provider.is_deleted)}
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
                            {provider.category}
                          </p>
                        </div>
                        <div className="min-w-[120px] flex-1 px-2">
                          <div className="bg-[#fffbec] flex items-center justify-center px-3 py-0.5 rounded-full w-fit">
                            <p 
                              className="text-sm"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px',
                                color: '#fab12f'
                              }}
                            >
                              {provider.subscription}
                            </p>
                          </div>
                        </div>
                        <div className="min-w-[110px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {formatCurrencyMonthly(provider.monthly_revenue)}
                          </p>
                        </div>
                        <div className="flex flex-col min-w-[110px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {formatCurrency(provider.total_processing_fee)}
                          </p>
                          <p 
                            className="text-sm text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {getProcessingFeePercent(provider.payment_processing_fee_type, provider.payment_processing_fee_value)}
                          </p>
                        </div>
                        {/* Hidden columns - shown on scroll */}
                        <div className="w-[110px] shrink-0 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {formatCurrency(provider.total_commission)}
                          </p>
                        </div>
                        <div className="w-[100px] shrink-0 px-2">
                          {getPayoutBadge(provider.payout_done)}
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
                            {formatCurrency(provider.week_net_to_provider)}
                          </p>
                        </div>
                        <div className="flex gap-1.5 items-center w-[70px] shrink-0 px-2">
                          <Star size={13} className="fill-black text-black" />
                          <p 
                            className="text-sm text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            {provider.average_rating || 0}
                          </p>
                          <p 
                            className="text-sm text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            ({provider.total_reviews || 0})
                          </p>
                        </div>
                        <div className="w-[50px] shrink-0 flex justify-center px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {provider.total_bookings || 0}
                          </p>
                        </div>
                        <div className="w-[90px] shrink-0 px-2">
                          {provider.payout_done === false ? (
                            <button
                              onClick={() => {
                                setSelectedProvider(provider);
                                setIsSettlePayoutOpen(true);
                              }}
                              className="text-sm font-medium text-[#6290f2] underline hover:no-underline transition-all cursor-pointer"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 500,
                                lineHeight: '20px'
                              }}
                            >
                              Settle Payout
                            </button>
                          ) : (
                            <div className="h-5" />
                          )}
                        </div>
                      </div>
                    ))}
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

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <p 
                  className="text-[#797e84] text-base"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '24px' 
                  }}
                >
                  Loading providers...
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <p 
                  className="text-red-500 text-base"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '24px' 
                  }}
                >
                  {error instanceof Error ? error.message : 'Failed to load providers'}
                </p>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredProviders.length === 0 && (
              <div className="text-center py-12">
                <p 
                  className="text-[#797e84] text-base"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '24px' 
                  }}
                >
                  No providers found
                </p>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && filteredProviders.length > 0 && (
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
                    {providersData?.payload?.itemsReceived || 0}
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

      {/* Settle Payout Modal */}
      <SettlePayoutModal
        isOpen={isSettlePayoutOpen}
        onClose={() => {
          setIsSettlePayoutOpen(false);
          setSelectedProvider(null);
        }}
        businessId={selectedProvider?.id}
        providerName={selectedProvider?.business_name}
        onConfirm={(selectedItems) => {
          // TODO: Implement API call to settle payout
          console.log('Settling payout for provider:', selectedProvider?.id, selectedItems);
        }}
      />
    </div>
  );
}

