export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  features: string[];
  iconName: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface OfficeLocation {
  country: string;
  flag: string;
  year: string;
  status: string;
}

export interface GalleryItem {
  caption: string;
  category: string;
  imageUrl?: string;
}

export interface CareerItem {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
}

export interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
}

// --- ERP Interfaces ---

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  category: string;
}

export interface StockCategory {
  id: string;
  name: string;
}

export interface StockItem {
  id: string;
  ref: string;
  barcode?: string;
  name: string;
  brand?: string;
  type: 'Produit' | 'Service'; // Distinction Produit vs Service
  description?: string;
  category: string; // Gardé pour compatibilité
  categoryId?: string;
  categoryRel?: StockCategory;
  supplierId?: string;
  supplier?: Supplier;
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  value: number; // Prix d'achat/Revient/Coût horaire
  sellingPrice?: number; // Prix de vente
  imageUrl?: string;
  batchNumber?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  status: 'Publié' | 'Brouillon';
}

export interface StockMovementItem {
  stockId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface StockMovement {
  id: string;
  type: 'Reception' | 'Livraison'; // Entrée (Fournisseur) ou Sortie (Client)
  reference: string;
  date: string;
  partnerId: string; // ID Fournisseur ou ID Client CRM
  partnerName: string;
  items: StockMovementItem[];
  status: 'Brouillon' | 'Validé';
  totalValue: number;
}

export interface Employee {
  id: string;
  matricule: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone?: string;
  address?: string;
  baseSalary?: number; // Salaire brut mensuel
  status: 'Actif' | 'Congé' | 'Arrêt' | 'Sorti';
  contractType: string;
  role: string;
  password?: string;
  joinDate: string;
  faceDescriptor?: string;
  companyId?: string; // Company/Entity affectation
}

export interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  period: string; // Format YYYY-MM
  date: string;

  // Gains
  baseSalary: number;
  transportPrime: number;
  housingPrime: number;
  otherBonuses: number;
  grossSalary: number; // Brut total

  // Retenues
  cnpsDeduction: number; // Charges sociales
  taxDeduction: number; // IOTS/Impôts
  otherDeductions: number;

  // Net
  netSalary: number;

  // Part Patronale (Portail Employeur / Partail Emplayer)
  cnpsEmployer: number;
  taxEmployer: number;
  totalEmployer: number;

  status: 'Brouillon' | 'Validé' | 'Payé';
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'Présent' | 'Retard' | 'Absent' | 'Injustifié';
  companyId: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  companyId: string;
  approvedAt?: string;
}

export interface PurchaseOrderItem {
  id: string;
  stockId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  reference: string;
  date: string;
  expectedDate?: string;
  status: 'Draft' | 'Ordered' | 'Received' | 'Cancelled';
  totalAmount: number;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
}

export interface Transaction {
  id: string;
  date: string;
  ref: string;
  label: string;
  category: string; // ex: 601 - Achats, 706 - Services
  amount: number;
  currency?: string;
  currencyRate?: number;
  type: 'Debit' | 'Credit';
  status: 'Validé' | 'Brouillon' | 'En attente';
}

export interface QuoteItem {
  id: string;
  stockId?: string; // Lien optionnel vers le stock
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  reference: string;
  clientId: string; // Lien CRM
  clientName: string;
  date: string;
  validUntil: string;
  items: QuoteItem[];
  totalAmount: number;
  currency?: string;
  currencyRate?: number;
  status: 'Brouillon' | 'Envoyé' | 'Accepté' | 'Refusé' | 'Facturé';
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  reference: string;
  clientId?: string;
  clientName: string;
  date: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';
  totalAmount: number;
  paidAmount: number;
  currency?: string;
  currencyRate?: number;
  items: InvoiceItem[];
  quoteId?: string;
}

// --- CRM Interfaces ---

export interface CRMContact {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  website?: string;
  notes?: string;
  industry?: string;
  type: 'Prospect' | 'Client' | 'Partenaire';
  status: 'Actif' | 'Inactif' | 'Lead';
  lastContact: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Todo' | 'In Progress' | 'Done' | 'Archived';
  dueDate?: string;
  assignedToId?: string;
  assignedToName?: string; // Helpful for frontend display

  // "Tagging" - Relations
  clientId?: string;
  clientName?: string;
  supplierId?: string;
  supplierName?: string;
  productId?: string;
  productName?: string;

  // New functionalities
  category?: string;
  tags?: string[];
  startDate?: string;
  completedAt?: string;
  estimatedHours?: number;
  actualHours?: number;

  // Relations return by API
  client?: CRMContact;
  supplier?: Supplier;
  product?: StockItem;
  assignedTo?: Employee;
}

export interface CRMDeal {
  id: string;
  title: string;
  contactId: string; // Link to CRMContact
  amount: number;
  stage: 'Nouveau' | 'Qualification' | 'Proposition' | 'Négociation' | 'Gagné' | 'Perdu';
  probability: number; // 0-100
  closingDate: string;
  currency?: string;
  currencyRate?: number;
}

export interface SiteContent {
  // --- Identité Entreprise (Multi-sociétés) ---
  id: string;
  entityName: string;
  country: string;
  currency: string;
  flag: string; // Emoji drapeau
  slug: string;

  // --- Nouveaux champs d'identité ---
  logo?: string;
  activity?: string;
  sector?: string;
  legalForm?: string;
  capital?: string;
  ncc?: string;
  rccm?: string;
  manager?: string;
  tvaRate?: number;
  address?: string;
  city?: string;
  bp?: string;
  phone?: string;
  email?: string;

  seo: SEOConfig;
  hero: {
    title: string;
    subtitle: string;
    tagline: string;
    imageUrl?: string;
  };
  about: {
    title: string;
    description: string;
    vision: string;
    mission: string;
    values: string;
  };
  services: ServiceItem[];
  stats: StatItem[];
  locations: OfficeLocation[];
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
  };
  realizations: {
    works: string[];
    gallery: GalleryItem[];
  };
  careers: {
    title: string;
    subtitle: string;
    description: string;
    contactEmail: string;
    openings: CareerItem[];
  };
  clients: string[];

  // Modules ERP
  erp: {
    stock: StockItem[];
    suppliers: Supplier[];
    movements: StockMovement[];
    hr: Employee[];
    payslips: Payslip[]; // Ajout des bulletins
    accounting: Transaction[];
    quotes: Quote[];
  };

  // Module CRM
  crm: {
    contacts: CRMContact[];
    deals: CRMDeal[];
  };

  // Direct Relations (Backend)
  stockItems?: StockItem[];
  employees?: Employee[];
  payslips?: Payslip[];
  quotes?: Quote[];
  deals?: CRMDeal[]; // Note: Type mismatch might occur if backend returns Deal not CRMDeal
  accounting?: Transaction[];
  stockMovements?: StockMovement[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
  link?: string;
  module?: 'stock' | 'crm' | 'finance' | 'hr' | 'system';
}
