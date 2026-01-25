import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { SiteContent } from '@/types';
import {
  LogOut,
  LayoutDashboard,
  Briefcase,
  Settings,
  Globe,
  Image,
  Users,
  ExternalLink,
  Home,
  FileText,
  Package,
  Target,
  Truck,
  Calculator,
  ChevronDown,
  Building2,
  MapPin,
  Phone,
  BarChart3,
  CheckSquare,
  TrendingUp,
  Search,
  LifeBuoy
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { StockModule } from '@/modules/admin/stock/StockModule';
import { CRMModule } from '@/modules/admin/crm/CRMModule';
import { FinanceModule } from '@/modules/admin/finance/FinanceModule';
import { HRModule } from '@/modules/admin/hr/HRModule';
import { SettingsModule } from '@/modules/admin/settings/SettingsModule';
import { CMSModule } from '@/modules/admin/cms/CMSModule';
import { CompaniesModule } from '@/modules/admin/companies/CompaniesModule';
import { TasksModule } from '@/modules/admin/tasks/TasksModule';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import { useAuth } from '@/contexts/AuthContext';
import { CommandPalette } from '@/components/admin/shared/CommandPalette';
import { Command } from 'lucide-react';

import { useStock } from '@/modules/admin/stock/hooks/useStock';
import { useCrm } from '@/modules/admin/crm/hooks/useCrm';
import { useFinance } from '@/modules/admin/finance/hooks/useFinance';
import { useHr } from '@/modules/admin/hr/hooks/useHr';
import { Skeleton, DashboardStatsSkeleton } from '@/components/admin/shared/Skeleton';
import { ProfileModule } from '@/modules/admin/profile/ProfileModule';
import { LibraryModule } from '@/modules/admin/library/LibraryModule';
import { BIModule } from '@/modules/admin/bi/BIModule';
import { SupportModule } from '@/modules/admin/support/SupportModule';
import { Library, PieChart as PieIcon, Zap, Bell } from 'lucide-react';
import { NotificationCenter } from '@/components/admin/shared/NotificationCenter';
import { AIAssistant } from '@/components/admin/shared/AIAssistant';
import { useNotifications } from '@/contexts/NotificationContext';
import { ConnectivitySettings } from '@/modules/admin/settings/components/ConnectivitySettings';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

interface AdminDashboardProps {
  companies: SiteContent[];
  activeCompanyId: string;
  onSwitchCompany: (id: string) => void;
  onUpdate: (newContent: SiteContent) => void;
  onLogout: () => void;
  onViewSite: () => void;
  onRefresh: () => void;
}

const NavItem: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  indent?: boolean;
  permission?: string;
  companyId: string;
}> = ({ to, icon, label, indent = false, permission, companyId }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const { checkPermission } = useAuth();

  if (permission && !checkPermission(companyId, permission)) {
    return null;
  }

  return (
    <Link
      to={to}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 border-l-4 ${indent ? 'pl-8' : ''} ${isActive ? 'bg-slate-800 border-sky-500 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
      {React.isValidElement(icon) &&
        React.cloneElement(icon as React.ReactElement<any>, {
          size: 18,
          className: isActive ? 'text-sky-400' : 'text-slate-500',
        })}
      <span>{label}</span>
    </Link>
  );
};

// Component for conditional routing
const GuardedRoute: React.FC<{
  companyId: string;
  permission: string;
  element: React.ReactElement;
}> = ({ companyId, permission, element }) => {
  const { checkPermission } = useAuth();
  if (!checkPermission(companyId, permission)) {
    return <Navigate to="/admin" replace />;
  }
  return element;
};

const AdminOverview: React.FC<{
  activeCompany: SiteContent;
  allCompanies: SiteContent[];
  onRefresh: () => void;
}> = ({ activeCompany, allCompanies, onRefresh }) => {
  const { user } = useAuth();
  const companyId = activeCompany.id;

  // Use the new centralized summary endpoint
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary', companyId],
    queryFn: () => apiFetch(`/erp/${companyId}/dashboard-summary`),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  if (!activeCompany) return null;

  if (isLoading || !summary) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <SectionHeader
          title={`Tableau de Bord - ${activeCompany.entityName}`}
          subtitle="Chargement des indicateurs consolidés..."
        />
        <DashboardStatsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton height={200} />
            <div className="grid grid-cols-2 gap-8">
              <Skeleton height={300} />
              <Skeleton height={300} />
            </div>
          </div>
          <Skeleton height={600} />
        </div>
      </div>
    );
  }

  const isSuperAdmin = user?.globalRole === 'SUPER_ADMIN';
  const { stats, bi } = summary;

  // Prepare chart data from BI stats
  const chartData = bi.trends;
  const distributionData = bi.distribution;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title={
          isSuperAdmin ? 'Console Super Admin' : `Tableau de Bord - ${activeCompany.entityName}`
        }
        subtitle={
          isSuperAdmin
            ? 'Gestion globale de toutes les entités du groupe.'
            : "Vue d'ensemble de l'activité et indicateurs clés."
        }
      />

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isSuperAdmin && (
          <div className="bg-slate-900 text-white p-6 rounded-sm shadow-xl border border-slate-800 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                Total Entités
              </p>
              <h3 className="text-4xl font-black">{allCompanies.length}</h3>
              <div className="mt-4 flex items-center gap-2 text-xs text-sky-400 font-bold">
                <Globe size={14} /> Global Perspective
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe size={100} />
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-sm">
              <Package size={24} />
            </div>
            {stats.stock.lowStockCount > 0 && (
              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full flex gap-1 items-center animate-pulse">
                <Target size={10} /> {stats.stock.lowStockCount} Alerte(s)
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-slate-500 text-sm font-medium">Valeur Stock</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">
              {stats.stock.totalValue.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">CFA</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {stats.stock.itemCount} références
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-sm">
              <Users size={24} />
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {stats.hr.activeEmployees} Actifs
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Ressources Humaines</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {stats.hr.totalEmployees} <span className="text-xs font-normal text-slate-400">Total</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Masse Salariale du mois: {stats.hr.payrollTotal.toLocaleString()} CFA
          </p>
        </div>

        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-sm">
              <BarChart3 size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
              {stats.crm.dealsCount} Affaires
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Pipeline Commercial</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {stats.crm.wonDealsValue.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">CFA (Gagné)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Potentiel: {stats.crm.pendingQuotesValue.toLocaleString()} CFA
          </p>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-sm shadow-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sky-400 text-[10px] font-black uppercase tracking-widest mb-1">Santé Financière</p>
              <h3 className="text-xl font-black">
                {stats.finance.runway === -1 ? 'Stable' : `${stats.finance.runway} mois`}
              </h3>
              <p className="text-slate-500 text-[9px] font-bold uppercase">Estimated Cash Runway</p>
            </div>
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-sm">
              <Calculator size={18} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400">CHARGE FISCALE</span>
              <span className="text-orange-400">{stats.finance.taxLiability.toLocaleString()} CFA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Évolution Business
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold">
                    Volume CA vs Objectifs (6 mois)
                  </p>
                </div>
                <div className="p-2 bg-sky-50 text-sky-600 rounded-sm">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                      }}
                      itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                      formatter={(value) => [`${(Number(value) / 1000000).toFixed(1)} M CFA`]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorCA)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expenses"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">
                Répartition Valeurs
              </h4>
              <div className="h-64 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {distributionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    Profil Profit
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {(bi.summary.profit / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  companies,
  activeCompanyId,
  onSwitchCompany,
  onUpdate,
  onLogout,
  onViewSite,
  onRefresh,
}) => {
  const [isCmsOpen, setIsCmsOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { addNotification, notifications } = useNotifications();

  // Low Stock & Order Check
  const { items: stockItems, purchaseOrders } = useStock(activeCompanyId);

  useEffect(() => {
    if (stockItems && stockItems.length > 0) {
      const lowStockItems = stockItems.filter(i => i.quantity <= (i.minThreshold || 5));
      if (lowStockItems.length > 0) {
        const title = "Alerte Stock Bas";
        const message = `${lowStockItems.length} article(s) sont sous le seuil critique.`;
        const alreadyNotified = notifications.some(n => n.title === title && !n.read);
        if (!alreadyNotified) {
          addNotification({
            title,
            message,
            type: 'warning',
            module: 'stock',
            link: '/admin/stock'
          });
        }
      }

      const expiringItems = stockItems.filter(i =>
        i.expiryDate &&
        new Date(i.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
        new Date(i.expiryDate) >= new Date()
      );
      if (expiringItems.length > 0) {
        const title = "Alerte Péremption";
        const message = `${expiringItems.length} article(s) vont expirer sous 30 jours.`;
        const alreadyNotified = notifications.some(n => n.title === title && !n.read);
        if (!alreadyNotified) {
          addNotification({
            title,
            message,
            type: 'error',
            module: 'stock',
            link: '/admin/stock'
          });
        }
      }

      const overdueOrders = (purchaseOrders || []).filter(o =>
        o.status === 'Ordered' &&
        o.expectedDate &&
        new Date(o.expectedDate) < new Date()
      );
      if (overdueOrders.length > 0) {
        const title = "Retard de Livraison";
        const message = `${overdueOrders.length} commande(s) fournisseur sont en retard.`;
        const alreadyNotified = notifications.some(n => n.title === title && !n.read);
        if (!alreadyNotified) {
          addNotification({
            title,
            message,
            type: 'warning',
            module: 'stock',
            link: '/admin/stock'
          });
        }
      }
    }
  }, [stockItems, purchaseOrders, activeCompanyId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  if (!activeCompany) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100 p-8 text-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Chargement de l'espace...</h2>
          <p className="text-slate-500">
            Si vous n'avez pas d'entreprise, contactez un administrateur.
          </p>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/stock')) return 'Gestion des Stocks';
    if (path.includes('/admin/crm')) return 'CRM & Ventes';
    if (path.includes('/admin/finance')) return 'Finance & Compta';
    if (path.includes('/admin/hr')) return 'Ressources Humaines';
    if (path.includes('/admin/tasks')) return 'Tâches & Projets';
    if (path.includes('/admin/settings')) return 'Paramètres Généraux';
    if (path.includes('/admin/cms')) return 'Éditeur de contenu';
    return 'Tableau de bord';
  };

  const isOwner = user?.ownedCompanies.some((c) => c.id === activeCompanyId);

  return (
    <div className="min-h-screen flex bg-slate-900 font-sans">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="font-bold text-white text-lg tracking-wider">
            Company<span className="text-sky-500">OS</span>
          </span>
        </div>

        {companies.length > 0 && (
          <div className="p-4 border-b border-slate-800">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">
              Société Active
            </label>
            <div className="relative group">
              <button className="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 p-2 rounded-sm border border-slate-700 transition-all text-left">
                <div className="w-10 h-10 rounded-sm bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {activeCompany.logo ? (
                    <img src={activeCompany.logo} alt="" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xl">{activeCompany.flag}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{activeCompany.entityName}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <span>{activeCompany.flag}</span>
                    <span className="truncate">{activeCompany.country}</span>
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>
              {companies.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-sm shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                  {companies.filter((c) => c.id !== activeCompanyId).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => onSwitchCompany(c.id)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-slate-700/50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center overflow-hidden shrink-0 border border-slate-700">
                        {c.logo ? (
                          <img src={c.logo} alt="" className="w-full h-full object-contain p-0.5" />
                        ) : (
                          <span className="text-base">{c.flag}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-200 text-xs truncate">{c.entityName}</p>
                        <p className="text-[9px] text-slate-500">{c.country}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar py-4">
          <NavItem to="/admin" icon={<Home />} label="Vue d'ensemble" companyId={activeCompanyId} />
          {(user?.globalRole === 'SUPER_ADMIN' || user?.ownedCompanies.length! > 0) && (
            <NavItem to="/admin/companies" icon={<Building2 />} label="Mes Sociétés" companyId={activeCompanyId} />
          )}

          <div className="px-4 py-2 mt-4 mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Gestion Opérationnelle</div>
          <NavItem to="/admin/stock" icon={<Package />} label="Stocks & Matériel" companyId={activeCompanyId} permission="stock:read" />
          <NavItem to="/admin/crm" icon={<Target />} label="CRM & Commercial" companyId={activeCompanyId} permission="crm:read" />
          <NavItem to="/admin/finance" icon={<FileText />} label="Finance & Devis" companyId={activeCompanyId} permission="finance:read" />
          <NavItem to="/admin/hr" icon={<Users />} label="Ressources Humaines" companyId={activeCompanyId} permission="hr:read" />
          <NavItem to="/admin/tasks" icon={<CheckSquare />} label="Tâches & Projets" companyId={activeCompanyId} permission="hr:read" />
          <NavItem to="/admin/library" icon={<Library />} label="Bibliothèque (GED)" companyId={activeCompanyId} permission="admin:read" />
          <NavItem to="/admin/bi" icon={<PieIcon />} label="Business Intelligence" companyId={activeCompanyId} permission="admin:read" />
          <NavItem to="/admin/settings" icon={<Settings />} label="Paramètres" companyId={activeCompanyId} />

          <div className="px-4 py-2 mt-4 mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Connectivité & API</div>
          <NavItem to="/admin/webhooks" icon={<Zap />} label="Webhooks & API" companyId={activeCompanyId} permission="admin:read" />

          <div className="px-4 py-2 mt-4 mb-1 text-xs font-bold text-slate-600 uppercase tracking-wider">Gestion du Site Web</div>
          <button onClick={() => setIsCmsOpen(!isCmsOpen)} className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800">
            <div className="flex items-center gap-3">
              <Globe size={18} />
              <span>Éditeur CMS</span>
            </div>
            <ChevronDown size={14} className={`transition-transform ${isCmsOpen ? 'rotate-180' : ''}`} />
          </button>

          {isCmsOpen && (
            <div className="bg-slate-950/50 py-2">
              <NavItem indent to="/admin/cms/hero" icon={<LayoutDashboard />} label="Accueil (Hero)" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/about" icon={<Building2 />} label="À Propos" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/services" icon={<Package />} label="Services" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/portfolio" icon={<Image />} label="Portfolio" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/stats" icon={<BarChart3 />} label="Chiffres Clés" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/locations" icon={<MapPin />} label="Implantations" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/careers" icon={<Briefcase />} label="Recrutement" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/contact" icon={<Phone />} label="Contact & Infos" companyId={activeCompanyId} permission="site:write" />
              <NavItem indent to="/admin/cms/seo" icon={<Globe />} label="Référencement SEO" companyId={activeCompanyId} permission="site:write" />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <button onClick={onViewSite} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-3 w-full px-2 text-sm">
            <ExternalLink size={16} /> Voir le site public
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors w-full px-2 text-sm">
            <LogOut size={16} /> Déconnexion
          </button>
          <div className="mt-4 px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-500 flex items-center justify-between">
            <span>Role: {isOwner ? 'OWNER' : user?.employeeProfiles.find((p) => p.company.id === activeCompanyId)?.role || 'EMPLOYEE'}</span>
            <div className={`w-2 h-2 rounded-full ${isOwner ? 'bg-green-500' : 'bg-blue-500'}`}></div>
          </div>
          <NavItem to="/admin/support" icon={<LifeBuoy />} label="Support & SAV" companyId={activeCompanyId} permission="admin:read" />
        </div>
      </aside>

      <main className="flex-1 ml-64 bg-slate-100 min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 px-8 flex justify-between items-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">{getPageTitle()}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCommandPaletteOpen(true)} className="hidden md:flex items-center gap-6 px-4 py-2 bg-slate-100/50 hover:bg-slate-100 border border-slate-200 rounded-sm text-slate-400 transition-all font-bold text-xs">
              <div className="flex items-center gap-2">
                <Search size={14} />
                <span>Recherche globale...</span>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <Command size={10} />
                <span>K</span>
              </div>
            </button>
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {activeCompany.entityName} ({activeCompany.currency})
            </span>
            <NotificationCenter />
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-sky-500 transition-all focus:outline-none">
                {(user as any)?.avatar ? (
                  <img src={(user as any).avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-sky-600">
                    {user?.name?.substring(0, 1).toUpperCase()}
                  </span>
                )}
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-sm shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/admin/profile" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 font-medium">Mon Profil</Link>
                    <Link to="/employee-portal" onClick={() => setIsProfileOpen(false)} className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-sky-600 font-medium">Portail Employé</Link>
                    <button onClick={() => { onLogout(); setIsProfileOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-medium">Déconnexion</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route index element={<AdminOverview activeCompany={activeCompany} allCompanies={companies} onRefresh={onRefresh} />} />
            <Route path="stock" element={<GuardedRoute companyId={activeCompanyId} permission="stock:read" element={<StockModule companyId={activeCompanyId} />} />} />
            <Route path="crm" element={<GuardedRoute companyId={activeCompanyId} permission="crm:read" element={<CRMModule companyId={activeCompanyId} />} />} />
            <Route path="companies" element={<CompaniesModule companies={companies} onUpdate={onUpdate} onSwitchCompany={onSwitchCompany} />} />
            <Route path="finance" element={<GuardedRoute companyId={activeCompanyId} permission="finance:read" element={<FinanceModule companyId={activeCompanyId} />} />} />
            <Route path="hr" element={<GuardedRoute companyId={activeCompanyId} permission="hr:read" element={<HRModule companyId={activeCompanyId} allCompanies={companies} />} />} />
            <Route path="tasks" element={<GuardedRoute companyId={activeCompanyId} permission="hr:read" element={<TasksModule companyId={activeCompanyId} />} />} />
            <Route path="cms/hero" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="hero" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/about" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="about" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/services" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="services" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/portfolio" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="portfolio" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/stats" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="stats" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/locations" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="locations" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/careers" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="careers" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/contact" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="contact" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="cms/seo" element={<GuardedRoute companyId={activeCompanyId} permission="site:write" element={<CMSModule section="seo" data={activeCompany} onUpdate={onUpdate} />} />} />
            <Route path="settings" element={<SettingsModule companyId={activeCompanyId} />} />
            <Route path="webhooks" element={<ConnectivitySettings companyId={activeCompanyId} />} />
            <Route path="library" element={<LibraryModule companyId={activeCompanyId} />} />
            <Route path="bi" element={<BIModule companyId={activeCompanyId} />} />
            <Route path="support" element={<SupportModule companyId={activeCompanyId} />} />
            <Route path="profile" element={<ProfileModule />} />
          </Routes>
        </div>
      </main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <AIAssistant companyId={activeCompanyId} />
    </div>
  );
};
