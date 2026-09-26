import { 
  Product, 
  User, 
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
  AICallLog, 
  TokenTransaction, 
  ReferralRecord, 
  ChatMessage, 
  NotificationItem, 
  EmbedFormConfig, 
  OrderFormRecord,
  OrganizationSettings,
  Remittance
} from '../types/crm';

export const NIGERIAN_STATES = [
  'Lagos',
  'FCT - Abuja',
  'Rivers (Port Harcourt)',
  'Oyo (Ibadan)',
  'Ogun (Abeokuta)',
  'Kano',
  'Anambra (Onitsha/Awka)',
  'Delta (Warri/Asaba)',
  'Edo (Benin City)',
  'Enugu',
  'Abia (Aba/Umuahia)',
  'Adamawa',
  'Akwa Ibom (Uyo)',
  'Bauchi',
  'Bayelsa (Yenagoa)',
  'Benue (Makurdi)',
  'Borno (Maiduguri)',
  'Cross River (Calabar)',
  'Ebonyi (Abakaliki)',
  'Ekiti (Ado-Ekiti)',
  'Gombe',
  'Imo (Owerri)',
  'Jigawa (Dutse)',
  'Kaduna',
  'Katsina',
  'Kebbi (Birnin Kebbi)',
  'Kogi (Lokoja)',
  'Kwara (Ilorin)',
  'Nasarawa (Lafia)',
  'Niger (Minna)',
  'Ondo (Akure)',
  'Osun (Osogbo)',
  'Plateau (Jos)',
  'Sokoto',
  'Taraba (Jalingo)',
  'Yobe (Damaturu)',
  'Zamfara (Gusau)'
];

