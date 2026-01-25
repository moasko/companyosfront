import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import {
    Coins,
    Plus,
    Trash2,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    X,
    Save,
    RotateCcw
} from 'lucide-react';

interface Currency {
    id: string;
    code: string;
    symbol: string;
    name: string;
    rate: number;
    isBase: boolean;
    isActive: boolean;
}

export const FinanceSettings: React.FC<{ companyId: string }> = ({ companyId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
    const queryClient = useQueryClient();

    const { data: currencies = [], isLoading } = useQuery({
        queryKey: ['currencies', companyId],
        queryFn: () => apiFetch(`/erp/${companyId}/currencies`),
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/${companyId}/currencies`, { method: 'POST', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currencies', companyId] });
            setIsModalOpen(false);
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/currencies/${data.id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currencies', companyId] });
            setIsModalOpen(false);
            setEditingCurrency(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiFetch(`/erp/currencies/${id}`, { method: 'DELETE' }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['currencies', companyId] })
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get('code'),
            symbol: formData.get('symbol'),
            name: formData.get('name'),
            rate: parseFloat(formData.get('rate') as string),
            isBase: formData.get('isBase') === 'on',
            isActive: true
        };

        if (editingCurrency) {
            updateMutation.mutate({ ...data, id: editingCurrency.id });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <Coins size={16} className="text-amber-500" /> Gestion Multi-Devises
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Configurez vos devises et taux de change</p>
                    </div>
                    <button
                        onClick={() => { setEditingCurrency(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={14} /> Ajouter une Devise
                    </button>
                </div>

                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Nom</th>
                                <th className="px-6 py-3">Symbole</th>
                                <th className="px-6 py-3">Taux (vs Base)</th>
                                <th className="px-6 py-3">Statut</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currencies.map((curr: Currency) => (
                                <tr key={curr.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-black text-slate-700 text-sm">{curr.code}</td>
                                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{curr.name}</td>
                                    <td className="px-6 py-4 font-mono text-slate-500">{curr.symbol}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono text-sky-600 font-black">{curr.rate.toFixed(4)}</span>
                                            {curr.isBase && <span className="text-[8px] bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded-full font-black uppercase">Base</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${curr.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                            {curr.isActive ? 'Actif' : 'Inactif'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => { setEditingCurrency(curr); setIsModalOpen(true); }}
                                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm"
                                            >
                                                <RefreshCw size={14} />
                                            </button>
                                            {!curr.isBase && (
                                                <button
                                                    onClick={() => { if (confirm('Supprimer cette devise ?')) deleteMutation.mutate(curr.id) }}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-sm shadow-2xl overflow-hidden border border-slate-200">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                                        {editingCurrency ? 'Modifier la Devise' : 'Nouvelle Devise'}
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Configurez les paramètres monétaires</p>
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Code ISO</label>
                                        <input
                                            name="code"
                                            defaultValue={editingCurrency?.code}
                                            required
                                            placeholder="Ex: EUR"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Symbole</label>
                                        <input
                                            name="symbol"
                                            defaultValue={editingCurrency?.symbol}
                                            required
                                            placeholder="Ex: €"
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nom Complet</label>
                                    <input
                                        name="name"
                                        defaultValue={editingCurrency?.name}
                                        required
                                        placeholder="Ex: Euro"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm focus:ring-1 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Taux de Change (vs Devise de Base)</label>
                                    <input
                                        name="rate"
                                        type="number"
                                        step="0.0001"
                                        defaultValue={editingCurrency?.rate || 1.0}
                                        required
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-sm text-sm font-mono focus:ring-1 focus:ring-sky-500 outline-none"
                                    />
                                    <p className="text-[9px] text-slate-400 italic">Si c'est la devise de base, le taux doit être 1.0</p>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative">
                                        <input
                                            name="isBase"
                                            type="checkbox"
                                            defaultChecked={editingCurrency?.isBase}
                                            className="hidden peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-sky-600 transition-colors" />
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5 shadow-sm" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Définir comme Devise de Base</span>
                                </label>
                            </div>
                            <div className="p-6 bg-slate-50 flex gap-4 border-t border-slate-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-[10px] font-black uppercase text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-sm">Annuler</button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-sky-700 disabled:opacity-50 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save size={14} />
                                    {editingCurrency ? 'Mettre à jour' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
