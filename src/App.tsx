
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PublicSite } from './components/public/PublicSite';
import { AdminDashboard } from './modules/admin/dashboard/Dashboard';
import { LoginPage } from './modules/auth/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { apiFetch } from './lib/api-client';
import { SiteContent } from './types';
import { CreateCompanyView } from './modules/admin/companies/CreateCompanyView';
import { AttendanceKiosk } from './modules/kiosk/AttendanceKiosk';

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('');
  const [publicCompany, setPublicCompany] = useState<SiteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const data = await apiFetch('/companies');
        setCompanies(data);
        if (data.length > 0) {
          const firstId = data[0].id;
          setActiveCompanyId(firstId);
          const fullContent = await apiFetch(`/cms/${firstId}`);
          setPublicCompany(fullContent);

          // Redirect to admin if we were on the onboarding page
          if (window.location.pathname === '/onboarding') {
            navigate('/admin');
          }
        } else {
          // Redirect to onboarding if no companies
          navigate('/onboarding');
        }
      } else {
        const publicList = await apiFetch('/companies/public');
        if (publicList.length > 0) {
          const firstId = publicList[0].id;
          setActiveCompanyId(firstId);
          const fullContent = await apiFetch(`/cms/${firstId}`);
          setPublicCompany(fullContent);
        }
      }
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [isAuthenticated]);

  const handleUpdate = (updatedContent: SiteContent) => {
    setCompanies(prev => prev.map(c => c.id === updatedContent.id ? updatedContent : c));
    if (updatedContent.id === activeCompanyId) {
      setPublicCompany(updatedContent);
    }
  };

  const handleSwitchCompany = async (id: string) => {
    setActiveCompanyId(id);
    setIsLoading(true);
    try {
      const fullContent = await apiFetch(`/cms/${id}`);
      setPublicCompany(fullContent);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const refreshDashboardData = async () => {
    try {
      if (isAuthenticated) {
        const data = await apiFetch('/companies');
        setCompanies(data);
      }
    } catch (err) {
      console.error("Failed to refresh companies", err);
    }
  };

  // isLoading is removed as per user request to avoid the loading screen

  return (
    <Routes>
      {/* Public Site */}
      <Route path="/" element={
        publicCompany ? (
          <PublicSite
            content={publicCompany}
            onAdminClick={() => window.location.href = '/admin'}
          />
        ) : (
          <div className="h-screen flex items-center justify-center bg-white text-slate-500">
            Aucun contenu disponible.
          </div>
        )
      } />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Kiosk */}
      <Route path="/kiosk/:companyId" element={<AttendanceKiosk />} />

      {/* Onboarding / Create Company */}
      <Route path="/onboarding" element={
        isAuthenticated ? (
          <CreateCompanyView onSuccess={() => loadInitialData()} onLogout={logout} />
        ) : <Navigate to="/login" />
      } />

      {/* Admin Dashboard */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminDashboard
            companies={companies}
            activeCompanyId={activeCompanyId}
            onSwitchCompany={handleSwitchCompany}
            onUpdate={handleUpdate}
            onLogout={logout}
            onRefresh={refreshDashboardData}
            onViewSite={() => window.location.href = '/'}
          />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
