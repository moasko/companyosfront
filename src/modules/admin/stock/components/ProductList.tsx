import React from 'react';
import { StockItem } from '@/types';
import { Badge } from '@/components/admin/shared/AdminShared';
import { Settings, Trash2, AlertTriangle, Eye, ScanBarcode } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';

interface ProductListProps {
  products: StockItem[];
  onEdit: (product: StockItem) => void;
  onDelete: (id: string) => void;
  onViewDetails: (product: StockItem) => void;
  onPrintLabel: (product: StockItem) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onEdit,
  onDelete,
  onViewDetails,
  onPrintLabel,
}) => {
  return (
    <DataTable<StockItem>
      data={products}
      searchPlaceholder="Rechercher par nom, référence ou code-barres..."
      searchKeys={['name', 'ref', 'barcode']}
      columns={[
        {
          header: 'Réf & Code',
          accessor: (item) => (
            <div className="font-mono text-[10px] font-bold text-slate-500">
              <div className="bg-slate-100 px-2 py-1 rounded-sm w-fit mb-1">{item.ref}</div>
              {item.barcode && (
                <div className="text-[10px] text-slate-300 px-1 font-black">[{item.barcode}]</div>
              )}
            </div>
          ),
          sortable: true,
        },
        {
          header: 'Désignation & Détails',
          accessor: (item) => (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-sm bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-200 font-black text-xl">?</div>
                )}
              </div>
              <div>
                <div className="font-black text-slate-800 text-sm flex items-center gap-2">
                  {item.name}
                  {item.expiryDate &&
                    new Date(item.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                      <div
                        title={`Expire le ${new Date(item.expiryDate).toLocaleDateString()}`}
                        className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tight text-white bg-red-500 px-1.5 py-0.5 rounded-sm animate-pulse"
                      >
                        EXP
                      </div>
                    )}
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-2">
                  {item.brand || 'Générique'}{' '}
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  {item.location || 'Pas de rayon'}
                </div>
              </div>
            </div>
          ),
          sortable: true,
        },
        {
          header: 'Catégorie',
          accessor: (item) => (
            <Badge color={item.type === 'Service' ? 'purple' : 'blue'}>
              {item.categoryRel?.name || item.category || 'Standard'}
            </Badge>
          ),
          sortable: true,
        },
        {
          header: 'Stock Disponible',
          accessor: (item) => (
            <div
              className={`flex items-center gap-2 text-sm font-black ${item.quantity <= (item.minThreshold || 5) ? 'text-red-600 animate-pulse' : 'text-slate-900 font-black'}`}
            >
              {item.quantity <= (item.minThreshold || 5) && <AlertTriangle size={14} />}
              {item.quantity}{' '}
              <span className="text-[10px] font-bold text-slate-400 uppercase">{item.unit}</span>
            </div>
          ),
          sortable: true,
        },
        {
          header: 'Valeur Unitaire',
          accessor: (item) => (
            <div className="font-black text-slate-900">
              {item.value.toLocaleString()}{' '}
              <span className="text-[10px] font-bold text-slate-400">CFA</span>
            </div>
          ),
          sortable: true,
        },
      ]}
      actions={(item) => (
        <div className="flex items-center justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => onViewDetails(item)}
            title="Voir détails et historique"
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onPrintLabel(item)}
            title="Générer Étiquette Code-Barres"
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
          >
            <ScanBarcode size={18} />
          </button>
          <button
            onClick={() => onEdit(item)}
            title="Éditer"
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
          >
            <Settings size={18} />
          </button>
          <button
            onClick={() => {
              if (confirm('Supprimer cet article ?')) onDelete(item.id);
            }}
            title="Supprimer"
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
      onRowClick={(item) => onViewDetails(item)}
    />
  );
};
