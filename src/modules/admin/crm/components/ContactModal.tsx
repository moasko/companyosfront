import React from 'react';
import { CRMContact } from '@/types';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { Save, User, Building, Phone, Mail, MapPin } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: CRMContact | null;
  onSave: () => void;
  onChange: (contact: CRMContact) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  contact,
  onSave,
  onChange,
}) => {
  if (!contact) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        contact.id?.startsWith('new-') ? 'Nouveau CRM Contact' : `Profil de ${contact.companyName}`
      }
      size="lg"
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
            <Save size={18} /> Enregistrer le contact
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nom de l'Entreprise"
            value={contact.companyName}
            onChange={(v) => onChange({ ...contact, companyName: v })}
            placeholder="Ex: ENEA Telecom"
          />
          <InputField
            label="Nom du Contact"
            value={contact.contactName}
            onChange={(v) => onChange({ ...contact, contactName: v })}
            placeholder="Ex: M. Kouadio"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Email"
            type="email"
            value={contact.email}
            onChange={(v) => onChange({ ...contact, email: v })}
            placeholder="contact@entreprise.com"
          />
          <InputField
            label="Téléphone"
            value={contact.phone}
            onChange={(v) => onChange({ ...contact, phone: v })}
            placeholder="+225 ..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Type de relation"
            type="select"
            value={contact.type}
            onChange={(v) => onChange({ ...contact, type: v as any })}
            options={[
              { value: 'Prospect', label: 'Prospect (Lead)' },
              { value: 'Client', label: 'Client' },
              { value: 'Partenaire', label: 'Partenaire' },
            ]}
          />
          <InputField
            label="Statut"
            type="select"
            value={contact.status}
            onChange={(v) => onChange({ ...contact, status: v as any })}
            options={[
              { value: 'Actif', label: 'Compte Actif' },
              { value: 'Lead', label: 'En attente' },
              { value: 'Inactif', label: 'Inactif' },
            ]}
          />
        </div>

        <InputField
          label="Secteur d'activité"
          value={contact.industry || ''}
          onChange={(v) => onChange({ ...contact, industry: v })}
          placeholder="Ex: Télécoms, BTP, Finance..."
        />
        <InputField
          label="Adresse complète"
          type="textarea"
          value={contact.address || ''}
          onChange={(v) => onChange({ ...contact, address: v })}
          rows={2}
          placeholder="Siège social, Ville, Rue..."
        />
        <InputField
          label="Notes & Observations"
          type="textarea"
          value={contact.notes || ''}
          onChange={(v) => onChange({ ...contact, notes: v })}
          rows={3}
          placeholder="Détails supplémentaires sur le client..."
        />
      </div>
    </Modal>
  );
};
