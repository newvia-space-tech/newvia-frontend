'use client';

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PricingPlanEditDrawer from '@/components/admin/PricingPlanEditDrawer';
import { Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminSubscriptionPlans } from '@/hooks/admin/useAdminSubscriptionPlans';
import { useUpdateSubscriptionPlan } from '@/hooks/admin/useUpdateSubscriptionPlan';
import { SubscriptionPlan, NumericData, UpdateSubscriptionPlanRequest } from '@/types';

export default function PricingPlanPage() {
  const { adminToken } = useAuth();
  const { data: plansData, isLoading, error } = useAdminSubscriptionPlans(adminToken);
  const updatePlanMutation = useUpdateSubscriptionPlan(adminToken);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedNumericData, setSelectedNumericData] = useState<NumericData | undefined>(undefined);

  const handleEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    // Find matching numeric_data for this plan
    const numericData = plansData?.payload?.numeric_data?.find(
      (data) => data.business_subscription_plan_id === plan.id && !data.is_deleted
    );
    setSelectedNumericData(numericData);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedPlan(null);
    setSelectedNumericData(undefined);
  };

  interface PricingPlanFormData {
    monthly_price: number;
    currency: string;
    subtitle: string;
    tag_line: string;
    commission_new_customer: number;
    commission_repeat_customer: number;
    payment_processing_fee: number;
    new_cust_comm_is_active: boolean;
    repeat_cust_comm_is_active: boolean;
    featuresActiveStatus?: { [key: number]: boolean };
    featureTaglines?: { [key: number]: string };
  }

  const handleSave = async (formData: PricingPlanFormData) => {
    if (!selectedPlan) return;

    // Map form data to API request structure
    const features = selectedPlan.features_json?.features || [];
    
    // Update feature_2 and feature_3 with dynamic values, and update other features with edited taglines
    const updatedFeatures = features.map((feature, index) => {
      const featureKeys = Object.keys(feature).filter(key => key !== 'is_active');
      const originalFeatureKey = featureKeys[0];
      
      // Get is_active from formData.featuresActiveStatus if available, otherwise use feature's is_active
      const isActive = formData.featuresActiveStatus?.[index] !== undefined 
        ? formData.featuresActiveStatus[index] 
        : (feature.is_active ?? true);
      
      // Create a new feature object with is_active explicitly set
      const updatedFeature: { [key: string]: string | boolean; is_active: boolean } = {
        ...feature,
        is_active: isActive,
      };

      // Update feature_2 with dynamic commission value (preserve decimals)
      if (originalFeatureKey === 'feature_2') {
        const commissionValue = formData.commission_new_customer % 1 === 0 
          ? formData.commission_new_customer 
          : parseFloat(formData.commission_new_customer.toFixed(1));
        updatedFeature.feature_2 = `${commissionValue}% commission on every new customer's first booking`;
      }
      // Update feature_3 with dynamic commission and processing fee values (preserve decimals)
      else if (originalFeatureKey === 'feature_3') {
        const repeatCommValue = formData.commission_repeat_customer % 1 === 0 
          ? formData.commission_repeat_customer 
          : parseFloat(formData.commission_repeat_customer.toFixed(1));
        const procFeeValue = formData.payment_processing_fee % 1 === 0 
          ? formData.payment_processing_fee 
          : parseFloat(formData.payment_processing_fee.toFixed(1));
        updatedFeature.feature_3 = `${repeatCommValue}% commission on repeat customers (only ${procFeeValue}% payment processing applies)`;
      }
      // Update other features (feature_1, feature_4, etc.) with edited taglines
      else if (formData.featureTaglines?.[index] !== undefined) {
        updatedFeature[originalFeatureKey] = formData.featureTaglines[index];
      }

      return updatedFeature;
    });

    const payload: UpdateSubscriptionPlanRequest = {
      plan_id: selectedPlan.id,
      currency: formData.currency || 'myr',
      subtitle: formData.subtitle || '',
      tagline: formData.tag_line || '',
      price: formData.monthly_price || 0,
      features: {
        features: updatedFeatures,
      },
      new_customer_commission: formData.commission_new_customer || 0,
      repeat_customer_commission: formData.commission_repeat_customer || 0,
      pay_proc_commission: formData.payment_processing_fee || 0,
      new_cust_comm_is_active: formData.new_cust_comm_is_active ?? false,
      repeat_cust_comm_is_active: formData.repeat_cust_comm_is_active ?? false,
      title: selectedPlan.title,
      is_active: selectedPlan.is_active,
    };

    try {
      await updatePlanMutation.mutateAsync(payload);
      handleCloseDrawer();
    } catch (error) {
      console.error('Failed to update subscription plan:', error);
      // TODO: Show error toast/notification
    }
  };

  // Helper function to extract features from features_json and map numeric_data
  const getFeatures = (plan: SubscriptionPlan, numericData?: NumericData): string[] => {
    if (!plan.features_json?.features) return [];
    
    return plan.features_json.features
      .filter(feature => feature.is_active)
      .map((feature, index) => {
        // Extract the feature text from keys like "feature_1", "feature_2", etc.
        const featureKeys = Object.keys(feature).filter(key => key !== 'is_active');
        let featureText = featureKeys.length > 0 ? String(feature[featureKeys[0]]) : '';
        
        // Map numeric_data to feature_2 and feature_3 (index 1 and 2 in the filtered array)
        // Check if this is feature_2 or feature_3 by checking the original feature key
        const originalFeatureKey = featureKeys[0];
        
        if (numericData && originalFeatureKey === 'feature_2') {
          // Feature 2: commission on new customer's first booking
          // Always use numeric_data value when available, preserve decimals
          const commissionValue = numericData.commission_new_customer;
          // Format to preserve decimals - show decimal if not a whole number
          const formattedValue = commissionValue % 1 === 0 
            ? commissionValue.toString() 
            : commissionValue.toFixed(1);
          featureText = `${formattedValue}% commission on every new customer's first booking`;
        } else if (numericData && originalFeatureKey === 'feature_3') {
          // Feature 3: commission on repeat customers
          // Always use numeric_data value when available, preserve decimals
          const repeatCommValue = numericData.commission_repeat_customer;
          const procFeeValue = numericData.payment_processing_fee;
          // Format to preserve decimals - show decimal if not a whole number
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
                Pricing Plans management
              </h1>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
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
                Loading pricing plans...
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
                {error instanceof Error ? error.message : 'Failed to load pricing plans'}
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
                No pricing plans found
              </p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-5">
              {plansData.payload.plan_data.map((plan) => {
                // Find matching numeric_data for this plan
                const numericData = plansData.payload.numeric_data?.find(
                  (data) => data.business_subscription_plan_id === plan.id && !data.is_deleted
                );
                
                const features = getFeatures(plan, numericData);
                const isFreePlan = plan.type === 'free';
                
                return (
                  <div key={plan.id} className="bg-white rounded-lg p-5 flex flex-col justify-between flex-1">
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
                      <button
                        onClick={() => handleEdit(plan)}
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
                          Edit
                        </p>
                      </button>
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

      {/* Pricing Plan Edit Drawer */}
      <PricingPlanEditDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        plan={selectedPlan}
        numericData={selectedNumericData}
        onSave={handleSave}
      />
    </div>
  );
}

