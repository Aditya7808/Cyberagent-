import React from 'react';
import { History, Shield, Search, Filter } from 'lucide-react';

export const AuditLog: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit & Telemetry Records</h1>
          <p className="text-sm text-slate-400 mt-1">
            Append-only tamper-evident logs, OpenTelemetry execution traces, and administrative actions.
          </p>
        </div>
      </div>

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Action</th>
                <th className="pb-3">Resource Type</th>
                <th className="pb-3">Agent / User</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {[
                {
                  time: '2026-11-12 01:20:14 UTC',
                  action: 'agent.tool_call_intercepted',
                  resource: 'Tool: execute_sql_query',
                  actor: 'CustomerSupport-Agent',
                  ip: '10.0.14.88',
                  decision: 'BLOCKED_BY_POLICY',
                },
                {
                  time: '2026-11-12 01:14:02 UTC',
                  action: 'document.retrieval_filtered',
                  resource: 'Doc: hr_policy.md',
                  actor: 'Aditya Yadav',
                  ip: '192.168.1.104',
                  decision: 'AUTHORIZED',
                },
                {
                  time: '2026-11-12 00:58:33 UTC',
                  action: 'input.prompt_injection_flagged',
                  resource: 'Agent: FinancialAnalyst',
                  actor: 'Anonymous User',
                  ip: '198.51.100.42',
                  decision: 'BLOCKED',
                },
                {
                  time: '2026-11-12 00:45:10 UTC',
                  action: 'agent.registered',
                  resource: 'Agent: DevOps-Agent',
                  actor: 'Aditya Yadav',
                  ip: '192.168.1.104',
                  decision: 'COMMITTED',
                },
              ].map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-mono text-slate-400">{row.time}</td>
                  <td className="font-semibold text-slate-200">{row.action}</td>
                  <td>{row.resource}</td>
                  <td>{row.actor}</td>
                  <td className="font-mono text-slate-400">{row.ip}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                      row.decision.includes('BLOCKED')
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    }`}>
                      {row.decision}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

