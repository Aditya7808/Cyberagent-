import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Shield, Bell, Wifi, KeyRound, LogOut, ChevronDown } from 'lucide-react';
import { useAuth, UserRoleType } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, impersonateRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roleOptions: { role: UserRoleType; label: string; badge: string; color: string }[] = [
    { role: 'super_admin', label: 'ROOT ADMIN', badge: 'LVL-5 [ROOT]', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
    { role: 'developer', label: 'AI DEVELOPER', badge: 'LVL-3 [DEV]', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { role: 'auditor', label: 'COMPLIANCE AUDITOR', badge: 'LVL-2 [AUDIT]', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { role: 'end_user', label: 'BUSINESS END-USER', badge: 'LVL-1 [USER]', color: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10' },
  ];

  const handleRoleSwitch = (r: UserRoleType) => {
    impersonateRole(r);
    setShowRoleMenu(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'OP';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10 font-mono">
      {/* Tactical Command Input */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="root@sentinel:~$ search --vectors --threats..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded text-xs text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
        </div>
      </div>

      {/* Cyber SOC Telemetry Stats & Role Switcher */}
      <div className="flex items-center gap-5">
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-500 text-[11px]">GATEWAY:</span>
            <span className="text-emerald-400 font-bold text-[11px]">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500 text-[11px]">PII ENGINE:</span>
            <span className="text-cyan-400 font-bold text-[11px]">ARMED</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

        {/* Tactical Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold transition-all shadow-inner"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[10px] uppercase">SWITCH ROLE:</span>
            <span className="text-cyan-300 text-[11px]">{user?.clearance_level || 'LVL-5 [ROOT]'}</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg bg-slate-950 border border-cyan-500/40 p-2 shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-50 space-y-1">
              <div className="px-2 py-1 text-[9px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-800 mb-1">
                INSTANT ROLE IMPERSONATION
              </div>
              {roleOptions.map((opt) => (
                <button
                  key={opt.role}
                  onClick={() => handleRoleSwitch(opt.role)}
                  className={`w-full flex items-center justify-between p-2 rounded text-left text-xs transition-colors hover:bg-slate-900 ${
                    user?.role === opt.role ? 'bg-cyan-500/10 border border-cyan-500/30' : ''
                  }`}
                >
                  <div>
                    <span className="block font-bold text-slate-200">{opt.label}</span>
                    <span className="block text-[10px] text-slate-500">{opt.role}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${opt.color}`}>
                    {opt.badge}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-800" />

        {/* Operator Profile */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            {getInitials(user?.full_name)}
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold text-slate-100 tracking-wide">
              {user?.full_name || 'ADITYA YADAV'}
            </span>
            <span className="block text-[10px] text-cyan-400/80 tracking-wider">
              {user?.clearance_level || 'LVL-5 [ROOT]'}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          title="Disconnect Cipher Session"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
