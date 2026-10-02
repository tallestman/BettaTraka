import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CurrencyCode,
  User,
  Product,
  DeliveryAgent,
  AgentStockItem,
  Order,
  AbandonedCart,
  StockMovement,
  SalesTeam,
  RoundRobinState,
  Expense,
  CustomerRecord,
  MediaBuyer,
  MediaBuyerSpendLog,
  AICallLog,
  TokenTransaction,
  ReferralRecord,
  ChatMessage,
  NotificationItem,
  EmbedFormConfig,
  OrderFormRecord,
  OrganizationSettings,
  Remittance,
  OrderStatus,
  CartStatus,
  PayrollRun,
  PayrollItem,
  ProductPackage,
  ProductPricing,
  DistributorStockItem
} from '../types/crm';
import {
  INITIAL_ORG_SETTINGS,
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_AGENTS,
  INITIAL_AGENT_STOCK,
  INITIAL_DISTRIBUTOR_STOCK,
  INITIAL_ORDERS,
  INITIAL_ABANDONED_CARTS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SALES_TEAMS,
  INITIAL_ROUND_ROBIN,
  INITIAL_EXPENSES,
  INITIAL_CUSTOMERS,
  INITIAL_MEDIA_BUYERS,
  INITIAL_MEDIA_BUYER_SPEND_LOGS,
  INITIAL_REMITTANCES,
  INITIAL_AI_LOGS,
  INITIAL_TOKEN_LEDGER,
  INITIAL_REFERRALS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  DEFAULT_FORM_CONFIG,
  INITIAL_ORDER_FORMS
} from '../data/initialData';

export type ActivePersona = 'admin' | 'rep' | 'distributor' | 'inventory' | 'media_buyer' | 'public_form' | 'marketing';

interface CrmContextType {
  // Navigation & Personas
  persona: ActivePersona;
  setPersona: (p: ActivePersona) => void;
  adminActiveTab: string;
  setAdminActiveTab: (tab: string) => void;
  repActiveTab: string;
  setRepActiveTab: (tab: string) => void;
  distributorActiveTab: string;
  setDistributorActiveTab: (tab: string) => void;
  invActiveTab: string;
  setInvActiveTab: (tab: string) => void;
  mediaBuyerActiveTab: string;
  setMediaBuyerActiveTab: (tab: string) => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebarCollapse: () => void;
  
  // Organization & Currency
  settings: OrganizationSettings;
  updateSettings: (newSettings: Partial<OrganizationSettings>) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleThemeMode: () => void;

  // Users & Staff
  users: User[];
  currentUser: User;
  setCurrentUser: (u: User) => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Products & Inventory
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  updateProductPricing: (productId: string, pricingList: ProductPricing[]) => void;
  addPackageToProduct: (productId: string, pkg: Omit<ProductPackage, 'id' | 'productId'>) => void;
  updatePackage: (productId: string, pkgId: string, updates: Partial<ProductPackage>) => void;
  deletePackageFromProduct: (productId: string, pkgId: string) => void;
  deleteProduct: (id: string) => void;

  // Delivery Agents & Stock
  agents: DeliveryAgent[];
  agentStock: AgentStockItem[];
  stockMovements: StockMovement[];
  addAgent: (agent: Omit<DeliveryAgent, 'id'>) => DeliveryAgent;
  updateAgent: (id: string, updates: Partial<DeliveryAgent>) => void;
  deleteAgent: (id: string) => void;
  assignStockToAgent: (agentId: string, productId: string, units: number) => void;
  returnStockFromAgent: (agentId: string, productId: string, units: number, note?: string) => void;
  setAgentStockLevel: (agentId: string, productId: string, unitsHeld: number, note?: string) => void;
  addWarehouseStock: (productId: string, units: number, supplier?: string, note?: string) => void;
  transferStockAgentToAgent: (fromAgentId: string, toAgentId: string, productId: string, units: number) => void;
  reconcileAgentStock: (agentId: string, productId: string, defectiveDelta: number, missingDelta: number) => void;

  // Distributors & Regional Stock
  distributors: User[];
  distributorStock: DistributorStockItem[];
  assignStockToDistributor: (distributorId: string, productId: string, units: number, notes?: string) => void;
  returnStockFromDistributor: (distributorId: string, productId: string, units: number, notes?: string) => void;
  setDistributorStockLevel: (distributorId: string, productId: string, unitsHeld: number, notes?: string) => void;
  requestDistributorRestock: (distributorId: string, productId: string, requestedUnits: number, notes?: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, scheduledDate?: string, preferredDeliveryTime?: string, notes?: string) => void;
  scheduleOrderDelivery: (orderId: string, scheduledDate: string, preferredTime?: string, agentId?: string, notes?: string) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  assignOrderRep: (orderId: string, repId: string) => void;
  assignOrderAgent: (orderId: string, agentId: string) => void;
  assignOrderDistributor: (orderId: string, distributorId: string, notes?: string) => void;
  deleteOrder: (orderId: string) => void;
  deletedOrders: Order[];
  restoreOrder: (orderId: string) => void;

  // Abandoned Carts
  abandonedCarts: AbandonedCart[];
  createAbandonedCart: (cartData: Partial<AbandonedCart>) => AbandonedCart;
  updateCartStatus: (cartId: string, newStatus: CartStatus) => void;
  reassignCartRep: (cartId: string, repId: string) => void;
  convertCartToOrder: (cartId: string) => Order | null;

  // Teams & Round Robin
  salesTeams: SalesTeam[];
  addSalesTeam: (team: Omit<SalesTeam, 'id'>) => void;
  updateSalesTeam: (teamId: string, updates: Partial<SalesTeam>) => void;
  deleteSalesTeam: (teamId: string) => void;
  addRepToTeam: (teamId: string, repId: string) => void;
  removeRepFromTeam: (teamId: string, repId: string) => void;
  roundRobin: RoundRobinState;
  updateRoundRobinPool: (poolType: 'order' | 'cart', repId: string, updates: { weight?: number; isIncluded?: number | boolean; isAvailable?: boolean }) => void;
  skipRoundRobinRep: (poolType: 'order' | 'cart') => void;
  resetRoundRobinSequence: (poolType: 'order' | 'cart') => void;

  // Expenses & Remittances
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  remittances: Remittance[];
  markRemittanceAsPaid: (remittanceId: string, deliveryFee?: number, notes?: string, paymentRef?: string) => void;

  // Payroll
  payrollRuns: PayrollRun[];
  runPayroll: (month: string, currency: CurrencyCode) => PayrollRun;
  approvePayroll: (payrollId: string) => void;

  // Customers
  customers: CustomerRecord[];
  toggleCustomerBlock: (customerId: string) => void;

  // Media Buyers
  mediaBuyers: MediaBuyer[];
  addMediaBuyer: (buyer: Omit<MediaBuyer, 'id'>) => void;
  updateMediaBuyer: (id: string, updates: Partial<MediaBuyer>) => void;
  deleteMediaBuyer: (id: string) => void;
  mediaBuyerSpendLogs: MediaBuyerSpendLog[];
  addMediaBuyerSpendLog: (log: Omit<MediaBuyerSpendLog, 'id'>) => void;
  deleteMediaBuyerSpendLog: (id: string) => void;

  // AI & Tokens
  aiLogs: AICallLog[];
  triggerAICall: (orderId: string) => void;
  tokenTransactions: TokenTransaction[];
  buyTokens: (amount: number, costNgn: number, paymentRef?: string, paymentMethod?: string) => void;
  allocateTokens: (amount: number, note?: string) => void;

