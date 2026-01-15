
import React from 'react';
import { Supplier } from '@/types';
import { Truck, Settings, Trash2 } from 'lucide-react';
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
                                <div className="text-[10px] text-sky-600 font-bold uppercase tracking-wider">{s.category}</div>
                            </div>
                        </div>
                    ),
                    sortable: true
                },
                {
                    header: 'Contact Principal',
                    accessor: (s) => (
                        <div className="font-medium text-slate-700">{s.contactName}</div>
                    ),
                    sortable: true
                },
                {
                    header: 'Email & Téléphone',
                    accessor: (s) => (
                        <div className="text-xs space-y-0.5">
                            <div className="text-slate-600 font-medium">{s.email}</div>
                            <div className="text-slate-400">{s.phone}</div>
                        </div>
                    ),
                    sortable: false
                },
                {
                    header: 'Adresse',
                    accessor: 'address',
                    sortable: true
                }
            ]}
            actions={(s) => (
                <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(s)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"><Settings size={18} /></button>
                </div>
            )}
            onRowClick={(s) => onEdit(s)}
        />
    );
};
