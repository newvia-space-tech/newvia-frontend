'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, UserRound, CalendarCheck, Heart, Settings, LogOut, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import CompactSearchBar from '@/components/shared/CompactSearchBar';

// Image assets
const logoImg = '/figma-assets/logo.svg';

interface UnifiedHeaderProps {
  searchQuery?: string;
  location?: string;
  categoryId?: string;
  cityId?: string;
  showSearchBar?: boolean;
}

export default function UnifiedHeader({ 
  searchQuery = '', 
  location = '',
  categoryId,
  cityId,
  showSearchBar = true 
}: UnifiedHeaderProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Check if we're on a customer account page
  const isCustomerAccountPage = pathname?.startsWith('/account') || pathname === '/account';
  
  // Determine active section for account pages
  const getActiveSection = () => {
    if (!isCustomerAccountPage) return null;
    if (pathname === '/account') return 'profile';
    if (pathname === '/account/appointments') return 'appointments';
    if (pathname === '/account/favourite') return 'favourite';
    if (pathname === '/account/settings') return 'settings';
    if (pathname === '/account/reset-password') return 'reset-password';
    return null;
  };
  
  const activeSection = getActiveSection();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="relative">
      <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="block">
                <div className="h-8 w-8 sm:h-10 sm:w-10">
                  <Image
                    src={logoImg}
                    alt="Newvia Logo"
                    className="w-full h-full object-contain"
                    width={40}
                    height={40}
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            {showSearchBar && (
              <div className="flex-1 min-w-0 max-w-[calc(100%-140px)] sm:max-w-xl lg:max-w-2xl">
                <CompactSearchBar 
                  prefilledQuery={searchQuery}
                  prefilledLocation={location}
                  prefilledCategoryId={categoryId}
                  prefilledCityId={cityId}
                />
              </div>
            )}

            {/* Hamburger Menu */}
            <div className="flex-shrink-0 relative">
              <button 
                onClick={toggleMenu}
                className="text-gray-600 hover:text-gray-900 p-1.5 sm:p-2 rounded-lg" 
                style={{ backgroundColor: '#F8F9F8' }}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              
              {/* Menu Popup - positioned below button */}
              {isMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+12px)] z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]" style={{ fontFamily: 'Lato, sans-serif' }}>
                    {/* Menu Items */}
                    <nav className="space-y-1">
                      {isAuthenticated ? (
                        <>
                          {/* Show Account menu items for customers on account pages */}
                          {user?.role === 'customer' && isCustomerAccountPage ? (
                            <>
                              {/* Account menu items - visible on mobile only (sidebar shows on desktop) */}
                              <Link 
                                href="/account"
                                onClick={closeMenu}
                                className={`lg:hidden flex items-center gap-3 px-4 py-2 text-base transition-colors rounded-lg ${
                                  activeSection === 'profile'
                                    ? 'bg-[#eff4fe] text-[#6290f2]'
                                    : 'text-black hover:bg-gray-50'
                                }`}
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                <UserRound className="w-5 h-5" />
                                Profile
                              </Link>
                              <Link 
                                href="/account/appointments"
                                onClick={closeMenu}
                                className={`lg:hidden flex items-center gap-3 px-4 py-2 text-base transition-colors rounded-lg ${
                                  activeSection === 'appointments'
                                    ? 'bg-[#eff4fe] text-[#6290f2]'
                                    : 'text-black hover:bg-gray-50'
                                }`}
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                <CalendarCheck className="w-5 h-5" />
                                Appointments
                              </Link>
                              <Link 
                                href="/account/favourite"
                                onClick={closeMenu}
                                className={`lg:hidden flex items-center gap-3 px-4 py-2 text-base transition-colors rounded-lg ${
                                  activeSection === 'favourite'
                                    ? 'bg-[#eff4fe] text-[#6290f2]'
                                    : 'text-black hover:bg-gray-50'
                                }`}
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                <Heart className="w-5 h-5" />
                                Favourite
                              </Link>
                              <Link 
                                href="/account/settings"
                                onClick={closeMenu}
                                className={`lg:hidden flex items-center gap-3 px-4 py-2 text-base transition-colors rounded-lg ${
                                  activeSection === 'settings'
                                    ? 'bg-[#eff4fe] text-[#6290f2]'
                                    : 'text-black hover:bg-gray-50'
                                }`}
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                <Settings className="w-5 h-5" />
                                Settings
                              </Link>
                              <Link 
                                href="/account/reset-password"
                                onClick={closeMenu}
                                className={`lg:hidden flex items-center gap-3 px-4 py-2 text-base transition-colors rounded-lg ${
                                  activeSection === 'reset-password'
                                    ? 'bg-[#eff4fe] text-[#6290f2]'
                                    : 'text-black hover:bg-gray-50'
                                }`}
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                <KeyRound className="w-5 h-5" />
                                Reset Password
                              </Link>
                              
                              {/* About Us, Blogs, and Logout - visible on both mobile and desktop */}
                              <Link 
                                href="/about"
                                onClick={closeMenu}
                                className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                About Us
                              </Link>
                              
                              <Link 
                                href="/blog"
                                onClick={closeMenu}
                                className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                Blogs
                              </Link>
                              
                              <button 
                                onClick={() => {
                                  logout();
                                  closeMenu();
                                }}
                                className="flex items-center gap-3 w-full text-left px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                <LogOut className="w-5 h-5" />
                                Log out
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Show Account for customers only */}
                              <Link 
                                href="/account"
                                onClick={closeMenu}
                                className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                Account
                              </Link>
                              
                              {/* About Us and Blogs */}
                              <Link 
                                href="/about"
                                onClick={closeMenu}
                                className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                About Us
                              </Link>
                              
                              <Link 
                                href="/blog"
                                onClick={closeMenu}
                                className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                Blogs
                              </Link>
                              
                              <button 
                                onClick={() => {
                                  logout();
                                  closeMenu();
                                }}
                                className="block w-full text-left px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                              >
                                Logout
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {/* Show Login when user is not authenticated */}
                          <Link 
                            href="/auth/login/customer"
                            onClick={closeMenu}
                            className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                          >
                            Login
                          </Link>
                          
                          {/* About Us and Blogs */}
                          <Link 
                            href="/about"
                            onClick={closeMenu}
                            className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                          >
                            About Us
                          </Link>
                          
                          <Link 
                            href="/blog"
                            onClick={closeMenu}
                            className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                          >
                            Blogs
                          </Link>
                          
                          {/* Show "List your Shop" only if user is not authenticated */}
                          <Link 
                            href="/auth/login/provider"
                            onClick={closeMenu}
                            className="block px-4 py-2 text-base text-black hover:bg-gray-50 transition-colors rounded-lg"
                            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}
                          >
                            List your Shop
                          </Link>
                        </>
                      )}
                    </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Invisible backdrop to close menu on outside click */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeMenu}
        ></div>
      )}
    </div>
  );
}

