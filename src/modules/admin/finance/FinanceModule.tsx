
import React, { useState, useMemo } from 'react';
import { Quote, Transaction, Invoice, InvoiceItem } from '@/types';
import { SectionHeader, InputField, Modal, Badge } from '@/components/admin/shared/AdminShared';
import { Plus, Settings, FileText, Calculator, Eye, Filter, Trash2, Download, Printer, ArrowUpCircle, ArrowDownCircle, Mail, MessageCircle, Share2, Receipt, ArrowRight } from 'lucide-react';
import { useFinance } from './hooks/useFinance';
import { useCrm } from '@/modules/admin/crm/hooks/useCrm';
import { useStock } from '@/modules/admin/stock/hooks/useStock';

import { QuoteModal } from './components/QuoteModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ExportButton } from '@/components/admin/shared/ExportButton';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CommercialDocumentPDF } from './components/CommercialDocumentPDF';
import { Skeleton, TableRowSkeleton, DashboardStatsSkeleton } from '@/components/admin/shared/Skeleton';
import { DataTable } from '@/components/admin/shared/DataTable';

interface FinanceModuleProps {
    companyId: string;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({ companyId }) => {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

    const {
        quotes,
        accounting,
        invoices,
        isLoading: financeLoading,
        createQuote,
        updateQuote,
        deleteQuote,
        createTransaction,
        updateTransaction,
        deleteTransaction,
        createInvoice,
        updateInvoice,
        deleteInvoice
    } = useFinance(companyId, { year: selectedYear, month: selectedMonth });

    const { contacts: crmData, isLoading: crmLoading } = useCrm(companyId);
    const { items: stock, isLoading: stockLoading } = useStock(companyId);

    const [view, setView] = useState<'quotes' | 'invoices' | 'accounting'>('quotes');
    const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [showPreview, setShowPreview] = useState<Quote | Invoice | null>(null);

    const isLoading = financeLoading || crmLoading || stockLoading;

    // --- State Filtres Comptabilité ---
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterType, setFilterType] = useState<'All' | 'Debit' | 'Credit'>('All');
    const [filterCategory, setFilterCategory] = useState('');

