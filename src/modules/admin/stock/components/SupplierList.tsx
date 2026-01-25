import React from 'react';
import { Supplier } from '@/types';
import { Truck, Settings, Trash2, ExternalLink } from 'lucide-react';
import { DataTable } from '@/components/admin/shared/DataTable';

interface SupplierListProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onEdit }) => {
  return (
    <DataTable<Supplier>
      data={suppliers}
      searchPlaceholder="Rechercher un fournisseur, contact ou email..."
      searchKeys={['name', 'contactName', 'email']}
      columns={[
        {
          header: 'Fournisseur',
          accessor: (s) => (
            <div className="flex items-center gap-4">
              <div className="p-2 bg-slate-100 rounded-sm text-slate-400">
                <Truck size={18} />
              </div>
              <div>
                <div className="font-bold text-slate-800">{s.name}</div>
                <div className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">
                  {s.category}
                </div>
              </div>
            </div>
          ),
          sortable: true,
        },
        {
          header: 'Contact Principal',
          accessor: (s) => <div className="font-medium text-slate-700">{s.contactName}</div>,
          sortable: true,
        },
        {
          header: 'Email & Téléphone',
          accessor: (s) => (
            <div className="text-xs space-y-0.5">
              <div className="text-slate-600 font-medium">{s.email}</div>
              <div className="text-slate-400">{s.phone}</div>
            </div>
          ),
          sortable: false,
        },
        {
          header: 'Adresse',
          accessor: 'address',
          sortable: true,
        },
        {
          header: 'Réputation',
          accessor: (s) => (
            <div className="flex flex-col gap-1.5 w-24">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tighter text-slate-400">
                <span>Fiabilité</span>
                <span className="text-sky-600">85%</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          ),
          sortable: false,
        },
      ]}
      actions={(s) => (
        <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`${window.location.origin}/supplier-portal/${s.id}`, '_blank');
            }}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-all"
            title="Lien Portail Partenaire"
          >
            <ExternalLink size={18} />
          </button>
          <button
            onClick={() => onEdit(s)}
            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
      )}
      onRowClick={(s) => onEdit(s)}
    />
  );
};
