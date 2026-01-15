import React from 'react';
import { Task } from '@/types';
import { Badge } from '@/components/admin/shared/AdminShared';
import { Plus, MoreHorizontal, Calendar, User, Clock, CheckCircle2, Building2, Truck, Package, Tag, Hash } from 'lucide-react';

interface TaskBoardProps {
    tasks: Task[];
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (task: Task, newStatus: Task['status']) => void;
}

const Column = ({ title, status, tasks, color, onEdit, onStatusChange }: { title: string, status: string, tasks: Task[], color: string, onEdit: (t: Task) => void, onStatusChange: (t: Task, s: any) => void }) => {
    return (
        <div className="flex-1 min-w-[300px] flex flex-col bg-slate-100/50 rounded-sm border border-slate-200/60 h-full max-h-full">
            <div className={`p-4 border-b border-slate-200 flex justify-between items-center ${color}`}>
                <h3 className="font-black text-slate-700 uppercase tracking-tight text-sm flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status === 'Todo' ? 'bg-slate-400' : status === 'In Progress' ? 'bg-blue-500' : status === 'Done' ? 'bg-green-500' : 'bg-purple-500'}`}></div>
                    {title}
                </h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-500 shadow-sm border border-slate-100">{tasks.length}</span>
            </div>
            <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                {tasks.map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer relative" onClick={() => onEdit(task)}>
                        {/* Priority & Date Header */}
                        <div className="flex justify-between items-start mb-2">
                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${task.priority === 'Urgent' ? 'bg-red-100 text-red-600' :
                                task.priority === 'High' ? 'bg-orange-100 text-orange-600' :
                                    task.priority === 'Medium' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {task.priority}
                            </div>
                            {task.dueDate && (
                                <div className={`flex items-center gap-1 text-[10px] font-bold ${new Date(task.dueDate) < new Date() && status !== 'Done' ? 'text-red-500' : 'text-slate-400'}`}>
                                    <Clock size={12} />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm mb-2 leading-snug">{task.title}</h4>

                        {task.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                        )}

                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {task.category && (
                                <div className="flex items-center gap-1 text-[9px] font-black text-white bg-slate-400 px-1.5 py-0.5 rounded-sm uppercase">
                                    <Tag size={10} /> {task.category}
                                </div>
                            )}
                            {task.clientName && (
                                <div className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-sm uppercase">
                                    <Building2 size={10} /> {task.clientName}
                                </div>
                            )}
                            {task.supplierName && (
                                <div className="flex items-center gap-1 text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-sm uppercase">
                                    <Truck size={10} /> {task.supplierName}
                                </div>
                            )}
                            {task.productName && (
                                <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-sm uppercase">
                                    <Package size={10} /> {task.productName}
                                </div>
                            )}
                        </div>

                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                                {task.tags.map(tag => (
                                    <span key={tag} className="text-[9px] font-bold text-slate-400">#{tag}</span>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between items-center pt-3 border-t border-slate-50 mt-2">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                    <User size={12} />
                                </div>
                                <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[80px]">
                                    {task.assignedToName || 'Non assigné'}
                                </span>
                            </div>

                            {/* Simple Quick Actions - prevent bubbling */}
                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                {status !== 'Todo' && (
                                    <button onClick={() => onStatusChange(task, status === 'In Progress' ? 'Todo' : status === 'Done' ? 'In Progress' : 'Done')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 text-[10px] font-bold">
                                        ←
                                    </button>
                                )}
                                {status !== 'Archived' && (
                                    <button onClick={() => onStatusChange(task, status === 'Todo' ? 'In Progress' : status === 'In Progress' ? 'Done' : 'Archived')} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 text-[10px] font-bold">
                                        {status === 'Done' ? 'Archiver' : '→'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onEdit, onDelete, onStatusChange }) => {
    const todoTasks = tasks.filter(t => t.status === 'Todo');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const doneTasks = tasks.filter(t => t.status === 'Done');

    return (
        <div className="flex gap-4 h-[calc(100vh-220px)] overflow-x-auto pb-4">
            <Column title="A faire" status="Todo" tasks={todoTasks} color="bg-slate-50" onEdit={onEdit} onStatusChange={onStatusChange} />
            <Column title="En cours" status="In Progress" tasks={inProgressTasks} color="bg-blue-50/50" onEdit={onEdit} onStatusChange={onStatusChange} />
            <Column title="Terminé" status="Done" tasks={doneTasks} color="bg-green-50/50" onEdit={onEdit} onStatusChange={onStatusChange} />
        </div>
    );
};
