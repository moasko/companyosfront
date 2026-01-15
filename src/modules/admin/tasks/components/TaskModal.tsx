import { Task, Employee, CRMContact, Supplier, StockItem } from '@/types';
import { Modal, InputField, Badge } from '@/components/admin/shared/AdminShared';
import { Save, User, Calendar, AlertCircle, Building2, Package, Truck, Tag, Clock, Hash } from 'lucide-react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    employees: Employee[];
    clients: CRMContact[];
    suppliers: Supplier[];
    products: StockItem[];
    onSave: () => void;
    onChange: (task: Task) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, employees, clients, suppliers, products, onSave, onChange }) => {
    if (!task) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={task.id?.startsWith('new-') ? "Nouvelle Tâche" : "Modifier la tâche"}
            size="lg"
            footer={
                <div className="flex gap-3 justify-end w-full">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all">Annuler</button>
                    <button onClick={onSave} className="px-8 py-2.5 bg-sky-600 text-white font-bold rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-900/20 transition-all flex items-center gap-2">
                        <Save size={18} /> Enregistrer
                    </button>
                </div>
            }>
            <div className="space-y-6">
                <div className="space-y-4">
                    <InputField label="Titre de la tâche" value={task.title} onChange={v => onChange({ ...task, title: v })} placeholder="Ex: Relancer le client X..." autoFocus />

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all min-h-[100px]"
                            placeholder="Détails de la tâche..."
                            value={task.description || ''}
                            onChange={e => onChange({ ...task, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-sm border border-slate-100">
                    <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <User size={12} className="text-sky-500" /> Assigné à
                        </label>
                        <select
                            className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
                            value={task.assignedToId || ''}
                            onChange={e => {
                                const emp = employees.find(x => x.id === e.target.value);
                                onChange({ ...task, assignedToId: e.target.value, assignedToName: emp?.fullName || '' });
                            }}
                        >
                            <option value="">-- Non assigné --</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.fullName} ({e.position})</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5 text-left text-left">
                        <InputField type="date" label="Date limite" value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''} onChange={v => onChange({ ...task, dueDate: v })} />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-orange-500" /> Priorité
                        </label>
                        <div className="flex gap-2">
                            {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => onChange({ ...task, priority: p as any })}
                                    className={`flex-1 py-2 text-xs font-bold rounded-sm border transition-all ${task.priority === p
                                        ? (p === 'Urgent' ? 'bg-red-500 text-white border-red-600' : p === 'High' ? 'bg-orange-500 text-white border-orange-600' : p === 'Medium' ? 'bg-blue-500 text-white border-blue-600' : 'bg-slate-500 text-white border-slate-600')
                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {p === 'Low' ? 'Faible' : p === 'Medium' ? 'Moyenne' : p === 'High' ? 'Haute' : 'Urgente'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5 text-left text-left">
                        <InputField label="Catégorie" value={task.category || ''} onChange={v => onChange({ ...task, category: v })} placeholder="Ex: Support, Bug, Dev..." />
                    </div>
                </div>

                <div className="p-6 bg-white border border-slate-100 rounded-sm space-y-6">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag size={14} className="text-sky-500" /> Tagging & Relations
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5 text-left">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Building2 size={12} className="text-blue-500" /> Client
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                                value={task.clientId || ''}
                                onChange={e => {
                                    const c = clients.find(x => x.id === e.target.value);
                                    onChange({ ...task, clientId: e.target.value, clientName: c?.companyName || c?.contactName || '' });
                                }}
                            >
                                <option value="">-- Aucun client --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.companyName || c.contactName}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Truck size={12} className="text-amber-500" /> Fournisseur
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                                value={task.supplierId || ''}
                                onChange={e => {
                                    const s = suppliers.find(x => x.id === e.target.value);
                                    onChange({ ...task, supplierId: e.target.value, supplierName: s?.name || '' });
                                }}
                            >
                                <option value="">-- Aucun fournisseur --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                <Package size={12} className="text-emerald-500" /> Produit / Stock
                            </label>
                            <select
                                className="w-full px-3 py-2 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                                value={task.productId || ''}
                                onChange={e => {
                                    const p = products.find(x => x.id === e.target.value);
                                    onChange({ ...task, productId: e.target.value, productName: p?.name || '' });
                                }}
                            >
                                <option value="">-- Aucun produit --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.ref})</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-sm border border-slate-100">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={14} className="text-orange-500" /> Suivi Temporel
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField type="date" label="Date début" value={task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''} onChange={v => onChange({ ...task, startDate: v })} />
                            <InputField
                                type="number"
                                label="Heures Est."
                                value={task.estimatedHours || ''}
                                onChange={v => onChange({ ...task, estimatedHours: parseFloat(v) })}
                                placeholder="0.0"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Hash size={14} className="text-sky-500" /> Tags
                        </h3>
                        <InputField
                            label="Tags (séparés par des virgules)"
                            value={task.tags?.join(', ') || ''}
                            onChange={v => onChange({ ...task, tags: v.split(',').map(t => t.trim()).filter(t => t !== '') })}
                            placeholder="urgent, dev, client-x"
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};
