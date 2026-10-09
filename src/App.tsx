/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CrmProvider, useCrm } from './context/CrmContext';
import { TopBar } from './components/layout/TopBar';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { DashboardHome } from './components/admin/DashboardHome';
import { OrdersView } from './components/admin/OrdersView';
import { AbandonedCartsView } from './components/admin/AbandonedCartsView';
import { ScheduledDeliveriesView } from './components/admin/ScheduledDeliveriesView';
import { DeliveriesView } from './components/admin/DeliveriesView';
import { InventoryView } from './components/admin/InventoryView';
import { SalesRepsView, SalesTeamsView } from './components/admin/SalesRepsAndTeams';
import { TeamPerformanceView } from './components/admin/TeamPerformanceView';
import { DeliveryAgentsView } from './components/admin/DeliveryAgentsView';
import { DistributorsView } from './components/admin/DistributorsView';
import { PayrollView } from './components/admin/PayrollView';
import { CustomersView, ExpensesView } from './components/admin/CustomersAndExpenses';
import { FinancialReportsView, OrderReportsView, AdTrackingView, RemittancesView, MediaBuyersView } from './components/admin/ReportsAndTracking';
import { RoundRobinView, EmbedFormGeneratorView } from './components/admin/AutomationAndAI';
import { AIAgentAndTokensView } from './components/admin/TokensAndAIAgentView';
import { NotificationsView } from './components/admin/NotificationsView';
import { SettingsView } from './components/admin/SettingsView';
import { 
  UserManagementView, 
  TeamChatView, 
  IntegrationsView, 
  SettingsAndSupportView 
} from './components/admin/OrganizationSettingsAndChat';
import { SalesRepView } from './components/rep/SalesRepView';
import { DistributorDashboardView } from './components/distributor/DistributorDashboardView';
import { InventoryManagerView } from './components/inventory/InventoryManagerView';
import { MediaBuyerDashboardView } from './components/mediabuyer/MediaBuyerDashboardView';
import { PublicOrderForm } from './components/public/PublicOrderForm';
import { MarketingSite } from './components/marketing/MarketingSite';
import { ManagerDashboardView } from './components/manager/ManagerDashboardView';
import { AccountantDashboardView } from './components/accountant/AccountantDashboardView';
import { AccountantSettingsView } from './components/accountant/AccountantSettingsView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { LogoutPage } from './components/auth/LogoutPage';
import { UnauthorizedAccessGate } from './components/auth/UnauthorizedAccessGate';
import { hasUserAccessToTab } from './utils/permissions';
import { Lock } from 'lucide-react';

const TAB_TITLES: Record<string, string> = {
  'orders': 'Orders Management',
  'abandoned-carts': 'Abandoned Carts',
  'scheduled': 'Scheduled Deliveries',
  'deliveries': 'Deliveries',
  'inventory': 'Inventory Management',
  'sales-reps': 'Sales Reps',
  'sales-teams': 'Sales Teams',
  'team-performance': 'Team Performance',
  'distributors': 'Distributors',
  'agents': 'Delivery Agents',
  'payroll': 'Payroll',
  'customers': 'Customers CRM',
  'expenses': 'Expenses',
  'financial-reports': 'Finance & Accounting',
  'order-reports': 'Order Reports',
  'ad-tracking': 'Ad Tracking',
  'media-buyers': 'Media Buyers',
  'round-robin': 'Round-Robin Lead Engine',
  'embed-forms': 'Embed Form Generator',
  'remittances': 'Remittances & Escrow',
  'ai-agent': 'AI Voice Agent',
  'ai-sandbox': 'AI Sandbox',
  'tokens': 'Token Reporting',
  'users': 'User Management & Permissions',
  'team-chat': 'Team Chat',
  'notifications': 'Notifications',
  'integrations': 'Integrations',
  'settings': 'System Settings'
};

const PermissionRestrictedGate: React.FC<{ sectionName: string }> = ({ sectionName }) => (
  <div className="p-6 sm:p-12 max-w-lg mx-auto my-16 text-center space-y-4 rounded-2xl border border-rose-500/40 bg-slate-900/90 shadow-2xl animate-in fade-in">
    <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
      <Lock className="w-8 h-8" />
    </div>
    <div className="space-y-1.5">
      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded border border-rose-800/60">
        Access Permission Required
      </span>
      <h2 className="text-xl font-bold text-white mt-2">{sectionName} Access Restricted</h2>
      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
        Your user account has not been granted permission to access {sectionName}. A System Administrator can configure, grant, or update this permission for your profile in User Management.
      </p>
    </div>
  </div>
);

