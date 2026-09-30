import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { User, UserRole, ManagerPermissions } from '../../types/crm';
import { 
  Shield, 
  Upload, 
  UserPlus, 
  Users, 
  UserCheck, 
  Search, 
  ChevronDown, 
  MoreHorizontal, 
  X, 
  Check, 
  Lock, 
  Edit3, 
  Trash2, 
  Key, 
  LayoutGrid, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { 
    users, 
    addUser, 
    updateUser, 
    deleteUser, 
    salesTeams, 
    addNotification 
  } = useCrm();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All Roles');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');

  // Checkbox selection
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Modals & Drawers
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [showDefaultPermissionsModal, setShowDefaultPermissionsModal] = useState(false);
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  // Default permissions state
  const [defaultManagerPerms, setDefaultManagerPerms] = useState<ManagerPermissions>({
    sales: { orders: false, salesReps: false, teamPerformance: false, customers: false, deliveries: false },
    operations: { deliveryAgents: false, inventory: false, roundRobin: false },
    finance: { expenses: false, reports: false, orderReports: false, remittances: false, mediaBuyers: false, payroll: false },
    admin: { users: false, notifications: false, orderFormBuilder: false, adTracker: false, aiAgent: false, subscription: false, settings: false }
  });

  const [defaultRepPerms, setDefaultRepPerms] = useState<{ [key: string]: boolean }>({
    orders: true,
    customers: false,
    deliveries: true,
    commissionTracking: true,
    teamLeaderboard: false
  });

  // Calculate count of manager pages & rep pages
  const managerPagesCount = useMemo(() => {
    let count = 0;
    Object.values(defaultManagerPerms).forEach(group => {
      Object.values(group).forEach(val => {
        if (val) count++;
      });
    });
    return count;
  }, [defaultManagerPerms]);

  const repPagesCount = useMemo(() => {
    return Object.values(defaultRepPerms).filter(Boolean).length;
  }, [defaultRepPerms]);

  // Metric KPI Cards
  const totalUsers = users.length;
  const activeUsers = useMemo(() => users.filter(u => u.status === 'Active').length, [users]);
  const inactiveUsers = totalUsers - activeUsers;
  
  // New users this month
  const newUsersMonth = useMemo(() => {
    const currentMonth = '2026-09';
    return users.filter(u => u.createdAt && u.createdAt.startsWith(currentMonth)).length || (users.length > 0 ? 1 : 0);
  }, [users]);

  // Role Breakdown for Role Distribution Donut Chart
  const roleCounts = useMemo(() => {
    const counts = {
      salesReps: 0,
      admins: 0,
      teamLeads: 0,
      accountants: 0,
      managers: 0,
      inventoryManagers: 0
    };

    users.forEach(u => {
      if (u.role === 'Sales Representative') counts.salesReps++;
      else if (u.role === 'Admin' || u.role === 'Owner') counts.admins++;
      else if (u.role === 'Team Lead') counts.teamLeads++;
      else if (u.role === 'Accountant') counts.accountants++;
      else if (u.role === 'Manager') counts.managers++;
      else if (u.role === 'Inventory Manager') counts.inventoryManagers++;
    });

    return counts;
  }, [users]);

  const rolePercentages = useMemo(() => {
    const total = totalUsers || 1;
    return {
      salesReps: Math.round((roleCounts.salesReps / total) * 100),
      admins: Math.round((roleCounts.admins / total) * 100),
      teamLeads: Math.round((roleCounts.teamLeads / total) * 100),
      accountants: Math.round((roleCounts.accountants / total) * 100),
      managers: Math.round((roleCounts.managers / total) * 100),
      inventoryManagers: Math.round((roleCounts.inventoryManagers / total) * 100)
    };
  }, [roleCounts, totalUsers]);

  // Filtered Users for table
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      // Role filter
      if (selectedRoleFilter !== 'All Roles') {
        if (selectedRoleFilter === 'Admin' && u.role !== 'Admin' && u.role !== 'Owner') return false;
        if (selectedRoleFilter !== 'Admin' && u.role !== selectedRoleFilter) return false;
      }
      // Status filter
      if (selectedStatusFilter !== 'All Status') {
        if (selectedStatusFilter === 'Active' && u.status !== 'Active') return false;
        if (selectedStatusFilter === 'Inactive' && u.status === 'Active') return false;
      }
      return true;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  // Checkbox select all / individual
  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id));

  const handleToggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle user active status (iOS switch)
  const handleToggleUserStatus = (user: User) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateUser(user.id, { status: newStatus });
    if (addNotification) {
      addNotification({
        title: 'Status Updated',
        message: `${user.name} is now ${newStatus}`,
        type: 'info'
      });
    }
  };

  // Export Data CSV
  const handleExportData = () => {
    const headers = ['User ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
    const rows = filteredUsers.map(u => [
      `"${u.id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ordello-users-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date helper (e.g. "Sep 25, 2026")
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Sep 25, 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            User Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage company-wide user roles, permissions, and security settings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Data</span>
          </button>

          {/* Add User Button */}
          <button
            onClick={() => setShowAddUserModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* 2. Default Permissions Banner Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Default Permissions</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Set the baseline pages each role can access — overridable per user
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Manager pages count badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 font-mono">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
            <span>{managerPagesCount} manager pages</span>
          </div>

          {/* Rep pages count badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-slate-300 font-mono">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{repPagesCount} rep pages</span>
          </div>

          {/* Configure button */}
          <button
            onClick={() => setShowDefaultPermissionsModal(true)}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            <span>Configure</span>
            <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* 3. 3 Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* TOTAL USERS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL USERS
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {totalUsers}
          </div>
        </div>

        {/* ACTIVE USERS */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              ACTIVE USERS
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {activeUsers}
          </div>
          <div className="text-xs text-slate-400 pt-0.5">
            {inactiveUsers} inactive
          </div>
        </div>

        {/* NEW USERS (MONTH) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              NEW USERS (MONTH)
            </span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white font-mono">
            {newUsersMonth}
          </div>
        </div>
      </div>

      {/* 4. Analytics Section: User Growth & Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* User Growth Line Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">User Growth</h3>
            <p className="text-xs text-slate-400 mt-0.5">Growth trend over the last 6 months</p>
          </div>

          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
              {/* Dashed Grid Lines & Y-ticks */}
              {[
                { label: '1', y: 15 },
                { label: '0.75', y: 45 },
                { label: '0.5', y: 75 },
                { label: '0.25', y: 105 },
                { label: '0', y: 135 }
              ].map((tick, idx) => (
                <g key={idx}>
                  <text x="5" y={tick.y + 3} fill="#64748b" fontSize="10" fontFamily="monospace">
                    {tick.label}
                  </text>
                  <line
                    x1="45"
                    y1={tick.y}
                    x2="495"
                    y2={tick.y}
                    stroke="#334155"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                </g>
              ))}

              {/* Curve in emerald green matching main site */}
              <path
                d="M 45 135 L 135 135 L 225 135 L 315 135 L 405 135 C 440 135, 470 50, 490 15"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />

              {/* Data points */}
              <circle cx="45" cy="135" r="3.5" fill="#10b981" />
              <circle cx="135" cy="135" r="3.5" fill="#10b981" />
              <circle cx="225" cy="135" r="3.5" fill="#10b981" />
              <circle cx="315" cy="135" r="3.5" fill="#10b981" />
              <circle cx="405" cy="135" r="3.5" fill="#10b981" />
              <circle cx="490" cy="15" r="4.5" fill="#34d399" stroke="#ffffff" strokeWidth="1.5" />
            </svg>

            {/* X-axis Month Labels */}
            <div className="flex justify-between pl-11 pr-2 pt-1 text-[11px] text-slate-400">
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
              <span>Sep</span>
            </div>
          </div>
        </div>

        {/* Role Distribution Donut Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Role Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Active roles by category</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-48">
            {/* Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="12"
                />
                {/* Colored Arcs based on actual distribution */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray={`${(rolePercentages.admins / 100) * 251.2} 251.2`}
                  strokeDashoffset="0"
                />
                {rolePercentages.salesReps > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="12"
                    strokeDasharray={`${(rolePercentages.salesReps / 100) * 251.2} 251.2`}
                    strokeDashoffset={`-${(rolePercentages.admins / 100) * 251.2}`}
                  />
                )}
              </svg>

              {/* Center Total Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold font-mono text-white leading-none">
                  {totalUsers}
                </span>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mt-1">
                  TOTAL
                </span>
              </div>
            </div>

            {/* Legend with site palette */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <span className="text-slate-300">Sales Reps ({rolePercentages.salesReps}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">Admins ({rolePercentages.admins}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-slate-300">Team Leads ({rolePercentages.teamLeads}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-300">Accountants ({rolePercentages.accountants}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-slate-300">Managers ({rolePercentages.managers}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="text-slate-300">Inv. Mgr ({rolePercentages.inventoryManagers}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Search and Filter Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search input with icon */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Roles Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none pr-8 cursor-pointer"
          >
            <option value="All Roles">All Roles</option>
            <option value="Owner">Owner</option>
            <option value="Admin">Admin</option>
            <option value="Sales Representative">Sales Representative</option>
            <option value="Manager">Manager</option>
            <option value="Team Lead">Team Lead</option>
            <option value="Inventory Manager">Inventory Manager</option>
            <option value="Accountant">Accountant</option>
          </select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none pr-8 cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* 6. Users Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono text-slate-400">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-medium">Name & Email</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Created</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No users found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = selectedUserIds.includes(u.id);
                  const initials = u.name.split(' ').map(n => n[0]).slice(0, 2).join('');
                  const isActive = u.status === 'Active';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectUser(u.id)}
                          className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Name & Email with Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0 font-mono">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-white">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
                          u.role === 'Owner'
                            ? 'bg-purple-950/80 text-purple-400 border-purple-800/60'
                            : u.role === 'Admin'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                            : u.role === 'Sales Representative'
                            ? 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60'
                            : u.role === 'Manager'
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800/60'
                            : u.role === 'Team Lead'
                            ? 'bg-indigo-950/80 text-indigo-400 border-indigo-800/60'
                            : u.role === 'Accountant'
                            ? 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u)}
                            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                              isActive ? 'bg-emerald-600' : 'bg-slate-700'
                            }`}
                          >
                            <div
                              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                isActive ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                          <span className={`text-[11px] font-mono font-medium ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions Menu */}
                      <td className="py-3 px-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuUserId(activeMenuUserId === u.id ? null : u.id)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown Action Menu */}
                        {activeMenuUserId === u.id && (
                          <div className="absolute right-4 mt-1 z-50 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 text-left text-xs">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setActiveMenuUserId(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit Details</span>
                            </button>

                            <button
                              onClick={() => {
                                setPermissionsUser(u);
                                setActiveMenuUserId(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                              <Shield className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Permissions</span>
                            </button>

                            <button
                              onClick={() => {
                                handleToggleUserStatus(u);
                                setActiveMenuUserId(null);
                              }}
                              className="w-full px-3 py-2 flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white"
                            >
                              <Key className="w-3.5 h-3.5 text-amber-400" />
                              <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                            </button>

                            {u.role !== 'Owner' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete ${u.name}?`)) {
                                    deleteUser(u.id);
                                    if (addNotification) {
                                      addNotification({
                                        title: 'User Deleted',
                                        message: `${u.name} has been removed.`,
                                        type: 'info'
                                      });
                                    }
                                  }
                                  setActiveMenuUserId(null);
                                }}
                                className="w-full px-3 py-2 flex items-center gap-2 text-rose-400 hover:bg-rose-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete User</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing 1 to {filteredUsers.length} of {filteredUsers.length} users
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <button className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed text-xs">
              &lt;
            </button>
            <button className="w-6 h-6 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </button>
            <button className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed text-xs">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* 7. Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onAdd={(newUser) => {
            addUser(newUser);
            setShowAddUserModal(false);
            if (addNotification) {
              addNotification({
                title: 'User Added',
                message: `${newUser.name} created successfully.`,
                type: 'success'
              });
            }
          }}
          salesTeams={salesTeams}
        />
      )}

      {/* 8. Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={(updates) => {
            updateUser(editingUser.id, updates);
            setEditingUser(null);
            if (addNotification) {
              addNotification({
                title: 'User Updated',
                message: `Changes for ${editingUser.name} saved.`,
                type: 'success'
              });
            }
          }}
          salesTeams={salesTeams}
        />
      )}

      {/* 9. Default Permissions Configuration Modal */}
      {showDefaultPermissionsModal && (
        <DefaultPermissionsModal
          managerPerms={defaultManagerPerms}
          repPerms={defaultRepPerms}
          onSave={(newMgrPerms, newRepPerms) => {
            setDefaultManagerPerms(newMgrPerms);
            setDefaultRepPerms(newRepPerms);
            setShowDefaultPermissionsModal(false);
            if (addNotification) {
              addNotification({
                title: 'Default Permissions Saved',
                message: 'Company baseline role permissions successfully updated.',
                type: 'success'
              });
            }
          }}
          onClose={() => setShowDefaultPermissionsModal(false)}
        />
      )}

      {/* 10. Individual User Permissions Override Modal */}
      {permissionsUser && (
        <UserPermissionsModal
          user={permissionsUser}
          onClose={() => setPermissionsUser(null)}
          onSave={(perms) => {
            updateUser(permissionsUser.id, { permissions: perms });
            setPermissionsUser(null);
            if (addNotification) {
              addNotification({
                title: 'Permissions Updated',
                message: `Permissions updated for ${permissionsUser.name}`,
                type: 'success'
              });
            }
          }}
        />
      )}

    </div>
  );
};

