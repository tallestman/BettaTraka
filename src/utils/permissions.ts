import { ManagerPermissions, User, UserRole } from '../types/crm';

export interface PermissionDefinition {
  id: string;
  category: 'sales' | 'operations' | 'finance' | 'admin';
  label: string;
  description: string;
  tabId?: string;
}

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Sales & CRM
  {
    id: 'orders',
    category: 'sales',
    label: 'Orders Management',
    description: 'View, create, confirm, dispatch, and track customer orders.',
    tabId: 'orders'
  },
  {
    id: 'abandonedCarts',
    category: 'sales',
    label: 'Abandoned Carts',
    description: 'Track, recover, and reassign abandoned checkouts.',
    tabId: 'abandoned-carts'
  },
  {
    id: 'scheduledDeliveries',
    category: 'sales',
    label: 'Scheduled Deliveries',
    description: 'Manage deferred calendar deliveries and fulfillment slots.',
    tabId: 'scheduled'
  },
  {
    id: 'deliveries',
    category: 'sales',
    label: 'Deliveries Tracking',
    description: 'Monitor dispatched packages, delivery proofs, and agent assignments.',
    tabId: 'deliveries'
  },
  {
    id: 'customers',
    category: 'sales',
    label: 'Customers CRM',
    description: 'Access customer profiles, purchase histories, and credit records.',
    tabId: 'customers'
  },
  {
    id: 'salesReps',
    category: 'sales',
    label: 'Sales Representatives',
    description: 'Manage sales rep profiles, commission rates, and pay slips.',
    tabId: 'sales-reps'
  },
  {
    id: 'salesTeams',
    category: 'sales',
    label: 'Sales Teams',
    description: 'Configure regional sales squads, team leads, and quotas.',
    tabId: 'sales-teams'
  },
  {
    id: 'teamPerformance',
    category: 'sales',
    label: 'Team Performance & Leaderboards',
    description: 'View rep conversion rates, revenue rankings, and performance tiers.',
    tabId: 'team-performance'
  },

  // Operations & Logistics
  {
    id: 'deliveryAgents',
    category: 'operations',
    label: 'Delivery Agents Logistics',
    description: 'Manage dispatch riders, stock allocation, and delivery routes.',
    tabId: 'agents'
  },
  {
    id: 'inventory',
    category: 'operations',
    label: 'Inventory & Stock Management',
    description: 'Track warehouse levels, SKUs, reorder thresholds, and stock transfers.',
    tabId: 'inventory'
  },
  {
    id: 'distributors',
    category: 'operations',
    label: 'Regional Distributors',
    description: 'Manage regional distributors, wholesale pricing, and hub stock.',
    tabId: 'distributors'
  },
  {
    id: 'roundRobin',
    category: 'operations',
    label: 'Round-Robin Lead Routing',
    description: 'Configure automated lead and order distribution engines across reps.',
    tabId: 'round-robin'
  },

  // Finance & Accounting
  {
    id: 'expenses',
    category: 'finance',
    label: 'Expenses & Operational Costs',
    description: 'Record operating expenses, logistics overhead, and fuel/office receipts.',
    tabId: 'expenses'
  },
  {
    id: 'reports',
    category: 'finance',
    label: 'Finance & P&L Reports',
    description: 'Access profit and loss summaries, gross margin metrics, and ledger charts.',
    tabId: 'financial-reports'
  },
  {
    id: 'orderReports',
    category: 'finance',
    label: 'Order Reports & Analytics',
    description: 'Deep dive revenue, status breakdown, and cancellation analytics.',
    tabId: 'order-reports'
  },
  {
    id: 'remittances',
    category: 'finance',
    label: 'Cash Remittances & Escrow',
    description: 'Audit cash collected by riders/distributors and mark remittances settled.',
    tabId: 'remittances'
  },
  {
    id: 'mediaBuyers',
    category: 'finance',
    label: 'Media Buyer Payouts',
    description: 'Review ad spend ROI, attribution performance, and commission payouts.',
    tabId: 'media-buyers'
  },
  {
    id: 'payroll',
    category: 'finance',
    label: 'Staff Payroll & Salary Rates',
    description: 'Calculate and process staff salary payouts, tiers, bonuses, and penalties.',
    tabId: 'payroll'
  },

  // System, AI & Administration
  {
    id: 'users',
    category: 'admin',
    label: 'User Management & Roles',
    description: 'Create users, assign roles, configure permissions, and reset access.',
    tabId: 'users'
  },
  {
    id: 'teamChat',
    category: 'admin',
    label: 'Team Chat & Channels',
    description: 'Participate in company-wide channels and cross-department messaging.',
    tabId: 'team-chat'
  },
  {
    id: 'notifications',
    category: 'admin',
    label: 'Notifications & Alerts',
    description: 'Receive real-time alerts for orders, stock shortages, and system events.',
    tabId: 'notifications'
  },
  {
    id: 'orderFormBuilder',
    category: 'admin',
    label: 'Embed Form Generator',
    description: 'Design and embed customer checkout forms on Shopify, WordPress, or landing pages.',
    tabId: 'embed-forms'
  },
  {
    id: 'adTracker',
    category: 'admin',
    label: 'Ad Tracker (UTM & Attribution)',
    description: 'Track ad campaigns, UTM parameters, Facebook/TikTok pixel conversions.',
    tabId: 'ad-tracking'
  },
  {
    id: 'aiAgent',
    category: 'admin',
    label: 'AI Voice Calling Agent',
    description: 'Trigger autonomous AI voice calls to confirm pending orders with customers.',
    tabId: 'ai-agent'
  },
  {
    id: 'aiSandbox',
    category: 'admin',
    label: 'AI Sandbox & Prompt Studio',
    description: 'Test voice scripts, configure Gemini models, and test voice interactions.',
    tabId: 'ai-sandbox'
  },
  {
    id: 'tokenReporting',
    category: 'admin',
    label: 'AI Token Usage & Billing',
    description: 'Inspect Gemini token consumption, top-up balances, and call recordings.',
    tabId: 'tokens'
  },
  {
    id: 'integrations',
    category: 'admin',
    label: 'External Integrations & Webhooks',
    description: 'Connect WhatsApp API, SMS gateways, Shopify, and Google Sheets sync.',
    tabId: 'integrations'
  },
  {
    id: 'subscription',
    category: 'admin',
    label: 'Subscription & Plan Management',
    description: 'Manage SaaS plan tiers, seat licenses, invoice receipts, and renewals.',
    tabId: 'subscription'
  },
  {
    id: 'settings',
    category: 'admin',
    label: 'System & Company Settings',
    description: 'Configure currencies, business information, company branding, and security.',
    tabId: 'settings'
  }
];

