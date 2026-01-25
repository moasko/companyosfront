import React, { useState } from 'react';
import { Card } from '@/components/admin/shared/AdminShared';
import { Plus, Trash2, Edit2, Tag, Layers, Users, Briefcase, Hash, Calculator } from 'lucide-react';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { useSettings } from '@/hooks/useSettings';
import { useStock } from '@/modules/admin/stock/hooks/useStock';

interface DictionariesSettingsProps {
  companyId: string;
}

export const DictionariesSettings: React.FC<DictionariesSettingsProps> = ({ companyId }) => {
  const { dictionaries, createSetting, updateSetting, deleteSetting } = useSettings(companyId);
  const { categories, createCategory, deleteCategory } = useStock(companyId);

  const [activeTab, setActiveTab] = useState<
    'CATEGORIES' | 'BRANDS' | 'UNITS' | 'DEPARTMENTS' | 'POSITIONS' | 'SYSCOHADAs'
  >('CATEGORIES');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Helpers
  const getItems = (type: string) =>
    dictionaries ? dictionaries.filter((d) => d.type === type) : [];

  const tabs = [
    {
      id: 'CATEGORIES',
      label: 'Catégories Produits',
      icon: <Layers size={18} />,
      count: categories?.length || 0,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      id: 'BRANDS',
      label: 'Marques',
      icon: <Tag size={18} />,
      count: getItems('BRAND').length,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
    },
    {
      id: 'UNITS',
      label: 'Unités de Mesure',
      icon: <Hash size={18} />,
      count: getItems('UNIT').length,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      id: 'DEPARTMENTS',
      label: 'Départements RH',
      icon: <Users size={18} />,
      count: getItems('DEPARTMENT').length,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      id: 'POSITIONS',
      label: 'Postes Métier',
      icon: <Briefcase size={18} />,
      count: getItems('POSITION').length,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      id: 'SYSCOHADAs',
      label: 'Comptes SYSCOHADA',
      icon: <Calculator size={18} />,
      count: getItems('SYSCOHADA').length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  const currentItems =
    activeTab === 'CATEGORIES'
      ? categories?.map((c) => ({ id: c.id, value: c.name, type: 'CATEGORY' }))
      : getItems(activeTab.slice(0, -1)); // Remove 'S' suffix for generic types

  const openForCreate = () => {
    const type = activeTab === 'CATEGORIES' ? 'CATEGORY' : activeTab.slice(0, -1);
    setEditingItem({ type, value: '', code: '', color: '' });
    setIsModalOpen(true);
  };

  const openForEdit = (item: any) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    try {
      if (activeTab === 'CATEGORIES') {
        await deleteCategory(id);
      } else {
        await deleteSetting(id);
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleSave = async () => {
    try {
      if (activeTab === 'CATEGORIES') {
        // Stock Categories
        if (editingItem.id) {
          alert("La modification de catégorie n'est pas encore supportée."); // Placeholder
        } else {
          await createCategory({ name: editingItem.value });
        }
      } else {
        // Settings Dictionaries
        if (editingItem.id) {
          await updateSetting(editingItem);
        } else {
          await createSetting(editingItem);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Tabs */}
      <div className="w-full md:w-64 space-y-2 shrink-0">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Navigation
          </h3>
          <p className="text-xs text-slate-500">Sélectionnez une liste à gérer.</p>
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all border ${activeTab === tab.id
              ? 'bg-white border-slate-200 shadow-sm ring-1 ring-slate-200'
              : 'border-transparent text-slate-500 hover:bg-white hover:text-slate-700'
              }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-md ${activeTab === tab.id ? `${tab.bg} ${tab.color}` : 'bg-slate-100 text-slate-400'}`}
              >
                {tab.icon}
              </div>
              <span>{tab.label}</span>
            </div>
            {tab.count > 0 && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-[500px]">
        <Card
          title={tabs.find((t) => t.id === activeTab)?.label}
          subtitle="Gestion des éléments de la liste"
          headerActions={
            <button
              onClick={openForCreate}
              className="bg-slate-900 text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors"
            >
              <Plus size={16} /> Ajouter
            </button>
          }
        >
          <div className="space-y-2">
            {currentItems?.length === 0 && (
              <div className="text-center py-16 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Tag size={32} />
                </div>
                <p className="text-slate-400 text-sm font-medium">Cette liste est vide.</p>
                <button
                  onClick={openForCreate}
                  className="text-sky-600 font-bold text-sm mt-2 hover:underline"
                >
                  Créer le premier élément
                </button>
              </div>
            )}

            {currentItems?.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-sky-200 hover:bg-sky-50/20 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                    {item.value.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{item.value}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.code && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                          {item.code}
                        </span>
                      )}
                      {item.type && (
                        <span className="text-[10px] text-slate-400 lowercase">{item.type}</span>
                      )}
                    </div>
                  </div>
                  {item.color && (
                    <div
                      className="w-4 h-4 rounded-full border border-white shadow-sm ring-1 ring-slate-100"
                      style={{ backgroundColor: item.color }}
                    ></div>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {activeTab !== 'CATEGORIES' && (
                    <button
                      onClick={() => openForEdit(item)}
                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Ajouter / Modifier ${tabs.find((t) => t.id === activeTab)?.label}`}
        size="md"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-bold text-xs uppercase hover:bg-slate-100 rounded-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-sky-600 text-white font-bold text-xs uppercase rounded-sm hover:bg-sky-700"
            >
              Enregistrer
            </button>
          </div>
        }
      >
        <div className="space-y-4 py-4">
          <InputField
            label="Nom / Libellé"
            value={editingItem?.value || ''}
            onChange={(v) => setEditingItem({ ...editingItem, value: v })}
            placeholder="Ex: Samsung, Kg, Marketing..."
          />

          {activeTab !== 'CATEGORIES' && (
            <>
              <InputField
                label={activeTab === 'SYSCOHADAs' ? "N° de Compte (ex: 601)" : "Code (Optionnel)"}
                value={editingItem?.code || ''}
                onChange={(v) => setEditingItem({ ...editingItem, code: v })}
                placeholder={activeTab === 'SYSCOHADAs' ? "Ex: 701" : "Ex: SAMS, KG, MKT..."}
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  {activeTab === 'SYSCOHADAs' ? 'Type d\'opération par défaut' : 'Couleur (Optionnel)'}
                </label>
                <div className="flex gap-2">
                  {activeTab === 'SYSCOHADAs' ? (
                    <>
                      <button
                        onClick={() => setEditingItem({ ...editingItem, color: '#ef4444' })}
                        className={`px-4 py-2 text-[10px] font-bold rounded-sm border-2 ${editingItem?.color === '#ef4444' ? 'border-red-600 bg-red-50 text-red-600' : 'border-slate-100 bg-white text-slate-400'}`}
                      >
                        DÉBIT (-)
                      </button>
                      <button
                        onClick={() => setEditingItem({ ...editingItem, color: '#10b981' })}
                        className={`px-4 py-2 text-[10px] font-bold rounded-sm border-2 ${editingItem?.color === '#10b981' ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-white text-slate-400'}`}
                      >
                        CRÉDIT (+)
                      </button>
                    </>
                  ) : (
                    ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setEditingItem({ ...editingItem, color: c })}
                        className={`w-8 h-8 rounded-full border-2 ${editingItem?.color === c ? 'border-sky-600 scale-110 shadow-lg' : 'border-transparent'} transition-all`}
                        style={{ backgroundColor: c }}
                      />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
