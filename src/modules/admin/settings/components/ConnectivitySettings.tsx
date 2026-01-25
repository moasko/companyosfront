import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
    Webhook as WebhookIcon,
    Key,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    ShieldCheck,
    Zap,
    X,
    ShieldAlert
} from 'lucide-react';

interface WebhookData {
    id: string;
    url: string;
    events: string[];
    isActive: boolean;
    secret?: string;
}

interface ApiKeyData {
    id: string;
    name: string;
    key: string;
    lastUsedAt?: string;
    createdAt: string;
}

export const ConnectivitySettings: React.FC<{ companyId: string }> = ({ companyId }) => {
    const [activeSubTab, setActiveSubTab] = useState<'WEBHOOKS' | 'API_KEYS' | 'AI_CONFIG'>('WEBHOOKS');
    const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
    const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // --- Forms State ---
    const [newWebhook, setNewWebhook] = useState({ url: '', events: ['stock.low'] });
    const [newApiKey, setNewApiKey] = useState({ name: '' });
    const [createdKey, setCreatedKey] = useState<string | null>(null);

    // --- Queries ---
    const { data: webhooks = [], isLoading: webhooksLoading } = useQuery({
        queryKey: ['webhooks', companyId],
        queryFn: () => apiFetch(`/erp/${companyId}/webhooks`),
    });

    const { data: apiKeys = [], isLoading: apiKeysLoading } = useQuery({
        queryKey: ['apiKeys', companyId],
        queryFn: () => apiFetch(`/erp/${companyId}/api-keys`),
    });

    const [geminiKey, setGeminiKey] = useState('');
    const { data: settings } = useQuery({
        queryKey: ['companySettings', companyId],
        queryFn: () => apiFetch(`/erp/${companyId}/settings`),
    });

    React.useEffect(() => {
        if (settings) {
            setGeminiKey(settings.geminiKey || '');
        }
    }, [settings]);

    // --- Mutations ---
    const createWebhookMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/${companyId}/webhooks`, { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['webhooks', companyId] });
            setIsWebhookModalOpen(false);
            setNewWebhook({ url: '', events: ['stock.low'] });
        },
        onError: (err: any) => alert(`Erreur: ${err.message || 'Impossible de créer le webhook'}`)
    });

    const deleteWebhookMutation = useMutation({
        mutationFn: (id: string) => apiFetch(`/erp/webhooks/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks', companyId] })
    });

    const createApiKeyMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/${companyId}/api-keys`, { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['apiKeys', companyId] });
            setCreatedKey(data.key); // Store the full key to show it once
            setNewApiKey({ name: '' });
        },
        onError: (err: any) => alert(`Erreur: ${err.message || 'Impossible de générer la clé'}`)
    });

    const deleteApiKeyMutation = useMutation({
        mutationFn: (id: string) => apiFetch(`/erp/api-keys/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['apiKeys', companyId] })
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/${companyId}/settings`, { method: 'PATCH', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companySettings', companyId] });
            alert('Paramètres enregistrés avec succès');
        }
    });

    const availableEvents = [
        { id: 'stock.low', label: '📦 Stock Critique' },
        { id: 'stock.reception', label: '🚚 Réception Stock' },
        { id: 'stock.movement', label: '📉 Mouvement de Stock' },
        { id: 'invoice.created', label: '📄 Facture Créée' },
        { id: 'invoice.paid', label: '💰 Facture Payée' },
        { id: 'expense.approved', label: '💳 Dépense Approuvée' },
        { id: 'deal.created', label: '🤝 Nouveau Lead (CRM)' },
        { id: 'deal.won', label: '🏆 Opportunité Gagnée' },
        { id: 'employee.onboarded', label: '👤 Nouvel Employé' },
        { id: 'purchase.order.sent', label: '🛒 Commande Fournisseur' },
    ];

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-4 p-1 bg-slate-100 rounded-sm w-fit">
                <button
                    onClick={() => setActiveSubTab('WEBHOOKS')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'WEBHOOKS' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <WebhookIcon size={14} /> Webhooks
                </button>
                <button
                    onClick={() => setActiveSubTab('API_KEYS')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'API_KEYS' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Key size={14} /> Clés API
                </button>
                <button
                    onClick={() => setActiveSubTab('AI_CONFIG')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all ${activeSubTab === 'AI_CONFIG' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Zap size={14} /> Intelligence Artificielle
                </button>
            </div>

            {activeSubTab === 'WEBHOOKS' && (
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Zap size={16} className="text-sky-500" /> Webhooks Sortants
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Notifiez vos systèmes externes en temps réel</p>
                            </div>
                            <button
                                onClick={() => setIsWebhookModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 active:scale-95"
                            >
                                <Plus size={14} /> Ajouter un Webhook
                            </button>
                        </div>

                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-6 py-3">URL de Destination</th>
                                        <th className="px-6 py-3">Événements</th>
                                        <th className="px-6 py-3">Statut</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {webhooks.map((webhook: WebhookData) => (
                                        <tr key={webhook.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100/50 px-2 py-1 rounded-sm border border-slate-200 w-fit max-w-md truncate">
                                                    {webhook.url}
                                                    <ExternalLink size={12} className="text-slate-300" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="grid grid-cols-2 gap-1.5 w-full max-w-[200px]">
                                                    {webhook.events.map(ev => (
                                                        <span key={ev} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded-sm text-[8px] font-black uppercase border border-slate-100 truncate text-center" title={ev}>
                                                            {ev}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${webhook.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${webhook.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    {webhook.isActive ? 'Actif' : 'Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => { if (confirm('Supprimer ce webhook ?')) deleteWebhookMutation.mutate(webhook.id) }}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {webhooks.length === 0 && !webhooksLoading && (
                                <div className="p-16 text-center bg-slate-50/30">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200">
                                        <WebhookIcon size={32} className="text-slate-300" />
                                    </div>
                                    <h5 className="text-sm font-bold text-slate-600 mb-1">Aucun webhook configuré</h5>
                                    <p className="text-slate-400 text-[11px] font-medium max-w-xs mx-auto">
                                        Connectez l'ERP à vos automatisations externes (Slack, Zapier, Intégromat...) pour des notifications en temps réel.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'API_KEYS' && (
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-amber-500" /> Jetons d'Accès API
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Gérez vos accès programmatiques sécurisés</p>
                            </div>
                            <button
                                onClick={() => {
                                    setCreatedKey(null);
                                    setIsApiKeyModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
                            >
                                <Plus size={14} /> Nouvelle Clé
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {apiKeys.map((key: ApiKeyData) => (
                                    <div key={key.id} className="flex items-center justify-between p-4 border border-slate-100 bg-white rounded-sm hover:border-sky-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-50 text-slate-400 rounded-sm border border-slate-100">
                                                <Key size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{key.name}</p>
                                                <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-100">
                                                    {key.key.substring(0, 8)} • • • • • • • • {key.key.substring(key.key.length - 4)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernière Utilisation</p>
                                                <p className="text-xs font-bold text-slate-600">
                                                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Jamais utilisée'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => { if (confirm('Supprimer cette clé API ?')) deleteApiKeyMutation.mutate(key.id) }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all opacity-0 group-hover:opacity-100"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-sm flex gap-4">
                                <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                                <div className="text-xs text-amber-700 leading-relaxed">
                                    <p className="font-bold mb-1">Attention Sécurité</p>
                                    Les clés API donnent un accès complet à vos données. Ne les partagez jamais et ne les incluez pas dans du code côté client (JS public).
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSubTab === 'AI_CONFIG' && (
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Zap size={16} className="text-sky-500" /> Configuration de l'IA (Gemini)
                                </h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Configurez votre assistant stratégique personnel</p>
                            </div>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="space-y-4 max-w-2xl">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Google Gemini API Key</label>
                                <div className="space-y-4">
                                    <input
                                        type="password"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm font-mono focus:ring-1 focus:ring-sky-500 outline-none"
                                        placeholder="Collez votre clé API Gemini ici..."
                                        value={geminiKey}
                                        onChange={(e) => setGeminiKey(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium">
                                        Cette clé permet à l'IA d'analyser vos données. Vous pouvez obtenir une clé gratuite sur le <a href="https://aistudio.google.com/" target="_blank" className="text-sky-600 hover:underline">Google AI Studio</a>.
                                    </p>
                                </div>
                                <button
                                    onClick={() => updateSettingsMutation.mutate({ geminiKey })}
                                    disabled={updateSettingsMutation.isPending}
                                    className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {updateSettingsMutation.isPending && <RefreshCw size={14} className="animate-spin" />}
                                    {updateSettingsMutation.isPending ? 'Mise à jour...' : 'Sauvegarder la clé'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                                <div className="space-y-3">
                                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-emerald-500" /> Sécurité des données
                                    </h5>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Votre clé API est stockée de manière sécurisée et n'est utilisée que par le serveur pour interroger les modèles Gemini. Vos données ERP ne sont jamais stockées par Google pour l'entraînement.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                        <ExternalLink size={14} className="text-sky-500" /> Fonctionnement
                                    </h5>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Une fois configurée, l'assistant IA (icône bleue en bas de page) pourra répondre à vos questions sur les stocks, les ventes et les performances globales.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Modals --- */}
            {isWebhookModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Configuration Webhook</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Connectez vos flux de données en temps réel</p>
                            </div>
                            <button onClick={() => setIsWebhookModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-8 bg-white max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">URL de Destination (Endpoint)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <Zap size={14} />
                                    </div>
                                    <input
                                        className={`w-full pl-10 pr-4 py-3 border rounded-sm text-sm font-mono focus:outline-none transition-all ${newWebhook.url && !isValidUrl(newWebhook.url) ? 'border-red-300 bg-red-50 focus:ring-red-500' : 'border-slate-200 bg-slate-50/30 focus:ring-1 focus:ring-sky-500'}`}
                                        placeholder="https://api.votre-service.com/hooks"
                                        value={newWebhook.url}
                                        onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                        autoFocus
                                    />
                                    {newWebhook.url && !isValidUrl(newWebhook.url) && (
                                        <div className="flex items-center gap-1.5 mt-2 text-red-500">
                                            <AlertCircle size={12} />
                                            <p className="text-[10px] font-bold uppercase">Format d'URL invalide (http/https requis)</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Abonnement aux Événements</label>
                                    <button
                                        onClick={() => {
                                            const allIds = availableEvents.map(e => e.id);
                                            const isAllSelected = newWebhook.events.length === allIds.length;
                                            setNewWebhook({ ...newWebhook, events: isAllSelected ? [] : allIds });
                                        }}
                                        className="text-[9px] font-black text-sky-600 uppercase hover:underline"
                                    >
                                        {newWebhook.events.length === availableEvents.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {availableEvents.map(ev => (
                                        <label
                                            key={ev.id}
                                            className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-all ${newWebhook.events.includes(ev.id) ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-300 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}
                                        >
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={newWebhook.events.includes(ev.id)}
                                                    onChange={e => {
                                                        const events = e.target.checked
                                                            ? [...newWebhook.events, ev.id]
                                                            : newWebhook.events.filter(x => x !== ev.id);
                                                        setNewWebhook({ ...newWebhook, events });
                                                    }}
                                                />
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${newWebhook.events.includes(ev.id) ? 'bg-sky-600 border-sky-600 scale-110 shadow-md shadow-sky-200' : 'border-slate-300 bg-white'}`}>
                                                    {newWebhook.events.includes(ev.id) && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                                                </div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <span className={`text-[11px] font-black uppercase block transition-colors ${newWebhook.events.includes(ev.id) ? 'text-sky-700' : 'text-slate-700'}`}>
                                                    {ev.label}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-mono tracking-tighter">
                                                    {ev.id}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 flex gap-4 border-t border-slate-100">
                            <button onClick={() => setIsWebhookModalOpen(false)} className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-sm transition-all">Annuler</button>
                            <button
                                onClick={() => createWebhookMutation.mutate(newWebhook)}
                                disabled={!isValidUrl(newWebhook.url) || newWebhook.events.length === 0 || createWebhookMutation.isPending}
                                className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-xl shadow-sky-600/20 active:scale-95 transition-all"
                            >
                                {createWebhookMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} fill="currentColor" />}
                                Activer le Webhook
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isApiKeyModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl overflow-hidden border border-slate-200">
                        {createdKey ? (
                            <div className="p-8 text-center space-y-6 bg-white">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                                    <ShieldCheck size={32} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Clé Générée !</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                        Veuillez copier cette clé maintenant. Pour des raisons de sécurité, elle ne pourra plus être affichée entièrement par la suite.
                                    </p>
                                </div>

                                <div className="relative group">
                                    <div className="w-full font-mono text-sm bg-slate-900 text-sky-400 p-4 rounded-sm border border-slate-700 break-all select-all text-left">
                                        {createdKey}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(createdKey);
                                            alert('Clé copiée !');
                                        }}
                                        className="absolute right-2 top-2 p-2 bg-slate-800 text-slate-400 hover:text-white rounded-sm transition-colors"
                                        title="Copier"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        setIsApiKeyModalOpen(false);
                                        setCreatedKey(null);
                                    }}
                                    className="w-full py-3 bg-slate-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                                >
                                    Fermer & Terminer
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Générer une Clé API</h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Accès programmatique sécurisé</p>
                                    </div>
                                    <button onClick={() => setIsApiKeyModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
                                </div>
                                <div className="p-6 space-y-4 bg-white">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Description / Usage</label>
                                        <input
                                            className="w-full px-4 py-2 border border-slate-200 rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                                            placeholder="Ex: Sync Inventaire PowerBI"
                                            value={newApiKey.name}
                                            onChange={e => setNewApiKey({ name: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-sm border border-amber-100">
                                        <p className="text-[10px] text-amber-700 leading-tight font-medium">
                                            <strong>Note :</strong> La clé sera visible une seule fois après la génération. Préparez-vous à la conserver dans un endroit sûr.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 flex gap-4">
                                    <button onClick={() => setIsApiKeyModalOpen(false)} className="flex-1 px-4 py-2 text-xs font-black uppercase text-slate-500 hover:text-slate-700 border border-slate-200 rounded-sm">Annuler</button>
                                    <button
                                        onClick={() => createApiKeyMutation.mutate(newApiKey)}
                                        disabled={!newApiKey.name || createApiKeyMutation.isPending}
                                        className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        {createApiKeyMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Key size={14} />}
                                        Générer
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
