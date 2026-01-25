import React, { useState, useMemo } from 'react';
import { Quote, Transaction, Invoice, InvoiceItem } from '@/types';
import { SectionHeader, InputField, Modal, Badge } from '@/components/admin/shared/AdminShared';
import {
  Plus,
  Settings,
  FileText,
  Calculator,
  Eye,
  Filter,
  Trash2,
  Download,
  Printer,
  ArrowUpCircle,
  ArrowDownCircle,
  Mail,
  MessageCircle,
  Share2,
  Receipt,
  ArrowRight,
  Scan,
  DollarSign,
  Sparkles,
  Search,
} from 'lucide-react';
import { useFinance } from './hooks/useFinance';
import { useCrm } from '@/modules/admin/crm/hooks/useCrm';
import { useStock } from '@/modules/admin/stock/hooks/useStock';
import { useSettings } from '@/hooks/useSettings';

import { QuoteModal } from './components/QuoteModal';
import { InvoiceModal } from './components/InvoiceModal';
import { ExportButton } from '@/components/admin/shared/ExportButton';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CommercialDocumentPDF } from './components/CommercialDocumentPDF';
import { InvoiceScanModal } from './components/InvoiceScanModal';
import {
  Skeleton,
  TableRowSkeleton,
  DashboardStatsSkeleton,
} from '@/components/admin/shared/Skeleton';
import { DataTable } from '@/components/admin/shared/DataTable';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SYSCOHADA_PLAN = [
  { code: '601', label: 'Achats de marchandises', type: 'Debit' },
  { code: '602', label: 'Achats de matières premières', type: 'Debit' },
  { code: '61', label: 'Transports', type: 'Debit' },
  { code: '62/63', label: 'Services extérieurs (Loyer, Entretien)', type: 'Debit' },
  { code: '64/65', label: 'Autres charges externes (Pub, Honoraires)', type: 'Debit' },
  { code: '66', label: 'Charges de personnel', type: 'Debit' },
  { code: '701', label: 'Ventes de marchandises', type: 'Credit' },
  { code: '706', label: 'Services produits / Prestations', type: 'Credit' },
  { code: '75', label: 'Autres produits accessoires', type: 'Credit' },
  { code: 'AUTRE', label: 'Autre opération', type: 'Debit' },
];

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
    deleteInvoice,
    bi,
  } = useFinance(companyId, { year: selectedYear, month: selectedMonth });

  const { contacts: crmData, isLoading: crmLoading } = useCrm(companyId);
  const { items: stock, isLoading: stockLoading } = useStock(companyId);
  const { dictionaries } = useSettings(companyId);

  // Dynamic SYSCOHADA Plan
  const dynamicPlan = useMemo(() => {
    const custom = dictionaries
      .filter((d) => d.type === 'SYSCOHADA')
      .map((d) => ({
        code: d.code || '',
        label: d.value,
        type: d.color === '#10b981' ? 'Credit' : 'Debit',
      }));
    return custom.length > 0 ? custom : SYSCOHADA_PLAN;
  }, [dictionaries]);

  const [view, setView] = useState<'quotes' | 'invoices' | 'accounting'>('quotes');
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPreview, setShowPreview] = useState<Quote | Invoice | null>(null);

  // --- Reset filters on view change ---
  React.useEffect(() => {
    setFilterCategory('');
    setFilterType('All');
    setFilterStartDate('');
    setFilterEndDate('');
  }, [view]);

  const isLoading = financeLoading || crmLoading || stockLoading;

  // --- State Filtres Comptabilité ---
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Debit' | 'Credit'>('All');
  const [filterCategory, setFilterCategory] = useState('');

  // --- Logic Piece Comptable Automatique ---
  const getNextAccountingRef = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

    // Find highest sequence in current month/year
    const prefix = `PC${year}${month}`;
    const monthTransactions = (accounting as Transaction[]).filter(t => t.ref?.startsWith(prefix));

    let nextSeq = 1;
    if (monthTransactions.length > 0) {
      const sequences = monthTransactions.map(t => {
        const part = t.ref.replace(prefix, '');
        const num = parseInt(part);
        return isNaN(num) ? 0 : num;
      });
      nextSeq = Math.max(...sequences) + 1;
    }

    return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
  };

  // --- Action Handlers ---
  const handlePrint = () => {
    const content = document.getElementById('printable-area');
    if (!content) return;

    const printWindow = window.open('', '', 'height=800,width=1000');
    if (!printWindow) return;

    // Copy styles
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((style) => style.outerHTML)
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
      items: quote.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total,
      })),
    };

    // On peut soit créer directement, soit ouvrir le modal
    // Ouvrons le modal pour vérification
    setEditingInvoice({
      id: 'new-converted-' + Date.now(),
      ...invoiceData,
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
    if (!accounting) return [];
    const list = accounting as Transaction[];

    return list.filter((t) => {
      // 1. Date Filter
      let passDate = true;
      if (filterStartDate || filterEndDate) {
        try {
          const tDate = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
          if (filterStartDate && tDate < filterStartDate) passDate = false;
          if (filterEndDate && tDate > filterEndDate) passDate = false;
        } catch (e) { passDate = true; } // Keep on error
      }

      // 2. Type Filter
      const passType = filterType === 'All' || t.type === filterType;

      // 3. Search Filter
      const query = filterCategory.toLowerCase();
      const passSearch = !query ||
        (t.label || '').toLowerCase().includes(query) ||
        (t.category || '').toLowerCase().includes(query) ||
        (t.ref || '').toLowerCase().includes(query);

      return passDate && passType && passSearch;
    });
  }, [accounting, filterStartDate, filterEndDate, filterType, filterCategory]);

  const report = useMemo(() => {
    const debit = filteredTransactions
      .filter((t) => t.type === 'Debit')
      .reduce((acc, t) => acc + t.amount, 0);
    const credit = filteredTransactions
      .filter((t) => t.type === 'Credit')
      .reduce((acc, t) => acc + t.amount, 0);
    return { debit, credit, balance: credit - debit };
  }, [filteredTransactions]);

  if (isLoading)
    return (
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
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* --- EN-TÊTE STRATÉGIQUE --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <div className="p-2 bg-sky-600 rounded-sm text-white shadow-lg shadow-sky-900/20">
              <DollarSign size={28} />
            </div>
            Centre de Pilotage Financier
          </h1>
          <p className="text-slate-500 font-medium mt-1">Trésorerie, Facturation & Comptabilité analytique</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-sm shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-sm border border-slate-100">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Période</span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <div className="w-px h-4 bg-slate-200"></div>
          <select
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
          >
            <option value="">Année Entière</option>
            {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- TABLEAU DE BORD DE SANTÉ --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cash Position */}
        <div className={`p-6 rounded-sm shadow-xl flex flex-col justify-between relative overflow-hidden group ${report.balance >= 0 ? 'bg-slate-900' : 'bg-orange-600'} text-white`}>
          <div className="relative z-10">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">Trésorerie Nette</p>
            <h3 className="text-3xl font-black tracking-tighter">{report.balance.toLocaleString()} <span className="text-sm opacity-50 font-normal underline decoration-sky-500 underline-offset-4">CFA</span></h3>
          </div>
          {bi && (
            <div className={`mt-6 flex items-center gap-2 text-[10px] font-black uppercase relative z-10 ${report.balance >= 0 ? 'text-sky-400' : 'text-white'}`}>
              <Sparkles size={14} className={report.balance >= 0 ? 'animate-pulse' : ''} /> {bi.health?.runway} mois d'autonomie
            </div>
          )}
          <DollarSign size={100} className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Inflow */}
        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-emerald-600">Total Encaissé</p>
              <h3 className="text-2xl font-black text-slate-900">{report.credit.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-sm"><ArrowDownCircle size={20} /></div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Flux Entrants Validés
          </div>
        </div>

        {/* Outflow */}
        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm border-t-4 border-t-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-red-600">Total Décaisse</p>
              <h3 className="text-2xl font-black text-slate-900">{report.debit.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-red-50 text-red-500 rounded-sm"><ArrowUpCircle size={20} /></div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase">
            Charge Fiscale Est: <span className="text-orange-600 font-black">{bi?.tax?.netTaxToPay?.toLocaleString()} CFA</span>
          </div>
        </div>

        {/* Growth Graph Card */}
        <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm border-t-4 border-t-sky-500 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-slate-50">
          <div>
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Performance CA</p>
            <h3 className="text-xs font-bold text-slate-500">Tendance sur 6 mois</h3>
          </div>
          <div className="h-16 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bi?.trends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- HUB D'ACTIONS ET NAVIGATION COMPOSITE --- */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Control Panel */}
        <div className="lg:w-72 space-y-6 shrink-0">
          <div className="bg-white border border-slate-200 rounded-sm shadow-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Explorateur</span>
              <ArrowRight size={14} className="text-sky-400" />
            </div>
            <div className="p-2 space-y-1">
              {[
                { id: 'quotes', label: 'Devis & Offres', icon: <FileText size={18} />, count: quotes?.length },
                { id: 'invoices', label: 'Factures Clients', icon: <Receipt size={18} />, count: invoices?.length },
                { id: 'accounting', label: 'Grand Livre Caisse', icon: <Calculator size={18} />, count: accounting?.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-sm text-sm font-bold transition-all ${view === tab.id
                    ? 'bg-slate-100 text-slate-900 border-l-4 border-sky-600 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={view === tab.id ? 'text-sky-600' : ''}>{tab.icon}</span>
                    {tab.label}
                  </div>
                  {typeof tab.count === 'number' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${view === tab.id ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* --- ZONE DE DONNÉES CENTRALE --- */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Header & Main Search */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {view === 'quotes' ? 'Portefeuille Devis' : view === 'invoices' ? 'Base Facturation' : 'Grand Livre Comptable'}
                  <span className="p-1 px-2 text-[10px] bg-sky-50 text-sky-600 rounded-full font-black uppercase tracking-widest">Live</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">Gestion et pilotage des flux financiers</p>
              </div>
              <div className="flex gap-2">
                {/* Export remains here as a secondary utility */}
                <ExportButton data={view === 'quotes' ? quotes : view === 'invoices' ? invoices : filteredTransactions} fileName={`export_${view}`} />
              </div>
            </div>

            {/* Centralized Imposing Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder={`Rechercher intensément dans ${view === 'quotes' ? 'les devis' : view === 'invoices' ? 'les factures' : 'le grand livre'}...`}
                  className="w-full bg-slate-50 border-2 border-slate-100 pl-12 pr-4 py-3.5 text-sm rounded-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-600 focus:bg-white transition-all font-bold placeholder:text-slate-400 shadow-inner"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                />
              </div>

              <div className="flex gap-2 shrink-0">
                {/* Quick Contextual Actions Moved into the Search row for focus */}
                {view === 'quotes' && (
                  <button
                    onClick={() => setEditingQuote({
                      id: 'new-' + Date.now(),
                      reference: `DEV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
                      clientId: '', clientName: '',
                      date: new Date().toISOString().split('T')[0],
                      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      items: [], totalAmount: 0, status: 'Brouillon',
                    })}
                    className="bg-sky-600 text-white px-6 py-3.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={16} /> Nouveau Devis
                  </button>
                )}

                {view === 'accounting' && (
                  <>
                    <button
                      onClick={() => setShowScanModal(true)}
                      className="bg-slate-800 text-white px-6 py-3.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      <Scan size={16} /> Scan IA
                    </button>
                    <button
                      onClick={() => setEditingTransaction({
                        id: 'new-' + Date.now(),
                        date: new Date().toISOString().split('T')[0],
                        ref: getNextAccountingRef(),
                        label: '', category: '', amount: 0, type: 'Debit', status: 'Validé',
                      })}
                      className="bg-sky-600 text-white px-6 py-3.5 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 active:scale-95 flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus size={16} /> Saisie
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-sm shadow-sm">

            <div className="p-0 overflow-x-auto">
              {view === 'quotes' && (
                <DataTable<Quote>
                  data={quotes}
                  columns={[
                    {
                      header: 'Référence',
                      accessor: (q) => <span className="font-mono font-bold text-sky-700">{q.reference}</span>,
                    },
                    {
                      header: 'Client',
                      accessor: (q) => <span className="font-bold text-slate-800">{q.clientName}</span>,
                    },
                    {
                      header: 'Date / Validité',
                      accessor: (q) => (
                        <div className="flex flex-col text-[10px]">
                          <span className="text-slate-500">Le {new Date(q.date).toLocaleDateString()}</span>
                          <span className="font-bold text-slate-400 uppercase italic">Expire le {new Date(q.validUntil).toLocaleDateString()}</span>
                        </div>
                      ),
                    },
                    {
                      header: 'Montant TTC',
                      accessor: (q) => <span className="font-black text-slate-900">{(q.totalAmount * 1.18).toLocaleString()} CFA</span>,
                    },
                    {
                      header: 'État',
                      accessor: (q) => <Badge color={q.status === 'Accepté' ? 'green' : q.status === 'Envoyé' ? 'blue' : 'slate'}>{q.status}</Badge>,
                    },
                  ]}
                  actions={(q) => (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => convertToInvoice(q)} className="p-2 text-slate-400 hover:text-green-600 transition-all" title="En Facture"><ArrowRight size={18} /></button>
                      <button onClick={() => setShowPreview(q)} className="p-2 text-slate-400 hover:text-sky-600 transition-all"><Eye size={18} /></button>
                      <button onClick={() => setEditingQuote(q)} className="p-2 text-slate-400 hover:text-sky-600 transition-all"><Settings size={18} /></button>
                      <button onClick={() => { if (confirm('Supprimer ?')) deleteQuote(q.id); }} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                    </div>
                  )}
                />
              )}

              {view === 'invoices' && (
                <DataTable<Invoice>
                  data={invoices}
                  columns={[
                    {
                      header: 'N° Facture',
                      accessor: (inv) => <span className="font-mono font-bold text-sky-700">{inv.reference}</span>,
                    },
                    {
                      header: 'Client',
                      accessor: (inv) => <span className="font-bold text-slate-800">{inv.clientName}</span>,
                    },
                    {
                      header: 'Détails Échéance',
                      accessor: (inv) => (
                        <span className={`text-[10px] font-black px-2 py-1 rounded-sm ${new Date(inv.dueDate) < new Date() && inv.status !== 'Paid' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                          {new Date(inv.dueDate).toLocaleDateString()}
                        </span>
                      ),
                    },
                    {
                      header: 'Montant Net / Reste',
                      accessor: (inv) => (
                        <div className="flex flex-col">
                          <span className="font-black text-slate-900">{(inv.totalAmount * 1.18).toLocaleString()} CFA</span>
                          <span className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">Reste: {(inv.totalAmount - (inv.paidAmount || 0)).toLocaleString()}</span>
                        </div>
                      ),
                    },
                    {
                      header: 'Statut',
                      accessor: (inv) => <Badge color={inv.status === 'Paid' ? 'green' : inv.status === 'Sent' ? 'blue' : 'slate'}>{inv.status}</Badge>,
                    },
                  ]}
                  actions={(inv) => (
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setShowPreview(inv as any)} className="p-2 text-slate-400 hover:text-sky-600 transition-all"><Eye size={18} /></button>
                      <button onClick={() => setEditingInvoice(inv)} className="p-2 text-slate-400 hover:text-sky-600 transition-all"><Settings size={18} /></button>
                      <button onClick={() => { if (confirm('Supprimer ?')) deleteInvoice(inv.id); }} className="p-2 text-slate-400 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                    </div>
                  )}
                />
              )}

              {view === 'accounting' && (
                <>
                  <div className="bg-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex gap-4">
                      <select
                        className="bg-slate-800 text-white text-[10px] font-black border-none rounded-sm px-3 py-2 outline-none cursor-pointer focus:ring-1 focus:ring-sky-500"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                      >
                        <option value="All">TOUS LES FLUX</option>
                        <option value="Credit">RECETTES (+)</option>
                        <option value="Debit">DÉPENSES (-)</option>
                      </select>
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      Affichage de {filteredTransactions.length} écriture(s)
                    </div>
                  </div>
                  {filteredTransactions.length === 0 && (accounting as Transaction[]).length > 0 && (
                    <div className="p-8 text-center bg-amber-50 border-b border-amber-100">
                      <p className="text-amber-700 font-bold text-sm">Vos filtres cachent toutes les données ({(accounting as Transaction[]).length} au total).</p>
                      <button
                        onClick={() => { setFilterCategory(''); setFilterType('All'); setFilterStartDate(''); setFilterEndDate(''); }}
                        className="mt-2 text-xs font-black uppercase text-amber-900 underline"
                      >
                        Réinitialiser tous les filtres
                      </button>
                    </div>
                  )}

                  <DataTable<Transaction>
                    data={filteredTransactions}
                    searchPlaceholder="Rechercher dans le journal..."
                    searchKeys={['label', 'ref', 'category']}
                    columns={[
                      {
                        header: 'Date',
                        accessor: (t) => (
                          <span className="font-mono text-xs text-slate-500 whitespace-nowrap">
                            {t.date ? new Date(t.date).toLocaleDateString() : '-'}
                          </span>
                        ),
                      },
                      {
                        header: 'Réf. Pièce',
                        accessor: (t) => <span className="font-mono font-black text-sky-600 text-xs">{t.ref || 'PROV'}</span>,
                      },
                      {
                        header: 'Libellé & Catégorie',
                        accessor: (t) => (
                          <div className="flex flex-col py-1">
                            <span className="font-bold text-slate-800 text-sm">{t.label || 'Sans libellé'}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.category || 'GÉNÉRAL'}</span>
                          </div>
                        ),
                      },
                      {
                        header: 'Flux Débit / Crédit',
                        accessor: (t) => (
                          <div className="flex items-center gap-4">
                            <div className="w-24 text-right">
                              {t.type === 'Debit' ? (
                                <span className="font-black text-red-600">-{t.amount?.toLocaleString()}</span>
                              ) : (
                                <span className="text-slate-200">-</span>
                              )}
                            </div>
                            <div className="w-px h-6 bg-slate-100"></div>
                            <div className="w-24 text-left">
                              {t.type === 'Credit' ? (
                                <span className="font-black text-emerald-600">+{t.amount?.toLocaleString()}</span>
                              ) : (
                                <span className="text-slate-200">-</span>
                              )}
                            </div>
                          </div>
                        ),
                      },
                    ]}
                    actions={(t) => (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingTransaction(t); }}
                          className="p-2 text-slate-400 hover:text-sky-600 transition-all"
                        >
                          <Settings size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Supprimer cette écriture ?')) deleteTransaction(t.id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

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
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Opération Comptable"
        size="lg"
        footer={
          <button
            onClick={saveTransaction}
            className="px-8 py-3 bg-sky-600 text-white font-black rounded-sm hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10"
          >
            Enregistrer l'opération
          </button>
        }
      >
        {editingTransaction && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <InputField
                type="date"
                label="Date de l'opération"
                value={
                  editingTransaction.date
                    ? new Date(editingTransaction.date).toISOString().split('T')[0]
                    : ''
                }
                onChange={(v) => setEditingTransaction({ ...editingTransaction, date: v })}
              />
              <InputField
                label="N° Pièce Comptable"
                value={editingTransaction.ref}
                onChange={(v) => setEditingTransaction({ ...editingTransaction, ref: v })}
                placeholder="Ex: FACT-2024-001"
              />
            </div>
            <InputField
              label="Libellé de l'écriture"
              value={editingTransaction.label}
              onChange={(v) => setEditingTransaction({ ...editingTransaction, label: v })}
              placeholder="Ex: Achat matériel informatique"
            />
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Type de flux
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold"
                  value={editingTransaction.type}
                  onChange={(e) =>
                    setEditingTransaction({ ...editingTransaction, type: e.target.value as any })
                  }
                >
                  <option value="Debit">DÉBIT (-) Dépense</option>
                  <option value="Credit">CRÉDIT (+) Recette</option>
                </select>
              </div>
              <InputField
                type="number"
                label="Montant (CFA)"
                value={editingTransaction.amount}
                onChange={(v) =>
                  setEditingTransaction({ ...editingTransaction, amount: Number(v) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Compte & Catégorie (SYSCOHADA)
              </label>
              <select
                className="w-full px-4 py-2.5 rounded-sm border border-slate-200 bg-white text-sm outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all font-bold"
                value={editingTransaction.category}
                onChange={(e) => {
                  const plan = dynamicPlan.find(p => p.code === e.target.value);
                  setEditingTransaction({
                    ...editingTransaction,
                    category: e.target.value,
                    type: plan ? plan.type as any : editingTransaction.type
                  });
                }}
              >
                <option value="">Sélectionner un compte...</option>
                {dynamicPlan.map(item => (
                  <option key={item.code} value={item.code}>{item.code} - {item.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* --- PREVIEW PDF (Simulé) --- */}
      <Modal
        isOpen={!!showPreview}
        onClose={() => setShowPreview(null)}
        title="Aperçu Document Commercial"
        size="xl"
      >
        {showPreview && (
          <div
            className="bg-white p-0 border shadow-2xl text-sm font-sans mx-auto max-w-4xl rounded-sm overflow-hidden"
            id="printable-area"
          >
            {/* Top Accent */}
            <div className="h-2 bg-slate-900 w-full"></div>

            <div className="p-12">
              {/* Header */}
              <div className="flex justify-between items-start mb-16">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 bg-sky-600 rounded-sm flex items-center justify-center text-white font-black text-xl">
                      E
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">
                      ENEA TELECOM
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest pl-1">
                    Infrastructures & Réseaux
                  </div>
                  <div className="pt-4 text-slate-500 text-xs leading-relaxed pl-1">
                    Siège Social: Cocody Riviera
                    <br />
                    Abidjan, Côte d'Ivoire
                    <br />
                    Tél: +225 27 00 00 00 00
                    <br />
                    Email: contact@eneatelecom.ci
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
                    {'paidAmount' in showPreview ? 'FACTURE' : 'DEVIS'}
                  </div>
                  <div className="text-slate-500 text-sm font-medium">Référence</div>
                  <div className="text-lg font-bold text-slate-900">{showPreview.reference}</div>

                  <div className="pt-4 text-slate-500 text-sm font-medium">Date d'émission</div>
                  <div className="text-lg font-bold text-slate-900">
                    {new Date(showPreview.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Info Block */}
              <div className="flex gap-12 mb-16">
                <div className="w-1/2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-dashed border-slate-200 pb-1">
                    Émetteur
                  </div>
                  <p className="font-bold text-slate-900">ENEA TELECOM SARL</p>
                  <p className="text-slate-500 text-xs">RCCM: CI-ABJ-2013-B-345</p>
                  <p className="text-slate-500 text-xs">CC: 1234567 A</p>
                </div>
                <div className="w-1/2 bg-slate-50 p-6 rounded-sm border-l-4 border-sky-600">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Facturer à
                  </div>
                  <p className="text-xl font-black text-slate-900">{showPreview.clientName}</p>
                  <p className="text-slate-500 text-sm">Abidjan, Côte d'Ivoire</p>
                  {showPreview.clientId && (
                    <p className="text-slate-400 text-xs mt-2 font-mono">
                      ID Client: {showPreview.clientId.split('-')[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="mb-12">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-900 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left text-[10px] font-bold uppercase tracking-widest rounded-l-sm">
                        Description
                      </th>
                      <th className="py-3 px-4 text-center text-[10px] font-bold uppercase tracking-widest w-24">
                        Qté
                      </th>
                      <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-widest w-32">
                        Prix Unit.
                      </th>
                      <th className="py-3 px-4 text-right text-[10px] font-bold uppercase tracking-widest w-32 rounded-r-sm">
                        Total HT
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {showPreview.items.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="py-4 px-4 font-medium text-slate-700">{item.description}</td>
                        <td className="py-4 px-4 text-center text-slate-600">{item.quantity}</td>
                        <td className="py-4 px-4 text-right text-slate-600 font-mono">
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-slate-900 font-mono">
                          {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Notes */}
              <div className="flex justify-between items-start mb-16">
                <div className="w-1/2 pr-12 space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Conditions & Notes
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-sm border border-slate-100">
                      {'paidAmount' in showPreview ? (
                        <>
                          Cette facture est à régler avant le{' '}
                          {new Date(
                            (showPreview as any).dueDate || Date.now(),
                          ).toLocaleDateString()}
                          .<br />
                          <br />
                          <strong>Mode de paiement :</strong> Chèque ou Virement bancaire.
                          <br />
                          En cas de retard, des pénalités peuvent s'appliquer.
                        </>
                      ) : (
                        <>
                          Ce devis est valable jusqu'au{' '}
                          {new Date(
                            (showPreview as any).validUntil || Date.now(),
                          ).toLocaleDateString()}
                          .<br />
                          <br />
                          <strong>Délai de livraison :</strong> 2 semaines après validation.
                          <br />
                          <strong>Mode de paiement :</strong> Chèque ou Virement bancaire.
                          <br />
                          <strong>Acompte :</strong> 50% à la commande, solde à la livraison.
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Coordonnées Bancaires
                    </h4>
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
                      <span className="font-mono">
                        {showPreview.totalAmount.toLocaleString()} CFA
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>TVA (18%)</span>
                      <span className="font-mono">
                        {(showPreview.totalAmount * 0.18).toLocaleString()} CFA
                      </span>
                    </div>
                    <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center mt-2">
                      <span className="font-black text-slate-900 uppercase tracking-widest text-sm">
                        Net à Payer
                      </span>
                      <span className="font-black text-3xl text-sky-600 font-mono">
                        {(showPreview.totalAmount * 1.18).toLocaleString()}{' '}
                        <span className="text-sm text-slate-400 font-normal">CFA</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-24 mt-20 pt-10 border-t border-slate-200">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Bon pour accord (Date & Signature)
                  </p>
                  <div className="h-32 bg-slate-50 border border-slate-200 border-dashed rounded-sm"></div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-right">
                    La Direction ENEA TELECOM
                  </p>
                  <div className="h-32 relative">
                    {/* Signature placeholder or image could go here */}
                    <div className="absolute bottom-0 right-0 font-script text-slate-300 text-4xl transform -rotate-12 pr-8 pb-4 opacity-50 select-none">
                      EneaTelecom
                    </div>
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
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-bold transition-all"
              >
                <Printer size={18} /> Imprimer Direct
              </button>
              <button
                onClick={() => handleEmail(showPreview!)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-sm hover:bg-slate-50 font-bold transition-all"
              >
                <Mail size={18} /> Email
              </button>
              <button
                onClick={() => handleWhatsApp(showPreview!)}
                className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 shadow-lg shadow-green-900/10 font-bold transition-all"
              >
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>
      <style>{`
                @media print {
                    .no-print { display: none !important; }
                    #printable-area { border: none !important; box-shadow: none !important; }
                }
            `}</style>
      <InvoiceScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        companyId={companyId}
        onSave={(transaction) => {
          createTransaction(transaction);
        }}
      />
    </div>
  );
};

const Save = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);
