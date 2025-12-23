'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { HeaderProps } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, User, Calendar, Heart, Settings, LogOut } from 'lucide-react';

// Image assets
const defaultLogo = '/figma-assets/header-logo.svg';
const darkLogo = '/figma-assets/logo.svg';
const arrowIcon = '/figma-assets/arrow-right.svg';

export default function Header({
  variant = 'Default Home',
  theme = 'dark',
  logoSrc
}: HeaderProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);
  
  // Determine text and border colors based on theme
  const textColor = 'text-black'; // Always black text
  const borderColor = theme === 'light' ? 'border-white' : 'border-black';
  const hoverBg = theme === 'light' ? 'hover:bg-black/10' : 'hover:bg-white/10';
  
  // Determine logo source - use dark logo for landing page
  const logo = logoSrc || (isLandingPage ? darkLogo : (theme === 'light' ? darkLogo : defaultLogo));
  
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-10 py-3 relative z-10">
      {/* Logo */}
      <Link href="/" className="h-[50px] sm:h-[62px] w-[180px] sm:w-[212px] flex items-center">
        <div className="h-[50px] sm:h-[60px] w-[50px] sm:w-[60px] flex items-center justify-center">
          <Image
            src={logo}
            alt="Newvia Logo"
            width={60}
            height={60}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      </Link>

      {/* Navigation - Hidden on mobile, visible on desktop */}
      <nav className="hidden md:flex gap-2 lg:gap-3 items-center">
        <Link
          href="/services"
          className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-full ${textColor} text-sm lg:text-base font-medium ${hoverBg} transition-colors`}
        >
          Services
        </Link>
        <Link
          href="/blog"
          className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-full ${textColor} text-sm lg:text-base font-medium ${hoverBg} transition-colors`}
        >
          Blogs
        </Link>
        {loading ? (
          <div className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-full ${textColor} text-sm lg:text-base font-medium`}>
            {/* Empty div with same dimensions to prevent layout shift */}
          </div>
        ) : isAuthenticated && user ? (
          <div className="relative" ref={dropdownRef}>
            {/* User Account Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-full ${textColor} text-sm lg:text-base font-medium ${hoverBg} transition-colors border border-gray-300 hover:border-white`}
            >
              {/* Profile Picture */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
              {/* User Name */}
              <span>{user.name}</span>
              {/* Dropdown Arrow */}
              <ChevronDown className={`w-4 h-4 text-black transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[200px]">
                <nav className="space-y-1">
                  {/* Customer Menu Items */}
                  <Link 
                    href="/account"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  <Link 
                    href="/account/appointments"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Appointments
                  </Link>
                  
                  <Link 
                    href="/account/favourite"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    Favourite
                  </Link>
                  
                  <Link 
                    href="/account/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  
                  {/* Logout button */}
                  <button 
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/auth/login/customer"
              className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-full ${textColor} text-sm lg:text-base font-medium ${hoverBg} transition-colors`}
            >
              Login
            </Link>
            <Link
              href="/auth/login/provider"
              className={`relative px-3 lg:px-4 py-2 lg:py-2.5 rounded-full border ${borderColor} flex items-center gap-1 lg:gap-2 ${textColor} text-sm lg:text-base font-medium ${hoverBg} transition-colors`}
            >
              <span className="hidden lg:inline">List Your Shop</span>
              <span className="lg:hidden">List Shop</span>
              <Image
                src={arrowIcon}
                alt="Arrow Right"
                width={12.5}
                height={12.5}
                className="w-2.5 lg:w-3 h-2.5 lg:h-3 brightness-0"
              />
            </Link>
          </>
        )}
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 rounded-lg relative z-10 backdrop-blur-sm text-black bg-transparent"
        style={{
          backgroundColor: isLandingPage ? 'white' : undefined
        }}
        aria-label="Toggle mobile menu"
      >
        <svg 
          className="w-6 h-6 text-black" 
          fill="none" 
          stroke="#000000" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            ref={mobileMenuRef}
            className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] ${theme === 'light' ? 'bg-white' : 'bg-black'} shadow-xl transform transition-transform duration-300 ease-in-out`}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2 rounded-lg ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <nav className="space-y-4">
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link
                      href="/services"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-base font-medium ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                    >
                      Services
                    </Link>
                    <Link
                      href="/blog"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-base font-medium ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                    >
                      Blogs
                    </Link>
                  </div>

                  <div className={`border-t ${theme === 'light' ? 'border-gray-200' : 'border-gray-700'}`} />

                  {/* Auth Section */}
                  <div className="space-y-2">
                    {loading ? (
                      <div className={`px-4 py-3 rounded-lg text-base font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                        Loading...
                      </div>
                    ) : isAuthenticated && user ? (
                      <>
                        {/* User Info */}
                        <div className={`px-4 py-3 rounded-lg ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                              {user.avatar ? (
                                <Image
                                  src={user.avatar}
                                  alt={user.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                  <User className="w-5 h-5 text-gray-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                                {user.name}
                              </p>
                              <p className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                {user.role === 'provider' ? 'Provider' : 'Customer'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* User Menu Items - Only for Customers */}
                        <Link
                          href="/account"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                        >
                          <User className="w-5 h-5" />
                          Profile
                        </Link>
                        <Link
                          href="/account/appointments"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                        >
                          <Calendar className="w-5 h-5" />
                          Appointments
                        </Link>
                        <Link
                          href="/account/favourite"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                        >
                          <Heart className="w-5 h-5" />
                          Favourite
                        </Link>
                        <Link
                          href="/account/settings"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                        >
                          <Settings className="w-5 h-5" />
                          Settings
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg text-base ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                        >
                          <LogOut className="w-5 h-5" />
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/auth/login/customer"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-4 py-3 rounded-lg text-base font-medium ${theme === 'light' ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'} transition-colors`}
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth/login/provider"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium border ${theme === 'light' ? 'border-black text-black hover:bg-black hover:text-white' : 'border-white text-white hover:bg-white hover:text-black'} transition-colors`}
                        >
                          <span>List Your Shop</span>
                          <Image
                            src={arrowIcon}
                            alt="Arrow Right"
                            width={12.5}
                            height={12.5}
                            className={`w-2.5 h-2.5 ${theme === 'light' ? 'brightness-0' : ''}`}
                          />
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
