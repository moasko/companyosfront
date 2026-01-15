import React, { useState } from 'react';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import { Settings, Database, Printer, Shield, Building } from 'lucide-react';
import { CompanySettings } from './components/CompanySettings';
import { DictionariesSettings } from './components/DictionariesSettings';
import { PrintingSettings } from './components/PrintingSettings';

interface SettingsModuleProps {
    companyId: string;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ companyId }) => {
    const [mainTab, setMainTab] = useState<'COMPANY' | 'DATA' | 'HARDWARE' | 'SECURITY'>('COMPANY');

    const tabs = [
        { id: 'COMPANY', label: 'Entreprise', icon: <Building size={18} />, desc: 'Identité et coordonnées' },
        { id: 'DATA', label: 'Listes & Données', icon: <Database size={18} />, desc: 'Catégories, marques, unités...' },
        { id: 'HARDWARE', label: 'Matériel', icon: <Printer size={18} />, desc: 'Imprimantes et périphériques' },
        { id: 'SECURITY', label: 'Sécurité', icon: <Shield size={18} />, desc: 'Accès et permissions', disabled: true },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SectionHeader
                title="Paramètres Globaux"
                subtitle="Configuration de votre espace ENEA ERP"
            />

            {/* Top Navigation Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-8 overflow-x-auto pb-px">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            disabled={tab.disabled}
                            onClick={() => setMainTab(tab.id as any)}
                            className={`flex items-center gap-3 pb-4 border-b-2 transition-all min-w-[140px] group ${mainTab === tab.id
                                ? 'border-sky-600'
                                : 'border-transparent hover:border-slate-300'
                                } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className={`p-2 rounded-lg transition-colors ${mainTab === tab.id
                                ? 'bg-sky-50 text-sky-600'
                                : 'bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
                                }`}>
                                {tab.icon}
                            </div>
                            <div className="text-left">
                                <p className={`text-sm font-bold ${mainTab === tab.id ? 'text-sky-900' : 'text-slate-500 group-hover:text-slate-700'
                                    }`}>
                                    {tab.label}
                                </p>
                                <p className="text-[10px] text-slate-400 hidden lg:block">{tab.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="min-h-[600px]">
                {mainTab === 'COMPANY' && <CompanySettings companyId={companyId} />}
                {mainTab === 'DATA' && <DictionariesSettings companyId={companyId} />}
                {mainTab === 'HARDWARE' && <PrintingSettings companyId={companyId} />}
                {mainTab === 'SECURITY' && (
                    <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                        <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-600">Module Sécurité en développement</h3>
                        <p className="text-slate-400">La gestion des rôles et des accès sera disponible prochainement.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

