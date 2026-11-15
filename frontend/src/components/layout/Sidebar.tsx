import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  Bot, 
  Terminal, 
  Crosshair, 
  FileCode2, 
  Activity, 
  Fingerprint, 
  Radio,
  Lock,
  Cpu,
  UserCheck,
  Users as UsersIcon
} from 'lucide-react';
import { GhostLogo } from '../ui/GhostLogo';
import { useAuth, UserRoleType } from '../../context/AuthContext';

interface NavItem {
  code: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRoleType[];
}

const navigation: NavItem[] = [
  { code: '01', name: 'Threat Radar', href: '/', icon: Activity, roles: ['super_admin', 'admin', 'auditor'] },
  { code: '02', name: 'Agent Registry', href: '/agents', icon: Bot, roles: ['super_admin', 'admin', 'developer', 'operator'] },
  { code: '03', name: 'Injection Playground', href: '/playground', icon: Terminal, roles: ['super_admin', 'admin', 'developer', 'operator', 'end_user', 'viewer'] },
  { code: '04', name: 'Adversarial Red Team', href: '/red-team', icon: Crosshair, roles: ['super_admin', 'admin', 'developer'] },
  { code: '05', name: 'Secure RAG Vault', href: '/documents', icon: FileCode2, roles: ['super_admin', 'admin', 'developer', 'auditor', 'end_user', 'viewer'] },
  { code: '06', name: 'Benchmark Evals', href: '/evaluations', icon: ShieldAlert, roles: ['super_admin', 'admin', 'developer', 'auditor'] },
  { code: '07', name: 'Audit & Forensics', href: '/audit', icon: Fingerprint, roles: ['super_admin', 'admin', 'auditor'] },
  { code: '08', name: 'Identity & RBAC', href: '/users', icon: UsersIcon, roles: ['super_admin', 'admin'] },
];

export const Sidebar: React.FC = () => {
  const { user, isRole } = useAuth();

  const filteredNavigation = navigation.filter(item => isRole(item.roles));

  return (
    <aside className="w-72 border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl flex flex-col h-screen sticky top-0 z-20">
      {/* Brand Header with Cyber Ghost Logo */}
      <div className="h-20 flex items-center px-5 gap-3.5 border-b border-slate-800/80 bg-slate-950/60 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <GhostLogo size={42} glowColor={user?.role === 'super_admin' ? 'rose' : 'cyan'} />

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-lg tracking-wider text-white glow-text-cyan">
              SENTINEL<span className="text-cyan-400">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[9px] tracking-widest text-emerald-400 font-bold uppercase">
              THREAT LEVEL // DEFCON 1
            </span>
          </div>
        </div>
      </div>

      {/* Security Clearance Ribbon */}
      <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
        <span className="flex items-center gap-1.5 text-slate-400">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          CLEARANCE
        </span>
        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
          user?.role === 'super_admin' || user?.role === 'admin'
            ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
            : user?.role === 'developer'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : user?.role === 'auditor'
            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            : 'bg-slate-800 text-cyan-300'
        }`}>
          {user?.clearance_level || 'LVL-5 [ROOT]'}
        </span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold flex items-center justify-between">
          <span>OPERATIONAL MODULES</span>
          <span className="text-[9px] text-slate-600">({filteredNavigation.length} / 8)</span>
        </div>
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-all duration-200 group relative ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-bold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r shadow-[0_0_8px_#06b6d4]" />
                )}
                <span className={`text-[10px] ${isActive ? 'text-cyan-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  [{item.code}]
                </span>
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="tracking-wide uppercase">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Cyber Telemetry Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 font-mono text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-cyan-400" />
            ROLE MODE
          </span>
          <span className="font-semibold text-slate-200 uppercase">{user?.role || 'super_admin'}</span>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-emerald-400" />
            OPERATOR ID
          </span>
          <span className="text-emerald-400 truncate max-w-[120px]">{user?.email}</span>
        </div>
        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[9px] text-slate-600">
          <span>SHA: v2.0-RBAC</span>
          <span className="text-cyan-500/80">LATENCY 8ms</span>
        </div>
      </div>
    </aside>
  );
};