export const INITIAL_ORG_SETTINGS: OrganizationSettings = {
  name: 'BettaTraka POD Operating System',
  currency: 'NGN',
  currentPlan: 'Growth',
  billedPeriod: 'Monthly',
  tokenBalance: 420,
  emailQuotaMonthly: 8000,
  emailCreditsUsed: 2140,
  referralCode: 'DEMOACCBX',
  pwaInstalled: false,
  emailNotificationsOrgWide: true,
  notifyAdminsOnNewCarts: true,
  salesRepV2Preview: true,
  adminV2Preview: false,
  themeMode: 'dark'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Emmanuel Oamen (You)',
    email: 'admin@apexbrands.ng',
    phone: '+234 803 111 2233',
    role: 'Owner',
    status: 'Active',
    createdAt: '2026-01-10',
    payStructure: 'Fixed',
    fixedSalary: 850000
  },
  {
    id: 'user-rep-1',
    name: 'Chioma Adeyemi',
    email: 'chioma.a@apexbrands.ng',
    phone: '+234 812 456 7890',
    role: 'Sales Representative',
    status: 'Active',
    createdAt: '2026-02-01',
    teamId: 'team-lagos',
    payStructure: 'Hybrid',
    fixedSalary: 75000,
    commissionPerOrder: 1500
  },
  {
    id: 'user-rep-2',
    name: 'Emeka Okafor',
    email: 'emeka.o@apexbrands.ng',
    phone: '+234 809 332 1100',
    role: 'Sales Representative',
    status: 'Active',
    createdAt: '2026-02-15',
    teamId: 'team-abuja',
    payStructure: 'Commission',
    commissionPerOrder: 1800
  },
  {
    id: 'user-rep-3',
    name: 'Fatima Dangote',
    email: 'fatima.d@apexbrands.ng',
    phone: '+234 814 990 4455',
    role: 'Sales Representative',
    status: 'Active',
    createdAt: '2026-03-01',
    teamId: 'team-north',
    payStructure: 'Hybrid',
    fixedSalary: 60000,
    commissionPerOrder: 1400
  },
  {
    id: 'user-rep-4',
    name: 'Tunde Balogun',
    email: 'tunde.b@apexbrands.ng',
    phone: '+234 818 776 2211',
    role: 'Sales Representative',
    status: 'Active',
    createdAt: '2026-04-10',
    teamId: 'team-lagos',
    payStructure: 'Commission',
    commissionPerOrder: 1600
  },
  {
    id: 'user-inv-mgr',
    name: 'Babajide Cole',
    email: 'babajide.c@apexbrands.ng',
    phone: '+234 802 654 3210',
    role: 'Inventory Manager',
    status: 'Active',
    createdAt: '2026-01-20',
    payStructure: 'Fixed',
    fixedSalary: 180000
  },
  {
    id: 'user-mgr-optin',
    name: 'Ngozi Eze (Ops Manager)',
    email: 'ngozi.e@apexbrands.ng',
    phone: '+234 805 777 8899',
    role: 'Manager',
    status: 'Active',
    createdAt: '2026-05-02',
    payStructure: 'Fixed',
    fixedSalary: 220000,
    permissions: {
      sales: { orders: true, salesReps: true, teamPerformance: true, customers: true, deliveries: true },
      operations: { deliveryAgents: true, inventory: true, roundRobin: false },
      finance: { expenses: false, reports: false, orderReports: true, remittances: true, mediaBuyers: false, payroll: false },
      admin: { users: false, notifications: true, orderFormBuilder: false, adTracker: true, aiAgent: false, subscription: false, settings: false }
    }
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Bella Glow Herbal Clarifying 4-Piece Set',
    description: 'All-natural organic skin brightening cleanser, serum, spot corrector, and SPF moisturizer.',
    sku: 'BG-HERB-4PC',
    unitCost: 4500,
    sellingPrice: 24500,
    stockWarehouse: 480,
    category: 'Beauty & Skincare',
    pricing: [
      { currency: 'NGN', sellingPrice: 24500, baseCost: 4500, landedCost: 6500, marginPercent: 73.5 },
      { currency: 'GHS', sellingPrice: 220, baseCost: 42, landedCost: 60, marginPercent: 72.7 },
      { currency: 'KES', sellingPrice: 2600, baseCost: 480, landedCost: 700, marginPercent: 73.1 },
      { currency: 'USD', sellingPrice: 28, baseCost: 5, landedCost: 7.5, marginPercent: 73.2 }
    ],
    packages: [
      {
        id: 'pkg-1-single',
        productId: 'prod-1',
        name: 'Single Complete Set (1-Month Treatment)',
        description: 'Includes 1x Cleanser, 1x Clarifying Serum, 1x Cream, 1x SPF',
        quantity: 1,
        price: 24500,
        currency: 'NGN',
        status: 'Active'
      },
      {
        id: 'pkg-1-double',
        productId: 'prod-1',
        name: 'Double Treatment Bundle (Most Popular)',
        description: '2x Complete 4-Piece Sets + FREE Jade Facial Roller & Glow Mist',
        quantity: 2,
        price: 42000,
        currency: 'NGN',
        status: 'Active',
        badge: 'Most Popular',
        hasFreeGift: true,
        freeGiftName: 'Rose Quartz Roller & Vitamin C Mist',
        freeGiftQuantity: 1,
        freeGiftPerceivedValue: 5000
      },
      {
        id: 'pkg-1-family',
        productId: 'prod-1',
        name: 'Family 3-Set Pack (Ultimate Value)',
        description: '3x Complete 4-Piece Sets + 2 Free Gifts + Express Priority Courier',
        quantity: 3,
        price: 58000,
        currency: 'NGN',
        status: 'Active',
        badge: 'Best Value',
        hasFreeGift: true,
        freeGiftName: '2x Glow Toner + Luxury Silk Sleep Mask',
        freeGiftQuantity: 1,
        freeGiftPerceivedValue: 8500
      }
    ]
  },
  {
    id: 'prod-2',
    name: 'Titan Pro Smartwatch POD Edition',
    description: 'Rugged Bluetooth calling smartwatch with AMOLED display, BP & heart rate monitor, 14-day battery.',
    sku: 'TITAN-PRO-AMOLED',
    unitCost: 8200,
    sellingPrice: 32000,
    stockWarehouse: 290,
    category: 'Gadgets & Tech',
    pricing: [
      { currency: 'NGN', sellingPrice: 32000, baseCost: 8200, landedCost: 11000, marginPercent: 65.6 },
      { currency: 'GHS', sellingPrice: 280, baseCost: 75, landedCost: 95, marginPercent: 66.1 },
      { currency: 'USD', sellingPrice: 35, baseCost: 9, landedCost: 12.5, marginPercent: 64.3 }
    ],
    packages: [
      {
        id: 'pkg-2-single',
        productId: 'prod-2',
        name: 'Titan Pro Smartwatch (1 Unit)',
        description: 'Black Matte finish with silicone strap and magnetic quick charger',
        quantity: 1,
        price: 32000,
        currency: 'NGN',
        status: 'Active'
      },
      {
        id: 'pkg-2-double',
        productId: 'prod-2',
        name: 'Couples Dual Titan Pack (Save ₦8,000)',
        description: '2x Watches + 2 Free Stainless Steel Milanese Bands + 1 Year Warranty',
        quantity: 2,
        price: 56000,
        currency: 'NGN',
        status: 'Active',
        badge: 'Save ₦8,000',
        hasFreeGift: true,
        freeGiftName: '2x Magnetic Stainless Milanese Straps',
        freeGiftQuantity: 2,
        freeGiftPerceivedValue: 6000
      }
    ]
  },
  {
    id: 'prod-3',
    name: 'AeroKnee Dual Spring Compression Sleeve',
    description: 'Medical-grade knee stabilizer with side spring bars and silicone patella gel pad for arthritis & sports.',
    sku: 'AERO-KNEE-PAIR',
    unitCost: 3200,
    sellingPrice: 18500,
    stockWarehouse: 610,
    category: 'Health & Wellness',
    pricing: [
      { currency: 'NGN', sellingPrice: 18500, baseCost: 3200, landedCost: 4600, marginPercent: 75.1 },
      { currency: 'GHS', sellingPrice: 165, baseCost: 30, landedCost: 42, marginPercent: 74.5 },
      { currency: 'USD', sellingPrice: 22, baseCost: 3.8, landedCost: 5.5, marginPercent: 75.0 }
    ],
    packages: [
      {
        id: 'pkg-3-single',
        productId: 'prod-3',
        name: '1 Pair (Left + Right Sleeve)',
        description: 'Ergonomic breathable 3D knit with dual spring stabilizers',
        quantity: 1,
        price: 18500,
        currency: 'NGN',
        status: 'Active'
      },
      {
        id: 'pkg-3-double',
        productId: 'prod-3',
        name: '2 Pairs (Total 4 Sleeves) + Relief Herbal Balm',
        description: 'Keep one pair for home, one for work + soothing pain relief balm',
        quantity: 2,
        price: 32000,
        currency: 'NGN',
        status: 'Active',
        hasFreeGift: true,
        freeGiftName: 'Herbal Camphor Deep Relief Ointment'
      }
    ]
  }
];

