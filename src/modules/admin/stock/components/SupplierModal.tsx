import React from 'react';
import { Supplier } from '@/types';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { Save } from 'lucide-react';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSave: () => void;
  onChange: (supplier: Supplier) => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave,
  onChange,
}) => {
  if (!supplier) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        supplier.id && !supplier.id.startsWith('new-')
          ? 'Éditer le fournisseur'
          : 'Nouveau Fournisseur'
      }
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all"
          >
            Annuler
          </button>
          <button
            onClick={onSave}
            className="px-8 py-2.5 bg-sky-600 text-white font-bold rounded-sm hover:bg-sky-700 shadow-lg shadow-sky-900/20 transition-all flex items-center gap-2"
          >
            <Save size={18} /> Enregistrer le fournisseur
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <InputField
          label="Nom de la Société / Entité"
          value={supplier.name}
          onChange={(v) => onChange({ ...supplier, name: v })}
          placeholder="Ex: SIB, Orange CI, etc."
        />
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Contact Principal"
            value={supplier.contactName}
            onChange={(v) => onChange({ ...supplier, contactName: v })}
            placeholder="Nom d'un interlocuteur"
          />
          <InputField
            label="Secteur / Catégorie"
            value={supplier.category}
            onChange={(v) => onChange({ ...supplier, category: v })}
            placeholder="Ex: Matériel, Services, etc."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Email professionnel"
            value={supplier.email}
            onChange={(v) => onChange({ ...supplier, email: v })}
            placeholder="contact@fournisseur.com"
          />
          <InputField
            label="Téléphone"
            value={supplier.phone}
            onChange={(v) => onChange({ ...supplier, phone: v })}
            placeholder="+225 ..."
          />
        </div>
        <InputField
          type="textarea"
          label="Adresse géographique / Siège"
          value={supplier.address}
          onChange={(v) => onChange({ ...supplier, address: v })}
          rows={3}
          placeholder="Ex: Abidjan, Cocody, Rue des Jardins"
        />
      </div>
    </Modal>
  );
};