    // --- Action Handlers ---
    const handlePrint = () => {
        const content = document.getElementById('printable-area');
        if (!content) return;

        const printWindow = window.open('', '', 'height=800,width=1000');
        if (!printWindow) return;

        // Copy styles
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(style => style.outerHTML)
            .join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimer Document</title>
                    ${styles}
                    <style>
                        body { background: white; padding: 20px; }
                        #printable-area { box-shadow: none !important; border: none !important; margin: 0; }
                        .no-print { display: none !important; }
                    </style>
                </head>
                <body>
                    ${content.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();

        // Wait for resources to load
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleEmail = (doc: Quote | Invoice) => {
        const isInvoice = 'paidAmount' in doc;
        const subject = `${isInvoice ? 'Facture' : 'Devis'} ${doc.reference} - ENEA TELECOM`;
        const body = `Bonjour,\n\nVeuillez trouver ci-dessous les détails de votre ${isInvoice ? 'facture' : 'devis'} ${doc.reference}.\n\nMontant Total: ${doc.totalAmount.toLocaleString()} CFA\n\nCordialement,\nL'équipe ENEA TELECOM`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleWhatsApp = (doc: Quote | Invoice) => {
        const isInvoice = 'paidAmount' in doc;
        const text = `*${isInvoice ? 'FACTURE' : 'DEVIS'} ${doc.reference}*\nMontant: ${doc.totalAmount.toLocaleString()} CFA\n\nBonjour, voici les détails.\nMerci de votre confiance.\n\nENEA TELECOM`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    // --- Logic Quotes ---
    const saveQuote = () => {
        if (!editingQuote) return;
        if (editingQuote.id && !editingQuote.id.startsWith('new-')) {
            updateQuote({ id: editingQuote.id, data: editingQuote });
        } else {
            createQuote(editingQuote);
        }
        setEditingQuote(null);
    };

    const convertToInvoice = (quote: Quote) => {
        if (!confirm('Voulez-vous transformer ce devis en facture ?')) return;

        const invoiceData: any = {
            reference: 'FACT-' + quote.reference.replace('DEV-', ''),
            clientId: quote.clientId,
            clientName: quote.clientName,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'Draft',
            totalAmount: quote.totalAmount,
            paidAmount: 0,
            quoteId: quote.id,
            items: quote.items.map(i => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                total: i.total
            }))
        };

        // On peut soit créer directement, soit ouvrir le modal
        // Ouvrons le modal pour vérification
        setEditingInvoice({
            id: 'new-converted-' + Date.now(),
            ...invoiceData
        });
        setView('invoices');
    };

    // --- Logic Invoices ---
    const saveInvoice = () => {
        if (!editingInvoice) return;
        // Removing 'id' if it's new
        const { id, ...data } = editingInvoice;

        if (id && !id.startsWith('new-')) {
            updateInvoice({ id: id, data: editingInvoice });
        } else {
            createInvoice(editingInvoice);
        }
        setEditingInvoice(null);
    };

    // --- Logic Transaction ---
    const saveTransaction = () => {
        if (!editingTransaction) return;
        if (editingTransaction.id && !editingTransaction.id.startsWith('new-')) {
            updateTransaction({ id: editingTransaction.id, data: editingTransaction });
        } else {
            createTransaction(editingTransaction);
        }
        setEditingTransaction(null);
    };

    // --- Calculs Rapport ---
    const filteredTransactions = useMemo(() => {
        return (accounting as Transaction[]).filter(t => {
            const tDate = new Date(t.date).toISOString().split('T')[0];
            const matchStart = !filterStartDate || tDate >= filterStartDate;
            const matchEnd = !filterEndDate || tDate <= filterEndDate;
            const matchType = filterType === 'All' || t.type === filterType;
            const matchCat = !filterCategory ||
                (t.category || '').toLowerCase().includes(filterCategory.toLowerCase()) ||
                (t.label || '').toLowerCase().includes(filterCategory.toLowerCase());
            return matchStart && matchEnd && matchType && matchCat;
        });
    }, [accounting, filterStartDate, filterEndDate, filterType, filterCategory]);

    const report = useMemo(() => {
        const debit = filteredTransactions.filter(t => t.type === 'Debit').reduce((acc, t) => acc + t.amount, 0);
        const credit = filteredTransactions.filter(t => t.type === 'Credit').reduce((acc, t) => acc + t.amount, 0);
        return { debit, credit, balance: credit - debit };
    }, [filteredTransactions]);

    if (isLoading) return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div className="space-y-2">
                    <Skeleton width={300} height={32} />
                    <Skeleton width={200} height={16} />
                </div>
                <div className="flex gap-4">
                    <Skeleton width={120} height={40} />
                    <Skeleton width={120} height={40} />
                    <Skeleton width={120} height={40} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton height={140} count={4} />
            </div>

            <div className="bg-white rounded-sm border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <Skeleton width={200} height={24} />
                    <Skeleton width={150} height={32} />
                </div>
                <div className="p-4 space-y-4">
                    <TableRowSkeleton columns={6} />
                    <TableRowSkeleton columns={6} />
                    <TableRowSkeleton columns={6} />
                    <TableRowSkeleton columns={6} />
                    <TableRowSkeleton columns={6} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-sm w-fit border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setView('quotes')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-sm transition-all ${view === 'quotes' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FileText size={16} /> Devis
                    </button>
                    <button
                        onClick={() => setView('invoices')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-sm transition-all ${view === 'invoices' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Receipt size={16} /> Factures
                    </button>
                    <button
                        onClick={() => setView('accounting')}
                        className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-sm transition-all ${view === 'accounting' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Calculator size={16} /> Journal Comptable
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-sm shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-sm border border-slate-100">
                        <Filter size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtres</span>
                    </div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
                    >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <select
                        value={selectedMonth || ''}
                        onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
                        className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
                    >
                        <option value="">Toute l'année</option>
                        {['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'].map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {view === 'quotes' && (
                <>
                    <SectionHeader title="Devis Clients" subtitle="Gestion des offres commerciales." actions={
                        <div className="flex gap-3">
                            <ExportButton data={quotes} fileName="devis_enea" />
                            <button onClick={() => setEditingQuote({ id: 'new-' + Date.now(), reference: `DEV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`, clientId: '', clientName: '', date: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], items: [], totalAmount: 0, status: 'Brouillon' })} className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold">
                                <Plus size={18} /> Créer Devis
                            </button>
                        </div>
                    } />
                    <DataTable<Quote>
                        data={quotes}
                        searchPlaceholder="Rechercher un devis ou client..."
                        searchKeys={['reference', 'clientName']}
                        columns={[
                            {
                                header: 'Référence',
                                accessor: (q) => <span className="font-mono font-bold text-sky-700">{q.reference}</span>,
                                sortable: true
                            },
                            {
                                header: 'Client',
                                accessor: (q) => (
                                    <div className="py-1">
                                        <div className="font-bold text-slate-800">{q.clientName}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-tight">{q.clientId ? 'Client ID: ' + q.clientId.slice(0, 8) : 'Client Libre'}</div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Date',
                                accessor: (q) => <span className="font-mono text-slate-500">{new Date(q.date).toLocaleDateString()}</span>,
                                sortable: true
                            },
                            {
                                header: 'Montant Total',
                                accessor: (q) => <span className="font-black text-slate-900">{q.totalAmount.toLocaleString()} <span className="text-[10px] text-slate-400">CFA</span></span>,
                                sortable: true
                            },
                            {
                                header: 'Statut',
                                accessor: (q) => <Badge color={q.status === 'Accepté' ? 'green' : q.status === 'Envoyé' ? 'blue' : 'slate'}>{q.status}</Badge>,
                                sortable: true
                            }
                        ]}
                        actions={(q) => (
                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => convertToInvoice(q)} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-sm transition-all" title="Convertir en Facture"><ArrowRight size={18} /></button>
                                <button onClick={() => setShowPreview(q)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all" title="Aperçu"><Eye size={18} /></button>
                                <button onClick={() => setEditingQuote(q)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all" title="Éditer"><Settings size={18} /></button>
                                <button onClick={() => { if (confirm('Supprimer ce devis ?')) deleteQuote(q.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all" title="Supprimer"><Trash2 size={18} /></button>
                            </div>
                        )}
                        onRowClick={(q) => setShowPreview(q)}
                    />
                </>
            )}

            {view === 'invoices' && (
                <>
                    <SectionHeader title="Factures Clients" subtitle="Suivi de la facturation et des paiements." actions={
                        <div className="flex gap-3">
                            <ExportButton data={invoices} fileName="factures_enea" />
                            <button onClick={() => setEditingInvoice({ id: 'new-' + Date.now(), reference: `FACT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`, clientId: '', clientName: '', date: new Date().toISOString().split('T')[0], dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], items: [], totalAmount: 0, paidAmount: 0, status: 'Draft' })} className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold">
                                <Plus size={18} /> Créer Facture
                            </button>
                        </div>
                    } />
                    <DataTable<Invoice>
                        data={invoices}
                        searchPlaceholder="Rechercher une facture ou client..."
                        searchKeys={['reference', 'clientName']}
                        columns={[
                            {
                                header: 'Référence',
                                accessor: (inv) => <span className="font-mono font-bold text-sky-700">{inv.reference}</span>,
                                sortable: true
                            },
                            {
                                header: 'Client',
                                accessor: (inv) => (
                                    <div className="py-1">
                                        <div className="font-bold text-slate-800">{inv.clientName}</div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-tight">{inv.clientId ? 'Client ID: ' + inv.clientId.slice(0, 8) : 'Client Libre'}</div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Détails Échéance',
                                accessor: (inv) => (
                                    <div className="py-1 text-xs">
                                        <div className="text-slate-500">Émis le {new Date(inv.date).toLocaleDateString()}</div>
                                        <div className={`font-bold ${new Date(inv.dueDate) < new Date() && inv.status !== 'Paid' ? 'text-red-500' : 'text-slate-700'}`}>
                                            Payable le {new Date(inv.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Montant Total',
                                accessor: (inv) => <span className="font-black text-slate-900">{inv.totalAmount.toLocaleString()} <span className="text-[10px] text-slate-400">CFA</span></span>,
                                sortable: true
                            },
                            {
                                header: 'Reste à Payer',
                                accessor: (inv) => <span className="font-bold text-orange-600">{(inv.totalAmount - (inv.paidAmount || 0)).toLocaleString()} <span className="text-[10px] text-slate-400">CFA</span></span>,
                                sortable: true
                            },
                            {
                                header: 'Statut',
                                accessor: (inv) => <Badge color={inv.status === 'Paid' ? 'green' : inv.status === 'Sent' ? 'blue' : inv.status === 'Overdue' ? 'red' : 'slate'}>{inv.status}</Badge>,
                                sortable: true
                            }
                        ]}
                        actions={(inv) => (
                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setShowPreview(inv as any)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all" title="Aperçu"><Eye size={18} /></button>
                                <button onClick={() => setEditingInvoice(inv)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all" title="Éditer"><Settings size={18} /></button>
                                <button onClick={() => { if (confirm('Supprimer cette facture ?')) deleteInvoice(inv.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all" title="Supprimer"><Trash2 size={18} /></button>
                            </div>
                        )}
                        onRowClick={(inv) => setShowPreview(inv as any)}
                    />
                </>
            )}

            {view === 'accounting' && (
                <>
                    <SectionHeader title="Trésorerie" subtitle="Journal des dépenses et des recettes." actions={
                        <div className="flex gap-3">
                            <ExportButton data={filteredTransactions} fileName="journal_comptable" />
                            <button onClick={() => setEditingTransaction({ id: 'new-' + Date.now(), date: new Date().toISOString().split('T')[0], ref: '', label: '', category: '', amount: 0, type: 'Debit', status: 'Validé' })} className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold">
                                <Plus size={18} /> Saisir Opération
                            </button>
                        </div>
                    } />

                    {/* --- RAPPORT DYNAMIQUE --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Dépenses (Débit)</p>
                                <p className="text-3xl font-black text-slate-900">{report.debit.toLocaleString()} <span className="text-sm font-normal text-slate-400 whitespace-nowrap">CFA</span></p>
                            </div>
                            <div className="p-3 bg-red-50 text-red-500 rounded-sm"><ArrowUpCircle size={32} /></div>
                        </div>
                        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-green-500 uppercase tracking-wider mb-1">Recettes (Crédit)</p>
                                <p className="text-3xl font-black text-slate-900">{report.credit.toLocaleString()} <span className="text-sm font-normal text-slate-400 whitespace-nowrap">CFA</span></p>
                            </div>
                            <div className="p-3 bg-green-50 text-green-500 rounded-sm"><ArrowDownCircle size={32} /></div>
                        </div>
                        <div className={`p-6 rounded-sm border flex items-center justify-between shadow-lg ${report.balance >= 0 ? 'bg-sky-600 border-sky-500 text-white' : 'bg-orange-600 border-orange-500 text-white'}`}>
                            <div>
                                <p className="text-xs font-bold opacity-80 uppercase tracking-wider mb-1">Solde Période</p>
                                <p className="text-3xl font-black">{report.balance > 0 ? '+' : ''}{report.balance.toLocaleString()} <span className="text-sm font-normal opacity-80 whitespace-nowrap">CFA</span></p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-sm"><Calculator size={32} /></div>
                        </div>
                    </div>

                    {/* --- ZONE DE FILTRES --- */}
                    <div className="bg-slate-50 p-6 rounded-sm border border-slate-200 mb-6 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                        <div className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Période du / au</label>
                                <div className="flex gap-2">
                                    <input type="date" className="w-full bg-white px-4 py-2.5 rounded-sm border border-slate-200 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} />
                                    <input type="date" className="w-full bg-white px-4 py-2.5 rounded-sm border border-slate-200 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="w-full md:w-64 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Flux de trésorerie</label>
                                <select className="w-full bg-white px-4 py-2.5 rounded-sm border border-slate-200 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none" value={filterType} onChange={e => setFilterType(e.target.value as any)}>
                                    <option value="All">Tous les flux</option>
                                    <option value="Credit">Recettes (Entrants)</option>
                                    <option value="Debit">Dépenses (Sortants)</option>
                                </select>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Recherche (Libellé, Catégorie)</label>
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Filtrer par mot-clé..." className="w-full bg-white pl-11 pr-4 py-2.5 rounded-sm border border-slate-200 text-sm focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={() => { setFilterStartDate(''); setFilterEndDate(''); setFilterType('All'); setFilterCategory(''); }} className="p-3 bg-slate-200 text-slate-500 hover:bg-slate-300 rounded-sm transition-all" title="Réinitialiser">
                                <div className="w-5 h-5 flex items-center justify-center font-black">×</div>
                            </button>
                        </div>
                    </div>

                    <DataTable<Transaction>
                        data={filteredTransactions}
                        searchPlaceholder="Filtrer dans les résultats (Libellé, Catégorie)..."
                        searchKeys={['label', 'category']}
                        columns={[
                            {
                                header: 'Date de Saisie',
                                accessor: (t) => <span className="font-mono text-slate-500 text-xs">{new Date(t.date).toLocaleDateString()}</span>,
                                sortable: true
                            },
                            {
                                header: 'Libellé & Catégorie',
                                accessor: (t) => (
                                    <div className="py-1">
                                        <div className="font-bold text-slate-800">{t.label}</div>
                                        <div className="text-[10px] py-0.5 px-2 bg-slate-100 rounded inline-block text-slate-500 font-bold uppercase tracking-tighter mt-1">{t.category}</div>
                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                header: 'Débit (-)',
                                accessor: (t) => <span className="text-red-600 font-black">{t.type === 'Debit' ? (t.amount).toLocaleString() : '-'}</span>,
                                sortable: true
                            },
                            {
                                header: 'Crédit (+)',
                                accessor: (t) => <span className="text-green-600 font-black">{t.type === 'Credit' ? (t.amount).toLocaleString() : '-'}</span>,
                                sortable: true
                            }
                        ]}
                        actions={(t) => (
                            <div className="flex justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingTransaction(t)} className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all" title="Modifier"><Settings size={18} /></button>
                                <button onClick={() => { if (confirm('Supprimer cette écriture ?')) deleteTransaction(t.id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all" title="Supprimer"><Trash2 size={18} /></button>
                            </div>
                        )}
                        onRowClick={(t) => setEditingTransaction(t)}
                    />
                </>
            )}

            <QuoteModal
                isOpen={!!editingQuote}
                onClose={() => setEditingQuote(null)}
                quote={editingQuote}
                stock={stock}
                contacts={crmData}
                onSave={saveQuote}
                onChange={setEditingQuote}
            />

            <InvoiceModal
                isOpen={!!editingInvoice}
                onClose={() => setEditingInvoice(null)}
                invoice={editingInvoice}
                stock={stock}
                contacts={crmData}
                onSave={saveInvoice}
                onChange={setEditingInvoice}
            />

            {/* --- MODAL TRANSACTION --- */}
            <Modal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} title="Opération Comptable" size="lg"
                footer={<button onClick={saveTransaction} className="px-8 py-3 bg-sky-600 text-white font-black rounded-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10">Enregistrer l'opération</button>}>
                {editingTransaction && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                            <InputField type="date" label="Date de l'opération" value={editingTransaction.date ? new Date(editingTransaction.date).toISOString().split('T')[0] : ''} onChange={v => setEditingTransaction({ ...editingTransaction, date: v })} />
                            <InputField label="N° Pièce Comptable" value={editingTransaction.ref} onChange={v => setEditingTransaction({ ...editingTransaction, ref: v })} placeholder="Ex: FACT-2024-001" />
                        </div>
                        <InputField label="Libellé de l'écriture" value={editingTransaction.label} onChange={v => setEditingTransaction({ ...editingTransaction, label: v })} placeholder="Ex: Achat matériel informatique" />
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Type de flux</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold"
                                    value={editingTransaction.type}
                                    onChange={e => setEditingTransaction({ ...editingTransaction, type: e.target.value as any })}
                                >
                                    <option value="Debit">DÉBIT (-) Dépense</option>
                                    <option value="Credit">CRÉDIT (+) Recette</option>
                                </select>
                            </div>
                            <InputField type="number" label="Montant (CFA)" value={editingTransaction.amount} onChange={v => setEditingTransaction({ ...editingTransaction, amount: Number(v) })} />
                        </div>
                        <InputField label="Compte / Catégorie" value={editingTransaction.category} onChange={v => setEditingTransaction({ ...editingTransaction, category: v })} placeholder="Ex: 601 - Achats, 701 - Ventes" />
                    </div>
                )}
            </Modal>


            {/* --- PREVIEW PDF (Simulé) --- */}
            <Modal isOpen={!!showPreview} onClose={() => setShowPreview(null)} title="Aperçu Document Commercial" size="xl">
                {showPreview && (
                    <div className="bg-white p-0 border shadow-2xl text-sm font-sans mx-auto max-w-4xl rounded-sm overflow-hidden" id="printable-area">
                        {/* Top Accent */}
                        <div className="h-2 bg-slate-900 w-full"></div>

                        <div className="p-12">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-16">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-10 h-10 bg-sky-600 rounded-sm flex items-center justify-center text-white font-black text-xl">E</div>
                                        <div className="text-3xl font-black text-slate-900 tracking-tighter">ENEA TELECOM</div>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest pl-1">Infrastructures & Réseaux</div>
                                    <div className="pt-4 text-slate-500 text-xs leading-relaxed pl-1">
                                        Siège Social: Cocody Riviera<br />
                                        Abidjan, Côte d'Ivoire<br />
                                        Tél: +225 27 00 00 00 00<br />
                                        Email: contact@eneatelecom.ci
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{'paidAmount' in showPreview ? 'FACTURE' : 'DEVIS'}</div>
                                    <div className="text-slate-500 text-sm font-medium">Référence</div>
                                    <div className="text-lg font-bold text-slate-900">{showPreview.reference}</div>

                                    <div className="pt-4 text-slate-500 text-sm font-medium">Date d'émission</div>
                                    <div className="text-lg font-bold text-slate-900">{new Date(showPreview.date).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Info Block */}
                            <div className="flex gap-12 mb-16">
                                <div className="w-1/2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-dashed border-slate-200 pb-1">Émetteur</div>
                                    <p className="font-bold text-slate-900">ENEA TELECOM SARL</p>
                                    <p className="text-slate-500 text-xs">RCCM: CI-ABJ-2013-B-345</p>
                                    <p className="text-slate-500 text-xs">CC: 1234567 A</p>
                                </div>
                                <div className="w-1/2 bg-slate-50 p-6 rounded-sm border-l-4 border-sky-600">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Facturer à</div>
                                    <p className="text-xl font-black text-slate-900">{showPreview.clientName}</p>
                                    <p className="text-slate-500 text-sm">Abidjan, Côte d'Ivoire</p>
                                    {showPreview.clientId && <p className="text-slate-400 text-xs mt-2 font-mono">ID Client: {showPreview.clientId.split('-')[0]}</p>}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="mb-12">
                                <table className="w-full border-collapse">
                                    <thead className="bg-slate-900 text-white">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest rounded-l-sm">Description</th>
                                            <th className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest w-24">Qté</th>
                                            <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-widest w-32">Prix Unit.</th>
                                            <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-widest w-32 rounded-r-sm">Total HT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {showPreview.items.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0">
                                                <td className="py-4 px-4 font-medium text-slate-700">{item.description}</td>
                                                <td className="py-4 px-4 text-center text-slate-600">{item.quantity}</td>
                                                <td className="py-4 px-4 text-right text-slate-600 font-mono">{item.unitPrice.toLocaleString()}</td>
                                                <td className="py-4 px-4 text-right font-bold text-slate-900 font-mono">{item.total.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals & Notes */}
                            <div className="flex justify-between items-start mb-16">
                                <div className="w-1/2 pr-12 space-y-6">
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Conditions & Notes</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-sm border border-slate-100">
                                            {'paidAmount' in showPreview ? (
                                                <>
                                                    Cette facture est à régler avant le {new Date((showPreview as any).dueDate || Date.now()).toLocaleDateString()}.<br /><br />
                                                    <strong>Mode de paiement :</strong> Chèque ou Virement bancaire.<br />
                                                    En cas de retard, des pénalités peuvent s'appliquer.
                                                </>
                                            ) : (
                                                <>
                                                    Ce devis est valable jusqu'au {new Date((showPreview as any).validUntil || Date.now()).toLocaleDateString()}.<br /><br />
                                                    <strong>Délai de livraison :</strong> 2 semaines après validation.<br />
                                                    <strong>Mode de paiement :</strong> Chèque ou Virement bancaire.<br />
                                                    <strong>Acompte :</strong> 50% à la commande, solde à la livraison.
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Coordonnées Bancaires</h4>
                                        <div className="text-xs text-slate-500 font-mono space-y-1">
                                            <p>Banque: ECOBANK CI</p>
                                            <p>IBAN: CI65 1234 5678 9012 3456 7890</p>
                                            <p>BIC: ECOBCICI</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/2 pl-12">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-slate-500 text-sm">
                                            <span>Total HT</span>
                                            <span className="font-mono">{showPreview.totalAmount.toLocaleString()} CFA</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 text-sm">
                                            <span>TVA (18%)</span>
                                            <span className="font-mono">{(showPreview.totalAmount * 0.18).toLocaleString()} CFA</span>
                                        </div>
                                        <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center mt-2">
                                            <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Net à Payer</span>
                                            <span className="font-black text-3xl text-sky-600 font-mono">{(showPreview.totalAmount * 1.18).toLocaleString()} <span className="text-sm text-slate-400 font-normal">CFA</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="grid grid-cols-2 gap-24 mt-20 pt-10 border-t border-slate-200">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bon pour accord (Date & Signature)</p>
                                    <div className="h-32 bg-slate-50 border border-slate-200 border-dashed rounded-sm"></div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-right">La Direction ENEA TELECOM</p>
                                    <div className="h-32 relative">
                                        {/* Signature placeholder or image could go here */}
                                        <div className="absolute bottom-0 right-0 font-script text-slate-300 text-4xl transform -rotate-12 pr-8 pb-4 opacity-50 select-none">EneaTelecom</div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="flex gap-4 mt-12 no-print justify-center">
                            <PDFDownloadLink
                                document={<CommercialDocumentPDF data={showPreview} />}
                                fileName={`${showPreview.reference}.pdf`}
                                className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-sm hover:bg-sky-700 font-bold transition-all shadow-lg shadow-sky-900/10"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download size={18} />
                                        {loading ? 'Génération...' : 'Télécharger PDF'}
                                    </>
                                )}
                            </PDFDownloadLink>
                            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-bold transition-all"><Printer size={18} /> Imprimer Direct</button>
                            <button onClick={() => handleEmail(showPreview!)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-sm hover:bg-slate-50 font-bold transition-all"><Mail size={18} /> Email</button>
                            <button onClick={() => handleWhatsApp(showPreview!)} className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 shadow-lg shadow-green-900/10 font-bold transition-all"><MessageCircle size={18} /> WhatsApp</button>
                        </div>
                    </div>
                )
                }
            </Modal >

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    #printable-area { border: none !important; box-shadow: none !important; }
                }
            `}</style>
        </div >
    );
};

const Save = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;
