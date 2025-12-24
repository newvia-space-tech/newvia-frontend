'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import VerificationDetail from '@/components/admin/VerificationDetail';
import RejectVerificationModal from '@/components/admin/RejectVerificationModal';
import { useAuth } from '@/context/AuthContext';
import { useAdminProviderVerification } from '@/hooks/admin/useAdminProviderVerification';
import { useApproveRejectProvider } from '@/hooks/admin/useApproveRejectProvider';
import { AdminProviderVerification } from '@/types';
import { Bell, MapPin, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

// Helper function to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to format address
const formatAddress = (provider: AdminProviderVerification): string => {
  const parts = [
    provider.address_line_1,
    provider.address_line_2,
    provider.city_name,
    provider.state_name,
    provider.postal_code
  ].filter(Boolean);
  return parts.join(', ');
};

// Helper function to determine status from API response
const getStatus = (provider: AdminProviderVerification): 'pending' | 'approved' | 'rejected' => {
  if (provider.is_reviewed && !provider.rejected) {
    return 'approved';
  }
  if (provider.is_reviewed && provider.rejected) {
    return 'rejected';
  }
  return 'pending';
};


export default function VerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingBusinessId, setRejectingBusinessId] = useState<string | null>(null);
  const bellButtonRef = useRef<HTMLDivElement>(null);
  const { adminToken } = useAuth();
  const itemsPerPage = 4;

  // Get tab from URL or default to 'all'
  const getTabFromUrl = (): FilterTab => {
    const tabParam = searchParams.get('tab');
    if (tabParam && (['all', 'pending', 'approved', 'rejected'] as FilterTab[]).includes(tabParam as FilterTab)) {
      return tabParam as FilterTab;
    }
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<FilterTab>(getTabFromUrl);

  // Sync tab state with URL when URL changes (browser back/forward navigation)
  useEffect(() => {
    const tabFromUrl = getTabFromUrl();
    setActiveTab(tabFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: FilterTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Map UI filter tabs to API filter values
  const getApiFilter = (tab: FilterTab): string => {
    const filterMap: Record<FilterTab, string> = {
      all: 'all',
      pending: 'pending',
      approved: 'approved',
      rejected: 'rejected',
    };
    return filterMap[tab];
  };

  const { data: verificationData, isLoading, error, refetch } = useAdminProviderVerification(
    adminToken,
    getApiFilter(activeTab),
    currentPage,
    itemsPerPage
  );

  const approveRejectMutation = useApproveRejectProvider(adminToken);

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

  const handleCardClick = (verification: AdminProviderVerification) => {
    const status = getStatus(verification);
    if (status === 'pending') {
      setSelectedBusinessId(verification.id);
    }
  };

  const handleBack = () => {
    setSelectedBusinessId(null);
  };

  const handleApprove = async (businessId: string) => {
    if (!businessId) return;

    try {
      await approveRejectMutation.mutateAsync({
        business_id: businessId,
        action: 'approve'
      });
      await refetch();
      setSelectedBusinessId(null);
    } catch (error) {
      console.error('Error approving provider:', error);
    }
  };

  const handleRejectClick = (businessId: string) => {
    setRejectingBusinessId(businessId);
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!rejectingBusinessId) return;
    
    try {
      await approveRejectMutation.mutateAsync({
        business_id: rejectingBusinessId,
        rejection_reason: reason,
        action: 'reject'
      });
      await refetch();
      setIsRejectModalOpen(false);
      setRejectingBusinessId(null);
      if (selectedBusinessId === rejectingBusinessId) {
        setSelectedBusinessId(null);
      }
    } catch (error) {
      console.error('Error rejecting provider:', error);
    }
  };

  const handleReject = async (businessId: string) => {
    // This is called from VerificationDetail component
    handleRejectClick(businessId);
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    const statusConfig = {
      pending: { color: '#fab12f', bgColor: 'border-[#e5e7ea]', dotColor: '#fab12f' },
      approved: { color: '#1fc16b', bgColor: 'border-[#e5e7ea]', dotColor: '#1fc16b' },
      rejected: { color: '#e43636', bgColor: 'border-[#e5e7ea]', dotColor: '#e43636' }
    };

    const config = statusConfig[status];

    return (
      <div className={`border ${config.bgColor} border-solid flex gap-1.5 items-center justify-center px-2.5 py-0.5 rounded-full`}>
        <div className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: config.dotColor }} />
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

  const verifications = verificationData?.payload?.items || [];
  const totalItems = verificationData?.payload?.itemsTotal || 0;
  const totalPages = verificationData?.payload?.pageTotal || 1;
  const currentPageNum = verificationData?.payload?.curPage || 1;
  const hasNextPage = verificationData?.payload?.nextPage !== null;
  const hasPrevPage = verificationData?.payload?.prevPage !== null;

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
        {/* Reject Verification Modal - Always rendered so it works from detail view */}
        <RejectVerificationModal
          isOpen={isRejectModalOpen}
          onClose={() => {
            setIsRejectModalOpen(false);
            setRejectingBusinessId(null);
          }}
          onSubmit={handleRejectSubmit}
          businessId={rejectingBusinessId || undefined}
        />

        {/* Show detail view if a verification is selected */}
        {selectedBusinessId ? (
          <VerificationDetail
            businessId={selectedBusinessId}
            onBack={handleBack}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        ) : (
          <>
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
                    Provider Verification
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
          {/* Filter Tabs */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="border-b border-[#e5e7ea] flex items-center gap-0">
              {(['all', 'pending', 'approved', 'rejected'] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`h-11 min-w-[80px] px-4 py-3 rounded-t-lg transition-colors relative cursor-pointer ${
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
          </div>

          {/* Verification Cards */}
          <div className="flex flex-col gap-4">
              {isLoading ? (
                // Loading state
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-5"
                  >
                    <div className="flex gap-8 items-center">
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="flex gap-6">
                          <div className="flex flex-col gap-1.5 w-[188px]">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="flex flex-col gap-1.5 w-[188px]">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="flex flex-col gap-1.5 w-[188px]">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                          </div>
                          <div className="flex flex-col gap-1.5 w-[188px]">
                            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                            <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                      <div className="w-px h-[100px] bg-[#e5e7ea]" />
                      <div className="flex flex-col gap-3">
                        <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))
              ) : error ? (
                // Error state
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    Failed to load provider verifications. Please try again later.
                  </p>
                </div>
              ) : verifications.length === 0 ? (
                // Empty state
                <div className="text-center py-8">
                  <p className="text-sm text-[#797e84]">
                    No provider verifications found
                  </p>
                </div>
              ) : (
                // Success state
                verifications.map((provider) => {
                  const status = getStatus(provider);
                  const address = formatAddress(provider);
                  const submittedOn = formatDate(provider.created_at);
                  
                  return (
                    <div
                      key={provider.id}
                      className={`bg-white rounded-lg p-5 ${
                        status === 'pending' ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                      }`}
                      onClick={() => handleCardClick(provider)}
                    >
                      {status === 'pending' ? (
                        // Full card with details and actions for pending
                        <div className="flex gap-8 items-center">
                          <div className="flex-1 flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <h3 
                                className="text-lg font-medium text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 500,
                                  lineHeight: '28px'
                                }}
                              >
                                {provider.business_name}
                              </h3>
                              <div className="flex gap-1 items-center">
                                <MapPin size={16} className="text-[#797e84]" />
                                <p 
                                  className="text-sm text-[#797e84]"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '20px'
                                  }}
                                >
                                  {address}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-6">
                              <div className="flex flex-col gap-1.5 w-[188px]">
                                <p 
                                  className="text-sm text-[#797e84]"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '20px'
                                  }}
                                >
                                  Email
                                </p>
                                <p 
                                  className="text-base text-black"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '24px'
                                  }}
                                >
                                  {provider.owner_email_id}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1.5 w-[188px]">
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
                                <p 
                                  className="text-base text-black"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '24px'
                                  }}
                                >
                                  {provider.phone_number}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1.5 w-[188px]">
                                <p 
                                  className="text-sm text-[#797e84]"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '20px'
                                  }}
                                >
                                  Submitted On
                                </p>
                                <p 
                                  className="text-base text-black"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '24px'
                                  }}
                                >
                                  {submittedOn}
                                </p>
                              </div>
                              <div className="flex flex-col gap-1.5 w-[188px]">
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
                                {getStatusBadge(status)}
                              </div>
                            </div>
                          </div>
                          <div className="w-px h-[100px] bg-[#e5e7ea]" />
                          <div className="flex flex-col gap-3">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApprove(provider.id);
                              }}
                              className="border border-[#e5e7ea] flex gap-2 items-center justify-center px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <Check size={18} className="text-black" />
                              <span 
                                className="text-base text-black"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                Approve
                              </span>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRejectClick(provider.id);
                              }}
                              className="border border-[#fcebeb] flex gap-2 items-center justify-center px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <X size={18} className="text-[#e43636]" />
                              <span 
                                className="text-base text-[#e43636]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                Reject
                              </span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Compact card for approved/rejected
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-3 items-center">
                            <h3 
                              className="text-lg font-medium text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 500,
                                lineHeight: '28px'
                              }}
                            >
                              {provider.business_name}
                            </h3>
                            {getStatusBadge(status)}
                          </div>
                          <div className="flex gap-1 items-center">
                            <MapPin size={16} className="text-[#797e84]" />
                            <p 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              {address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
          </div>

          {/* Pagination */}
          {!isLoading && !error && (
            <div className="bg-white rounded-xl p-4 mt-4">
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
                    {verificationData?.payload?.itemsReceived || 0}
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
            </div>
          )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
