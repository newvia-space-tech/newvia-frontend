'use client';

import React from 'react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSubscriptionPlans } from '@/hooks/business/useSubscriptionPlans';
import { SubscriptionPlan, NumericData } from '@/types';

export default function SubscriptionPage() {
  const { authToken } = useAuth();
  const { data: plansData, isLoading, error } = useSubscriptionPlans(authToken);

  // Helper function to extract features from features_json and map numeric_data
  const getFeatures = (plan: SubscriptionPlan, numericData?: NumericData): string[] => {
    if (!plan.features_json?.features) return [];
    
    return plan.features_json.features
      .filter(feature => feature.is_active)
      .map((feature) => {
        // Extract the feature text from keys like "feature_1", "feature_2", etc.
        const featureKeys = Object.keys(feature).filter(key => key !== 'is_active');
        let featureText = featureKeys.length > 0 ? String(feature[featureKeys[0]]) : '';
        
        // Map numeric_data to feature_2 and feature_3
        const originalFeatureKey = featureKeys[0];
        
        if (numericData && originalFeatureKey === 'feature_2') {
          // Feature 2: commission on new customer's first booking
          const commissionValue = numericData.commission_new_customer;
          const formattedValue = commissionValue % 1 === 0 
            ? commissionValue.toString() 
            : commissionValue.toFixed(1);
          featureText = `${formattedValue}% commission on every new customer's first booking`;
        } else if (numericData && originalFeatureKey === 'feature_3') {
          // Feature 3: commission on repeat customers
          const repeatCommValue = numericData.commission_repeat_customer;
          const procFeeValue = numericData.payment_processing_fee;
          const formattedRepeatComm = repeatCommValue % 1 === 0 
            ? repeatCommValue.toString() 
            : repeatCommValue.toFixed(1);
          const formattedProcFee = procFeeValue % 1 === 0 
            ? procFeeValue.toString() 
            : procFeeValue.toFixed(1);
          featureText = `${formattedRepeatComm}% commission on repeat customers (only ${formattedProcFee}% payment processing applies)`;
        }
        
        return featureText;
      })
      .filter(feature => feature.trim() !== '');
  };

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return `RM${price}/month`;
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
              Subscription Management
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-9 py-4 sm:py-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p 
                className="text-sm text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Loading subscription plans...
              </p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <p 
                className="text-sm text-red-500"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                {error instanceof Error ? error.message : 'Failed to load subscription plans'}
              </p>
            </div>
          ) : !plansData?.payload?.plan_data || plansData.payload.plan_data.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p 
                className="text-sm text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                No subscription plans found
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-5">
              {plansData.payload.plan_data.map((plan) => {
                // Find matching numeric_data for this plan
                const numericData = plansData.payload.numeric_data?.find(
                  (data) => data.business_subscription_plan_id === plan.id && !data.is_deleted
                );
                
                const features = getFeatures(plan, numericData);
                const isFreePlan = plan.type === 'free';
                
                return (
                  <div key={plan.id} className="bg-white rounded-lg p-4 sm:p-5 flex flex-col justify-between flex-1">
                    <div className={`flex flex-col ${isFreePlan ? 'gap-6' : 'gap-8'}`}>
                      {/* Plan Header */}
                      <div className="flex flex-col gap-0.5">
                        <h2 
                          className="text-xl font-bold text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 700,
                            lineHeight: '28px'
                          }}
                        >
                          {plan.title} – {formatPrice(plan.monthly_price)}
                        </h2>
                        <p 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          {plan.subtitle}
                        </p>
                      </div>

                      {/* What's Included Section */}
                      {features.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <p 
                            className="text-sm font-semibold text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 600,
                              lineHeight: '20px'
                            }}
                          >
                            What&apos;s Included
                          </p>
                          <div className="flex flex-col gap-3">
                            {features.map((feature, index) => (
                              <div 
                                key={index} 
                                className={`flex gap-2 ${isFreePlan ? 'items-center' : 'items-start'}`}
                              >
                                <Check 
                                  size={20} 
                                  className={`text-[#1fc16b] shrink-0 ${!isFreePlan ? 'mt-0.5' : ''}`} 
                                />
                                <p 
                                  className="text-sm text-[#797e84]"
                                  style={{ 
                                    fontFamily: 'Lato, sans-serif',
                                    fontWeight: 400,
                                    lineHeight: '20px'
                                  }}
                                >
                                  {feature}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Section */}
                    <div className="flex flex-col gap-2 mt-8">
                      {isFreePlan ? (
                        <div className="bg-[#e9f9f0] rounded-lg px-4 py-2">
                          <p 
                            className="text-sm text-[#1fc16b] text-center"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            Active Now
                          </p>
                        </div>
                      ) : (
                        <button
                          className="border border-[#6290f2] rounded-lg px-4 py-2 flex items-center justify-center hover:bg-[#6290f2]/5 transition-colors cursor-pointer"
                        >
                          <p 
                            className="text-sm text-[#6290f2]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            Join Waitlist
                          </p>
                        </button>
                      )}
                      {plan.tag_line && (
                        <p 
                          className="text-sm text-[#797e84] text-center"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          {plan.tag_line}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
