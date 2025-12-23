'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Home, 
  List, 
  Calendar, 
  CreditCard, 
  Star, 
  Settings, 
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string | null;
  onClick?: () => void;
}

export default function ProviderSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const logoImg = '/figma-assets/header-logo.svg';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

  const menuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Home,
      href: '/provider-management/overview'
    },
    {
      id: 'listing',
      label: 'Listing',
      icon: List,
      href: '/provider-management/listing'
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: Calendar,
      href: '/provider-management/bookings'
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
      href: '/provider-management/subscription'
    },
    {
      id: 'review',
      label: 'Review',
      icon: Star,
      href: '/provider-management/reviews'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/provider-management/settings'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      href: '/provider-management/profile'
    },
    {
      id: 'logout',
      label: 'Log out',
      icon: LogOut,
      href: null, // No href for logout
      onClick: logout
    }
  ];

  const handleLogout = () => {
    logout();
  };

  const renderMenuItem = (item: MenuItem, onItemClick?: () => void) => {
    const isActive = item.href ? (pathname === item.href || pathname?.startsWith(item.href)) : false;
    const IconComponent = item.icon;
    
    // Handle logout button differently
    if (item.id === 'logout') {
      return (
        <button
          key={item.id}
          onClick={() => {
            if (onItemClick) onItemClick();
            handleLogout();
          }}
          className="flex gap-3 items-center p-3 rounded-lg w-full transition-colors text-white/75 hover:bg-white/5"
        >
          <IconComponent size={20} className="shrink-0" />
          <span 
            className="text-sm flex-1 text-left"
            style={{ 
              fontFamily: 'Lato, sans-serif', 
              fontWeight: 400,
              lineHeight: '20px'
            }}
          >
            {item.label}
          </span>
        </button>
      );
    }
    
    // Handle regular menu items
    return (
      <Link
        key={item.id}
        href={item.href!}
        onClick={onItemClick}
        className={`flex gap-3 items-center p-3 rounded-lg w-full transition-colors ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-white/75 hover:bg-white/5'
        }`}
      >
        <IconComponent size={20} className="shrink-0" />
        <span 
          className="text-sm flex-1"
          style={{ 
            fontFamily: 'Lato, sans-serif', 
            fontWeight: isActive ? 500 : 400,
            lineHeight: '20px'
          }}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-[100] bg-[#425f4d] text-white p-2 rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex bg-[#425f4d] h-screen w-[248px] fixed left-0 top-0 flex-col gap-5 p-4">
        {/* Logo Container */}
        <div className="flex flex-col gap-[10px] items-start justify-center">
          <div className="h-[62px] w-[60px] flex items-center justify-center">
            <Image
              src={logoImg}
              alt="Newvia Logo"
              width={60}
              height={60}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex flex-col items-start">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm">
          <div
            ref={mobileMenuRef}
            className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-[#425f4d] flex flex-col gap-5 p-4"
          >
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between">
              <div className="h-[62px] w-[60px] flex items-center justify-center">
                <Image
                  src={logoImg}
                  alt="Newvia Logo"
                  width={60}
                  height={60}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col items-start overflow-y-auto">
              {menuItems.map((item) => renderMenuItem(item, () => setIsMobileMenuOpen(false)))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