export const TOTAL_PERMISSIONS_COUNT = PERMISSION_DEFINITIONS.length;

export const getAllPermissionsGranted = (): ManagerPermissions => ({
  sales: {
    orders: true,
    abandonedCarts: true,
    scheduledDeliveries: true,
    salesReps: true,
    salesTeams: true,
    teamPerformance: true,
    customers: true,
    deliveries: true
  },
  operations: {
    deliveryAgents: true,
    inventory: true,
    distributors: true,
    roundRobin: true
  },
  finance: {
    expenses: true,
    reports: true,
    orderReports: true,
    remittances: true,
    mediaBuyers: true,
    payroll: true
  },
  admin: {
    users: true,
    teamChat: true,
    notifications: true,
    orderFormBuilder: true,
    adTracker: true,
    aiAgent: true,
    aiSandbox: true,
    tokenReporting: true,
    integrations: true,
    subscription: true,
    settings: true
  }
});

export const getNoPermissionsGranted = (): ManagerPermissions => ({
  sales: {
    orders: false,
    abandonedCarts: false,
    scheduledDeliveries: false,
    salesReps: false,
    salesTeams: false,
    teamPerformance: false,
    customers: false,
    deliveries: false
  },
  operations: {
    deliveryAgents: false,
    inventory: false,
    distributors: false,
    roundRobin: false
  },
  finance: {
    expenses: false,
    reports: false,
    orderReports: false,
    remittances: false,
    mediaBuyers: false,
    payroll: false
  },
  admin: {
    users: false,
    teamChat: false,
    notifications: false,
    orderFormBuilder: false,
    adTracker: false,
    aiAgent: false,
    aiSandbox: false,
    tokenReporting: false,
    integrations: false,
    subscription: false,
    settings: false
  }
});

