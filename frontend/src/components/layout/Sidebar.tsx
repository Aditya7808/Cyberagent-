import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldCheck, 
  Bot, 
  Terminal, 
  Flame, 
  FileText, 
  BarChart3, 
  History, 
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Agent Registry', href: '/agents', icon: Bot },
  { name: 'Playground', href: '/playground', icon: Terminal },
  { name: 'Red Team Engine', href: '/red-team', icon: Flame },
  { name: 'Knowledge & RAG', href: '/documents', icon: FileText },
  { name: 'Evaluations', href: '/evaluations', icon: ShieldCheck },
  { name: 'Audit & Telemetry', href: '/audit', icon: History },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            SentinelAI
          </span>
          <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-500">
            Security & Reliability
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <div className="flex items-center justify-between">
          <span>Active Tenant</span>
          <span className="font-semibold text-slate-400">Acme Corp</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>Version</span>
          <span>v0.1.0-p0</span>
        </div>
      </div>
    </aside>
  );
};
