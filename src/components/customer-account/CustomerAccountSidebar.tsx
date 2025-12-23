'use client';

import React from 'react';
import Link from 'next/link';
import { UserRound, CalendarCheck, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CustomerAccountSidebarProps {
  activeSection?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href?: string | null;
  onClick?: () => void;
}

export default function CustomerAccountSidebar({ activeSection = 'profile' }: CustomerAccountSidebarProps) {
  const { logout } = useAuth();
  
  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'Profile',
      icon: UserRound,
      href: '/account'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: CalendarCheck,
      href: '/account/appointments'
    },
    {
      id: 'favourite',
      label: 'Favourite',
      icon: Heart,
      href: '/account/favourite'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/account/settings'
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

  const renderMenuItem = (item: MenuItem) => {
    const isActive = activeSection === item.id;
    const IconComponent = item.icon;
    
    // Handle logout button differently
    if (item.id === 'logout') {
      return (
        <button
          key={item.id}
          onClick={handleLogout}
          className="flex gap-2 items-center p-3 rounded-lg transition-colors text-black hover:bg-gray-50 w-full text-left"
        >
          <div className="w-5 h-5 flex-shrink-0">
            <IconComponent 
              size={20}
              className="w-full h-full"
            />
          </div>
          <span 
            className="text-base font-medium"
            style={{ 
              fontFamily: 'Lato, sans-serif', 
              fontWeight: 500,
              lineHeight: '24px'
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
        className={`flex gap-2 items-center p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-[#eff4fe] text-[#6290f2]'
            : 'text-black hover:bg-gray-50'
        }`}
      >
        <div className="w-5 h-5 flex-shrink-0">
          <IconComponent 
            size={20}
            className="w-full h-full"
          />
        </div>
        <span 
          className="text-base font-medium"
          style={{ 
            fontFamily: 'Lato, sans-serif', 
            fontWeight: isActive ? 500 : 500,
            lineHeight: '24px'
          }}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Desktop Sidebar - Only visible on desktop */}
      <div className="hidden lg:block bg-white border-r border-[#e5e7ea] h-full w-[220px]">
        <div className="flex flex-col gap-2 p-5 h-full">
          {menuItems.map((item) => renderMenuItem(item))}
        </div>
      </div>
    </>
  );
}