export const getDefaultPermissionsForRole = (role: UserRole): ManagerPermissions => {
  const base = getNoPermissionsGranted();

  switch (role) {
    case 'Owner':
    case 'Admin':
      return getAllPermissionsGranted();

    case 'Manager':
      return {
        sales: {
          orders: true,
          abandonedCarts: true,
          scheduledDeliveries: true,
          salesReps: true,
          salesTeams: true,
          teamPerformance: true,
          customers: true,
          deliveries: true
        },
        operations: {
          deliveryAgents: true,
          inventory: true,
          distributors: true,
          roundRobin: true
        },
        finance: {
          expenses: true,
          reports: true,
          orderReports: true,
          remittances: true,
          mediaBuyers: true,
          payroll: true
        },
        admin: {
          users: true,
          teamChat: true,
          notifications: true,
          orderFormBuilder: true,
          adTracker: true,
          aiAgent: false,
          aiSandbox: false,
          tokenReporting: false,
          integrations: false,
          subscription: true,
          settings: true
        }
      };

    case 'Accountant':
      return {
        ...base,
        sales: {
          ...base.sales,
          orders: true,
          deliveries: true
        },
        finance: {
          expenses: true,
          reports: true,
          orderReports: true,
          remittances: true,
          mediaBuyers: false,
          payroll: true
        },
        admin: {
          ...base.admin,
          teamChat: true,
          notifications: true,
          settings: true
        }
      };

    case 'Sales Representative':
      return {
        ...base,
        sales: {
          orders: true,
          abandonedCarts: true,
          scheduledDeliveries: true,
          salesReps: true,
          salesTeams: true,
          teamPerformance: true,
          customers: true,
          deliveries: true
        },
        admin: {
          ...base.admin,
          teamChat: true,
          notifications: true
        }
      };

    case 'Team Lead':
      return {
        ...base,
        sales: {
          orders: true,
          abandonedCarts: true,
          scheduledDeliveries: true,
          salesReps: true,
          salesTeams: true,
          teamPerformance: true,
          customers: true,
          deliveries: true
        },
        operations: {
          ...base.operations,
          roundRobin: true
        },
        admin: {
          ...base.admin,
          teamChat: true,
          notifications: true
        }
      };

    case 'Distributor':
      return {
        ...base,
        sales: {
          ...base.sales,
          deliveries: true
        },
        operations: {
          ...base.operations,
          inventory: true,
          distributors: true
        },
        finance: {
          ...base.finance,
          remittances: true
        },
        admin: {
          ...base.admin,
          teamChat: true,
          notifications: true
        }
      };

    case 'Inventory Manager':
      return {
        ...base,
        sales: {
          ...base.sales,
          orders: true,
          deliveries: true
        },
        operations: {
          deliveryAgents: true,
          inventory: true,
          distributors: true,
          roundRobin: true
        },
        admin: {
          ...base.admin,
          teamChat: true,
          notifications: true
        }
      };

    case 'Media Buyer':
      return {
        ...base,
        sales: {
          ...base.sales,
          orders: true
        },
        finance: {
          ...base.finance,
          orderReports: true,
          mediaBuyers: true
        },
        admin: {
          ...base.admin,
          orderFormBuilder: true,
          adTracker: true,
          teamChat: true,
          notifications: true
        }
      };

    default:
      return base;
  }
};

