import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { SectionHeader, Badge, Modal, InputField } from '@/components/admin/shared/AdminShared';
import { DataTable } from '@/components/admin/shared/DataTable';
import {
    MessageSquare,
    Plus,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    Send,
    Filter,
    ChevronRight,
    Search
} from 'lucide-react';

interface Ticket {
    id: string;
    reference: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    customerName?: string;
    customerEmail?: string;
    createdAt: string;
    updatedAt: string;
    messages?: any[];
    _count?: { messages: number };
}

export const SupportModule: React.FC<{ companyId: string }> = ({ companyId }) => {
    const queryClient = useQueryClient();
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [ticketForm, setTicketForm] = useState({
        subject: '',
        category: 'Technique',
        priority: 'Moyenne',
        customerName: '',
        customerEmail: ''
    });

    const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
        queryKey: ['tickets', companyId],
        queryFn: () => apiFetch(`/erp/${companyId}/tickets`)
    });

    const { data: activeTicket } = useQuery<Ticket>({
        queryKey: ['ticket', selectedTicketId],
        queryFn: () => apiFetch(`/erp/tickets/${selectedTicketId}`),
        enabled: !!selectedTicketId
    });

    const createTicketMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/${companyId}/tickets`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['tickets', companyId] });
            setIsCreateModalOpen(false);
            setTicketForm({
                subject: '',
                category: 'Technique',
                priority: 'Moyenne',
                customerName: '',
                customerEmail: ''
            });
            if (data?.id) setSelectedTicketId(data.id);
        },
        onError: (error: any) => {
            alert(error.message || "Une erreur est survenue lors de la création du ticket");
        }
    });

    const addMessageMutation = useMutation({
        mutationFn: (data: any) => apiFetch(`/erp/tickets/${selectedTicketId}/messages`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets', companyId] });
            setNewMessage('');
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status: string) => apiFetch(`/erp/tickets/${selectedTicketId}`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ['tickets', companyId] });
        }
    });

    const handleCreateTicket = () => {
        if (!ticketForm.subject || !ticketForm.customerEmail) return;
        createTicketMutation.mutate(ticketForm);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        addMessageMutation.mutate({
            content: newMessage,
            senderName: 'Support Agent',
            isSystem: false
        });
    };

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'Urgent': return 'red';
            case 'Haute': return 'amber';
            case 'Moyenne': return 'blue';
            default: return 'slate';
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Ouvert': return 'blue';
            case 'En cours': return 'amber';
            case 'En attente': return 'amber';
            case 'Fermé': return 'green';
            default: return 'slate';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-end">
                <SectionHeader
                    title="Support & SAV"
                    subtitle="Gestion centralisée des tickets clients et résolution d'incidents"
                />
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-sm flex items-center gap-2 text-sm font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                >
                    <Plus size={18} /> Nouveau Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Tickets List */}
                <div className={`space-y-4 ${selectedTicketId ? 'lg:col-span-4 hidden lg:block' : 'lg:col-span-12'}`}>
                    <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un ticket..."
                                className="bg-transparent border-none outline-none text-xs font-bold w-full"
                            />
                        </div>
                        <Filter size={16} className="text-slate-400" />
                    </div>

                    <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                        {tickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                className={`p-5 cursor-pointer hover:bg-slate-50 transition-all group ${selectedTicketId === ticket.id ? 'bg-sky-50/50 border-l-4 border-sky-500' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.reference}</span>
                                    <Badge color={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 line-clamp-1 mb-2 group-hover:text-sky-600 transition-colors">{ticket.subject}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Badge color={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{ticket.category}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                        <Clock size={10} /> {new Date(ticket.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ticket Details / Chat View */}
                {selectedTicketId ? (
                    <div className="lg:col-span-8 bg-white rounded-sm border border-slate-200 shadow-xl flex flex-col h-[700px]">
                        {/* Ticket Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <button onClick={() => setSelectedTicketId(null)} className="lg:hidden p-1 bg-white border border-slate-200 rounded-sm">
                                        <ChevronRight size={14} className="rotate-180" />
                                    </button>
                                    <h3 className="font-black text-slate-900 tracking-tight">{activeTicket?.subject}</h3>
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{activeTicket?.reference}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <User size={14} /> {activeTicket?.customerName || 'Client Inconnu'}
                                    </div>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{activeTicket?.category}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white border border-slate-200 rounded-sm outline-none cursor-pointer"
                                    value={activeTicket?.status}
                                    onChange={(e) => updateStatusMutation.mutate(e.target.value)}
                                >
                                    {['Ouvert', 'En cours', 'En attente', 'Fermé'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Messages View */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                            {activeTicket?.messages?.map((msg, i) => (
                                <div key={i} className={`flex ${msg.isSystem ? 'justify-center' : 'flex-col'}`}>
                                    {msg.isSystem ? (
                                        <div className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase text-slate-800">{msg.senderName}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="bg-white p-4 rounded-sm border border-slate-200 shadow-sm text-xs text-slate-700 leading-relaxed max-w-2xl">
                                                {msg.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-slate-100 bg-white">
                            <div className="flex items-end gap-4">
                                <div className="flex-1 relative">
                                    <textarea
                                        placeholder="Votre réponse technique ou commerciale..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-sm p-4 text-xs font-bold min-h-[100px] outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all resize-none"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() || addMessageMutation.isPending}
                                    className="bg-sky-600 text-white p-4 rounded-sm hover:bg-sky-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:grayscale"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={12} /> Solution proposée</span>
                                <span className="flex items-center gap-1.5 hover:text-sky-600 cursor-pointer transition-colors"><MessageSquare size={12} /> Utiliser un modèle de réponse</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="lg:col-span-8 h-[700px] bg-white border border-dashed border-slate-200 rounded-sm flex flex-col items-center justify-center text-slate-300 gap-4">
                        <MessageSquare size={64} className="opacity-20" />
                        <p className="text-sm font-black uppercase tracking-widest opacity-40 italic">Sélectionnez un ticket pour voir la conversation</p>
                    </div>
                )}
            </div>

            {/* Create Ticket Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Déclarer un Nouvel Incident"
                footer={
                    <div className="flex justify-end gap-3 w-full">
                        <button onClick={() => setIsCreateModalOpen(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-100">Annuler</button>
                        <button
                            onClick={handleCreateTicket}
                            disabled={createTicketMutation.isPending || !ticketForm.subject || !ticketForm.customerEmail}
                            className="px-8 py-2.5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-sm shadow-xl active:scale-95 disabled:opacity-50"
                        >
                            {createTicketMutation.isPending ? 'Création...' : 'Créer le ticket'}
                        </button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <InputField
                        label="Sujet de la demande"
                        placeholder="Ex: Panne de serveur Riviera 3"
                        value={ticketForm.subject}
                        onChange={(val) => setTicketForm(prev => ({ ...prev, subject: val }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catégorie</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold outline-none"
                                value={ticketForm.category}
                                onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                            >
                                <option>Technique</option>
                                <option>Facturation</option>
                                <option>Commercial</option>
                                <option>Autre</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priorité</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold outline-none"
                                value={ticketForm.priority}
                                onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                            >
                                <option>Moyenne</option>
                                <option>Basse</option>
                                <option>Haute</option>
                                <option>Urgent</option>
                            </select>
                        </div>
                    </div>
                    <InputField
                        label="Nom du Client"
                        placeholder="Ex: Jean Dupont"
                        value={ticketForm.customerName}
                        onChange={(val) => setTicketForm(prev => ({ ...prev, customerName: val }))}
                    />
                    <InputField
                        label="Email de contact"
                        placeholder="client@email.com"
                        value={ticketForm.customerEmail}
                        onChange={(val) => setTicketForm(prev => ({ ...prev, customerEmail: val }))}
                    />
                </div>
            </Modal>
        </div>
    );
};
