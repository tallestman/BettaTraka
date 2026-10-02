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

function MainLayout() {
  const { persona, adminActiveTab, themeMode } = useCrm();

  const themeClasses = themeMode === 'light' ? 'bg-white text-black' : 'bg-black text-white';

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

  if (persona === 'rep') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses}`}>
        <TopBar />
        <SalesRepView />
      </div>
    );
  }

  if (persona === 'distributor') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses}`}>
        <TopBar />
        <DistributorDashboardView />
      </div>
    );
  }

  if (persona === 'inventory') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses}`}>
        <TopBar />
        <InventoryManagerView />
      </div>
    );
  }

  if (persona === 'media_buyer') {
    return (
      <div className={`min-h-screen flex flex-col ${themeClasses}`}>
        <TopBar />
        <MediaBuyerDashboardView />
      </div>
    );
  }

  // Admin persona with Sidebar & All 32 Pages
  return (
    <div className={`min-h-screen flex flex-col ${themeClasses}`}>
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className={`flex-1 overflow-y-auto ${themeMode === 'light' ? 'bg-[#f8fafc] text-black' : 'bg-black text-white'}`}>
          {adminActiveTab === 'dashboard' && <DashboardHome />}
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
          {(adminActiveTab === 'ai-agent' || adminActiveTab === 'ai-sandbox' || adminActiveTab === 'tokens') && <AIAgentAndTokensView />}
          {adminActiveTab === 'users' && <UserManagementView />}
          {adminActiveTab === 'team-chat' && <TeamChatView />}
          {adminActiveTab === 'notifications' && <NotificationsView />}
          {adminActiveTab === 'integrations' && <IntegrationsView />}
          {adminActiveTab === 'settings' && <SettingsView />}
          {(adminActiveTab === 'support' || adminActiveTab === 'academy') && (
            <SettingsAndSupportView />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <CrmProvider>
      <MainLayout />
    </CrmProvider>
  );
}
