import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PublicSite } from './components/public/PublicSite';
import { AdminDashboard } from './modules/admin/dashboard/Dashboard';
import { LoginPage } from './modules/auth/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SiteContent } from './types';
import { CreateCompanyView } from './modules/admin/companies/CreateCompanyView';
import { AttendanceKiosk } from './modules/kiosk/AttendanceKiosk';
import { SupplierPortal } from './modules/admin/stock/components/SupplierPortal';
import { EmployeePortal } from './modules/kiosk';
import { useCompanies } from './hooks/useAppQueries';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');

  // 1. Fetch Companies List
  const {
    data: companies = [],
    isLoading: companiesLoading,
    refetch: refetchCompanies,
  } = useCompanies(isAuthenticated);

  // 2. Get Active Company from companies list
  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  // Effect 1: Tenant Detection & Selection
  useEffect(() => {
    if (companiesLoading) return;

    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const potentialSlug = parts[0].toLowerCase();

    if (companies.length > 0) {
      // 1. Precise match via URL/Domain
      const urlMatch = companies.find(
        (c) =>
          (c.slug && c.slug.toLowerCase() === potentialSlug) ||
          (c.domain && c.domain.toLowerCase() === hostname.toLowerCase()),
      );

      if (urlMatch) {
        if (activeCompanyId !== urlMatch.id) {
          setActiveCompanyId(urlMatch.id);
        }
      } else if (!activeCompanyId) {
        // 2. Default fallback if no match
        setActiveCompanyId(companies[0].id);
      }
    }
  }, [companies, companiesLoading, activeCompanyId]);

  // Effect 2: Redirection Logic
  useEffect(() => {
    if (companiesLoading) return;

    const path = window.location.pathname;

    if (isAuthenticated) {
      const hasCompanies = companies.length > 0;
      const isEmployeeOnly =
        user?.employeeProfiles?.length > 0 &&
        (!user?.ownedCompanies || user.ownedCompanies.length === 0);

      // Handle Admin coherence
      if (path.startsWith('/admin')) {
        if (isEmployeeOnly) {
          navigate('/employee-portal', { replace: true });
          return;
        }
        if (!hasCompanies) {
          navigate('/onboarding', { replace: true });
          return;
        }
      }

      // Handle Onboarding coherence
      if (path === '/onboarding' && hasCompanies) {
        navigate('/admin', { replace: true });
        return;
      }
    }
  }, [companies, isAuthenticated, user, companiesLoading, navigate]);

  // Handlers
  const handleSwitchCompany = (id: string) => {
    setActiveCompanyId(id);
  };

  const handleUpdate = (updatedContent: SiteContent) => {
    // Optimistic / Manual Update
    queryClient.setQueryData(['companies', isAuthenticated], (old: any[] | undefined) => {
      if (!old) return [];
      return old.map((c) => (c.id === updatedContent.id ? updatedContent : c));
    });
  };

  const refreshDashboardData = () => {
    refetchCompanies();
  };

  return (
    <Routes>
      {/* Public Site */}
      <Route
        path="/"
        element={
          activeCompany ? (
            <PublicSite content={activeCompany} onAdminClick={() => navigate('/admin')} />
          ) : (
            <div className="h-screen flex items-center justify-center bg-white text-slate-500">
              {companiesLoading ? 'Chargement...' : 'Aucun contenu disponible.'}
            </div>
          )
        }
      />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Kiosk */}
      <Route path="/kiosk/:companyId" element={<AttendanceKiosk />} />

      {/* Supplier Portal */}
      <Route path="/supplier-portal/:supplierId" element={<SupplierPortal />} />

      {/* Employee Portal */}
      <Route path="/employee-portal" element={<EmployeePortal />} />

      {/* Onboarding / Create Company */}
      <Route
        path="/onboarding"
        element={
          isAuthenticated ? (
            <CreateCompanyView onSuccess={() => refetchCompanies()} onLogout={logout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminDashboard
              companies={companies}
              activeCompanyId={activeCompanyId}
              onSwitchCompany={handleSwitchCompany}
              onUpdate={handleUpdate}
              onLogout={logout}
              onRefresh={refreshDashboardData}
              onViewSite={() => navigate('/')}
            />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import { ModalProvider } from './contexts/ModalContext';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ModalProvider>
    </AuthProvider>
  );
}
