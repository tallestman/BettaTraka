import React, { useState, useMemo } from 'react';
import { useCrm } from '../../context/CrmContext';
import { User, ManagerPermissions, UserRole } from '../../types/crm';
import { 
  PERMISSION_DEFINITIONS, 
  getAllPermissionsGranted, 
  getNoPermissionsGranted, 
  getDefaultPermissionsForRole, 
  normalizeUserPermissions,
  countGrantedPermissions,
  TOTAL_PERMISSIONS_COUNT,
  PermissionDefinition
} from '../../utils/permissions';
import { 
  Shield, 
  X, 
  Check, 
  CheckCheck, 
  Ban, 
  Search, 
  Sparkles, 
  Sliders, 
  AlertCircle,
  ShoppingBag,
  Package,
  PieChart,
  Settings,
  RotateCcw,
  UserCheck,
  Users,
  CheckCircle2
} from 'lucide-react';

interface UserPermissionsModalProps {
  user: User;
  onClose: () => void;
  onSave: (perms: ManagerPermissions) => void;
  isManager?: boolean;
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  user,
  onClose,
  onSave,
  isManager = false
}) => {
  const { themeMode } = useCrm();
  const isLight = themeMode === 'light';

  const [perms, setPerms] = useState<ManagerPermissions>(() => normalizeUserPermissions(user));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'sales' | 'operations' | 'finance' | 'admin'>('all');
  const [hasChanges, setHasChanges] = useState(false);

  // Live count
  const { granted, total } = useMemo(() => countGrantedPermissions(perms), [perms]);
  const percentage = Math.round((granted / total) * 100);

  // Toggle individual permission
  const handleToggle = (category: keyof ManagerPermissions, id: string) => {
    if (isManager) return;
    setPerms(prev => {
      const currentCat = { ...(prev[category] as any) };
      currentCat[id] = !Boolean(currentCat[id]);
      return {
        ...prev,
        [category]: currentCat
      };
    });
    setHasChanges(true);
  };

  // Grant all permissions
  const handleGrantAll = () => {
    if (isManager) return;
    setPerms(getAllPermissionsGranted());
    setHasChanges(true);
  };

  // Revoke all permissions
  const handleRevokeAll = () => {
    if (isManager) return;
    setPerms(getNoPermissionsGranted());
    setHasChanges(true);
  };

  // Category level grant/revoke
  const handleGrantCategory = (category: 'sales' | 'operations' | 'finance' | 'admin') => {
    if (isManager) return;
    setPerms(prev => {
      const updatedCat = { ...(prev[category] as any) };
      PERMISSION_DEFINITIONS.filter(p => p.category === category).forEach(p => {
        updatedCat[p.id] = true;
      });
      return {
        ...prev,
        [category]: updatedCat
      };
    });
    setHasChanges(true);
  };

  const handleRevokeCategory = (category: 'sales' | 'operations' | 'finance' | 'admin') => {
    if (isManager) return;
    setPerms(prev => {
      const updatedCat = { ...(prev[category] as any) };
      PERMISSION_DEFINITIONS.filter(p => p.category === category).forEach(p => {
        updatedCat[p.id] = false;
      });
      return {
        ...prev,
        [category]: updatedCat
      };
    });
    setHasChanges(true);
  };

  // Apply Role Preset
  const handleApplyPreset = (presetRole: UserRole) => {
    if (isManager) return;
    setPerms(getDefaultPermissionsForRole(presetRole));
    setHasChanges(true);
  };

  // Filter definitions based on search & category tab
  const filteredDefinitions = useMemo(() => {
    return PERMISSION_DEFINITIONS.filter(def => {
      if (selectedCategoryTab !== 'all' && def.category !== selectedCategoryTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLabel = def.label.toLowerCase().includes(q);
        const matchesDesc = def.description.toLowerCase().includes(q);
        const matchesId = def.id.toLowerCase().includes(q);
        return matchesLabel || matchesDesc || matchesId;
      }
      return true;
    });
  }, [selectedCategoryTab, searchQuery]);

  const categoriesConfig: {
    key: 'sales' | 'operations' | 'finance' | 'admin';
    label: string;
    icon: any;
    color: string;
    borderColor: string;
    bgColor: string;
  }[] = [
    {
      key: 'sales',
      label: 'Sales & CRM',
      icon: ShoppingBag,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-800/60',
      bgColor: 'bg-emerald-950/20'
    },
    {
      key: 'operations',
      label: 'Operations & Stock',
      icon: Package,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-800/60',
      bgColor: 'bg-cyan-950/20'
    },
    {
      key: 'finance',
      label: 'Finance & Accounting',
      icon: PieChart,
      color: 'text-amber-400',
      borderColor: 'border-amber-800/60',
      bgColor: 'bg-amber-950/20'
    },
    {
      key: 'admin',
      label: 'System & Admin Tools',
      icon: Settings,
      color: 'text-sky-400',
      borderColor: 'border-sky-800/60',
      bgColor: 'bg-sky-950/20'
    }
  ];

  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`fixed inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto ${
      isLight ? 'bg-slate-900/40' : 'bg-black/80'
    }`}>
      <div className={`rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh] border ${
        isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        
        {/* 1. Modal Header */}
        <div className={`flex items-center justify-between p-4 sm:p-5 border-b ${
          isLight ? 'border-slate-200 bg-slate-50/80' : 'border-slate-800 bg-slate-950/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Configure User Permissions: {user.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                  isLight ? 'bg-lime-100 text-lime-800 border-lime-300' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {user.role}
                </span>
                {user.teamId && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                    isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    Team: {user.teamId}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Grant or revoke granular module access across Sales, Operations, Finance, and System Tools.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Top Summary & Progress Bar */}
        <div className={`px-4 sm:px-6 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-3 flex-1">
            <div className={`flex items-center gap-2 font-mono text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <Shield className={`w-4 h-4 ${isLight ? 'text-lime-700' : 'text-emerald-400'}`} />
              <span>
                <strong className={`text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{granted}</strong> / {total} Permissions Active
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                percentage === 100 
                  ? (isLight ? 'bg-lime-100 text-lime-900 border-lime-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30')
                  : percentage === 0 
                  ? (isLight ? 'bg-rose-100 text-rose-900 border-rose-200' : 'bg-rose-500/20 text-rose-300 border-rose-500/30')
                  : (isLight ? 'bg-sky-100 text-sky-900 border-sky-200' : 'bg-sky-500/20 text-sky-300 border-sky-500/30')
              }`}>
                {percentage}%
              </span>
            </div>
            
            {/* Visual Progress Bar */}
            <div className={`hidden sm:block flex-1 max-w-xs h-2 rounded-full overflow-hidden ${
              isLight ? 'bg-slate-200' : 'bg-slate-800'
            }`}>
              <div 
                className={`h-full transition-all duration-300 ${
                  percentage === 100 ? (isLight ? 'bg-lime-600' : 'bg-emerald-500') : percentage > 50 ? 'bg-sky-500' : 'bg-amber-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Quick Grant/Revoke All Buttons */}
          {!isManager && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleGrantAll}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                  isLight 
                    ? 'bg-lime-50 hover:bg-lime-100 border-lime-300 text-lime-900' 
                    : 'bg-emerald-950/60 hover:bg-emerald-900 border-emerald-600/40 text-emerald-300'
                }`}
                title="Grant all 29 permissions to this user"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Grant All</span>
              </button>
              <button
                type="button"
                onClick={handleRevokeAll}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border ${
                  isLight 
                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900' 
                    : 'bg-rose-950/60 hover:bg-rose-900 border-rose-600/40 text-rose-300'
                }`}
                title="Revoke all permissions from this user"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Revoke All</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(user.role)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer border ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title="Reset to default permissions for this user's assigned role"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Role Default</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. Role Presets Bar */}
        {!isManager && (
          <div className={`px-4 sm:px-6 py-2.5 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
          }`}>
            <span className={`font-semibold whitespace-nowrap flex items-center gap-1 mr-1 ${
              isLight ? 'text-slate-600' : 'text-slate-400'
            }`}>
              <Sparkles className="w-3 h-3 text-amber-500" />
              Presets:
            </span>
            {(['Admin', 'Manager', 'Accountant', 'Sales Representative', 'Distributor', 'Inventory Manager', 'Media Buyer'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleApplyPreset(r)}
                className={`px-2 py-0.5 rounded-md border whitespace-nowrap transition cursor-pointer font-medium ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {r === 'Sales Representative' ? 'Sales Rep' : r === 'Inventory Manager' ? 'Inventory' : r}
              </button>
            ))}
          </div>
        )}

        {/* 4. Search and Category Tabs */}
        <div className={`px-4 sm:px-6 py-3 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-950/60 border-slate-800'
        }`}>
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                selectedCategoryTab === 'all'
                  ? (isLight ? 'bg-lime-600 text-white font-bold shadow-xs' : 'bg-emerald-600 text-white shadow-sm')
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800')
              }`}
            >
              All ({total})
            </button>
            {categoriesConfig.map(cat => {
              const catCount = PERMISSION_DEFINITIONS.filter(p => p.category === cat.key).length;
              const catGranted = PERMISSION_DEFINITIONS.filter(
                p => p.category === cat.key && Boolean((perms[cat.key] as any)?.[p.id])
              ).length;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategoryTab(cat.key)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    selectedCategoryTab === cat.key
                      ? (isLight ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300' : 'bg-slate-800 text-white border border-slate-700')
                      : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800/60')
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="font-mono text-[10px] opacity-75">
                    ({catGranted}/{catCount})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
              isLight ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none transition border ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-lime-500 focus:bg-white' 
                  : 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* 5. Permission List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {isManager && (
            <div className="p-3 rounded-xl border border-sky-800/60 bg-sky-950/40 text-sky-200 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
              <span>
                Read-only mode: Only System Administrators and Account Owners can modify user permissions.
              </span>
            </div>
          )}

          {categoriesConfig
            .filter(cat => selectedCategoryTab === 'all' || selectedCategoryTab === cat.key)
            .map(cat => {
              const defsInCat = filteredDefinitions.filter(d => d.category === cat.key);
              if (defsInCat.length === 0) return null;

              const catPerms = perms[cat.key] as any;
              const allDefsInThisCat = PERMISSION_DEFINITIONS.filter(d => d.category === cat.key);
              const grantedInCat = allDefsInThisCat.filter(d => Boolean(catPerms?.[d.id])).length;
              const totalInCat = allDefsInThisCat.length;

              return (
                <div 
                  key={cat.key}
                  className={`rounded-xl border overflow-hidden shadow-xs ${
                    isLight ? 'border-slate-200 bg-white' : 'border-slate-800 bg-slate-950/60'
                  }`}
                >
                  {/* Category Header */}
                  <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 flex-wrap ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg border ${
                        isLight 
                          ? 'bg-slate-100 text-slate-800 border-slate-200' 
                          : `${cat.bgColor} ${cat.color} ${cat.borderColor}`
                      }`}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`font-mono uppercase font-bold text-xs ${
                          isLight ? 'text-slate-900' : cat.color
                        }`}>
                          {cat.label}
                        </span>
                        <span className={`ml-2 font-mono text-[11px] ${
                          isLight ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          ({grantedInCat}/{totalInCat} granted)
                        </span>
                      </div>
                    </div>

                    {!isManager && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleGrantCategory(cat.key)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition cursor-pointer ${
                            isLight
                              ? 'bg-lime-50 hover:bg-lime-100 border-lime-300 text-lime-900'
                              : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700/50 text-emerald-300'
                          }`}
                        >
                          Grant Category
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevokeCategory(cat.key)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition cursor-pointer ${
                            isLight
                              ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900'
                              : 'bg-rose-950/80 hover:bg-rose-900 border-rose-700/50 text-rose-300'
                          }`}
                        >
                          Revoke Category
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Grid of Permission Items */}
                  <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {defsInCat.map(def => {
                      const isGranted = Boolean(catPerms?.[def.id]);
                      return (
                        <div
                          key={def.id}
                          onClick={() => handleToggle(cat.key, def.id)}
                          className={`p-3 rounded-xl border transition-all select-none cursor-pointer flex items-start gap-3 ${
                            isGranted
                              ? (isLight 
                                  ? 'bg-lime-50/70 border-lime-300 shadow-xs' 
                                  : 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-500/60 shadow-sm')
                              : (isLight 
                                  ? 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 opacity-80 hover:opacity-100' 
                                  : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100')
                          } ${isManager ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          {/* Toggle switch checkbox */}
                          <div className="pt-0.5">
                            <div
                              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                                isGranted 
                                  ? (isLight ? 'bg-lime-600' : 'bg-emerald-600') 
                                  : (isLight ? 'bg-slate-300' : 'bg-slate-700')
                              }`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                  isGranted ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`font-semibold text-xs ${
                                isLight ? 'text-slate-900' : (isGranted ? 'text-white' : 'text-slate-400')
                              }`}>
                                {def.label}
                              </span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold border ${
                                isGranted 
                                  ? (isLight ? 'text-lime-800 bg-lime-100 border-lime-300' : 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60')
                                  : (isLight ? 'text-slate-500 bg-slate-200/80 border-slate-200' : 'text-slate-500 bg-slate-900 border-slate-800')
                              }`}>
                                {isGranted ? 'Granted' : 'Revoked'}
                              </span>
                            </div>
                            <p className={`text-[11px] mt-1 leading-relaxed ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              {def.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          {filteredDefinitions.length === 0 && (
            <div className={`p-8 text-center space-y-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <Search className={`w-8 h-8 mx-auto ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
              <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>No permissions found</p>
              <p className="text-xs">No permissions matched your search query "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* 6. Footer Actions */}
        <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
          isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'
        }`}>
          <div className="text-xs text-slate-400">
            {hasChanges && (
              <span className="text-amber-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer border ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs font-semibold' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isManager}
              onClick={() => onSave(perms)}
              className={`px-5 py-2 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer ${
                isLight ? 'bg-lime-600 hover:bg-lime-700' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Save User Permissions</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
