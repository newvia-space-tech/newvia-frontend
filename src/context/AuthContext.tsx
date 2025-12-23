'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const isAuthenticated = !!user && !!authToken;
  const isAdminAuthenticated = !!adminToken;

  // Load auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        const storedAdminToken = localStorage.getItem('adminToken');
        
        console.log('🔍 AuthContext initialization:', { 
          hasToken: !!storedToken, 
          hasUser: !!storedUser,
          hasAdminToken: !!storedAdminToken,
          tokenLength: storedToken?.length || 0
        });

        if (storedToken && storedUser) {
          try {
            // Parse stored user data
            const userData = JSON.parse(storedUser);
            setAuthToken(storedToken);
            setUser(userData);
            console.log('✅ Auth state restored from localStorage:', userData);
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            // Clear corrupted data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } else {
          console.log('ℹ️ No stored auth data found');
        }

        if (storedAdminToken) {
          setAdminToken(storedAdminToken);
          console.log('✅ Admin token restored from localStorage');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear any corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Reset isLoggingOut state when component unmounts or after a delay
  useEffect(() => {
    if (isLoggingOut) {
      const timer = setTimeout(() => {
        setIsLoggingOut(false);
      }, 2000); // Reset after 2 seconds as fallback
      
      return () => clearTimeout(timer);
    }
  }, [isLoggingOut]);

  const login = useCallback((token: string, userData: User) => {
    setAuthToken(token);
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const adminLogin = useCallback((token: string) => {
    setAdminToken(token);
    localStorage.setItem('adminToken', token);
  }, []);

  const logout = useCallback(() => {
    setIsLoggingOut(true);
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Redirect to landing page after logout
    router.push('/');
  }, [router]);

  const adminLogout = useCallback(() => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    // Redirect to admin login page after logout
    router.push('/auth/login/admin');
  }, [router]);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      
      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value: AuthContextType = {
    user,
    authToken,
    adminToken,
    loading,
    isAuthenticated,
    isAdminAuthenticated,
    isLoggingOut,
    login,
    adminLogin,
    logout,
    adminLogout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
