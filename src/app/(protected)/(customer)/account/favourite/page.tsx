'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import CustomerAccountSidebar from '@/components/customer-account/CustomerAccountSidebar';
import { useAuth } from '@/context/AuthContext';
import { getCustomerFavourites } from '@/services/favourite/favourite';
import { Favourite } from '@/types';

export default function FavouritePage() {
  const { user, logout, loading: authLoading, authToken } = useAuth();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch favourites on mount
  useEffect(() => {
    const fetchFavourites = async () => {
      if (!user?.id || !authToken) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCustomerFavourites(user.id, authToken);
        setFavourites(response.payload);
      } catch (err) {
        console.error('Error fetching favourites:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch favourites');
      } finally {
        setLoading(false);
      }
    };

    fetchFavourites();
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <UnifiedHeader showSearchBar={false} />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <CustomerAccountSidebar activeSection="favourite" />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="content-stretch flex flex-col gap-4 sm:gap-5 items-start relative size-full">
            <div className="flex flex-col font-['Lato:SemiBold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-xl sm:text-2xl text-black text-nowrap">
              <p className="leading-[32px] whitespace-pre">Favourite</p>
            </div>
            
            {loading ? (
              <div className="text-center py-12 w-full">
                <p 
                  className="text-[#797e84] text-base"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '24px' 
                  }}
                >
                  Loading favourites...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 w-full">
                <p 
                  className="text-red-500 text-base"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '24px' 
                  }}
                >
                  {error}
                </p>
              </div>
            ) : favourites.length === 0 ? (
              <div className="text-center py-12 w-full">
                <p 
                  className="text-[#797e84] text-base"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '24px' 
                  }}
                >
                  No favourites found
                </p>
              </div>
            ) : (
              <div className="content-stretch flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 items-start relative shrink-0 w-full flex-wrap">
                {favourites.map((service) => (
                <div key={service.favourite_id} className="content-stretch flex flex-col gap-3 sm:gap-4 items-start relative shrink-0 w-full sm:w-[345px]">
                  <div className="h-[200px] sm:h-[200px] overflow-clip relative rounded-xl shrink-0 w-full">
                    {service.thumbnail_image && service.thumbnail_image.trim() !== '' ? (
                      <div className="absolute h-[200px] left-[calc(50%-1px)] overflow-clip top-1/2 translate-x-[-50%] translate-y-[-50%] w-[347px]">
                        <div className="absolute left-0 size-[350px] top-[-15px]">
                          <Image
                            alt=""
                            className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full"
                            src={service.thumbnail_image}
                            fill
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg 
                            className="w-10 h-10" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1.5} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                          <span className="text-xs font-medium">No Image</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute backdrop-blur-[35px] backdrop-filter bg-white/90 border border-white/50 box-border flex items-center justify-center right-2 sm:left-[293px] p-2 rounded-full top-2 sm:top-[16px] w-8 h-8 sm:w-9 sm:h-9">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-red-500 flex-shrink-0" />
                    </div>
                  </div>
                  
                  <div className="content-stretch flex flex-col gap-1.5 sm:gap-1.5 items-start relative shrink-0 w-full">
                    <div className="content-stretch flex flex-col gap-1 sm:gap-1 items-start relative shrink-0">
                      <div className="flex flex-col font-['Lato:SemiBold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-base sm:text-lg text-black text-left sm:text-center text-nowrap">
                        <p className="leading-[28px] whitespace-pre">{service.business_name}</p>
                      </div>
                      <div className="content-stretch flex gap-1.5 sm:gap-1.5 items-center relative shrink-0">
                        <Star className="h-3 w-3 sm:h-[13px] sm:w-[13px] text-yellow-500 fill-yellow-500" />
                        <div className="flex flex-col font-['Lato:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-sm sm:text-base text-black text-nowrap">
                          <p className="leading-[24px] whitespace-pre">{service.avg_rating}</p>
                        </div>
                        <div className="flex flex-col font-['Lato:Regular',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#797e84] text-sm sm:text-base text-nowrap">
                          <p className="leading-[24px] whitespace-pre">({service.total_reviews})</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col font-['Lato:Medium',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#797e84] text-sm sm:text-base text-left sm:text-center">
                      <p className="leading-[24px] break-words">{service.address_line_1}, {service.postal_code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

