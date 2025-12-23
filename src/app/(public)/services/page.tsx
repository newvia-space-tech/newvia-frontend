'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import CustomerPicksSection from '@/components/layout/CustomerPicksSection';
import ServicesAvailableSection from '@/components/layout/ServicesAvailableSection';
import Footer from '@/components/layout/Footer';

function ListingPageInner() {
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const categoryId = searchParams.get('category_id') || undefined;
  const cityId = searchParams.get('city_id') || undefined;

  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader 
        searchQuery={searchQuery}
        location={location}
        categoryId={categoryId}
        cityId={cityId}
        showSearchBar={true}
      />

      <CustomerPicksSection key={categoryId || 'no-category'} categoryId={categoryId} />

      <ServicesAvailableSection 
        searchQuery={searchQuery} 
        location={location} 
        cityId={cityId} 
        categoryId={categoryId} 
      />

      <Footer />
    </div>
  );
}

export default function ListingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingPageInner />
    </Suspense>
  );
}