export const INITIAL_AGENTS: DeliveryAgent[] = [
  {
    id: 'agent-1',
    name: 'Musa Ibrahim Logistics',
    phone: '+234 803 555 4321',
    primaryZone: 'Lagos Mainland (Ikeja / Surulere / Yaba)',
    secondaryZones: ['Ikorodu', 'Alimosho'],
    status: 'Active on Duty',
    successRate: 94.2,
    capacityLimit: 1000,
    totalStockHeld: 245,
    defectiveStockValue: 24500,
    missingStockValue: 0
  },
  {
    id: 'agent-2',
    name: 'Kunle Ajayi Express',
    phone: '+234 812 666 7788',
    primaryZone: 'Lagos Island (Lekki / Victoria Island / Ikoyi)',
    secondaryZones: ['Ajah', 'Sangotedo'],
    status: 'Order in Progress',
    successRate: 96.5,
    capacityLimit: 1000,
    totalStockHeld: 310,
    defectiveStockValue: 0,
    missingStockValue: 0
  },
  {
    id: 'agent-3',
    name: 'Samuel Dike Dispatch',
    phone: '+234 809 111 8899',
    primaryZone: 'FCT - Abuja (Wuse / Garki / Maitama / Gwarinpa)',
    secondaryZones: ['Kubwa', 'Lugbe'],
    status: 'Active on Duty',
    successRate: 91.8,
    capacityLimit: 1000,
    totalStockHeld: 190,
    defectiveStockValue: 18500,
    missingStockValue: 32000
  },
  {
    id: 'agent-4',
    name: 'Chinedu Eze Speed Deliveries',
    phone: '+234 814 333 2211',
    primaryZone: 'Rivers (Port Harcourt - GRA / Trans Amadi)',
    secondaryZones: ['Obio-Akpor', 'Rumuokoro'],
    status: 'Active on Duty',
    successRate: 89.4,
    capacityLimit: 1000,
    totalStockHeld: 140,
    defectiveStockValue: 0,
    missingStockValue: 0
  },
  {
    id: 'agent-5',
    name: 'Aliyu Sani North Express',
    phone: '+234 802 999 5544',
    primaryZone: 'Kano (Fagge / Nasarawa / Bompai)',
    secondaryZones: ['Kaduna Central'],
    status: 'Order in Progress',
    successRate: 88.0,
    capacityLimit: 1000,
    totalStockHeld: 115,
    defectiveStockValue: 0,
    missingStockValue: 0
  }
];

