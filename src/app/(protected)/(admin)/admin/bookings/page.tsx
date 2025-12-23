'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import { useAuth } from '@/context/AuthContext';
import { useAdminBookingManagement } from '@/hooks/admin/useAdminBookingManagement';
import { Bell, Search, ChevronLeft, ChevronRight } from 'lucide-react';

type FilterTab = 'all' | 'upcoming' | 'completed' | 'cancelled';

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
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

// Helper function to map API status to UI status
const mapStatusToUI = (apiStatus: string): 'upcoming' | 'completed' | 'cancelled' => {
  const statusMap: Record<string, 'upcoming' | 'completed' | 'cancelled'> = {
    'confirmed': 'upcoming',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'pending': 'upcoming',
  };
  return statusMap[apiStatus.toLowerCase()] || 'upcoming';
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string): string => {
  if (amount === 0) {
    return 'Free';
  }
  const currencySymbol = currency.toUpperCase() === 'MYR' ? 'RM' : currency.toUpperCase();
  return `${currencySymbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
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

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Map UI filter tabs to API filter values
  const getApiFilter = (tab: FilterTab): string => {
    const filterMap: Record<FilterTab, string> = {
      all: 'all',
      upcoming: 'upcoming',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    return filterMap[tab];
  };

  const { data: bookingsData, isLoading, error } = useAdminBookingManagement(
    adminToken,
    getApiFilter(activeTab),
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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; dotColor: string }> = {
      confirmed: { color: '#1fc16b', dotColor: '#1fc16b' }, // Green
      completed: { color: '#1fc16b', dotColor: '#1fc16b' },
      cancelled: { color: '#e43636', dotColor: '#e43636' }, // Red
      pending: { color: '#fab12f', dotColor: '#fab12f' }, // Yellow
      upcoming: { color: '#fab12f', dotColor: '#fab12f' }, // Yellow
    };

    const normalizedStatus = status.toLowerCase();
    const config = statusConfig[normalizedStatus] || statusConfig.pending;

    return (
      <div className="border border-[#e5e7ea] flex gap-1.5 items-center justify-center px-2.5 py-0.5 rounded-full">
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: config.dotColor }} 
        />
        <p 
          className="text-sm"
          style={{ 
            fontFamily: 'Lato, sans-serif',
            fontWeight: 400,
            lineHeight: '20px',
            color: config.color
          }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </p>
      </div>
    );
  };

  const bookings = bookingsData?.payload?.items || [];
  const totalItems = bookingsData?.payload?.itemsTotal || 0;
  const totalPages = bookingsData?.payload?.pageTotal || 1;
  const currentPageNum = bookingsData?.payload?.curPage || 1;
  const hasNextPage = bookingsData?.payload?.nextPage !== null;
  const hasPrevPage = bookingsData?.payload?.prevPage !== null;

  // Handle scroll to show/hide gradient
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setShowGradient(scrollLeft > 0);
  };

  // Generate pagination page numbers
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPageNum <= 3) {
        // Show first few pages
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPageNum >= totalPages - 2) {
        // Show last few pages
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show pages around current
        pages.push('...');
        for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
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
                Bookings Management
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
          <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
            {/* Filter Tabs and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start">
              {/* Filter Tabs */}
              <div className="border-b border-[#e5e7ea] flex items-center gap-0 flex-1">
                {(['all', 'upcoming', 'completed', 'cancelled'] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`h-11 min-w-[80px] px-4 py-3 rounded-t-lg transition-colors relative ${
                      activeTab === tab
                        ? 'text-black'
                        : 'text-[#797e84]'
                    }`}
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 500,
                      lineHeight: '20px',
                      fontSize: '14px'
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
                    )}
                  </button>
                ))}
              </div>

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
                  <div className="bg-[#f8f9f8] flex items-center px-6 py-3 gap-8" style={{ minWidth: '1200px' }}>
                    <div className="min-w-[180px] flex-1 px-2">
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
                    <div className="min-w-[200px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Service
                      </p>
                    </div>
                    <div className="min-w-[140px] flex-1 px-2">
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
                    <div className="min-w-[200px] flex-1 px-2">
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
                    <div className="min-w-[160px] flex-1 px-2">
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
                    <div className="min-w-[140px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Total Spent
                      </p>
                    </div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col">
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className={`flex items-center px-6 py-3 gap-8 border-b border-[#e5e7ea] ${
                        index === 9 ? 'border-b-0' : ''
                      }`}
                      style={{ minWidth: '1200px' }}
                    >
                      <div className="flex gap-2 items-center min-w-[180px] flex-1 px-2">
                        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-[200px] flex-1 px-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-[140px] flex-1 px-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[200px] flex-1 px-2">
                        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[160px] flex-1 px-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                      <div className="min-w-[140px] flex-1 px-2">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-red-600">
                      Failed to load bookings. Please try again later.
                    </p>
                  </div>
                ) : bookings.length === 0 ? (
                  // Empty state
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-[#797e84]">
                      No bookings found
                    </p>
                  </div>
                ) : (
                  // Success state
                  bookings.map((booking, index) => {
                    const customerName = `${booking.user_first_name} ${booking.user_last_name}`;
                    const apiStatus = booking.status.toLowerCase();
                    const date = formatDate(booking.created_at);
                    const time = formatTime(booking.created_at);
                    const totalSpent = formatCurrency(booking.total_money_spent, booking.currency);
                    const initials = `${booking.user_first_name.charAt(0)}${booking.user_last_name.charAt(0)}`;
                    
                    return (
                      <div
                        key={`${booking.business_id}-${booking.user_id}-${booking.services_id}-${booking.created_at}`}
                        className={`flex items-center px-6 py-3 gap-8 border-b border-[#e5e7ea] ${
                          index === bookings.length - 1 ? 'border-b-0' : ''
                        }`}
                        style={{ minWidth: '1200px' }}
                      >
                        <div className="flex gap-2 items-center min-w-[180px] flex-1 px-2">
                          {booking.user_profile_pic ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={booking.user_profile_pic}
                                alt={customerName}
                                width={36}
                                height={36}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
                              <span className="text-xs text-gray-600">
                                {initials}
                              </span>
                            </div>
                          )}
                          <p 
                            className="text-sm font-medium text-black truncate"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                            title={customerName}
                          >
                            {customerName}
                          </p>
                        </div>
                        <div className="flex flex-col min-w-[200px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black truncate"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                            title={booking.service_name}
                          >
                            {booking.service_name}
                          </p>
                          <p 
                            className="text-sm text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {booking.service_duration_mins} min
                          </p>
                        </div>
                        <div className="flex flex-col min-w-[140px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {date}
                          </p>
                          <p 
                            className="text-sm text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {time}
                          </p>
                        </div>
                        <div className="min-w-[200px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black truncate"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                            title={booking.provider_name}
                          >
                            {booking.provider_name}
                          </p>
                        </div>
                        <div className="min-w-[160px] flex-1 px-2">
                          {getStatusBadge(apiStatus)}
                        </div>
                        <div className="min-w-[140px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {totalSpent}
                          </p>
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
            {!isLoading && !error && (
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
                    {bookingsData?.payload?.itemsReceived || 0}
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
                {totalPages > 1 && (
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => hasPrevPage && setCurrentPage(currentPageNum - 1)}
                      disabled={!hasPrevPage}
                      className="border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} className="text-[#797e84]" />
                    </button>
                    <div className="flex gap-0.5 items-center">
                      {getPaginationPages().map((page, index) => {
                        if (page === '...') {
                          return (
                            <div key={`ellipsis-${index}`} className="w-9 h-9 rounded-lg flex items-center justify-center">
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
                          );
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              currentPageNum === page
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
                              {page}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => hasNextPage && setCurrentPage(currentPageNum + 1)}
                      disabled={!hasNextPage}
                      className="border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} className="text-[#797e84]" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

