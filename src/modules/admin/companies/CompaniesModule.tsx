
import React, { useState } from 'react';
import { SectionHeader, Badge, Modal, InputField, ImageUpload } from '@/components/admin/shared/AdminShared';
import { Building2, Plus, Settings, Globe, Trash2, MapPin, DollarSign, ExternalLink, Users, Package } from 'lucide-react';
import { SiteContent } from '@/types';
import { apiFetch } from '@/lib/api-client';

interface CompaniesModuleProps {
    companies: SiteContent[];
    onUpdate: (newContent: SiteContent) => void;
    onSwitchCompany: (id: string) => void;
}

export const CompaniesModule: React.FC<CompaniesModuleProps> = ({ companies, onUpdate, onSwitchCompany }) => {
    const [isEditing, setIsEditing] = useState<Partial<SiteContent> | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newData, setNewData] = useState({
        entityName: '',
        activity: '',
        sector: 'Services',
        legalForm: 'SARL',
        capital: '',
        manager: '',
        ncc: '',
        rccm: '',
        tvaRate: 18,
        address: '',
        city: '',
        bp: '',
        phone: '',
        email: '',
        country: "Côte d'Ivoire",
        currency: 'Franc CFA (XOF)',
        flag: '🇨🇮',
        slug: '',
        logo: '',
        primaryColor: '#0ea5e9'
    });

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCompanies = companies.filter(c =>
        c.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalEmployees = companies.reduce((acc, c) => acc + (c.erp?.hr?.length || 0), 0);
    const totalStock = companies.reduce((acc, c) => acc + (c.erp?.stock?.length || 0), 0);

    const handleSave = async () => {
        if (!isEditing || !isEditing.id) return;
        try {
            const result = await apiFetch(`/companies/${isEditing.id}`, {
                method: 'PATCH',
                body: JSON.stringify(isEditing)
            });
            onUpdate(result);
            setIsEditing(null);
        } catch (error) {
            console.error("Error updating company", error);
            alert("Erreur lors de la mise à jour de l'entreprise");
        }
    };

    const handleCreate = async () => {
        if (!newData.entityName) return;
        try {
            const result = await apiFetch('/companies', {
                method: 'POST',
                body: JSON.stringify(newData)
            });
            onUpdate(result);
            setIsAdding(false);
            setNewData({
                entityName: '',
                activity: '',
                sector: 'Services',
                legalForm: 'SARL',
                capital: '',
                manager: '',
                ncc: '',
                rccm: '',
                tvaRate: 18,
                address: '',
                city: '',
                bp: '',
                phone: '',
                email: '',
                country: "Côte d'Ivoire",
                currency: 'Franc CFA (XOF)',
                flag: '🇨🇮',
                slug: '',
                logo: '',
                primaryColor: '#0ea5e9'
            });
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la création");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Consortium & Filiales"
                subtitle="Pilotage centralisé du groupe et des unités opérationnelles."
                actions={
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-sm flex items-center gap-2 hover:bg-black transition-all font-black shadow-xl hover:scale-105 active:scale-95"
                    >
                        <Plus size={20} /> Créer une Filiale
                    </button>
                }
            />

            {/* Group Insight Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entités Actives</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-800">{companies.length}</span>
                        <span className="text-[10px] font-bold text-green-600 mb-1.5 flex items-center gap-1 transition-transform group-hover:translate-x-1">Filiales</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Effectif Global</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-800">{totalEmployees}</span>
                        <span className="text-[10px] font-bold text-sky-600 mb-1.5 uppercase">Collaborateurs</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Stocks</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-800">{totalStock}</span>
                        <span className="text-[10px] font-bold text-amber-600 mb-1.5 uppercase">Références</span>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex items-center">
                    <div className="relative w-full">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une filiale..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-sm text-sm font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCompanies.map(company => (
                    <div key={company.id} className="bg-white rounded-sm border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden flex flex-col">
                        <div className="h-2" style={{ backgroundColor: company.primaryColor || '#0ea5e9' }}></div>

                        <div className="p-8 flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 flex items-center justify-center rounded-sm bg-slate-50 border border-slate-100 p-2 shadow-inner group-hover:scale-110 transition-transform">
                                        {company.logo ? (
                                            <img src={company.logo} alt={company.entityName} className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <span className="text-3xl">{company.flag}</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                                                {company.entityName}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge color="slate" className="text-[9px] font-black uppercase tracking-tighter px-2">{company.legalForm}</Badge>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{company.country}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsEditing(company)}
                                    className="p-2 text-slate-300 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                                    title="Configuration"
                                >
                                    <Settings size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <Globe size={14} className="text-slate-400" />
                                    <span>{company.activity || 'Multi-activités'}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50/50 p-3 rounded-sm border border-slate-100 hover:border-sky-100 hover:bg-white transition-all group/stat">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Collaborateurs</p>
                                            <Users size={10} className="text-slate-300 group-hover/stat:text-sky-500" />
                                        </div>
                                        <p className="text-lg font-black text-slate-800">{company.erp?.hr?.length || 0}</p>
                                    </div>
                                    <div className="bg-slate-50/50 p-3 rounded-sm border border-slate-100 hover:border-sky-100 hover:bg-white transition-all group/stat">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventaire</p>
                                            <Package size={10} className="text-slate-300 group-hover/stat:text-sky-500" />
                                        </div>
                                        <p className="text-lg font-black text-slate-800">{company.erp?.stock?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                            <button
                                onClick={() => onSwitchCompany(company.id)}
                                className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-black py-3 rounded-sm transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                            >
                                <Building2 size={16} /> Entrer en Gestion
                            </button>
                            <button
                                onClick={() => window.open(`/${company.slug || company.id}`, '_blank')}
                                className="p-3 border border-slate-200 bg-white text-slate-400 hover:text-sky-600 hover:border-sky-200 rounded-sm transition-all shadow-sm group-hover:shadow-md"
                                title="Voir le site public"
                            >
                                <ExternalLink size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={!!isEditing}
                onClose={() => setIsEditing(null)}
                title="Configuration Complète de l'Entreprise"
                size="xl"
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <button onClick={() => setIsEditing(null)} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all text-xs uppercase tracking-widest">Annuler</button>
                        <button onClick={handleSave} className="px-8 py-2.5 bg-sky-600 text-white font-black rounded-sm hover:bg-sky-700 shadow-xl shadow-sky-600/20 transition-all flex items-center gap-2 text-xs uppercase tracking-widest active:scale-95">
                            Mettre à jour
                        </button>
                    </div>
                }
            >
                {isEditing && (
                    <div className="space-y-8 py-2">
                        {/* Section Identité */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
                                <Building2 size={16} className="text-sky-600" />
                                Identité & Marque
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <InputField label="Dénomination Sociale" value={isEditing.entityName || ''} onChange={v => setIsEditing({ ...isEditing, entityName: v })} />
                                    <InputField label="Activité Principale" value={isEditing.activity || ''} onChange={v => setIsEditing({ ...isEditing, activity: v })} />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secteur d'activité</label>
                                        <select
                                            className="w-full bg-slate-50/50 border-slate-200 px-4 py-2.5 rounded-sm border focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                                            value={isEditing.sector || 'Services'}
                                            onChange={(e) => setIsEditing({ ...isEditing, sector: e.target.value })}
                                        >
                                            <option value="Services">Services aux entreprises</option>
                                            <option value="Technologies">Technologies & Digital</option>
                                            <option value="Commerce">Commerce & Distribution</option>
                                            <option value="Industrie">Industrie & Manufacturier</option>
                                            <option value="BTP">BTP & Construction</option>
                                            <option value="Santé">Santé & Bien-être</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Accent de marque</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#f472b6', '#334155'].map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setIsEditing({ ...isEditing, primaryColor: color })}
                                                    className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 ${isEditing.primaryColor === color ? 'border-sky-600 scale-110' : 'border-white hover:border-slate-200'}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <input
                                                type="color"
                                                value={isEditing.primaryColor || '#0ea5e9'}
                                                onChange={(e) => setIsEditing({ ...isEditing, primaryColor: e.target.value })}
                                                className="w-8 h-8 rounded-full border-2 border-white cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <ImageUpload
                                        label="Logo"
                                        value={isEditing.logo || ''}
                                        onChange={v => setIsEditing({ ...isEditing, logo: v })}
                                    />
                                    <InputField label="URL Slug" value={isEditing.slug || ''} onChange={v => setIsEditing({ ...isEditing, slug: v })} />
                                </div>
                            </div>
                        </div>

                        {/* Section Légal */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
                                <Plus size={16} className="text-sky-600" />
                                Informations Légales & Fiscales
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Forme Juridique</label>
                                    <select
                                        className="w-full bg-slate-50/50 border-slate-200 px-4 py-2.5 rounded-sm border focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                                        value={isEditing.legalForm || 'SARL'}
                                        onChange={(e) => setIsEditing({ ...isEditing, legalForm: e.target.value })}
                                    >
                                        <option value="SARL">SARL</option>
                                        <option value="SA">SA</option>
                                        <option value="SAS">SAS</option>
                                        <option value="ETS">ETS</option>
                                        <option value="Association">Association</option>
                                    </select>
                                </div>
                                <InputField label="Capital Social" value={isEditing.capital || ''} onChange={v => setIsEditing({ ...isEditing, capital: v })} />
                                <InputField label="Gérant / DG" value={isEditing.manager || ''} onChange={v => setIsEditing({ ...isEditing, manager: v })} />
                                <InputField label="Numéro NCC" value={isEditing.ncc || ''} onChange={v => setIsEditing({ ...isEditing, ncc: v })} />
                                <InputField label="Numéro RCCM" value={isEditing.rccm || ''} onChange={v => setIsEditing({ ...isEditing, rccm: v })} />
                                <InputField label="Taux TVA (%)" type="number" value={isEditing.tvaRate?.toString() || '18'} onChange={v => setIsEditing({ ...isEditing, tvaRate: parseFloat(v) })} />
                            </div>
                        </div>

                        {/* Section Localisation */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider pb-2 border-b border-slate-100">
                                <MapPin size={16} className="text-sky-600" />
                                Localisation & Contact
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField label="Adresse" value={isEditing.address || ''} onChange={v => setIsEditing({ ...isEditing, address: v })} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Ville" value={isEditing.city || ''} onChange={v => setIsEditing({ ...isEditing, city: v })} />
                                    <InputField label="Boîte Postale" value={isEditing.bp || ''} onChange={v => setIsEditing({ ...isEditing, bp: v })} />
                                </div>
                                <InputField label="Téléphone" value={isEditing.phone || ''} onChange={v => setIsEditing({ ...isEditing, phone: v })} />
                                <InputField label="Email" type="email" value={isEditing.email || ''} onChange={v => setIsEditing({ ...isEditing, email: v })} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal de création */}
            <Modal
                isOpen={isAdding}
                onClose={() => setIsAdding(false)}
                title="Nouvelle Entreprise / Entité"
                size="lg"
                footer={
                    <div className="flex gap-3 justify-end w-full">
                        <button onClick={() => setIsAdding(false)} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all">Annuler</button>
                        <button onClick={handleCreate} className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-sm hover:bg-black shadow-lg transition-all flex items-center gap-2">
                            Créer l'entité
                        </button>
                    </div>
                }
            >
                <div className="space-y-8 py-2 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                    {/* Identité */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider pb-2 border-b border-slate-100">Identité Visuelle</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Dénomination Sociale *"
                                value={newData.entityName}
                                onChange={v => {
                                    const slug = v.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
                                    setNewData({ ...newData, entityName: v, slug });
                                }}
                            />
                            <InputField label="URL Slug (Auto)" value={newData.slug} onChange={v => setNewData({ ...newData, slug: v })} />
                            <InputField label="Activité" placeholder="Ex: Import-Export" value={newData.activity} onChange={v => setNewData({ ...newData, activity: v })} />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secteur</label>
                                <select
                                    className="w-full bg-slate-50/50 border-slate-200 px-4 py-2.5 rounded-sm border focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                                    value={newData.sector}
                                    onChange={e => setNewData({ ...newData, sector: e.target.value })}
                                >
                                    <option value="Services">Services aux entreprises</option>
                                    <option value="Technologies">Technologies & Digital</option>
                                    <option value="Commerce">Commerce & Distribution</option>
                                    <option value="Industrie">Industrie & Manufacturier</option>
                                    <option value="BTP">BTP & Construction</option>
                                    <option value="Santé">Santé & Bien-être</option>
                                </select>
                            </div>
                        </div>
                        <ImageUpload label="Logo de l'entité" value={newData.logo} onChange={url => setNewData({ ...newData, logo: url })} />
                    </div>

                    {/* Légal & Pays */}
                    <div className="space-y-4 border-t border-slate-100 pt-6">
                        <h4 className="text-slate-800 font-black text-sm uppercase tracking-wider">Configuration Légale & Pays</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pays d'implantation</label>
                                <select
                                    className="w-full bg-slate-50/50 border-slate-200 px-4 py-2.5 rounded-sm border focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                                    value={newData.country}
                                    onChange={e => {
                                        const flags: any = { "Côte d'Ivoire": "🇨🇮", "Sénégal": "🇸🇳", "Burkina Faso": "🇧🇫", "France": "🇫🇷", "Mali": "🇲🇱" };
                                        setNewData({ ...newData, country: e.target.value, flag: flags[e.target.value] || '🌍' });
                                    }}
                                >
                                    <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                    <option value="Sénégal">Sénégal</option>
                                    <option value="Burkina Faso">Burkina Faso</option>
                                    <option value="Mali">Mali</option>
                                    <option value="France">France</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Devise de Tenue de Compte</label>
                                <select
                                    className="w-full bg-slate-50/50 border-slate-200 px-4 py-2.5 rounded-sm border focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                                    value={newData.currency}
                                    onChange={e => setNewData({ ...newData, currency: e.target.value })}
                                >
                                    <option value="Franc CFA (XOF)">Franc CFA (XOF)</option>
                                    <option value="Euro (€)">Euro (€)</option>
                                    <option value="Dollar (USD)">Dollar ($)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Forme Juridique</label>
                                <select
                                    className="w-full bg-slate-50/50 border-slate-200 px-4 py-2.5 rounded-sm border focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 outline-none transition-all font-bold text-slate-700 text-sm shadow-inner"
                                    value={newData.legalForm}
                                    onChange={e => setNewData({ ...newData, legalForm: e.target.value })}
                                >
                                    <option value="SARL">SARL</option>
                                    <option value="SA">SA</option>
                                    <option value="SAS">SAS</option>
                                    <option value="ETS">ETS</option>
                                    <option value="Association">Association</option>
                                </select>
                            </div>
                            <InputField label="Gérant / Représentant" value={newData.manager} onChange={v => setNewData({ ...newData, manager: v })} />
                        </div>
                    </div>

                    <div className="p-4 bg-sky-50 rounded-sm border border-sky-100 flex items-start gap-3">
                        <Globe size={20} className="text-sky-600 mt-1" />
                        <div>
                            <p className="text-xs font-bold text-sky-800">Un nouveau site web sera généré automatiquement.</p>
                            <p className="text-[10px] text-sky-600 font-medium">L'adresse de votre portail sera : enea-group.com/{newData.slug || 'nom-entite'}</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
