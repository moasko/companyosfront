import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  name: string;
  ownedCompanies: any[];
  employeeProfiles: any[];
  globalRole?: 'SUPER_ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  checkPermission: (companyId: string, permissionCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const savedUser = localStorage.getItem('user_data');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    queryClient.clear();
    navigate('/');
  };

  const checkPermission = useCallback(
    (companyId: string, permissionCode: string) => {
      if (!user) return false;

      // 0. Global Super Admin check
      if (user.globalRole === 'SUPER_ADMIN') return true;

      // 1. Owner check
      const isOwner = user.ownedCompanies.some((c) => c.id === companyId);
      if (isOwner) return true;

      // Employee check
      const profile = user.employeeProfiles.find((p) => p.company.id === companyId);
      if (!profile) return false;

      // Role-based shortcuts
      if (profile.role === 'SUPER_ADMIN' || profile.role === 'ADMIN') return true;

      // Granular check
      if (Array.isArray(profile.permissions)) {
        return (
          profile.permissions.includes(permissionCode) ||
          profile.permissions.some((p: any) => p.code === permissionCode)
        );
      }
      return false;
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, logout, isAuthenticated: !!user, checkPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
