import React, { useState, useEffect } from 'react';
import { StockItem, StockMovement } from '@/types';
import { Search, Save, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AdminTable } from '@/components/admin/shared/AdminShared';

interface InventoryReconciliationProps {
    stock: StockItem[];
    companyId: string;
    onSave: (movement: any) => Promise<void>;
    onRefresh: () => void;
}

export const InventoryReconciliation: React.FC<InventoryReconciliationProps> = ({
    stock,
    companyId,
    onSave,
    onRefresh
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    // Map of stockItemId -> realQuantity
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const filteredItems = stock.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode?.includes(searchTerm)
    );

    const handleCountChange = (id: string, value: string) => {
        const num = parseInt(value);
        setCounts(prev => ({
            ...prev,
            [id]: isNaN(num) ? 0 : num
        }));
    };

    const getEcart = (item: StockItem) => {
        const real = counts[item.id] !== undefined ? counts[item.id] : item.quantity;
        return real - item.quantity;
    };

    const hasChanges = Object.keys(counts).some(id => {
        const item = stock.find(s => s.id === id);
        return item && counts[id] !== item.quantity;
    });

    const changedItemsCount = Object.keys(counts).filter(id => {
        const item = stock.find(s => s.id === id);
        return item && counts[id] !== item.quantity;
    }).length;

    const handleSubmit = async () => {
        if (!hasChanges) return;
        if (!confirm(`Voulez-vous valider cet inventaire ? ${changedItemsCount} article(s) seront ajustés.`)) return;

        setIsSubmitting(true);
        try {
            const itemsToAdjust = Object.keys(counts)
                .filter(id => {
                    const item = stock.find(s => s.id === id);
                    return item && counts[id] !== item.quantity;
                })
                .map(id => {
                    const item = stock.find(s => s.id === id)!;
                    return {
                        stockId: item.id,
                        description: `Ajustement Inventaire: ${item.name}`,
                        quantity: counts[id], // NEW TOTAL QUANTITY (as handled by backend 'Inventaire' type)
                        unitPrice: item.value,
                    };
                });

            const movement = {
                type: 'Inventaire',
                reference: `INV-${new Date().toISOString().split('T')[0]}-${Math.floor(Math.random() * 1000)}`,
                date: new Date().toISOString().split('T')[0],
                partnerId: 'SYSTEM',
                partnerName: 'Inventaire Physique',
                status: 'Validé', // We want it validated immediately
                totalValue: itemsToAdjust.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0),
                items: itemsToAdjust
            };

            await onSave(movement);
            setSuccess(true);
            setCounts({});
            setTimeout(() => setSuccess(false), 5000);
            onRefresh();
        } catch (error) {
            console.error(error);
            alert('Erreur lors de la validation de l\'inventaire');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 p-6 rounded-sm border border-slate-800 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                            <RotateCcw size={20} className="text-sky-500" />
                            Session d'Inventaire Physique
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mt-1">
                            Saisissez les quantités réelles constatées en rayon pour ajuster le stock théorique.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Articles à ajuster</p>
                            <p className="text-2xl font-black text-sky-500">{changedItemsCount}</p>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!hasChanges || isSubmitting}
                            className={`flex items-center gap-2 px-8 py-3 rounded-sm font-black uppercase text-xs tracking-widest transition-all ${hasChanges ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-900/40' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? 'Validation...' : 'Valider l\'Inventaire'}
                            <Save size={16} />
                        </button>
                    </div>
                </div>
                <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
                    <RotateCcw size={200} />
                </div>
            </div>

            {success && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm flex items-center gap-3 text-emerald-800 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="text-emerald-500" />
                    <span className="text-sm font-bold">L'inventaire a été validé avec succès. Les stocks ont été mis à jour.</span>
                </div>
            )}

            <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Scannez un code-barres ou recherchez par référence/nom..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-sm text-sm font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <AdminTable
                    headers={['Réf', 'Désignation', 'Localisation', 'Stock Théorique', 'Quantité Réelle', 'Écart']}
                    data={filteredItems}
                    renderRow={(item) => {
                        const theoretical = item.quantity;
                        const real = counts[item.id] !== undefined ? counts[item.id] : theoretical;
                        const ecart = real - theoretical;

                        return (
                            <tr key={item.id} className={`hover:bg-slate-50 transition-colors ${ecart !== 0 ? 'bg-sky-50/30' : ''}`}>
                                <td className="py-4 px-4">
                                    <span className="text-xs font-black text-slate-500">{item.ref}</span>
                                </td>
                                <td className="py-4 px-4 font-bold text-slate-800">{item.name}</td>
                                <td className="py-4 px-4 text-xs font-bold text-slate-400 uppercase">{item.location}</td>
                                <td className="py-4 px-4">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-sm font-mono font-bold">
                                        {theoretical}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <input
                                        type="number"
                                        value={real}
                                        onChange={(e) => handleCountChange(item.id, e.target.value)}
                                        className={`w-24 px-3 py-1.5 border rounded-sm font-mono font-bold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all ${ecart !== 0 ? 'border-sky-500 bg-white' : 'border-slate-200 bg-slate-50'
                                            }`}
                                    />
                                </td>
                                <td className="py-4 px-4">
                                    {ecart !== 0 ? (
                                        <div className={`flex items-center gap-1 font-black ${ecart > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {ecart > 0 ? '+' : ''}{ecart}
                                            <AlertTriangle size={12} />
                                        </div>
                                    ) : (
                                        <span className="text-slate-300">--</span>
                                    )}
                                </td>
                            </tr>
                        );
                    }}
                />
            </div>
        </div>
    );
};
