import React, { useState } from 'react';
import { Task } from '@/types';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import { Plus, LayoutGrid, List, Filter } from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useHr } from '@/modules/admin/hr/hooks/useHr';
import { useStock } from '@/modules/admin/stock/hooks/useStock';
import { useCrm } from '@/modules/admin/crm/hooks/useCrm';
import { TaskBoard } from './components/TaskBoard';
import { TaskModal } from './components/TaskModal';
import { Skeleton, TableRowSkeleton } from '@/components/admin/shared/Skeleton';
import { DataTable } from '@/components/admin/shared/DataTable';
import { Badge } from '@/components/admin/shared/AdminShared';
import { Settings, Trash2, Clock, User, TrendingUp, Building2, Truck, Package } from 'lucide-react';

interface TasksModuleProps {
    companyId: string;
}

export const TasksModule: React.FC<TasksModuleProps> = ({ companyId }) => {
    const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

    const { tasks, isLoading: tasksLoading, createTask, updateTask, deleteTask } = useTasks(companyId, { year: selectedYear, month: selectedMonth });
    const { employees, isLoading: hrLoading } = useHr(companyId);
    const { items: products, suppliers, isLoading: stockLoading } = useStock(companyId);
    const { contacts: clients, isLoading: crmLoading } = useCrm(companyId);

    const isLoading = tasksLoading || hrLoading || stockLoading || crmLoading;

    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

    const handleSaveTask = () => {
        if (!editingTask) return;

        // Clean up and sanitize
        const cleanTask = { ...editingTask } as any;

        // Relation objects are handled by backend, but we remove them from payload to be safe
        delete cleanTask.assignedTo;
        delete cleanTask.client;
        delete cleanTask.supplier;
        delete cleanTask.product;

        // Ensure empty string becomes undefined for Prisma
        ['assignedToId', 'clientId', 'supplierId', 'productId'].forEach(key => {
            if (cleanTask[key] === '') cleanTask[key] = null;
        });

        if (cleanTask.id && !cleanTask.id.startsWith('new-')) {
            updateTask(cleanTask);
        } else {
            const { id, ...rest } = cleanTask;
            createTask(rest);
        }
        setEditingTask(null);
    };

    const handleStatusChange = (task: Task, newStatus: Task['status']) => {
        const cleanTask = { ...task } as any;
        delete cleanTask.assignedTo;
        delete cleanTask.client;
        delete cleanTask.supplier;
        delete cleanTask.product;

        updateTask({ ...cleanTask, status: newStatus });
    };

    if (isLoading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton width={300} height={32} />
                    <Skeleton width={200} height={16} />
                </div>
                <div className="flex gap-4">
                    <Skeleton width={100} height={40} />
                    <Skeleton width={150} height={40} />
                </div>
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
        <div className="space-y-6 h-full flex flex-col">
            <SectionHeader
                title="Gestion des Tâches"
                subtitle="Suivi de projet et assignations"
                actions={
                    <div className="flex gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200">
                            <button onClick={() => setViewMode('board')} className={`p-2 rounded-sm transition-all ${viewMode === 'board' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={18} /></button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-400 hover:text-slate-600'}`}><List size={18} /></button>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-1 rounded-sm border border-slate-200">
                            <div className="pl-2 pr-1">
                                <Filter size={16} className="text-slate-400" />
                            </div>
                            <select
                                value={selectedYear || ''}
                                onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
                                className="py-2 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
                            >
                                <option value="">Toutes les années</option>
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <select
                                value={selectedMonth || ''}
                                onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
                                className="py-2 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
                            >
                                <option value="">Toute l'année</option>
                                {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => (
                                    <option key={i} value={i + 1}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={() => setEditingTask({
                                id: 'new-' + Date.now(),
                                title: '',
                                description: '',
                                priority: 'Medium',
                                status: 'Todo',
                                dueDate: ''
                            } as Task)}
                            className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold"
                        >
                            <Plus size={18} /> Nouvelle Tâche
                        </button>
                    </div>
                }
            />

            {viewMode === 'board' ? (
                <TaskBoard
                    tasks={tasks}
                    onEdit={setEditingTask}
                    onDelete={deleteTask}
                    onStatusChange={handleStatusChange}
                />
            ) : (
                <DataTable<Task>
                    data={tasks}
                    searchPlaceholder="Rechercher une tâche..."
                    searchKeys={['title', 'description']}
                    columns={[
                        {
                            header: 'Libellé de la Tâche',
                            accessor: (t) => (
                                <div className="py-1">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-slate-800">{t.title}</div>
                                        {t.category && <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1 rounded uppercase tracking-tighter">{t.category}</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 line-clamp-1">{t.description || 'Pas de description'}</div>
                                    {t.tags && t.tags.length > 0 && (
                                        <div className="flex gap-1 mt-1">
                                            {t.tags.slice(0, 3).map(tag => <span key={tag} className="text-[8px] text-slate-400">#{tag}</span>)}
                                        </div>
                                    )}
                                </div>
                            ),
                            sortable: true
                        },
                        {
                            header: 'Échéance',
                            accessor: (t) => (
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done' ? 'text-red-500' : 'text-slate-500'}`}>
                                    <Clock size={12} />
                                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'Pas de date'}
                                </div>
                            ),
                            sortable: true
                        },
                        {
                            header: 'Relations',
                            accessor: (t) => (
                                <div className="flex flex-col gap-1">
                                    {t.clientName && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600">
                                            <Building2 size={10} /> {t.clientName}
                                        </div>
                                    )}
                                    {t.supplierName && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600">
                                            <Truck size={10} /> {t.supplierName}
                                        </div>
                                    )}
                                    {t.productName && (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                                            <Package size={10} /> {t.productName}
                                        </div>
                                    )}
                                    {!t.clientName && !t.supplierName && !t.productName && <span className="text-slate-400 text-[10px]">—</span>}
                                </div>
                            )
                        },
                        {
                            header: 'Assigné à',
                            accessor: (t) => (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                                        <User size={12} />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-700">
                                        {t.assignedToName || 'Non assigné'}
                                    </span>
                                </div>
                            ),
                            sortable: true
                        },
                        {
                            header: 'Priorité',
                            accessor: (t) => (
                                <Badge color={
                                    t.priority === 'Urgent' ? 'red' :
                                        t.priority === 'High' ? 'amber' :
                                            t.priority === 'Medium' ? 'blue' : 'slate'
                                }>
                                    {t.priority}
                                </Badge>
                            ),
                            sortable: true
                        },
                        {
                            header: 'Statut',
                            accessor: (t) => (
                                <Badge color={
                                    t.status === 'Done' ? 'green' :
                                        t.status === 'In Progress' ? 'blue' :
                                            t.status === 'Todo' ? 'slate' : 'purple'
                                }>
                                    {t.status}
                                </Badge>
                            ),
                            sortable: true
                        }
                    ]}
                    actions={(t) => (
                        <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingTask(t)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"><Settings size={18} /></button>
                            <button onClick={() => { if (confirm('Supprimer cette tâche ?')) deleteTask(t.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"><Trash2 size={18} /></button>
                        </div>
                    )}
                    onRowClick={(t) => setEditingTask(t)}
                />
            )}

            <TaskModal
                isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
                task={editingTask}
                employees={employees}
                clients={clients}
                suppliers={suppliers}
                products={products}
                onSave={handleSaveTask}
                onChange={setEditingTask}
            />
        </div>
    );
};
