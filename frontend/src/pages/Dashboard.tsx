import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Crosshair, 
  EyeOff, 
  Check, 
  X, 
  Clock, 
  Terminal,
  Activity,
  Zap,
  Lock,
  Radio
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { api } from '../lib/api';

const threatTimelineData = [
  { time: '06:00', injections: 12, pii_leaks: 45, jailbreaks: 3 },
  { time: '08:00', injections: 28, pii_leaks: 82, jailbreaks: 7 },
  { time: '10:00', injections: 64, pii_leaks: 130, jailbreaks: 18 },
  { time: '12:00', injections: 41, pii_leaks: 95, jailbreaks: 11 },
  { time: '14:00', injections: 89, pii_leaks: 178, jailbreaks: 24 },
  { time: '16:00', injections: 115, pii_leaks: 210, jailbreaks: 32 },
  { time: '18:00', injections: 73, pii_leaks: 145, jailbreaks: 14 },
];

export const Dashboard: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([
    {
      id: 'APPR-SEC-091',
      tool_name: 'delete_backup_snapshot',
      agent_name: 'DevOps Autonomous SRE',
      parameters: { snapshot_id: 'snap-09941a', force: true, target_env: 'production' },
      requested_at: '2m ago',
      risk_tier: 'CRITICAL',
    },
    {
      id: 'APPR-SEC-092',
      tool_name: 'export_employee_payroll',
      agent_name: 'Financial Advisory Agent',
      parameters: { format: 'csv', fiscal_year: 2026, mask_ssn: false },
      requested_at: '14m ago',
      risk_tier: 'HIGH',
    },
    {
      id: 'APPR-SEC-093',
      tool_name: 'execute_sql_migration',
      agent_name: 'Database Optimizer Bot',
      parameters: { table: 'users_auth', statement: 'ALTER TABLE users DROP COLUMN mfa_enforced' },
      requested_at: '28m ago',
      risk_tier: 'CRITICAL',
    },
  ]);

  useEffect(() => {
    api.getApprovals('pending')
      .then((data) => {
        if (data && data.length > 0) {
          setApprovals(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleResolve = async (id: string, approved: boolean) => {
    try {
      await api.resolveApproval(id, approved, approved ? 'Override authorized by Root Admin' : 'Action denied by Security Policy');
    } catch {
      // Local UI update
    }
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Top Threat Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-cyan-500/30 bg-slate-950/80 cyber-corners relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100 tracking-wider">
                DEFENSE COMMAND // LIVE RADAR
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold">
                ATTACK SURGE DETECTED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous inspection pipeline actively scanning LLM prompts, embeddings, and tool invocations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] text-slate-500">FIREWALL STATUS</span>
            <span className="text-xs text-emerald-400 font-bold tracking-widest glow-text-emerald">
              100% HARDENED
            </span>
          </div>
        </div>
      </div>

      {/* 4 Cyber Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="cyber-card cyber-corners p-5 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>INJECTION BLOCK RATE</span>
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 glow-text-emerald tracking-tight">
              99.8%
            </span>
            <span className="text-[10px] text-slate-500">542 BLOCKED</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Zero successful prompt breaches
          </div>
        </div>

        {/* Metric 2 */}
        <div className="cyber-card cyber-corners p-5 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>GUARDED AGENTS</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400 glow-text-cyan tracking-tight">
              12 / 12
            </span>
            <span className="text-[10px] text-slate-500">ONLINE</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            3 Multi-tenant sandboxes active
          </div>
        </div>

        {/* Metric 3 */}
        <div className="cyber-card cyber-corners p-5 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PII LEAKS SCRUBBED</span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400 tracking-tight">
              4,892
            </span>
            <span className="text-[10px] text-slate-500">REDACTIONS</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            AWS keys, SSNs, Credentials masked
          </div>
        </div>

        {/* Metric 4 */}
        <div className="cyber-card cyber-corners p-5 rounded-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>PIPELINE LATENCY</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-400 tracking-tight">
              14ms
            </span>
            <span className="text-[10px] text-slate-500">AVG MTTI</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            In-memory heuristic & regex engine
          </div>
        </div>
      </div>

      {/* Attack Timeline Chart */}
      <div className="cyber-card cyber-corners p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400" />
              ADVERSARIAL ATTACK FREQUENCY SPECTRUM (24H)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time timeline of intercepted jailbreaks, injection vectors, and exfiltration attempts.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              Injections
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]" />
              PII Redactions
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Jailbreak DAN
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={threatTimelineData}>
              <defs>
                <linearGradient id="colorInj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPii" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#020617', 
                  borderColor: '#06b6d4', 
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  boxShadow: '0 0 15px rgba(6,182,212,0.2)'
                }} 
              />
              <Area type="monotone" dataKey="injections" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorInj)" />
              <Area type="monotone" dataKey="pii_leaks" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorPii)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* High-Risk Pending Approvals (HITL Section) */}
      <div className="cyber-card cyber-danger-corners p-6 rounded-lg border-rose-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
            <div>
              <h3 className="text-sm font-bold text-rose-300 tracking-wider">
                PRIVILEGE ESCALATION & HIGH-RISK ACTIONS [HITL HOLD]
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous agent tool invocations halted pending Level 5 Root Security clearance.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold">
            {approvals.length} PENDING DECISIONS
          </span>
        </div>

        {approvals.length === 0 ? (
          <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded">
            All agent execution gates clear. No pending human overrides.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {approvals.map((appr) => (
              <div key={appr.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">
                      TOOL: <span className="text-rose-400 underline">{appr.tool_name}</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {appr.risk_tier || 'CRITICAL'}
                    </span>
                    <span className="text-[10px] text-slate-500">[{appr.requested_at}]</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Agent: <span className="text-cyan-300">{appr.agent_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono bg-slate-950/80 p-2 rounded border border-slate-900 overflow-x-auto max-w-xl">
                    {JSON.stringify(appr.parameters)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResolve(appr.id, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  >
                    <Check className="w-3.5 h-3.5" />
                    AUTHORIZE
                  </button>
                  <button
                    onClick={() => handleResolve(appr.id, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-bold transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    DENY & KILL
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
