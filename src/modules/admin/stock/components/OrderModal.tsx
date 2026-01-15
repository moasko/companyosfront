import React from 'react';
import { PurchaseOrder, PurchaseOrderItem, StockItem, Supplier } from '@/types';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { Plus, Trash2, Save, Link as LinkIcon } from 'lucide-react';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: PurchaseOrder | null;
    stock: StockItem[];
    suppliers: Supplier[];
    onSave: () => void;
    onChange: (order: PurchaseOrder) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ isOpen, onClose, order, stock, suppliers, onSave, onChange }) => {
    if (!order) return null;

    const addItem = () => {
        const newItem: PurchaseOrderItem = { id: 'new-' + Date.now(), description: '', quantity: 1, unitPrice: 0, total: 0 };
        onChange({ ...order, items: [...order.items, newItem] });
    };

    const removeItem = (idx: number) => {
        const items = [...order.items];
        items.splice(idx, 1);
        const totalAmount = items.reduce((acc, i) => acc + i.total, 0);
        onChange({ ...order, items, totalAmount });
    };

    const updateItem = (idx: number, field: keyof PurchaseOrderItem, val: any) => {
        const items = [...order.items];
        items[idx] = { ...items[idx], [field]: val };

        // Auto-fill from stock item
        if (field === 'stockId') {
            const product = stock.find(s => s.id === val);
            if (product) {
                items[idx].description = product.name;
                items[idx].unitPrice = product.value; // Coût d'achat supposé
            }
        }

        if (field === 'quantity' || field === 'unitPrice' || field === 'stockId') {
            items[idx].total = Number(items[idx].quantity) * Number(items[idx].unitPrice);
        }

        const totalAmount = items.reduce((acc, i) => acc + i.total, 0);
        onChange({ ...order, items, totalAmount });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={order.id?.startsWith('new-') ? "Créer une commande fournisseur" : `Modifier la commande ${order.reference}`}
            size="xl"
            footer={
                <div className="flex gap-3 justify-end w-full">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all">Annuler</button>
                    <button onClick={onSave} className="px-8 py-2.5 bg-sky-600 text-white font-bold rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-900/20 transition-all flex items-center gap-2">
                        <Save size={18} /> Enregistrer la commande
                    </button>
                </div>
            }>
            <div className="space-y-8">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-sm border border-slate-100">
                    <div className="space-y-1">
                        <InputField label="Référence Cmd." value={order.reference} onChange={v => onChange({ ...order, reference: v })} placeholder="Ex: PO-2024-001" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            Fournisseur
                        </label>
                        <select
                            className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
                            value={order.supplierId}
                            onChange={e => {
                                const s = suppliers.find(x => x.id === e.target.value);
                                onChange({ ...order, supplierId: e.target.value, supplierName: s?.name || '' });
                            }}
                        >
                            <option value="">Sélectionner un fournisseur...</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.contactName})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <InputField type="select" label="Statut" value={order.status} onChange={v => onChange({ ...order, status: v as any })} options={[
                            { value: 'Draft', label: 'Brouillon' },
                            { value: 'Ordered', label: 'Commandée' },
                            { value: 'Received', label: 'Reçue / Livrée' },
                            { value: 'Cancelled', label: 'Annulée' }
                        ]} />
                    </div>
                    <InputField type="date" label="Date de commande" value={order.date ? new Date(order.date).toISOString().split('T')[0] : ''} onChange={v => onChange({ ...order, date: v })} />
                    <InputField type="date" label="Date prévue de livraison" value={order.expectedDate ? new Date(order.expectedDate).toISOString().split('T')[0] : ''} onChange={v => onChange({ ...order, expectedDate: v })} />
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                            <div className="w-1.5 h-6 bg-sky-600 rounded-full"></div>
                            Articles à commander
                        </h4>
                        <button onClick={addItem} className="text-xs bg-white text-sky-600 px-4 py-2 rounded-sm font-bold hover:bg-sky-50 transition-all border border-sky-100 shadow-sm flex items-center gap-2">
                            <Plus size={14} /> Ajouter un article
                        </button>
                    </div>

                    <div className="border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">Article Stock (Optionnel)</th>
                                    <th className="px-6 py-4 text-left">Désignation</th>
                                    <th className="px-4 py-4 w-24 text-center">Qté</th>
                                    <th className="px-6 py-4 w-40 text-right">P.U. (CFA)</th>
                                    <th className="px-6 py-4 w-40 text-right">Total HT</th>
                                    <th className="px-4 py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {order.items.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 w-48">
                                            <select
                                                className="w-full px-2 py-2 rounded-sm border border-slate-100 text-xs font-semibold outline-none focus:border-sky-500 transition-all"
                                                value={item.stockId || ''}
                                                onChange={e => updateItem(idx, 'stockId', e.target.value)}
                                            >
                                                <option value="">-- Aucun --</option>
                                                {stock.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                className="w-full px-4 py-2 rounded-sm border border-slate-100 text-xs font-medium placeholder:text-slate-300 outline-none bg-slate-50/30 focus:bg-white focus:border-slate-200 transition-all"
                                                placeholder="Description..."
                                                value={item.description}
                                                onChange={e => updateItem(idx, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input type="number" className="w-full p-2.5 border border-slate-200 rounded-sm text-center font-black text-slate-700 outline-none focus:ring-4 focus:ring-sky-500/10 transition-all" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} />
                                        </td>
                                        <td className="p-4">
                                            <div className="relative">
                                                <input type="number" className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-sm text-right font-black text-sky-600 outline-none focus:ring-4 focus:ring-sky-500/10 transition-all" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">CFA</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-black text-slate-900 text-base">
                                                {item.total.toLocaleString()}
                                                <span className="text-[10px] font-normal text-slate-400 ml-1">CFA</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => removeItem(idx)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {order.items.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <div className="p-4 bg-slate-100 rounded-full"><Plus size={32} /></div>
                                                <p className="text-sm italic font-medium">Ajoutez des articles à commander.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
                        <div className="w-full md:w-96 ml-auto">
                            <div className="bg-slate-900 text-white p-8 rounded-sm shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                                <div className="relative z-10 space-y-4">
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-[10px] font-black uppercase tracking-widest">TOTAL A PAYER</span>
                                        <span className="font-bold">{order.totalAmount.toLocaleString()} CFA</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                        <div>
                                            <div className="text-4xl font-black">{order.totalAmount.toLocaleString()}</div>
                                        </div>
                                        <div className="text-sm font-normal opacity-40 pb-1">CFA</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
