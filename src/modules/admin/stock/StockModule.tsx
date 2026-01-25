import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { StockItem, Supplier, StockMovement, StockMovementItem, PurchaseOrder } from '@/types';
import { SectionHeader } from '@/components/admin/shared/AdminShared';
import { Plus, ScanBarcode } from 'lucide-react';
import { useStock } from './hooks/useStock';
import { useCrm } from '@/modules/admin/crm/hooks/useCrm';
import { useAuth } from '@/contexts/AuthContext';

// Components
import { ProductList } from './components/ProductList';
import { ProductModal } from './components/ProductModal';
import { SupplierList } from './components/SupplierList';
import { SupplierModal } from './components/SupplierModal';
import { MovementList } from './components/MovementList';
import { MovementModal } from './components/MovementModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { BarcodeModal } from './components/BarcodeModal';
import { OrderModal } from './components/OrderModal';
import { Modal, InputField, Badge } from '@/components/admin/shared/AdminShared';
import {
  Trash2,
  ShoppingCart,
  Info,
  Eye,
  Download,
  Truck,
  Calendar,
  Receipt,
  TrendingUp,
  Check,
  ArrowRight,
  Brain,
  Zap,
  Sparkles,
  Filter,
  Library,
  PieChart as PieIcon,
  Bell,
  RotateCcw,
} from 'lucide-react';
import { InventoryReconciliation } from './components/InventoryReconciliation';
import { NotificationCenter } from '@/components/admin/shared/NotificationCenter';
import { ExportButton } from '@/components/admin/shared/ExportButton';
import {
  Skeleton,
  TableRowSkeleton,
  DashboardStatsSkeleton,
} from '@/components/admin/shared/Skeleton';
import { DataTable } from '@/components/admin/shared/DataTable';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { PurchaseOrderPDF } from './components/PurchaseOrderPDF';
import { Printer, Mail, MessageCircle } from 'lucide-react';

interface StockModuleProps {
  companyId: string;
}