export const INITIAL_AGENT_STOCK: AgentStockItem[] = [
  { agentId: 'agent-1', productId: 'prod-1', unitsHeld: 110, defectiveUnits: 1, missingUnits: 0 },
  { agentId: 'agent-1', productId: 'prod-2', unitsHeld: 65, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-1', productId: 'prod-3', unitsHeld: 70, defectiveUnits: 0, missingUnits: 0 },

  { agentId: 'agent-2', productId: 'prod-1', unitsHeld: 140, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-2', productId: 'prod-2', unitsHeld: 95, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-2', productId: 'prod-3', unitsHeld: 75, defectiveUnits: 0, missingUnits: 0 },

  { agentId: 'agent-3', productId: 'prod-1', unitsHeld: 80, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-3', productId: 'prod-2', unitsHeld: 50, defectiveUnits: 0, missingUnits: 1 },
  { agentId: 'agent-3', productId: 'prod-3', unitsHeld: 60, defectiveUnits: 1, missingUnits: 0 },

  { agentId: 'agent-4', productId: 'prod-1', unitsHeld: 60, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-4', productId: 'prod-2', unitsHeld: 40, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-4', productId: 'prod-3', unitsHeld: 40, defectiveUnits: 0, missingUnits: 0 },

  { agentId: 'agent-5', productId: 'prod-1', unitsHeld: 50, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-5', productId: 'prod-2', unitsHeld: 35, defectiveUnits: 0, missingUnits: 0 },
  { agentId: 'agent-5', productId: 'prod-3', unitsHeld: 30, defectiveUnits: 0, missingUnits: 0 }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-10492',
    orderNumber: 'ORD-10492',
    customerName: 'Folake Adeleke',
    customerPhone: '+234 802 341 9988',
    customerWhatsApp: '+234 802 341 9988',
    customerEmail: 'folake.adeleke@gmail.com',
    deliveryAddress: 'Block 4, Flat 2, 1004 Housing Estate, Victoria Island',
    deliveryCity: 'Lagos Island',
    deliveryState: 'Lagos',
    items: [
      {
        productId: 'prod-1',
        productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
        quantity: 2,
        unitPrice: 42000,
        packageName: 'Double Treatment Bundle (Most Popular)',
        packageId: 'pkg-1-double'
      }
    ],
    totalAmount: 42000,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'facebook_ads',
    utmCampaign: 'clarifying_glow_sept26',
    utmCreative: 'before_after_video_v3',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chioma Adeyemi',
    agentId: 'agent-2',
    agentName: 'Kunle Ajayi Express',
    status: 'DELIVERED',
    responseTimeMinutes: 14,
    deliveredDate: '2026-09-25T14:30:00Z',
    fulfillmentDays: 1,
    createdAt: '2026-09-24T09:12:00Z',
    commitmentFeePaid: true
  },
  {
    id: 'ord-10493',
    orderNumber: 'ORD-10493',
    customerName: 'Engr. Kenneth Nwachukwu',
    customerPhone: '+234 813 902 4455',
    customerWhatsApp: '+234 813 902 4455',
    customerEmail: 'k.nwachukwu@shell.com',
    deliveryAddress: 'Plot 12, Trans Amadi Industrial Layout, Peter Odili Road',
    deliveryCity: 'Port Harcourt',
    deliveryState: 'Rivers (Port Harcourt)',
    items: [
      {
        productId: 'prod-2',
        productName: 'Titan Pro Smartwatch POD Edition',
        quantity: 2,
        unitPrice: 56000,
        packageName: 'Couples Dual Titan Pack (Save ₦8,000)',
        packageId: 'pkg-2-double'
      }
    ],
    totalAmount: 56000,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'tiktok_ads',
    utmCampaign: 'smartwatch_gadget_review',
    utmCreative: 'ugc_unboxing_clip_02',
    salesRepId: 'user-rep-2',
    salesRepName: 'Emeka Okafor',
    agentId: 'agent-4',
    agentName: 'Chinedu Eze Speed Deliveries',
    status: 'DISPATCHED',
    responseTimeMinutes: 8,
    createdAt: '2026-09-25T16:45:00Z'
  },
  {
    id: 'ord-10494',
    orderNumber: 'ORD-10494',
    customerName: 'Hajiya Aisha Bello',
    customerPhone: '+234 803 762 1109',
    customerWhatsApp: '+234 803 762 1109',
    deliveryAddress: '14 Lamido Crescent, Bompai Commercial Area',
    deliveryCity: 'Kano Central',
    deliveryState: 'Kano',
    items: [
      {
        productId: 'prod-1',
        productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
        quantity: 1,
        unitPrice: 24500,
        packageName: 'Single Complete Set (1-Month Treatment)',
        packageId: 'pkg-1-single'
      }
    ],
    totalAmount: 24500,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'instagram_reels',
    utmCampaign: 'hausa_skin_routine',
    salesRepId: 'user-rep-3',
    salesRepName: 'Fatima Dangote',
    agentId: 'agent-5',
    agentName: 'Aliyu Sani North Express',
    status: 'CONFIRMED',
    responseTimeMinutes: 19,
    scheduledDate: '2026-09-26',
    createdAt: '2026-09-25T18:20:00Z'
  },
  {
    id: 'ord-10495',
    orderNumber: 'ORD-10495',
    customerName: 'Dr. Obinna Okoye',
    customerPhone: '+234 805 120 7865',
    customerWhatsApp: '+234 805 120 7865',
    deliveryAddress: 'Suite 204, Millennium Plaza, Central Business District',
    deliveryCity: 'Abuja Central',
    deliveryState: 'FCT - Abuja',
    items: [
      {
        productId: 'prod-3',
        productName: 'AeroKnee Dual Spring Compression Sleeve',
        quantity: 2,
        unitPrice: 32000,
        packageName: '2 Pairs (Total 4 Sleeves) + Relief Herbal Balm',
        packageId: 'pkg-3-double'
      }
    ],
    totalAmount: 32000,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'facebook_ads',
    utmCampaign: 'knee_pain_elderly_relief',
    salesRepId: 'user-rep-2',
    salesRepName: 'Emeka Okafor',
    agentId: 'agent-3',
    agentName: 'Samuel Dike Dispatch',
    status: 'SCHEDULED',
    responseTimeMinutes: 11,
    scheduledDate: '2026-09-27',
    createdAt: '2026-09-26T02:10:00Z'
  },
  {
    id: 'ord-10496',
    orderNumber: 'ORD-10496',
    customerName: 'Bolanle Oladipo',
    customerPhone: '+234 818 349 0012',
    customerWhatsApp: '+234 818 349 0012',
    deliveryAddress: '23 Toyin Street, off Allen Avenue, Ikeja',
    deliveryCity: 'Ikeja',
    deliveryState: 'Lagos',
    items: [
      {
        productId: 'prod-1',
        productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
        quantity: 1,
        unitPrice: 24500,
        packageName: 'Single Complete Set (1-Month Treatment)',
        packageId: 'pkg-1-single'
      }
    ],
    totalAmount: 24500,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'facebook_ads',
    utmCampaign: 'clarifying_glow_sept26',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chioma Adeyemi',
    status: 'NEW',
    responseTimeMinutes: 4,
    createdAt: '2026-09-26T05:40:00Z'
  },
  {
    id: 'ord-10497',
    orderNumber: 'ORD-10497',
    customerName: 'Chiamaka Onyekwelu',
    customerPhone: '+234 806 887 9011',
    customerWhatsApp: '+234 806 887 9011',
    deliveryAddress: '15 Zik Avenue, near Roban Stores',
    deliveryCity: 'Enugu City',
    deliveryState: 'Enugu',
    items: [
      {
        productId: 'prod-3',
        productName: 'AeroKnee Dual Spring Compression Sleeve',
        quantity: 1,
        unitPrice: 18500,
        packageName: '1 Pair (Left + Right Sleeve)',
        packageId: 'pkg-3-single'
      }
    ],
    totalAmount: 18500,
    currency: 'NGN',
    source: 'Order Form',
    salesRepId: 'user-rep-4',
    salesRepName: 'Tunde Balogun',
    status: 'NOT_PICKING_CALLS',
    responseTimeMinutes: 45,
    createdAt: '2026-09-25T11:15:00Z'
  },
  {
    id: 'ord-10498',
    orderNumber: 'ORD-10498',
    customerName: 'Festus Oghenero',
    customerPhone: '+234 807 554 9922',
    deliveryAddress: 'Airport Road, Warri',
    deliveryCity: 'Warri',
    deliveryState: 'Delta (Warri/Asaba)',
    items: [
      {
        productId: 'prod-2',
        productName: 'Titan Pro Smartwatch POD Edition',
        quantity: 1,
        unitPrice: 32000,
        packageName: 'Titan Pro Smartwatch (1 Unit)',
        packageId: 'pkg-2-single'
      }
    ],
    totalAmount: 32000,
    currency: 'NGN',
    source: 'WooCommerce',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chioma Adeyemi',
    status: 'DELIVERED',
    deliveredDate: '2026-09-24T18:00:00Z',
    fulfillmentDays: 2,
    createdAt: '2026-09-22T10:30:00Z'
  }
];

export const INITIAL_ABANDONED_CARTS: AbandonedCart[] = [
  {
    id: 'cart-801',
    cartNumber: 'CART-801',
    customerName: 'Blessing Udoh',
    customerPhone: '+234 810 443 2190',
    customerWhatsApp: '+234 810 443 2190',
    customerEmail: 'blessing.u@yahoo.com',
    deliveryAddress: '24 Oron Road, opposite Stadium',
    deliveryCity: 'Uyo',
    deliveryState: 'Akwa Ibom (Uyo)',
    productId: 'prod-1',
    productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
    packageId: 'pkg-1-double',
    packageName: 'Double Treatment Bundle (Most Popular)',
    amount: 42000,
    currency: 'NGN',
    status: 'ASSIGNED',
    assignedRepId: 'user-rep-1',
    assignedRepName: 'Chioma Adeyemi',
    createdAt: '2026-09-26T04:15:00Z',
    lastActivity: '42 mins ago',
    utmSource: 'facebook_ads',
    utmCampaign: 'clarifying_glow_sept26'
  },
  {
    id: 'cart-802',
    cartNumber: 'CART-802',
    customerName: 'Alhaji Bashir Yusuf',
    customerPhone: '+234 802 889 0033',
    customerWhatsApp: '+234 802 889 0033',
    deliveryAddress: 'Ali Akilu Road, Kaduna North',
    deliveryCity: 'Kaduna',
    deliveryState: 'Kaduna',
    productId: 'prod-2',
    productName: 'Titan Pro Smartwatch POD Edition',
    packageId: 'pkg-2-single',
    packageName: 'Titan Pro Smartwatch (1 Unit)',
    amount: 32000,
    currency: 'NGN',
    status: 'CONTACTED',
    assignedRepId: 'user-rep-3',
    assignedRepName: 'Fatima Dangote',
    createdAt: '2026-09-25T21:30:00Z',
    lastActivity: '3 hours ago',
    notes: 'Customer asked if charger has 3-pin UK plug. Confirmed yes via WhatsApp.',
    utmSource: 'google_search'
  },
  {
    id: 'cart-803',
    cartNumber: 'CART-803',
    customerName: 'Mercy Idahosa',
    customerPhone: '+234 816 772 1049',
    deliveryCity: 'Benin City',
    deliveryState: 'Edo (Benin City)',
    productId: 'prod-3',
    productName: 'AeroKnee Dual Spring Compression Sleeve',
    packageId: 'pkg-3-double',
    packageName: '2 Pairs (Total 4 Sleeves) + Relief Herbal Balm',
    amount: 32000,
    currency: 'NGN',
    status: 'ABANDONED',
    createdAt: '2026-09-26T05:55:00Z',
    lastActivity: '12 mins ago'
  }
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    date: '2026-09-25 10:15',
    productId: 'prod-1',
    productName: 'Bella Glow Clarifying Set',
    type: 'Warehouse to Agent',
    fromLocation: 'Central Warehouse (Ikeja)',
    toLocation: 'Kunle Ajayi Express (Island)',
    quantity: 50,
    referenceOrderOrAgent: 'Restock Batch #992'
  },
  {
    id: 'mov-2',
    date: '2026-09-25 14:30',
    productId: 'prod-1',
    productName: 'Bella Glow Clarifying Set',
    type: 'Agent to Customer',
    fromLocation: 'Kunle Ajayi Express (Island)',
    toLocation: 'Folake Adeleke (1004 Estate)',
    quantity: 2,
    referenceOrderOrAgent: 'ORD-10492'
  },
  {
    id: 'mov-3',
    date: '2026-09-24 16:00',
    productId: 'prod-2',
    productName: 'Titan Pro Smartwatch',
    type: 'Warehouse to Agent',
    fromLocation: 'Central Warehouse (Ikeja)',
    toLocation: 'Samuel Dike Dispatch (Abuja)',
    quantity: 30,
    referenceOrderOrAgent: 'Waybill #ABJ-504'
  },
  {
    id: 'mov-4',
    date: '2026-09-23 11:20',
    productId: 'prod-3',
    productName: 'AeroKnee Compression Sleeve',
    type: 'Defective Return',
    fromLocation: 'Samuel Dike Dispatch (Abuja)',
    toLocation: 'Central Warehouse (Ikeja)',
    quantity: 1,
    referenceOrderOrAgent: 'Stitch tear in right spring pocket'
  }
];

export const INITIAL_SALES_TEAMS: SalesTeam[] = [
  {
    id: 'team-lagos',
    name: 'Lagos Tigers Sales Unit',
    teamLeadId: 'user-rep-1',
    teamLeadName: 'Chioma Adeyemi',
    repIds: ['user-rep-1', 'user-rep-4'],
    productLinks: ['prod-1', 'prod-2', 'prod-3'],
    mediaBuyerLinks: ['mb-1']
  },
  {
    id: 'team-abuja',
    name: 'FCT & South Central Reps',
    teamLeadId: 'user-rep-2',
    teamLeadName: 'Emeka Okafor',
    repIds: ['user-rep-2'],
    productLinks: ['prod-1', 'prod-2', 'prod-3'],
    mediaBuyerLinks: ['mb-2']
  },
  {
    id: 'team-north',
    name: 'Northern Territories Unit',
    teamLeadId: 'user-rep-3',
    teamLeadName: 'Fatima Dangote',
    repIds: ['user-rep-3'],
    productLinks: ['prod-1', 'prod-2'],
    mediaBuyerLinks: []
  }
];

export const INITIAL_ROUND_ROBIN: RoundRobinState = {
  orderPool: [
    { repId: 'user-rep-1', repName: 'Chioma Adeyemi', weight: 2, isAvailable: true, isIncluded: true, assignedOrderCount: 48 },
    { repId: 'user-rep-2', repName: 'Emeka Okafor', weight: 2, isAvailable: true, isIncluded: true, assignedOrderCount: 42 },
    { repId: 'user-rep-3', repName: 'Fatima Dangote', weight: 1, isAvailable: true, isIncluded: true, assignedOrderCount: 28 },
    { repId: 'user-rep-4', repName: 'Tunde Balogun', weight: 1, isAvailable: true, isIncluded: true, assignedOrderCount: 24 }
  ],
  cartPool: [
    { repId: 'user-rep-1', repName: 'Chioma Adeyemi', weight: 2, isAvailable: true, isIncluded: true, assignedOrderCount: 16 },
    { repId: 'user-rep-2', repName: 'Emeka Okafor', weight: 1, isAvailable: true, isIncluded: true, assignedOrderCount: 11 },
    { repId: 'user-rep-3', repName: 'Fatima Dangote', weight: 1, isAvailable: true, isIncluded: true, assignedOrderCount: 9 },
    { repId: 'user-rep-4', repName: 'Tunde Balogun', weight: 1, isAvailable: true, isIncluded: true, assignedOrderCount: 8 }
  ],
  nextRepIndexOrder: 0,
  nextRepIndexCart: 1,
  routeReturningCustomersToPreviousRep: true,
  assignOrdersToMeAdmin: false,
  assignCartsToMeAdmin: false
};

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-09-24',
    type: 'Meta / TikTok Ads',
    amount: 145000,
    currency: 'NGN',
    description: 'Meta Ads Mastercard billing for Bella Clarifying Sept campaign',
    reference: 'FB-ADS-INV-9901'
  },
  {
    id: 'exp-2',
    date: '2026-09-23',
    type: 'Agent Delivery Fees',
    amount: 48000,
    currency: 'NGN',
    description: 'Weekly delivery rider allowances & fuel for Lagos Mainland',
    reference: 'RIDER-LAG-WK38'
  },
  {
    id: 'exp-3',
    date: '2026-09-20',
    type: 'Freight / Customs',
    amount: 320000,
    currency: 'NGN',
    description: 'Air cargo clearing fee (500 units Titan Watches from Guangzhou)',
    productId: 'prod-2',
    productName: 'Titan Pro Smartwatch POD Edition',
    reference: 'AIR-WAYBILL-7761'
  },
  {
    id: 'exp-4',
    date: '2026-09-15',
    type: 'Software & Tools',
    amount: 15000,
    currency: 'NGN',
    description: 'BettaTraka Growth Plan Monthly Renewal',
    reference: 'BT-SUB-SEP26'
  }
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Folake Adeleke',
    phone: '+234 802 341 9988',
    whatsapp: '+234 802 341 9988',
    email: 'folake.adeleke@gmail.com',
    city: 'Lagos Island',
    state: 'Lagos',
    totalOrders: 3,
    successfulOrders: 3,
    cancelledOrders: 0,
    totalSpend: 112000,
    reliabilityScore: 100,
    source: 'Meta Ads',
    isBlocked: false,
    lastOrderDate: '2026-09-24'
  },
  {
    id: 'cust-2',
    name: 'Engr. Kenneth Nwachukwu',
    phone: '+234 813 902 4455',
    whatsapp: '+234 813 902 4455',
    city: 'Port Harcourt',
    state: 'Rivers',
    totalOrders: 2,
    successfulOrders: 1,
    cancelledOrders: 0,
    totalSpend: 56000,
    reliabilityScore: 92,
    source: 'TikTok Ads',
    isBlocked: false,
    lastOrderDate: '2026-09-25'
  },
  {
    id: 'cust-3',
    name: 'Chiamaka Onyekwelu',
    phone: '+234 806 887 9011',
    city: 'Enugu City',
    state: 'Enugu',
    totalOrders: 2,
    successfulOrders: 0,
    cancelledOrders: 2,
    totalSpend: 0,
    reliabilityScore: 25,
    source: 'Google Ads',
    isBlocked: false,
    lastOrderDate: '2026-09-25'
  },
  {
    id: 'cust-4',
    name: 'Tariq Al-Mansoor',
    phone: '+234 803 000 9999',
    city: 'Garki',
    state: 'FCT - Abuja',
    totalOrders: 1,
    successfulOrders: 0,
    cancelledOrders: 1,
    totalSpend: 0,
    reliabilityScore: 10,
    source: 'WhatsApp',
    isBlocked: true,
    lastOrderDate: '2026-08-11'
  }
];

