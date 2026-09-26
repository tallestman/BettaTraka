export type CurrencyCode = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'AED' | 'USD' | 'GBP' | 'EUR';

export type UserRole = 
  | 'Owner' 
  | 'Admin' 
  | 'Manager' 
  | 'Team Lead' 
  | 'Sales Representative' 
  | 'Inventory Manager' 
  | 'Accountant';

export type OrderStatus = 
  | 'NEW' 
  | 'CONFIRMED' 
  | 'DISPATCHED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'NOT_REACHABLE' 
  | 'NOT_PICKING_CALLS' 
  | 'SCHEDULED';

export type CartStatus = 
  | 'ABANDONED' 
  | 'ASSIGNED' 
  | 'CONTACTED' 
  | 'NO RESPONSE' 
  | 'NOT INTERESTED' 
  | 'CONVERTED' 
  | 'LOST';

export type AICallOutcome = 'ANSWERED' | 'NO_ANSWER' | 'VOICEMAIL' | 'PENDING';

export type PayStructure = 'Fixed' | 'Commission' | 'Hybrid' | 'Performance-based';

export interface ManagerPermissions {
  sales: {
    orders: boolean;
    salesReps: boolean;
    teamPerformance: boolean;
    customers: boolean;
    deliveries: boolean;
  };
  operations: {
    deliveryAgents: boolean;
    inventory: boolean;
    roundRobin: boolean;
  };
  finance: {
    expenses: boolean;
    reports: boolean;
    orderReports: boolean;
    remittances: boolean;
    mediaBuyers: boolean;
    payroll: boolean;
  };
  admin: {
    users: boolean;
    notifications: boolean;
    orderFormBuilder: boolean;
    adTracker: boolean;
    aiAgent: boolean;
    subscription: boolean;
    settings: boolean;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: 'Active' | 'Paused' | 'Inactive';
  avatarUrl?: string;
  createdAt: string;
  teamId?: string;
  payStructure: PayStructure;
  fixedSalary?: number;
  commissionPerOrder?: number;
  permissions?: ManagerPermissions;
}

export interface ProductPricing {
  currency: CurrencyCode;
  sellingPrice: number;
  baseCost: number;
  landedCost: number;
  marginPercent: number;
}

export interface ProductPackage {
  id: string;
  productId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  currency: CurrencyCode;
  status: 'Active' | 'Inactive';
  hasFreeGift?: boolean;
  freeGiftName?: string;
  freeGiftProductId?: string;
  freeGiftQuantity?: number;
  freeGiftPerceivedValue?: number;
  badge?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  unitCost: number; // in NGN
  sellingPrice: number; // in NGN
  stockWarehouse: number;
  pricing: ProductPricing[];
  packages: ProductPackage[];
  category: string;
}

export interface OrderBump {
  id: string;
  productId?: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  badge?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  packageId?: string;
  packageName?: string;
  bumps?: OrderBump[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  items: OrderItem[];
  totalAmount: number;
  currency: CurrencyCode;
  source: 'Order Form' | 'WooCommerce' | 'Shopify' | 'Manual Rep' | 'WhatsApp' | 'TikTok' | 'Abandoned Cart Recovery';
  utmSource?: string;
  utmCampaign?: string;
  utmCreative?: string;
  salesRepId?: string;
  salesRepName?: string;
  agentId?: string;
  agentName?: string;
  status: OrderStatus;
  responseTimeMinutes?: number;
  scheduledDate?: string;
  deliveredDate?: string;
  fulfillmentDays?: number;
  createdAt: string;
  isSandbox?: boolean;
  mediaBuyerId?: string;
  mediaBuyerName?: string;
  commitmentFeePaid?: boolean;
  deliveryWindowPreference?: string;
  notes?: string;
}

export interface AbandonedCart {
  id: string;
  cartNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsApp?: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  productId: string;
  productName: string;
  packageId?: string;
  packageName?: string;
  amount: number;
  currency: CurrencyCode;
  status: CartStatus;
  assignedRepId?: string;
  assignedRepName?: string;
  createdAt: string;
  lastActivity: string;
  notes?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  primaryZone: string;
  secondaryZones: string[];
  status: 'Active on Duty' | 'Order in Progress' | 'Off Duty';
  successRate: number;
  capacityLimit: number; // usually 1000
  totalStockHeld: number;
  defectiveStockValue: number;
  missingStockValue: number;
}

export interface AgentStockItem {
  agentId: string;
  productId: string;
  unitsHeld: number;
  defectiveUnits: number;
  missingUnits: number;
}

export interface StockMovement {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'Warehouse to Agent' | 'Agent to Customer' | 'Agent to Agent Transfer' | 'Restock' | 'Defective Return';
  fromLocation: string;
  toLocation: string;
  quantity: number;
  referenceOrderOrAgent?: string;
}

export interface SalesTeam {
  id: string;
  name: string;
  teamLeadId: string;
  teamLeadName: string;
  repIds: string[];
  productLinks: string[]; // product IDs allowed
  mediaBuyerLinks: string[]; // media buyer IDs routed to this team
}

export interface RoundRobinRep {
  repId: string;
  repName: string;
  weight: number; // 1, 2, 3
  isAvailable: boolean;
  isIncluded: boolean;
  lastAssignedAt?: string;
  assignedOrderCount: number;
}

export interface RoundRobinState {
  orderPool: RoundRobinRep[];
  cartPool: RoundRobinRep[];
  nextRepIndexOrder: number;
  nextRepIndexCart: number;
  routeReturningCustomersToPreviousRep: boolean;
  assignOrdersToMeAdmin: boolean;
  assignCartsToMeAdmin: boolean;
}

export interface Expense {
  id: string;
  date: string;
  type: 'Product Manufacturing' | 'Freight / Customs' | 'Meta / TikTok Ads' | 'Agent Delivery Fees' | 'Software & Tools' | 'Office & Staff';
  productId?: string;
  productName?: string;
  amount: number;
  currency: CurrencyCode;
  description: string;
  reference?: string;
}

export interface PayrollItem {
  userId: string;
  userName: string;
  role: UserRole;
  payStructure: PayStructure;
  fixedBase: number;
  deliveredOrders: number;
  commissionEarned: number;
  bonusEarned: number;
  totalPayout: number;
  currency: CurrencyCode;
}

export interface PayrollRun {
  id: string;
  month: string; // e.g. "September 2026"
  currency: CurrencyCode;
  createdAt: string;
  status: 'Draft' | 'Approved' | 'Paid';
  totalPayout: number;
  topPerformerRepId?: string;
  items: PayrollItem[];
}

export interface Remittance {
  id: string;
  orderId: string;
  orderNumber: string;
  agentId: string;
  agentName: string;
  agentZone: string;
  customerName: string;
  customerPhone: string;
  productSummary: string;
  amountToRemit: number; // collected from customer minus delivery fee
  currency: CurrencyCode;
  deliveredDate: string;
  status: 'Pending' | 'Remitted';
  remittedAt?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  city: string;
  state: string;
  totalOrders: number;
  successfulOrders: number;
  cancelledOrders: number;
  totalSpend: number;
  reliabilityScore: number; // 0 to 100%
  source: string;
  isBlocked: boolean;
  lastOrderDate: string;
}

export interface MediaBuyer {
  id: string;
  name: string;
  email: string;
  budgetMonthly: number;
  blendedCpa: number;
  activeCampaigns: string[];
  teamId?: string;
}

export interface AICallLog {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  attempts: number;
  maxAttempts: number;
  cycle: number;
  outcome: AICallOutcome;
  durationSeconds: number;
  nextCallTime?: string;
  orderStatus: OrderStatus;
  date: string;
  transcriptSnippet?: string;
}

export interface TokenTransaction {
  id: string;
  date: string;
  type: 'Purchase' | 'AI Call Used' | 'SMS Sent' | 'Bonus Credit';
  tokensChanged: number;
  tokenBalanceAfter: number;
  description: string;
}

export interface ReferralRecord {
  id: string;
  businessName: string;
  ownerName: string;
  signedUpDate: string;
  plan: 'Starter' | 'Growth' | 'Business' | 'Enterprise';
  earnedAmount: number;
  status: 'On Hold (30 days)' | 'Available' | 'Paid Out';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  avatarUrl?: string;
  content: string;
  timestamp: string;
  mentions?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order_assigned' | 'order_received' | 'delivery_completed' | 'low_stock' | 'cart_abandoned' | 'ai_call';
  isRead: boolean;
  linkTab?: string;
  linkParam?: string;
}

export interface OrderFormRecord {
  id: string;
  title: string;
  slug: string;
  productId: string;
  status: 'Active' | 'Draft' | 'Archived';
  viewsCount: number;
  ordersCount: number;
  conversionRate: number;
  createdAt: string;
  config: EmbedFormConfig;
}

export interface EmbedFormConfig {
  productId: string;
  formTitle?: string;
  stateInputType: 'dropdown' | 'freetext';
  packagePosition: 'before_questions' | 'after_questions';
  showEmailField: boolean;
  isEmailRequired: boolean;
  showWhatsAppField: boolean;
  isWhatsAppRequired: boolean;
  isAddressRequired: boolean;
  isCityRequired: boolean;
  showPackageName: boolean;
  showDeliveryWindowQuestion: boolean;
  requireConfirmationCheckbox: boolean;
  showCommitmentFeeNotice: boolean;
  commitmentFeeAmount: number;
  buttonText: string;
  buttonColor: string;
  borderThickness: 'thin' | 'medium' | 'thick';
  placeholderDarkness: 'light' | 'medium' | 'dark';
  additionalQuestions: Array<{
    id: string;
    question: string;
    type: 'text' | 'select';
    options?: string[];
    required: boolean;
  }>;
  orderBumps: OrderBump[];
  enableRedirect?: boolean;
  redirectUrl?: string;
  redirectDelaySeconds?: number;
}

export interface OrganizationSettings {
  name: string;
  currency: CurrencyCode;
  currentPlan: 'Starter' | 'Growth' | 'Business' | 'Enterprise';
  billedPeriod: 'Monthly' | 'Quarterly' | 'Biannual' | 'Yearly';
  tokenBalance: number;
  emailQuotaMonthly: number;
  emailCreditsUsed: number;
  referralCode: string;
  pwaInstalled: boolean;
  emailNotificationsOrgWide: boolean;
  notifyAdminsOnNewCarts: boolean;
  salesRepV2Preview: boolean;
  adminV2Preview: boolean;
  themeMode?: 'dark' | 'light';
}
