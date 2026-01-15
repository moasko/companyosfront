import React from 'react';
import { StockItem, Supplier, StockCategory } from '@/types';
import { Modal, InputField, ImageUpload } from '@/components/admin/shared/AdminShared';
import { Plus, Trash2, Save, Package, Wand2 } from 'lucide-react';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: StockItem | null;
    suppliers: Supplier[];
    categories: StockCategory[];
    onSave: () => void;
    onChange: (product: StockItem) => void;
    onCreateCategory?: (name: string) => void;
    onGenerateBarcode?: () => string;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, suppliers, categories, onSave, onChange, onCreateCategory, onGenerateBarcode }) => {
    if (!product) return null;

    const handleCreateCategory = () => {
        const name = prompt('Nom de la nouvelle catégorie :');
        if (name && onCreateCategory) {
            onCreateCategory({ name });
        }
    };

    const handleGenerateBarcode = () => {
        if (onGenerateBarcode) {
            onChange({ ...product, barcode: onGenerateBarcode() });
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product.id && !product.id.startsWith('new-') ? "Éditer l'article" : "Nouvel article dans l'inventaire"}
            size="lg"
            footer={
                <div className="flex gap-3 justify-end w-full">
                    <button onClick={onClose} className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all">Annuler</button>
                    <button onClick={onSave} className="px-8 py-2 bg-sky-600 text-white font-bold rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-900/10 transition-all flex items-center gap-2">
                        <Save size={18} /> Enregistrer l'article
                    </button>
                </div>
            }>
            <div className="space-y-6">
                <div className="flex gap-6">
                    {/* Image Section */}
                    <div className="w-48">
                        <ImageUpload
                            label="Photo du produit"
                            value={product.imageUrl}
                            onChange={url => onChange({ ...product, imageUrl: url })}
                            helper="JPG/PNG max 5MB"
                        />
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Référence interne" value={product.ref} onChange={v => onChange({ ...product, ref: v })} placeholder="Ex: PRD-001" />
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Code-Barres</label>
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 px-4 py-2 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:border-sky-600 transition-all font-semibold"
                                        value={product.barcode || ''}
                                        onChange={e => onChange({ ...product, barcode: e.target.value })}
                                        placeholder="EAN-13, SKU..."
                                    />
                                    <button onClick={handleGenerateBarcode} title="Générer un code aléatoire" className="p-2 bg-slate-100 rounded-sm hover:bg-slate-200 text-slate-600 border border-slate-200">
                                        <Wand2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <InputField label="Désignation du produit" value={product.name} onChange={v => onChange({ ...product, name: v })} placeholder="Ex: Câble Fibre Optique 50m" />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Marque / Constructeur" value={product.brand || ''} onChange={v => onChange({ ...product, brand: v })} placeholder="Ex: Cisco, Legrand..." />
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catégorie</label>
                                <div className="flex gap-2">
                                    <select
                                        className="flex-1 px-4 py-2 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:border-sky-600 transition-all font-semibold"
                                        value={product.categoryId || ''}
                                        onChange={e => onChange({ ...product, categoryId: e.target.value })}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button onClick={handleCreateCategory} className="p-2 bg-slate-100 rounded-sm hover:bg-slate-200 text-slate-600"><Plus size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fournisseur de référence</label>
                        <select
                            className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:border-sky-600 transition-all font-semibold"
                            value={product.supplierId || ''}
                            onChange={e => onChange({ ...product, supplierId: e.target.value })}
                        >
                            <option value="">Aucun fournisseur lié</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <InputField label="Emplacement magasin" value={product.location} onChange={v => onChange({ ...product, location: v })} placeholder="Ex: Rayon A, Étage 2" />
                </div>

                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    <InputField label="Numéro de Lot / Batch" value={product.batchNumber || ''} onChange={v => onChange({ ...product, batchNumber: v })} placeholder="LOT-2024-001" />
                    <InputField type="date" label="Date de Fabrication" value={product.manufacturingDate || ''} onChange={v => onChange({ ...product, manufacturingDate: v })} />
                    <InputField type="date" label="Date d'Expiration" value={product.expiryDate || ''} onChange={v => onChange({ ...product, expiryDate: v })} />
                </div>

                <div className="grid grid-cols-4 gap-4 bg-slate-50 p-6 rounded-sm border border-slate-100">
                    <InputField type="select" label="Mode de gestion" value={product.type} onChange={v => onChange({ ...product, type: v as any })} options={[{ value: 'Produit', label: 'Produit Stocké' }, { value: 'Service', label: 'Service / Travaux' }]} />
                    <InputField type="number" label="Quantité Actuelle" value={product.quantity} onChange={v => onChange({ ...product, quantity: Number(v) })} disabled={product.type === 'Service'} />
                    <InputField label="Unité" value={product.unit} onChange={v => onChange({ ...product, unit: v })} placeholder="u, m, kg..." />
                    <InputField type="number" label="Alerte Stock Min." value={product.minThreshold} onChange={v => onChange({ ...product, minThreshold: Number(v) })} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <InputField type="number" label="Prix de revient (CFA)" value={product.value} onChange={v => onChange({ ...product, value: Number(v) })} />
                    <InputField type="number" label="Prix de vente (CFA)" value={product.sellingPrice || 0} onChange={v => onChange({ ...product, sellingPrice: Number(v) })} />
                </div>

                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description & Spécifications</label>
                    <textarea
                        className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 transition-all font-semibold"
                        rows={2}
                        value={product.description || ''}
                        onChange={e => onChange({ ...product, description: e.target.value })}
                        placeholder="Détails techniques, dimensions..."
                    />
                </div>
            </div>
        </Modal>
    );
};
