'use client';

import React, { useEffect, useState } from 'react';
import { X, Settings } from 'lucide-react';
import { SubscriptionPlan, NumericData } from '@/types';

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

interface PricingPlanEditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  numericData?: NumericData;
  onSave?: (data: PricingPlanFormData) => void;
}

export default function PricingPlanEditDrawer({
  isOpen,
  onClose,
  plan,
  numericData,
  onSave
}: PricingPlanEditDrawerProps) {
  
  // Form state
  const [formData, setFormData] = useState({
    monthly_price: plan?.monthly_price || 0,
    currency: plan?.currency || 'myr',
    subtitle: plan?.subtitle || '',
    tag_line: plan?.tag_line || '',
    commission_new_customer: numericData?.commission_new_customer || 0,
    commission_repeat_customer: numericData?.commission_repeat_customer || 0,
    payment_processing_fee: numericData?.payment_processing_fee || 0,
    new_cust_comm_is_active: numericData?.new_cust_comm_is_active ?? false,
    repeat_cust_comm_is_active: numericData?.repeat_cust_comm_is_active ?? false,
  });

  // State for dynamic feature texts
  const [feature2Text, setFeature2Text] = useState('');
  const [feature3Text, setFeature3Text] = useState('');

  // State for feature is_active status
  const [featuresActiveStatus, setFeaturesActiveStatus] = useState<{ [key: number]: boolean }>({});
  
  // State for feature tagline texts (for features 1 and 4 that can be edited)
  const [featureTaglines, setFeatureTaglines] = useState<{ [key: number]: string }>({});

  // Update feature 2 text when commission_new_customer changes (preserve decimals)
  useEffect(() => {
    if (numericData && formData.commission_new_customer !== undefined) {
      const commissionValue = formData.commission_new_customer % 1 === 0 
        ? formData.commission_new_customer 
        : parseFloat(formData.commission_new_customer.toFixed(1));
      setFeature2Text(`${commissionValue}% commission on every new customer's first booking`);
    }
  }, [formData.commission_new_customer, numericData]);

  // Update feature 3 text when commission values change (but NOT tag_line, preserve decimals)
  useEffect(() => {
    if (numericData && formData.commission_repeat_customer !== undefined && formData.payment_processing_fee !== undefined) {
      const repeatCommValue = formData.commission_repeat_customer % 1 === 0 
        ? formData.commission_repeat_customer 
        : parseFloat(formData.commission_repeat_customer.toFixed(1));
      const procFeeValue = formData.payment_processing_fee % 1 === 0 
        ? formData.payment_processing_fee 
        : parseFloat(formData.payment_processing_fee.toFixed(1));
      const newFeature3Text = `${repeatCommValue}% commission on repeat customers (only ${procFeeValue}% payment processing applies)`;
      setFeature3Text(newFeature3Text);
      // Do NOT update tag_line - it should remain independent
    }
  }, [formData.commission_repeat_customer, formData.payment_processing_fee, numericData]);

  // Reset form when plan or numericData changes
  useEffect(() => {
    if (plan) {
      const newCustomerComm = numericData?.commission_new_customer || 0;
      const repeatCustomerComm = numericData?.commission_repeat_customer || 0;
      const processingFee = numericData?.payment_processing_fee || 0;
      
      setFormData({
        monthly_price: plan.monthly_price || 0,
        currency: plan.currency || 'myr',
        subtitle: plan.subtitle || '',
        tag_line: plan.tag_line || '',
        commission_new_customer: newCustomerComm,
        commission_repeat_customer: repeatCustomerComm,
        payment_processing_fee: processingFee,
        new_cust_comm_is_active: numericData?.new_cust_comm_is_active ?? false,
        repeat_cust_comm_is_active: numericData?.repeat_cust_comm_is_active ?? false,
      });

      // Initialize feature texts (preserve decimals)
      if (numericData) {
        const newCustomerCommValue = newCustomerComm % 1 === 0 
          ? newCustomerComm 
          : parseFloat(newCustomerComm.toFixed(1));
        const repeatCustomerCommValue = repeatCustomerComm % 1 === 0 
          ? repeatCustomerComm 
          : parseFloat(repeatCustomerComm.toFixed(1));
        const processingFeeValue = processingFee % 1 === 0 
          ? processingFee 
          : parseFloat(processingFee.toFixed(1));
        
        setFeature2Text(`${newCustomerCommValue}% commission on every new customer's first booking`);
        const newFeature3Text = `${repeatCustomerCommValue}% commission on repeat customers (only ${processingFeeValue}% payment processing applies)`;
        setFeature3Text(newFeature3Text);
        // Do NOT update tag_line - it should remain independent
      }

      // Initialize features active status and taglines
      const features = plan.features_json?.features || [];
      const initialStatus: { [key: number]: boolean } = {};
      const initialTaglines: { [key: number]: string } = {};
      features.forEach((feature, index) => {
        const featureKeys = Object.keys(feature).filter(key => key !== 'is_active');
        const originalFeatureKey = featureKeys[0];
        const featureText = featureKeys.length > 0 ? String(feature[featureKeys[0]]) : '';
        
        // For feature_2, use new_cust_comm_is_active if available
        if (originalFeatureKey === 'feature_2' && numericData) {
          initialStatus[index] = numericData.new_cust_comm_is_active ?? (feature.is_active ?? true);
        }
        // For feature_3, use repeat_cust_comm_is_active if available
        else if (originalFeatureKey === 'feature_3' && numericData) {
          initialStatus[index] = numericData.repeat_cust_comm_is_active ?? (feature.is_active ?? true);
        }
        // For other features, use feature's is_active
        else {
          initialStatus[index] = feature.is_active ?? true;
        }
        
        // Initialize taglines for features 1 and 4 (non-commission features)
        if (originalFeatureKey !== 'feature_2' && originalFeatureKey !== 'feature_3') {
          initialTaglines[index] = featureText;
        }
      });
      setFeaturesActiveStatus(initialStatus);
      setFeatureTaglines(initialTaglines);
    }
  }, [plan, numericData]);
  
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

  if (!plan) return null;

  // Extract features from plan
  const features = plan.features_json?.features || [];

  return (
    <div 
      className="fixed inset-0 z-50"
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

      {/* Drawer */}
      <div 
        className="absolute bg-white h-[85vh] sm:h-full right-0 top-[60px] sm:top-0 w-full sm:w-[600px] flex flex-col overflow-hidden rounded-t-xl sm:rounded-none shadow-2xl"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 pt-5 px-5 shrink-0 w-full">
          <h2 
            className="text-xl font-semibold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
              lineHeight: '28px'
            }}
          >
            Edit {plan.title}
          </h2>
          <button
            onClick={onClose}
            className="bg-white flex items-center justify-center p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <X size={20} className="text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Plan Details Section */}
          <div className="flex flex-col gap-5 p-5">
            {/* Price and Currency */}
            <div className="flex gap-4 items-center">
              {/* Price Input */}
              <div className="flex flex-col gap-2 flex-1">
                <label 
                  className="text-sm text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Price
                </label>
                <input
                  type="number"
                  value={formData.monthly_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_price: Number(e.target.value) }))}
                  disabled
                  readOnly
                  className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-black outline-none bg-gray-50 cursor-not-allowed"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                />
              </div>

              {/* Currency Input */}
              <div className="flex flex-col gap-2 flex-1">
                <label 
                  className="text-sm text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Currency
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  disabled
                  readOnly
                  className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-black outline-none bg-gray-50 cursor-not-allowed"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '24px'
                  }}
                />
              </div>
            </div>

            {/* Subtitle Input */}
            <div className="flex flex-col gap-2">
              <label 
                className="text-sm text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Subtitle *
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-black outline-none focus:border-[#6290f2] transition-colors"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              />
            </div>

            {/* Tagline Input */}
            <div className="flex flex-col gap-2">
              <label 
                className="text-sm text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Tagline *
              </label>
              <input
                type="text"
                value={formData.tag_line}
                onChange={(e) => setFormData(prev => ({ ...prev, tag_line: e.target.value }))}
                className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-black outline-none focus:border-[#6290f2] transition-colors"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px'
                }}
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="flex flex-col gap-4 p-5">
            {/* Features Header */}
            <div className="flex gap-1.5 items-center justify-start">
              <Settings size={20} className="text-black" />
              <p 
                className="text-base font-semibold text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 600,
                  lineHeight: '24px'
                }}
              >
                Features
              </p>
            </div>

            {/* Features List */}
            <div className="flex flex-col gap-6">
              {features.map((feature, index) => {
                // Extract feature text from the feature object
                const featureKeys = Object.keys(feature).filter(key => key !== 'is_active' && key !== 'discount');
                const originalFeatureKey = featureKeys[0];
                const featureText = featureKeys.length > 0 ? String(feature[featureKeys[0]]) : '';
                
                // Determine which feature this is based on the key
                const isFeature2 = originalFeatureKey === 'feature_2';
                const isFeature3 = originalFeatureKey === 'feature_3';
                
                // Use state for is_active, with special handling for feature 2 and 3
                let isActive: boolean;
                if (isFeature2) {
                  // For feature 2, use new_cust_comm_is_active from formData if available, otherwise use state
                  isActive = formData.new_cust_comm_is_active !== undefined 
                    ? formData.new_cust_comm_is_active 
                    : (featuresActiveStatus[index] !== undefined 
                      ? featuresActiveStatus[index] 
                      : (feature.is_active ?? true));
                } else if (isFeature3) {
                  // For feature 3, use repeat_cust_comm_is_active from formData if available, otherwise use state
                  isActive = formData.repeat_cust_comm_is_active !== undefined 
                    ? formData.repeat_cust_comm_is_active 
                    : (featuresActiveStatus[index] !== undefined 
                      ? featuresActiveStatus[index] 
                      : (feature.is_active ?? true));
                } else {
                  // For other features, use state
                  isActive = featuresActiveStatus[index] !== undefined 
                    ? featuresActiveStatus[index] 
                    : (feature.is_active ?? true);
                }

                // Handler to toggle feature active status
                const handleToggleActive = () => {
                  const newActiveStatus = !isActive;
                  setFeaturesActiveStatus(prev => ({
                    ...prev,
                    [index]: newActiveStatus
                  }));
                  
                  // Update new_cust_comm_is_active for feature 2
                  if (isFeature2) {
                    setFormData(prev => ({
                      ...prev,
                      new_cust_comm_is_active: newActiveStatus
                    }));
                  }
                  
                  // Update repeat_cust_comm_is_active for feature 3
                  if (isFeature3) {
                    setFormData(prev => ({
                      ...prev,
                      repeat_cust_comm_is_active: newActiveStatus
                    }));
                  }
                };

                return (
                  <div key={index} className="flex flex-col gap-3">
                    {/* Feature Header with Toggle */}
                    <div className="flex items-start justify-between">
                      <p 
                        className="text-base text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        Features {index + 1}
                      </p>
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={handleToggleActive}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          isActive ? 'bg-[#6290f2]' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isActive ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Feature Inputs */}
                    <div className="flex gap-3 items-start">
                      {/* Commission Input for Feature 2 (New Customer) */}
                      {isFeature2 && numericData && (
                        <div className="flex flex-col gap-2 w-[140px]">
                          <label 
                            className="text-sm text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            Commission (%) *
                          </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Enter"
                              value={formData.commission_new_customer || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                setFormData(prev => ({ ...prev, commission_new_customer: isNaN(value) ? 0 : value }));
                              }}
                              className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-[#797e84] outline-none focus:border-[#6290f2] transition-colors"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '24px'
                              }}
                            />
                        </div>
                      )}

                      {/* Commission Inputs for Feature 3 (Repeat Customer) - Two separate fields */}
                      {isFeature3 && numericData && (
                        <>
                          <div className="flex flex-col gap-2 w-[140px]">
                            <label 
                              className="text-sm text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              Commission (%) *
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Enter"
                              value={formData.commission_repeat_customer || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                setFormData(prev => ({ ...prev, commission_repeat_customer: isNaN(value) ? 0 : value }));
                              }}
                              className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-[#797e84] outline-none focus:border-[#6290f2] transition-colors"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '24px'
                              }}
                            />
                          </div>
                          <div className="flex flex-col gap-2 w-[140px]">
                            <label 
                              className="text-sm text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '20px'
                              }}
                            >
                              Processing Fee (%) *
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder="Enter"
                              value={formData.payment_processing_fee || ''}
                              onChange={(e) => {
                                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                setFormData(prev => ({ ...prev, payment_processing_fee: isNaN(value) ? 0 : value }));
                              }}
                              className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-[#797e84] outline-none focus:border-[#6290f2] transition-colors"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 400,
                                lineHeight: '24px'
                              }}
                            />
                          </div>
                        </>
                      )}

                      {/* Tagline Input - Only show for non-commission features */}
                      {!isFeature2 && !isFeature3 && (
                        <div className="flex flex-col gap-2 flex-1">
                          <label 
                            className="text-sm text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            Tagline *
                          </label>
                          <input
                            type="text"
                            value={featureTaglines[index] !== undefined ? featureTaglines[index] : featureText}
                            onChange={(e) => {
                              setFeatureTaglines(prev => ({
                                ...prev,
                                [index]: e.target.value
                              }));
                            }}
                            className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-black outline-none focus:border-[#6290f2] transition-colors"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '24px'
                            }}
                          />
                        </div>
                      )}

                      {/* Dynamic Tagline Display for Feature 2 */}
                      {isFeature2 && numericData && (
                        <div className="flex flex-col gap-2 flex-1">
                          <label 
                            className="text-sm text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            Tagline (Auto-generated) *
                          </label>
                          <input
                            type="text"
                            value={feature2Text || `${formData.commission_new_customer}% commission on every new customer's first booking`}
                            readOnly
                            className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-black outline-none bg-gray-50 cursor-not-allowed"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '24px'
                            }}
                          />
                        </div>
                      )}

                      {/* Dynamic Tagline Display for Feature 3 */}
                      {isFeature3 && numericData && (
                        <div className="flex flex-col gap-2 flex-1">
                          <label 
                            className="text-sm text-black"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            Tagline (Auto-generated) *
                          </label>
                          <input
                            type="text"
                            value={feature3Text || `${formData.commission_repeat_customer}% commission on repeat customers (only ${formData.payment_processing_fee}% payment processing applies)`}
                            readOnly
                            className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 text-base text-black outline-none bg-gray-50 cursor-not-allowed"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '24px'
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Divider */}
                    {index < features.length - 1 && (
                      <div className="h-px bg-[#e5e7ea] w-full" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer with Save Button */}
        <div className="flex items-end justify-end p-5 shrink-0 w-full border-t border-[#e5e7ea]">
          <button
            onClick={() => {
              if (onSave) {
                // Include features active status and taglines in the form data
                onSave({ ...formData, featuresActiveStatus, featureTaglines });
              }
            }}
            className="bg-[#6290f2] min-h-[40px] px-4 py-3 rounded-lg w-40 flex items-center justify-center hover:bg-[#5280e2] transition-colors"
          >
            <p 
              className="text-base text-white"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px'
              }}
            >
              Save
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

