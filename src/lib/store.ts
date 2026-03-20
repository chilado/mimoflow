// localStorage-based data store for the app

export interface Material {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  minStock: number;
  supplier?: string;
  supplierContact?: string;
  lastPrice?: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export type OrderStatus =
  | 'awaiting_payment'
  | 'awaiting_art'
  | 'art_approval'
  | 'art_approved'
  | 'in_production'
  | 'finished'
  | 'delivered';

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  eventTheme: string;
  deliveryDate: string;
  items: OrderItem[];
  status: OrderStatus;
  artApproved: boolean;
  artNotes?: string;
  personalization?: string;
  total: number;
  createdAt: string;
}

export interface FixedCost {
  id: string;
  name: string;
  monthlyCost: number;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  category: string;
  orderId?: string;
}

export interface PricingConfig {
  desiredMonthlySalary: number;
  monthlyWorkHours: number;
  fixedCosts: FixedCost[];
  defaultMargin: number;
  defaultTaxRate: number;
}

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const KEYS = {
  materials: 'papelaria_materials',
  clients: 'papelaria_clients',
  orders: 'papelaria_orders',
  transactions: 'papelaria_transactions',
  pricingConfig: 'papelaria_pricing_config',
};

export const store = {
  // Materials
  getMaterials: (): Material[] => getItem(KEYS.materials, []),
  saveMaterials: (m: Material[]) => setItem(KEYS.materials, m),
  addMaterial: (m: Material) => {
    const all = store.getMaterials();
    all.push(m);
    store.saveMaterials(all);
  },
  updateMaterial: (m: Material) => {
    const all = store.getMaterials().map(x => x.id === m.id ? m : x);
    store.saveMaterials(all);
  },
  deleteMaterial: (id: string) => {
    store.saveMaterials(store.getMaterials().filter(x => x.id !== id));
  },

  // Clients
  getClients: (): Client[] => getItem(KEYS.clients, []),
  saveClients: (c: Client[]) => setItem(KEYS.clients, c),
  addClient: (c: Client) => {
    const all = store.getClients();
    all.push(c);
    store.saveClients(all);
  },
  updateClient: (c: Client) => {
    store.saveClients(store.getClients().map(x => x.id === c.id ? c : x));
  },
  deleteClient: (id: string) => {
    store.saveClients(store.getClients().filter(x => x.id !== id));
  },

  // Orders
  getOrders: (): Order[] => getItem(KEYS.orders, []),
  saveOrders: (o: Order[]) => setItem(KEYS.orders, o),
  addOrder: (o: Order) => {
    const all = store.getOrders();
    all.push(o);
    store.saveOrders(all);
  },
  updateOrder: (o: Order) => {
    store.saveOrders(store.getOrders().map(x => x.id === o.id ? o : x));
  },
  deleteOrder: (id: string) => {
    store.saveOrders(store.getOrders().filter(x => x.id !== id));
  },

  // Transactions
  getTransactions: (): Transaction[] => getItem(KEYS.transactions, []),
  saveTransactions: (t: Transaction[]) => setItem(KEYS.transactions, t),
  addTransaction: (t: Transaction) => {
    const all = store.getTransactions();
    all.push(t);
    store.saveTransactions(all);
  },
  deleteTransaction: (id: string) => {
    store.saveTransactions(store.getTransactions().filter(x => x.id !== id));
  },

  // Pricing Config
  getPricingConfig: (): PricingConfig => getItem(KEYS.pricingConfig, {
    desiredMonthlySalary: 3000,
    monthlyWorkHours: 160,
    fixedCosts: [],
    defaultMargin: 30,
    defaultTaxRate: 6,
  }),
  savePricingConfig: (c: PricingConfig) => setItem(KEYS.pricingConfig, c),
};

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: 'Aguardando Pagamento',
  awaiting_art: 'Aguardando Arte',
  art_approval: 'Arte para Aprovação',
  art_approved: 'Arte Aprovada',
  in_production: 'Em Produção',
  finished: 'Finalizado',
  delivered: 'Entregue',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  awaiting_payment: 'bg-warning/15 text-warning-foreground border-warning/30',
  awaiting_art: 'bg-info/15 text-info-foreground border-info/30',
  art_approval: 'bg-primary/15 text-primary border-primary/30',
  art_approved: 'bg-success/15 text-success border-success/30',
  in_production: 'bg-accent/15 text-accent-foreground border-accent/30',
  finished: 'bg-success/15 text-success border-success/30',
  delivered: 'bg-muted text-muted-foreground border-border',
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
