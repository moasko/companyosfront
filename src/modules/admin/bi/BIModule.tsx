import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    PieChart as PieIcon,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Calendar,
    Brain,
    Sparkles,
    Zap
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from 'recharts';

const data = [
    { month: 'Jan', revenue: 4500000, expenses: 3200000, profit: 1300000 },
    { month: 'Feb', revenue: 5200000, expenses: 3500000, profit: 1700000 },
    { month: 'Mar', revenue: 4800000, expenses: 3100000, profit: 1700000 },
    { month: 'Apr', revenue: 6100000, expenses: 4200000, profit: 1900000 },
    { month: 'May', revenue: 5500000, expenses: 3800000, profit: 1700000 },
    { month: 'Jun', revenue: 7200000, expenses: 4500000, profit: 2700000 },
];

const categoryData = [
    { name: 'Services', value: 45, color: '#0ea5e9' },
    { name: 'Produits', value: 30, color: '#10b981' },
    { name: 'Maintenance', value: 15, color: '#f59e0b' },
    { name: 'Conseil', value: 10, color: '#6366f1' },
];

export const BIModule: React.FC<{ companyId: string }> = ({ companyId }) => {
    const { data: biData, isLoading } = useQuery({
        queryKey: ['bi-dashboard', companyId],
        queryFn: () => apiFetch(`/erp/${companyId}/bi-dashboard`),
    });

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val.toString();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <BarChart3 size={48} className="text-sky-600 animate-pulse" />
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Génération des insights stratégiques...</p>
            </div>
        );
    }

    const { revenue, expenses, profit, activeDeals, totalInvoices, margin, trends = [], distribution = [] } = biData || {};

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <SectionHeader
                title="Business Intelligence"
                subtitle="Analytique avancée, prévisions et indicateurs de performance en temps réel"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-sm text-xs font-bold text-slate-600">
                        <Calendar size={14} /> Période: Derniers 6 mois
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                    <Download size={14} /> Exporter Rapport PDF
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Chiffre d\'Affaires', value: formatCurrency(revenue), sub: `${totalInvoices} Factures`, icon: <DollarSign />, color: 'sky' },
                    { label: 'Marge Opérationnelle', value: `${margin.toFixed(1)}%`, sub: 'Taux de rentabilité', icon: <TrendingUp />, color: 'emerald' },
                    { label: 'Pipeline CRM', value: activeDeals, sub: 'Opportunités actives', icon: <BarChart3 />, color: 'indigo' },
                    { label: 'Net Profit', value: formatCurrency(profit), sub: 'Après dépenses', icon: <TrendingUp />, color: 'rose' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 bg-slate-50 text-slate-600 rounded-sm group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                                {cloneIcon(kpi.icon, 20)}
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase">Live</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{kpi.value}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue vs Expenses Chart */}
                <div className="bg-white p-8 rounded-sm border border-slate-200 shadow-sm">
                    <div className="mb-8">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <TrendingUp size={16} className="text-sky-500" /> Revenue vs Dépenses
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Analyse des tendances sur 6 mois</p>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}K`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Distribution Chart */}
                <div className="bg-white p-8 rounded-sm border border-slate-200 shadow-sm">
                    <div className="mb-8">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                            <PieIcon size={16} className="text-sky-500" /> Répartition Sectorielle
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">Contribution au chiffre d'affaires</p>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distribution} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} width={80} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '4px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {distribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Strategic Insights */}
            <div className="bg-slate-950 p-8 rounded-sm border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Brain size={120} className="text-sky-500" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-white text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-6">
                        <Sparkles size={18} className="text-sky-400" /> Insights Stratégiques & Prévisions
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/50 p-6 rounded-sm border border-slate-800">
                            <div className="flex items-center gap-2 text-sky-400 mb-3">
                                <TrendingUp size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Optimisation Cash-Flow</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                En fonction de vos tendances actuelles, nous prévoyons une augmentation de <span className="text-white font-bold">+12%</span> du Chiffre d'Affaires au prochain trimestre.
                                <span className="block mt-2 text-sky-300">Recommandation: Réduire les délais de paiement clients de 5 jours.</span>
                            </p>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-sm border border-slate-800">
                            <div className="flex items-center gap-2 text-emerald-400 mb-3">
                                <PieIcon size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Performance Stock</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                Vos 5 articles les plus rentables représentent <span className="text-white font-bold">64% de votre marge</span>.
                                <span className="block mt-2 text-emerald-300">Recommandation: Augmenter les stocks de sécurité sur la catégorie "Réseaux".</span>
                            </p>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-sm border border-slate-800">
                            <div className="flex items-center gap-2 text-amber-400 mb-3">
                                <Zap size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Alerte Efficacité</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                Un léger retard a été détecté sur la conversion des devis vers factures (Moyenne: <span className="text-white font-bold">8 jours</span>).
                                <span className="block mt-2 text-amber-300">Recommandation: Automatiser les relances à J+3.</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

function cloneIcon(icon: React.ReactNode, size: number) {
    if (React.isValidElement(icon)) {
        return React.cloneElement(icon as React.ReactElement<any>, { size });
    }
    return icon;
}
