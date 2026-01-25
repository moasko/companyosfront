import React, { useState } from 'react';
import { useAuditLogs, AuditLog } from '../../../../hooks/useAuditLogs';
import {
    History,
    Search,
    Filter,
    User as UserIcon,
    Database,
    Activity,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLogsProps {
    companyId: string;
}

const AuditLogs: React.FC<AuditLogsProps> = ({ companyId }) => {
    const [filters, setFilters] = useState({
        entity: '',
        action: '',
        limit: 100
    });

    const { data: logs, isLoading } = useAuditLogs(companyId, filters);
    const [expandedLog, setExpandedLog] = useState<string | null>(null);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'UPDATE': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'DELETE': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getEntityIcon = (entity: string) => {
        switch (entity) {
            case 'StockItem': return <Database className="w-4 h-4" />;
            case 'Invoice': return <Activity className="w-4 h-4" />;
            default: return <History className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <History className="w-6 h-6 text-indigo-600" />
                        Journaux d'Audit
                    </h2>
                    <p className="text-slate-500 mt-1">
                        Traçabilité complète des modifications de données et actions utilisateurs.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={filters.entity}
                            onChange={(e) => setFilters(f => ({ ...f, entity: e.target.value }))}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none min-w-[160px]"
                        >
                            <option value="">Toutes les entités</option>
                            <option value="StockItem">Articles de Stock</option>
                            <option value="Invoice">Factures</option>
                        </select>
                    </div>

                    <div className="relative">
                        <select
                            value={filters.action}
                            onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                            className="pl-4 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
                        >
                            <option value="">Toutes les actions</option>
                            <option value="CREATE">Création</option>
                            <option value="UPDATE">Modification</option>
                            <option value="DELETE">Suppression</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Heure</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Entité</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID Ressource</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4">
                                            <div className="h-4 bg-slate-100 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : logs?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        Aucun journal d'audit trouvé pour ces critères.
                                    </td>
                                </tr>
                            ) : (
                                logs?.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedLog === log.id ? 'bg-indigo-50/30' : ''}`} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-slate-900">
                                                    {format(new Date(log.createdAt), 'dd MMM yyyy', { locale: fr })}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {format(new Date(log.createdAt), 'HH:mm:ss')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                                        {log.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">{log.user?.name || 'Inconnu'}</div>
                                                        <div className="text-xs text-slate-500">{log.user?.email || '-'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg border text-[11px] font-bold uppercase ${getActionColor(log.action)}`}>
                                                    {log.action === 'CREATE' ? 'Création' : log.action === 'UPDATE' ? 'Édition' : log.action === 'DELETE' ? 'Suppression' : log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    {getEntityIcon(log.entity)}
                                                    {log.entity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-500">
                                                {log.entityId?.slice(-8)}...
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                                                    {expandedLog === log.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedLog === log.id && (
                                            <tr className="bg-slate-50/50">
                                                <td colSpan={6} className="px-8 py-6 border-l-2 border-indigo-500">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Ancien État</h4>
                                                            <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-[300px] overflow-auto shadow-inner">
                                                                {log.oldValue ? (
                                                                    <pre className="text-[11px] font-mono text-slate-600">
                                                                        {JSON.stringify(log.oldValue, null, 2)}
                                                                    </pre>
                                                                ) : (
                                                                    <span className="text-sm text-slate-400 italic">Aucune donnée précédente</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Nouvel État</h4>
                                                            <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-[300px] overflow-auto shadow-inner">
                                                                {log.newValue ? (
                                                                    <pre className="text-[11px] font-mono text-slate-600">
                                                                        {JSON.stringify(log.newValue, null, 2)}
                                                                    </pre>
                                                                ) : (
                                                                    <span className="text-sm text-slate-400 italic">Donnée supprimée</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
                                                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
                                                            <UserIcon className="w-3.5 h-3.5" />
                                                            IP: {log.ipAddress || 'Non définie'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200 max-w-[400px] truncate">
                                                            <Eye className="w-3.5 h-3.5" />
                                                            UserAgent: {log.userAgent || 'Navigateur standard'}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