export const INITIAL_MEDIA_BUYERS: MediaBuyer[] = [
  {
    id: 'mb-1',
    name: 'Kayode Daniels (Growth Lead)',
    email: 'kayode.ads@growthpilot.ng',
    budgetMonthly: 1200000,
    blendedCpa: 2850,
    activeCampaigns: ['clarifying_glow_sept26', 'skincare_retargeting_v2'],
    teamId: 'team-lagos'
  },
  {
    id: 'mb-2',
    name: 'Blessing Amadi Media',
    email: 'blessing@amplifimedia.co',
    budgetMonthly: 850000,
    blendedCpa: 3100,
    activeCampaigns: ['smartwatch_gadget_review', 'knee_pain_elderly_relief'],
    teamId: 'team-abuja'
  }
];

export const INITIAL_REMITTANCES: Remittance[] = [
  {
    id: 'remit-1',
    orderId: 'ord-10492',
    orderNumber: 'ORD-10492',
    agentId: 'agent-2',
    agentName: 'Kunle Ajayi Express',
    agentZone: 'Lagos Island',
    customerName: 'Folake Adeleke',
    customerPhone: '+234 802 341 9988',
    productSummary: '2x Bella Glow Set Bundle',
    amountToRemit: 39500, // ₦42,000 collected - ₦2,500 agent dispatch cut
    currency: 'NGN',
    deliveredDate: '2026-09-25',
    status: 'Pending'
  },
  {
    id: 'remit-2',
    orderId: 'ord-10498',
    orderNumber: 'ORD-10498',
    agentId: 'agent-1',
    agentName: 'Musa Ibrahim Logistics',
    agentZone: 'Lagos Mainland',
    customerName: 'Festus Oghenero',
    customerPhone: '+234 807 554 9922',
    productSummary: '1x Titan Pro Smartwatch',
    amountToRemit: 29500, // ₦32,000 - ₦2,500 agent cut
    currency: 'NGN',
    deliveredDate: '2026-09-24',
    status: 'Remitted',
    remittedAt: '2026-09-25 11:30'
  }
];

