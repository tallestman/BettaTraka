import { 
  Product, 
  User, 
  DeliveryAgent, 
  AgentStockItem, 
  DistributorStockItem,
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
  name: 'Betta Herbals Limited',
  businessName: 'Betta Herbals Limited',
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
  sendReturningCustomersToPreviousRep: false,
  assignOrdersToMe: false,
  assignAbandonedCartsToMe: false,
  salesRepV2Preview: false,
  adminV2Preview: false,
  pushNotificationsEnabled: false,
  themeMode: 'dark'
};

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Desmond Ufuoma Okosi',
    email: 'ifuoma.pay@gmail.com',
    phone: '+234 803 111 2233',
    role: 'Owner',
    status: 'Active',
    createdAt: '2026-01-10',
    payStructure: 'Not set'
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
  },
  {
    id: 'user-distributor-1',
    name: 'Alhaji Haruna Bello',
    email: 'haruna.distributor@bettaherbals.ng',
    phone: '+234 803 777 6655',
    role: 'Distributor',
    status: 'Active',
    createdAt: '2026-03-12',
    teamId: 'team-north',
    payStructure: 'Commission',
    commissionPerOrder: 2500,
    bankName: 'Jaiz Bank PLC',
    accountNumber: '0019283741',
    accountName: 'Haruna Bello Distribution Ent'
  },
  {
    id: 'user-distributor-2',
    name: 'Chief Obinna Okonkwo',
    email: 'obinna.distributor@bettaherbals.ng',
    phone: '+234 802 888 9911',
    role: 'Distributor',
    status: 'Active',
    createdAt: '2026-03-20',
    teamId: 'team-east',
    payStructure: 'Commission',
    commissionPerOrder: 2500,
    bankName: 'Access Bank PLC',
    accountNumber: '0712398450',
    accountName: 'Okonkwo Eastern Logistics'
  },
  {
    id: 'user-media-buyer-1',
    name: 'Kayode Daniels',
    email: 'kayode.ads@growthpilot.ng',
    phone: '+234 802 881 9922',
    role: 'Media Buyer',
    status: 'Active',
    createdAt: '2026-03-10',
    payStructure: 'Performance-based',
    fixedSalary: 150000
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
    reorderThreshold: 200,
    reorderQuantity: 500,
    leadTimeDays: 14,
    supplierName: 'Guangzhou Biotech OEM',
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
    reorderThreshold: 300,
    reorderQuantity: 400,
    leadTimeDays: 12,
    supplierName: 'Shenzhen Titan Tech',
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

export const INITIAL_DISTRIBUTOR_STOCK: DistributorStockItem[] = [
  {
    id: 'dstock-1',
    distributorId: 'user-distributor-1',
    distributorName: 'Alhaji Haruna Bello',
    productId: 'prod-1',
    productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
    unitsHeld: 150,
    allocatedDate: '2026-09-15',
    lastRestockedDate: '2026-09-25',
    notes: 'Kano & Northern regional hub stock batch 1'
  },
  {
    id: 'dstock-2',
    distributorId: 'user-distributor-1',
    distributorName: 'Alhaji Haruna Bello',
    productId: 'prod-2',
    productName: 'Pure Organic Sea Moss Superfood Gel (500ml)',
    unitsHeld: 90,
    allocatedDate: '2026-09-18',
    lastRestockedDate: '2026-09-28',
    notes: 'Cold chain refrigerated delivery'
  },
  {
    id: 'dstock-3',
    distributorId: 'user-distributor-1',
    distributorName: 'Alhaji Haruna Bello',
    productId: 'prod-3',
    productName: 'Herbal Waist Sculpt Detox Tea & Tummy Tightener',
    unitsHeld: 120,
    allocatedDate: '2026-09-20',
    notes: 'Fast moving item in Northern corridor'
  },
  {
    id: 'dstock-4',
    distributorId: 'user-distributor-2',
    distributorName: 'Chief Obinna Okonkwo',
    productId: 'prod-1',
    productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
    unitsHeld: 110,
    allocatedDate: '2026-09-16',
    notes: 'Onitsha & Aba wholesale warehouse'
  },
  {
    id: 'dstock-5',
    distributorId: 'user-distributor-2',
    distributorName: 'Chief Obinna Okonkwo',
    productId: 'prod-2',
    productName: 'Pure Organic Sea Moss Superfood Gel (500ml)',
    unitsHeld: 80,
    allocatedDate: '2026-09-19',
    notes: 'Eastern regional distribution'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1025',
    orderNumber: '#1025',
    customerName: 'Ibrahim Balogun',
    customerPhone: '+2348087804774',
    customerWhatsApp: '+2348087804774',
    customerEmail: 'ibrahim.balogun@gmail.com',
    deliveryAddress: '30 Aba Road',
    deliveryCity: 'Obio-Akpor',
    deliveryState: 'Rivers',
    items: [
      {
        productId: 'prod-detox',
        productName: 'Liver Detox Capsules',
        quantity: 3,
        unitPrice: 24500
      },
      {
        productId: 'prod-glasses',
        productName: 'Blue Light Glasses',
        quantity: 3,
        unitPrice: 12500
      }
    ],
    totalAmount: 111000,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'tiktok',
    utmCampaign: 'tiktok_creators',
    utmMedium: 'video',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chidi Okeke',
    agentId: '',
    agentName: '',
    status: 'CONFIRMED',
    createdAt: '2026-08-07T15:46:00Z',
    scheduledDate: '2026-10-01',
    preferredDeliveryTime: 'morning'
  },
  {
    id: 'ord-1052',
    orderNumber: '#1052',
    customerName: 'Yusuf Balogun',
    customerPhone: '+2348099598836',
    customerWhatsApp: '+2348099598836',
    customerEmail: 'yusuf.balogun@yahoo.com',
    deliveryAddress: '14 Nnebisi Road, Asaba',
    deliveryCity: 'Asaba',
    deliveryState: 'Delta',
    items: [
      {
        productId: 'prod-tea',
        productName: '30-Day Slimming Tea',
        quantity: 2,
        unitPrice: 22000
      },
      {
        productId: 'prod-detox',
        productName: 'Liver Detox Capsules',
        quantity: 1,
        unitPrice: 24500
      }
    ],
    totalAmount: 68500,
    currency: 'NGN',
    source: 'TikTok',
    utmSource: 'tiktok',
    utmCampaign: 'slimming_tea_launch',
    utmMedium: 'video',
    salesRepId: 'user-rep-2',
    salesRepName: 'Tola Bakare',
    agentId: 'agent-4',
    agentName: 'GardenCity Riders (PH)',
    status: 'DISPATCHED',
    createdAt: '2026-08-08T11:20:00Z',
    scheduledDate: '2026-10-01',
    preferredDeliveryTime: 'afternoon'
  },
  {
    id: 'ord-1045',
    orderNumber: '#1045',
    customerName: 'Folake Bello',
    customerPhone: '+2348014879211',
    customerWhatsApp: '+2348014879211',
    customerEmail: 'folake.bello@gmail.com',
    deliveryAddress: 'Block B4, Royal Palm Estate, Ajah',
    deliveryCity: 'Ajah',
    deliveryState: 'Lagos',
    items: [
      {
        productId: 'prod-hairoil',
        productName: 'Organic Hair Growth Oil',
        quantity: 3,
        unitPrice: 18500
      }
    ],
    totalAmount: 55500,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'instagram',
    utmCampaign: 'hair_growth_promo',
    utmMedium: 'reel',
    salesRepId: 'user-rep-2',
    salesRepName: 'Tola Bakare',
    agentId: '',
    agentName: '',
    status: 'CONFIRMED',
    createdAt: '2026-08-10T09:15:00Z',
    scheduledDate: '2026-10-01',
    preferredDeliveryTime: 'morning'
  },
  {
    id: 'ord-1021',
    orderNumber: '#1021',
    customerName: 'Halima Balogun',
    customerPhone: '+2348021323941',
    customerWhatsApp: '+2348021323941',
    customerEmail: 'halima.balogun@outlook.com',
    deliveryAddress: '22 Bompai Road, Nassarawa GRA',
    deliveryCity: 'Nassarawa',
    deliveryState: 'Kano',
    items: [
      {
        productId: 'prod-trainer',
        productName: 'Adjustable Waist Trainer',
        quantity: 1,
        unitPrice: 15000
      }
    ],
    totalAmount: 15000,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'facebook',
    utmCampaign: 'fitness_waist_trainer',
    utmMedium: 'cpc',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chidi Okeke',
    agentId: '',
    agentName: '',
    status: 'CONFIRMED',
    createdAt: '2026-08-11T14:02:00Z',
    scheduledDate: '2026-10-01',
    preferredDeliveryTime: 'evening'
  },
  {
    id: 'ord-1060',
    orderNumber: '#1060',
    customerName: 'Emeka Nwosu',
    customerPhone: '+2348033221144',
    customerWhatsApp: '+2348033221144',
    customerEmail: 'emeka.nwosu@gmail.com',
    deliveryAddress: '18 Allen Avenue, Ikeja',
    deliveryCity: 'Ikeja',
    deliveryState: 'Lagos',
    items: [
      {
        productId: 'prod-1',
        productName: 'Bella Glow Clarifying Set',
        quantity: 2,
        unitPrice: 42000
      }
    ],
    totalAmount: 84000,
    currency: 'NGN',
    source: 'Order Form',
    utmSource: 'facebook',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chioma Adeyemi',
    agentId: 'agent-2',
    agentName: 'Kunle Ajayi Express',
    status: 'CONFIRMED',
    createdAt: '2026-08-12T10:15:00Z',
    scheduledDate: '2026-10-02',
    preferredDeliveryTime: 'morning'
  },
  {
    id: 'ord-1068',
    orderNumber: '#1068',
    customerName: 'Amina Dambatta',
    customerPhone: '+2348091122334',
    customerWhatsApp: '+2348091122334',
    customerEmail: 'amina.d@yahoo.com',
    deliveryAddress: '44 France Road, Sabon Gari',
    deliveryCity: 'Fagge',
    deliveryState: 'Kano',
    items: [
      {
        productId: 'prod-2',
        productName: 'Titan Pro Smartwatch',
        quantity: 1,
        unitPrice: 35000
      }
    ],
    totalAmount: 35000,
    currency: 'NGN',
    source: 'TikTok',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chidi Okeke',
    agentId: '',
    agentName: '',
    status: 'CONFIRMED',
    createdAt: '2026-08-13T16:20:00Z',
    scheduledDate: '2026-10-02',
    preferredDeliveryTime: 'afternoon'
  },
  {
    id: 'ord-1075',
    orderNumber: '#1075',
    customerName: 'Babatunde Adeleke',
    customerPhone: '+2348077665544',
    customerWhatsApp: '+2348077665544',
    customerEmail: 'babatunde.a@gmail.com',
    deliveryAddress: 'Plot 5, Ring Road, Challenge',
    deliveryCity: 'Ibadan',
    deliveryState: 'Oyo',
    items: [
      {
        productId: 'prod-detox',
        productName: 'Liver Detox Capsules',
        quantity: 2,
        unitPrice: 24500
      },
      {
        productId: 'prod-hairoil',
        productName: 'Organic Hair Growth Oil',
        quantity: 1,
        unitPrice: 18500
      }
    ],
    totalAmount: 67500,
    currency: 'NGN',
    source: 'Order Form',
    salesRepId: 'user-rep-2',
    salesRepName: 'Tola Bakare',
    agentId: '',
    agentName: '',
    status: 'SCHEDULED',
    createdAt: '2026-08-14T11:00:00Z',
    scheduledDate: '2026-10-03',
    preferredDeliveryTime: 'morning'
  },
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
    distributorId: 'user-distributor-1',
    distributorName: 'Alhaji Haruna Bello',
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
  },
  {
    id: 'ord-10499',
    orderNumber: 'ORD-10499',
    customerName: 'Mrs. Kemi Johnson',
    customerPhone: '+234 803 112 3344',
    deliveryAddress: 'Block 4, Admiralty Way, Lekki Phase 1',
    deliveryCity: 'Lagos',
    deliveryState: 'Lagos',
    items: [
      {
        productId: 'prod-1',
        productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
        quantity: 1,
        unitPrice: 24500,
        packageName: 'Single Complete Set',
        packageId: 'pkg-1-single'
      }
    ],
    totalAmount: 24500,
    currency: 'NGN',
    source: 'Order Form',
    salesRepId: 'user-rep-1',
    salesRepName: 'Chioma Adeyemi',
    agentId: 'agent-1',
    agentName: 'Musa Garba Express (Lagos Mainland)',
    status: 'DELIVERED',
    deliveredDate: '2026-09-27T14:20:00Z',
    fulfillmentDays: 1,
    createdAt: '2026-09-27T08:30:00Z'
  },
  {
    id: 'ord-10500',
    orderNumber: 'ORD-10500',
    customerName: 'Captain Ibrahim Bello',
    customerPhone: '+234 809 445 6677',
    deliveryAddress: 'Wuse 2, Near Banex Plaza',
    deliveryCity: 'Abuja',
    deliveryState: 'FCT (Abuja)',
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
    source: 'Order Form',
    salesRepId: 'user-rep-2',
    salesRepName: 'Emeka Okafor',
    agentId: 'agent-4',
    agentName: 'Chinedu Eze Speed Deliveries',
    status: 'DELIVERED',
    deliveredDate: '2026-09-27T15:10:00Z',
    fulfillmentDays: 1,
    createdAt: '2026-09-27T09:45:00Z'
  },
  {
    id: 'ord-10501',
    orderNumber: 'ORD-10501',
    customerName: 'Hajiya Zainab Danladi',
    customerPhone: '+234 814 332 9900',
    deliveryAddress: 'No. 8 Bompai Road, Fagge',
    deliveryCity: 'Kano',
    deliveryState: 'Kano',
    items: [
      {
        productId: 'prod-3',
        productName: 'AeroKnee Dual Spring Compression Sleeve',
        quantity: 2,
        unitPrice: 32000,
        packageName: '2 Pairs Pack',
        packageId: 'pkg-3-double'
      }
    ],
    totalAmount: 32000,
    currency: 'NGN',
    source: 'TikTok',
    salesRepId: 'user-rep-3',
    salesRepName: 'Fatima Dangote',
    agentId: 'agent-3',
    agentName: 'Samuel Dike Dispatch (Abuja/North)',
    status: 'DELIVERED',
    deliveredDate: '2026-09-27T16:00:00Z',
    fulfillmentDays: 1,
    createdAt: '2026-09-27T11:20:00Z'
  },
  {
    id: 'ord-10502',
    orderNumber: 'ORD-10502',
    customerName: 'Dr. Obinna Okeke',
    customerPhone: '+234 802 771 8833',
    deliveryAddress: 'Victoria Island, Bishop Oluwole St',
    deliveryCity: 'Lagos',
    deliveryState: 'Lagos',
    items: [
      {
        productId: 'prod-1',
        productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
        quantity: 2,
        unitPrice: 42000,
        packageName: 'Double Treatment Bundle',
        packageId: 'pkg-1-double'
      }
    ],
    totalAmount: 42000,
    currency: 'NGN',
    source: 'Order Form',
    salesRepId: 'user-rep-4',
    salesRepName: 'Tunde Balogun',
    agentId: 'agent-2',
    agentName: 'Kunle Ajayi Express',
    status: 'DELIVERED',
    deliveredDate: '2026-09-27T16:40:00Z',
    fulfillmentDays: 1,
    createdAt: '2026-09-27T10:15:00Z'
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
  },
  {
    id: 'cart-804',
    cartNumber: 'CART-804',
    customerName: 'Engr. Kenneth Obi',
    customerPhone: '+234 803 765 4321',
    customerWhatsApp: '+234 803 765 4321',
    customerEmail: 'k.obi@gmail.com',
    deliveryAddress: '14 Bode Thomas Street, Surulere',
    deliveryCity: 'Lagos',
    deliveryState: 'Lagos (Mainland)',
    productId: 'prod-2',
    productName: 'Titan Pro Smartwatch POD Edition',
    packageId: 'pkg-2-double',
    packageName: 'Titan Pro Smartwatch + Extra Silicon Strap',
    amount: 38500,
    currency: 'NGN',
    status: 'ASSIGNED',
    assignedRepId: 'user-rep-1',
    assignedRepName: 'Chioma Adeyemi',
    createdAt: '2026-09-26T06:10:00Z',
    lastActivity: '25 mins ago',
    notes: 'Left cart at address field. High purchasing intent.',
    utmSource: 'facebook_ads',
    utmCampaign: 'titan_smartwatch_sept'
  },
  {
    id: 'cart-805',
    cartNumber: 'CART-805',
    customerName: 'Hauwa Suleiman',
    customerPhone: '+234 805 112 9988',
    customerWhatsApp: '+234 805 112 9988',
    customerEmail: 'hauwa.s@yahoo.com',
    deliveryAddress: 'Plot 412 Aminu Kano Crescent, Wuse 2',
    deliveryCity: 'Abuja',
    deliveryState: 'FCT - Abuja',
    productId: 'prod-1',
    productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
    packageId: 'pkg-1-single',
    packageName: 'Complete Clarifying 4-Piece Set',
    amount: 24500,
    currency: 'NGN',
    status: 'CONTACTED',
    assignedRepId: 'user-rep-1',
    assignedRepName: 'Chioma Adeyemi',
    createdAt: '2026-09-26T07:20:00Z',
    lastActivity: '45 mins ago',
    notes: 'Customer asked about doorstep payment. Sent WhatsApp voice note reassuring COD delivery.',
    utmSource: 'tiktok_ads',
    utmCampaign: 'skincare_flawless_ugc'
  },
  {
    id: 'cart-806',
    cartNumber: 'CART-806',
    customerName: 'Pastor David Adekunle',
    customerPhone: '+234 818 909 2345',
    customerWhatsApp: '+234 818 909 2345',
    customerEmail: 'pastordavid@church.org',
    deliveryAddress: 'Bodija Estate, near Housing Roundabout',
    deliveryCity: 'Ibadan',
    deliveryState: 'Oyo (Ibadan)',
    productId: 'prod-3',
    productName: 'AeroKnee Dual Spring Compression Sleeve',
    packageId: 'pkg-3-single',
    packageName: '1 Pair (2 Sleeves) + Relief Herbal Balm',
    amount: 22000,
    currency: 'NGN',
    status: 'CONVERTED',
    assignedRepId: 'user-rep-1',
    assignedRepName: 'Chioma Adeyemi',
    createdAt: '2026-09-26T08:00:00Z',
    lastActivity: '1 hour ago',
    notes: 'Successfully recovered! Customer confirmed delivery to Ibadan hub.',
    utmSource: 'google_search'
  },
  {
    id: 'cart-807',
    cartNumber: 'CART-807',
    customerName: 'Funke Akindele-Bello',
    customerPhone: '+234 802 334 5566',
    customerWhatsApp: '+234 802 334 5566',
    customerEmail: 'funke.bello@gmail.com',
    deliveryAddress: 'Isaac John Street, GRA',
    deliveryCity: 'Ikeja',
    deliveryState: 'Lagos (Mainland)',
    productId: 'prod-1',
    productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
    packageId: 'pkg-1-double',
    packageName: 'Double Treatment Bundle (Most Popular)',
    amount: 42000,
    currency: 'NGN',
    status: 'ABANDONED',
    createdAt: '2026-09-26T08:45:00Z',
    lastActivity: '18 mins ago',
    notes: 'Abandoned at checkout. Ready to be claimed by rep.',
    utmSource: 'instagram_influencer'
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
    id: 'exp-today-1',
    date: '2026-09-28',
    type: 'Advertising / Media Buying',
    amount: 35000,
    currency: 'NGN',
    description: 'Meta Ads Mastercard daily budget for Bella Glow & Titan Watch',
    productId: 'prod-1',
    productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
    reference: 'FB-ADS-SEP28'
  },
  {
    id: 'exp-today-2',
    date: '2026-09-28',
    type: 'Agent Delivery Fees',
    amount: 18000,
    currency: 'NGN',
    description: 'Daily doorstep rider dispatch allowances & bike fuel (Lagos & Abuja)',
    reference: 'RIDER-DISPATCH-928'
  },
  {
    id: 'exp-1',
    date: '2026-09-24',
    type: 'Advertising / Media Buying',
    amount: 145000,
    currency: 'NGN',
    description: 'Meta Ads Mastercard billing for Bella Clarifying Sept campaign',
    productId: 'prod-1',
    productName: 'Bella Glow Herbal Clarifying 4-Piece Set',
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
    type: 'Logistics',
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
  },
  {
    id: 'exp-5',
    date: '2026-09-10',
    type: 'Product Manufacturing',
    amount: 210000,
    currency: 'NGN',
    description: 'Local packaging boxes & customized tamper-evident POD tape',
    productId: 'prod-3',
    productName: 'AeroKnee Dual Spring Compression Sleeve',
    reference: 'PKG-BATCH-402'
  },
  {
    id: 'exp-6',
    date: '2026-08-25',
    type: 'Advertising / Media Buying',
    amount: 180000,
    currency: 'NGN',
    description: 'TikTok Ads Agency Top-up August Scale Campaign',
    productId: 'prod-2',
    productName: 'Titan Pro Smartwatch POD Edition',
    reference: 'TT-ADS-AUG'
  },
  {
    id: 'exp-7',
    date: '2026-08-14',
    type: 'Office & Staff',
    amount: 45000,
    currency: 'NGN',
    description: 'Ikeja Central Warehouse generator fuel & facility maintenance',
    reference: 'FACILITY-AUG'
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
    name: 'Kayode Daniels',
    email: 'kayode.ads@growthpilot.ng',
    phone: '+234 802 881 9922',
    budgetMonthly: 1200000,
    blendedCpa: 2850,
    targetCpa: 3000,
    activeCampaigns: ['clarifying_glow_sept26', 'skincare_retargeting_v2'],
    teamId: 'team-lagos',
    trafficPlatform: 'Facebook & Instagram',
    status: 'Active',
    commissionType: 'per_delivered_order',
    commissionRate: 1500,
    totalSpendRecorded: 840000,
    joinedDate: '2026-03-10',
    notes: 'Handles high-volume beauty and skincare offers. Consistently achieves >85% delivery rate.'
  },
  {
    id: 'mb-2',
    name: 'Blessing Amadi',
    email: 'blessing@amplifimedia.co',
    phone: '+234 813 445 6677',
    budgetMonthly: 850000,
    blendedCpa: 3100,
    targetCpa: 3200,
    activeCampaigns: ['smartwatch_gadget_review', 'knee_pain_elderly_relief'],
    teamId: 'team-abuja',
    trafficPlatform: 'TikTok Ads',
    status: 'Active',
    commissionType: 'percentage_revenue',
    commissionRate: 5,
    totalSpendRecorded: 620000,
    joinedDate: '2026-05-15',
    notes: 'Specializes in TikTok UGC video creatives and gadget campaigns.'
  },
  {
    id: 'mb-3',
    name: 'Samuel Okon (Alpha Ads)',
    email: 'samuel@alphaadventures.ng',
    phone: '+234 809 112 3344',
    budgetMonthly: 950000,
    blendedCpa: 2600,
    targetCpa: 2800,
    activeCampaigns: ['titan_amoled_oct_launch', 'posture_corrector_scale'],
    teamId: 'team-lagos',
    trafficPlatform: 'TikTok & Meta Ads',
    status: 'Active',
    commissionType: 'per_delivered_order',
    commissionRate: 1800,
    totalSpendRecorded: 510000,
    joinedDate: '2026-06-01',
    notes: 'Scales winner ad sets with strict cost cap bidding.'
  },
  {
    id: 'mb-4',
    name: 'Damilola Wright',
    email: 'damilola.w@digitalscale.com',
    phone: '+234 701 556 7788',
    budgetMonthly: 500000,
    blendedCpa: 3450,
    targetCpa: 3500,
    activeCampaigns: ['herbal_hair_growth_test'],
    teamId: 'team-kano',
    trafficPlatform: 'Google Search & YouTube',
    status: 'Paused',
    commissionType: 'fixed_monthly',
    commissionRate: 150000,
    totalSpendRecorded: 290000,
    joinedDate: '2026-07-20',
    notes: 'Testing Google Intent Search ads for high-ticket COD items.'
  }
];

