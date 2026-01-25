import React, { useState, useEffect } from 'react';
import { Card, InputField } from '@/components/admin/shared/AdminShared';
import { Save, Building, CreditCard, Globe, Mail, Phone, MapPin, FileImage } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';

interface CompanySettingsProps {
  companyId: string;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ companyId }) => {
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const data = await apiFetch(`/companies/${companyId}`);
        setCompany(data);
      } catch (error) {
        console.error('Failed to fetch company details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [companyId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiFetch(`/companies/${companyId}`, {
        method: 'PATCH',
        body: JSON.stringify(company),
      });
      alert("Informations de l'entreprise mises à jour avec succès.");
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la mise à jour des informations.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return <div className="p-8 text-center text-slate-400">Chargement des informations...</div>;
  if (!company)
    return (
      <div className="p-8 text-center text-red-400">
        Impossible de charger les informations de l'entreprise.
      </div>
    );

  return (
    <div className="space-y-6">
      <Card
        title="Identité de l'Entreprise"
        subtitle="Informations légales et coordonnées affichées sur vos documents"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Logo & Main Info */}
          <div className="space-y-6">
            <div className="flex flex-col items-center p-6 border-2 border-dashed border-slate-200 rounded-lg hover:border-sky-400 transition-colors bg-slate-50">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="h-32 object-contain mb-4" />
              ) : (
                <div className="h-32 w-32 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <FileImage size={40} />
                </div>
              )}
              <button className="text-xs font-bold text-sky-600 hover:underline uppercase tracking-widest">
                Changer le Logo
              </button>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Format PNG ou SVG recommandé. Max 2MB.
              </p>
            </div>

            <InputField
              label="Nom de l'Entreprise"
              value={company.name}
              onChange={(v) => setCompany({ ...company, name: v })}
              placeholder="Ex: ENEA Telecom"
              icon={<Building size={16} />}
            />

            <InputField
              label="Devise Principale"
              value={company.currency}
              onChange={(v) => setCompany({ ...company, currency: v })}
              placeholder="Ex: XOF, EUR, USD"
              icon={<CreditCard size={16} />}
            />
          </div>

          {/* Right Column: Contact & Legal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Téléphone Standard"
                value={company.phone || ''}
                onChange={(v) => setCompany({ ...company, phone: v })}
                placeholder="+221 ..."
                icon={<Phone size={16} />}
              />
              <InputField
                label="Email de Contact"
                value={company.email || ''}
                onChange={(v) => setCompany({ ...company, email: v })}
                type="email"
                placeholder="contact@entreprise.com"
                icon={<Mail size={16} />}
              />
            </div>

            <InputField
              label="Adresse du Siège"
              value={company.address || ''}
              onChange={(v) => setCompany({ ...company, address: v })}
              placeholder="Adresse complète..."
              icon={<MapPin size={16} />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Site Web"
                value={company.website || ''}
                onChange={(v) => setCompany({ ...company, website: v })}
                placeholder="https://..."
                icon={<Globe size={16} />}
              />
              <InputField
                label="Identifiant Fiscal / NINEA"
                value={company.taxId || ''}
                onChange={(v) => setCompany({ ...company, taxId: v })}
                placeholder="NINEA / RC..."
                icon={<Building size={16} />}
              />
            </div>

            <div className="pt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-sky-600 text-white px-8 py-3 rounded-sm font-bold uppercase tracking-wider hover:bg-sky-700 transition-colors flex items-center gap-2 shadow-lg shadow-sky-600/20 active:scale-95 transform duration-150"
              >
                <Save size={18} />
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Gestion Multi-Devises"
        subtitle="Configurez les devises secondaires et les taux de change"
      >
        <div className="space-y-6">
          <div className="p-4 bg-sky-50 border border-sky-100 rounded-sm flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="p-2 bg-white rounded-sm text-sky-600 border border-sky-200">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-sky-900 italic">Devise Active: {company.currency}</p>
                <p className="text-[10px] text-sky-700 uppercase font-black">Toutes les transactions sont converties vers cette devise pivot.</p>
              </div>
            </div>
            <button className="text-xs font-bold text-sky-700 border border-sky-200 px-4 py-2 rounded-sm bg-white hover:bg-sky-100 transition-colors uppercase tracking-widest">
              Ajouter une devise
            </button>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="py-4">Code Devise</th>
                <th className="py-4">Taux (pivot: {company.currency})</th>
                <th className="py-4">Dernière Mise à Jour</th>
                <th className="py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[
                { code: 'EUR', rate: '655.95', date: 'Aujourd\'hui, 09:00' },
                { code: 'USD', rate: '610.12', date: 'Hier, 18:45' }
              ].map(d => (
                <tr key={d.code} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-bold text-slate-800 text-sm">{d.code}</td>
                  <td className="py-4 font-mono text-sm text-slate-600">{d.rate}</td>
                  <td className="py-4 text-xs text-slate-400">{d.date}</td>
                  <td className="py-4 text-right">
                    <button className="text-sky-600 hover:text-sky-800 font-bold text-xs uppercase tracking-widest">Actualiser</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
