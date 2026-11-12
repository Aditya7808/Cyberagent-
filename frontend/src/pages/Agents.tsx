import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Terminal, Shield, Cpu, Activity } from 'lucide-react';
import { api } from '../lib/api';

export const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([
    {
      id: 'agent-devops-sre',
      name: 'DevOps Autonomous SRE',
      model_id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      status: 'GUARDED',
      toolsCount: 4,
      guardrail_mode: 'HITL LEVEL 5 OVERRIDE',
      description: 'Executes incident runbooks, database optimizations, and telemetry diagnostics.',
    },
    {
      id: 'agent-fin-advisory',
      name: 'Financial Risk Analyst Bot',
      model_id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      status: 'GUARDED',
      toolsCount: 2,
      guardrail_mode: 'PII STRIP STRICT',
      description: 'Queries internal ledgers, balances, and payroll reports with automated redaction.',
    },
    {
      id: 'agent-acme-hr',
      name: 'Corporate Policy & HR Agent',
      model_id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      status: 'GUARDED',
      toolsCount: 3,
      guardrail_mode: 'TENANT ISOLATED',
      description: 'Answers sensitive employee inquiries and compensation guidelines.',
    },
  ]);

  useEffect(() => {
    api.getAgents()
      .then((data) => {
        if (data && data.length > 0) setAgents(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-slate-800 bg-slate-950/80 cyber-corners">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              AUTONOMOUS AGENT REGISTRY & PERIMETER
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Active LLM agents operating under SentinelAI runtime governance boundaries.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/playground')}
          className="flex items-center gap-2 px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          <Terminal className="w-3.5 h-3.5" />
          OPEN INJECTION TESTBED
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {agents.map((agent) => (
          <div key={agent.id} className="cyber-card cyber-corners p-5 rounded-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100">{agent.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  {agent.status}
                </span>
              </div>

              <div className="text-[11px] text-cyan-400/80 mt-1 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                {agent.model_id.split('.')[1] || agent.model_id}
              </div>

              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {agent.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-900 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">GUARDRAIL MODE:</span>
                <span className="text-amber-400 font-bold">{agent.guardrail_mode || 'ENFORCED'}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">BOUND TOOLS:</span>
                <span className="text-slate-300">{agent.toolsCount || 3} Tools registered</span>
              </div>

              <button
                onClick={() => navigate('/playground')}
                className="w-full mt-2 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Terminal className="w-3 h-3" />
                PROBE DEFENSES
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
