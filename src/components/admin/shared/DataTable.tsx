
import React, { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, MoreVertical, Filter } from 'lucide-react';

interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    sortable?: boolean;
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    searchPlaceholder?: string;
    searchKeys?: (keyof T)[];
    actions?: (item: T) => React.ReactNode;
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    searchPlaceholder = "Rechercher...",
    searchKeys = [],
    actions,
    onRowClick
}: DataTableProps<T>) {
    const [query, setQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof T | null, direction: 'asc' | 'desc' }>({ key: null, direction: 'asc' });

    const filteredAndSortedData = useMemo(() => {
        let result = [...data];

        // Filtering
        if (query && searchKeys.length > 0) {
            const q = query.toLowerCase();
            result = result.filter(item =>
                searchKeys.some(key => {
                    const val = item[key];
                    return val && String(val).toLowerCase().includes(q);
                })
            );
        }

        // Sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key!];
                const bVal = b[sortConfig.key!];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, query, searchKeys, sortConfig]);

    const handleSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="bg-white rounded-sm border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-sm focus:outline-none focus:border-sky-500 font-bold text-sm bg-white"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        <Filter size={14} /> Filtres Avancés
                    </button>
                    <div className="h-4 w-px bg-slate-200 mx-2" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filteredAndSortedData.length} résultats</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-widest border-b border-slate-200">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 ${col.className || ''} ${col.sortable ? 'cursor-pointer hover:bg-slate-100/50 transition-colors' : ''}`}
                                    onClick={() => col.sortable && typeof col.accessor === 'string' && handleSort(col.accessor as keyof T)}
                                >
                                    <div className="flex items-center gap-2">
                                        {col.header}
                                        {col.sortable && sortConfig.key === col.accessor && (
                                            sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actions && <th className="px-6 py-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAndSortedData.length > 0 ? (
                            filteredAndSortedData.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick?.(item)}
                                    className={`hover:bg-sky-50 transition-colors group ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col, idx) => (
                                        <td key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : (item[col.accessor as keyof T] as React.ReactNode)}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            {actions(item)}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center text-slate-400">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <Search size={32} className="opacity-20" />
                                        </div>
                                        <p className="font-bold italic">Aucune donnée trouvée.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
