import React from 'react';
import { ShieldAlert, LogIn, PlusCircle, AlertCircle, Server } from 'lucide-react';
import { BackendStatus } from '../../context/AuthContext';

interface Props {
  onSignIn: () => void;
  onCreateWorkspace: () => void;
  backendStatus: BackendStatus | null;
}

export const UnauthorizedAccessGate: React.FC<Props> = ({
  onSignIn,
  onCreateWorkspace,
  backendStatus,
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-sm animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-amber-950/80 text-amber-400 border border-amber-800/60">
            Authentication Required
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Protected Business Workspace
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            BettaTraka enforces organization-level isolation and server-side role permissions. Please sign in to your workspace or register a new business account to continue.
          </p>
        </div>

        {/* Database setup notice if disconnected */}
        {backendStatus && !backendStatus.connected && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs text-left space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Server className="w-4 h-4 shrink-0" />
              <span>VPS Backend Configuration Required</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              {backendStatus.message}
            </p>
            <p className="text-[10px] font-mono text-amber-400/80 pt-1 border-t border-amber-900/50">
              Verify DATABASE_URL in your .env file on your VPS server.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSignIn}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Workspace</span>
          </button>

          <button
            type="button"
            onClick={onCreateWorkspace}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
