import React from 'react';
import { Quote, QuoteItem, StockItem, CRMContact } from '@/types';
import { Modal, InputField } from '@/components/admin/shared/AdminShared';
import { Plus, Trash2, Save, ShoppingBag, User } from 'lucide-react';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: Quote | null;
  stock: StockItem[];
  contacts: CRMContact[];
  onSave: () => void;
  onChange: (quote: Quote) => void;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  quote,
  stock,
  contacts,
  onSave,
  onChange,
}) => {
  if (!quote) return null;

  const addItem = () => {
    const newItem: QuoteItem = {
      id: 'new-' + Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    onChange({ ...quote, items: [...quote.items, newItem] });
  };

  const removeItem = (idx: number) => {
    const items = [...quote.items];
    items.splice(idx, 1);
    const totalAmount = items.reduce((acc, i) => acc + i.total, 0);
    onChange({ ...quote, items, totalAmount });
  };

  const updateItem = (idx: number, field: keyof QuoteItem, val: any) => {
    const items = [...quote.items];
    items[idx] = { ...items[idx], [field]: val };

    if (field === 'quantity' || field === 'unitPrice') {
      items[idx].total = Number(items[idx].quantity) * Number(items[idx].unitPrice);
    }

    if (field === 'stockId') {
      const product = stock.find((p) => p.id === val);
      if (product) {
        items[idx].description = product.name;
        items[idx].unitPrice = product.sellingPrice || product.value;
        items[idx].total = items[idx].quantity * items[idx].unitPrice;
      }
    }

    const totalAmount = items.reduce((acc, i) => acc + i.total, 0);
    onChange({ ...quote, items, totalAmount });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        quote.id?.startsWith('new-')
          ? 'Créer un nouveau devis'
          : `Modifier le devis ${quote.reference}`
      }
      size="xl"
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
            <Save size={18} /> Enregistrer le devis
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-sm border border-slate-100">
          <div className="space-y-1">
            <InputField
              label="Référence de offre"
              value={quote.reference}
              onChange={(v) => onChange({ ...quote, reference: v })}
              placeholder="Ex: DEV-2024-001"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <User size={12} className="text-sky-500" /> Client principal
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-semibold"
              value={quote.clientId}
              onChange={(e) => {
                const c = contacts.find((x) => x.id === e.target.value);
                onChange({ ...quote, clientId: e.target.value, clientName: c?.companyName || '' });
              }}
            >
              <option value="">Sélectionner un client...</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.contactName})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <InputField
              type="select"
              label="Statut commercial"
              value={quote.status}
              onChange={(v) => onChange({ ...quote, status: v as any })}
              options={[
                { value: 'Brouillon', label: 'Brouillon' },
                { value: 'Envoyé', label: 'Envoyé au client' },
                { value: 'Accepté', label: 'Accepté / Signé' },
                { value: 'Refusé', label: 'Refusé / Perdu' },
              ]}
            />
          </div>
          <InputField
            type="date"
            label="Date d'émission"
            value={quote.date ? new Date(quote.date).toISOString().split('T')[0] : ''}
            onChange={(v) => onChange({ ...quote, date: v })}
          />
          <InputField
            type="date"
            label="Date d'expiration"
            value={quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : ''}
            onChange={(v) => onChange({ ...quote, validUntil: v })}
          />
          <div className="flex items-end">
            <div className="w-full p-2.5 bg-sky-50 rounded-sm border border-sky-100 text-[10px] text-sky-700 font-medium">
              La validité par défaut est de 30 jours à compter de la date d'émission.
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
              <div className="w-1.5 h-6 bg-sky-600 rounded-full"></div>
              Détails de la proposition financière
            </h4>
            <button
              onClick={addItem}
              className="text-xs bg-white text-sky-600 px-4 py-2 rounded-sm font-bold hover:bg-sky-50 transition-all border border-sky-100 shadow-sm flex items-center gap-2"
            >
              <Plus size={14} /> Ajouter un article ou service
            </button>
          </div>

          <div className="border border-slate-200 rounded-sm overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">Désignation de la prestation</th>
                  <th className="px-4 py-4 w-24 text-center">Quantité</th>
                  <th className="px-6 py-4 w-40 text-right">P.U. (CFA)</th>
                  <th className="px-6 py-4 w-40 text-right">Montant HT</th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {quote.items.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <div className="mt-2.5 text-slate-300">
                            <ShoppingBag size={14} />
                          </div>
                          <select
                            className="flex-1 px-3 py-2 rounded-sm border border-slate-200 text-xs font-semibold focus:border-sky-500 outline-none bg-white shadow-sm"
                            value={item.stockId || ''}
                            onChange={(e) => updateItem(idx, 'stockId', e.target.value)}
                          >
                            <option value="">Saisie libre / Choisir depuis le stock...</option>
                            {stock.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({s.quantity} {s.unit} en stock)
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          className="w-full px-10 py-2 rounded-sm border border-slate-100 text-xs font-medium placeholder:text-slate-300 outline-none bg-slate-50/30 focus:bg-white focus:border-slate-200 transition-all"
                          placeholder="Description détaillée ou complémentaire..."
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        className="w-full p-2.5 border border-slate-200 rounded-sm text-center font-black text-slate-700 outline-none focus:ring-4 focus:ring-sky-500/10 transition-all"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      />
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full pl-3 pr-10 py-2.5 border border-slate-200 rounded-sm text-right font-black text-sky-600 outline-none focus:ring-4 focus:ring-sky-500/10 transition-all"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">
                          CFA
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-black text-slate-900 text-base">
                        {item.total.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">CFA</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {quote.items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-30">
                        <div className="p-4 bg-slate-100 rounded-full">
                          <Plus size={32} />
                        </div>
                        <p className="text-sm italic font-medium">
                          Aucun article dans ce devis. Commencez par en ajouter un.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4">
            <div className="flex-1 w-full space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Notes internes & Observations
              </label>
              <textarea
                className="w-full p-4 rounded-sm border border-slate-200 bg-slate-50/30 text-sm font-medium outline-none focus:bg-white focus:ring-4 focus:ring-sky-500/5 transition-all"
                rows={3}
                placeholder="Conditions de paiement, délais de livraison, notes techniques..."
                value={quote.notes || ''}
                onChange={(e) => onChange({ ...quote, notes: e.target.value })}
              />
            </div>
            <div className="w-full md:w-96">
              <div className="bg-slate-900 text-white p-8 rounded-sm shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-40 w-40 bg-sky-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Sous-total HT
                    </span>
                    <span className="font-bold">{quote.totalAmount.toLocaleString()} CFA</span>
                  </div>
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Taxes (TVA 18%)
                    </span>
                    <span className="font-bold">Incluse</span>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">
                        TOTAL NET À PAYER
                      </p>
                      <div className="text-4xl font-black">
                        {quote.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm font-normal opacity-40 pb-1">CFA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
