'use client';

import React, { useState } from 'react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import { useAuth } from '@/context/AuthContext';
import { useReviewManagement } from '@/hooks/business/useReviewManagement';
import { useFlagReview } from '@/hooks/business/useFlagReview';
import { Star, Flag, TrendingUp } from 'lucide-react';
import FlagReviewModal from '@/components/provider/FlagReviewModal';

type ReviewTab = 'all' | 'flagged';

const getBarColor = (stars: number): string => {
  if (stars >= 5) return 'bg-[#1fc16b]';
  if (stars >= 4) return 'bg-[#1fc16b]';
  if (stars >= 3) return 'bg-[#fab12f]';
  if (stars >= 2) return 'bg-[#fab12f]';
  return 'bg-[#e43636]';
};

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState<ReviewTab>('all');
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);

  const { user, authToken } = useAuth();

  // Fetch reviews based on active tab
  const isFlagged = activeTab === 'flagged';
  const { data: reviewsData, isLoading, error, refetch } = useReviewManagement(
    user?.businessId || null,
    user?.id || null,
    isFlagged,
    authToken
  );

  // Flag review mutation
  const flagReviewMutation = useFlagReview(authToken);

  // Fetch counts for all and flagged tabs
  const { data: allReviewsData } = useReviewManagement(user?.businessId || null, user?.id || null, false, authToken);
  const { data: flaggedReviewsData } = useReviewManagement(user?.businessId || null, user?.id || null, true, authToken);

  const reviews = reviewsData?.payload?.review_dashboard || [];
  const analytics = reviewsData?.payload?.review_analytics?.[0];

  const allReviewsCount = allReviewsData?.payload?.review_dashboard?.length || 0;
  const flaggedCount = flaggedReviewsData?.payload?.review_dashboard?.length || 0;

  // Calculate rating distribution
  const ratingDistribution = analytics ? [
    { stars: 5, count: analytics.cnt_5, percentage: analytics.total_reviews > 0 ? (analytics.cnt_5 / analytics.total_reviews) * 100 : 0 },
    { stars: 4, count: analytics.cnt_4, percentage: analytics.total_reviews > 0 ? (analytics.cnt_4 / analytics.total_reviews) * 100 : 0 },
    { stars: 3, count: analytics.cnt_3, percentage: analytics.total_reviews > 0 ? (analytics.cnt_3 / analytics.total_reviews) * 100 : 0 },
    { stars: 2, count: analytics.cnt_2, percentage: analytics.total_reviews > 0 ? (analytics.cnt_2 / analytics.total_reviews) * 100 : 0 },
    { stars: 1, count: analytics.cnt_1, percentage: analytics.total_reviews > 0 ? (analytics.cnt_1 / analytics.total_reviews) * 100 : 0 },
  ] : [];

  // Format date from timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const handleFlag = (reviewId: string, isFlagged: boolean) => {
    if (isFlagged) {
      // Review is already flagged
      console.log('Review already flagged:', reviewId);
    } else {
      // Review is not flagged, open flag modal
      setSelectedReviewId(reviewId);
      setFlagModalOpen(true);
    }
  };

  const handleFlagSubmit = async (reason: string) => {
    if (!selectedReviewId || !user?.businessId || !user?.id) return;

    try {
      await flagReviewMutation.mutateAsync({
        review_id: selectedReviewId,
        flag_reason: reason,
        user_id: user.id,
        business_id: user.businessId
      });
      
      refetch(); // Refresh the reviews list
    } catch (error) {
      console.error('Error flagging review:', error);
      alert('Failed to flag review. Please try again.');
    }
  };

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <ProviderSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            <h1 
              className="text-lg sm:text-xl font-bold text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 700,
                lineHeight: '28px'
              }}
            >
              Reviews Management
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-9 py-4">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Tab Navigation */}
              <div className="flex items-center gap-0 border-b border-[#e5e7ea]">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-3 transition-colors relative min-h-[36px] cursor-pointer ${
                    activeTab === 'all'
                      ? 'text-black'
                      : 'text-[#797e84] hover:text-black'
                  }`}
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: activeTab === 'all' ? 500 : 400,
                    lineHeight: '20px',
                    fontSize: '14px'
                  }}
                >
                  All Reviews ({allReviewsCount})
                  {activeTab === 'all' && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('flagged')}
                  className={`px-4 py-3 transition-colors relative min-h-[36px] cursor-pointer ${
                    activeTab === 'flagged'
                      ? 'text-[#e43636]'
                      : 'text-[#797e84] hover:text-black'
                  }`}
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: activeTab === 'flagged' ? 500 : 400,
                    lineHeight: '20px',
                    fontSize: '14px'
                  }}
                >
                  Flagged ({flaggedCount})
                  {activeTab === 'flagged' && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#e43636]" />
                  )}
                </button>
              </div>

              {/* Reviews List */}
              {isLoading ? (
                <div className="flex flex-col gap-5">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg p-5">
                      <div className="flex gap-8 items-end">
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="flex gap-3 items-center">
                            <div className="w-9 h-9 bg-gray-200 animate-pulse rounded-full" />
                            <div className="flex flex-col gap-2 flex-1">
                              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                              <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
                            </div>
                          </div>
                          <div className="h-16 w-full bg-gray-200 animate-pulse rounded" />
                        </div>
                        <div className="w-px h-[96px] bg-gray-200" />
                        <div className="flex flex-col gap-4">
                          <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                          <div className="h-10 w-24 bg-gray-200 animate-pulse rounded" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p 
                    className="text-base text-red-500"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    {error.message || 'Failed to load reviews'}
                  </p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p 
                    className="text-base text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    No {activeTab} reviews found.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {reviews.map((review) => {
                    const customerName = `${review.user_first_name} ${review.user_last_name}`;
                    return (
                      <div key={review.id} className={`rounded-lg p-5 ${review.is_flagged ? 'bg-[#fcebeb]' : 'bg-white'}`}>
                        <div className="flex gap-8 items-end">
                          {/* Left Section - Review Content */}
                          <div className={`flex-1 flex flex-col ${review.is_flagged ? 'gap-5' : 'gap-3'}`}>
                            {/* Customer Info */}
                            <div className="flex gap-3 items-center">
                              {review.user_profile_photo ? (
                                <img
                                  src={review.user_profile_photo}
                                  alt={customerName}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span 
                                    className="text-sm text-black"
                                    style={{ 
                                      fontFamily: 'Lato, sans-serif',
                                      fontWeight: 500
                                    }}
                                  >
                                    {review.user_first_name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <h3 
                                  className="text-base font-medium text-black"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 500,
                                    lineHeight: '24px'
                                  }}
                                >
                                  {customerName}
                                </h3>
                                <div className="flex gap-3 items-center">
                                  {review.service_name && (
                                    <>
                                      <p 
                                        className="text-sm text-[#797e84]"
                                        style={{ 
                                          fontFamily: 'Lato, sans-serif',
                                          fontWeight: 400,
                                          lineHeight: '20px'
                                        }}
                                      >
                                        {review.service_name}
                                      </p>
                                      <div className="w-1.5 h-1.5 rounded-full bg-[#797e84]" />
                                    </>
                                  )}
                                  <p 
                                    className="text-sm text-[#797e84]"
                                    style={{ 
                                      fontFamily: 'Lato, sans-serif',
                                      fontWeight: 400,
                                      lineHeight: '20px'
                                    }}
                                  >
                                    {formatDate(review.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Review Comment */}
                            <p 
                              className="text-sm text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              {review.comment}
                            </p>
                          </div>

                          {/* Divider */}
                          <div className="w-px h-[96px] bg-gray-200" />

                          {/* Right Section - Rating and Actions */}
                          <div className="flex flex-col items-end justify-between h-full">
                            {/* Star Rating */}
                            <div className="flex gap-1 items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>

                            {/* Flag Button */}
                            <button
                              onClick={() => handleFlag(review.id, review.is_flagged)}
                              className={`flex gap-2 items-center px-4 py-1.5 rounded-lg transition-colors mt-6 cursor-pointer ${
                                review.is_flagged
                                  ? 'bg-[#e43636] hover:bg-[#d32f2f]'
                                  : 'border border-[#fcebeb] hover:bg-red-50'
                              }`}
                            >
                              <Flag 
                                size={18} 
                                className={review.is_flagged ? 'text-white' : 'text-[#e43636]'}
                              />
                              <span 
                                className={`text-base ${
                                  review.is_flagged ? 'text-white' : 'text-[#e43636]'
                                }`}
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                {review.is_flagged ? 'Flagged' : 'Flag'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Analytics Sidebar */}
            <div className="bg-white rounded-lg p-5 w-[360px] flex-shrink-0">
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-1.5 items-center">
                    <TrendingUp size={20} className="text-black" />
                    <h2 
                      className="text-base font-semibold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      Review Analytics
                    </h2>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                      <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                      <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              ) : analytics ? (
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex gap-1.5 items-center">
                    <TrendingUp size={20} className="text-black" />
                    <h2 
                      className="text-base font-semibold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      Review Analytics
                    </h2>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6">
                    <div className="flex flex-col gap-1 flex-1">
                      <p 
                        className="text-lg font-bold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 700,
                          lineHeight: '24px'
                        }}
                      >
                        {analytics.total_reviews}
                      </p>
                      <p 
                        className="text-base text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        Total Reviews
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <p 
                        className="text-lg font-bold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 700,
                          lineHeight: '24px'
                        }}
                      >
                        {analytics.avg_rating}
                      </p>
                      <p 
                        className="text-base text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        Average Rating
                      </p>
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="bg-[#f8f9f8] rounded-lg p-4 flex flex-col gap-3">
                    <p 
                      className="text-sm text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Rating Distribution
                    </p>
                    <div className="flex flex-col gap-2">
                      {ratingDistribution.map((item) => (
                        <div key={item.stars} className="flex gap-3 items-center">
                          <div className="flex gap-1.5 items-center w-8">
                            <p 
                              className="text-base font-semibold text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 600,
                                lineHeight: '24px'
                              }}
                            >
                              {item.stars}
                            </p>
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          </div>
                          <div className="flex-1 bg-[#e5e7ea] rounded-full h-1.5 relative">
                            <div 
                              className={`h-1.5 rounded-full ${getBarColor(item.stars)}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <p 
                            className="text-sm text-[#797e84] w-8 text-right"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            {item.count}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-1.5 items-center">
                    <TrendingUp size={20} className="text-black" />
                    <h2 
                      className="text-base font-semibold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      Review Analytics
                    </h2>
                  </div>
                  <p 
                    className="text-base text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    No analytics data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flag Review Modal */}
        <FlagReviewModal
          isOpen={flagModalOpen}
          onClose={() => {
            setFlagModalOpen(false);
            setSelectedReviewId(null);
          }}
          onSubmit={handleFlagSubmit}
          reviewId={selectedReviewId || undefined}
        />
      </div>
    </div>
  );
}

