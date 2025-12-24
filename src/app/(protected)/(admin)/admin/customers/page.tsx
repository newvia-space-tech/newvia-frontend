'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import { useAuth } from '@/context/AuthContext';
import { useAdminCustomerManagement } from '@/hooks/admin/useAdminCustomerManagement';
import { Bell, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper function to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  if (amount === 0) {
    return 'RM 0';
  }
  return `RM ${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export default function CustomersPage() {
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

  const { data: customersData, isLoading, error } = useAdminCustomerManagement(
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

  const getStatusBadge = (isActive: boolean) => {
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

  const customers = customersData?.payload?.items || [];
  const totalItems = customersData?.payload?.itemsTotal || 0;
  const totalPages = customersData?.payload?.pageTotal || 1;
  const currentPageNum = customersData?.payload?.curPage || 1;
  const hasNextPage = customersData?.payload?.nextPage !== null;
  const hasPrevPage = customersData?.payload?.prevPage !== null;

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
                Customer Management
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
                  <div className="bg-[#f8f9f8] flex items-center px-6 py-3 gap-8" style={{ minWidth: '1000px' }}>
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
                    <div className="min-w-[180px] flex-1 px-2">
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
                    <div className="min-w-[160px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Bookings
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
                        Total Spent
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
                        Join Date
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
                      style={{ minWidth: '1000px' }}
                    >
                      <div className="flex gap-2 items-center min-w-[180px] flex-1 px-2">
                        <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse shrink-0" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-[180px] flex-1 px-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[160px] flex-1 px-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                      <div className="min-w-[160px] flex-1 px-2">
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[160px] flex-1 px-2">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[160px] flex-1 px-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-red-600">
                      Failed to load customers. Please try again later.
                    </p>
                  </div>
                ) : customers.length === 0 ? (
                  // Empty state
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-[#797e84]">
                      No customers found
                    </p>
                  </div>
                ) : (
                  // Success state
                  customers.map((customer, index) => {
                    const customerName = `${customer.first_name} ${customer.last_name}`;
                    const initials = `${customer.first_name.charAt(0)}${customer.last_name.charAt(0)}`;
                    const joinDate = formatDate(customer.created_at);
                    const totalSpent = formatCurrency(customer.total_money_spent);
                    
                    return (
                      <div
                        key={customer.id}
                        className={`flex items-center px-6 py-3 gap-8 border-b border-[#e5e7ea] ${
                          index === customers.length - 1 ? 'border-b-0' : ''
                        }`}
                        style={{ minWidth: '1000px' }}
                      >
                        <div className="flex gap-2 items-center min-w-[180px] flex-1 px-2">
                          {customer.profile_photo ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={customer.profile_photo}
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
                        <div className="flex flex-col min-w-[180px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black truncate"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                            title={customer.email_id}
                          >
                            {customer.email_id}
                          </p>
                          <p 
                            className="text-sm text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {customer.phone_number || 'N/A'}
                          </p>
                        </div>
                        <div className="min-w-[160px] flex-1 px-2">
                          {getStatusBadge(customer.is_active)}
                        </div>
                        <div className="min-w-[160px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {customer.total_bookings}
                          </p>
                        </div>
                        <div className="min-w-[160px] flex-1 px-2">
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
                        <div className="min-w-[160px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                          >
                            {joinDate}
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
                    {customersData?.payload?.itemsReceived || 0}
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
                      className="border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                            className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
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
                      className="border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
