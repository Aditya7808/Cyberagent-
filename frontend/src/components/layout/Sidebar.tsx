import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Bot, 
  Terminal, 
  Crosshair, 
  FileCode2, 
  ShieldAlert, 
  Fingerprint, 
  Users,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth, UserRoleType } from '../../context/AuthContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRoleType[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'OPERATIONAL DEFENSE',
    items: [
      { name: 'Threat Radar', href: '/', icon: Activity, roles: ['super_admin', 'admin', 'developer', 'auditor'] },
      { name: 'Agent Registry', href: '/agents', icon: Bot, roles: ['super_admin', 'admin', 'developer', 'operator'], badge: '12 Active' },
      { name: 'Injection Playground', href: '/playground', icon: Terminal, roles: ['super_admin', 'admin', 'developer', 'operator', 'end_user', 'viewer'] },
    ],
  },
  {
    title: 'ADVERSARIAL & VAULT',
    items: [
      { name: 'Red Team War Room', href: '/red-team', icon: Crosshair, roles: ['super_admin', 'admin', 'developer'] },
      { name: 'Secure RAG Vault', href: '/documents', icon: FileCode2, roles: ['super_admin', 'admin', 'developer', 'auditor', 'end_user', 'viewer'] },
      { name: 'Benchmark Evals', href: '/evaluations', icon: ShieldAlert, roles: ['super_admin', 'admin', 'developer', 'auditor'] },
    ],
  },
  {
    title: 'COMPLIANCE & ACCESS',
    items: [
      { name: 'Audit & Forensics', href: '/audit', icon: Fingerprint, roles: ['super_admin', 'admin', 'auditor'] },
      { name: 'Identity & RBAC', href: '/users', icon: Users, roles: ['super_admin', 'admin'] },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { user, isRole } = useAuth();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
          <Shield className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white">
              Sentinel<span className="text-indigo-400">AI</span>
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              v2.0
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
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
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>

              {visibleItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900/60 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Tenant / Organization Footer Card */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-slate-400">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200">Acme Defense Corp</div>
              <div className="text-[10px] text-slate-500">Tenant: ACME_CORP_01</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
        </div>
      </div>
    </aside>
  );
};
