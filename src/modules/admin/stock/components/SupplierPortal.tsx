import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { PurchaseOrder, Supplier } from '@/types';
import { Package, Truck, Clock, CheckCircle2, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/admin/shared/AdminShared';

export const SupplierPortal: React.FC = () => {
    const { supplierId } = useParams<{ supplierId: string }>();

    const { data: orders, isLoading } = useQuery<PurchaseOrder[]>({
        queryKey: ['supplier-orders', supplierId],
        queryFn: () => apiFetch(`/erp/supplier/${supplierId}/orders`),
        enabled: !!supplierId
    });

    const { data: supplier } = useQuery<Supplier>({
        queryKey: ['supplier-details', supplierId],
        queryFn: () => apiFetch(`/erp/supplier/${supplierId}`),
        enabled: !!supplierId
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
                <Truck size={48} className="text-sky-600 animate-bounce" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Accès au Portail Partenaire...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Nav */}
            <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-sky-600 rounded-sm flex items-center justify-center">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black uppercase tracking-tight">ENEA Partenaire</h1>
                            <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">Portail Fournisseur Sécurisé</p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-slate-400">{supplier?.name}</p>
                        <p className="text-[10px] font-black text-emerald-400 uppercase">Statut: Partenaire Verifié</p>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-8 mt-12 space-y-8">
                {/* Welcome Card */}
                <div className="bg-white p-8 rounded-sm shadow-xl shadow-slate-200/50 border border-slate-200 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Bienvenue, {supplier?.contactName}</h2>
                        <p className="text-slate-500 mt-2 max-w-2xl font-medium">
                            Consultez en temps réel l'état de vos commandes passées par ENEA TELECOM.
                            Vous pouvez suivre les livraisons attendues et l'historique de vos facturations.
                        </p>
                    </div>
                    <div className="absolute -right-20 -bottom-20 opacity-5">
                        <Package size={300} />
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} /> Commandes en cours & Historique
                    </h3>

                    <div className="grid gap-4">
                        {(orders || []).length > 0 ? (
                            orders?.map((order) => (
                                <div key={order.id} className="bg-white p-6 rounded-sm border border-slate-200 hover:border-sky-500 transition-all group shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center shrink-0 ${order.status === 'Received' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'
                                            }`}>
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="font-black text-slate-800">{order.reference}</h4>
                                                <Badge color={
                                                    order.status === 'Received' ? 'green' :
                                                        order.status === 'Ordered' ? 'blue' : 'slate'
                                                }>
                                                    {order.status === 'Ordered' ? 'En attente livraison' :
                                                        order.status === 'Received' ? 'Livrée' : order.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1 text-slate-700">{order.items.length} Articles</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Montant Total</p>
                                            <p className="text-lg font-black text-slate-900">{order.totalAmount.toLocaleString()} CFA</p>
                                        </div>
                                        <button className="p-3 bg-slate-50 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all">
                                            <ExternalLink size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white border border-dashed border-slate-300 rounded-sm">
                                <AlertCircle size={40} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-400 font-bold italic">Aucune commande trouvée pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-sky-900 text-white p-8 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6 border border-sky-800">
                    <div className="space-y-2 text-center md:text-left">
                        <h4 className="text-xl font-black uppercase tracking-tighter">Besoin d'assistance ?</h4>
                        <p className="text-sky-300 text-sm font-medium">Contactez directement notre service achat pour toute question relative à vos livraisons.</p>
                    </div>
                    <button className="px-8 py-3 bg-white text-sky-900 font-black uppercase tracking-widest text-xs rounded-sm hover:bg-sky-50 transition-all shadow-xl shadow-sky-950/20">
                        Contact ENEA Support
                    </button>
                </div>
            </main>
        </div>
    );
};
