'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminSettlePayout } from '@/hooks/admin/useAdminSettlePayout';
import { useSettlePayout } from '@/hooks/admin/useSettlePayout';
import { AdminSettlePayoutItem } from '@/types';

interface SettlePayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId?: string;
  providerName?: string;
  onConfirm?: (selectedItems: AdminSettlePayoutItem[]) => void;
}

export default function SettlePayoutModal({
  isOpen,
  onClose,
  businessId,
  providerName,
  onConfirm
}: SettlePayoutModalProps) {
  const { adminToken } = useAuth();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [allItems, setAllItems] = useState<AdminSettlePayoutItem[]>([]);
  const perPage = 4;

  // Fetch settle payout data
  const { data: settlePayoutData, isLoading, error } = useAdminSettlePayout(
    adminToken,
    businessId || null,
    currentPage,
    perPage
  );

  // Settle payout mutation
  const settlePayoutMutation = useSettlePayout(adminToken);

  // Accumulate items from all pages
  useEffect(() => {
    if (settlePayoutData?.payload?.items) {
      if (currentPage === 1) {
        // Reset on first page
        setAllItems(settlePayoutData.payload.items);
      } else {
        // Append new items for subsequent pages
        setAllItems(prev => [...prev, ...settlePayoutData.payload.items]);
      }
    }
  }, [settlePayoutData, currentPage]);

  // Reset when modal closes or businessId changes
  useEffect(() => {
    if (!isOpen || !businessId) {
      setAllItems([]);
      setSelectedItems(new Set());
      setCurrentPage(1);
    }
  }, [isOpen, businessId]);

  const hasMoreItems = settlePayoutData?.payload?.nextPage !== null;
  const displayItems = allItems;

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

  const handleToggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleLoadMore = () => {
    if (hasMoreItems) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (amount: number | null): string => {
    const value = amount ?? 0;
    return `RM ${value.toFixed(2)}`;
  };

  const calculateTotals = () => {
    let totalAmount = 0;
    let totalCommission = 0;

    displayItems.forEach(item => {
      if (selectedItems.has(item.id)) {
        totalAmount += item.amount ?? 0;
        totalCommission += item.commission ?? 0;
      }
    });

    return {
      totalAmount,
      totalCommission,
      netPayout: totalAmount - totalCommission
    };
  };

  const { totalAmount, totalCommission, netPayout } = calculateTotals();

  const handleConfirm = async () => {
    const selected = displayItems.filter(item => selectedItems.has(item.id));
    if (selected.length === 0) return;

    try {
      // Extract payment IDs from selected items
      const paymentIds = selected.map(item => item.id);
      
      // Call the settle payout API
      await settlePayoutMutation.mutateAsync({
        payment_id: paymentIds
      });

      // On success, call onConfirm callback if provided
      if (onConfirm) {
        onConfirm(selected);
      }

      // Close modal on success
      onClose();
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Failed to settle payout:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
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

      {/* Modal */}
      <div 
        className="relative bg-white rounded-[20px] w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl mx-4"
        style={{
          transform: isOpen ? 'scale(1)' : 'scale(0.95)',
          opacity: isOpen ? 1 : 0,
          transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 pt-5 px-5 shrink-0 w-full">
          <div className="flex flex-col gap-1">
            <h2 
              className="text-xl font-semibold text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 600,
                lineHeight: '28px'
              }}
            >
              Settle Payout
            </h2>
            <p 
              className="text-base text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px'
              }}
            >
              Select the services you want to settle for this provider.
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-white flex items-center justify-center p-2 rounded-md hover:bg-gray-50 transition-colors shrink-0"
          >
            <X size={20} className="text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Services Table */}
          <div className="border border-[#e5e7ea] rounded-lg overflow-hidden mb-5">
            {/* Table Header */}
            <div className="bg-[#f8f9f8] border-b border-[#e5e7ea] flex items-center">
              <div className="w-[50px] h-10 flex items-center justify-center">
                {/* Checkbox column header */}
              </div>
              <div className="flex-1 px-2 py-2.5">
                <p 
                  className="text-sm text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Service Name
                </p>
              </div>
              <div className="flex-1 px-2 py-2.5">
                <p 
                  className="text-sm text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Date
                </p>
              </div>
              <div className="flex-1 px-2 py-2.5 text-right">
                <p 
                  className="text-sm text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Amount
                </p>
              </div>
              <div className="flex-1 px-2 py-2.5 text-right">
                <p 
                  className="text-sm text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Commission
                </p>
              </div>
            </div>

            {/* Table Body */}
            <div className="flex flex-col">
              {isLoading && currentPage === 1 ? (
                <div className="px-2 py-4 text-center">
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
                <div className="px-2 py-4 text-center">
                  <p 
                    className="text-sm text-red-500"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    {error instanceof Error ? error.message : 'Failed to load data'}
                  </p>
                </div>
              ) : displayItems.length === 0 ? (
                <div className="px-2 py-4 text-center">
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    No items found
                  </p>
                </div>
              ) : (
                displayItems.map((item, index) => {
                  const isSelected = selectedItems.has(item.id);
                  const isLast = index === displayItems.length - 1;
                  
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center border-b ${isLast ? 'border-b-0' : 'border-[#e5e7ea]'}`}
                    >
                      <div className="w-[50px] h-[37px] flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleItem(item.id)}
                          className="w-4 h-4 rounded border-[#e5e7ea] bg-[#f8f9f8] text-[#6290f2] focus:ring-2 focus:ring-[#6290f2] cursor-pointer"
                          style={{
                            boxShadow: '0px 1px 2px 0px rgba(0,0,0,0.05)'
                          }}
                        />
                      </div>
                      <div className="flex-1 px-2 py-2">
                        <p 
                          className="text-sm font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '20px'
                          }}
                        >
                          {item.service_name}
                        </p>
                      </div>
                      <div className="flex-1 px-2 py-2">
                        <p 
                          className="text-sm font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '20px'
                          }}
                        >
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      <div className="flex-1 px-2 py-2 text-right">
                        <p 
                          className="text-sm font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '20px'
                          }}
                        >
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <div className="flex-1 px-2 py-2 text-right">
                        <p 
                          className="text-sm font-medium text-[#e43636]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '20px'
                          }}
                        >
                          -{formatCurrency(item.commission)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Load More Button */}
          {hasMoreItems && !isLoading && displayItems.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-4 py-2 bg-[#f8f9f8] rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p 
                  className="text-sm text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </p>
              </button>
            </div>
          )}

          {isLoading && currentPage > 1 && (
            <div className="flex justify-center mt-2">
              <p 
                className="text-sm text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Loading more items...
              </p>
            </div>
          )}

          {/* Error Message */}
          {settlePayoutMutation.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p 
                className="text-sm text-red-600"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                {settlePayoutMutation.error instanceof Error 
                  ? settlePayoutMutation.error.message 
                  : 'Failed to settle payout'}
              </p>
            </div>
          )}

          {/* Summary Section */}
          <div className="border-t border-[#e5e7ea] pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p 
                className="text-base text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                Total Selected Amount:
              </p>
              <p 
                className="text-base font-medium text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  lineHeight: '24px'
                }}
              >
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p 
                className="text-base text-[#e43636]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                Total Commission:
              </p>
              <p 
                className="text-base font-medium text-[#e43636]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  lineHeight: '24px'
                }}
              >
                -{formatCurrency(totalCommission)}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-[#e5e7ea] pt-2">
              <p 
                className="text-base text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              >
                Net Payout Amount:
              </p>
              <p 
                className="text-base font-medium text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  lineHeight: '24px'
                }}
              >
                {formatCurrency(netPayout)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 items-end justify-end p-5 shrink-0 w-full border-t border-[#e5e7ea]">
          <button
            onClick={onClose}
            className="bg-[#f8f9f8] h-12 px-4 py-2.5 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <p 
              className="text-base text-[#797e84]"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px'
              }}
            >
              Cancel
            </p>
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedItems.size === 0 || settlePayoutMutation.isPending}
            className={`h-12 px-4 py-3 rounded-lg flex items-center justify-center transition-colors ${
              selectedItems.size > 0 && !settlePayoutMutation.isPending
                ? 'bg-[#6290f2] hover:bg-[#5280e2]'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            <p 
              className={`text-base ${
                selectedItems.size > 0 && !settlePayoutMutation.isPending ? 'text-white' : 'text-gray-500'
              }`}
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px'
              }}
            >
              {settlePayoutMutation.isPending ? 'Processing...' : `Selected (${formatCurrency(netPayout)})`}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

