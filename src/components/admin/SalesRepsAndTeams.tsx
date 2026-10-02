import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { formatCurrency, convertAmount } from '../../utils/formatters';
import { User, SalesTeam, PayStructure } from '../../types/crm';
import { 
  Trophy, 
  Users, 
  Building2, 
  Award, 
  TrendingUp, 
  Phone, 
  Mail, 
  CheckCircle2, 
  PauseCircle, 
  Plus,
  ShieldCheck,
  UserPlus,
  UserMinus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  Layers,
  Megaphone,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export const SalesRepsView: React.FC = () => {
  const { users, orders, currency, updateUser } = useCrm();

  const reps = users.filter(u => u.role === 'Sales Representative');
  
  // Calculate performance per rep
  const repStats = reps.map(rep => {
    const assignedOrders = orders.filter(o => o.salesRepId === rep.id);
    const deliveredOrders = assignedOrders.filter(o => o.status === 'DELIVERED');
    const revenueNgn = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const conversion = assignedOrders.length > 0 
      ? Math.round((deliveredOrders.length / assignedOrders.length) * 100) 
      : 0;

    return {
      rep,
      totalOrders: assignedOrders.length,
      deliveredOrders: deliveredOrders.length,
      conversion,
      revenueNgn
    };
  }).sort((a, b) => b.conversion - a.conversion);

  const avgConversion = repStats.length > 0 
    ? Math.round(repStats.reduce((sum, r) => sum + r.conversion, 0) / repStats.length) 
    : 0;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Sales Representatives & Leaderboard
          <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
            {reps.length} reps active
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor rep conversion rates, delivery confirmations, and commission leaderboards.
        </p>
      </div>

      {/* 4 Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Reps</p>
          <p className="text-2xl font-bold font-mono text-white tabular-nums">{reps.length}</p>
          <p className="text-[11px] text-slate-500">In rotation sequence</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Active Reps</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {reps.filter(r => r.status === 'Active').length}
          </p>
          <p className="text-[11px] text-slate-500">Handling orders today</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Total Handled</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
            {repStats.reduce((sum, r) => sum + r.totalOrders, 0)} orders
          </p>
          <p className="text-[11px] text-slate-500">Assigned across reps</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <p className="text-xs text-slate-400">Avg Rep Conversion</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{avgConversion}%</p>
          <p className="text-[11px] text-slate-500">Order to doorstep collection</p>
        </div>
      </div>

      {/* Performance Leaderboard */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">Monthly Rep Conversion Leaderboard</h2>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            🏆 ₦50,000 Top Performer Bonus Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {repStats.slice(0, 4).map((r, idx) => (
            <div 
              key={r.rep.id} 
              className={`p-4 rounded-xl border relative overflow-hidden ${
                idx === 0 
                  ? 'border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-950/30' 
                  : 'border-slate-800 bg-slate-950/60'
              }`}
            >
              {idx === 0 && (
                <span className="absolute top-2 right-2 text-xs font-mono font-bold text-amber-400 bg-amber-950 border border-amber-800/80 px-2 py-0.5 rounded">
                  🥇 1st Place
                </span>
              )}
              {idx === 1 && (
                <span className="absolute top-2 right-2 text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                  🥈 2nd
                </span>
              )}
              {idx === 2 && (
                <span className="absolute top-2 right-2 text-xs font-mono font-bold text-amber-700 bg-slate-800 px-2 py-0.5 rounded">
                  🥉 3rd
                </span>
              )}

              <p className="font-semibold text-white text-sm">{r.rep.name}</p>
              <p className="text-[11px] text-slate-400">{r.rep.email}</p>

              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Conversion Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">{r.conversion}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Delivered Orders:</span>
                  <span className="font-mono font-medium text-white">{r.deliveredOrders} / {r.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Revenue Generated:</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(convertAmount(r.revenueNgn, currency), currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reps Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 font-medium">Sales Rep Details</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Pay Structure</th>
                <th className="py-3 px-4 font-medium text-center">Total Orders</th>
                <th className="py-3 px-4 font-medium text-center">Delivered</th>
                <th className="py-3 px-4 font-medium text-center">Conversion %</th>
                <th className="py-3 px-4 font-medium text-right">Revenue Generated</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {repStats.map(({ rep, totalOrders, deliveredOrders, conversion, revenueNgn }) => (
                <tr key={rep.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{rep.name}</p>
                    <p className="text-[11px] text-slate-400">{rep.email} · {rep.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => updateUser(rep.id, { status: rep.status === 'Active' ? 'Paused' : 'Active' })}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        rep.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-amber-950 text-amber-400 border border-amber-800/60'
                      }`}
                      title="Click to toggle status"
                    >
                      {rep.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">
                    {rep.payStructure} ({rep.commissionPerOrder ? `₦${rep.commissionPerOrder}/order` : 'Fixed'})
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-white font-medium">{totalOrders}</td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-400 font-bold">{deliveredOrders}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-white">{conversion}%</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white tabular-nums">
                    {formatCurrency(convertAmount(revenueNgn, currency), currency)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Viewing detailed call logs & follow-ups for ${rep.name}`)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const SalesTeamsView: React.FC = () => {
  const { 
    salesTeams, 
    users, 
    products, 
    mediaBuyers, 
    addSalesTeam, 
    updateSalesTeam, 
    deleteSalesTeam, 
    addRepToTeam, 
    removeRepFromTeam,
    addUser,
    addNotification
  } = useCrm();

  // Modals state
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [selectedTeamForReps, setSelectedTeamForReps] = useState<SalesTeam | null>(null);
  const [selectedTeamForLinks, setSelectedTeamForLinks] = useState<SalesTeam | null>(null);
  const [selectedTeamForEdit, setSelectedTeamForEdit] = useState<SalesTeam | null>(null);

  // Search & filter state
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [repModalSearch, setRepModalSearch] = useState('');
  const [repModalTab, setRepModalTab] = useState<'assign' | 'create'>('assign');
  const [repScopeFilter, setRepScopeFilter] = useState<'reps_only' | 'all_staff'>('reps_only');

  // Quick inline rep adder state per team card
  const [quickRepToAdd, setQuickRepToAdd] = useState<{ [teamId: string]: string }>({});

  // Inline Create Rep Form state
  const [newRepName, setNewRepName] = useState('');
  const [newRepPhone, setNewRepPhone] = useState('');
  const [newRepEmail, setNewRepEmail] = useState('');
  const [newRepPayStructure, setNewRepPayStructure] = useState<PayStructure>('Hybrid');
  const [newRepCommission, setNewRepCommission] = useState<number>(1500);
  const [newRepSalary, setNewRepSalary] = useState<number>(75000);

  // Create Team form state
  const eligibleReps = users.filter(u => u.role === 'Sales Representative');
  const [teamName, setTeamName] = useState('');
  const [leadId, setLeadId] = useState(eligibleReps[0]?.id || users[0]?.id || '');
  const [selectedRepIds, setSelectedRepIds] = useState<string[]>([eligibleReps[0]?.id || '']);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(['prod-1', 'prod-2']);
  const [selectedMediaBuyerIds, setSelectedMediaBuyerIds] = useState<string[]>([]);

  // Edit Team form state
  const [editTeamName, setEditTeamName] = useState('');
  const [editLeadId, setEditLeadId] = useState('');

  // Configure Links state
  const [linksProductIds, setLinksProductIds] = useState<string[]>([]);
  const [linksMediaBuyerIds, setLinksMediaBuyerIds] = useState<string[]>([]);

  // When changing team lead during creation, ensure lead is in repIds
  const handleLeadChange = (newLeadId: string) => {
    setLeadId(newLeadId);
    if (!selectedRepIds.includes(newLeadId)) {
      setSelectedRepIds(prev => [...prev, newLeadId]);
    }
  };

  const handleToggleRepInCreate = (repId: string) => {
    if (selectedRepIds.includes(repId)) {
      if (repId === leadId) return; // Lead cannot be removed
      setSelectedRepIds(prev => prev.filter(id => id !== repId));
    } else {
      setSelectedRepIds(prev => [...prev, repId]);
    }
  };

  const handleToggleProductInCreate = (prodId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    const lead = users.find(u => u.id === leadId);
    const finalReps = Array.from(new Set([leadId, ...selectedRepIds]));

    addSalesTeam({
      name: teamName.trim(),
      teamLeadId: leadId,
      teamLeadName: lead?.name || 'Lead',
      repIds: finalReps,
      productLinks: selectedProductIds,
      mediaBuyerLinks: selectedMediaBuyerIds
    });

    if (addNotification) {
      addNotification({
        title: 'Sales Team Created',
        message: `Team "${teamName.trim()}" created with ${finalReps.length} sales rep(s).`,
        type: 'success'
      });
    }

    setShowAddTeam(false);
    setTeamName('');
    setSelectedRepIds([leadId]);
    setSelectedProductIds(['prod-1', 'prod-2']);
    setSelectedMediaBuyerIds([]);
  };

  const handleCreateAndAssignRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeManagingTeam || !newRepName.trim() || !newRepPhone.trim()) return;

    const createdRep = addUser({
      name: newRepName.trim(),
      phone: newRepPhone.trim(),
      email: newRepEmail.trim() || `${newRepName.toLowerCase().replace(/\s+/g, '.')}@apexbrands.ng`,
      role: 'Sales Representative',
      status: 'Active',
      payStructure: newRepPayStructure,
      commissionPerOrder: newRepPayStructure !== 'Fixed' ? Number(newRepCommission) : 0,
      fixedSalary: newRepPayStructure !== 'Commission' ? Number(newRepSalary) : 0,
      teamId: activeManagingTeam.id
    });

    addRepToTeam(activeManagingTeam.id, createdRep.id);

    if (addNotification) {
      addNotification({
        title: 'Sales Rep Registered & Assigned',
        message: `${createdRep.name} was successfully registered and added to ${activeManagingTeam.name}.`,
        type: 'success'
      });
    }

    setNewRepName('');
    setNewRepPhone('');
    setNewRepEmail('');
    setRepModalTab('assign');
  };

  const handleOpenEdit = (team: SalesTeam) => {
    setSelectedTeamForEdit(team);
    setEditTeamName(team.name);
    setEditLeadId(team.teamLeadId);
  };

  const handleSaveEditTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForEdit || !editTeamName.trim()) return;
    const lead = users.find(u => u.id === editLeadId);
    
    // Ensure new lead is part of repIds
    const updatedRepIds = Array.from(new Set([editLeadId, ...selectedTeamForEdit.repIds]));

    updateSalesTeam(selectedTeamForEdit.id, {
      name: editTeamName.trim(),
      teamLeadId: editLeadId,
      teamLeadName: lead?.name || 'Lead',
      repIds: updatedRepIds
    });

    setSelectedTeamForEdit(null);
  };

  const handleOpenLinks = (team: SalesTeam) => {
    setSelectedTeamForLinks(team);
    setLinksProductIds([...team.productLinks]);
    setLinksMediaBuyerIds([...team.mediaBuyerLinks]);
  };

  const handleSaveLinks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamForLinks) return;
    updateSalesTeam(selectedTeamForLinks.id, {
      productLinks: linksProductIds,
      mediaBuyerLinks: linksMediaBuyerIds
    });
    setSelectedTeamForLinks(null);
  };

  const handleDeleteTeam = (team: SalesTeam) => {
    if (confirm(`Are you sure you want to delete sales team "${team.name}"? Active reps will remain unassigned.`)) {
      deleteSalesTeam(team.id);
    }
  };

  // Filter teams by search
  const filteredTeams = salesTeams.filter(t => 
    t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
    t.teamLeadName.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );

  // Active team currently being managed for reps
  const activeManagingTeam = selectedTeamForReps 
    ? salesTeams.find(t => t.id === selectedTeamForReps.id) || selectedTeamForReps
    : null;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Sales Teams & Territorial Units
            <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
              {salesTeams.length} teams active
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Group sales reps into regional squads, assign team leads, and route products and media buyer traffic.
          </p>
        </div>

        <button
          onClick={() => {
            const firstRep = eligibleReps[0]?.id || users[0]?.id || '';
            setLeadId(firstRep);
            setSelectedRepIds([firstRep]);
            setShowAddTeam(true);
          }}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white transition shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create Sales Team</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search team or team lead..."
          value={teamSearchQuery}
          onChange={(e) => setTeamSearchQuery(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
        {teamSearchQuery && (
          <button 
            onClick={() => setTeamSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sales Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-12 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">No sales teams found</p>
          <p className="text-xs text-slate-400">Click "Create Sales Team" to organize reps into territorial squads.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeams.map((team) => {
            const repsInTeam = users.filter(u => team.repIds.includes(u.id));

            return (
              <div 
                key={team.id} 
                className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 space-y-4 shadow-lg hover:border-neutral-700 transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Team Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-800/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm truncate" title={team.name}>
                          {team.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 truncate">
                          Lead: <span className="text-slate-200 font-medium">{team.teamLeadName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                        {team.repIds.length} Rep{team.repIds.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(team)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                        title="Edit Team"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition cursor-pointer"
                        title="Delete Team"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Team Reps Roster with "+ Add Rep" Button */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-sky-400" />
                        <span>Assigned Reps ({repsInTeam.length})</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Direct + Add Rep Trigger (Assign Tab) */}
                        <button
                          type="button"
                          onClick={() => {
                            setRepModalSearch('');
                            setRepModalTab('assign');
                            setSelectedTeamForReps(team);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/70 px-2 py-0.5 rounded-lg transition cursor-pointer"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>+ Add Rep</span>
                        </button>

                        {/* Direct Register New Rep Trigger (Create Tab) */}
                        <button
                          type="button"
                          onClick={() => {
                            setRepModalTab('create');
                            setSelectedTeamForReps(team);
                          }}
                          className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/70 border border-sky-800/60 px-2 py-0.5 rounded-lg transition cursor-pointer"
                          title="Register a new rep and add to this team"
                        >
                          <Plus className="w-3 h-3" />
                          <span>New Rep</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-thin">
                      {repsInTeam.length === 0 ? (
                        <div className="py-2 text-center space-y-1.5">
                          <p className="text-slate-500 text-[11px]">No reps assigned yet.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setRepModalSearch('');
                              setRepModalTab('assign');
                              setSelectedTeamForReps(team);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:underline"
                          >
                            <UserPlus className="w-3 h-3" />
                            <span>Add first rep</span>
                          </button>
                        </div>
                      ) : (
                        repsInTeam.map(r => (
                          <div 
                            key={r.id}
                            className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-neutral-800/60 transition group"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                                {r.name.charAt(0)}
                              </div>
                              <span className="truncate text-slate-200 text-xs" title={r.name}>
                                {r.name}
                              </span>
                              {r.id === team.teamLeadId && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                                  Lead
                                </span>
                              )}
                            </div>

                            {r.id !== team.teamLeadId && (
                              <button
                                type="button"
                                onClick={() => {
                                  removeRepFromTeam(team.id, r.id);
                                  if (addNotification) {
                                    addNotification({
                                      title: 'Rep Removed',
                                      message: `Removed ${r.name} from ${team.name}.`,
                                      type: 'info'
                                    });
                                  }
                                }}
                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition p-0.5 cursor-pointer"
                                title={`Remove ${r.name} from team`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Quick Inline Add Rep Selector right on the card */}
                    {users.some(u => !team.repIds.includes(u.id) && (u.role === 'Sales Representative' || u.role === 'Manager')) && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <select
                          value={quickRepToAdd[team.id] || ''}
                          onChange={(e) => setQuickRepToAdd(prev => ({ ...prev, [team.id]: e.target.value }))}
                          className="flex-1 bg-neutral-900 border border-neutral-700/80 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="">Quick assign existing rep...</option>
                          {users
                            .filter(u => !team.repIds.includes(u.id) && (u.role === 'Sales Representative' || u.role === 'Manager'))
                            .map(u => (
                              <option key={u.id} value={u.id}>
                                {u.name} ({u.role})
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          disabled={!quickRepToAdd[team.id]}
                          onClick={() => {
                            const repId = quickRepToAdd[team.id];
                            if (repId) {
                              addRepToTeam(team.id, repId);
                              setQuickRepToAdd(prev => ({ ...prev, [team.id]: '' }));
                              if (addNotification) {
                                const repObj = users.find(u => u.id === repId);
                                addNotification({
                                  title: 'Rep Added to Team',
                                  message: `Added ${repObj?.name || 'rep'} to ${team.name}.`,
                                  type: 'success'
                                });
                              }
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white text-[11px] font-semibold transition cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product & Media Buyer Routing Tags */}
                  <div className="space-y-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 text-[11px] block font-medium">Eligible Products:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {team.productLinks.length === 0 ? (
                          <span className="text-slate-500 text-[10px]">All products</span>
                        ) : (
                          team.productLinks.map(pId => {
                            const prod = products.find(p => p.id === pId);
                            return (
                              <span key={pId} className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] text-slate-300">
                                {prod?.name.split(' ')[0] || 'Product'}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px] block font-medium">Routed Media Buyers:</span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {team.mediaBuyerLinks.length > 0 
                          ? `${team.mediaBuyerLinks.length} media buyer(s) connected` 
                          : 'General ad traffic'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Team Card Bottom Controls */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRepModalSearch('');
                      setRepModalTab('assign');
                      setSelectedTeamForReps(team);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manage Reps</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenLinks(team)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-slate-300 hover:text-white text-xs font-medium transition cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-sky-400" />
                    <span>Configure Links</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          MODAL 1: ADD / MANAGE SALES REPS IN TEAM (Dual Tab)
          ========================================================= */}
      {activeManagingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl p-6 text-slate-100 space-y-4 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Manage Team: {activeManagingTeam.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Lead: <span className="text-white font-medium">{activeManagingTeam.teamLeadName}</span> • {activeManagingTeam.repIds.length} rep(s) assigned
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTeamForReps(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl flex-shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setRepModalTab('assign')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  repModalTab === 'assign'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Assign Existing Reps</span>
              </button>
              <button
                type="button"
                onClick={() => setRepModalTab('create')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  repModalTab === 'create'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Register New Rep & Add</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {repModalTab === 'assign' ? (
                <div className="space-y-3">
                  {/* Search & Filter Toolbar */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search rep by name, phone or email..."
                        value={repModalSearch}
                        onChange={(e) => setRepModalSearch(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Filter Staff:</span>
                      <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setRepScopeFilter('reps_only')}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                            repScopeFilter === 'reps_only' ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Sales Reps & Leads
                        </button>
                        <button
                          type="button"
                          onClick={() => setRepScopeFilter('all_staff')}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                            repScopeFilter === 'all_staff' ? 'bg-neutral-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          All Company Staff
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Available Reps to Add */}
                  {(() => {
                    const pool = repScopeFilter === 'reps_only'
                      ? users.filter(u => u.role === 'Sales Representative')
                      : users;

                    const availableReps = pool.filter(u => 
                      !activeManagingTeam.repIds.includes(u.id) &&
                      (u.name.toLowerCase().includes(repModalSearch.toLowerCase()) || 
                       u.phone.includes(repModalSearch) ||
                       u.email.toLowerCase().includes(repModalSearch.toLowerCase()))
                    );

                    if (availableReps.length === 0) {
                      return (
                        <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center space-y-2.5">
                          <p className="text-xs text-slate-400">
                            {repModalSearch 
                              ? 'No available reps match your search query.' 
                              : 'All registered sales reps are already in this team!'}
                          </p>
                          <button
                            type="button"
                            onClick={() => setRepModalTab('create')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Register a New Sales Rep Now</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1">
                          <span>Available to Add ({availableReps.length})</span>
                          <span>Click to assign</span>
                        </div>
                        {availableReps.map(rep => (
                          <div 
                            key={rep.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                {rep.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-white text-xs truncate">{rep.name}</p>
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-slate-300 border border-neutral-700">
                                    {rep.role}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <Phone className="w-2.5 h-2.5" />
                                  <span>{rep.phone}</span>
                                  {rep.commissionPerOrder ? <span>• ₦{rep.commissionPerOrder}/order</span> : null}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                addRepToTeam(activeManagingTeam.id, rep.id);
                                if (addNotification) {
                                  addNotification({
                                    title: 'Rep Added to Team',
                                    message: `Added ${rep.name} to ${activeManagingTeam.name}.`,
                                    type: 'success'
                                  });
                                }
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                              <span>Add to Team</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Tab 2: Create New Sales Rep Inline Form */
                <form onSubmit={handleCreateAndAssignRep} className="space-y-3 p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs">
                  <div className="pb-1 border-b border-neutral-800">
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Register New Sales Rep Directly into {activeManagingTeam.name}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Creates the user profile and assigns them immediately to this team.
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blessing Okafor"
                      value={newRepName}
                      onChange={(e) => setNewRepName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Phone Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="+234 812 345 6789"
                        value={newRepPhone}
                        onChange={(e) => setNewRepPhone(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Work Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="rep@apexbrands.ng"
                        value={newRepEmail}
                        onChange={(e) => setNewRepEmail(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Pay Structure</label>
                    <select
                      value={newRepPayStructure}
                      onChange={(e) => setNewRepPayStructure(e.target.value as PayStructure)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Hybrid">Hybrid (Base Salary + Commission)</option>
                      <option value="Commission">Commission Only (Pay per delivery)</option>
                      <option value="Fixed">Fixed Monthly Salary</option>
                      <option value="Performance-based">Performance-based Tier</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {newRepPayStructure !== 'Fixed' && (
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Commission per Delivered Order (₦)</label>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={newRepCommission}
                          onChange={(e) => setNewRepCommission(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                    {newRepPayStructure !== 'Commission' && (
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Base Monthly Salary (₦)</label>
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={newRepSalary}
                          onChange={(e) => setNewRepSalary(Number(e.target.value))}
                          className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRepModalTab('assign')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-medium cursor-pointer"
                    >
                      Back to Existing
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white shadow cursor-pointer"
                    >
                      Register & Add to Team
                    </button>
                  </div>
                </form>
              )}

              {/* Section B: Currently Assigned Reps in this Team */}
              <div className="space-y-2 pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>Current Squad Members ({activeManagingTeam.repIds.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Lead: {activeManagingTeam.teamLeadName}</span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                  {activeManagingTeam.repIds.map(repId => {
                    const rep = users.find(u => u.id === repId);
                    if (!rep) return null;
                    const isLead = rep.id === activeManagingTeam.teamLeadId;

                    return (
                      <div 
                        key={rep.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-neutral-700/80 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 ${
                            isLead 
                              ? 'bg-amber-950 border border-amber-800/80 text-amber-300' 
                              : 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                          }`}>
                            {rep.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-white text-xs truncate">{rep.name}</p>
                              {isLead && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  Team Lead
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{rep.phone}</span>
                              {rep.commissionPerOrder ? <span>• ₦{rep.commissionPerOrder}/order</span> : null}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {!isLead ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  updateSalesTeam(activeManagingTeam.id, {
                                    teamLeadId: rep.id,
                                    teamLeadName: rep.name
                                  });
                                  if (addNotification) {
                                    addNotification({
                                      title: 'Team Lead Changed',
                                      message: `${rep.name} is now the leader of ${activeManagingTeam.name}.`,
                                      type: 'info'
                                    });
                                  }
                                }}
                                className="px-2 py-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
                                title="Promote to Team Lead"
                              >
                                Make Lead
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  removeRepFromTeam(activeManagingTeam.id, rep.id);
                                  if (addNotification) {
                                    addNotification({
                                      title: 'Rep Removed',
                                      message: `Removed ${rep.name} from ${activeManagingTeam.name}.`,
                                      type: 'info'
                                    });
                                  }
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-800/60 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 text-xs transition cursor-pointer"
                                title="Remove rep from this team"
                              >
                                <UserMinus className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-amber-400/90 font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                              Current Lead
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between flex-shrink-0">
              <span className="text-[11px] text-slate-500">
                {activeManagingTeam.repIds.length} member(s) total
              </span>
              <button
                type="button"
                onClick={() => setSelectedTeamForReps(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer shadow"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: CREATE NEW SALES TEAM (With Sales Rep Picker)
          ========================================================= */}
      {showAddTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl p-6 text-slate-100 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 flex-shrink-0">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Create New Sales Team
              </h3>
              <button 
                onClick={() => setShowAddTeam(false)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs flex-1 overflow-y-auto pr-1">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eastern Tigers Unit / Lagos Alpha Squad"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Assigned Team Lead *</label>
                <select
                  value={leadId}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {eligibleReps.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role}) — {u.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multi-Select Sales Reps for New Team */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-300 font-semibold block">
                    Select Sales Reps to Add ({selectedRepIds.length} selected)
                  </label>
                  <span className="text-[10px] text-slate-500">Check reps to include</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 max-h-44 overflow-y-auto scrollbar-thin">
                  {eligibleReps.map(rep => {
                    const isChecked = selectedRepIds.includes(rep.id);
                    const isLead = rep.id === leadId;

                    return (
                      <label 
                        key={rep.id} 
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                          isChecked ? 'bg-neutral-800/80 border border-neutral-700' : 'hover:bg-neutral-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isLead}
                            onChange={() => handleToggleRepInCreate(rep.id)}
                            className="accent-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-white text-xs block truncate">{rep.name}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{rep.phone}</span>
                          </div>
                        </div>

                        {isLead && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex-shrink-0">
                            Leader
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Product Routing Checkboxes */}
              <div className="space-y-2">
                <label className="text-[11px] text-slate-300 font-semibold block">
                  Eligible Products for this Team
                </label>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-[11px] text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.includes(p.id)}
                        onChange={() => handleToggleProductInCreate(p.id)}
                        className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate">{p.name.split(' ')[0]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2 flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setShowAddTeam(false)} 
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition shadow shadow-emerald-950"
                >
                  Create Team with {selectedRepIds.length} Reps
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: CONFIGURE PRODUCT & MEDIA BUYER LINKS
          ========================================================= */}
      {selectedTeamForLinks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                Configure Links: {selectedTeamForLinks.name}
              </h3>
              <button 
                onClick={() => setSelectedTeamForLinks(null)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLinks} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 block font-semibold">Eligible Products</label>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 max-h-40 overflow-y-auto">
                  {products.map(p => {
                    const isChecked = linksProductIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setLinksProductIds(prev => 
                              prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className="accent-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span>{p.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-slate-400 block font-semibold">Routed Media Buyers</label>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 max-h-40 overflow-y-auto">
                  {mediaBuyers.length === 0 ? (
                    <p className="text-slate-500 text-[11px]">No external media buyers configured yet.</p>
                  ) : (
                    mediaBuyers.map(mb => {
                      const isChecked = linksMediaBuyerIds.includes(mb.id);
                      return (
                        <label key={mb.id} className="flex items-center gap-2 text-xs text-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setLinksMediaBuyerIds(prev => 
                                prev.includes(mb.id) ? prev.filter(id => id !== mb.id) : [...prev, mb.id]
                              );
                            }}
                            className="accent-emerald-500 w-4 h-4 cursor-pointer"
                          />
                          <span>{mb.name} ({mb.trafficPlatform})</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedTeamForLinks(null)} 
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition shadow"
                >
                  Save Links
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: EDIT TEAM NAME / LEAD
          ========================================================= */}
      {selectedTeamForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl p-6 text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                Edit Team: {selectedTeamForEdit.name}
              </h3>
              <button 
                onClick={() => setSelectedTeamForEdit(null)} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeam} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Assigned Team Lead</label>
                <select
                  value={editLeadId}
                  onChange={(e) => setEditLeadId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  {eligibleReps.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedTeamForEdit(null)} 
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white transition shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