export const INITIAL_MEDIA_BUYER_SPEND_LOGS: MediaBuyerSpendLog[] = [
  {
    id: 'spend-1',
    mediaBuyerId: 'mb-1',
    mediaBuyerName: 'Kayode Daniels',
    date: '2026-09-27',
    platform: 'Facebook',
    campaignName: 'clarifying_glow_sept26',
    productId: 'prod-1',
    amount: 45000,
    currency: 'NGN',
    impressions: 28400,
    clicks: 620,
    notes: 'Advantage+ Shopping campaign scaling'
  },
  {
    id: 'spend-2',
    mediaBuyerId: 'mb-1',
    mediaBuyerName: 'Kayode Daniels',
    date: '2026-09-26',
    platform: 'Facebook',
    campaignName: 'skincare_retargeting_v2',
    productId: 'prod-1',
    amount: 32000,
    currency: 'NGN',
    impressions: 19500,
    clicks: 410,
    notes: 'Retargeting website visitors 7 days'
  },
  {
    id: 'spend-3',
    mediaBuyerId: 'mb-2',
    mediaBuyerName: 'Blessing Amadi',
    date: '2026-09-27',
    platform: 'TikTok',
    campaignName: 'smartwatch_gadget_review',
    productId: 'prod-2',
    amount: 38000,
    currency: 'NGN',
    impressions: 42000,
    clicks: 890,
    notes: 'Spark ads with creator unboxing'
  },
  {
    id: 'spend-4',
    mediaBuyerId: 'mb-2',
    mediaBuyerName: 'Blessing Amadi',
    date: '2026-09-25',
    platform: 'TikTok',
    campaignName: 'knee_pain_elderly_relief',
    productId: 'prod-3',
    amount: 25000,
    currency: 'NGN',
    impressions: 31000,
    clicks: 530,
    notes: 'Broad targeting 35-65 age group'
  },
  {
    id: 'spend-5',
    mediaBuyerId: 'mb-3',
    mediaBuyerName: 'Samuel Okon (Alpha Ads)',
    date: '2026-09-27',
    platform: 'TikTok',
    campaignName: 'titan_amoled_oct_launch',
    productId: 'prod-2',
    amount: 35000,
    currency: 'NGN',
    impressions: 36000,
    clicks: 740,
    notes: 'New creative test variant B'
  }
];

