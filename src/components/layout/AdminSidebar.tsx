import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  LayoutDashboard,
  ShoppingCart,
  PhoneCall,
  CalendarClock,
  Truck,
  Package,
  Users,
  Building2,
  Trophy,
  Navigation,
  RotateCcw,
  Banknote,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  FormInput,
  Target,
  Megaphone,
  Bot,
  FlaskConical,
  Coins,
  MessageSquare,
  ShieldCheck,
  Blocks,
  CreditCard,
  Mail,
  Gift,
  Settings,
  GraduationCap,
  Headphones,
  Search,
  ChevronRight,
  X
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavCategory {
  category: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const { 
    adminActiveTab, 
    setAdminActiveTab, 
    orders, 
    abandonedCarts, 
    remittances,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen
  } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');

  const newOrdersCount = orders.filter(o => o.status === 'NEW').length;
  const openCartsCount = abandonedCarts.filter(c => c.status === 'ABANDONED' || c.status === 'ASSIGNED').length;
  const pendingRemitCount = remittances.filter(r => r.status === 'Pending').length;

  const categories: NavCategory[] = [
    {
      category: 'Sales & Orders',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: newOrdersCount > 0 ? newOrdersCount : undefined },
        { id: 'abandoned-carts', label: 'Abandoned Carts', icon: PhoneCall, badge: openCartsCount > 0 ? openCartsCount : undefined },
        { id: 'scheduled', label: 'Scheduled Deliveries', icon: CalendarClock },
        { id: 'deliveries', label: 'Deliveries', icon: Truck },
        { id: 'customers', label: 'Customers', icon: Users },
      ]
    },
    {
      category: 'Operations & Stock',
      items: [
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'agents', label: 'Delivery Agents', icon: Navigation },
        { id: 'remittances', label: 'Remittances', icon: Banknote, badge: pendingRemitCount > 0 ? pendingRemitCount : undefined },
      ]
    },
    {
      category: 'Sales Reps & Teams',
      items: [
        { id: 'sales-reps', label: 'Sales Reps', icon: Users },
        { id: 'sales-teams', label: 'Sales Teams', icon: Building2 },
        { id: 'team-performance', label: 'Team Performance', icon: Trophy },
        { id: 'round-robin', label: 'Round-Robin', icon: RotateCcw },
      ]
    },
    {
      category: 'Finance & Reports',
      items: [
        { id: 'financial-reports', label: 'Financial Reports', icon: PieChart },
        { id: 'expenses', label: 'Expenses & Impact', icon: DollarSign },
        { id: 'order-reports', label: 'Order Reports', icon: FileSpreadsheet },
        { id: 'payroll', label: 'Payroll & Bonus', icon: TrendingUp },
      ]
    },
    {
      category: 'Marketing & AI',
      items: [
        { id: 'embed-forms', label: 'Embed Form Builder', icon: FormInput },
        { id: 'ad-tracking', label: 'Ad Tracking (UTM)', icon: Target },
        { id: 'media-buyers', label: 'Media Buyers', icon: Megaphone },
        { id: 'ai-agent', label: 'AI Voice Agent', icon: Bot },
        { id: 'ai-sandbox', label: 'AI Sandbox', icon: FlaskConical },
        { id: 'tokens', label: 'AI/SMS Tokens', icon: Coins },
      ]
    },
    {
      category: 'Organization & Admin',
      items: [
        { id: 'team-chat', label: 'Team Chat', icon: MessageSquare },
        { id: 'users', label: 'User Management', icon: ShieldCheck },
        { id: 'integrations', label: 'Integrations', icon: Blocks },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'email-usage', label: 'Email Usage', icon: Mail },
        { id: 'referrals', label: 'Referrals & Earnings', icon: Gift },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'support', label: 'Customer Support', icon: Headphones },
        { id: 'academy', label: 'BettaTraka Academy', icon: GraduationCap },
      ]
    }
  ];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const sidebarContent = (
    <div className="w-72 sm:w-80 md:w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Search Input for fast 32-page jump & mobile close */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Jump to 32 pages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 placeholder-slate-500"
          />
        </div>
        <button
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Close Navigation"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {filteredCategories.map((group) => (
          <div key={group.category} className="space-y-1">
            <h4 className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              {group.category}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = adminActiveTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
                        isActive 
                          ? 'bg-emerald-800 text-white' 
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info Pill */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-300">BettaTraka v2.6</p>
          <p className="text-[10px] text-slate-500">Nigeria POD Suite</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col h-[calc(100vh-3.5rem)] select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />
          {/* Drawer */}
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
