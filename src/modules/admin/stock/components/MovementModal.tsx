import React from 'react';
import { StockMovement, StockMovementItem, StockItem, Supplier, CRMContact } from '@/types';
import { Modal, InputField, Badge } from '@/components/admin/shared/AdminShared';
import { Plus, Trash2 } from 'lucide-react';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  movement: StockMovement | null;
  stock: StockItem[];
  suppliers: Supplier[];
  crmContacts: CRMContact[];
  onSave: () => void;
  onValidate: () => void;
  onChange: (movement: StockMovement) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  movement,
  stock,
  suppliers,
  crmContacts,
  onSave,
  onValidate,
  onChange,
}) => {
  if (!movement) return null;

  const handleAddItem = () => {
    const newItem: StockMovementItem = { stockId: '', description: '', quantity: 1, unitPrice: 0 };
    onChange({ ...movement, items: [...movement.items, newItem] });
  };

  const updateItem = (idx: number, field: keyof StockMovementItem, value: any) => {
    const newItems = [...movement.items];
    newItems[idx] = { ...newItems[idx], [field]: value };

    if (field === 'stockId') {
      const product = stock.find((p) => p.id === value);
      if (product) {
        newItems[idx].description = product.name;
        newItems[idx].unitPrice = product.value;
      }
    }
    onChange({ ...movement, items: newItems });
  };

  const removeItem = (idx: number) => {
    const newItems = [...movement.items];
    newItems.splice(idx, 1);
    onChange({ ...movement, items: newItems });
  };

  const totalValue = movement.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mouvement de Stock"
      size="xl"
      footer={
        <div className="flex gap-2 w-full justify-between items-center">
          <div className="text-sm text-slate-500 font-medium">
            {movement.status === 'Validé'
              ? '🔒 Ce mouvement est validé et ne peut plus être modifié.'
              : '📝 Brouillon'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-sm transition-all"
            >
              Fermer
            </button>
            {movement.status !== 'Validé' && (
              <>
                <button
                  onClick={onSave}
                  className="px-6 py-2.5 bg-slate-200 text-slate-800 font-bold rounded-sm hover:bg-slate-300 transition-all"
                >
                  Sauvegarder Brouillon
                </button>
                <button
                  onClick={onValidate}
                  className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-sm hover:bg-green-700 shadow-lg shadow-green-900/10 transition-all"
                >
                  Valider Stock
                </button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-sm border border-slate-100">
          <InputField
            type="select"
            label="Type de flux"
            value={movement.type}
            onChange={(v) => onChange({ ...movement, type: v as any })}
            options={[
              { value: 'Reception', label: 'Réception (Entrée Stock)' },
              { value: 'Livraison', label: 'Livraison (Sortie Stock)' },
            ]}
            disabled={movement.status === 'Validé'}
          />
          <InputField
            label="Référence Mouvement"
            value={movement.reference}
            onChange={(v) => onChange({ ...movement, reference: v })}
            disabled={movement.status === 'Validé'}
            placeholder="Ex: BL-2024-001"
          />
          <InputField
            type="date"
            label="Date d'opération"
            value={movement.date}
            onChange={(v) => onChange({ ...movement, date: v })}
            disabled={movement.status === 'Validé'}
          />

          <div className="col-span-3">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
              {movement.type === 'Reception'
                ? "Fournisseur d'origine"
                : 'Client / Projet de destination'}
            </label>
            <select
              className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
              value={movement.partnerId}
              onChange={(e) => {
                const id = e.target.value;
                let name = '';
                if (movement.type === 'Reception') {
                  name = suppliers.find((s) => s.id === id)?.name || '';
                } else {
                  name = crmContacts.find((c) => c.id === id)?.companyName || '';
                }
                onChange({ ...movement, partnerId: id, partnerName: name });
              }}
              disabled={movement.status === 'Validé'}
            >
              <option value="">Sélectionner un partenaire...</option>
              {movement.type === 'Reception'
                ? suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))
                : crmContacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-sky-600 rounded-full"></div>
              LIGNES DE MOUVEMENT
            </h4>
            {movement.status !== 'Validé' && (
              <button
                onClick={handleAddItem}
                className="text-xs bg-sky-50 text-sky-700 px-4 py-2 rounded-sm font-bold hover:bg-sky-100 transition-all border border-sky-100 flex items-center gap-2"
              >
                <Plus size={14} /> Ajouter un article
              </button>
            )}
          </div>

          <div className="border border-slate-200 rounded-sm overflow-hidden shadow-sm">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">Désignation</th>
                  <th className="px-4 py-3 w-28 text-center">Quantité</th>
                  <th className="px-4 py-3 w-36 text-right">P.U. (CFA)</th>
                  <th className="px-4 py-3 w-36 text-right">Total (CFA)</th>
                  <th className="px-4 py-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {movement.items.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50">
                    <td className="p-3">
                      <select
                        className="w-full px-3 py-2 rounded-sm border border-slate-200 text-xs font-semibold focus:border-sky-500 outline-none bg-white transition-all shadow-sm"
                        value={item.stockId}
                        onChange={(e) => updateItem(idx, 'stockId', e.target.value)}
                        disabled={movement.status === 'Validé'}
                      >
                        <option value="">Sélectionner un article...</option>
                        {stock.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.quantity} {p.unit} dispo)
                          </option>
                        ))}
                      </select>
                      <div className="text-[10px] text-slate-400 mt-1 pl-1 font-bold italic">
                        {item.description}
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-2 border border-slate-200 rounded-sm text-center font-black text-slate-700 outline-none focus:ring-4 focus:ring-sky-500/10"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                        disabled={movement.status === 'Validé'}
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        className="w-full p-2 border border-slate-200 rounded-sm text-right font-black text-sky-600 outline-none focus:ring-4 focus:ring-sky-500/10"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                        disabled={movement.status === 'Validé'}
                      />
                    </td>
                    <td className="p-3 text-right font-black text-slate-900 bg-slate-50/50">
                      {(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      {movement.status !== 'Validé' && (
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {movement.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-300 italic text-xs">
                      Aucun article sélectionné.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mt-6">
            <div className="bg-slate-900 text-white p-6 rounded-sm w-full md:w-80 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-sky-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="text-[10px] font-black opacity-50 uppercase tracking-widest mb-1">
                  VALEUR TOTALE DU TRANSIT
                </div>
                <div className="text-3xl font-black">
                  {totalValue.toLocaleString()}{' '}
                  <span className="text-sm font-normal opacity-40">CFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