export const INITIAL_AI_LOGS: AICallLog[] = [
  {
    id: 'ai-1',
    orderNumber: 'ORD-10494',
    customerName: 'Hajiya Aisha Bello',
    customerPhone: '+234 803 762 1109',
    productName: 'Bella Glow Herbal Clarifying Set',
    attempts: 1,
    maxAttempts: 5,
    cycle: 1,
    outcome: 'ANSWERED',
    durationSeconds: 84,
    orderStatus: 'CONFIRMED',
    date: '2026-09-25 18:25',
    transcriptSnippet: "AI: Good evening Hajiya Aisha. Calling from Bella Skin regarding your order #10494 for delivery to Kano. Are you available tomorrow? Customer: Yes, please send it to Bompai road before 2pm."
  },
  {
    id: 'ai-2',
    orderNumber: 'ORD-10497',
    customerName: 'Chiamaka Onyekwelu',
    customerPhone: '+234 806 887 9011',
    productName: 'AeroKnee Compression Sleeve',
    attempts: 3,
    maxAttempts: 5,
    cycle: 1,
    outcome: 'NO_ANSWER',
    durationSeconds: 26,
    nextCallTime: 'Today at 14:00',
    orderStatus: 'NOT_PICKING_CALLS',
    date: '2026-09-25 12:10',
    transcriptSnippet: "Call rang for 25 seconds with no answer. Retry scheduled for Cycle 1 Attempt 4."
  }
];