export const normalizeUserPermissions = (user: User): ManagerPermissions => {
  const defaults = getDefaultPermissionsForRole(user.role);
  if (!user.permissions) return defaults;

  const perms = user.permissions;
  return {
    sales: {
      orders: perms.sales?.orders ?? defaults.sales.orders,
      abandonedCarts: perms.sales?.abandonedCarts ?? defaults.sales.abandonedCarts ?? false,
      scheduledDeliveries: perms.sales?.scheduledDeliveries ?? defaults.sales.scheduledDeliveries ?? false,
      salesReps: perms.sales?.salesReps ?? defaults.sales.salesReps,
      salesTeams: perms.sales?.salesTeams ?? defaults.sales.salesTeams ?? false,
      teamPerformance: perms.sales?.teamPerformance ?? defaults.sales.teamPerformance,
      customers: perms.sales?.customers ?? defaults.sales.customers,
      deliveries: perms.sales?.deliveries ?? defaults.sales.deliveries
    },
    operations: {
      deliveryAgents: perms.operations?.deliveryAgents ?? defaults.operations.deliveryAgents,
      inventory: perms.operations?.inventory ?? defaults.operations.inventory,
      distributors: perms.operations?.distributors ?? defaults.operations.distributors ?? false,
      roundRobin: perms.operations?.roundRobin ?? defaults.operations.roundRobin
    },
    finance: {
      expenses: perms.finance?.expenses ?? defaults.finance.expenses,
      reports: perms.finance?.reports ?? defaults.finance.reports,
      orderReports: perms.finance?.orderReports ?? defaults.finance.orderReports,
      remittances: perms.finance?.remittances ?? defaults.finance.remittances,
      mediaBuyers: perms.finance?.mediaBuyers ?? defaults.finance.mediaBuyers,
      payroll: perms.finance?.payroll ?? defaults.finance.payroll
    },
    admin: {
      users: perms.admin?.users ?? defaults.admin.users,
      teamChat: perms.admin?.teamChat ?? defaults.admin.teamChat ?? true,
      notifications: perms.admin?.notifications ?? defaults.admin.notifications,
      orderFormBuilder: perms.admin?.orderFormBuilder ?? defaults.admin.orderFormBuilder,
      adTracker: perms.admin?.adTracker ?? defaults.admin.adTracker,
      aiAgent: perms.admin?.aiAgent ?? defaults.admin.aiAgent,
      aiSandbox: perms.admin?.aiSandbox ?? defaults.admin.aiSandbox ?? false,
      tokenReporting: perms.admin?.tokenReporting ?? defaults.admin.tokenReporting ?? false,
      integrations: perms.admin?.integrations ?? defaults.admin.integrations ?? false,
      subscription: perms.admin?.subscription ?? defaults.admin.subscription,
      settings: perms.admin?.settings ?? defaults.admin.settings
    }
  };
};

export const countGrantedPermissions = (perms: ManagerPermissions): { granted: number; total: number } => {
  let granted = 0;
  PERMISSION_DEFINITIONS.forEach(def => {
    const cat = perms[def.category] as any;
    if (cat && Boolean(cat[def.id])) {
      granted++;
    }
  });
  return { granted, total: TOTAL_PERMISSIONS_COUNT };
};

export const hasUserAccessToTab = (user: User | null | undefined, tabId: string): boolean => {
  if (!user) return false;
  if (user.role === 'Owner') return true; // Owner always has root access

  // Global public / non-restricted tabs
  if (tabId === 'dashboard' || tabId === 'support' || tabId === 'academy') {
    return true;
  }

  const def = PERMISSION_DEFINITIONS.find(p => p.tabId === tabId);
  if (!def) return true; // If tab is not gated, permit access

  const perms = normalizeUserPermissions(user);
  const cat = perms[def.category] as any;
  return Boolean(cat && cat[def.id]);
};
