
import React from 'react';
import { CRMDeal, CRMContact } from '@/types';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { Save, Target, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface DealModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: CRMDeal | null;
    contacts: CRMContact[];
    onSave: () => void;
    onChange: (deal: CRMDeal) => void;
}

export const DealModal: React.FC<DealModalProps> = ({ isOpen, onClose, deal, contacts, onSave, onChange }) => {
    if (!deal) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={deal.id?.startsWith('new-') ? "Nouvelle Opportunité" : `Opportunité : ${deal.title}`}
            size="lg"
            footer={
                <div className="flex gap-3 justify-end w-full">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all">Annuler</button>
                    <button onClick={onSave} className="px-8 py-2.5 bg-sky-600 text-white font-bold rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-900/20 transition-all flex items-center gap-2">
                        <Save size={18} /> Enregistrer l'opportunité
                    </button>
                </div>
            }>
            <div className="space-y-6">
                <InputField label="Titre de l'opportunité" value={deal.title} onChange={v => onChange({ ...deal, title: v })} placeholder="Ex: Contrat Fibre Plateau, Maintenance Annuelle..." />

                <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Client associé</label>
                    <select
                        className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
                        value={deal.contactId}
                        onChange={e => onChange({ ...deal, contactId: e.target.value })}
                    >
                        <option value="">Sélectionner un client...</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.companyName} ({c.contactName})</option>)}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Valeur estimée (CFA)" type="number" value={deal.amount} onChange={v => onChange({ ...deal, amount: Number(v) })} />
                    <InputField label="Probabilité de succès (%)" type="number" value={deal.probability} onChange={v => onChange({ ...deal, probability: Number(v) })} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Étape de vente" type="select" value={deal.stage} onChange={v => onChange({ ...deal, stage: v as any })} options={[
                        { value: 'Nouveau', label: '1. Nouveau / Lead' },
                        { value: 'Qualification', label: '2. Qualification' },
                        { value: 'Proposition', label: '3. Proposition' },
                        { value: 'Négociation', label: '4. Négociation' },
                        { value: 'Gagné', label: '5. GAGNÉ' },
                        { value: 'Perdu', label: '6. PERDU' }
                    ]} />
                    <InputField label="Date de clôture estimée" type="date" value={deal.closingDate ? new Date(deal.closingDate).toISOString().split('T')[0] : ''} onChange={v => onChange({ ...deal, closingDate: v })} />
                </div>
            </div>
        </Modal>
    );
};
