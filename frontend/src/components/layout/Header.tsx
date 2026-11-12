import React from 'react';
import { Terminal, Shield, Bell, Zap, Wifi } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Tactical Command Input */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Terminal className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="root@sentinel:~$ search --vectors --threats..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900/90 border border-slate-800 rounded text-xs font-mono text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-inner"
          />
        </div>
      </div>

      {/* Cyber SOC Telemetry Stats */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-5 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-500 text-[11px]">GATEWAY:</span>
            <span className="text-emerald-400 font-bold text-[11px]">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500 text-[11px]">PII ENGINE:</span>
            <span className="text-cyan-400 font-bold text-[11px]">ACTIVE</span>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-slate-800" />

        {/* Alerts Pill */}
        <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded-lg relative transition-colors border border-transparent hover:border-slate-800">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 shadow-[0_0_8px_#f43f5e]" />
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-500/50 flex items-center justify-center text-cyan-300 font-mono text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            AY
          </div>
          <div className="text-left font-mono">
            <span className="block text-xs font-bold text-slate-100 tracking-wide">
              ADITYA YADAV
            </span>
            <span className="block text-[10px] text-cyan-400/80 tracking-wider">
              CLEARANCE: LVL-5 [ROOT]
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
