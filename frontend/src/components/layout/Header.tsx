import React from 'react';
import {
  LogOut,
  Sun,
  Moon
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

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Active System Indicator */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Enterprise AI Agent Security Perimeter</span>
      </div>

      {/* Functioning Action Controls */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 shadow-sm cursor-pointer text-xs font-medium"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 hover:rotate-90" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500 transition-transform duration-300 hover:-rotate-45" />
          )}
          <span className="text-[11px] font-medium capitalize">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:border-slate-800 hidden sm:block" />

        {/* User Identity Display */}
        <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
            {getInitials(user?.full_name)}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {user?.full_name || 'Operator'}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight capitalize">
              {user?.role ? user.role.replace('_', ' ') : 'Authenticated'}
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors border border-transparent hover:border-rose-500/20 cursor-pointer"
          title="Sign Out of Session"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};