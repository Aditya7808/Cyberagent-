import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Zap, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  const getClearanceBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'badge-rose';
      case 'developer':
      case 'operator':
        return 'badge-emerald';
      case 'auditor':
        return 'badge-amber';
      default:
        return 'badge-indigo';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Command / Vector Search */}
      <div className="flex items-center gap-3 w-80 md:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search agents, prompts, audit hashes..."
            className="w-full pl-9 pr-12 py-1.5 bg-slate-900/90 border border-slate-700/60 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* System Telemetry & Operator Identity */}
      <div className="flex items-center gap-5">
        {/* Live Status Indicators */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-[11px]">Gateway Online</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] text-slate-400">PII Scrubber:</span>
            <span className="text-indigo-300 font-medium text-[11px]">Armed</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Latency:</span>
            <span className="text-cyan-300 font-mono text-[11px]">14ms</span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-800 hidden md:block" />

        {/* Security Clearance Badge */}
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${getClearanceBadge(user?.role)}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{user?.clearance_level || 'LVL-1 [USER]'}</span>
        </div>

        {/* User Identity Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
            {getInitials(user?.full_name)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.full_name || 'Operator'}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight capitalize">
              {user?.role ? user.role.replace('_', ' ') : 'Authenticated'}
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-rose-400 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
