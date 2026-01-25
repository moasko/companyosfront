import React, { useState, useEffect } from 'react';
import { SiteContent } from '@/types';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import { useCms } from './hooks/useCms';
import { Save, RefreshCw } from 'lucide-react';

// Editors
import { HeroEditor } from './sections/HeroEditor';
import { PortfolioEditor } from './sections/PortfolioEditor';
// We will import others as we create them or keep them inline for now if time is tight,
// but for cleaner code we should separate them.
// For now, I'll keep the existing inline logic for other sections in this file to avoid breaking them,
// but I will modernize the wrapper and add the Seed button.
import {
  Building2,
  MessageSquare,
  Briefcase,
  Image,
  MapPin,
  BarChart3,
  Globe,
  Plus,
  Trash2,
  List,
} from 'lucide-react';
import { InputField, ImageUpload, Badge } from '@/components/admin/shared/AdminShared';

interface CMSModuleProps {
  section:
    | 'hero'
    | 'about'
    | 'services'
    | 'contact'
    | 'portfolio'
    | 'locations'
    | 'careers'
    | 'stats'
    | 'seo';
  data: SiteContent;
  onUpdate: (data: SiteContent) => void;
}

export const CMSModule: React.FC<CMSModuleProps> = ({ section, data, onUpdate }) => {
  const {
    updateSection,
    seedContent,
    isSeeding,
    content: freshContent,
    isLoading,
  } = useCms(data.id);
  const [localData, setLocalData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local data from fresh content or initial data
  useEffect(() => {
    const sourceData = freshContent || data;
    let sectionData = sourceData[section as keyof SiteContent];

    // Specific handling for portfolio to include clients
    if (section === 'portfolio') {
      sectionData = {
        ...(sectionData as any),
        clients: sourceData.clients || [],
      };
    }

    setLocalData(sectionData);
  }, [section, freshContent, data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSection(section, localData);
      if (freshContent) {
        // Optimistic update wrapper logic needed if we want instant feedback without refetch
        // But react-query invalidation handles it mostly.
        // We call onUpdate to notify parent if needed.
        // Actually, onUpdate prop might be redundant if we use react-query everywhere,
        // but let's keep it for compatibility with the parent dashboard state.
        // However, we can't easily construct the full updated object here without fetching it.
        // We'll rely on useCms hook's invalidateQueries to refresh data.
      }
    } catch (error) {
      console.error('Failed to save CMS section', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeed = async () => {
    if (
      confirm(
        'Attention: Cette action va écraser TOUT le contenu CMS de cette société avec des données de démonstration. Continuer ?',
      )
    ) {
      try {
        await seedContent();
        // The hook invalidates queries, so data should refresh automatically.
      } catch (error) {
        console.error('Seeding failed', error);
      }
    }
  };

  if (!localData || isLoading)
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Chargement de la section...
      </div>
    );

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Éditeur: ${section.charAt(0).toUpperCase() + section.slice(1)}`}
        subtitle="Gérez l'apparence et le contenu public de votre site."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={isSeeding || isSaving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-sm font-bold text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Réinitialiser avec des données de démo"
            >
              <RefreshCw size={14} className={isSeeding ? 'animate-spin' : ''} />
              {isSeeding ? 'Réinit...' : 'Reset Contenu'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-sm font-black transition-all ${isSaving ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-black/10 active:scale-95'}`}
            >
              {isSaving ? (
                <div className="animate-spin h-4 w-4 border-b-2 border-slate-400 rounded-full"></div>
              ) : (
                <Save size={18} />
              )}
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        }
      />

      {/* HERO SECTION */}
      {section === 'hero' && <HeroEditor data={localData} onChange={setLocalData} />}

      {/* ABOUT SECTION */}
      {section === 'about' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-sm border shadow-sm space-y-6">
            <InputField
              label="Titre de la Section À Propos"
              value={localData.title}
              onChange={(v) => setLocalData({ ...localData, title: v })}
            />
            <InputField
              type="textarea"
              label="Texte Présentation"
              value={localData.description}
              onChange={(v) => setLocalData({ ...localData, description: v })}
              rows={6}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-sm border shadow-sm space-y-4">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b pb-2">
                Notre Vision
              </h4>
              <InputField
                type="textarea"
                label=""
                value={localData.vision}
                onChange={(v) => setLocalData({ ...localData, vision: v })}
                rows={4}
              />
            </div>
            <div className="bg-white p-6 rounded-sm border shadow-sm space-y-4">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b pb-2">
                Notre Mission
              </h4>
              <InputField
                type="textarea"
                label=""
                value={localData.mission}
                onChange={(v) => setLocalData({ ...localData, mission: v })}
                rows={4}
              />
            </div>
            <div className="bg-white p-6 rounded-sm border shadow-sm space-y-4">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest border-b pb-2">
                Nos Valeurs
              </h4>
              <InputField
                type="textarea"
                label=""
                value={localData.values}
                onChange={(v) => setLocalData({ ...localData, values: v })}
                rows={4}
                helper="Séparez les valeurs par des virgules"
              />
            </div>
          </div>
        </div>
      )}

      {/* SERVICES SECTION */}
      {section === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-sky-50 p-4 rounded-sm border border-sky-100">
            <p className="text-sky-800 text-sm font-medium">
              Configurez les services que vous proposez à vos clients.
            </p>
            <button
              onClick={() => {
                const title = prompt('Nom du service :');
                if (title)
                  setLocalData([
                    ...localData,
                    { title, description: '', iconName: 'Box', features: [] },
                  ]);
              }}
              className="bg-sky-600 text-white px-4 py-2 rounded-sm text-xs font-black flex items-center gap-2 hover:bg-sky-700"
            >
              <Plus size={14} /> Ajouter un service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {localData.map((service: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-sm border shadow-sm space-y-4 relative group"
              >
                <button
                  onClick={() => {
                    const newList = [...localData];
                    newList.splice(idx, 1);
                    setLocalData(newList);
                  }}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={16} />
                </button>
                <InputField
                  label="Nom du Service"
                  value={service.title}
                  onChange={(v) => {
                    const newList = [...localData];
                    newList[idx].title = v;
                    setLocalData(newList);
                  }}
                />
                <InputField
                  type="textarea"
                  label="Description Courte"
                  value={service.description}
                  onChange={(v) => {
                    const newList = [...localData];
                    newList[idx].description = v;
                    setLocalData(newList);
                  }}
                  rows={3}
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Points clés / Avantages (séparés par ";")
                  </label>
                  <input
                    className="w-full px-4 py-2 rounded-sm border border-slate-200 text-sm font-medium"
                    value={service.features.join('; ')}
                    onChange={(e) => {
                      const newList = [...localData];
                      newList[idx].features = e.target.value
                        .split(';')
                        .map((f) => f.trim())
                        .filter((f) => f);
                      setLocalData(newList);
                    }}
                    placeholder="Innovation; Rapidité; Économie"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTACT SECTION */}
      {section === 'contact' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-sm border shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b pb-4">
              <MessageSquare size={20} className="text-sky-600" />
              COORDONNÉES PUBLIQUES
            </h3>
            <InputField
              label="Adresse Email Standard"
              value={localData.email}
              onChange={(v) => setLocalData({ ...localData, email: v })}
            />
            <InputField
              label="Ligne Téléphonique"
              value={localData.phone}
              onChange={(v) => setLocalData({ ...localData, phone: v })}
            />
            <InputField
              label="Adresse Physique"
              value={localData.address}
              onChange={(v) => setLocalData({ ...localData, address: v })}
            />
            <InputField
              label="Horaires de Bureau"
              value={localData.hours}
              onChange={(v) => setLocalData({ ...localData, hours: v })}
              placeholder="Ex: Lundi - Vendredi, 08h00 - 18h00"
            />
          </div>
        </div>
      )}

      {/* CAREERS SECTION */}
      {section === 'careers' && (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-sm border shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b pb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-sky-600" />
              RECRUTEMENT & CARRIÈRES
            </h3>
            <InputField
              label="Titre Section"
              value={localData.title}
              onChange={(v) => setLocalData({ ...localData, title: v })}
            />
            <InputField
              type="textarea"
              label="Introduction / Pourquoi nous rejoindre ?"
              value={localData.description}
              onChange={(v) => setLocalData({ ...localData, description: v })}
              rows={4}
            />
            <InputField
              label="Email Candidature"
              value={localData.contactEmail}
              onChange={(v) => setLocalData({ ...localData, contactEmail: v })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-black text-slate-800 flex items-center gap-2">
                <List size={18} /> POSTES OUVERTS
              </h4>
              <button
                onClick={() =>
                  setLocalData({
                    ...localData,
                    openings: [
                      ...localData.openings,
                      { title: 'Nouveau Poste', location: 'Siège', type: 'CDI', description: '' },
                    ],
                  })
                }
                className="bg-slate-900 text-white px-4 py-2 rounded-sm text-xs font-black flex items-center gap-2"
              >
                <Plus size={14} /> Ajouter une annonce
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {localData.openings.map((job: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-sm border shadow-sm flex flex-col md:flex-row gap-6 relative group"
                >
                  <button
                    onClick={() => {
                      const newOpenings = [...localData.openings];
                      newOpenings.splice(idx, 1);
                      setLocalData({ ...localData, openings: newOpenings });
                    }}
                    className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="Intitulé"
                        value={job.title}
                        onChange={(v) => {
                          const newOpenings = [...localData.openings];
                          newOpenings[idx].title = v;
                          setLocalData({ ...localData, openings: newOpenings });
                        }}
                      />
                      <InputField
                        label="Lieu"
                        value={job.location}
                        onChange={(v) => {
                          const newOpenings = [...localData.openings];
                          newOpenings[idx].location = v;
                          setLocalData({ ...localData, openings: newOpenings });
                        }}
                      />
                    </div>
                    <InputField
                      type="textarea"
                      label="Résumé / Missions"
                      value={job.description}
                      onChange={(v) => {
                        const newOpenings = [...localData.openings];
                        newOpenings[idx].description = v;
                        setLocalData({ ...localData, openings: newOpenings });
                      }}
                      rows={3}
                    />
                  </div>
                  <div className="w-48 bg-slate-50 p-4 rounded-sm border border-slate-100">
                    <InputField
                      type="select"
                      label="Type Contrat"
                      value={job.type}
                      onChange={(v) => {
                        const newOpenings = [...localData.openings];
                        newOpenings[idx].type = v;
                        setLocalData({ ...localData, openings: newOpenings });
                      }}
                      options={[
                        { value: 'CDI', label: 'CDI' },
                        { value: 'CDD', label: 'CDD' },
                        { value: 'Stage', label: 'Stage' },
                      ]}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STATS SECTION */}
      {section === 'stats' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-sky-600" /> CHIFFRES CLÉS
            </h3>
            <button
              onClick={() => setLocalData([...localData, { label: 'Label', value: '100+' }])}
              className="bg-slate-900 text-white px-4 py-2 rounded-sm text-xs font-black flex items-center gap-2"
            >
              <Plus size={14} /> Ajouter une stat
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {localData.map((stat: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-sm border shadow-sm space-y-4 relative group"
              >
                <button
                  onClick={() => {
                    const newList = [...localData];
                    newList.splice(idx, 1);
                    setLocalData(newList);
                  }}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                <InputField
                  label="Valeur"
                  value={stat.value}
                  onChange={(v) => {
                    const newList = [...localData];
                    newList[idx].value = v;
                    setLocalData(newList);
                  }}
                  placeholder="150+"
                />
                <InputField
                  label="Libellé"
                  value={stat.label}
                  onChange={(v) => {
                    const newList = [...localData];
                    newList[idx].label = v;
                    setLocalData(newList);
                  }}
                  placeholder="Collaborateurs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PORTFOLIO / GALLERY SECTION */}
      {section === 'portfolio' && <PortfolioEditor data={localData} onChange={setLocalData} />}

      {/* LOCATIONS SECTION */}
      {section === 'locations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin size={20} className="text-sky-600" /> IMPLANTATIONS
            </h3>
            <button
              onClick={() =>
                setLocalData([
                  ...localData,
                  { country: '', flag: '🌍', year: '2024', status: 'Office' },
                ])
              }
              className="bg-slate-900 text-white px-4 py-2 rounded-sm text-xs font-black flex items-center gap-2"
            >
              <Plus size={14} /> Ajouter un lieu
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {localData.map((loc: any, idx: number) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-sm border shadow-sm space-y-4 relative group"
              >
                <button
                  onClick={() => {
                    const newList = [...localData];
                    newList.splice(idx, 1);
                    setLocalData(newList);
                  }}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex gap-4">
                  <div className="w-16">
                    <InputField
                      label="Flag"
                      value={loc.flag}
                      onChange={(v) => {
                        const newList = [...localData];
                        newList[idx].flag = v;
                        setLocalData(newList);
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <InputField
                      label="Pays"
                      value={loc.country}
                      onChange={(v) => {
                        const newList = [...localData];
                        newList[idx].country = v;
                        setLocalData(newList);
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Année d'ouverture"
                    value={loc.year}
                    onChange={(v) => {
                      const newList = [...localData];
                      newList[idx].year = v;
                      setLocalData(newList);
                    }}
                  />
                  <InputField
                    label="Statut"
                    value={loc.status}
                    onChange={(v) => {
                      const newList = [...localData];
                      newList[idx].status = v;
                      setLocalData(newList);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO SECTION */}
      {section === 'seo' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-sm border shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 border-b pb-4 flex items-center gap-2">
              <Globe size={20} className="text-sky-600" />
              RÉFÉRENCEMENT (SEO)
            </h3>
            <InputField
              label="Titre Méta (Page Title)"
              value={localData.metaTitle}
              onChange={(v) => setLocalData({ ...localData, metaTitle: v })}
            />
            <InputField
              type="textarea"
              label="Description Méta"
              value={localData.metaDescription}
              onChange={(v) => setLocalData({ ...localData, metaDescription: v })}
              rows={4}
            />
            <InputField
              type="textarea"
              label="Mots-clés (séparés par des virgules)"
              value={localData.metaKeywords}
              onChange={(v) => setLocalData({ ...localData, metaKeywords: v })}
              rows={3}
            />
            <InputField
              label="Image de partage (OG Image URL)"
              value={localData.ogImage || ''}
              onChange={(v) => setLocalData({ ...localData, ogImage: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
};