// -------------------------------------------------------------
// ADD USER MODAL
// -------------------------------------------------------------
interface AddUserModalProps {
  onClose: () => void;
  onAdd: (user: Omit<User, 'id' | 'createdAt'>) => void;
  salesTeams: any[];
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAdd, salesTeams }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+234 ');
  const [role, setRole] = useState<UserRole>('Sales Representative');
  const [teamId, setTeamId] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Paused' | 'Inactive'>('Active');
  const [payStructure, setPayStructure] = useState<'Fixed' | 'Commission' | 'Hybrid' | 'Performance-based' | 'Not set'>('Hybrid');
  const [fixedSalary, setFixedSalary] = useState<number>(75000);
  const [commissionPerOrder, setCommissionPerOrder] = useState<number>(1500);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAdd({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status,
      teamId: teamId || undefined,
      payStructure,
      fixedSalary: (payStructure === 'Fixed' || payStructure === 'Hybrid') ? fixedSalary : 0,
      commissionPerOrder: (payStructure === 'Commission' || payStructure === 'Hybrid') ? commissionPerOrder : 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white">Add New User</h2>
            <p className="text-xs text-slate-400">Create an employee account and assign baseline role access.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Adebayo Ogunlesi"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                <option value="Sales Representative">Sales Representative</option>
                <option value="Manager">Manager</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Accountant">Accountant</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Assigned Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                <option value="">No Team Assigned</option>
                {salesTeams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 block">Initial Compensation Model</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Pay Structure</label>
                <select
                  value={payStructure}
                  onChange={(e) => setPayStructure(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-xs"
                >
                  <option value="Hybrid">Hybrid (Base + Comm)</option>
                  <option value="Commission">Pure Commission</option>
                  <option value="Fixed">Fixed Salary</option>
                  <option value="Performance-based">Performance-based</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Fixed Base (₦)</label>
                <input
                  type="number"
                  value={fixedSalary}
                  onChange={(e) => setFixedSalary(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-sm"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// EDIT USER MODAL
// -------------------------------------------------------------
interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
  salesTeams: any[];
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave, salesTeams }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState<'Active' | 'Paused' | 'Inactive'>(user.status);
  const [teamId, setTeamId] = useState<string>(user.teamId || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role,
      status,
      teamId: teamId || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white">Edit User Profile</h2>
            <p className="text-xs text-slate-400">Modify contact details and assigned role for {user.name}.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={user.role === 'Owner'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none disabled:opacity-50"
              >
                <option value="Owner">Owner</option>
                <option value="Admin">Admin</option>
                <option value="Sales Representative">Sales Representative</option>
                <option value="Manager">Manager</option>
                <option value="Team Lead">Team Lead</option>
                <option value="Inventory Manager">Inventory Manager</option>
                <option value="Accountant">Accountant</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Paused">Paused</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Team</label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none"
            >
              <option value="">No Team Assigned</option>
              {salesTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// DEFAULT PERMISSIONS MODAL
// -------------------------------------------------------------
interface DefaultPermissionsModalProps {
  managerPerms: ManagerPermissions;
  repPerms: { [key: string]: boolean };
  onSave: (mgr: ManagerPermissions, rep: { [key: string]: boolean }) => void;
  onClose: () => void;
}

const DefaultPermissionsModal: React.FC<DefaultPermissionsModalProps> = ({
  managerPerms: initialMgr,
  repPerms: initialRep,
  onSave,
  onClose
}) => {
  const [tab, setTab] = useState<'manager' | 'rep'>('manager');
  const [mgr, setMgr] = useState<ManagerPermissions>(initialMgr);
  const [rep, setRep] = useState<{ [key: string]: boolean }>(initialRep);

  const toggleMgrPerm = (category: keyof ManagerPermissions, key: string) => {
    setMgr(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !((prev[category] as any)[key])
      }
    }));
  };

  const toggleRepPerm = (key: string) => {
    setRep(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
                Baseline Access Matrix
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              Configure Default Role Permissions
            </h2>
            <p className="text-xs text-slate-400">
              Set the standard page access granted automatically when assigning users to a role.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex border-b border-slate-800 px-5 text-xs font-semibold">
          <button
            onClick={() => setTab('manager')}
            className={`py-3 px-4 border-b-2 transition ${
              tab === 'manager'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Manager Baseline Pages
          </button>
          <button
            onClick={() => setTab('rep')}
            className={`py-3 px-4 border-b-2 transition ${
              tab === 'rep'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Sales Rep Baseline Pages
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {tab === 'manager' ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="font-mono uppercase text-emerald-400 font-bold text-[11px]">
                  1. Sales & Delivery Modules
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  {Object.entries(mgr.sales).map(([k, val]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => toggleMgrPerm('sales', k)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="font-mono uppercase text-cyan-400 font-bold text-[11px]">
                  2. Operations & Inventory Modules
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  {Object.entries(mgr.operations).map(([k, val]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => toggleMgrPerm('operations', k)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <span className="font-mono uppercase text-amber-400 font-bold text-[11px]">
                  3. Finance & P&L Modules
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  {Object.entries(mgr.finance).map(([k, val]) => (
                    <label key={k} className="flex items-center gap-2 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => toggleMgrPerm('finance', k)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-mono uppercase text-emerald-400 font-bold text-[11px]">
                  Sales Representative Portal Pages
                </span>
                <div className="space-y-2 text-slate-300">
                  {Object.entries(rep).map(([k, val]) => (
                    <label key={k} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer hover:text-white">
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={() => toggleRepPerm(k)}
                        className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(mgr, rep)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Save Default Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// USER PERMISSIONS OVERRIDE MODAL
// -------------------------------------------------------------
interface UserPermissionsModalProps {
  user: User;
  onClose: () => void;
  onSave: (perms: ManagerPermissions) => void;
}

const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({ user, onClose, onSave }) => {
  const [perms, setPerms] = useState<ManagerPermissions>(
    user.permissions || {
      sales: { orders: true, salesReps: true, teamPerformance: true, customers: true, deliveries: true },
      operations: { deliveryAgents: true, inventory: true, roundRobin: false },
      finance: { expenses: false, reports: false, orderReports: true, remittances: true, mediaBuyers: false, payroll: false },
      admin: { users: false, notifications: true, orderFormBuilder: false, adTracker: true, aiAgent: false, subscription: false, settings: false }
    }
  );

  const toggle = (category: keyof ManagerPermissions, key: string) => {
    setPerms(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !((prev[category] as any)[key])
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h2 className="text-base font-bold text-white">Custom Permissions: {user.name}</h2>
            <p className="text-xs text-slate-400">Override role defaults with user-specific page access.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono uppercase text-emerald-400 font-bold text-[10px]">Sales & CRM</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              {Object.entries(perms.sales).map(([k, val]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => toggle('sales', k)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono uppercase text-cyan-400 font-bold text-[10px]">Operations & Stock</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              {Object.entries(perms.operations).map(([k, val]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => toggle('operations', k)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-mono uppercase text-amber-400 font-bold text-[10px]">Finance & Accounting</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              {Object.entries(perms.finance).map(([k, val]) => (
                <label key={k} className="flex items-center gap-2 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => toggle('finance', k)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium">
            Cancel
          </button>
          <button
            onClick={() => onSave(perms)}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            Save User Permissions
          </button>
        </div>
      </div>
    </div>
  );
};