function MainLayout() {
  const { persona, setPersona, adminActiveTab, themeMode, currentUser } = useCrm();
  const { 
    isAuthenticated, 
    role: authRole, 
    isLoading: authLoading, 
    backendStatus, 
    setShowLoginModal, 
    setAuthModalMode 
  } = useAuth();

  const isLight = themeMode === 'light';
  const themeClasses = isLight ? 'bg-slate-50 text-slate-900' : 'bg-black text-white';

  // Handle URL Hash navigation across pages (#login, #register, #forgot-password, #logout, #marketing, #dashboard)
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (
        hash === '#login' || 
        hash === '#register' || 
        hash === '#forgot-password' || 
        hash.startsWith('#reset-password')
      ) {
        setPersona('login');
      } else if (hash === '#logout') {
        setPersona('logout');
      } else if (hash === '#marketing' || hash === '#home') {
        setPersona('marketing');
      } else if (hash === '#order-form' || hash === '#form') {
        setPersona('public_form');
      } else if (hash === '#dashboard' && isAuthenticated) {
        setPersona('admin');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [setPersona, isAuthenticated]);

  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses}`}>
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold tracking-wide text-slate-400">Loading BettaTraka Workspace...</p>
        </div>
      </div>
    );
  }

  // Dedicated Login / Register / Forgot Password Page
  if (persona === 'login') {
    const hash = window.location.hash.toLowerCase();
    const initialMode = (hash === '#forgot-password' || hash.startsWith('#reset-password'))
      ? 'forgot_password'
      : hash === '#register'
      ? 'register'
      : 'login';
    return <LoginPage initialMode={initialMode} />;
  }

  // Dedicated Logout Page
  if (persona === 'logout') {
    return <LogoutPage />;
  }

  if (persona === 'marketing') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses}`}>
        <TopBar />
        <MarketingSite />
      </div>
    );
  }

  if (persona === 'public_form') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses}`}>
        <TopBar />
        <PublicOrderForm />
      </div>
    );
  }

  // In production, unauthenticated users must sign in or register to access private CRM workspaces
  const isProd = import.meta.env.PROD;
  if (!isAuthenticated && isProd) {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses}`}>
        <TopBar />
        <UnauthorizedAccessGate
          onSignIn={() => {
            setPersona('login');
            window.location.hash = '#login';
          }}
          onCreateWorkspace={() => {
            setPersona('login');
            window.location.hash = '#register';
          }}
          backendStatus={backendStatus}
        />
      </div>
    );
  }

  // Server-enforced role gates for authenticated staff
  if (isAuthenticated && authRole) {
    if (authRole === 'Sales Representative' && persona !== 'rep') {
      return (
        <div className={`min-h-screen flex flex-col ${themeClasses}`}>
          <TopBar />
          <PermissionRestrictedGate sectionName="Administrative Operational Hub" />
        </div>
      );
    }
    if (authRole === 'Distributor' && persona !== 'distributor') {
      return (
        <div className={`min-h-screen flex flex-col ${themeClasses}`}>
          <TopBar />
          <PermissionRestrictedGate sectionName="Distributor Operations Hub" />
        </div>
      );
    }
    if (authRole === 'Inventory Manager' && persona !== 'inventory') {
      return (
        <div className={`min-h-screen flex flex-col ${themeClasses}`}>
          <TopBar />
          <PermissionRestrictedGate sectionName="Warehouse Inventory Operations Hub" />
        </div>
      );
    }
    if (authRole === 'Media Buyer' && persona !== 'media_buyer') {
      return (
        <div className={`min-h-screen flex flex-col ${themeClasses}`}>
          <TopBar />
          <PermissionRestrictedGate sectionName="Media Buyer Performance Hub" />
        </div>
      );
    }
  }

  const isManager = persona === 'manager' || currentUser?.role === 'Manager' || authRole === 'Manager';
  const isAccountant = persona === 'accountant' || currentUser?.role === 'Accountant' || authRole === 'Accountant';

  if (persona === 'rep') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses} w-full max-w-full overflow-x-hidden`}>
        <TopBar />
        <main className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
          <SalesRepView />
        </main>
      </div>
    );
  }

  if (persona === 'distributor') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses} w-full max-w-full overflow-x-hidden`}>
        <TopBar />
        <main className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
          <DistributorDashboardView />
        </main>
      </div>
    );
  }

  if (persona === 'inventory') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses} w-full max-w-full overflow-x-hidden`}>
        <TopBar />
        <main className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
          <InventoryManagerView />
        </main>
      </div>
    );
  }

  if (persona === 'media_buyer') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses} w-full max-w-full overflow-x-hidden`}>
        <TopBar />
        <main className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
          <MediaBuyerDashboardView />
        </main>
      </div>
    );
  }

  // Admin persona with Sidebar & All 32 Pages
  return (
    <div className={`min-h-screen flex flex-col ${themeClasses} w-full max-w-full overflow-x-hidden`}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden min-w-0 w-full max-w-full">
        <AdminSidebar />
        <main className={`flex-1 min-w-0 w-full max-w-full overflow-y-auto overflow-x-hidden ${themeMode === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-black text-white'}`}>
          {!hasUserAccessToTab(currentUser, adminActiveTab) && 
           adminActiveTab !== 'dashboard' && 
           adminActiveTab !== 'support' && 
           adminActiveTab !== 'academy' ? (
            <PermissionRestrictedGate sectionName={TAB_TITLES[adminActiveTab] || adminActiveTab} />
          ) : (
            <>
              {adminActiveTab === 'dashboard' && (
                isAccountant ? <AccountantDashboardView /> : isManager ? <ManagerDashboardView /> : <DashboardHome />
              )}
              {adminActiveTab === 'orders' && <OrdersView />}
              {adminActiveTab === 'abandoned-carts' && <AbandonedCartsView />}
              {adminActiveTab === 'scheduled' && <ScheduledDeliveriesView />}
              {adminActiveTab === 'deliveries' && <DeliveriesView />}
              {adminActiveTab === 'inventory' && <InventoryView />}
              {adminActiveTab === 'sales-reps' && <SalesRepsView />}
              {adminActiveTab === 'sales-teams' && <SalesTeamsView />}
              {adminActiveTab === 'team-performance' && <TeamPerformanceView />}
              {adminActiveTab === 'distributors' && <DistributorsView />}
              {adminActiveTab === 'agents' && <DeliveryAgentsView />}
              {adminActiveTab === 'payroll' && <PayrollView />}
              {adminActiveTab === 'customers' && <CustomersView />}
              {adminActiveTab === 'expenses' && <ExpensesView />}
              {adminActiveTab === 'financial-reports' && <FinancialReportsView />}
              {adminActiveTab === 'order-reports' && <OrderReportsView />}
              {adminActiveTab === 'ad-tracking' && <AdTrackingView />}
              {adminActiveTab === 'media-buyers' && <MediaBuyersView />}
              {adminActiveTab === 'round-robin' && <RoundRobinView />}
              {adminActiveTab === 'embed-forms' && <EmbedFormGeneratorView />}
              {adminActiveTab === 'remittances' && <RemittancesView />}
              {adminActiveTab === 'ai-agent' && <AIAgentAndTokensView />}
              {adminActiveTab === 'ai-sandbox' && <AIAgentAndTokensView />}
              {adminActiveTab === 'tokens' && <AIAgentAndTokensView />}
              {adminActiveTab === 'users' && <UserManagementView />}
              {adminActiveTab === 'team-chat' && <TeamChatView />}
              {adminActiveTab === 'notifications' && <NotificationsView />}
              {adminActiveTab === 'integrations' && <IntegrationsView />}
              {adminActiveTab === 'settings' && (
                isAccountant ? <AccountantSettingsView /> : <SettingsView />
              )}
              {(adminActiveTab === 'support' || adminActiveTab === 'academy') && <SettingsAndSupportView />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CrmProvider>
        <MainLayout />
        <AuthModal />
      </CrmProvider>
    </AuthProvider>
  );
}
