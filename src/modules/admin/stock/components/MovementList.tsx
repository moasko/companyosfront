import React from 'react';
import { StockMovement } from '@/types';
import { Badge } from '@/components/admin/shared/AdminShared';
import { Settings, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';

interface MovementListProps {
  movements: StockMovement[];
  onEdit: (movement: StockMovement) => void;
}

export const MovementList: React.FC<MovementListProps> = ({ movements, onEdit }) => {
  return (
    <DataTable<StockMovement>
      data={movements}
      searchPlaceholder="Rechercher par référence ou partenaire..."
      searchKeys={['reference', 'partnerName']}
      columns={[
        {
          header: 'Flux',
          accessor: (m) => (
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-sm ${m.type === 'Reception' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
              >
                {m.type === 'Reception' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </div>
              <div>
                <div className="font-bold text-slate-800">{m.reference}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                  {new Date(m.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ),
          sortable: true,
        },
        {
          header: 'Type de Mouvement',
          accessor: (m) => (
            <Badge color={m.type === 'Reception' ? 'green' : 'amber'}>
              {m.type === 'Reception' ? 'Réception (Entrée)' : 'Livraison (Sortie)'}
            </Badge>
          ),
          sortable: true,
        },
        {
          header: 'Partenaire / Client',
          accessor: 'partnerName',
          sortable: true,
        },
        {
          header: 'Valeur du Flux',
          accessor: (m) => (
            <div className="font-black text-slate-900">
              {(m.totalValue || 0).toLocaleString()}{' '}
              <span className="text-[10px] font-bold text-slate-400">CFA</span>
            </div>
          ),
          sortable: true,
        },
        {
          header: 'Statut',
          accessor: (m) => (
            <Badge color={m.status === 'Validé' ? 'blue' : 'slate'}>{m.status}</Badge>
          ),
          sortable: true,
        },
      ]}
      actions={(m) => (
        <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(m)}
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
      )}
      onRowClick={(m) => onEdit(m)}
    />
  );
};
