import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Check,
  X,
  Terminal,
  Activity,
  Zap,
  Lock,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  FileText,
  Clock,
  RotateCcw,
  Sparkles,
  Cpu,
  BrainCircuit,
  ShieldCheck,
  ShieldOff,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const threatTimelineData = [
  { time: '00:00', injections: 0, pii_leaks: 0, jailbreaks: 0 },
  { time: '04:00', injections: 0, pii_leaks: 0, jailbreaks: 0 },
  { time: '08:00', injections: 0, pii_leaks: 0, jailbreaks: 0 },
  { time: '12:00', injections: 0, pii_leaks: 0, jailbreaks: 0 },
  { time: '16:00', injections: 0, pii_leaks: 0, jailbreaks: 0 },
  { time: '20:00', injections: 0, pii_leaks: 0, jailbreaks: 0 },
  { time: 'Live', injections: 0, pii_leaks: 0, jailbreaks: 0 },
];

const defaultAttackDistribution = [
  { name: 'Direct Injection', value: 0, color: '#f43f5e' },
  { name: 'PII Exfiltration', value: 0, color: '#06b6d4' },
  { name: 'Jailbreak Attempt', value: 0, color: '#f59e0b' },
  { name: 'Tool Hijack', value: 0, color: '#8b5cf6' },
];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [approvals, setApprovals] = useState<any[]>([]);
  const [activeRange, setActiveRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('Sentinel AI Gateway armed. Ready for live adversarial tests.');

  const [metrics, setMetrics] = useState<any>({
    prompt_injection_defense: {
      rate_percent: 100.0,
      intercepted_count: 0,
      breaches_count: 0,
      change_percent: '+0.0%',
    },
    pii_redactions: {
      total_entities_masked: 0,
      detected_recent: 0,
      engines: 'Presidio + spaCy NER',
      formats: 'AWS, SSN, PAN',
    },
    guarded_agents: {
      active_count: 3,
      total_count: 3,
      health_status: '100% Healthy',
      sandboxes: '3 Tenant Sandboxes',
    },
    inspection_latency: {
      avg_ms: 12,
      label: 'Avg MTTI',
      engine: 'In-Memory Heuristic',
    },
    timeline: threatTimelineData,
    distribution: defaultAttackDistribution,
  });

  // Simulate AI insight generation
  useEffect(() => {
    const insights = [
      'Sentinel AI Gateway armed. Ready for live adversarial probes in Playground.',
      'Heuristic AST parser active. Zero-LLM delay active on all prompt boundaries.',
      'PII scrubber armed with Presidio + spaCy NER regex filters.',
      'Human-in-the-Loop gatekeeper standing by for destructive tool invocations.',
    ];
    let idx = 0;
    setAiInsight(insights[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % insights.length;
      setAiInsight(insights[idx]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardMetrics(activeRange);
      if (data) {
        setMetrics(data);
      }
      const apprs = await api.getApprovals('pending');
      setApprovals(apprs || []);
    } catch {
      // Keep state if offline
    } finally {
      setLoading(false);
    }
  };

  const handleResetTelemetry = async () => {
    if (!window.confirm('Reset all dashboard telemetry, attack counts, and audit logs to zero?')) return;
    try {
      setResetting(true);
      await api.resetTelemetry();
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to reset telemetry', err);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6000); // Live poll every 6s
    return () => clearInterval(interval);
  }, [activeRange]);

  const handleResolve = async (id: string, approved: boolean) => {
    try {
      await api.resolveApproval(id, approved, approved ? 'Override authorized by Root Admin' : 'Action denied by Security Policy');
    } catch {
      // Local fallback
    }
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const getRiskBadge = (tier: string) => {
    switch (tier.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Threat Radar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Defense Command & Threat Radar
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                Active Intercept
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sub-15ms heuristic inspection scanning LLM inputs, tool invocations, and RAG embeddings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            Refresh Radar
          </button>
          <button
            onClick={handleResetTelemetry}
            disabled={resetting || loading}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Reset telemetry counters and audit events back to zero"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            Reset to Zero
          </button>
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 p-4 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="absolute inset-0 rounded-lg bg-indigo-500/20 animate-ping opacity-20" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-indigo-400 dark:text-indigo-300">Sentinel AI Insight</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">LIVE</span>
          </div>
          <p className="text-xs text-slate-300 dark:text-slate-400 truncate">{aiInsight}</p>
        </div>
        <Sparkles className="w-4 h-4 text-indigo-400/50 flex-shrink-0" />
      </div>

      {/* 4 High-Impact KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="enterprise-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Prompt Injection Defense</span>
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {metrics.prompt_injection_defense?.rate_percent ?? 100}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
              <TrendingUp className="w-3 h-3" /> {metrics.prompt_injection_defense?.change_percent ?? '+0.0%'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>{metrics.prompt_injection_defense?.intercepted_count ?? 0} Intercepted</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{metrics.prompt_injection_defense?.breaches_count ?? 0} Breaches</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="enterprise-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">PII & Secret Redactions</span>
            <div className="w-7 h-7 rounded-md bg-cyan-500/10 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {(metrics.pii_redactions?.total_entities_masked ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Entities Masked</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>{metrics.pii_redactions?.engines || 'Presidio + spaCy NER'}</span>
            <span>{metrics.pii_redactions?.formats || 'AWS, SSN, PAN'}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="enterprise-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Guarded Agents</span>
            <div className="w-7 h-7 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
              <Terminal className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {metrics.guarded_agents?.active_count ?? 3} Active
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {metrics.guarded_agents?.health_status || '100% Healthy'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>{metrics.guarded_agents?.sandboxes || '3 Agent Sandboxes'}</span>
            <span className="text-slate-500 dark:text-slate-400">LangGraph Active</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="enterprise-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Inspection Latency</span>
            <div className="w-7 h-7 rounded-md bg-violet-500/10 flex items-center justify-center text-violet-500 dark:text-violet-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {metrics.inspection_latency?.avg_ms ?? 12}ms
            </span>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
              {metrics.inspection_latency?.label || 'Avg MTTI'}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>{metrics.inspection_latency?.engine || 'In-Memory Heuristic'}</span>
            <span>Zero-LLM Delay</span>
          </div>
        </div>
      </div>

      {/* Attack Frequency Spectrum Chart */}
      <div className="enterprise-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Adversarial Attack Frequency Spectrum
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hourly volumetric timeline of intercepted prompt injections, secret exfiltrations, and jailbreaks.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                Direct Injections
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
                PII Redactions
              </span>
            </div>

            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 text-xs">
              <button
                onClick={() => setActiveRange('24h')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${activeRange === '24h' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                24H
              </button>
              <button
                onClick={() => setActiveRange('7d')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${activeRange === '7d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                7D
              </button>
              <button
                onClick={() => setActiveRange('30d')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${activeRange === '30d' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                30D
              </button>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.timeline || threatTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPii" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
              <XAxis dataKey="time" stroke={isLight ? '#94a3b8' : '#64748b'} tick={{ fontSize: 12, fill: isLight ? '#475569' : '#94a3b8' }} />
              <YAxis stroke={isLight ? '#94a3b8' : '#64748b'} tick={{ fontSize: 12, fill: isLight ? '#475569' : '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                  borderColor: isLight ? '#cbd5e1' : '#334155',
                  borderRadius: '8px',
                  boxShadow: isLight ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  color: isLight ? '#0f172a' : '#f8fafc',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="injections" name="Direct Injections" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorInj)" />
              <Area type="monotone" dataKey="pii_leaks" name="PII Redactions" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPii)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attack Distribution & HITL Queue Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Distribution Donut */}
        <div className="enterprise-card p-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
            Attack Vector Distribution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Breakdown of adversarial probe categories this period.
          </p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.distribution || defaultAttackDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {(metrics.distribution || defaultAttackDistribution).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                    borderColor: isLight ? '#cbd5e1' : '#334155',
                    borderRadius: '8px',
                    color: isLight ? '#0f172a' : '#f8fafc',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {(metrics.distribution || defaultAttackDistribution).map((item: any) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-300">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* HITL Queue - spans 2 columns */}
        <div className="enterprise-card p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Privilege Escalation & High-Risk Tool Gatekeeper
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20">
                  {approvals.length} Pending Actions
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Destructive autonomous tool executions halted pending Root Administrator authorization.
              </p>
            </div>
          </div>

          {approvals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400/60 mb-2" />
              <p className="font-medium text-slate-800 dark:text-slate-300">All tool actions cleared</p>
              <p className="text-slate-500 text-[11px] mt-0.5">No autonomous actions currently held in queue.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {approvals.map((appr) => {
                const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';
                return (
                  <div
                    key={appr.id}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRiskBadge(appr.risk_tier)}`}>
                          {appr.risk_tier}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {appr.tool_name}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {appr.requested_at}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Initiated by: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{appr.agent_name}</span>
                      </div>

                      {/* Parameters Preview */}
                      <div className="mt-2 p-2.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto">
                        {JSON.stringify(appr.parameters)}
                      </div>
                    </div>

                    {/* Authorization Controls */}
                    <div className="flex items-center gap-2.5 pt-2 lg:pt-0">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => handleResolve(appr.id, true)}
                            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            Authorize Execution
                          </button>
                          <button
                            onClick={() => handleResolve(appr.id, false)}
                            className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Deny & Kill
                          </button>
                        </>
                      ) : (
                        <div className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          Root L5 Clearance Required
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};