export const StockModule: React.FC<StockModuleProps> = ({ companyId }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  const {
    items: stock,
    suppliers,
    movements,
    categories,
    purchaseOrders,
    isLoading: stockLoading,
    createItem,
    updateItem,
    deleteItem,
    createCategory,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createMovement,
    validateMovement,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
  } = useStock(companyId, { year: selectedYear, month: selectedMonth });
  const { contacts: crmData, isLoading: crmLoading } = useCrm(companyId);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies', companyId],
    queryFn: () => apiFetch(`/erp/${companyId}/currencies`),
  });

  const baseCurrency = currencies.find((c: any) => c.isBase)?.code || 'XOF';

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'suppliers' | 'movements' | 'orders' | 'inventory'
  >('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const data = { stock, suppliers, movements, purchaseOrders };

  // Filtrer les produits pour la recherche / scan
  const filteredStock = React.useMemo(() => {
    if (!searchQuery) return stock;
    const q = searchQuery.toLowerCase();
    return stock.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.ref && item.ref.toLowerCase().includes(q)) ||
        (item.barcode && item.barcode.includes(q)),
    );
  }, [stock, searchQuery]);

  // États d'édition
  const [editingProduct, setEditingProduct] = useState<StockItem | null>(null);
  const [viewingProduct, setViewingProduct] = useState<StockItem | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingMovement, setEditingMovement] = useState<StockMovement | null>(null);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [showOrderPreview, setShowOrderPreview] = useState<PurchaseOrder | null>(null);
  const [printingLabel, setPrintingLabel] = useState<StockItem | null>(null);

  const handleReplenish = (product: StockItem) => {
    setViewingProduct(null);
    setEditingOrder({
      id: 'new-' + Date.now(),
      reference: `CMD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      supplierId: product.supplierId || '',
      supplierName: product.supplier?.name || '',
      totalAmount: 0,
      items: [
        {
          id: 'new-item-' + Date.now(),
          stockId: product.id,
          description: product.name,
          quantity: 10,
          unitPrice: product.value,
          total: 10 * product.value,
        },
      ],
    } as PurchaseOrder); // Cast to avoid TS issues if partial
    setActiveTab('orders');
  };

  const isLoading = stockLoading || crmLoading;

  // --- Utils ---
  const generateRef = () => `ART-${Math.floor(1000 + Math.random() * 9000)}`;

  const generateBarcode = () => {
    // Generate valid EAN-13
    const prefix = '618'; // Côte d'Ivoire prefix
    const randomPart = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 digits
    const code12 = prefix + randomPart;

    // Calculate Check Digit
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code12[i]);
      // EAN-13: Odd positions (index 0, 2...) weight 1, Even positions (index 1, 3...) weight 3
      // NOTE: Standard definition is from right to left, but for calculation on first 12:
      // Index 0 (1st digit) -> Weight 1
      // Index 1 (2nd digit) -> Weight 3
      sum += (i % 2 === 0) ? digit * 1 : digit * 3;
    }

    const remainder = sum % 10;
    const checkDigit = remainder === 0 ? 0 : 10 - remainder;

    return `${code12}${checkDigit}`;
  };

  // --- Logic Produits ---
  const saveProduct = () => {
    if (!editingProduct) return;

    // Clean up relation objects to avoid backend errors
    const { categoryRel, supplier, movements, ...cleanProduct } = editingProduct as any;

    if (cleanProduct.id && !cleanProduct.id.startsWith('new-')) {
      updateItem(cleanProduct);
    } else {
      const { id, ...rest } = cleanProduct;
      createItem(rest);
    }
    setEditingProduct(null);
  };

  // --- Logic Fournisseurs ---
  const saveSupplier = () => {
    if (!editingSupplier) return;
    if (editingSupplier.id && !editingSupplier.id.startsWith('new-')) {
      updateSupplier(editingSupplier);
    } else {
      const { id, ...rest } = editingSupplier;
      createSupplier(rest);
    }
    setEditingSupplier(null);
  };

  // --- Logic Mouvements ---
  const saveMovement = async () => {
    if (!editingMovement) return;

    const totalValue = editingMovement.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const movementData = {
      ...editingMovement,
      totalValue,
    };

    if (editingMovement.id && !editingMovement.id.startsWith('new-')) {
      // ... existing update logic/comments
    } else {
      const { id, ...rest } = movementData;
      await createMovement(rest);
    }
    setEditingMovement(null);
  };

  const validateAndSaveMovement = async () => {
    if (!editingMovement) return;

    const totalValue = editingMovement.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const movementData = {
      ...editingMovement,
      totalValue,
    };

    try {
      let movementId = editingMovement.id;

      if (!movementId || movementId.startsWith('new-')) {
        const { id, ...rest } = movementData;
        const result = await createMovement(rest);
        movementId = (result as any).id;
      }

      if (movementId) {
        await validateMovement(movementId);
      }

      setEditingMovement(null);
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      alert('Erreur lors de la validation du mouvement.');
    }
  };

  // --- Logic Commandes ---
  const saveOrder = () => {
    if (!editingOrder) return;

    // Clean up relation properties if any exist that shouldn't be sent
    const { supplier, items, ...orderData } = editingOrder as any; // Using any to destructure potential extra props

    // Always send items array
    const payload = {
      ...orderData,
      items: editingOrder.items,
    };

    if (editingOrder.id && !editingOrder.id.startsWith('new-')) {
      updatePurchaseOrder(payload);
    } else {
      const { id, ...rest } = payload;
      createPurchaseOrder(rest);
    }
    setEditingOrder(null);
  };

  const handleAutoOrder = (supplierId: string, itemsToRestock: StockItem[]) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    setEditingOrder({
      id: 'new-' + Date.now(),
      reference: `AUTO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Draft',
      supplierId: supplierId,
      supplierName: supplier?.name || 'Inconnu',
      totalAmount: itemsToRestock.reduce((acc, i) => acc + i.value * (i.minThreshold * 2), 0),
      items: itemsToRestock.map((i) => ({
        id: 'new-item-' + Math.random(),
        stockId: i.id,
        description: i.name,
        quantity: i.minThreshold * 2, // Suggest double the min threshold
        unitPrice: i.value,
        total: i.minThreshold * 2 * i.value,
      })),
    } as PurchaseOrder);
    setActiveTab('orders');
  };

  // Calculate smart suggestions
  const replenishmentSuggestions = React.useMemo(() => {
    const lowStock = stock.filter(
      (i) => i.quantity <= (i.minThreshold || 5) && i.type === 'Produit',
    );
    const groupedBySupplier: Record<string, StockItem[]> = {};

    lowStock.forEach((item) => {
      const sId = item.supplierId || 'unknown';
      if (!groupedBySupplier[sId]) groupedBySupplier[sId] = [];
      groupedBySupplier[sId].push(item);
    });

    return Object.entries(groupedBySupplier).map(([sId, items]) => ({
      supplierId: sId,
      supplierName: suppliers.find((s) => s.id === sId)?.name || 'Sans Fournisseur',
      items,
    }));
  }, [stock, suppliers]);

  // Calculate dynamic chart data for the last 30 days or selected month
  const chartData = React.useMemo(() => {
    // Mode 1: Month View (Specific month selected)
    if (selectedMonth) {
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const dataMap = new Map<string, { date: string; in: number; out: number }>();

      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(selectedYear, selectedMonth - 1, i);
        const key = d.toISOString().split('T')[0];
        const label = `${i.toString().padStart(2, '0')}/${selectedMonth.toString().padStart(2, '0')}`;
        dataMap.set(key, { date: label, in: 0, out: 0 });
      }

      movements.forEach(m => {
        const mDate = new Date(m.date);
        if (mDate.getFullYear() === selectedYear && mDate.getMonth() === (selectedMonth - 1)) {
          const key = mDate.toISOString().split('T')[0];
          const entry = dataMap.get(key);
          if (entry) {
            if (m.type === 'Reception') entry.in += m.totalValue || 0;
            else if (m.type === 'Livraison') entry.out += m.totalValue || 0;
          }
        }
      });
      return Array.from(dataMap.values());
    }

    // Mode 2: Last 30 Days (Default)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dataMap = new Map<string, { date: string; in: number; out: number }>();

    for (let i = 0; i <= 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      dataMap.set(key, { date: label, in: 0, out: 0 });
    }

    movements.forEach(m => {
      const mDate = new Date(m.date);
      if (mDate >= thirtyDaysAgo && mDate <= today) {
        const key = mDate.toISOString().split('T')[0];
        const entry = dataMap.get(key);
        if (entry) {
          if (m.type === 'Reception') entry.in += m.totalValue || 0;
          else if (m.type === 'Livraison') entry.out += m.totalValue || 0;
        }
      }
    });

    return Array.from(dataMap.values());
  }, [movements, selectedYear, selectedMonth]);

  if (isLoading)
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton width={300} height={32} />
            <Skeleton width={200} height={16} />
          </div>
          <div className="flex gap-4">
            <Skeleton width={150} height={40} />
            <Skeleton width={150} height={40} />
          </div>
        </div>

        <div className="bg-white rounded-sm border border-slate-200 shadow-sm p-4 space-y-4">
          <TableRowSkeleton columns={6} />
          <TableRowSkeleton columns={6} />
          <TableRowSkeleton columns={6} />
          <TableRowSkeleton columns={6} />
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-sm w-fit border border-slate-200 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Articles & Matériel
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === 'movements' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Mouvements
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Commandes Fourn.
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === 'suppliers' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Fournisseurs
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2.5 text-sm font-semibold rounded-sm transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Inventaire
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 border border-slate-200 rounded-sm shadow-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-sm border border-slate-100">
            {/* Using Filter icon but check import */}
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Filtres
            </span>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="w-px h-4 bg-slate-200"></div>
          <select
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value ? Number(e.target.value) : undefined)}
            className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer hover:bg-slate-50 rounded-sm"
          >
            <option value="">Toute l'année</option>
            {[
              'Janvier',
              'Février',
              'Mars',
              'Avril',
              'Mai',
              'Juin',
              'Juillet',
              'Août',
              'Septembre',
              'Octobre',
              'Novembre',
              'Décembre',
            ].map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <SectionHeader
            title="Tableau de Bord Logistique"
            subtitle="Analyse en temps réel de vos stocks et flux"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Valeur Totale Stock
              </p>
              <p className="text-2xl font-black text-slate-900 line-clamp-1">
                {stock.reduce((acc, i) => acc + i.quantity * i.value, 0).toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">{baseCurrency}</span>
              </p>
              <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp size={10} /> +2.4% vs mois dernier
              </div>
            </div>
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm border-l-4 border-l-sky-500">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Références Actives
              </p>
              <p className="text-2xl font-black text-slate-900">{stock.length}</p>
              <div className="mt-2 text-[10px] font-bold text-slate-400">
                {stock.filter((i) => i.type === 'Produit').length} Produits /{' '}
                {stock.filter((i) => i.type === 'Service').length} Services
              </div>
            </div>
            <div
              className={`bg-white p-6 rounded-sm border border-slate-200 shadow-sm ${stock.filter((i) => i.quantity <= (i.minThreshold || 5)).length > 0 ? 'border-l-4 border-l-red-500' : ''}`}
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Alertes de Rupture
              </p>
              <p
                className={`text-2xl font-black ${stock.filter((i) => i.quantity <= (i.minThreshold || 5)).length > 0 ? 'text-red-600' : 'text-slate-900'}`}
              >
                {stock.filter((i) => i.quantity <= (i.minThreshold || 5)).length}
              </p>
              <div className="mt-2 text-[10px] font-bold text-slate-400">
                Articles sous le seuil critique
              </div>
            </div>
            <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Commandes en cours
              </p>
              <p className="text-2xl font-black text-slate-900">
                {purchaseOrders.filter((o) => o.status === 'Ordered').length}
              </p>
              <div
                className="mt-2 text-[10px] font-bold text-sky-600 cursor-pointer hover:underline"
                onClick={() => setActiveTab('orders')}
              >
                Voir les réceptions attendues
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-sm border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-sky-600 rounded-full"></div>
                  Évolution des Flux ({selectedMonth ? 'Mensuel' : '30j'})
                </h4>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                  >
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 'bold' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 'bold' }}
                      tickFormatter={(val) => `${val / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '4px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="in"
                      name="Entrées"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIn)"
                    />
                    <Area
                      type="monotone"
                      dataKey="out"
                      name="Sorties"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOut)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-sm p-8 text-white relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ScanBarcode size={120} />
              </div>
              <h4 className="font-extrabold text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                Alertes & Vigilance
              </h4>

              <div className="flex-1 space-y-6">
                {/* Low Stock */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Stock Critique
                  </p>
                  {stock.filter((i) => i.quantity <= (i.minThreshold || 5)).length === 0 ? (
                    <div className="bg-white/5 p-3 rounded-sm border border-white/5 text-[10px] font-bold text-slate-400">
                      Aucune rupture détectée
                    </div>
                  ) : (
                    stock
                      .filter((i) => i.quantity <= (i.minThreshold || 5))
                      .slice(0, 3)
                      .map((i) => (
                        <div
                          key={i.id}
                          className="group cursor-pointer bg-white/5 border border-white/5 hover:border-white/20 p-3 rounded-sm transition-all"
                          onClick={() => {
                            setViewingProduct(i);
                            setActiveTab('products');
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-xs text-white truncate w-32">{i.name}</p>
                            <span className="text-[9px] font-black text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">
                              {i.quantity} {i.unit}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Expiry Alerts */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Péremption Proche
                  </p>
                  {stock.filter(
                    (i) =>
                      i.expiryDate &&
                      new Date(i.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  ).length === 0 ? (
                    <div className="bg-white/5 p-3 rounded-sm border border-white/5 text-[10px] font-bold text-slate-400">
                      Aucun produit périssable
                    </div>
                  ) : (
                    stock
                      .filter(
                        (i) =>
                          i.expiryDate &&
                          new Date(i.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                      )
                      .slice(0, 3)
                      .map((i) => (
                        <div
                          key={i.id}
                          className="group cursor-pointer bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 p-3 rounded-sm transition-all"
                          onClick={() => {
                            setViewingProduct(i);
                            setActiveTab('products');
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-xs text-amber-400 truncate w-32">
                              {i.name}
                            </p>
                            <span className="text-[9px] font-black text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded-full">
                              {Math.ceil(
                                (new Date(i.expiryDate!).getTime() - Date.now()) /
                                (1000 * 60 * 60 * 24),
                              )}{' '}
                              j
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('products')}
                className="mt-8 w-full py-4 border border-white/10 rounded-sm text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
              >
                Consulter l'inventaire
              </button>
            </div>
          </div>

          {/* Smart Procurement Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                <Brain size={20} className="text-amber-500" />
                Smart Procurement{' '}
                <span className="text-[10px] font-bold text-slate-400 opacity-50 ml-2">
                  Suggestions d'IA
                </span>
              </h4>
              {replenishmentSuggestions.length > 0 && (
                <Badge color="amber" className="animate-pulse">
                  Réapprovisionnement Recommandé
                </Badge>
              )}
            </div>

            {replenishmentSuggestions.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-sm p-12 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Zap size={24} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400">
                  Vos stocks sont actuellement optimaux. Aucune suggestion d'achat nécessaire.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {replenishmentSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm hover:shadow-md transition-all group border-t-4 border-t-amber-400"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Fournisseur
                        </p>
                        <h5 className="font-black text-slate-900">{suggestion.supplierName}</h5>
                      </div>
                      <div className="bg-amber-50 p-2 rounded-sm">
                        <Sparkles size={16} className="text-amber-600" />
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {suggestion.items.slice(0, 3).map((item, iIdx) => (
                        <div key={iIdx} className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium truncate w-32">
                            {item.name}
                          </span>
                          <span className="font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm">
                            {item.quantity} / {item.minThreshold}
                          </span>
                        </div>
                      ))}
                      {suggestion.items.length > 3 && (
                        <p className="text-[10px] text-slate-400 font-bold italic">
                          + {suggestion.items.length - 3} autres articles
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleAutoOrder(suggestion.supplierId, suggestion.items)}
                      className="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-black transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                    >
                      <ShoppingCart size={14} /> Pré-remplir la commande
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <>
          <SectionHeader
            title="Inventaire des articles"
            subtitle={`${data.stock.length} articles référencés`}
            actions={
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Scan code-barres ou recherche..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-sm w-64 md:w-80 focus:outline-none focus:border-sky-500 font-bold text-sm bg-white shadow-sm"
                    autoFocus
                  />
                  <div className="absolute left-3 top-3 text-slate-400">
                    <ScanBarcode size={18} />
                  </div>
                </div>
                <ExportButton data={stock} fileName="inventaire_stock" />
                <button
                  onClick={() =>
                    setEditingProduct({
                      id: 'new-' + Date.now(),
                      type: 'Produit',
                      ref: generateRef(),
                      barcode: generateBarcode(),
                      name: '',
                      category: '',
                      categoryId: '',
                      supplierId: '',
                      quantity: 0,
                      unit: 'u',
                      minThreshold: 5,
                      location: '',
                      value: 0,
                      status: 'Brouillon',
                    } as any)
                  }
                  className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold"
                >
                  <Plus size={18} /> Ajouter un article
                </button>
              </div>
            }
          />
          <ProductList
            products={filteredStock}
            onEdit={setEditingProduct}
            onDelete={deleteItem}
            onViewDetails={setViewingProduct}
            onPrintLabel={setPrintingLabel}
          />
        </>
      )}

      {activeTab === 'suppliers' && (
        <>
          <SectionHeader
            title="Base Fournisseurs"
            actions={
              <div className="flex gap-3">
                <ExportButton data={suppliers} fileName="fournisseurs_stock" />
                <button
                  onClick={() =>
                    setEditingSupplier({
                      id: 'new-' + Date.now(),
                      name: '',
                      contactName: '',
                      email: '',
                      phone: '',
                      address: '',
                      category: '',
                    })
                  }
                  className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold"
                >
                  <Plus size={18} /> Nouveau Fournisseur
                </button>
              </div>
            }
          />
          <SupplierList suppliers={data.suppliers} onEdit={setEditingSupplier} />
        </>
      )}

      {activeTab === 'movements' && (
        <>
          <SectionHeader
            title="Suivi des Mouvements"
            subtitle="Entrées et sorties d'entrepôt"
            actions={
              <div className="flex gap-3">
                <ExportButton data={movements} fileName="mouvements_stock" />
                <button
                  onClick={() =>
                    setEditingMovement({
                      id: 'new-' + Date.now(),
                      type: 'Reception',
                      reference: '',
                      date: new Date().toISOString().split('T')[0],
                      partnerId: '',
                      partnerName: '',
                      status: 'Brouillon',
                      totalValue: 0,
                      items: [],
                    })
                  }
                  className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold"
                >
                  <Plus size={18} /> Créer un mouvement
                </button>
              </div>
            }
          />
          <MovementList movements={data.movements} onEdit={setEditingMovement} />
        </>
      )}

      {activeTab === 'orders' && (
        <>
          <SectionHeader
            title="Commandes Fournisseurs"
            subtitle="Gestion des achats et approvisionnements"
            actions={
              <div className="flex gap-3">
                <ExportButton data={purchaseOrders} fileName="commandes_fournisseurs" />
                <button
                  onClick={() =>
                    setEditingOrder({
                      id: 'new-' + Date.now(),
                      reference: `CMD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
                      date: new Date().toISOString().split('T')[0],
                      status: 'Draft',
                      supplierId: '',
                      supplierName: '',
                      totalAmount: 0,
                      items: [],
                    } as PurchaseOrder)
                  }
                  className="bg-sky-600 text-white px-5 py-2.5 rounded-sm flex items-center gap-2 hover:bg-sky-700 transition-all shadow-lg shadow-sky-900/10 font-bold"
                >
                  <Plus size={18} /> Nouvelle Commande
                </button>
              </div>
            }
          />

          <DataTable<PurchaseOrder>
            data={purchaseOrders}
            searchPlaceholder="Rechercher une commande ou fournisseur..."
            searchKeys={['reference', 'supplierName']}
            columns={[
              {
                header: 'Date & Réf',
                accessor: (order) => (
                  <div className="py-1">
                    <div className="font-bold text-slate-800">{order.reference}</div>
                    <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5 uppercase">
                      <Calendar size={10} /> {new Date(order.date).toLocaleDateString()}
                    </div>
                  </div>
                ),
                sortable: true,
              },
              {
                header: 'Fournisseur',
                accessor: (order) => (
                  <div className="font-semibold text-slate-700">
                    {order.supplierName || 'Fournisseur inconnu'}
                  </div>
                ),
                sortable: true,
              },
              {
                header: 'Montant Total',
                accessor: (order) => (
                  <div className="font-black text-slate-900">
                    {order.totalAmount.toLocaleString()}{' '}
                    <span className="text-[10px] font-bold text-slate-400">CFA</span>
                  </div>
                ),
                sortable: true,
              },
              {
                header: 'Statut',
                accessor: (order) => (
                  <Badge
                    color={
                      order.status === 'Received'
                        ? 'green'
                        : order.status === 'Ordered'
                          ? 'blue'
                          : order.status === 'Cancelled'
                            ? 'red'
                            : 'slate'
                    }
                  >
                    {order.status === 'Draft'
                      ? 'Brouillon'
                      : order.status === 'Ordered'
                        ? 'Commandée'
                        : order.status === 'Received'
                          ? 'Reçue'
                          : 'Annulée'}
                  </Badge>
                ),
                sortable: true,
              },
            ]}
            actions={(order) => (
              <div className="flex items-center justify-end gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => setShowOrderPreview(order)}
                  className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                  title="Aperçu & PDF"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => setEditingOrder(order)}
                  className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-sm transition-all"
                  title="Éditer"
                >
                  <Receipt size={18} />
                </button>
                {order.status === 'Ordered' && (
                  <button
                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-sm transition-all"
                    title="Réceptionner"
                    onClick={() => {
                      if (confirm('Créer un mouvement de réception pour cette commande ?')) {
                        setEditingMovement({
                          id: 'new-reception-' + Date.now(),
                          type: 'Reception',
                          reference: 'RCP-' + order.reference,
                          date: new Date().toISOString().split('T')[0],
                          partnerId: order.supplierId,
                          partnerName: order.supplierName,
                          status: 'Brouillon',
                          totalValue: order.totalAmount,
                          items: order.items.map((i) => ({
                            stockId: i.stockId || '',
                            description: i.description,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                          })),
                        });
                        setActiveTab('movements');
                      }
                    }}
                  >
                    <Truck size={18} />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Supprimer cette commande ?')) deletePurchaseOrder(order.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
            onRowClick={(order) => setEditingOrder(order)}
          />
        </>
      )}

      {activeTab === 'inventory' && (
        <InventoryReconciliation
          stock={stock}
          companyId={companyId}
          onSave={async (m) => {
            const res = await createMovement(m);
            if ((res as any).id) await validateMovement((res as any).id);
          }}
          onRefresh={() => {
            queryClient.invalidateQueries({ queryKey: ['stock', companyId] });
            queryClient.invalidateQueries({ queryKey: ['movements', companyId] });
          }}
        />
      )}

      <ProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        suppliers={suppliers}
        categories={categories}
        onSave={saveProduct}
        onChange={setEditingProduct}
        onCreateCategory={createCategory}
        onGenerateBarcode={generateBarcode}
      />

      <SupplierModal
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(null)}
        supplier={editingSupplier}
        onSave={saveSupplier}
        onChange={setEditingSupplier}
      />

      <OrderModal
        isOpen={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        order={editingOrder}
        stock={stock}
        suppliers={suppliers}
        onSave={saveOrder}
        onChange={setEditingOrder}
      />

      <MovementModal
        isOpen={!!editingMovement}
        onClose={() => setEditingMovement(null)}
        movement={editingMovement}
        stock={stock}
        suppliers={suppliers}
        crmContacts={crmData}
        onSave={saveMovement}
        onValidate={validateAndSaveMovement}
        onChange={setEditingMovement}
      />

      <ProductDetailsModal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        movements={movements}
        onReplenish={handleReplenish}
      />

      {/* --- MODAL PREVIEW COMMANDE --- */}
      <Modal
        isOpen={!!showOrderPreview}
        onClose={() => setShowOrderPreview(null)}
        title={`Aperçu Commande: ${showOrderPreview?.reference}`}
        size="xl"
      >
        {showOrderPreview && (
          <div className="p-4 space-y-8">
            {/* Fake PDF Preview Area */}
            <div
              id="order-printable-area"
              className="bg-white border border-slate-200 shadow-2xl p-12 max-w-4xl mx-auto min-h-[800px] text-slate-800 font-sans"
            >
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                    ENEA TELECOM
                  </h2>
                  <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mt-1">
                    Infrastructures & Réseaux
                  </p>
                  <div className="mt-6 text-xs text-slate-500 font-medium space-y-1">
                    <p>Cocody Riviera 3, Abidjan</p>
                    <p>+225 27 22 40 40 40</p>
                    <p>RCCM: CI-ABJ-2013-B-345</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-slate-900 text-white px-4 py-2 inline-block font-black text-sm uppercase tracking-widest mb-4">
                    Bon de Commande
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-1">
                    {showOrderPreview.reference}
                  </p>
                  <p className="text-xs text-slate-400 font-bold">
                    Date: {new Date(showOrderPreview.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Expédier à (Destination)
                  </h4>
                  <p className="font-bold text-slate-800">ENEA TELECOM - Dépôt Central</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Riviera 3, Lot 456
                    <br />
                    Att: Responsable Logistique
                    <br />
                    Abidjan, Côte d'Ivoire
                  </p>
                </div>
                <div className="bg-sky-50/50 p-6 rounded-sm border border-sky-100/50">
                  <h4 className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3">
                    Fournisseur
                  </h4>
                  <p className="font-black text-slate-900 text-lg">
                    {showOrderPreview.supplierName}
                  </p>
                  <div className="text-xs text-slate-500 mt-2 space-y-1 font-medium">
                    <p>ID: {showOrderPreview.supplierId?.slice(0, 8)}</p>
                    {suppliers.find((s) => s.id === showOrderPreview.supplierId) && (
                      <>
                        <p>{suppliers.find((s) => s.id === showOrderPreview.supplierId)?.phone}</p>
                        <p>{suppliers.find((s) => s.id === showOrderPreview.supplierId)?.email}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-sm overflow-hidden mb-12">
                <table className="w-full text-xs">
                  <thead className="bg-slate-900 text-white uppercase font-bold tracking-widest">
                    <tr>
                      <th className="py-3 px-4 text-left">Désignation</th>
                      <th className="py-3 px-4 text-center">Qté</th>
                      <th className="py-3 px-4 text-right">P.U. (CFA)</th>
                      <th className="py-3 px-4 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {showOrderPreview.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-4 px-4 font-bold text-slate-800">{item.description}</td>
                        <td className="py-4 px-4 text-center font-black">{item.quantity}</td>
                        <td className="py-4 px-4 text-right font-mono">
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-right font-black text-slate-900 font-mono">
                          {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-16">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    <span>Total Commande HT</span>
                    <span className="font-black text-slate-900">
                      {showOrderPreview.totalAmount.toLocaleString()} CFA
                    </span>
                  </div>
                  <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">
                      Net à Payer
                    </span>
                    <span className="font-black text-3xl text-sky-600">
                      {showOrderPreview.totalAmount.toLocaleString()}{' '}
                      <span className="text-sm text-slate-400 font-normal">CFA</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-24 mt-20 pt-10 border-t border-slate-200">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Visa Responsable Achats
                  </p>
                  <div className="h-24 bg-slate-50 border border-slate-200 border-dashed rounded-sm"></div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Tampon Fournisseur (Réception)
                  </p>
                  <div className="h-24 bg-slate-50 border border-slate-200 border-dashed rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 no-print justify-center pt-8 border-t border-slate-100">
              <PDFDownloadLink
                document={
                  <PurchaseOrderPDF
                    order={showOrderPreview}
                    supplier={suppliers.find((s) => s.id === showOrderPreview.supplierId)}
                  />
                }
                fileName={`${showOrderPreview.reference}.pdf`}
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
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-sm hover:bg-slate-900 font-bold transition-all"
              >
                <Printer size={18} /> Imprimer
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-sm hover:bg-slate-50 font-bold transition-all">
                <Mail size={18} /> Envoyer Email
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 shadow-lg shadow-green-900/10 font-bold transition-all">
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>

      <BarcodeModal
        isOpen={!!printingLabel}
        onClose={() => setPrintingLabel(null)}
        product={printingLabel}
      />
    </div>
  );
};
