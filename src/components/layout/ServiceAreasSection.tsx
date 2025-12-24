'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMajorCities } from '@/hooks/city/useMajorCities';

// Image assets
const forwardArrowIcon = '/figma-assets/forward-arrow.svg';

export default function ServiceAreasSection() {
  const router = useRouter();
  const { data: cities, isLoading, error } = useMajorCities();

  const handleCityClick = (cityName: string, cityId: string) => {
    router.push(`/services?location=${encodeURIComponent(cityName)}&city_id=${cityId}`);
  };

  return (
    <div className="bg-white w-full py-16 px-4 sm:px-8 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-3 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5">
              <Image 
                alt="Forward arrow icon" 
                className="w-full h-full" 
                src={forwardArrowIcon} 
                width={20}
                height={20}
              />
            </div>
            <span className="text-[#797e84] text-sm font-medium tracking-wider uppercase">
              SERVICE AREAS
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-medium text-black">
            Available in Major Cities
          </h2>
        </div>

        {/* Cities Grid */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading cities...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">Failed to load cities. Please try again later.</p>
          </div>
        )}

        {cities && cities.length > 0 && (
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
            {cities.map((city) => (
              <div
                key={city.city_id}
                onClick={() => handleCityClick(city.name, city.city_id)}
                className="flex-shrink-0 w-80 h-64 relative rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              >
                {/* City Image */}
                <Image
                  src={city.image_url}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* City Info */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold mb-1">
                    {city.name}
                  </h3>
                  <p className="text-sm opacity-90">
                    {city.service_count} {city.service_count === 1 ? 'service' : 'services'} available
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {cities && cities.length === 0 && !isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">No cities available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
