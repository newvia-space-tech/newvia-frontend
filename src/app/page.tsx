'use client';

import { useEffect } from 'react';
import PublicRoute from '@/components/PublicRoute';
import Header from '@/components/layout/Header';
import FirstBookingBanner from '@/components/layout/FirstBookingBanner';
import HeroSection from '@/components/layout/HeroSection';
import DiscountsSection from '@/components/layout/DiscountsSection';
import DiscoverCategoriesSection from '@/components/layout/DiscoverCategoriesSection';
import FindSection from '@/components/layout/FindSection';
import TrustedPartnersSection from '@/components/layout/TrustedPartnersSection';
import TestimonialSection from '@/components/layout/TestimonialSection';
import SocialMediaSection from '@/components/layout/SocialMediaSection';
import ServiceAreasSection from '@/components/layout/ServiceAreasSection';
import BlogsSection from '@/components/layout/BlogsSection';
import Footer from '@/components/layout/Footer';

export default function Home() {
  // Clear booking_data when user navigates to landing page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Don't clear if there's an active payment retry in progress
    const hasActivePayment = localStorage.getItem('payment_id');
    if (hasActivePayment) {
      return;
    }
    
    // Clear booking_data on landing page
    localStorage.removeItem('booking_data');
  }, []);

  return (
    <PublicRoute>
      <div className="min-h-screen bg-white">
        {/* First Booking Discount Banner */}
        <FirstBookingBanner />
        
        {/* Hero Section with Header */}
        <div className="relative">
          <HeroSection />
          
          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 px-4 sm:px-6 lg:px-10">
            <Header />
          </div>
        </div>
        
        {/* Find Section for today's top picks */}
        <FindSection />

        {/* Trusted Partners Section for verified partners */}
        <TrustedPartnersSection />

        {/* Discounts Section */}
        <DiscountsSection />

        {/* Discover Categories Section */}
        <DiscoverCategoriesSection />


        {/* Testimonial Section */}
        <TestimonialSection />

        {/* Social Media Section */}
        <SocialMediaSection />

        {/* Service Areas Section */}
        <ServiceAreasSection />

        {/* Blogs Section */}
        <BlogsSection />

        {/* Footer */}
        <Footer />
      </div>
    </PublicRoute>
  );
}
