import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { 
  Users, 
  ChevronRight, 
  TrendingUp, 
  Search, 
  Building2,
  ArrowRight,
  X,
  Calendar,
  Download,
  Trophy,
  Award,
  CheckCircle2,
  Eye,
  Filter
} from 'lucide-react';
import { Order } from '../../types/crm';

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

export const TeamPerformanceView: React.FC = () => {
  const { 
    salesTeams, 
    users, 
    orders, 
    currency, 
    setAdminActiveTab 
  } = useCrm();

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [repSearchQuery, setRepSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [viewingRepOrders, setViewingRepOrders] = useState<{ repName: string; repId: string; orders: Order[] } | null>(null);

  // Selected team object
  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return salesTeams.find(t => t.id === selectedTeamId) || null;
  }, [selectedTeamId, salesTeams]);

  // Robust Order filtering by date period
  const filterOrdersByPeriod = (ordersList: typeof orders, period: TimePeriod) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return ordersList.filter(o => {
      if (!o.createdAt) return false;
      const orderDate = new Date(o.createdAt);

      switch (period) {
        case 'today': {
          const isSameDay = 
            orderDate.getUTCFullYear() === now.getUTCFullYear() &&
            orderDate.getUTCMonth() === now.getUTCMonth() &&
            orderDate.getUTCDate() === now.getUTCDate();
          return isSameDay || o.createdAt.startsWith(todayStr);
        }
        case 'week': {
          const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= oneWeekAgo;
        }
        case 'month': {
          return orderDate.getUTCMonth() === now.getUTCMonth() && orderDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'year': {
          return orderDate.getUTCFullYear() === now.getUTCFullYear();
        }
        case 'custom': {
          if (customStartDate) {
            const start = new Date(customStartDate);
            if (orderDate < start) return false;
          }
          if (customEndDate) {
            const end = new Date(customEndDate);
            end.setHours(23, 59, 59, 999);
            if (orderDate > end) return false;
          }
          return true;
        }
        case 'all':
        default:
          return true;
      }
    });
  };

  // Orders in period (all orders)
  const allOrdersInPeriod = useMemo(() => {
    return filterOrdersByPeriod(orders, selectedPeriod);
  }, [orders, selectedPeriod, customStartDate, customEndDate]);

  // Helper to get orders belonging to any team
  const getOrdersForTeam = (team: typeof salesTeams[0], periodOrders: typeof orders) => {
    return periodOrders.filter(o => {
      if (o.salesRepId && team.repIds.includes(o.salesRepId)) return true;
      const rep = users.find(u => u.id === o.salesRepId);
      if (rep && rep.teamId === team.id) return true;
      return false;
    });
  };

  // Orders attributed to the currently selected team
  const teamOrdersInPeriod = useMemo(() => {
    if (!selectedTeam) return [];
    return getOrdersForTeam(selectedTeam, allOrdersInPeriod);
  }, [selectedTeam, allOrdersInPeriod, users]);

  // Metrics for selected team
  const totalOrders = teamOrdersInPeriod.length;
  const deliveredOrders = teamOrdersInPeriod.filter(o => o.status === 'DELIVERED').length;
  const teamConversion = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const teamDeliveredRevenue = teamOrdersInPeriod
    .filter(o => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Per-rep breakdown for selected team
  const repBreakdown = useMemo(() => {
    if (!selectedTeam) return [];
    
    // Reps assigned to this team
    const teamReps = users.filter(u => selectedTeam.repIds.includes(u.id) || u.teamId === selectedTeam.id);
    
    return teamReps.map(rep => {
      const repOrders = teamOrdersInPeriod.filter(o => o.salesRepId === rep.id);
      const repDelivered = repOrders.filter(o => o.status === 'DELIVERED');
      const conversion = repOrders.length > 0 ? Math.round((repDelivered.length / repOrders.length) * 100) : 0;
      const revenueNgn = repDelivered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const commissionRate = rep.commissionPerOrder || 1500;
      const commissionEarned = repDelivered.length * commissionRate;

      return {
        rep,
        repId: rep.id,
        isLead: rep.id === selectedTeam.teamLeadId,
        totalOrders: repOrders.length,
        delivered: repDelivered.length,
        conversion,
        revenueNgn,
        commissionEarned,
        orders: repOrders
      };
    });
  }, [selectedTeam, teamOrdersInPeriod, users]);

  // Filtered reps by rep search
  const filteredRepBreakdown = useMemo(() => {
    if (!repSearchQuery.trim()) return repBreakdown;
    const q = repSearchQuery.toLowerCase();
    return repBreakdown.filter(row => 
      row.rep.name.toLowerCase().includes(q) ||
      row.rep.phone.includes(q) ||
      row.rep.email.toLowerCase().includes(q)
    );
  }, [repBreakdown, repSearchQuery]);

  // Teams summary on Screen 1 (Teams List)
  const teamsWithMetrics = useMemo(() => {
    return salesTeams.map(team => {
      const teamOrders = getOrdersForTeam(team, allOrdersInPeriod);
      const teamDelivered = teamOrders.filter(o => o.status === 'DELIVERED');
      const conversion = teamOrders.length > 0 ? Math.round((teamDelivered.length / teamOrders.length) * 100) : 0;
      const revenueNgn = teamDelivered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const activeMembers = team.repIds.length;

      return {
        ...team,
        totalOrders: teamOrders.length,
        delivered: teamDelivered.length,
        conversion,
        revenueNgn,
        activeMembers
      };
    });
  }, [salesTeams, allOrdersInPeriod, users]);

  // Overall organization stats across all teams in period
  const orgTotalOrders = teamsWithMetrics.reduce((sum, t) => sum + t.totalOrders, 0);
  const orgTotalDelivered = teamsWithMetrics.reduce((sum, t) => sum + t.delivered, 0);
  const orgConversion = orgTotalOrders > 0 ? Math.round((orgTotalDelivered / orgTotalOrders) * 100) : 0;
  const topTeam = [...teamsWithMetrics].sort((a, b) => b.delivered - a.delivered)[0];

  // Filtered teams for Screen 1 search
  const filteredTeams = useMemo(() => {
    return teamsWithMetrics.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.teamLeadName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teamsWithMetrics, searchQuery]);

  // Export CSV Handler matching BettaTraka format
  const handleExportCsv = () => {
    const filename = selectedTeam 
      ? `bettatraka_team_performance_${selectedTeam.name.toLowerCase().replace(/\s+/g, '_')}_${selectedPeriod}.csv`
      : `bettatraka_teams_overview_${selectedPeriod}.csv`;

    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (selectedTeam) {
      csvContent += "Sales Representative,Role,Phone,Assigned Orders,Delivered Orders,Conversion Rate,Delivered Revenue (NGN),Est. Commission (NGN)\n";
      repBreakdown.forEach(r => {
        csvContent += `"${r.rep.name}","${r.isLead ? 'Team Lead' : 'Rep'}","${r.rep.phone}",${r.totalOrders},${r.delivered},"${r.conversion}%",${r.revenueNgn},${r.commissionEarned}\n`;
      });
    } else {
      csvContent += "Team Name,Team Lead,Active Members,Assigned Orders,Delivered Orders,Conversion Rate,Delivered Revenue (NGN)\n";
      teamsWithMetrics.forEach(t => {
        csvContent += `"${t.name}","${t.teamLeadName}",${t.activeMembers},${t.totalOrders},${t.delivered},"${t.conversion}%",${t.revenueNgn}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reusable BettaTraka-style Filter Bar Component
  const renderBettaTrakaFilterBar = () => (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date Filter Pills (BettaTraka Signature: bg-white text-black when active) */}
      <div className="flex items-center bg-black/80 p-0.5 rounded-xl border border-neutral-800">
        {(
          [
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'year', label: 'This Year' },
            { key: 'all', label: 'All Time' }
          ] as const
        ).map((item) => {
          const isActive = selectedPeriod === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setSelectedPeriod(item.key);
                setShowDatePicker(false);
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Date Range Modal / Popover Toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
            selectedPeriod === 'custom' || showDatePicker
              ? 'bg-neutral-900 border-neutral-700 text-white'
              : 'bg-black/80 border-neutral-800 text-slate-300 hover:text-white hover:border-neutral-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Date Range</span>
        </button>

        {showDatePicker && (
          <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 p-4 rounded-xl bg-neutral-950 border border-neutral-800 shadow-2xl z-50 w-72 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-semibold text-white">Select Custom Period</span>
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedPeriod('custom');
                  setShowDatePicker(false);
                }}
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                Apply Range
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export CSV Button (BettaTraka Standard) */}
      <button
        type="button"
        onClick={handleExportCsv}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 hover:bg-neutral-900 border border-neutral-800 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer shadow-sm"
        title="Export Report to CSV"
      >
        <Download className="w-3.5 h-3.5 text-slate-400" />
        <span className="hidden sm:inline">Export CSV</span>
      </button>
    </div>
  );

  // =========================================================
  // SCREEN 2: INDIVIDUAL TEAM PERFORMANCE (Screenshot 2: team performance 2.png)
  // =========================================================
  if (selectedTeam) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button 
            type="button"
            onClick={() => setAdminActiveTab('dashboard')}
            className="hover:text-white transition cursor-pointer"
          >
            Dashboard
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <button 
            type="button"
            onClick={() => setSelectedTeamId(null)}
            className="hover:text-white transition cursor-pointer"
          >
            Team Performance
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-white font-bold">{selectedTeam.name}</span>
        </div>

        {/* Header Row: Title & BettaTraka Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {selectedTeam.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-white text-[10px] font-medium flex-shrink-0">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Per-rep breakdown for the selected period • Lead: <span className="text-slate-200 font-medium">{selectedTeam.teamLeadName}</span>
            </p>
          </div>

          {/* BettaTraka Date Filters & Export */}
          {renderBettaTrakaFilterBar()}
        </div>

        {/* 4 KPI Metric Cards in a Row (BettaTraka Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Orders */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
            <p className="text-xs font-medium text-slate-400">Total Orders</p>
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {totalOrders}
            </p>
            <p className="text-[11px] text-slate-500">Orders routed to this squad</p>
          </div>

          {/* Card 2: Total Delivered */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
            <p className="text-xs font-medium text-slate-400">Total Delivered</p>
            <p className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 tracking-tight">
              {deliveredOrders}
            </p>
            <p className="text-[11px] text-slate-500">Doorstep orders delivered</p>
          </div>

          {/* Card 3: Team Conversion */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Team Conversion</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
              {teamConversion}%
            </p>
            <p className="text-[11px] text-slate-500">Delivery completion rate</p>
          </div>

          {/* Card 4: Delivered Revenue */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
            <p className="text-xs font-medium text-slate-400">Delivered Revenue</p>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight truncate">
              {formatCurrency(convertAmount(teamDeliveredRevenue, currency), currency)}
            </p>
            <p className="text-[11px] text-slate-500">Gross completed sales</p>
          </div>
        </div>

        {/* Bottom Section: Table or Empty State (BettaTraka Style) */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-sm space-y-4 p-5">
          {totalOrders === 0 ? (
            /* Exactly matching Screenshot 2: team performance 2.png */
            <div className="min-h-[260px] flex flex-col items-center justify-center p-12 text-center space-y-3">
              <p className="text-sm text-slate-400 font-medium">
                No data for this period.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('month')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-semibold text-white border border-neutral-700 transition cursor-pointer"
                >
                  View This Month
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('all')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition cursor-pointer"
                >
                  View All Time
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Table Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Sales Representatives ({repBreakdown.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    • Performance breakdown by representative
                  </span>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search representative..."
                    value={repSearchQuery}
                    onChange={(e) => setRepSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  {repSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setRepSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Per-Rep Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-900/60 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Sales Representative</th>
                      <th className="py-3 px-4 text-center">Assigned Orders</th>
                      <th className="py-3 px-4 text-center">Delivered</th>
                      <th className="py-3 px-4 text-center">Delivery Rate</th>
                      <th className="py-3 px-4 text-right">Delivered Revenue</th>
                      <th className="py-3 px-4 text-right">Est. Commission</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {filteredRepBreakdown.map((row) => (
                      <tr 
                        key={row.repId}
                        className="hover:bg-neutral-900/40 transition group"
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
                              {row.rep?.name.charAt(0) || 'R'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-white text-xs">
                                  {row.rep?.name || 'Sales Rep'}
                                </p>
                                {row.isLead && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    Lead
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">{row.rep?.phone}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-white font-medium">
                          {row.totalOrders}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-bold">
                          {row.delivered}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold ${row.conversion >= 60 ? 'text-emerald-400' : row.conversion >= 40 ? 'text-amber-400' : 'text-slate-300'}`}>
                              {row.conversion}%
                            </span>
                            <div className="w-12 h-1.5 rounded-full bg-neutral-800 overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full rounded-full ${row.conversion >= 60 ? 'bg-emerald-500' : row.conversion >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                style={{ width: `${Math.min(row.conversion, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white tabular-nums">
                          {formatCurrency(convertAmount(row.revenueNgn, currency), currency)}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-medium tabular-nums">
                          ₦{row.commissionEarned.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-[10px] font-medium">
                            Active
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingRepOrders({
                              repName: row.rep.name,
                              repId: row.repId,
                              orders: row.orders
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] font-medium text-slate-300 hover:text-white transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-sky-400" />
                            <span>Orders</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Modal: View Assigned Orders for a Rep */}
        {viewingRepOrders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Orders for {viewingRepOrders.repName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {viewingRepOrders.orders.length} order(s) attributed to this rep in {selectedTeam.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingRepOrders(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {viewingRepOrders.orders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No orders assigned in this selected timeframe.
                  </p>
                ) : (
                  viewingRepOrders.orders.map(order => (
                    <div 
                      key={order.id}
                      className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{order.orderNumber}</span>
                          <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                            order.status === 'DELIVERED' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium mt-1">{order.customerName} • {order.customerPhone}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{order.deliveryCity}, {order.deliveryState}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-mono font-bold text-white">
                          {formatCurrency(convertAmount(order.totalAmount, currency), currency)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-neutral-800 flex justify-end flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setViewingRepOrders(null)}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================
  // SCREEN 1: TEAMS LIST (Screenshot 1: team performance.png)
  // =========================================================
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in select-none">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <button 
          type="button"
          onClick={() => setAdminActiveTab('dashboard')}
          className="hover:text-white transition cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white font-bold">Team Performance</span>
      </div>

      {/* Top Header & BettaTraka Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Team Performance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate performance across regional squads, team leads, and conversion metrics
          </p>
        </div>

        {/* BettaTraka Date Filters & Export */}
        {renderBettaTrakaFilterBar()}
      </div>

      {/* Top Summary Metrics Cards (Company-Wide Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Assigned Orders</p>
          <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {orgTotalOrders}
          </p>
          <p className="text-[11px] text-slate-500">Across all {salesTeams.length} active teams</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Completed Deliveries</p>
          <p className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400 tracking-tight">
            {orgTotalDelivered}
          </p>
          <p className="text-[11px] text-slate-500">Successfully delivered to customers</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Overall Conversion</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {orgConversion}%
          </p>
          <p className="text-[11px] text-slate-500">Organization delivery efficiency</p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Top Performing Unit</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-white truncate" title={topTeam?.name || 'None'}>
            {topTeam?.name || 'None yet'}
          </p>
          <p className="text-[11px] text-slate-500">
            {topTeam ? `${topTeam.delivered} deliveries (${topTeam.conversion}%)` : 'No data'}
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search team or team lead..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-7 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setAdminActiveTab('sales-teams')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
        >
          <span>Manage Teams</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Teams Grid (Matching Screenshot 1: team performance.png with BettaTraka aesthetics) */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">No sales teams found</p>
          <p className="text-xs text-slate-400">
            Create sales teams to start tracking rep conversion and doorstep performance.
          </p>
          <button
            type="button"
            onClick={() => setAdminActiveTab('sales-teams')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition cursor-pointer mt-2"
          >
            <span>Go to Sales Teams</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => {
            return (
              <div
                key={team.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4 hover:border-neutral-700 transition shadow-sm flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Card Header: Team Name & Active Pill (Screenshot 1) */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white truncate" title={team.name}>
                      {team.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-white text-[10px] font-medium flex-shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Card Middle: Active Members Count & Lead (Screenshot 1) */}
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span>{team.activeMembers} active member{team.activeMembers !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Lead: <span className="text-slate-300 font-medium">{team.teamLeadName}</span>
                    </p>
                  </div>

                  {/* Period Stats Row */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Orders</span>
                      <span className="font-mono text-xs font-bold text-white">{team.totalOrders}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Delivered</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">{team.delivered}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Conversion</span>
                      <span className="font-mono text-xs font-bold text-white">{team.conversion}%</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: View performance link (Screenshot 1: text-sky-400) */}
                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTeamId(team.id);
                    }}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer transition"
                  >
                    <span>View performance</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>

                  <span className="text-[10px] font-mono text-slate-500">
                    {formatCurrency(convertAmount(team.revenueNgn, currency), currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
