import React, { useState, useEffect } from 'react';
import { 
  History, 
  Shield, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { api } from '../lib/api';

export const AuditLog: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [logs, setLogs] = useState<any[]>([
    {
      id: 'log-001',
      time: '2026-11-12 08:30:14 UTC',
      action: 'input.prompt_injection_flagged',
      resource: 'Agent: CustomerSupport-Agent',
      actor: 'External Caller',
      ip: '198.51.100.42',
      decision: 'BLOCKED',
      trace_id: 'trc-9941a8',
    },
    {
      id: 'log-002',
      time: '2026-11-12 08:24:02 UTC',
      action: 'tool.approval_requested',
      resource: 'Tool: delete_backup_snapshot',
      actor: 'DevOps & SRE Assistant',
      ip: '10.0.14.88',
      decision: 'APPROVAL_REQUIRED',
      trace_id: 'trc-8820f1',
    },
    {
      id: 'log-003',
      time: '2026-11-12 08:18:33 UTC',
      action: 'output.pii_redacted',
      resource: 'Agent: FinancialAnalyst',
      actor: 'Aditya Yadav',
      ip: '192.168.1.104',
      decision: 'MASKED',
      trace_id: 'trc-7719c2',
    },
    {
      id: 'log-004',
      time: '2026-11-12 08:10:10 UTC',
      action: 'document.retrieval_filtered',
      resource: 'Doc: hr_policy.md',
      actor: 'Aditya Yadav',
      ip: '192.168.1.104',
      decision: 'AUTHORIZED',
      trace_id: 'trc-6604e3',
    },
  ]);

  useEffect(() => {
    api.getAuditLogs()
      .then((data) => {
        if (data && data.length > 0) {
          setLogs(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleExport = () => {
    const jsonStr = JSON.stringify(logs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentinel_audit_trail_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = filterType === 'all'
    ? logs
    : logs.filter(l => l.action.toLowerCase().includes(filterType) || l.decision.toLowerCase().includes(filterType));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit & Telemetry Records</h1>
          <p className="text-sm text-slate-400 mt-1">
            Append-only tamper-evident logs, OpenTelemetry execution traces, and administrative actions.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 font-semibold text-sm rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Audit Trail (JSON)
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 text-xs">
        {[
          { label: 'ALL EVENTS', val: 'all' },
          { label: 'BLOCKED INJECTIONS', val: 'blocked' },
          { label: 'TOOL ACTIONS', val: 'tool' },
          { label: 'PII MASKED', val: 'masked' },
        ].map((item) => (
          <button
            key={item.val}
            onClick={() => setFilterType(item.val)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filterType === item.val
                ? 'bg-teal-500 text-slate-950 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Audit Logs Table */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Trace ID</th>
                <th className="pb-3">Action Type</th>
                <th className="pb-3">Resource Target</th>
                <th className="pb-3">Actor / Principal</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3">Security Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredLogs.map((row, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-mono text-slate-400">{row.time || row.created_at}</td>
                  <td className="font-mono text-teal-400/80">{row.trace_id || row.id?.slice(0, 8)}</td>
                  <td className="font-semibold text-slate-200">{row.action}</td>
                  <td>{row.resource || row.resource_type}</td>
                  <td>{row.actor || row.user_id || 'System'}</td>
                  <td className="font-mono text-slate-400">{row.ip || row.ip_address || '127.0.0.1'}</td>
                  <td>
                    <span
                      className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                        row.decision?.includes('BLOCK') || row.decision?.includes('REJECT')
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : row.decision?.includes('MASK')
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : row.decision?.includes('APPROVAL')
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}
                    >
                      {row.decision || 'LOGGED'}
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
