import React from 'react';
import { Bot, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';

export const Agents: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Registry</h1>
          <p className="text-sm text-slate-400 mt-1">
            Register and configure enterprise AI agents with least-privilege tool allowlists and safety policies.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Register Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Customer Support Assistant',
            model: 'anthropic.claude-3-sonnet-20240229-v1:0',
            status: 'active',
            toolsCount: 3,
            guardrails: 'Strict Mode',
            description: 'Handles customer policy inquiries and ticketing with strict PII masking.',
          },
          {
            name: 'Financial Advisory Agent',
            model: 'anthropic.claude-3-sonnet-20240229-v1:0',
            status: 'active',
            toolsCount: 2,
            guardrails: 'Human Approval Required',
            description: 'Queries internal quarterly financial metrics and bank ledgers.',
          },
          {
            name: 'DevOps & SRE Assistant',
            model: 'anthropic.claude-3-sonnet-20240229-v1:0',
            status: 'draft',
            toolsCount: 4,
            guardrails: 'Execution Budget Capped',
            description: 'Assists engineers with incident runbooks and telemetry queries.',
          },
        ].map((agent, idx) => (
          <div key={idx} className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                  <Bot className="w-5 h-5" />
                </div>
                <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                  agent.status === 'active' 
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {agent.status}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-base text-slate-200">{agent.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{agent.description}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Foundation Model</span>
                <span className="font-mono text-slate-300">Claude 3 Sonnet</span>
              </div>
              <div className="flex justify-between">
                <span>Authorized Tools</span>
                <span className="text-slate-300 font-semibold">{agent.toolsCount} attached</span>
              </div>
              <div className="flex justify-between">
                <span>Guardrail Policy</span>
                <span className="text-teal-400 font-medium">{agent.guardrails}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
