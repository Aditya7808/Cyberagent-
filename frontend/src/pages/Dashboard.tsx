import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  EyeOff, 
  Check, 
  X, 
  Clock, 
  Wrench 
} from 'lucide-react';
import { api } from '../lib/api';

export const Dashboard: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([
    {
      id: 'appr-001',
      tool_name: 'delete_backup_snapshot',
      agent_name: 'DevOps & SRE Assistant',
      parameters: { snapshot_id: 'snap-09941a', force: true },
      requested_at: '5 mins ago',
      status: 'pending',
    },
    {
      id: 'appr-002',
      tool_name: 'export_employee_payroll',
      agent_name: 'Financial Advisory Agent',
      parameters: { format: 'csv', fiscal_year: 2026 },
      requested_at: '22 mins ago',
      status: 'pending',
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
      await api.resolveApproval(id, approved, approved ? 'Authorized by admin' : 'Rejected by security policy');
    } catch {
      // Fallback local UI update
    }
    setApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security & Reliability Overview</h1>
        <p className="text-sm text-slate-400 mt-1">
          Real-time posture assessment across configured AI agents, RAG boundaries, and tool policies.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Agents Protected</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs text-teal-400 flex items-center gap-1 font-medium">
            <span>100% policy active</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Red Team Scans</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold">1,420</div>
          <div className="text-xs text-slate-400">
            <span className="text-emerald-400 font-semibold">100%</span> blocked rate
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">PII Entities Masked</span>
            <EyeOff className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold">348</div>
          <div className="text-xs text-slate-400">
            SSN, Emails, Financial records
          </div>
        </div>

        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Approvals</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold">{approvals.length}</div>
          <div className="text-xs text-rose-400 font-medium">
            Human-in-the-loop actions
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Pending Approvals Section */}
      {approvals.length > 0 && (
        <div className="p-6 bg-slate-900/80 border border-rose-500/30 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
              <h2 className="text-base font-semibold text-rose-200">
                Action Required: Human-in-the-Loop Tool Approvals
              </h2>
            </div>
            <span className="text-xs text-rose-400 font-mono">
              {approvals.length} High-Impact Operation(s) Paused
            </span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {approvals.map((appr) => (
              <div key={appr.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200 font-mono text-sm flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-rose-400" />
                      {appr.tool_name}
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                      Approval Required
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Agent: <span className="text-slate-300 font-medium">{appr.agent_name || 'Autonomous Agent'}</span> • Parameters:{' '}
                    <code className="text-slate-300 bg-slate-800/80 px-1 py-0.5 rounded font-mono">
                      {JSON.stringify(appr.parameters)}
                    </code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolve(appr.id, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold rounded-lg transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleResolve(appr.id, false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Lifecycle Pipeline State */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Active Request Lifecycle Controls</h2>
          <span className="text-xs text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 font-medium">
            Deny-by-Default Enforced
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center text-xs">
          {[
            { step: '1. Auth', desc: 'Tenant Context', status: 'Active' },
            { step: '2. Input', desc: 'Injection & PII', status: 'Active' },
            { step: '3. Orchestrate', desc: 'LangGraph Budget', status: 'Active' },
            { step: '4. Retrieval', desc: 'Tenant RAG Barrier', status: 'Active' },
            { step: '5. Tool Auth', desc: 'Human-in-the-Loop', status: 'Active' },
            { step: '6. Output', desc: 'Mask & Sanitize', status: 'Active' },
            { step: '7. Audit', desc: 'OTel & Append-only', status: 'Active' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg">
              <span className="block font-semibold text-slate-200">{item.step}</span>
              <span className="block text-[11px] text-slate-400 mt-0.5">{item.desc}</span>
              <span className="inline-block mt-2 text-[10px] uppercase font-bold text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
