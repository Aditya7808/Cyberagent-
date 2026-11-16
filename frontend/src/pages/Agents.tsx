import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Terminal, Shield, Cpu, Layers, ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

export const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([
    {
      id: 'agent-devops-sre',
      name: 'DevOps Autonomous SRE',
      model_id: 'anthropic.claude-3-sonnet',
      status: 'Guarded',
      toolsCount: 4,
      guardrail_mode: 'HITL Approval Gate',
      description: 'Executes infrastructure runbooks, database optimizations, and telemetry diagnostics under continuous supervision.',
    },
    {
      id: 'agent-fin-advisory',
      name: 'Financial Risk Analyst Bot',
      model_id: 'anthropic.claude-3-sonnet',
      status: 'Guarded',
      toolsCount: 2,
      guardrail_mode: 'Strict PII Redaction',
      description: 'Queries internal ledgers, balances, and payroll reports with automated credential and identity masking.',
    },
    {
      id: 'agent-acme-hr',
      name: 'Corporate Policy & HR Agent',
      model_id: 'anthropic.claude-3-sonnet',
      status: 'Guarded',
      toolsCount: 3,
      guardrail_mode: 'Multi-Tenant Isolation',
      description: 'Provides sensitive employee guidance, benefits clarification, and policy retrieval with strict tenant boundaries.',
    },
  ]);

  useEffect(() => {
    api.getAgents()
      .then((data) => {
        if (data && data.length > 0) setAgents(data);
      })
      .catch(() => { });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Autonomous Agent Registry
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Connected LLM agents governed by SentinelAI real-time guardrails, tool approval gates, and data protection boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/playground')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20"
          >
            <Terminal className="w-4 h-4" />
            Open Firewall Playground
          </button>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="enterprise-card p-6 rounded-2xl flex flex-col justify-between space-y-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                  {agent.name}
                </span>
                <span className="badge-emerald px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {agent.status}
                </span>
              </div>

              <div className="text-xs text-indigo-500 dark:text-indigo-400 mt-1.5 flex items-center gap-1.5 font-medium">
                <Cpu className="w-3.5 h-3.5" />
                {agent.model_id.replace('anthropic.', '')}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                {agent.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Security Policy:</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-300">{agent.guardrail_mode || 'Enforced'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Registered Tools:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-300">{agent.toolsCount || 3} Bound APIs</span>
              </div>

              <button
                onClick={() => navigate('/playground')}
                className="w-full mt-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-200"
              >
                <span>Test Evasion & Security</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};