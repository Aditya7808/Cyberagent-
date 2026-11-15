import React from 'react';
import {
  Shield,
  Search,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ShieldOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Global Command / Vector Search */}
      <div className="flex items-center gap-3 w-80 md:w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search agents, prompts, audit hashes..."
            className="w-full pl-9 pr-12 py-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700/60 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* System Telemetry & Operator Identity */}
      <div className="flex items-center gap-4 lg:gap-5">
        {/* Live Status Indicators */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">Gateway Online</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">PII Scrubber:</span>
            <span className="text-indigo-600 dark:text-indigo-300 font-medium text-[11px]">Armed</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Latency:</span>
            <span className="text-cyan-600 dark:text-cyan-300 font-mono text-[11px]">14ms</span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

        {/* Security Clearance Badge */}
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${getClearanceBadge(user?.role)}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{user?.clearance_level || 'LVL-1 [USER]'}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          className="p-1.5 md:px-2.5 md:py-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 hover:rotate-90" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500 transition-transform duration-300 hover:-rotate-45" />
          )}
          <span className="text-[11px] font-medium hidden md:inline capitalize">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* Operator Menu */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20 group-hover:ring-indigo-400/40">
              {getInitials(user?.full_name)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.full_name || 'Operator'}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight capitalize">
                {user?.role ? user.role.replace('_', ' ') : 'Authenticated'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-rose-500 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};