export const INITIAL_TOKEN_LEDGER: TokenTransaction[] = [
  {
    id: 'tok-1',
    date: '2026-09-25 09:00',
    type: 'Purchase',
    tokensChanged: 500,
    tokenBalanceAfter: 524,
    description: 'Purchased Pro Token Pack (₦75,000 via Paystack)'
  },
  {
    id: 'tok-2',
    date: '2026-09-25 18:25',
    type: 'AI Call Used',
    tokensChanged: -2,
    tokenBalanceAfter: 522,
    description: 'Vapi Voice Confirmation Call: ORD-10494 (1m 24s)'
  },
  {
    id: 'tok-3',
    date: '2026-09-25 18:30',
    type: 'SMS Sent',
    tokensChanged: -1,
    tokenBalanceAfter: 521,
    description: 'Automated Dispatch SMS to Customer (ORD-10494)'
  }
];

export const INITIAL_REFERRALS: ReferralRecord[] = [
  {
    id: 'ref-1',
    businessName: 'Zion Naturals E-Shop',
    ownerName: 'Pastor David Adebayo',
    signedUpDate: '2026-08-15',
    plan: 'Growth',
    earnedAmount: 7500,
    status: 'Available'
  },
  {
    id: 'ref-2',
    businessName: 'Kiddies World Abuja',
    ownerName: 'Amina Sani',
    signedUpDate: '2026-09-02',
    plan: 'Business',
    earnedAmount: 12500,
    status: 'On Hold (30 days)'
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    userId: 'user-admin',
    userName: 'Emmanuel Oamen (Owner)',
    userRole: 'Owner',
    content: 'Good morning team! We hit ₦2.4M in delivered cash-on-delivery orders yesterday. Great job Chioma and Emeka on dispatch follow-ups.',
    timestamp: 'Yesterday 08:30'
  },
  {
    id: 'msg-2',
    userId: 'user-rep-1',
    userName: 'Chioma Adeyemi',
    userRole: 'Sales Representative',
    content: '@Babajide Cole please check Island agent stock for Bella Glow sets. Kunle Ajayi says he only has 30 sets left for Lekki deliveries.',
    timestamp: 'Yesterday 10:15',
    mentions: ['Babajide Cole']
  },
  {
    id: 'msg-3',
    userId: 'user-inv-mgr',
    userName: 'Babajide Cole',
    userRole: 'Inventory Manager',
    content: 'Waybill of 50 units already arrived at Kunle\'s hub this morning. Stock reconciled on system.',
    timestamp: 'Yesterday 11:00'
  },
  {
    id: 'msg-4',
    userId: 'user-rep-2',
    userName: 'Emeka Okafor',
    userRole: 'Sales Representative',
    content: 'Abuja customers loving the Titan Pro smartwatch. 100% confirmation rate on today\'s morning pipeline!',
    timestamp: 'Today 06:10'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Order Form Submission #ORD-10496',
    message: 'Bolanle Oladipo placed an order for Bella Glow 4-Piece Set (₦24,500). Assigned to Chioma Adeyemi.',
    timestamp: '25 mins ago',
    type: 'order_received',
    isRead: false,
    linkTab: 'orders'
  },
  {
    id: 'notif-2',
    title: 'Delivery Completed #ORD-10492',
    message: 'Kunle Ajayi confirmed delivery and collected ₦42,000 cash in Victoria Island.',
    timestamp: 'Yesterday 14:30',
    type: 'delivery_completed',
    isRead: false,
    linkTab: 'deliveries'
  },
  {
    id: 'notif-3',
    title: 'Low Stock Alert (Kano Hub)',
    message: 'Titan Pro Smartwatch stock in Kano is below 35 units. Restock suggested.',
    timestamp: 'Yesterday 17:00',
    type: 'low_stock',
    isRead: true,
    linkTab: 'inventory'
  }
];

