'use client';

import React, { useState } from 'react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import { Check, Video, Tag, Star, ShieldCheck, TrendingUp } from 'lucide-react';

export default function SubscriptionPage() {
  const [activeAddOns, setActiveAddOns] = useState<string[]>(['voucher']);

  const handleToggleAddOn = (addOnId: string) => {
    setActiveAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    );
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
          {/* Subscription Plans */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 mb-4 sm:mb-5">
            {/* Free Plan */}
            <div className="flex-1 bg-white rounded-lg p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-0.5">
                  <h2 
                    className="text-xl font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '28px'
                    }}
                  >
                    Free Plan – RM0/month
                  </h2>
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Always free to join, no subscription required
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 
                    className="text-sm font-semibold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 600,
                      lineHeight: '20px'
                    }}
                  >
                    What&apos;s Included
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2 items-center">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Free business listing on NewVía
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        15% commission on every new customer&apos;s first booking
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        0% commission on repeat customers (only 2.5% payment processing applies)
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Customer reviews & ratings included
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-8">
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
                <p 
                  className="text-sm text-[#797e84] text-center"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Start for free. Pay only when you get new customers.
                </p>
              </div>
            </div>

            {/* Pro Plan */}
            {/* <div className="flex-1 bg-white rounded-lg p-5 flex flex-col justify-between">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-0.5">
                  <h2 
                    className="text-xl font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 700,
                      lineHeight: '28px'
                    }}
                  >
                    Pro Plan – RM99/month
                  </h2>
                  <p 
                    className="text-sm text-[#797e84]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Invite-only, Not yet available for purchase
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 
                    className="text-sm font-semibold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 600,
                      lineHeight: '20px'
                    }}
                  >
                    What&apos;s Included
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2 items-start">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0 mt-0.5" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Priority Discovery — top placement in category + city &quot;Editor&apos;s Picks.&quot;
                      </p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0 mt-0.5" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Next-Wave Marketing Access — inclusion in curated city guides & creator collabs.
                      </p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0 mt-0.5" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Intelligent Recommendations — forward-looking prompts on when/what to promote
                      </p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0 mt-0.5" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Rebooking Reinvented — automated, native-feel come-back nudges.
                      </p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0 mt-0.5" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Smart Bundles — early access to dynamic add-on combos for higher AOV.
                      </p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0 mt-0.5" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Customer Insights Light — new vs repeat mix, frequency, ticket lift.
                      </p>
                    </div>
                    <div className="flex gap-2 items-start">
                      <Check size={20} className="text-[#1fc16b] flex-shrink-0 mt-0.5" />
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Pro Partner Badge — premium trust marker across listings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-8">
                <button className="bg-[#6290f2] hover:bg-[#5280e2] rounded-lg px-4 py-2 transition-colors">
                  <p 
                    className="text-sm text-white text-center"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Join Pro Waitlist
                  </p>
                </button>
                <p 
                  className="text-sm text-[#797e84] text-center"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px'
                  }}
                >
                  Be first in line for the next wave of growth tools.
                </p>
              </div>
            </div> */}
          </div>

          {/* Add-Ons Section - Commented out */}
          {false && <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5">
              <h2 
                className="text-lg font-bold text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 700,
                  lineHeight: '28px'
                }}
              >
                Add-Ons (Optional Upgrades)
              </h2>
              <p 
                className="text-sm text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px'
                }}
              >
                Enhance your listing with premium features
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {/* Built-in Video Call */}
              <div className="bg-white rounded-lg p-5 flex flex-col gap-5 w-[376px]">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2.5 items-center">
                      <Video size={20} className="text-black" />
                      <h3 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Built-in Video Call
                      </h3>
                    </div>
                    <p 
                      className="text-base text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Secure in-app video consultations or sessions
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p 
                      className="text-xl font-bold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 700,
                        lineHeight: '28px'
                      }}
                    >
                      RM5 per call
                    </p>
                    <p 
                      className="text-sm text-[#9ea5ad]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      per completed call (flat fee, even if session is free)
                    </p>
                  </div>
                </div>
                <button className="border border-[#6290f2] rounded-lg px-4 py-2 hover:bg-[#6290f2]/5 transition-colors">
                  <p 
                    className="text-sm text-[#6290f2] text-center"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Activate
                  </p>
                </button>
              </div>

              {/* Voucher Program */}
              <div className="bg-white rounded-lg p-5 flex flex-col gap-5 w-[376px] relative">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2.5 items-center justify-between">
                      <div className="flex gap-2.5 items-center">
                        <Tag size={20} className="text-black" />
                        <h3 
                          className="text-base font-semibold text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 600,
                            lineHeight: '24px'
                          }}
                        >
                          Voucher Program
                        </h3>
                      </div>
                      {activeAddOns.includes('voucher') && (
                        <div className="bg-[#e9f9f0] rounded-full px-3 py-0.5">
                          <p 
                            className="text-sm text-[#1fc16b]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 400,
                              lineHeight: '20px'
                            }}
                          >
                            Active
                          </p>
                        </div>
                      )}
                    </div>
                    <p 
                      className="text-base text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Share Custom Promo Vouchers
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p 
                      className="text-xl font-bold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 700,
                        lineHeight: '28px'
                      }}
                    >
                      RM20/month
                    </p>
                    <p 
                      className="text-sm text-[#9ea5ad]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Merchant-funded (you decide the discount value)
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleAddOn('voucher')}
                  className={`border rounded-lg px-4 py-2 transition-colors ${
                    activeAddOns.includes('voucher')
                      ? 'border-[#e43636] hover:bg-red-50'
                      : 'border-[#6290f2] hover:bg-[#6290f2]/5'
                  }`}
                >
                  <p 
                    className={`text-sm text-center ${
                      activeAddOns.includes('voucher') ? 'text-[#e43636]' : 'text-[#6290f2]'
                    }`}
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    {activeAddOns.includes('voucher') ? 'Deactivate' : 'Activate'}
                  </p>
                </button>
              </div>

              {/* Priority Listing */}
              <div className="bg-white rounded-lg p-5 flex flex-col gap-5 w-[376px] relative">
                <div className="absolute -top-1.5 -left-1.5">
                  <div className="bg-[#ffde82] text-black px-1 py-1 text-xs font-lato shadow-md relative" style={{ borderRadius: '6px 6px 6px 0' }}>
                    <p 
                      className="text-xs"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Popular
                    </p>
                    {/* Folded corner effect using SVG */}
                    <div className="absolute -bottom-1 -left-0.25">
                      <svg 
                        width="8" 
                        height="5" 
                        viewBox="0 0 8 5" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-2 h-1"
                      >
                        <path 
                          d="M0 0H8V5L0 0Z" 
                          fill="#d97706"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2.5 items-center">
                      <Star size={20} className="text-black" />
                      <h3 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Priority Listing
                      </h3>
                    </div>
                    <p 
                      className="text-base text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Appear at the top of category search results
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p 
                      className="text-xl font-bold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 700,
                        lineHeight: '28px'
                      }}
                    >
                      RM199/month
                    </p>
                    <p 
                      className="text-sm text-[#9ea5ad]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Gain higher visibility and attract more new customers
                    </p>
                  </div>
                </div>
                <button className="border border-[#6290f2] rounded-lg px-4 py-2 hover:bg-[#6290f2]/5 transition-colors">
                  <p 
                    className="text-sm text-[#6290f2] text-center"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Activate
                  </p>
                </button>
              </div>

              {/* Verified Badge */}
              <div className="bg-white rounded-lg p-5 flex flex-col gap-5 w-[376px]">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2.5 items-center">
                      <ShieldCheck size={20} className="text-black" />
                      <h3 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Verified badge
                      </h3>
                    </div>
                    <p 
                      className="text-base text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Display verified business badge to build trust
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p 
                      className="text-xl font-bold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 700,
                        lineHeight: '28px'
                      }}
                    >
                      RM29/month
                    </p>
                    <p 
                      className="text-sm text-[#9ea5ad]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Boost credibility with an official verified business badge
                    </p>
                  </div>
                </div>
                <button className="border border-[#6290f2] rounded-lg px-4 py-2 hover:bg-[#6290f2]/5 transition-colors">
                  <p 
                    className="text-sm text-[#6290f2] text-center"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Activate
                  </p>
                </button>
              </div>

              {/* Analytics Dashboard */}
              <div className="bg-white rounded-lg p-5 flex flex-col gap-5 w-[376px]">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-2.5 items-center">
                      <TrendingUp size={20} className="text-black" />
                      <h3 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Analytics Dashboard
                      </h3>
                    </div>
                    <p 
                      className="text-base text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Track your business performance with insights
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p 
                      className="text-xl font-bold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 700,
                        lineHeight: '28px'
                      }}
                    >
                      RM29/month
                    </p>
                    <p 
                      className="text-sm text-[#9ea5ad]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Total Revenue, Bookings, Customer analytics etc
                    </p>
                  </div>
                </div>
                <button className="bg-[#f8f9f8] rounded-lg px-4 py-2 cursor-not-allowed">
                  <p 
                    className="text-sm text-[#797e84] text-center"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '20px'
                    }}
                  >
                    Coming Soon
                  </p>
                </button>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}

