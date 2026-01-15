import React from 'react';
import { StockItem, StockMovement, StockMovementItem } from '@/types';
import { Modal, Badge } from '@/components/admin/shared/AdminShared';
import { Box, History, AlertTriangle, ArrowUpRight, ArrowDownLeft, Calendar, User, MoreHorizontal, ShoppingCart } from 'lucide-react';
import Barcode from 'react-barcode';

interface ProductDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: StockItem | null;
    movements: StockMovement[];
    onReplenish: (product: StockItem) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product, movements, onReplenish }) => {
    if (!product) return null;

    // Filter movements containing this product
    const productMovements = movements.filter(m =>
        m.items.some(item => item.stockId === product.id)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const isLowStock = product.quantity <= product.minThreshold;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Détails du Produit: ${product.name}`} size="xl"
            footer={
                <div className="flex justify-between items-center w-full">
                    <button onClick={onClose} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-sm transition-all">Fermer</button>
                    <button
                        onClick={() => onReplenish(product)}
                        className="bg-sky-600 text-white px-8 py-2.5 rounded-sm font-black flex items-center gap-2 hover:bg-sky-700 shadow-lg shadow-sky-600/20 active:scale-95 transition-all"
                    >
                        <ShoppingCart size={18} /> Réapprovisionner
                    </button>
                </div>
            }
        >
            <div className="space-y-8 py-2">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-full md:w-64 shrink-0">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full aspect-square object-cover rounded-sm border border-slate-100 shadow-xl" />
                        ) : (
                            <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center text-slate-200">
                                <Box size={64} strokeWidth={1} />
                            </div>
                        )}

                        <div className="mt-6 space-y-3">
                            <div className="bg-slate-50 p-4 rounded-sm border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Actuel</p>
                                <div className="flex items-end justify-between">
                                    <p className={`text-3xl font-black ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>{product.quantity} <span className="text-sm font-bold opacity-40">{product.unit}</span></p>
                                    <Badge color={isLowStock ? 'red' : 'green'}>{isLowStock ? 'Alerte' : 'Optimal'}</Badge>
                                </div>
                                {isLowStock && (
                                    <div className="mt-2 flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase tracking-tight bg-red-50 py-1 px-2 rounded-sm">
                                        <AlertTriangle size={12} /> Seuil critique ({product.minThreshold})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge color="blue">{product.categoryRel?.name || product.category || 'Non classé'}</Badge>
                                <Badge color="slate">{product.type}</Badge>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{product.name}</h2>
                            <p className="font-mono text-sm text-slate-400 font-bold tracking-tighter uppercase">{product.ref} • {product.barcode || 'Pas de code-barres'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50/50 rounded-sm border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Localisation</p>
                                <p className="font-bold text-slate-700">{product.location || 'Non spécifiée'}</p>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-sm border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Marque / Origine</p>
                                <p className="font-bold text-slate-700">{product.brand || 'Générique'}</p>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-sm border border-slate-100 flex flex-col items-center justify-center overflow-hidden">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 w-full text-left">Code-Barres</p>
                                {product.barcode ? (
                                    <div className="w-full flex justify-center py-2">
                                        {/* @ts-ignore */}
                                        <Barcode value={product.barcode} width={1} height={40} fontSize={10} background="transparent" />
                                    </div>
                                ) : (
                                    <p className="font-mono font-bold text-slate-700 tracking-wider">-</p>
                                )}
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-sm border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix de Revient</p>
                                <p className="font-black text-sky-600">{product.value?.toLocaleString()} CFA</p>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-sm border border-slate-100 flex flex-col justify-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lot / Batch</p>
                                <p className="font-bold text-slate-800 text-xs">{product.batchNumber || '-'}</p>
                            </div>
                            <div className="p-3 bg-slate-50/50 rounded-sm border border-slate-100 flex flex-col justify-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fabrication</p>
                                <p className="font-bold text-slate-800 text-xs">{product.manufacturingDate ? new Date(product.manufacturingDate).toLocaleDateString() : '-'}</p>
                            </div>
                            <div className={`p-3 rounded-sm border flex flex-col justify-center ${product.expiryDate && new Date(product.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'bg-red-50 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Expiration</p>
                                <p className={`font-black text-xs ${product.expiryDate && new Date(product.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'text-red-600' : 'text-slate-800'}`}>
                                    {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : '-'}
                                </p>
                            </div>
                            <div className="p-4 bg-slate-50/50 rounded-sm border border-slate-100 col-span-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dernier Fournisseur</p>
                                <p className="font-bold text-slate-700 truncate text-xs">{product.supplier?.name || 'Inconnu'}</p>
                            </div>
                        </div>

                        {product.description && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spécifications & Notes</p>
                                <div className="p-5 bg-white border border-slate-200 rounded-sm text-sm text-slate-600 leading-relaxed shadow-sm">
                                    {product.description}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Movements History */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-sky-600 rounded-full"></div>
                            Historique des flux
                        </h3>
                        <Badge color="slate">{productMovements.length} opérations</Badge>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-xl shadow-slate-200/50">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Date & Réf</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Partenaire</th>
                                    <th className="px-6 py-4 text-center">Quantité</th>
                                    <th className="px-6 py-4 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {productMovements.map(m => {
                                    const item = m.items.find(i => i.stockId === product.id);
                                    const isEntry = m.type === 'Reception';
                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50/50 transition-all group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5"><Calendar size={12} className="text-slate-400" /> {new Date(m.date).toLocaleDateString()}</span>
                                                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-tight">{m.reference}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-2 text-xs font-black uppercase ${isEntry ? 'text-green-600' : 'text-amber-600'}`}>
                                                    {isEntry ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    {isEntry ? 'Réception' : 'Livraison'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <User size={12} className="text-slate-400" />
                                                    {m.partnerName || 'Partenaire Inconnu'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-black ${isEntry ? 'text-green-700' : 'text-slate-800'}`}>
                                                    {isEntry ? '+' : '-'}{item?.quantity} {product.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge color={m.status === 'Validé' ? 'green' : 'amber'}>{m.status}</Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {productMovements.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <History size={40} className="mx-auto text-slate-100 mb-3" />
                                            <p className="text-slate-400 font-medium text-sm">Aucun mouvement historique pour cet article.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
