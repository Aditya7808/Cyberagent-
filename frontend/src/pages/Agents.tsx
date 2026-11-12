import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Plus, Terminal } from 'lucide-react';
import { api } from '../lib/api';

export const Agents: React.FC = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([
    {
      id: 'agent-acme-hr',
      name: 'Customer Support Assistant',
      model_id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      status: 'active',
      toolsCount: 3,
      guardrails: 'Strict Mode',
      description: 'Handles customer policy inquiries and ticketing with strict PII masking.',
    },
    {
      id: 'agent-fin-advisory',
      name: 'Financial Advisory Agent',
      model_id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      status: 'active',
      toolsCount: 2,
      guardrails: 'Human Approval Required',
      description: 'Queries internal quarterly financial metrics and bank ledgers.',
    },
    {
      id: 'agent-devops-sre',
      name: 'DevOps & SRE Assistant',
      model_id: 'anthropic.claude-3-sonnet-20240229-v1:0',
      status: 'draft',
      toolsCount: 4,
      guardrails: 'Execution Budget Capped',
      description: 'Assists engineers with incident runbooks and telemetry queries.',
    },
  ]);

  useEffect(() => {
    api.getAgents()
      .then((data) => {
        if (data && data.length > 0) {
          setAgents(data);
        }
      })
      .catch(() => {
        // Keep initial fallback agents
      });
  }, []);

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
        {agents.map((agent, idx) => (
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
                <span className="font-mono text-slate-300">{agent.model_id?.split('.')?.pop() || 'Claude 3'}</span>
              </div>
              <div className="flex justify-between">
                <span>Guardrail Policy</span>
                <span className="text-teal-400 font-medium">{agent.guardrails || 'Strict Mode'}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/playground')}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700/80 text-teal-400 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Launch in Playground
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
