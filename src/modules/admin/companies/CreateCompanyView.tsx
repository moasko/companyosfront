import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Globe,
  Tag,
  ChevronRight,
  Layout,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { createCompany } from './api/companies.api';
import { ImageUpload, InputField } from '@/components/admin/shared/AdminShared';

interface CreateCompanyViewProps {
  onSuccess: (newCompany: any) => void;
  onLogout: () => void;
}

export const CreateCompanyView: React.FC<CreateCompanyViewProps> = ({ onSuccess, onLogout }) => {
  const [step, setStep] = useState(0); // 0 = Welcome, 1..3 = Form, 4 = Loading/Success
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<number>(0); // Progress of loading steps
  const [formData, setFormData] = useState({
    entityName: '',
    activity: '',
    sector: 'Services',
    country: "Côte d'Ivoire",
    currency: 'Franc CFA (XOF)',
    flag: '🇨🇮',
    slug: '',
    logo: '',
    primaryColor: '#0ea5e9',
    secondaryColor: '#6366f1',
    legalForm: 'SARL',
    capital: '',
    ncc: '',
    rccm: '',
    manager: '',
    tvaRate: 18,
    address: '',
    city: '',
    bp: '',
    phone: '',
    email: '',
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]/g, '');
    setFormData({ ...formData, entityName: name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
    setLoading(true);

    // Simulate loading steps for UX
    const duration = 2500;
    const interval = duration / 4;

    let progress = 0;
    const timer = setInterval(() => {
      progress++;
      setLoadingState(progress);
    }, interval);

    try {
      const result = await createCompany(formData);

      // Wait for animation to finish
      setTimeout(() => {
        clearInterval(timer);
        setLoadingState(4); // Complet
        setTimeout(() => {
          onSuccess(result);
        }, 1000);
      }, duration);
    } catch (err) {
      console.error(err);
      clearInterval(timer);
      setStep(3); // Go back
      setLoading(false);
      alert("Erreur lors de la création de l'entreprise");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black font-sans text-slate-900">
      {/* Step 0: Welcome Splash */}
      {step === 0 && (
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500"></div>
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm text-sky-600">
              <Sparkles size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
              Bienvenue sur ENEA.
            </h1>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed max-w-lg mx-auto">
              Votre plateforme de gestion unifiée est prête. <br />
              Nous allons configurer ensemble votre premier espace de travail numérique.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
              <div className="p-4 bg-slate-50 rounded border border-slate-100">
                <Building2 className="text-sky-500 mb-3" size={24} />
                <h3 className="font-bold text-slate-800 mb-1">ERP Complet</h3>
                <p className="text-xs text-slate-500">
                  Gestion de stock, RH, Finances centralisée.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-slate-100">
                <Globe className="text-indigo-500 mb-3" size={24} />
                <h3 className="font-bold text-slate-800 mb-1">Site Web</h3>
                <p className="text-xs text-slate-500">
                  Votre vitrine en ligne générée automatiquement.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded border border-slate-100">
                <Layout className="text-emerald-500 mb-3" size={24} />
                <h3 className="font-bold text-slate-800 mb-1">Tableau de Bord</h3>
                <p className="text-xs text-slate-500">Une vue à 360° sur votre activité.</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setStep(1)}
                className="w-full bg-slate-900 text-white py-4 rounded font-bold text-sm uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Commencer la création <ArrowRight size={18} />
              </button>
              <button
                onClick={onLogout}
                className="text-slate-400 text-xs font-bold hover:text-slate-600 uppercase tracking-widest"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Steps 1-3: Wizard Form */}
      {step >= 1 && step <= 3 && (
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 h-[85vh]">
          {/* Sidebar Progress */}
          <div className="lg:col-span-4 bg-slate-50 border-r border-slate-100 p-8 flex flex-col">
            <div className="mb-10">
              <span className="text-sky-600 font-black text-2xl tracking-tight">ENEA</span>
              <span className="text-slate-400 text-xs ml-2 uppercase font-bold tracking-widest">
                Setup
              </span>
            </div>

            <div className="flex-1 space-y-8">
              {[
                { id: 1, title: 'Identité', desc: 'Qui êtes-vous ?', icon: Building2 },
                { id: 2, title: 'Juridique', desc: 'Structure légale', icon: Tag },
                { id: 3, title: 'Contact', desc: 'Où vous trouver ?', icon: Globe },
              ].map((s) => (
                <div
                  key={s.id}
                  className={`flex items-start gap-4 transition-all duration-300 ${step === s.id ? 'opacity-100 translate-x-2' : step > s.id ? 'opacity-50' : 'opacity-30'}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${step > s.id ? 'bg-green-500 border-green-500 text-white' : step === s.id ? 'bg-white border-sky-600 text-sky-600 shadow-lg shadow-sky-100' : 'bg-transparent border-slate-300 text-slate-300'}`}
                  >
                    {step > s.id ? <Check size={18} strokeWidth={4} /> : <s.icon size={18} />}
                  </div>
                  <div className="pt-1">
                    <h4
                      className={`font-bold text-sm ${step === s.id ? 'text-sky-900' : 'text-slate-600'}`}
                    >
                      {s.title}
                    </h4>
                    <p className="text-xs text-slate-400">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto">
              <button
                onClick={onLogout}
                className="text-xs text-slate-400 font-bold hover:text-red-500 transition-colors flex items-center gap-2"
              >
                <ArrowRight className="rotate-180" size={12} /> Abandonner
              </button>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-8 p-12 overflow-y-auto custom-scrollbar bg-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-9xl text-slate-900 select-none pointer-events-none">
              {step}
            </div>

            <div className="max-w-2xl mx-auto h-full flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-800 mb-2">
                  {step === 1 && 'Créons votre identité.'}
                  {step === 2 && 'Détails Administratifs.'}
                  {step === 3 && 'Dernières touches.'}
                </h2>
                <p className="text-slate-500">
                  {step === 1 && 'Le nom et le style de votre entreprise définissent votre image.'}
                  {step === 2 && 'Ces informations apparaîtront sur vos factures et documents.'}
                  {step === 3 && 'Indiquez comment vos clients peuvent vous joindre.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                    <InputField
                      label="Nom de l'entreprise"
                      placeholder="Ex: StartUp Innovante SA"
                      value={formData.entityName}
                      onChange={handleNameChange}
                      autoFocus
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                          Secteur
                        </label>
                        <select
                          className="w-full bg-slate-50 border-slate-200 px-4 py-3 rounded border focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 text-sm"
                          value={formData.sector}
                          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        >
                          <option value="Services">Services</option>
                          <option value="Technologies">Technologies IT</option>
                          <option value="Commerce">Commerce & Vente</option>
                          <option value="Industrie">Industrie</option>
                          <option value="BTP">Construction & BTP</option>
                          <option value="Santé">Santé & Médical</option>
                          <option value="Transport">Logistique & Transport</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                      <InputField
                        label="Activité (Slogan court)"
                        placeholder="Ex: Solutions Digitales"
                        value={formData.activity}
                        onChange={(v) => setFormData({ ...formData, activity: v })}
                      />
                    </div>

                    <div className="p-4 bg-sky-50 rounded border border-sky-100 flex items-start gap-3">
                      <Globe className="text-sky-600 shrink-0 mt-1" size={20} />
                      <div>
                        <p className="text-sm font-bold text-sky-900">Adresse Web Automatique</p>
                        <p className="text-xs text-sky-700 mt-1 mb-2">
                          Votre site sera accessible via ce lien unique.
                        </p>
                        <div className="flex items-center bg-white rounded border border-sky-200 px-3 py-2">
                          <span className="text-slate-400 font-mono text-sm">enea.app/</span>
                          <input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="font-bold text-sky-600 font-mono text-sm outline-none w-full bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => formData.entityName && setStep(2)}
                      type="button"
                      className="w-full bg-slate-900 text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-black transition-all flex justify-between px-6 items-center group"
                    >
                      Suivant{' '}
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                          Forme Juridique
                        </label>
                        <select
                          className="w-full bg-slate-50 border-slate-200 px-4 py-3 rounded border focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 text-sm"
                          value={formData.legalForm}
                          onChange={(e) => setFormData({ ...formData, legalForm: e.target.value })}
                        >
                          <option value="SARL">SARL</option>
                          <option value="SAS">SAS</option>
                          <option value="SA">SA</option>
                          <option value="ETS">Entreprise Individuelle</option>
                          <option value="ONG">ONG / Association</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                          Pays
                        </label>
                        <select
                          className="w-full bg-slate-50 border-slate-200 px-4 py-3 rounded border focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-medium text-slate-700 text-sm"
                          value={formData.country}
                          onChange={(e) => {
                            const flags: any = {
                              "Côte d'Ivoire": '🇨🇮',
                              Sénégal: '🇸🇳',
                              'Burkina Faso': '🇧🇫',
                              France: '🇫🇷',
                              Mali: '🇲🇱',
                              Cameroun: '🇨🇲',
                            };
                            setFormData({
                              ...formData,
                              country: e.target.value,
                              flag: flags[e.target.value] || '🌍',
                            });
                          }}
                        >
                          <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                          <option value="Sénégal">Sénégal</option>
                          <option value="Mali">Mali</option>
                          <option value="Burkina Faso">Burkina Faso</option>
                          <option value="Cameroun">Cameroun</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                    </div>

                    <InputField
                      label="Gérant / Directeur Général"
                      value={formData.manager}
                      onChange={(v) => setFormData({ ...formData, manager: v })}
                      placeholder="Nom complet du responsable"
                    />

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                      <InputField
                        label="Numéro NCC"
                        value={formData.ncc}
                        onChange={(v) => setFormData({ ...formData, ncc: v })}
                        placeholder="Facultatif"
                      />
                      <InputField
                        label="Numéro RCCM"
                        value={formData.rccm}
                        onChange={(v) => setFormData({ ...formData, rccm: v })}
                        placeholder="Facultatif"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setStep(1)}
                        type="button"
                        className="px-6 py-4 rounded text-slate-500 font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                      >
                        Retour
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        type="button"
                        className="flex-1 bg-slate-900 text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-black transition-all flex justify-between px-6 items-center group"
                      >
                        Suivant{' '}
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <InputField
                        label="Email Contact"
                        value={formData.email}
                        onChange={(v) => setFormData({ ...formData, email: v })}
                        type="email"
                        placeholder="contact@..."
                      />
                      <InputField
                        label="Téléphone"
                        value={formData.phone}
                        onChange={(v) => setFormData({ ...formData, phone: v })}
                        placeholder="+XXX XX XX XX XX"
                      />
                    </div>

                    <InputField
                      label="Adresse Postale"
                      value={formData.address}
                      onChange={(v) => setFormData({ ...formData, address: v })}
                      placeholder="Ville, Quartier, Rue..."
                    />

                    <div className="space-y-3 pt-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Couleur Principale
                      </label>
                      <div className="flex gap-3">
                        {[
                          '#0ea5e9',
                          '#6366f1',
                          '#8b5cf6',
                          '#ec4899',
                          '#ef4444',
                          '#f59e0b',
                          '#10b981',
                          '#1e293b',
                        ].map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, primaryColor: color })}
                            className={`w-8 h-8 rounded-full transition-all ${formData.primaryColor === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={() => setStep(2)}
                        type="button"
                        className="px-6 py-4 rounded text-slate-500 font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors"
                      >
                        Retour
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-green-700 transition-all flex justify-center gap-3 items-center shadow-lg shadow-green-200"
                      >
                        <Check size={20} /> Créer mon espace
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Loading / Success Construction Screen */}
      {step === 4 && (
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-12 text-center animate-in zoom-in-95 duration-500">
          <div className="relative w-24 h-24 mx-auto mb-8">
            {loadingState < 4 && (
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
            )}
            {loadingState < 4 && (
              <div className="absolute inset-0 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {loadingState === 4 && (
              <div className="absolute inset-0 bg-green-100 rounded-full flex items-center justify-center animate-in zoom-in duration-300 text-green-600">
                <Check size={48} strokeWidth={4} />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black text-slate-800 mb-2">
            {loadingState < 4 ? 'Construction en cours...' : 'Tout est prêt !'}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Nous préparons votre environnement sécurisé.
          </p>

          <div className="space-y-4 text-left max-w-xs mx-auto">
            <div
              className={`flex items-center gap-3 transition-all duration-500 ${loadingState >= 1 ? 'opacity-100' : 'opacity-30'}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingState >= 1 ? 'bg-green-500 text-white' : 'bg-slate-200'}`}
              >
                {loadingState >= 1 && <Check size={12} />}
              </div>
              <span className="text-sm font-medium text-slate-700">
                Création de la base de données
              </span>
            </div>
            <div
              className={`flex items-center gap-3 transition-all duration-500 delay-100 ${loadingState >= 2 ? 'opacity-100' : 'opacity-30'}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingState >= 2 ? 'bg-green-500 text-white' : 'bg-slate-200'}`}
              >
                {loadingState >= 2 && <Check size={12} />}
              </div>
              <span className="text-sm font-medium text-slate-700">Configuration des modules</span>
            </div>
            <div
              className={`flex items-center gap-3 transition-all duration-500 delay-200 ${loadingState >= 3 ? 'opacity-100' : 'opacity-30'}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingState >= 3 ? 'bg-green-500 text-white' : 'bg-slate-200'}`}
              >
                {loadingState >= 3 && <Check size={12} />}
              </div>
              <span className="text-sm font-medium text-slate-700">Génération du site web</span>
            </div>
            <div
              className={`flex items-center gap-3 transition-all duration-500 delay-300 ${loadingState >= 4 ? 'opacity-100' : 'opacity-30'}`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${loadingState >= 4 ? 'bg-green-500 text-white' : 'bg-slate-200'}`}
              >
                {loadingState >= 4 && <Check size={12} />}
              </div>
              <span className="text-sm font-medium text-slate-700">
                Initialisation des données exemples
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
