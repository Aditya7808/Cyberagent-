import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Radar,
  Bot,
  Terminal,
  Crosshair,
  FileCode2,
  ShieldAlert,
  Fingerprint,
  Users,
  Shield,
  Layers,
  ChevronRight,
  Cpu
} from 'lucide-react';
import { useAuth, UserRoleType } from '../../context/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRoleType[];
  badge?: string;
  accent?: 'rose' | 'emerald' | 'indigo' | 'amber' | 'cyan';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OPERATIONAL DEFENSE',
    items: [
      { name: 'Threat Radar', href: '/', icon: Radar, roles: ['super_admin', 'admin', 'developer', 'auditor'], accent: 'indigo' },
      { name: 'Agent Registry', href: '/agents', icon: Bot, roles: ['super_admin', 'admin', 'developer', 'operator'], badge: '12 Active', accent: 'emerald' },
      { name: 'Injection Playground', href: '/playground', icon: Terminal, roles: ['super_admin', 'admin', 'developer', 'operator', 'end_user', 'viewer'], accent: 'cyan' },
    ],
  },
  {
    title: 'ADVERSARIAL & VAULT',
    items: [
      { name: 'Red Team War Room', href: '/red-team', icon: Crosshair, roles: ['super_admin', 'admin', 'developer'], accent: 'rose' },
      { name: 'Secure RAG Vault', href: '/documents', icon: FileCode2, roles: ['super_admin', 'admin', 'developer', 'auditor', 'end_user', 'viewer'], accent: 'amber' },
      { name: 'Benchmark Evals', href: '/evaluations', icon: ShieldAlert, roles: ['super_admin', 'admin', 'developer', 'auditor'], accent: 'emerald' },
    ],
  },
  {
    title: 'COMPLIANCE & ACCESS',
    items: [
      { name: 'Audit & Forensics', href: '/audit', icon: Fingerprint, roles: ['super_admin', 'admin', 'auditor'], accent: 'cyan' },
      { name: 'Identity & RBAC', href: '/users', icon: Users, roles: ['super_admin', 'admin'], accent: 'indigo' },
    ],
  },
];

const accentMap: Record<string, { icon: string; activeIcon: string; dot: string }> = {
  rose: { icon: 'text-rose-400', activeIcon: 'text-rose-300', dot: 'bg-rose-500' },
  emerald: { icon: 'text-emerald-400', activeIcon: 'text-emerald-300', dot: 'bg-emerald-500' },
  indigo: { icon: 'text-indigo-400', activeIcon: 'text-indigo-300', dot: 'bg-indigo-500' },
  amber: { icon: 'text-amber-400', activeIcon: 'text-amber-300', dot: 'bg-amber-500' },
  cyan: { icon: 'text-cyan-400', activeIcon: 'text-cyan-300', dot: 'bg-cyan-500' },
};

const NavItemComponent: React.FC<{ item: NavItem }> = ({ item }) => {
  const accent = accentMap[item.accent || 'indigo'];
  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={({ isActive }) =>
        `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
          isActive
            ? 'bg-indigo-600/10 dark:bg-indigo-600/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-2.5">
            <item.icon className={`w-4 h-4 transition-colors ${isActive ? accent.activeIcon : accent.icon}`} />
            <span>{item.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                {item.badge}
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          </div>
        </>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { isRole } = useAuth();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex flex-col h-screen sticky top-0 z-30 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 gap-3 border-b border-slate-200 dark:border-slate-800/80">
        <img
          src="/sentinel-logo-mark.png"
          alt="SentinelAI Emblem"
          className="w-8 h-9 object-contain drop-shadow-sm select-none"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Sentinel<span className="text-indigo-600 dark:text-indigo-400">AI</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
              v2.0
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
            AI Agent Security Control
          </div>
        </div>
      </div>

      {/* Nav Menu Categories */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => isRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>

              {visibleItems.map((item) => (
                <NavItemComponent key={item.href} item={item} />
              ))}
            </div>
          );
        })}
      </nav>

      {/* AI Engine Status Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5">
        {/* Engine telemetry strip */}
        <div className="px-2.5 py-2 rounded-lg bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">Heuristic Engine</span>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-emerald-500 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Tenant / Organization Footer Card */}
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Acme Defense Corp</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500">Tenant: ACME_CORP_01</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
        </div>
      </div>
    </aside>
  );
};