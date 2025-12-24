'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import AdminFlagReviewActionModal from '@/components/admin/AdminFlagReviewActionModal';
import { useAuth } from '@/context/AuthContext';
import { useAdminReviewManagement } from '@/hooks/admin/useAdminReviewManagement';
import { useFlagUnflagReview } from '@/hooks/admin/useFlagUnflagReview';
import { AdminReviewManagement } from '@/types';
import { Bell, Search, ChevronLeft, ChevronRight, Star, HelpCircle } from 'lucide-react';

// Helper function to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ReviewManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<AdminReviewManagement | null>(null);
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

  const { data: reviewsData, isLoading, error, refetch } = useAdminReviewManagement(
    adminToken,
    currentPage,
    itemsPerPage
  );

  const flagUnflagMutation = useFlagUnflagReview(adminToken);

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

  const handleFlagIconClick = (review: AdminReviewManagement) => {
    if (review.is_flagged) {
      setSelectedReview(review);
      setIsFlagModalOpen(true);
    }
  };

  const handleCloseFlagModal = () => {
    setIsFlagModalOpen(false);
    setSelectedReview(null);
  };

  const handleApprove = async () => {
    if (!selectedReview || !adminToken) return;

    try {
      await flagUnflagMutation.mutateAsync({
        review_id: selectedReview.id,
        action: 'flag'
      });
      handleCloseFlagModal();
      refetch();
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Failed to approve review. Please try again.');
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !adminToken) return;

    try {
      await flagUnflagMutation.mutateAsync({
        review_id: selectedReview.id,
        action: 'unflag'
      });
      handleCloseFlagModal();
      refetch();
    } catch (error) {
      console.error('Error rejecting review:', error);
      alert('Failed to reject review. Please try again.');
    }
  };

  const getStatusBadge = (review: AdminReviewManagement) => {
    return (
      <div className="flex gap-1.5 items-center">
        <div className="border border-[#e5e7ea] flex gap-1.5 items-center justify-center px-2.5 py-0.5 rounded-full">
          <div 
            className="w-1.5 h-1.5 rounded-full" 
            style={{ backgroundColor: review.is_flagged ? '#e43636' : '#1fc16b' }} 
          />
          <p 
            className="text-sm"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 400,
              lineHeight: '20px',
              color: review.is_flagged ? '#e43636' : '#1fc16b'
            }}
          >
            {review.is_flagged ? 'Flagged' : 'Approved'}
          </p>
        </div>
        {review.is_flagged && (
          <button
            onClick={() => handleFlagIconClick(review)}
            className="cursor-pointer hover:opacity-70 transition-opacity"
            title="View flag details"
          >
            <HelpCircle size={16} className="text-[#797e84]" />
          </button>
        )}
      </div>
    );
  };

  const reviews = reviewsData?.payload?.items || [];
  const totalItems = reviewsData?.payload?.itemsTotal || 0;
  const totalPages = reviewsData?.payload?.pageTotal || 1;
  const currentPageNum = reviewsData?.payload?.curPage || 1;
  const hasNextPage = reviewsData?.payload?.nextPage !== null;
  const hasPrevPage = reviewsData?.payload?.prevPage !== null;

  // Handle scroll to show/hide gradient
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    setShowGradient(scrollLeft > 0);
  };

  // Filter reviews by search query and exclude deleted reviews
  const filteredReviews = reviews.filter(review => {
    // Exclude deleted reviews
    // if (review.is_deleted) return false;
    
    // Filter by search query (client-side filtering since API doesn't support search)
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    const customerName = `${review.customer_first_name} ${review.customer_last_name}`.toLowerCase();
    const provider = review.provider.toLowerCase();
    const service = (review.service || '').toLowerCase();
    const comment = review.comment.toLowerCase();
    
    return customerName.includes(searchLower) ||
           provider.includes(searchLower) ||
           service.includes(searchLower) ||
           comment.includes(searchLower);
  });

  // Generate pagination page numbers
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPageNum <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPageNum >= totalPages - 2) {
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
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
                Review Management
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

        {/* Flag Review Action Modal */}
        <AdminFlagReviewActionModal
          isOpen={isFlagModalOpen}
          onClose={handleCloseFlagModal}
          review={selectedReview}
          onApprove={handleApprove}
          onReject={handleReject}
          isLoading={flagUnflagMutation.isPending}
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
                    <div className="min-w-[160px] flex-1 px-2">
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
                        Service
                      </p>
                    </div>
                    <div className="min-w-[70px] flex-1 px-2">
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
                    <div className="min-w-[240px] flex-1 px-2">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Review
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
                        Date
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
                        Status
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
                      <div className="min-w-[160px] flex-1 px-2">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[160px] flex-1 px-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="flex gap-1.5 items-center min-w-[70px] flex-1 px-2">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[240px] flex-1 px-2">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[140px] flex-1 px-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="min-w-[120px] flex-1 px-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  // Error state
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-red-600">
                      Failed to load reviews. Please try again later.
                    </p>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  // Empty state
                  <div className="px-3 py-8 text-center">
                    <p className="text-sm text-[#797e84]">
                      No reviews found
                    </p>
                  </div>
                ) : (
                  // Success state
                  filteredReviews.map((review, index) => {
                    const customerName = `${review.customer_first_name} ${review.customer_last_name}`;
                    const initials = `${review.customer_first_name.charAt(0)}${review.customer_last_name.charAt(0)}`;
                    const date = formatDate(review.created_at);
                    const serviceName = review.service || 'N/A';
                    
                    return (
                      <div
                        key={review.id}
                        className={`flex items-center px-6 py-3 gap-8 border-b border-[#e5e7ea] ${
                          index === filteredReviews.length - 1 ? 'border-b-0' : ''
                        }`}
                        style={{ minWidth: '1200px' }}
                      >
                        <div className="flex gap-2 items-center min-w-[180px] flex-1 px-2">
                          {review.customer_profile_pic ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                              <Image
                                src={review.customer_profile_pic}
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
                        <div className="min-w-[160px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black truncate"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                            title={review.provider}
                          >
                            {review.provider}
                          </p>
                        </div>
                        <div className="min-w-[160px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black truncate"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                            title={serviceName}
                          >
                            {serviceName}
                          </p>
                        </div>
                        <div className="flex gap-1.5 items-center min-w-[70px] flex-1 px-2">
                          <Star size={13} className="fill-[#fab12f] text-[#fab12f]" />
                          <p 
                            className="text-sm text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            {review.rating}
                          </p>
                        </div>
                        <div className="min-w-[240px] flex-1 px-2">
                          <p 
                            className="text-sm font-medium text-black truncate"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '20px'
                            }}
                            title={review.comment}
                          >
                            {review.comment}
                          </p>
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
                            {date}
                          </p>
                        </div>
                        <div className="min-w-[120px] flex-1 px-2">
                          {getStatusBadge(review)}
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
                    {reviewsData?.payload?.itemsReceived || 0}
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