export const DEFAULT_FORM_CONFIG: EmbedFormConfig = {
  productId: 'prod-1',
  stateInputType: 'dropdown',
  packagePosition: 'before_questions',
  showEmailField: true,
  isEmailRequired: false,
  showWhatsAppField: true,
  isWhatsAppRequired: true,
  isAddressRequired: true,
  isCityRequired: true,
  showPackageName: true,
  showDeliveryWindowQuestion: true,
  requireConfirmationCheckbox: true,
  showCommitmentFeeNotice: true,
  commitmentFeeAmount: 2000,
  buttonText: 'CONFIRM MY ORDER (PAY ON DELIVERY)',
  buttonColor: '#2563eb', // Professional Royal Blue
  borderThickness: 'medium',
  placeholderDarkness: 'medium',
  enableRedirect: true,
  redirectUrl: 'https://example.com/thank-you',
  redirectDelaySeconds: 3,
  additionalQuestions: [
    {
      id: 'q-1',
      question: 'What is your primary skin concern?',
      type: 'select',
      options: ['Dark spots & Hyper-pigmentation', 'Acne & Breakouts', 'Sunburn & Uneven tone', 'Anti-aging & Dullness'],
      required: true
    }
  ],
  orderBumps: [
    {
      id: 'bump-1',
      name: 'Add Express VIP Priority Dispatch (Guaranteed Next Day Delivery)',
      price: 2000,
      description: 'Your package is bumped to the top of rider dispatch queue.'
    },
    {
      id: 'bump-2',
      name: 'Add 100ml Pure Organic Rose Water Hydrating Mist',
      price: 3500,
      description: 'Special 50% discount when added with your order today.'
    }
  ]
};

export const INITIAL_ORDER_FORMS: OrderFormRecord[] = [
  {
    id: 'form-1',
    title: 'Bella Glow — TikTok & Meta Viral Checkout',
    slug: 'bella-glow-herbal',
    productId: 'prod-1',
    status: 'Active',
    viewsCount: 3840,
    ordersCount: 342,
    conversionRate: 8.9,
    createdAt: '2026-08-10',
    config: {
      ...DEFAULT_FORM_CONFIG,
      productId: 'prod-1',
      formTitle: 'Bella Glow Herbal Clarifying 4-Piece Set'
    }
  },
  {
    id: 'form-2',
    title: 'Titan Pro Smartwatch — Official Nigeria Store',
    slug: 'titan-pro-smartwatch',
    productId: 'prod-2',
    status: 'Active',
    viewsCount: 2950,
    ordersCount: 228,
    conversionRate: 7.7,
    createdAt: '2026-08-22',
    config: {
      productId: 'prod-2',
      formTitle: 'Titan Pro Smartwatch POD Edition',
      stateInputType: 'dropdown',
      packagePosition: 'before_questions',
      showEmailField: true,
      isEmailRequired: false,
      showWhatsAppField: true,
      isWhatsAppRequired: true,
      isAddressRequired: true,
      isCityRequired: true,
      showPackageName: true,
      showDeliveryWindowQuestion: true,
      requireConfirmationCheckbox: true,
      showCommitmentFeeNotice: true,
      commitmentFeeAmount: 2000,
      buttonText: 'ORDER TITAN PRO NOW (PAY ON DELIVERY)',
      buttonColor: '#0284c7', // Sky / Tech blue
      borderThickness: 'medium',
      placeholderDarkness: 'medium',
      additionalQuestions: [
        {
          id: 'q-watch-1',
          question: 'What is your preferred wrist strap style?',
          type: 'select',
          options: ['Sport Black Silicone', 'Luxury Stainless Steel Mesh', 'Leather Textured'],
          required: false
        }
      ],
      orderBumps: [
        {
          id: 'bump-watch-1',
          name: 'Add 9H Tempered Glass Screen Shield (Pack of 2)',
          price: 2500,
          description: 'Anti-scratch & impact protection tailored for Titan Pro AMOLED.'
        },
        {
          id: 'bump-watch-2',
          name: 'Add Extra Magnetic Fast-Charging Cable',
          price: 3000,
          description: 'Keep an extra charger in your car or office.'
        }
      ]
    }
  },
  {
    id: 'form-3',
    title: 'AeroKnee Support Sleeve — Direct Health Checkout',
    slug: 'aeroknee-compression-sleeve',
    productId: 'prod-3',
    status: 'Active',
    viewsCount: 1980,
    ordersCount: 164,
    conversionRate: 8.3,
    createdAt: '2026-09-01',
    config: {
      productId: 'prod-3',
      formTitle: 'AeroKnee Dual Spring Compression Sleeve',
      stateInputType: 'dropdown',
      packagePosition: 'before_questions',
      showEmailField: false,
      isEmailRequired: false,
      showWhatsAppField: true,
      isWhatsAppRequired: true,
      isAddressRequired: true,
      isCityRequired: true,
      showPackageName: true,
      showDeliveryWindowQuestion: true,
      requireConfirmationCheckbox: true,
      showCommitmentFeeNotice: true,
      commitmentFeeAmount: 1500,
      buttonText: 'YES! DELIVER MY AEROKNEE PAIR (PAY ON DELIVERY)',
      buttonColor: '#16a34a', // Emerald Green
      borderThickness: 'medium',
      placeholderDarkness: 'medium',
      additionalQuestions: [
        {
          id: 'q-knee-1',
          question: 'What is your approximate leg size?',
          type: 'select',
          options: ['Standard (Fits 50kg - 85kg)', 'XL / Plus (Fits 86kg - 130kg)'],
          required: true
        }
      ],
      orderBumps: [
        {
          id: 'bump-knee-1',
          name: 'Add 1x Herbal Joint Deep Heat Warming Cream (100g)',
          price: 3500,
          description: 'Instant topical comfort for aching knees and stiffness.'
        }
      ]
    }
  }
];