  // Chat & Notifications
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteReadNotifications: () => void;
  clearAllNotifications: () => void;
  addNotification: (n: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => void;

  // Referrals
  referrals: ReferralRecord[];
  requestReferralPayout: (referralId: string) => void;

  // Multi-Product Order Forms Management
  orderForms: OrderFormRecord[];
  selectedFormId: string;
  setSelectedFormId: (id: string) => void;
  activeOrderForm: OrderFormRecord | undefined;
  createOrderForm: (newForm: Partial<OrderFormRecord>) => OrderFormRecord;
  updateOrderForm: (id: string, updates: Partial<OrderFormRecord>) => void;
  deleteOrderForm: (id: string) => void;
  duplicateOrderForm: (id: string) => OrderFormRecord;
  formConfig: EmbedFormConfig;
  updateFormConfig: (config: Partial<EmbedFormConfig>) => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

const STORAGE_KEY = 'bettatraka_crm_state_v2';

export const CrmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available
  const [persona, setPersona] = useState<ActivePersona>('admin');
  const [adminActiveTab, setAdminActiveTabState] = useState<string>('dashboard');
  const [repActiveTab, setRepActiveTab] = useState<string>('dashboard');
  const [distributorActiveTab, setDistributorActiveTab] = useState<string>('dashboard');
  const [invActiveTab, setInvActiveTab] = useState<string>('inventory');
  const [mediaBuyerActiveTab, setMediaBuyerActiveTab] = useState<string>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sidebar_collapsed`);
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const setIsSidebarCollapsed = (val: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsedState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      try {
        localStorage.setItem(`${STORAGE_KEY}_sidebar_collapsed`, String(next));
      } catch {}
      return next;
    });
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);
  const setAdminActiveTab = (tab: string) => {
    setAdminActiveTabState(tab);
    setIsMobileSidebarOpen(false);
  };

  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : INITIAL_ORG_SETTINGS;
    } catch {
      return INITIAL_ORG_SETTINGS;
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(settings.currency || 'NGN');

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    setSettings(prev => ({ ...prev, currency: c }));
  };

  const updateSettings = (newSettings: Partial<OrganizationSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      if (newSettings.themeMode && newSettings.themeMode !== themeMode) {
        setThemeModeState(newSettings.themeMode);
        try {
          localStorage.setItem(`${STORAGE_KEY}_theme`, newSettings.themeMode);
        } catch (e) {}
      }
      return next;
    });
  };

  // Day (Light) and Night (Dark) mode state
  const [themeMode, setThemeModeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
      if (saved === 'light' || saved === 'dark') return saved;
      return settings.themeMode || 'dark';
    } catch {
      return 'dark';
    }
  });

  const setThemeMode = (mode: 'dark' | 'light') => {
    setThemeModeState(mode);
    setSettings(prev => ({ ...prev, themeMode: mode }));
    try {
      localStorage.setItem(`${STORAGE_KEY}_theme`, mode);
    } catch (e) {}
    const root = document.documentElement;
    if (mode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const toggleThemeMode = () => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  }, [themeMode]);

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      const list: User[] = saved ? JSON.parse(saved) : INITIAL_USERS;
      // Team Leads are sales representatives designated in sales teams
      list.forEach(u => {
        if ((u.role as string) === 'Team Lead') {
          u.role = 'Sales Representative';
        }
      });
      if (!list.some(u => u.role === 'Media Buyer')) {
        const defaultMb = INITIAL_USERS.find(u => u.role === 'Media Buyer');
        if (defaultMb) list.push(defaultMb);
      }
      return list;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => users[0] || INITIAL_USERS[0]);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [agents, setAgents] = useState<DeliveryAgent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_agents`);
      return saved ? JSON.parse(saved) : INITIAL_AGENTS;
    } catch {
      return INITIAL_AGENTS;
    }
  });

  const [agentStock, setAgentStock] = useState<AgentStockItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_agent_stock`);
      return saved ? JSON.parse(saved) : INITIAL_AGENT_STOCK;
    } catch {
      return INITIAL_AGENT_STOCK;
    }
  });

  const [distributorStock, setDistributorStock] = useState<DistributorStockItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_distributor_stock`);
      return saved ? JSON.parse(saved) : INITIAL_DISTRIBUTOR_STOCK;
    } catch {
      return INITIAL_DISTRIBUTOR_STOCK;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(o => o.id));
        const missing = INITIAL_ORDERS.filter(o => !existingIds.has(o.id));
        return [...parsed, ...missing];
      }
      return INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [deletedOrders, setDeletedOrders] = useState<Order[]>([]);

  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_carts`);
      return saved ? JSON.parse(saved) : INITIAL_ABANDONED_CARTS;
    } catch {
      return INITIAL_ABANDONED_CARTS;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_stock_movements`);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  const [salesTeams, setSalesTeams] = useState<SalesTeam[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_teams`);
      return saved ? JSON.parse(saved) : INITIAL_SALES_TEAMS;
    } catch {
      return INITIAL_SALES_TEAMS;
    }
  });

  const [roundRobin, setRoundRobin] = useState<RoundRobinState>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_round_robin`);
      return saved ? JSON.parse(saved) : INITIAL_ROUND_ROBIN;
    } catch {
      return INITIAL_ROUND_ROBIN;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
      const list: Expense[] = saved ? JSON.parse(saved) : INITIAL_EXPENSES;
      // Auto-migrate legacy expense types
      list.forEach(e => {
        if ((e.type as string) === 'Meta / TikTok Ads' || (e.type as string) === 'Meta / TikTok' || (e.type as string) === 'Meta/TikTok') {
          e.type = 'Advertising / Media Buying';
        } else if ((e.type as string) === 'Freight / Customs' || (e.type as string) === 'Freight/ Customs' || (e.type as string) === 'Freight/Customs') {
          e.type = 'Logistics';
        }
      });
      return list;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [remittances, setRemittances] = useState<Remittance[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_remittances`);
      const list: Remittance[] = saved ? JSON.parse(saved) : INITIAL_REMITTANCES;
      return list.map(r => {
        if (r.status === 'Pending') {
          // Restore original product order price for pending remittances
          const originalPrice = r.orderTotal || (r.deliveryFeeDeducted ? r.amountToRemit + r.deliveryFeeDeducted : r.amountToRemit);
          return {
            ...r,
            orderTotal: originalPrice,
            amountToRemit: originalPrice,
            deliveryFeeDeducted: 0
          };
        }
        return r;
      });
    } catch {
      return INITIAL_REMITTANCES;
    }
  });

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [mediaBuyers, setMediaBuyers] = useState<MediaBuyer[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_media_buyers`);
      return saved ? JSON.parse(saved) : INITIAL_MEDIA_BUYERS;
    } catch {
      return INITIAL_MEDIA_BUYERS;
    }
  });

  const [mediaBuyerSpendLogs, setMediaBuyerSpendLogs] = useState<MediaBuyerSpendLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_media_buyer_spends`);
      return saved ? JSON.parse(saved) : INITIAL_MEDIA_BUYER_SPEND_LOGS;
    } catch {
      return INITIAL_MEDIA_BUYER_SPEND_LOGS;
    }
  });

  const [aiLogs, setAiLogs] = useState<AICallLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ai_logs`);
      return saved ? JSON.parse(saved) : INITIAL_AI_LOGS;
    } catch {
      return INITIAL_AI_LOGS;
    }
  });

  const [tokenTransactions, setTokenTransactions] = useState<TokenTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tokens`);
      return saved ? JSON.parse(saved) : INITIAL_TOKEN_LEDGER;
    } catch {
      return INITIAL_TOKEN_LEDGER;
    }
  });

  const [referrals, setReferrals] = useState<ReferralRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_referrals`);
      return saved ? JSON.parse(saved) : INITIAL_REFERRALS;
    } catch {
      return INITIAL_REFERRALS;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_chat`);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
    } catch {
      return INITIAL_CHAT_MESSAGES;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      const raw: NotificationItem[] = saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
      const seen = new Set<string>();
      const deduped: NotificationItem[] = [];
      let counter = 1;
      for (const item of raw) {
        if (!item) continue;
        const validId = item.id && !seen.has(item.id)
          ? item.id
          : `notif-${Date.now()}-${counter++}-${Math.random().toString(36).substring(2, 7)}`;
        seen.add(validId);
        deduped.push({ ...item, id: validId });
      }
      return deduped;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Order Forms Management (Multi-product / campaign forms)
  const [orderForms, setOrderForms] = useState<OrderFormRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_order_forms`);
      return saved ? JSON.parse(saved) : INITIAL_ORDER_FORMS;
    } catch {
      return INITIAL_ORDER_FORMS;
    }
  });

  const [selectedFormId, setSelectedFormId] = useState<string>(() => {
    return orderForms[0]?.id || 'form-1';
  });

  const activeOrderForm = orderForms.find(f => f.id === selectedFormId) || orderForms[0];
  const formConfig = activeOrderForm?.config || DEFAULT_FORM_CONFIG;

  const updateFormConfig = (newConfig: Partial<EmbedFormConfig>) => {
    setOrderForms(prev => prev.map(f => {
      if (f.id !== selectedFormId) return f;
      return {
        ...f,
        config: { ...f.config, ...newConfig }
      };
    }));
  };

  const createOrderForm = (formData: Partial<OrderFormRecord>): OrderFormRecord => {
    const prod = products.find(p => p.id === formData.productId) || products[0];
    const formId = `form-${Date.now()}`;
    const slug = formData.slug || formData.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `form-${formId}`;

    const newForm: OrderFormRecord = {
      id: formId,
      title: formData.title || `${prod.name} Checkout Form`,
      slug,
      productId: prod.id,
      status: formData.status || 'Active',
      viewsCount: 1,
      ordersCount: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
      config: formData.config || {
        ...DEFAULT_FORM_CONFIG,
        productId: prod.id,
        formTitle: prod.name,
        buttonText: `ORDER ${prod.name.split(' ')[0].toUpperCase()} (PAY ON DELIVERY)`,
        buttonColor: '#059669'
      }
    };

    setOrderForms(prev => [newForm, ...prev]);
    setSelectedFormId(newForm.id);
    return newForm;
  };

  const updateOrderForm = (id: string, updates: Partial<OrderFormRecord>) => {
    setOrderForms(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const deleteOrderForm = (id: string) => {
    if (orderForms.length <= 1) {
      alert("At least one order form must remain active in the system.");
      return;
    }
    setOrderForms(prev => prev.filter(f => f.id !== id));
    if (selectedFormId === id) {
      const remaining = orderForms.filter(f => f.id !== id);
      if (remaining.length > 0) setSelectedFormId(remaining[0].id);
    }
  };

  const duplicateOrderForm = (id: string): OrderFormRecord => {
    const source = orderForms.find(f => f.id === id) || orderForms[0];
    const newForm: OrderFormRecord = {
      ...source,
      id: `form-${Date.now()}`,
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy`,
      viewsCount: 0,
      ordersCount: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setOrderForms(prev => [newForm, ...prev]);
    setSelectedFormId(newForm.id);
    return newForm;
  };

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([
    {
      id: 'pay-aug-2026',
      month: 'August 2026',
      currency: 'NGN',
      createdAt: '2026-09-01',
      status: 'Paid',
      totalPayout: 1845000,
      topPerformerRepId: 'user-rep-1',
      items: [
        {
          userId: 'user-rep-1',
          userName: 'Chioma Adeyemi',
          role: 'Sales Representative',
          payStructure: 'Hybrid',
          fixedBase: 75000,
          deliveredOrders: 114,
          commissionEarned: 171000,
          bonusEarned: 50000,
          totalPayout: 296000,
          currency: 'NGN'
        },
        {
          userId: 'user-rep-2',
          userName: 'Emeka Okafor',
          role: 'Sales Representative',
          payStructure: 'Commission',
          fixedBase: 0,
          deliveredOrders: 88,
          commissionEarned: 158400,
          bonusEarned: 0,
          totalPayout: 158400,
          currency: 'NGN'
        },
        {
          userId: 'user-inv-mgr',
          userName: 'Babajide Cole',
          role: 'Inventory Manager',
          payStructure: 'Fixed',
          fixedBase: 180000,
          deliveredOrders: 0,
          commissionEarned: 0,
          bonusEarned: 0,
          totalPayout: 180000,
          currency: 'NGN'
        }
      ]
    }
  ]);

  // Sync back to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
      localStorage.setItem(`${STORAGE_KEY}_agents`, JSON.stringify(agents));
      localStorage.setItem(`${STORAGE_KEY}_agent_stock`, JSON.stringify(agentStock));
      localStorage.setItem(`${STORAGE_KEY}_distributor_stock`, JSON.stringify(distributorStock));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_carts`, JSON.stringify(abandonedCarts));
      localStorage.setItem(`${STORAGE_KEY}_stock_movements`, JSON.stringify(stockMovements));
      localStorage.setItem(`${STORAGE_KEY}_teams`, JSON.stringify(salesTeams));
      localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(expenses));
      localStorage.setItem(`${STORAGE_KEY}_remittances`, JSON.stringify(remittances));
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
      localStorage.setItem(`${STORAGE_KEY}_round_robin`, JSON.stringify(roundRobin));
      localStorage.setItem(`${STORAGE_KEY}_chat`, JSON.stringify(chatMessages));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_order_forms`, JSON.stringify(orderForms));
      localStorage.setItem(`${STORAGE_KEY}_form_config`, JSON.stringify(formConfig));
      localStorage.setItem(`${STORAGE_KEY}_media_buyers`, JSON.stringify(mediaBuyers));
      localStorage.setItem(`${STORAGE_KEY}_media_buyer_spends`, JSON.stringify(mediaBuyerSpendLogs));
    } catch {
      // LocalStorage quotas handled silently
    }
  }, [settings, users, products, agents, agentStock, distributorStock, orders, abandonedCarts, stockMovements, salesTeams, expenses, remittances, customers, roundRobin, chatMessages, notifications, formConfig, orderForms]);

  // Round-Robin Assignment helper
  const getNextAssignedRep = (poolType: 'order' | 'cart', customerPhone?: string): { repId: string; repName: string } => {
    // 1. Returning customer check
    if (customerPhone && roundRobin.routeReturningCustomersToPreviousRep) {
      const prevOrder = orders.find(o => o.customerPhone === customerPhone && o.salesRepId);
      if (prevOrder && prevOrder.salesRepId) {
        const eligibleRep = users.find(u => u.id === prevOrder.salesRepId && u.status === 'Active');
        if (eligibleRep) {
          return { repId: eligibleRep.id, repName: eligibleRep.name };
        }
      }
    }

    // 2. Pool selection
    const pool = poolType === 'order' ? [...roundRobin.orderPool] : [...roundRobin.cartPool];
    const eligibleReps = pool.filter(r => r.isIncluded && r.isAvailable);

    if (eligibleReps.length === 0) {
      // Fallback to current user or first admin
      return { repId: users[0].id, repName: users[0].name };
    }

    // Weighted index selection
    const currentIndex = poolType === 'order' ? roundRobin.nextRepIndexOrder : roundRobin.nextRepIndexCart;
    const assignedRep = eligibleReps[currentIndex % eligibleReps.length];
    const nextIndex = (currentIndex + 1) % eligibleReps.length;

    // Update round robin state
    setRoundRobin(prev => {
      if (poolType === 'order') {
        const updatedPool = prev.orderPool.map(r => 
          r.repId === assignedRep.repId 
            ? { ...r, assignedOrderCount: r.assignedOrderCount + 1, lastAssignedAt: new Date().toISOString() } 
            : r
        );
        return { ...prev, orderPool: updatedPool, nextRepIndexOrder: nextIndex };
      } else {
        const updatedPool = prev.cartPool.map(r => 
          r.repId === assignedRep.repId 
            ? { ...r, assignedOrderCount: r.assignedOrderCount + 1, lastAssignedAt: new Date().toISOString() } 
            : r
        );
        return { ...prev, cartPool: updatedPool, nextRepIndexCart: nextIndex };
      }
    });

    return { repId: assignedRep.repId, repName: assignedRep.repName };
  };

  // Agent assignment heuristic based on state/city
  const getMatchingAgent = (state: string): { agentId?: string; agentName?: string } => {
    const stateLower = state.toLowerCase();
    if (stateLower.includes('lagos')) {
      const mainland = agents.find(a => a.id === 'agent-1');
      return mainland ? { agentId: mainland.id, agentName: mainland.name } : {};
    }
    if (stateLower.includes('abuja') || stateLower.includes('fct')) {
      const abuja = agents.find(a => a.id === 'agent-3');
      return abuja ? { agentId: abuja.id, agentName: abuja.name } : {};
    }
    if (stateLower.includes('river') || stateLower.includes('port harcourt')) {
      const ph = agents.find(a => a.id === 'agent-4');
      return ph ? { agentId: ph.id, agentName: ph.name } : {};
    }
    if (stateLower.includes('kano') || stateLower.includes('kaduna')) {
      const kano = agents.find(a => a.id === 'agent-5');
      return kano ? { agentId: kano.id, agentName: kano.name } : {};
    }
    // Default fallback to first active agent
    const active = agents[0];
    return active ? { agentId: active.id, agentName: active.name } : {};
  };

  // Create Order Action
  const createOrder = (orderData: Partial<Order>): Order => {
    const orderNum = `ORD-${10500 + orders.length}`;
    
    // Assign rep if not provided
    let repId = orderData.salesRepId;
    let repName = orderData.salesRepName;
    if (!repId) {
      const assigned = getNextAssignedRep('order', orderData.customerPhone);
      repId = assigned.repId;
      repName = assigned.repName;
    }

    // Assign agent based on delivery state if not provided
    let agentId = orderData.agentId;
    let agentName = orderData.agentName;
    if (!agentId && orderData.deliveryState) {
      const matched = getMatchingAgent(orderData.deliveryState);
      agentId = matched.agentId;
      agentName = matched.agentName;
    }

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: orderData.customerName || 'Anonymous Customer',
      customerPhone: orderData.customerPhone || '+234 800 000 0000',
      customerWhatsApp: orderData.customerWhatsApp || orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      deliveryAddress: orderData.deliveryAddress || 'Address Pending',
      deliveryCity: orderData.deliveryCity || 'City Center',
      deliveryState: orderData.deliveryState || 'Lagos',
      items: orderData.items || [],
      totalAmount: orderData.totalAmount || 0,
      currency: orderData.currency || currency,
      source: orderData.source || 'Order Form',
      utmSource: orderData.utmSource || 'direct',
      utmCampaign: orderData.utmCampaign || 'organic',
      utmCreative: orderData.utmCreative,
      salesRepId: repId,
      salesRepName: repName,
      agentId: agentId,
      agentName: agentName,
      status: orderData.status || 'NEW',
      responseTimeMinutes: 2,
      scheduledDate: orderData.scheduledDate,
      preferredDeliveryTime: orderData.preferredDeliveryTime || orderData.deliveryWindowPreference,
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      isSandbox: orderData.isSandbox || false,
      deliveryWindowPreference: orderData.deliveryWindowPreference,
      commitmentFeePaid: orderData.commitmentFeePaid
    };

    setOrders(prev => [newOrder, ...prev]);

    // Upsert customer record
    if (orderData.customerPhone && !orderData.isSandbox) {
      setCustomers(prev => {
        const existing = prev.find(c => c.phone === orderData.customerPhone);
        if (existing) {
          return prev.map(c => c.id === existing.id ? {
            ...c,
            totalOrders: c.totalOrders + 1,
            lastOrderDate: new Date().toISOString()
          } : c);
        } else {
          return [
            {
              id: `cust-${Date.now()}`,
              name: orderData.customerName || 'Customer',
              phone: orderData.customerPhone!,
              whatsapp: orderData.customerWhatsApp,
              email: orderData.customerEmail,
              city: orderData.deliveryCity || 'Lagos',
              state: orderData.deliveryState || 'Lagos',
              totalOrders: 1,
              successfulOrders: 0,
              cancelledOrders: 0,
              totalSpend: 0,
              reliabilityScore: 80,
              source: orderData.source || 'Order Form',
              isBlocked: false,
              lastOrderDate: new Date().toISOString()
            },
            ...prev
          ];
        }
      });
    }

    // Add In-App Notification
    addNotification({
      title: `New Order Received #${orderNum}`,
      message: `${newOrder.customerName} ordered ${newOrder.items[0]?.productName || 'products'} (${newOrder.currency} ${newOrder.totalAmount}). Assigned to ${repName}.`,
      type: 'order_received',
      linkTab: 'orders'
    });

    return newOrder;
  };

  // Update Order Status
  const updateOrderStatus = (
    orderId: string, 
    newStatus: OrderStatus, 
    scheduledDate?: string, 
    preferredDeliveryTime?: string, 
    notes?: string
  ) => {
    setOrders(prev => prev.map(order => {
      const isMatch = order.id === orderId || 
                      order.orderNumber === orderId || 
                      order.orderNumber.replace(/^#/, '') === orderId.replace(/^#/, '') ||
                      order.id.replace(/^ord-/, '') === orderId.replace(/^ord-/, '');
      if (!isMatch) return order;

      const isDeliveredNow = newStatus === 'DELIVERED' && order.status !== 'DELIVERED';
      const deliveredDate = isDeliveredNow ? new Date().toISOString() : order.deliveredDate;
      const fulfillmentDays = isDeliveredNow ? 1 : order.fulfillmentDays;

      // When marked DELIVERED, generate pending agent remittance and update customer stats
      if (isDeliveredNow && order.agentId) {
        const newRemittance: Remittance = {
          id: `remit-${Date.now()}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          agentId: order.agentId,
          agentName: order.agentName || 'Assigned Agent',
          agentZone: order.deliveryState,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          productSummary: order.items.map(i => `${i.quantity}x ${i.productName}`).join(', '),
          orderTotal: order.totalAmount,
          amountToRemit: order.totalAmount, // Original product order price, not deducted until remittance is done!
          currency: order.currency,
          deliveredDate: new Date().toISOString().split('T')[0],
          status: 'Pending'
        };
        setRemittances(r => [newRemittance, ...r]);

        // Stock movement: Agent to Customer
        order.items.forEach(item => {
          setStockMovements(m => [
            {
              id: `mov-${Date.now()}-${item.productId}`,
              date: new Date().toISOString().slice(0, 16).replace('T', ' '),
              productId: item.productId,
              productName: item.productName,
              type: 'Agent to Customer',
              fromLocation: order.agentName || 'Agent Stock',
              toLocation: `${order.customerName} (${order.deliveryCity})`,
              quantity: item.quantity,
              referenceOrderOrAgent: order.orderNumber
            },
            ...m
          ]);

          // Deduct from agent stock
          setAgentStock(stocks => stocks.map(s => {
            if (s.agentId === order.agentId && s.productId === item.productId) {
              return { ...s, unitsHeld: Math.max(0, s.unitsHeld - item.quantity) };
            }
            return s;
          }));
        });

        // Update customer reliability and spend
        setCustomers(custs => custs.map(c => {
          if (c.phone === order.customerPhone) {
            const successful = c.successfulOrders + 1;
            const total = c.totalOrders;
            const newReliability = Math.min(100, Math.round((successful / Math.max(1, total)) * 100));
            return {
              ...c,
              successfulOrders: successful,
              totalSpend: c.totalSpend + order.totalAmount,
              reliabilityScore: newReliability
            };
          }
          return c;
        }));

        addNotification({
          title: `Delivery Completed #${order.orderNumber}`,
          message: `${order.agentName} completed delivery for ${order.customerName}. Remittance pending: ₦${order.totalAmount.toLocaleString()}.`,
          type: 'delivery_completed',
          linkTab: 'deliveries'
        });
      }

      const finalScheduledDate = scheduledDate !== undefined 
        ? scheduledDate 
        : (newStatus === 'SCHEDULED' && !order.scheduledDate) ? '2026-10-02' : order.scheduledDate;

      return {
        ...order,
        status: newStatus,
        scheduledDate: finalScheduledDate,
        preferredDeliveryTime: preferredDeliveryTime || order.preferredDeliveryTime,
        deliveredDate,
        fulfillmentDays,
        notes: notes ? (order.notes ? `${order.notes} | ${notes}` : notes) : order.notes
      };
    }));
  };

  // Schedule or Reschedule an Order Delivery with specific date, time slot, agent, and notes
  const scheduleOrderDelivery = (
    orderId: string, 
    scheduledDate: string, 
    preferredTime?: string, 
    agentId?: string, 
    notes?: string
  ) => {
    const assignedAgent = agentId ? agents.find(a => a.id === agentId) : undefined;
    setOrders(prev => prev.map(order => {
      const isMatch = order.id === orderId || 
                      order.orderNumber === orderId || 
                      order.orderNumber.replace(/^#/, '') === orderId.replace(/^#/, '') ||
                      order.id.replace(/^ord-/, '') === orderId.replace(/^ord-/, '');
      if (!isMatch) return order;

      return {
        ...order,
        status: 'SCHEDULED',
        scheduledDate,
        preferredDeliveryTime: preferredTime || order.preferredDeliveryTime || 'Morning (8:00 AM - 12:00 PM)',
        agentId: assignedAgent ? assignedAgent.id : order.agentId,
        agentName: assignedAgent ? assignedAgent.name : order.agentName,
        notes: notes ? (order.notes ? `${order.notes} | Delivery Scheduled: ${notes}` : `Delivery Scheduled: ${notes}`) : order.notes
      };
    }));

    const targetOrder = orders.find(o => o.id === orderId || o.orderNumber === orderId || o.orderNumber.replace(/^#/, '') === orderId.replace(/^#/, ''));
    if (targetOrder) {
      addNotification({
        title: `Delivery Scheduled #${targetOrder.orderNumber}`,
        message: `Delivery for ${targetOrder.customerName} scheduled for ${scheduledDate} (${preferredTime || 'Flexible'}).`,
        type: 'info',
        linkTab: 'scheduled'
      });
    }
  };

  // Generic order updater
  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    setOrders(prev => prev.map(order => {
      const isMatch = order.id === orderId || 
                      order.orderNumber === orderId || 
                      order.orderNumber.replace(/^#/, '') === orderId.replace(/^#/, '') ||
                      order.id.replace(/^ord-/, '') === orderId.replace(/^ord-/, '');
      return isMatch ? { ...order, ...updates } : order;
    }));
  };

  const assignOrderRep = (orderId: string, repId: string) => {
    const rep = users.find(u => u.id === repId);
    setOrders(prev => prev.map(o => {
      const isMatch = o.id === orderId || o.orderNumber === orderId || o.orderNumber.replace(/^#/, '') === orderId.replace(/^#/, '');
      return isMatch ? { ...o, salesRepId: repId, salesRepName: rep?.name || 'Rep' } : o;
    }));
  };

  const assignOrderAgent = (orderId: string, agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    setOrders(prev => prev.map(o => {
      const isMatch = o.id === orderId || o.orderNumber === orderId || o.orderNumber.replace(/^#/, '') === orderId.replace(/^#/, '');
      return isMatch ? { ...o, agentId: agentId, agentName: agent?.name || '' } : o;
    }));
  };

  const assignOrderDistributor = (orderId: string, distributorId: string, notes?: string) => {
    const dist = users.find(u => u.id === distributorId);
    setOrders(prev => prev.map(o => {
      const isMatch = o.id === orderId || o.orderNumber === orderId || o.orderNumber.replace(/^#/, '') === orderId.replace(/^#/, '');
      if (isMatch) {
        return {
          ...o,
          distributorId: dist ? dist.id : undefined,
          distributorName: dist ? dist.name : undefined,
          notes: notes 
            ? (o.notes ? `${o.notes} | Assigned to Distributor: ${notes}` : `Assigned to Distributor: ${notes}`)
            : o.notes
        };
      }
      return o;
    }));

    if (dist) {
      addNotification({
        title: 'Order Assigned to Distributor',
        message: `Order assigned to regional distributor ${dist.name}`,
        type: 'info'
      });
    }
  };

  const deleteOrder = (orderId: string) => {
    const target = orders.find(o => o.id === orderId);
    if (target) {
      setDeletedOrders(d => [target, ...d]);
      setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const restoreOrder = (orderId: string) => {
    const target = deletedOrders.find(o => o.id === orderId);
    if (target) {
      setOrders(prev => [target, ...prev]);
      setDeletedOrders(d => d.filter(o => o.id !== orderId));
    }
  };

  // Abandoned Carts
  const createAbandonedCart = (cartData: Partial<AbandonedCart>): AbandonedCart => {
    const cartNum = `CART-${800 + abandonedCarts.length + 1}`;
    const assigned = getNextAssignedRep('cart', cartData.customerPhone);

    const newCart: AbandonedCart = {
      id: `cart-${Date.now()}`,
      cartNumber: cartNum,
      customerName: cartData.customerName || 'Incomplete Lead',
      customerPhone: cartData.customerPhone || '',
      customerWhatsApp: cartData.customerWhatsApp,
      customerEmail: cartData.customerEmail,
      deliveryAddress: cartData.deliveryAddress,
      deliveryCity: cartData.deliveryCity,
      deliveryState: cartData.deliveryState || 'Lagos',
      productId: cartData.productId || products[0].id,
      productName: cartData.productName || products[0].name,
      packageId: cartData.packageId,
      packageName: cartData.packageName,
      amount: cartData.amount || 24500,
      currency: cartData.currency || currency,
      status: 'ASSIGNED',
      assignedRepId: assigned.repId,
      assignedRepName: assigned.repName,
      createdAt: new Date().toISOString(),
      lastActivity: 'Just now',
      utmSource: cartData.utmSource,
      utmCampaign: cartData.utmCampaign
    };

    setAbandonedCarts(prev => [newCart, ...prev]);

    if (settings.notifyAdminsOnNewCarts) {
      addNotification({
        title: `Abandoned Cart Alert #${cartNum}`,
        message: `${newCart.customerName} dropped off at package selection. Assigned to ${assigned.repName} for instant follow-up.`,
        type: 'cart_abandoned',
        linkTab: 'abandoned-carts'
      });
    }

    return newCart;
  };

  const updateCartStatus = (cartId: string, newStatus: CartStatus) => {
    setAbandonedCarts(prev => prev.map(c => c.id === cartId ? { ...c, status: newStatus, lastActivity: 'Updated just now' } : c));
  };

  const reassignCartRep = (cartId: string, repId: string) => {
    const rep = users.find(u => u.id === repId);
    setAbandonedCarts(prev => prev.map(c => c.id === cartId ? { ...c, assignedRepId: repId, assignedRepName: rep?.name || 'Rep' } : c));
  };

  const convertCartToOrder = (cartId: string): Order | null => {
    const cart = abandonedCarts.find(c => c.id === cartId);
    if (!cart) return null;

    const prod = products.find(p => p.id === cart.productId) || products[0];
    const order = createOrder({
      customerName: cart.customerName,
      customerPhone: cart.customerPhone,
      customerWhatsApp: cart.customerWhatsApp || cart.customerPhone,
      customerEmail: cart.customerEmail,
      deliveryAddress: cart.deliveryAddress || 'Pending confirmation with rep',
      deliveryCity: cart.deliveryCity || 'Lagos',
      deliveryState: cart.deliveryState || 'Lagos',
      totalAmount: cart.amount,
      currency: cart.currency,
      source: 'Abandoned Cart Recovery',
      salesRepId: cart.assignedRepId,
      salesRepName: cart.assignedRepName,
      items: [
        {
          productId: prod.id,
          productName: prod.name,
          quantity: 1,
          unitPrice: cart.amount,
          packageId: cart.packageId,
          packageName: cart.packageName
        }
      ]
    });

    updateCartStatus(cartId, 'CONVERTED');
    return order;
  };

  // Inventory Management
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [...prev, newProd]);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const updateProductPricing = (productId: string, pricingList: ProductPricing[]) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, pricing: pricingList } : p));
  };

  const addPackageToProduct = (productId: string, pkg: Omit<ProductPackage, 'id' | 'productId'>) => {
    const newPkg: ProductPackage = {
      ...pkg,
      id: `pkg-${Date.now()}`,
      productId
    };
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return { ...p, packages: [...p.packages, newPkg] };
    }));
  };

  const updatePackage = (productId: string, pkgId: string, updates: Partial<ProductPackage>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        packages: p.packages.map(pkg => pkg.id === pkgId ? { ...pkg, ...updates } : pkg)
      };
    }));
  };

  const deletePackageFromProduct = (productId: string, pkgId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return {
        ...p,
        packages: p.packages.filter(pkg => pkg.id !== pkgId)
      };
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Stock assignment & transfer
  const assignStockToAgent = (agentId: string, productId: string, units: number) => {
    const agent = agents.find(a => a.id === agentId);
    const prod = products.find(p => p.id === productId);
    if (!agent || !prod || prod.stockWarehouse < units) return;

    // Deduct from warehouse
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockWarehouse: p.stockWarehouse - units } : p));

    // Increase in agent stock
    setAgentStock(prev => {
      const existing = prev.find(s => s.agentId === agentId && s.productId === productId);
      if (existing) {
        return prev.map(s => s.agentId === agentId && s.productId === productId ? { ...s, unitsHeld: s.unitsHeld + units } : s);
      } else {
        return [...prev, { agentId, productId, unitsHeld: units, defectiveUnits: 0, missingUnits: 0 }];
      }
    });

    // Update agent total stock held
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, totalStockHeld: a.totalStockHeld + units } : a));

    // Log movement
    setStockMovements(m => [
      {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        productId: prod.id,
        productName: prod.name,
        type: 'Warehouse to Agent',
        fromLocation: 'Central Warehouse (Ikeja)',
        toLocation: agent.name,
        quantity: units,
        referenceOrderOrAgent: `Dispatched to ${agent.primaryZone}`
      },
      ...m
    ]);
  };

  const returnStockFromAgent = (agentId: string, productId: string, units: number, note?: string) => {
    const agent = agents.find(a => a.id === agentId);
    const prod = products.find(p => p.id === productId);
    if (!agent || !prod || units <= 0) return;

    const existing = agentStock.find(s => s.agentId === agentId && s.productId === productId);
    const currentHeld = existing?.unitsHeld || 0;
    const actualReturn = Math.min(units, currentHeld);
    if (actualReturn <= 0) return;

    setAgentStock(prev => prev.map(s => {
      if (s.agentId === agentId && s.productId === productId) {
        return { ...s, unitsHeld: Math.max(0, s.unitsHeld - actualReturn) };
      }
      return s;
    }));

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockWarehouse: p.stockWarehouse + actualReturn } : p));

    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, totalStockHeld: Math.max(0, a.totalStockHeld - actualReturn) } : a));

    setStockMovements(m => [
      {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        productId: prod.id,
        productName: prod.name,
        type: 'Agent Return to Warehouse',
        fromLocation: `${agent.name} (${agent.primaryZone})`,
        toLocation: 'Central Warehouse (Ikeja)',
        quantity: actualReturn,
        referenceOrderOrAgent: note || `Returned to central warehouse`
      },
      ...m
    ]);
  };

  const addWarehouseStock = (productId: string, units: number, supplier?: string, note?: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod || units <= 0) return;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockWarehouse: p.stockWarehouse + units } : p));

    setStockMovements(m => [
      {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        productId: prod.id,
        productName: prod.name,
        type: 'Restock',
        fromLocation: supplier || 'Supplier Inflow',
        toLocation: 'Central Warehouse (Ikeja)',
        quantity: units,
        referenceOrderOrAgent: note || 'Batch restock received'
      },
      ...m
    ]);
  };

  const setAgentStockLevel = (agentId: string, productId: string, unitsHeld: number, note?: string) => {
    const agent = agents.find(a => a.id === agentId);
    const prod = products.find(p => p.id === productId);
    if (!agent || !prod) return;

    const safeUnits = Math.max(0, unitsHeld);
    setAgentStock(prev => {
      const existing = prev.find(s => s.agentId === agentId && s.productId === productId);
      if (existing) {
        return prev.map(s => s.agentId === agentId && s.productId === productId ? { ...s, unitsHeld: safeUnits } : s);
      } else {
        return [...prev, { agentId, productId, unitsHeld: safeUnits, defectiveUnits: 0, missingUnits: 0 }];
      }
    });

    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const otherStocks = agentStock.filter(s => s.agentId === agentId && s.productId !== productId);
        const total = otherStocks.reduce((sum, s) => sum + s.unitsHeld, 0) + safeUnits;
        return { ...a, totalStockHeld: total };
      }
      return a;
    }));

    setStockMovements(m => [
      {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        productId: prod.id,
        productName: prod.name,
        type: 'Warehouse to Agent',
        fromLocation: 'Stock Calibration',
        toLocation: `${agent.name} (${agent.primaryZone})`,
        quantity: safeUnits,
        referenceOrderOrAgent: note || `Stock level set to ${safeUnits} units`
      },
      ...m
    ]);
  };

  const transferStockAgentToAgent = (fromAgentId: string, toAgentId: string, productId: string, units: number) => {
    const fromAgent = agents.find(a => a.id === fromAgentId);
    const toAgent = agents.find(a => a.id === toAgentId);
    const prod = products.find(p => p.id === productId);
    if (!fromAgent || !toAgent || !prod) return;

    setAgentStock(prev => prev.map(s => {
      if (s.agentId === fromAgentId && s.productId === productId) {
        return { ...s, unitsHeld: Math.max(0, s.unitsHeld - units) };
      }
      if (s.agentId === toAgentId && s.productId === productId) {
        return { ...s, unitsHeld: s.unitsHeld + units };
      }
      return s;
    }));

    setStockMovements(m => [
      {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        productId: prod.id,
        productName: prod.name,
        type: 'Agent to Agent Transfer',
        fromLocation: fromAgent.name,
        toLocation: toAgent.name,
        quantity: units,
        referenceOrderOrAgent: 'Inter-hub rebalancing'
      },
      ...m
    ]);
  };

  const reconcileAgentStock = (agentId: string, productId: string, defectiveDelta: number, missingDelta: number) => {
    setAgentStock(prev => prev.map(s => {
      if (s.agentId === agentId && s.productId === productId) {
        return {
          ...s,
          defectiveUnits: Math.max(0, s.defectiveUnits + defectiveDelta),
          missingUnits: Math.max(0, s.missingUnits + missingDelta),
          unitsHeld: Math.max(0, s.unitsHeld - defectiveDelta - missingDelta)
        };
      }
      return s;
    }));
  };

  const distributors = users.filter(u => u.role === 'Distributor');

  const assignStockToDistributor = (distributorId: string, productId: string, units: number, notes?: string) => {
    const dist = users.find(u => u.id === distributorId && u.role === 'Distributor');
    const prod = products.find(p => p.id === productId);
    if (!dist || !prod || units <= 0 || prod.stockWarehouse < units) return;

    // Deduct from central warehouse
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockWarehouse: Math.max(0, p.stockWarehouse - units) } : p));

    // Increase in distributor stock
    setDistributorStock(prev => {
      const existing = prev.find(s => s.distributorId === distributorId && s.productId === productId);
      if (existing) {
        return prev.map(s => s.distributorId === distributorId && s.productId === productId ? {
          ...s,
          unitsHeld: s.unitsHeld + units,
          lastRestockedDate: new Date().toISOString().slice(0, 10),
          notes: notes || s.notes
        } : s);
      } else {
        const newItem: DistributorStockItem = {
          id: `dstock-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          distributorId,
          distributorName: dist.name,
          productId,
          productName: prod.name,
          unitsHeld: units,
          allocatedDate: new Date().toISOString().slice(0, 10),
          notes: notes || 'Allocated from Central Warehouse'
        };
        return [...prev, newItem];
      }
    });

    // Log stock movement
    setStockMovements(m => [
      {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        productId: prod.id,
        productName: prod.name,
        type: 'Warehouse to Distributor',
        fromLocation: 'Central Warehouse (Ikeja)',
        toLocation: dist.name,
        quantity: units,
        referenceOrderOrAgent: notes || `Direct allocation to ${dist.name}`
      },
      ...m
    ]);

    addNotification({
      title: 'Stock Assigned to Distributor',
      message: `${units} units of ${prod.name} successfully assigned to ${dist.name}. Warehouse stock adjusted.`,
      type: 'success'
    });
  };

  const returnStockFromDistributor = (distributorId: string, productId: string, units: number, notes?: string) => {
    const dist = users.find(u => u.id === distributorId);
    const prod = products.find(p => p.id === productId);
    if (!dist || !prod || units <= 0) return;

    setDistributorStock(prev => {
      return prev.map(s => {
        if (s.distributorId === distributorId && s.productId === productId) {
          const newUnits = Math.max(0, s.unitsHeld - units);
          return { ...s, unitsHeld: newUnits };
        }
        return s;
      });
    });

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockWarehouse: p.stockWarehouse + units } : p));

    setStockMovements(m => [
      {
        id: `mov-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        productId: prod.id,
        productName: prod.name,
        type: 'Distributor Return to Warehouse',
        fromLocation: dist.name,
        toLocation: 'Central Warehouse (Ikeja)',
        quantity: units,
        referenceOrderOrAgent: notes || `Returned by ${dist.name}`
      },
      ...m
    ]);

    addNotification({
      title: 'Distributor Stock Returned',
      message: `${units} units of ${prod.name} returned to Central Warehouse from ${dist.name}`,
      type: 'info'
    });
  };

  const setDistributorStockLevel = (distributorId: string, productId: string, unitsHeld: number, notes?: string) => {
    const dist = users.find(u => u.id === distributorId);
    const prod = products.find(p => p.id === productId);
    if (!dist || !prod) return;

    setDistributorStock(prev => {
      const existing = prev.find(s => s.distributorId === distributorId && s.productId === productId);
      if (existing) {
        return prev.map(s => s.distributorId === distributorId && s.productId === productId ? {
          ...s,
          unitsHeld: Math.max(0, unitsHeld),
          notes: notes || s.notes
        } : s);
      } else {
        return [...prev, {
          id: `dstock-${Date.now()}`,
          distributorId,
          distributorName: dist.name,
          productId,
          productName: prod.name,
          unitsHeld: Math.max(0, unitsHeld),
          allocatedDate: new Date().toISOString().slice(0, 10),
          notes: notes || 'Calibrated stock level'
        }];
      }
    });

    addNotification({
      title: 'Distributor Stock Level Calibrated',
      message: `Stock level for ${prod.name} held by ${dist.name} set to ${unitsHeld} units.`,
      type: 'info'
    });
  };

  const requestDistributorRestock = (distributorId: string, productId: string, requestedUnits: number, notes?: string) => {
    const dist = users.find(u => u.id === distributorId);
    const prod = products.find(p => p.id === productId);
    addNotification({
      title: 'Distributor Restock Request',
      message: `${dist?.name || 'Distributor'} requested ${requestedUnits} units of ${prod?.name || 'product'}. Notes: ${notes || 'Immediate warehouse dispatch required.'}`,
      type: 'info'
    });
  };

  const addAgent = (agentData: Omit<DeliveryAgent, 'id'>): DeliveryAgent => {
    const newAgent: DeliveryAgent = {
      ...agentData,
      id: `agent-${Date.now()}`
    };
    setAgents(prev => [newAgent, ...prev]);
    return newAgent;
  };

  const updateAgent = (id: string, updates: Partial<DeliveryAgent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    setAgentStock(prev => prev.filter(s => s.agentId !== id));
  };

  // Users
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Teams & Round Robin
  const addSalesTeam = (team: Omit<SalesTeam, 'id'>) => {
    setSalesTeams(prev => [...prev, { ...team, id: `team-${Date.now()}` }]);
  };

  const updateSalesTeam = (teamId: string, updates: Partial<SalesTeam>) => {
    setSalesTeams(prev => prev.map(t => t.id === teamId ? { ...t, ...updates } : t));
  };

  const deleteSalesTeam = (teamId: string) => {
    setSalesTeams(prev => prev.filter(t => t.id !== teamId));
    setUsers(prev => prev.map(u => u.teamId === teamId ? { ...u, teamId: undefined } : u));
  };

  const addRepToTeam = (teamId: string, repId: string) => {
    setSalesTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      if (t.repIds.includes(repId)) return t;
      return { ...t, repIds: [...t.repIds, repId] };
    }));
    setUsers(prev => prev.map(u => u.id === repId ? { ...u, teamId } : u));
  };

  const removeRepFromTeam = (teamId: string, repId: string) => {
    setSalesTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      return { ...t, repIds: t.repIds.filter(id => id !== repId) };
    }));
    setUsers(prev => prev.map(u => (u.id === repId && u.teamId === teamId) ? { ...u, teamId: undefined } : u));
  };

  const updateRoundRobinPool = (poolType: 'order' | 'cart', repId: string, updates: { weight?: number; isIncluded?: number | boolean; isAvailable?: boolean }) => {
    setRoundRobin(prev => {
      const poolKey = poolType === 'order' ? 'orderPool' : 'cartPool';
      const updated = prev[poolKey].map(r => {
        if (r.repId !== repId) return r;
        return {
          ...r,
          weight: updates.weight !== undefined ? updates.weight : r.weight,
          isIncluded: updates.isIncluded !== undefined ? Boolean(updates.isIncluded) : r.isIncluded,
          isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : r.isAvailable
        };
      });
      return { ...prev, [poolKey]: updated };
    });
  };

  const skipRoundRobinRep = (poolType: 'order' | 'cart') => {
    setRoundRobin(prev => {
      if (poolType === 'order') {
        return { ...prev, nextRepIndexOrder: (prev.nextRepIndexOrder + 1) % prev.orderPool.length };
      } else {
        return { ...prev, nextRepIndexCart: (prev.nextRepIndexCart + 1) % prev.cartPool.length };
      }
    });
  };

  const resetRoundRobinSequence = (poolType: 'order' | 'cart') => {
    setRoundRobin(prev => {
      if (poolType === 'order') {
        return { ...prev, nextRepIndexOrder: 0 };
      } else {
        return { ...prev, nextRepIndexCart: 0 };
      }
    });
  };

  // Expenses & Remittances
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const markRemittanceAsPaid = (remittanceId: string, deliveryFee: number = 0, notes?: string, paymentRef?: string) => {
    let targetRemittance: Remittance | undefined;

    setRemittances(prev => prev.map(r => {
      if (r.id === remittanceId || r.orderId === remittanceId || r.orderNumber === remittanceId) {
        const gross = r.orderTotal || (r.amountToRemit + (r.deliveryFeeDeducted || 0));
        const netRemitted = Math.max(0, gross - deliveryFee);
        const updated: Remittance = {
          ...r,
          status: 'Remitted',
          deliveryFeeDeducted: deliveryFee,
          amountToRemit: netRemitted,
          remittedAt: new Date().toISOString(),
          paymentReference: paymentRef || r.paymentReference,
          notes: notes || r.notes
        };
        targetRemittance = updated;
        return updated;
      }
      return r;
    }));

    // If an agent delivery fee was deducted, log it as an expense so it reflects in Financials and Accounting
    if (deliveryFee > 0) {
      const orderNum = targetRemittance?.orderNumber || remittanceId;
      const agentInfo = targetRemittance ? ` - ${targetRemittance.agentName}` : '';
      const customerInfo = targetRemittance ? ` (${targetRemittance.customerName})` : '';

      const newExpense: Expense = {
        id: `exp-agent-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Agent Delivery Fees',
        amount: deliveryFee,
        currency: targetRemittance?.currency || currency || 'NGN',
        description: `Delivery fee deducted for order ${orderNum}${agentInfo}${customerInfo}`,
        reference: orderNum
      };

      setExpenses(prev => [newExpense, ...prev]);

      addNotification({
        title: 'Remittance & Delivery Expense Logged',
        message: `Order #${orderNum} marked remitted. Delivery fee of ₦${deliveryFee.toLocaleString()} was logged under Agent Delivery Fees in financial accounts.`,
        type: 'success'
      });
    }
  };

  // Customers
  const toggleCustomerBlock = (customerId: string) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, isBlocked: !c.isBlocked } : c));
  };

  // Media Buyers
  const addMediaBuyer = (buyer: Omit<MediaBuyer, 'id'>) => {
    setMediaBuyers(prev => [...prev, { ...buyer, id: `mb-${Date.now()}` }]);
  };

  const updateMediaBuyer = (id: string, updates: Partial<MediaBuyer>) => {
    setMediaBuyers(prev => prev.map(mb => mb.id === id ? { ...mb, ...updates } : mb));
  };

  const deleteMediaBuyer = (id: string) => {
    setMediaBuyers(prev => prev.filter(mb => mb.id !== id));
  };

  const addMediaBuyerSpendLog = (log: Omit<MediaBuyerSpendLog, 'id'>) => {
    const newLog: MediaBuyerSpendLog = {
      ...log,
      id: `spend-${Date.now()}`
    };
    setMediaBuyerSpendLogs(prev => [newLog, ...prev]);
    // Also increment recorded spend on the media buyer
    setMediaBuyers(prev => prev.map(mb => {
      if (mb.id === log.mediaBuyerId) {
        return {
          ...mb,
          totalSpendRecorded: (mb.totalSpendRecorded || 0) + log.amount
        };
      }
      return mb;
    }));
  };

  const deleteMediaBuyerSpendLog = (id: string) => {
    // Only Administrators and Owners are permitted to delete ad spend records
    if (currentUser && currentUser.role !== 'Owner' && currentUser.role !== 'Admin') {
      addNotification({
        title: 'Delete Permission Denied',
        message: 'Ad spend records are audit-locked and can only be deleted by an Administrator.',
        type: 'info'
      });
      return;
    }
    setMediaBuyerSpendLogs(prev => prev.filter(s => s.id !== id));
    addNotification({
      title: 'Ad Spend Record Deleted',
      message: 'Ad spend entry deleted by Administrator.',
      type: 'info'
    });
  };

  // AI Calling & Tokens
  const triggerAICall = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (settings.tokenBalance < 2) {
      alert("Insufficient AI tokens! Please allocate more tokens under Token Metering in admin view.");
      return;
    }

    // Deduct 2 tokens
    const newBal = settings.tokenBalance - 2;
    setSettings(prev => ({ ...prev, tokenBalance: newBal }));
    setTokenTransactions(prev => [
      {
        id: `tok-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        type: 'AI Call Used',
        tokensChanged: -2,
        tokenBalanceAfter: newBal,
        description: `Triggered Vapi AI confirmation call for ${order.orderNumber}`
      },
      ...prev
    ]);

    const newLog: AICallLog = {
      id: `ai-${Date.now()}`,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      productName: order.items[0]?.productName || 'Product',
      attempts: 1,
      maxAttempts: 5,
      cycle: 1,
      outcome: 'ANSWERED',
      durationSeconds: 65,
      orderStatus: 'CONFIRMED',
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      transcriptSnippet: `AI: Hello ${order.customerName}, calling from BettaTraka fulfillment regarding your order #${order.orderNumber} for delivery to ${order.deliveryCity}. Can we dispatch today? Customer: Yes please, am ready with cash!`
    };

    setAiLogs(prev => [newLog, ...prev]);
    updateOrderStatus(orderId, 'CONFIRMED');
  };

  const buyTokens = (amount: number, costNgn: number, paymentRef?: string, paymentMethod?: string) => {
    const newBal = settings.tokenBalance + amount;
    const ref = paymentRef || `PSTK-TK-${Date.now().toString().slice(-8)}`;
    const method = paymentMethod || 'Paystack (Card / USSD)';
    
    setSettings(prev => ({ ...prev, tokenBalance: newBal }));
    
    setTokenTransactions(prev => [
      {
        id: `tok-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        type: 'Purchase',
        tokensChanged: amount,
        tokenBalanceAfter: newBal,
        description: `Purchased ${amount} Tokens (${method})`,
        amountPaidNgn: costNgn,
        paymentReference: ref,
        paymentMethod: method
      },
      ...prev
    ]);

    // Automatically record as an operating expense for transparent P&L tracking
    setExpenses(prev => [
      {
        id: `exp-${Date.now()}`,
        description: `AI Voice & SMS Token Pack (${amount} tokens)`,
        amount: costNgn,
        type: 'Software & Tools',
        date: new Date().toISOString().split('T')[0],
        currency: 'NGN',
        reference: ref
      },
      ...prev
    ]);

    addNotification({
      title: 'Tokens Credited Successfully',
      message: `Purchased ${amount} tokens for ₦${costNgn.toLocaleString()}. New balance: ${newBal} tokens. Ref: ${ref}`,
      type: 'success'
    });
  };

  const allocateTokens = (amount: number, note?: string) => {
    const newBal = settings.tokenBalance + amount;
    const ref = `ADM-ALLOC-${Date.now().toString().slice(-6)}`;
    const description = note || `Admin System Token Allocation (+${amount} Tokens)`;
    
    setSettings(prev => ({ ...prev, tokenBalance: newBal }));
    
    setTokenTransactions(prev => [
      {
        id: `alloc-${Date.now()}`,
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
        type: 'Bonus Credit',
        tokensChanged: amount,
        tokenBalanceAfter: newBal,
        description,
        paymentReference: ref,
        paymentMethod: 'Admin Direct Allocation'
      },
      ...prev
    ]);

    addNotification({
      title: 'System Tokens Allocated',
      message: `Allocated +${amount} tokens to system quota. Available: ${newBal} tokens.`,
      type: 'success'
    });
  };

  // Chat & Notifications
  const sendChatMessage = (content: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      content,
      timestamp: 'Just now'
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const addNotification = (n: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead'>) => {
    const uniqueId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const item: NotificationItem = {
      ...n,
      id: uniqueId,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [item, ...prev.filter(existing => existing.id !== uniqueId)]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.isRead));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Referrals
  const requestReferralPayout = (referralId: string) => {
    setReferrals(prev => prev.map(r => r.id === referralId ? { ...r, status: 'Paid Out' } : r));
    alert("Payout request submitted! Transfer will reflect in verified bank account within 24 hours.");
  };

  // Payroll calculation
  const runPayroll = (month: string, runCurrency: CurrencyCode): PayrollRun => {
    // Reps performance: count delivered orders per rep
    const items: PayrollItem[] = users
      .filter(u => u.status === 'Active' && u.role !== 'Owner')
      .map(u => {
        const deliveredOrders = orders.filter(o => o.salesRepId === u.id && o.status === 'DELIVERED').length;
        let fixed = u.fixedSalary || 0;
        let comm = (u.commissionPerOrder || 0) * deliveredOrders;
        let bonus = 0;

        return {
          userId: u.id,
          userName: u.name,
          role: u.role,
          payStructure: u.payStructure,
          fixedBase: fixed,
          deliveredOrders: deliveredOrders,
          commissionEarned: comm,
          bonusEarned: bonus,
          totalPayout: fixed + comm + bonus,
          currency: runCurrency
        };
      });

    // Best converter bonus (top rep gets ₦50,000 monthly bonus)
    const sorted = [...items].sort((a, b) => b.deliveredOrders - a.deliveredOrders);
    if (sorted.length > 0 && sorted[0].deliveredOrders > 0) {
      sorted[0].bonusEarned = 50000;
      sorted[0].totalPayout += 50000;
    }

    const total = items.reduce((acc, curr) => acc + curr.totalPayout, 0);

    const newRun: PayrollRun = {
      id: `pay-${Date.now()}`,
      month,
      currency: runCurrency,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Approved',
      totalPayout: total,
      topPerformerRepId: sorted[0]?.userId,
      items
    };

    setPayrollRuns(prev => [newRun, ...prev]);
    return newRun;
  };

  const approvePayroll = (payrollId: string) => {
    setPayrollRuns(prev => prev.map(p => p.id === payrollId ? { ...p, status: 'Paid' } : p));
  };

  return (
    <CrmContext.Provider
      value={{
        persona,
        setPersona,
        adminActiveTab,
        setAdminActiveTab,
        repActiveTab,
        setRepActiveTab,
        distributorActiveTab,
        setDistributorActiveTab,
        invActiveTab,
        setInvActiveTab,
        mediaBuyerActiveTab,
        setMediaBuyerActiveTab,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebarCollapse,
        settings,
        updateSettings,
        currency,
        setCurrency,
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        products,
        addProduct,
        updateProduct,
        updateProductPricing,
        addPackageToProduct,
        updatePackage,
        deletePackageFromProduct,
        deleteProduct,
        agents,
        agentStock,
        stockMovements,
        addAgent,
        updateAgent,
        deleteAgent,
        assignStockToAgent,
        returnStockFromAgent,
        setAgentStockLevel,
        addWarehouseStock,
        transferStockAgentToAgent,
        reconcileAgentStock,
        distributors,
        distributorStock,
        assignStockToDistributor,
        returnStockFromDistributor,
        setDistributorStockLevel,
        requestDistributorRestock,
        orders,
        createOrder,
        updateOrderStatus,
        scheduleOrderDelivery,
        updateOrder,
        assignOrderRep,
        assignOrderAgent,
        assignOrderDistributor,
        deleteOrder,
        deletedOrders,
        restoreOrder,
        abandonedCarts,
        createAbandonedCart,
        updateCartStatus,
        reassignCartRep,
        convertCartToOrder,
        salesTeams,
        addSalesTeam,
        updateSalesTeam,
        deleteSalesTeam,
        addRepToTeam,
        removeRepFromTeam,
        roundRobin,
        updateRoundRobinPool,
        skipRoundRobinRep,
        resetRoundRobinSequence,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        remittances,
        markRemittanceAsPaid,
        payrollRuns,
        runPayroll,
        approvePayroll,
        customers,
        toggleCustomerBlock,
        mediaBuyers,
        addMediaBuyer,
        updateMediaBuyer,
        deleteMediaBuyer,
        mediaBuyerSpendLogs,
        addMediaBuyerSpendLog,
        deleteMediaBuyerSpendLog,
        aiLogs,
        triggerAICall,
        tokenTransactions,
        buyTokens,
        allocateTokens,
        chatMessages,
        sendChatMessage,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        deleteReadNotifications,
        clearAllNotifications,
        addNotification,
        referrals,
        requestReferralPayout,
        orderForms,
        selectedFormId,
        setSelectedFormId,
        activeOrderForm,
        createOrderForm,
        updateOrderForm,
        deleteOrderForm,
        duplicateOrderForm,
        formConfig,
        updateFormConfig,
        themeMode,
        setThemeMode,
        toggleThemeMode
      }}
    >
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