export const INITIAL_REMITTANCES: Remittance[] = [
  {
    id: 'remit-1010',
    orderId: 'ord-1010',
    orderNumber: '#1010',
    agentId: 'agent-3',
    agentName: 'Capital Dispatch (Abuja)',
    agentZone: 'FCT',
    customerName: 'Kelvin Ibe',
    customerPhone: '+2348065298186',
    productSummary: 'Beard Growth Kit',
    orderTotal: 38500,
    amountToRemit: 38500,
    currency: 'NGN',
    deliveredDate: '2026-10-04',
    status: 'Pending',
    notes: 'Doorstep COD collection in Wuse 2.'
  },
  {
    id: 'remit-1032',
    orderId: 'ord-1032',
    orderNumber: '#1032',
    agentId: 'agent-3',
    agentName: 'Capital Dispatch (Abuja)',
    agentZone: 'FCT',
    customerName: 'Kelvin Eze',
    customerPhone: '+2348092258268',
    productSummary: 'Organic Hair Growth Oil, Adjustable Knee Brace',
    orderTotal: 42000,
    amountToRemit: 42000,
    currency: 'NGN',
    deliveredDate: '2026-10-02',
    status: 'Pending',
    notes: 'Maitama district delivery.'
  },
  {
    id: 'remit-1067',
    orderId: 'ord-1067',
    orderNumber: '#1067',
    agentId: 'agent-southeast',
    agentName: 'SouthEast Movers',
    agentZone: 'Anambra',
    customerName: 'Aisha Mohammed',
    customerPhone: '+2348069544823',
    productSummary: 'Liver Detox Capsules, Adjustable Knee Brace',
    orderTotal: 46500,
    amountToRemit: 46500,
    currency: 'NGN',
    deliveredDate: '2026-09-30',
    status: 'Pending',
    notes: 'Onitsha Main Market delivery.'
  },
  {
    id: 'remit-1012',
    orderId: 'ord-1012',
    orderNumber: '#1012',
    agentId: 'agent-1',
    agentName: 'Swift Logistics (Lagos)',
    agentZone: 'Lagos',
    customerName: 'Adaeze Okafor',
    customerPhone: '+2348062388921',
    productSummary: 'Organic Hair Growth Oil, 30-Day Slimming Tea',
    orderTotal: 40500,
    amountToRemit: 40500,
    currency: 'NGN',
    deliveredDate: '2026-09-29',
    status: 'Pending',
    notes: 'Victoria Island delivery.'
  },
  {
    id: 'remit-1094',
    orderId: 'ord-1094',
    orderNumber: '#1094',
    agentId: 'agent-4',
    agentName: 'GardenCity Riders (PH)',
    agentZone: 'Rivers',
    customerName: 'Halima Lawal',
    customerPhone: '+2348013145352',
    productSummary: 'Beard Growth Kit, Adjustable Knee Brace',
    orderTotal: 45000,
    amountToRemit: 45000,
    currency: 'NGN',
    deliveredDate: '2026-09-14',
    status: 'Pending',
    notes: 'GRA Phase 2 Port Harcourt.'
  },
  {
    id: 'remit-1077',
    orderId: 'ord-1077',
    orderNumber: '#1077',
    agentId: 'agent-3',
    agentName: 'Capital Dispatch (Abuja)',
    agentZone: 'FCT',
    customerName: 'Yusuf Yakubu',
    customerPhone: '+2348084809142',
    productSummary: 'Organic Hair Growth Oil',
    orderTotal: 25000,
    amountToRemit: 25000,
    currency: 'NGN',
    deliveredDate: '2026-09-13',
    status: 'Pending',
    notes: 'Garki 2 Area.'
  },
  {
    id: 'remit-1011',
    orderId: 'ord-1011',
    orderNumber: '#1011',
    agentId: 'agent-3',
    agentName: 'Capital Dispatch (Abuja)',
    agentZone: 'FCT',
    customerName: 'Ngozi Adebayo',
    customerPhone: '+2348093021806',
    productSummary: 'Organic Hair Growth Oil',
    orderTotal: 25000,
    amountToRemit: 25000,
    currency: 'NGN',
    deliveredDate: '2026-09-12',
    status: 'Pending',
    notes: 'Asokoro delivery.'
  },
  {
    id: 'remit-1076',
    orderId: 'ord-1076',
    orderNumber: '#1076',
    agentId: 'agent-southeast',
    agentName: 'SouthEast Movers',
    agentZone: 'Anambra',
    customerName: 'Obinna Bello',
    customerPhone: '+2348064990361',
    productSummary: 'Organic Hair Growth Oil',
    orderTotal: 25000,
    amountToRemit: 25000,
    currency: 'NGN',
    deliveredDate: '2026-08-13',
    status: 'Pending',
    notes: 'Awka town delivery.'
  },
  {
    id: 'remit-1031',
    orderId: 'ord-1031',
    orderNumber: '#1031',
    agentId: 'agent-3',
    agentName: 'Capital Dispatch (Abuja)',
    agentZone: 'FCT',
    customerName: 'Musa Garba',
    customerPhone: '+2348033118902',
    productSummary: 'Beard Growth Kit, Organic Hair Growth Oil',
    orderTotal: 48000,
    amountToRemit: 48000,
    currency: 'NGN',
    deliveredDate: '2026-08-11',
    status: 'Pending',
    notes: 'Kubwa express delivery.'
  },
  {
    id: 'remit-1',
    orderId: 'ord-10492',
    orderNumber: '#10492',
    agentId: 'agent-2',
    agentName: 'Kunle Ajayi Express',
    agentZone: 'Lagos Island',
    customerName: 'Folake Adeleke',
    customerPhone: '+234 802 341 9988',
    productSummary: '2x Bella Glow Set Bundle',
    orderTotal: 42000,
    amountToRemit: 42000,
    currency: 'NGN',
    deliveredDate: '2026-09-25',
    status: 'Pending',
    notes: 'Awaiting Friday bulk reconciliation.'
  },
  {
    id: 'remit-2',
    orderId: 'ord-10498',
    orderNumber: '#10498',
    agentId: 'agent-1',
    agentName: 'Swift Logistics (Lagos)',
    agentZone: 'Lagos Mainland',
    customerName: 'Festus Oghenero',
    customerPhone: '+234 807 554 9922',
    productSummary: '1x Titan Pro Smartwatch',
    orderTotal: 32000,
    deliveryFeeDeducted: 2500,
    amountToRemit: 29500,
    currency: 'NGN',
    deliveredDate: '2026-09-24',
    status: 'Remitted',
    remittedAt: '2026-09-25 11:30',
    paymentReference: 'GTB-TRF-908124',
    notes: 'Direct GTBank transfer received.'
  },
  {
    id: 'remit-3',
    orderId: 'ord-10500',
    orderNumber: '#10500',
    agentId: 'agent-1',
    agentName: 'Swift Logistics (Lagos)',
    agentZone: 'Lagos Mainland',
    customerName: 'Hajiya Maryam Al-Hassan',
    customerPhone: '+234 803 219 0044',
    productSummary: '2x Clarifying Face Cream',
    orderTotal: 48000,
    amountToRemit: 48000,
    currency: 'NGN',
    deliveredDate: '2026-09-27',
    status: 'Pending',
    notes: 'Customer transferred cash on doorstep.'
  },
  {
    id: 'remit-4',
    orderId: 'ord-10501',
    orderNumber: '#10501',
    agentId: 'agent-4',
    agentName: 'GardenCity Riders (PH)',
    agentZone: 'Rivers (Port Harcourt)',
    customerName: 'Dr. Patrick Okon',
    customerPhone: '+234 818 772 1199',
    productSummary: '1x Titanium Smart Band Pro',
    orderTotal: 36000,
    amountToRemit: 36000,
    currency: 'NGN',
    deliveredDate: '2026-09-27',
    status: 'Pending',
    notes: 'Delivered to GRA Phase 2.'
  },
  {
    id: 'remit-5',
    orderId: 'ord-10502',
    orderNumber: '#10502',
    agentId: 'agent-3',
    agentName: 'Capital Dispatch (Abuja)',
    agentZone: 'Abuja (FCT)',
    customerName: 'Fatima Sanusi',
    customerPhone: '+234 809 332 5588',
    productSummary: '1x Herbal Rejuvenation Kit',
    orderTotal: 32000,
    amountToRemit: 32000,
    currency: 'NGN',
    deliveredDate: '2026-09-27',
    status: 'Pending',
    notes: 'Gwarinpa Estate delivery.'
  },
  {
    id: 'remit-6',
    orderId: 'ord-10503',
    orderNumber: '#10503',
    agentId: 'agent-2',
    agentName: 'Kunle Ajayi Express',
    agentZone: 'Lagos Island',
    customerName: 'Engr. Gbenga Ade',
    customerPhone: '+234 802 884 1122',
    productSummary: '1x Complete Glow Collection',
    orderTotal: 42000,
    deliveryFeeDeducted: 2500,
    amountToRemit: 39500,
    currency: 'NGN',
    deliveredDate: '2026-09-27',
    status: 'Remitted',
    remittedAt: '2026-09-28 14:15',
    paymentReference: 'ZEN-TRF-441098',
    notes: 'Zenith Bank instant payment.'
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
    description: 'Admin Quota Allocation: High-Volume Telephony Pool',
    amountPaidNgn: 0,
    paymentReference: 'ADM-ALLOC-908124',
    paymentMethod: 'Admin Direct Allocation'
  },
  {
    id: 'tok-2',
    date: '2026-09-25 18:25',
    type: 'AI Call Used',
    tokensChanged: -2,
    tokenBalanceAfter: 522,
    description: 'Vapi Voice Confirmation Call: ORD-10494 (Hajiya Aisha Bello, 1m 24s)',
    orderNumber: 'ORD-10494'
  },
  {
    id: 'tok-3',
    date: '2026-09-25 18:30',
    type: 'SMS Sent',
    tokensChanged: -1,
    tokenBalanceAfter: 521,
    description: 'Automated Dispatch SMS to Customer (ORD-10494)',
    orderNumber: 'ORD-10494'
  },
  {
    id: 'tok-4',
    date: '2026-09-26 11:15',
    type: 'AI Call Used',
    tokensChanged: -2,
    tokenBalanceAfter: 519,
    description: 'Vapi Voice Confirmation Call: ORD-10497 (Chiamaka Onyekwelu, 58s)',
    orderNumber: 'ORD-10497'
  },
  {
    id: 'tok-5',
    date: '2026-09-27 14:00',
    type: 'Purchase',
    tokensChanged: 150,
    tokenBalanceAfter: 669,
    description: 'Admin Quota Allocation: Production Telephony Provision',
    amountPaidNgn: 0,
    paymentReference: 'ADM-ALLOC-338192',
    paymentMethod: 'Admin Direct Allocation'
  },
  {
    id: 'tok-6',
    date: '2026-09-27 16:30',
    type: 'SMS Sent',
    tokensChanged: -1,
    tokenBalanceAfter: 668,
    description: 'Doorstep Courier Arrival Alert (ORD-10500)',
    orderNumber: 'ORD-10500'
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
  showAltPhoneField: true,
  isAltPhoneRequired: false,
  formHeadline: 'COMPLETE YOUR ORDER BELOW (PAYMENT ON DELIVERY NATIONWIDE)',
  formSubheadline: 'Fill in your delivery address accurately. Our dispatch agent will deliver to your doorstep in 24 - 48 hours.',
  showWarningNotice: true,
  warningNotice: '⚠️ IMPORTANT NOTICE: Please do NOT place an order if you will be travelling in the next 48 hours or will not have the complete cash/transfer ready at delivery.',
  showTrustBadges: true,
  showUrgencyTimer: true,
  urgencyMinutes: 15,
  showStockScarcity: true,
  stockScarcityUnits: 7,
  metaPixelId: '109283746582910',
  tiktokPixelId: 'C7M89K01LL2',
  googleTagId: 'G-ORD98201',
  packageDisplayStyle: 'cards',
  buttonSubtext: '🔒 100% Risk Free • Pay On Delivery Nationwide',
  webhookUrl: '',
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
      productId: 'prod-4',
      name: 'LuxeOud Arabesque Perfume Oil (Special Add-On)',
      price: 6500,
      originalPrice: 15000,
      description: 'Long-lasting luxury fragrance oil. Save over 55% when added to your package today.',
      badge: '55% OFF ADD-ON'
    },
    {
      id: 'bump-2',
      productId: 'prod-5',
      name: 'Ultra Sonic Pest Repeller 4-Pack (Companion Offer)',
      price: 7000,
      originalPrice: 14000,
      description: 'Exclusive 50% discount when added with your order today.',
      badge: '50% OFF UPSELL'
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

