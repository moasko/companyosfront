
import React, { useState } from 'react';
import { SectionHeader, InputField, Badge } from '@/components/admin/shared/AdminShared';
import { Plus, Users, Target, Settings, Trash2, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useCrm } from './hooks/useCrm';
import { CRMContact, CRMDeal } from '@/types';

// Components
import { ContactModal } from './components/ContactModal';
import { DealModal } from './components/DealModal';
import { DataTable } from '@/components/admin/shared/DataTable';
import { Skeleton, TableRowSkeleton } from '@/components/admin/shared/Skeleton';

interface CRMModuleProps {
    companyId: string;
}

export const CRMModule: React.FC<CRMModuleProps> = ({ companyId }) => {
    const { contacts, deals, isLoading, createContact, updateContact, deleteContact, createDeal, updateDeal, deleteDeal } = useCrm(companyId);

    // États
    const [activeTab, setActiveTab] = useState<'contacts' | 'deals'>('contacts');
    const [editingContact, setEditingContact] = useState<CRMContact | null>(null);
    const [editingDeal, setEditingDeal] = useState<CRMDeal | null>(null);

    // --- Logic Contacts ---
    const saveContact = () => {
        if (!editingContact) return;
        if (editingContact.id.startsWith('new-')) {
            const { id, ...data } = editingContact;
            createContact(data);
        } else {
            updateContact(editingContact);
        }
        setEditingContact(null);
    };

    // --- Logic Deals ---
    const saveDeal = () => {
        if (!editingDeal) return;
        if (editingDeal.id.startsWith('new-')) {
            const { id, ...data } = editingDeal;
            createDeal(data);
        } else {
            updateDeal(editingDeal);
        }
        setEditingDeal(null);
    };

    if (isLoading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Skeleton width={300} height={40} />
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton width={200} height={24} />
                    <Skeleton width={300} height={16} />
                </div>
                <Skeleton width={150} height={40} />
            </div>
            <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-4 space-y-4">
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
                <TableRowSkeleton columns={5} />
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* --- TABS --- */}
            <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-sm w-fit border border-slate-200">
                <button
                    onClick={() => setActiveTab('contacts')}
                    className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-sm transition-all ${activeTab === 'contacts' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Users size={16} /> Contacts & Clients
                </button>
                <button
                    onClick={() => setActiveTab('deals')}
                    className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-sm transition-all ${activeTab === 'deals' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Target size={16} /> Pipeline de Ventes
                </button>
            </div>

            {activeTab === 'contacts' ? (
                <>
                    <SectionHeader title="Base de Contacts" subtitle="Gérez vos relations clients et prospects." actions={
                        <button onClick={() => setEditingContact({
                            id: 'new-' + Date.now(),
                            contactName: '',
                            company: '',
                            email: '',
                            phone: '',
                            status: 'Actif',
                            type: 'Client',
                            lastContact: new Date().toISOString()
                        } as any)} className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold">
                            <Plus size={18} /> Nouveau Client
                        </button>
                    } />

                    <DataTable<CRMContact>
                        data={contacts}
                        searchPlaceholder="Rechercher un client, une société ou un email..."
                        searchKeys={['companyName', 'contactName', 'email']}
                        columns={[
                            {
                                header: 'Société & Contact',
                                accessor: (c) => (
                                    <div className="py-1">
                                        <div className="font-bold text-slate-800 text-base">{c.companyName}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                                            <span className="font-bold text-slate-600">{c.contactName}</span>
                                            <span>•</span>
                                            <span>{c.email}</span>
                                        </div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Secteur',
                                accessor: (c) => (
                                    <span className="text-[10px] py-0.5 px-2 bg-slate-100 rounded inline-block text-slate-500 font-black uppercase tracking-tight border border-slate-200/50">
                                        {c.industry || 'Non défini'}
                                    </span>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Type',
                                accessor: (c) => <Badge color={c.type === 'Client' ? 'blue' : c.type === 'Prospect' ? 'purple' : 'slate'}>{c.type}</Badge>,
                                sortable: true
                            },
                            {
                                header: 'Statut',
                                accessor: (c) => <Badge color={c.status === 'Actif' ? 'green' : c.status === 'Lead' ? 'amber' : 'slate'}>{c.status}</Badge>,
                                sortable: true
                            }
                        ]}
                        actions={(c) => (
                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingContact(c)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"><Settings size={18} /></button>
                                <button onClick={() => { if (confirm('Supprimer ce contact ?')) deleteContact(c.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"><Trash2 size={18} /></button>
                            </div>
                        )}
                        onRowClick={(c) => setEditingContact(c)}
                    />
                </>
            ) : (
                <>
                    <SectionHeader title="Pipeline Commercial" subtitle="Suivez vos opportunités en cours et vos ventes." actions={
                        <button onClick={() => setEditingDeal({
                            id: 'new-' + Date.now(),
                            title: '',
                            contactId: '',
                            amount: 0,
                            stage: 'Nouveau',
                            probability: 50,
                            closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                        } as any)} className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold">
                            <Plus size={18} /> Nouvelle Opportunité
                        </button>
                    } />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {['Nouveau', 'Proposition', 'Négociation', 'Gagné'].map(stage => {
                            const stageDeals = deals.filter(d => d.stage === stage);
                            const total = stageDeals.reduce((acc, d) => acc + d.amount, 0);
                            return (
                                <div key={stage} className="bg-white p-5 rounded-sm border border-slate-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <Badge color={stage === 'Gagné' ? 'green' : 'blue'}>{stage}</Badge>
                                        <span className="text-xs font-bold text-slate-400">{stageDeals.length}</span>
                                    </div>
                                    <div className="text-xl font-black text-slate-900">{total.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">CFA</span></div>
                                </div>
                            );
                        })}
                    </div>

                    <DataTable<CRMDeal>
                        data={deals}
                        searchPlaceholder="Rechercher une opportunité..."
                        searchKeys={['title']}
                        columns={[
                            {
                                header: 'Libellé',
                                accessor: (d) => <span className="font-bold text-slate-800">{d.title}</span>,
                                sortable: true
                            },
                            {
                                header: 'Client',
                                accessor: (d) => (
                                    <span className="text-slate-500 font-medium">
                                        {contacts.find(c => c.id === d.contactId)?.companyName || 'N/A'}
                                    </span>
                                ),
                                sortable: false
                            },
                            {
                                header: 'Montant Estimé',
                                accessor: (d) => (
                                    <div className="py-1">
                                        <div className="font-black text-slate-900">{d.amount.toLocaleString()} CFA</div>
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-bold mt-0.5 uppercase tracking-tight">
                                            <Calendar size={10} /> Clôture: {new Date(d.closingDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Étape / Confiance',
                                accessor: (d) => (
                                    <div className="inline-flex items-center gap-3">
                                        <Badge color={d.probability > 70 ? 'green' : d.probability > 30 ? 'blue' : 'slate'}>{d.stage}</Badge>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-sm border border-slate-100 shadow-inner">
                                            <TrendingUp size={12} className="text-slate-400" />
                                            <span className="font-black text-slate-700 text-xs">{d.probability}%</span>
                                        </div>
                                    </div>
                                ),
                                sortable: true
                            }
                        ]}
                        actions={(d) => (
                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingDeal(d)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"><Settings size={18} /></button>
                                <button onClick={() => { if (confirm('Supprimer cette opportunité ?')) deleteDeal(d.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"><Trash2 size={18} /></button>
                            </div>
                        )}
                        onRowClick={(d) => setEditingDeal(d)}
                    />
                </>
            )}

            {/* --- MODALS --- */}
            <ContactModal
                isOpen={!!editingContact}
                onClose={() => setEditingContact(null)}
                contact={editingContact}
                onSave={saveContact}
                onChange={setEditingContact}
            />

            <DealModal
                isOpen={!!editingDeal}
                onClose={() => setEditingDeal(null)}
                deal={editingDeal}
                contacts={contacts}
                onSave={saveDeal}
                onChange={setEditingDeal}
            />
        </div>
    );
};
