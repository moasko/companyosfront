import React from 'react';
import { Invoice, InvoiceItem, StockItem, CRMContact } from '@/types';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { Plus, Trash2, Save, ShoppingBag, User } from 'lucide-react';

interface InvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    stock: StockItem[];
    contacts: CRMContact[];
    onSave: () => void;
    onChange: (invoice: Invoice) => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ isOpen, onClose, invoice, stock, contacts, onSave, onChange }) => {
    if (!invoice) return null;

    const addItem = () => {
        const newItem: InvoiceItem = { id: 'new-' + Date.now(), description: '', quantity: 1, unitPrice: 0, total: 0 };
        onChange({ ...invoice, items: [...invoice.items, newItem] });
    };

    const removeItem = (idx: number) => {
        const items = [...invoice.items];
        items.splice(idx, 1);
        const totalAmount = items.reduce((acc, i) => acc + i.total, 0);
        onChange({ ...invoice, items, totalAmount });
    };

    const updateItem = (idx: number, field: keyof InvoiceItem, val: any) => {
        const items = [...invoice.items];
        items[idx] = { ...items[idx], [field]: val };

        if (field === 'quantity' || field === 'unitPrice') {
            items[idx].total = Number(items[idx].quantity) * Number(items[idx].unitPrice);
        }

        const totalAmount = items.reduce((acc, i) => acc + i.total, 0);
        onChange({ ...invoice, items, totalAmount });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={invoice.id?.startsWith('new-') ? "Créer une nouvelle facture" : `Modifier la facture ${invoice.reference}`}
            size="xl"
            footer={
                <div className="flex gap-3 justify-end w-full">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all">Annuler</button>
                    <button onClick={onSave} className="px-8 py-2.5 bg-sky-600 text-white font-bold rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-900/20 transition-all flex items-center gap-2">
                        <Save size={18} /> Enregistrer la facture
                    </button>
                </div>
            }>
            <div className="space-y-8">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-sm border border-slate-100">
                    <div className="space-y-1">
                        <InputField label="Référence de facture" value={invoice.reference} onChange={v => onChange({ ...invoice, reference: v })} placeholder="Ex: FACT-2024-001" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <User size={12} className="text-sky-500" /> Client principal
                        </label>
                        <select
                            className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
                            value={invoice.clientId}
                            onChange={e => {
                                const c = contacts.find(x => x.id === e.target.value);
                                onChange({ ...invoice, clientId: e.target.value, clientName: c?.companyName || '' });
                            }}
                        >
                            <option value="">Sélectionner un client...</option>
                            {contacts.map(c => <option key={c.id} value={c.id}>{c.companyName} ({c.contactName})</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <InputField type="select" label="Statut" value={invoice.status} onChange={v => onChange({ ...invoice, status: v as any })} options={[
                            { value: 'Draft', label: 'Brouillon' },
                            { value: 'Sent', label: 'Envoyée' },
                            { value: 'Paid', label: 'Payée' },
                            { value: 'Partially Paid', label: 'Partiellement payée' },
                            { value: 'Overdue', label: 'En retard' },
                            { value: 'Cancelled', label: 'Annulée' }
                        ]} />
                    </div>
                    <InputField type="date" label="Date d'émission" value={invoice.date ? new Date(invoice.date).toISOString().split('T')[0] : ''} onChange={v => onChange({ ...invoice, date: v })} />
                    <InputField type="date" label="Date d'échéance" value={invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : ''} onChange={v => onChange({ ...invoice, dueDate: v })} />
                    <div className="flex items-end">
                        <div className="w-full p-2.5 bg-sky-50 rounded-sm border border-sky-100 text-[10px] text-sky-700 font-medium">
                            La date d'échéance indique la limite de paiement.
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
                            <div className="w-1.5 h-6 bg-sky-600 rounded-full"></div>
                            Détails de la facturation
                        </h4>
                        <button onClick={addItem} className="text-xs bg-white text-sky-600 px-4 py-2 rounded-sm font-bold hover:bg-sky-50 transition-all border border-sky-100 shadow-sm flex items-center gap-2">
                            <Plus size={14} /> Ajouter un élément
                        </button>
                    </div>

                    <div className="border border-slate-200 rounded-sm overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left">Désignation</th>
                                    <th className="px-4 py-4 w-24 text-center">Quantité</th>
                                    <th className="px-6 py-4 w-40 text-right">P.U. (CFA)</th>
                                    <th className="px-6 py-4 w-40 text-right">Montant HT</th>
                                    <th className="px-4 py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
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
                                {invoice.items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-30">
                                                <div className="p-4 bg-slate-100 rounded-full"><Plus size={32} /></div>
                                                <p className="text-sm italic font-medium">Aucun article. Commencez par en ajouter un.</p>
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
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sous-total HT</span>
                                        <span className="font-bold">{invoice.totalAmount.toLocaleString()} CFA</span>
                                    </div>
                                    <div className="flex justify-between items-center opacity-60">
                                        <span className="text-[10px] font-black uppercase tracking-widest">Taxes (TVA 18%)</span>
                                        <span className="font-bold">Incluse</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">TOTAL NET À PAYER</p>
                                            <div className="text-4xl font-black">{invoice.totalAmount.toLocaleString()}</div>
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
