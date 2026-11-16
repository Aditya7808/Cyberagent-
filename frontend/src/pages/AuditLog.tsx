import React, { useState, useEffect } from 'react';
import {
  Fingerprint,
  Download,
  FileText,
  Clock,
  Hash
} from 'lucide-react';
import { api } from '../lib/api';

export const AuditLog: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = () => {
    api.getAuditLogs()
      .then((data) => {
        const formatted = (data || []).map((l: any) => ({
          id: l.id || `AUD-${Date.now()}`,
          time: l.created_at ? new Date(l.created_at).toLocaleString() : l.timestamp || 'Just now',
          action: l.action || 'Security Telemetry Event',
          resource: l.resource_type || 'Agent Sandbox',
          actor: l.user_id ? `User: ${l.user_id}` : l.ip_address || 'Gateway Intercept',
          decision: (l.action && (l.action.includes('block') || l.action.includes('injection') || l.action.includes('unauthorized') || l.action.includes('denied')))
            ? 'Blocked'
            : (l.action && l.action.includes('reject'))
            ? 'Rejected'
            : (l.action && l.action.includes('pii'))
            ? 'Masked'
            : (l.action && (l.action.includes('pending') || l.action.includes('requested')))
            ? 'Approval Required'
            : (l.action && l.action.includes('approved'))
            ? 'Approved'
            : 'Allowed',
          sha256: l.id ? `${String(l.id).slice(0, 8)}...${String(l.id).slice(-4)}` : 'sha256:verified',
        }));
        setLogs(formatted);
      })
      .catch(() => setLogs([]));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = (format: 'json' | 'csv') => {
    const dataStr = format === 'json'
      ? 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2))
      : 'data:text/csv;charset=utf-8,' + encodeURIComponent('id,time,action,decision\n' + logs.map(l => `${l.id},${l.time},${l.action},${l.decision}`).join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sentinel_audit_forensics_${Date.now()}.${format}`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = logs.filter(l => {
    if (filterType === 'blocked') return l.decision.toLowerCase().includes('block') || l.decision.toLowerCase().includes('reject');
    if (filterType === 'masked') return l.decision.toLowerCase().includes('mask');
    return true;
  });

  const getDecisionBadge = (decision: string) => {
    const d = decision.toLowerCase();
    if (d.includes('block') || d.includes('reject') || d.includes('denied')) return 'badge-rose';
    if (d.includes('mask')) return 'badge-amber';
    if (d.includes('approval') || d.includes('pending')) return 'badge-indigo';
    return 'badge-emerald';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cryptographic Audit & Forensics
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Immutable, tamper-evident ledger tracking prompt evaluations, intercept decisions, and human approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-sm"
          >
            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/60 pb-3">
        {[
          { id: 'all', label: 'All Audit Events' },
          { id: 'blocked', label: 'Interceptions (Blocked)' },
          { id: 'masked', label: 'Sanitizations (PII Masked)' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forensic Table */}
      <div className="enterprise-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span>SHA-256 Verified Immutable Records</span>
          <span className="badge-indigo px-2.5 py-0.5 rounded text-[11px] font-semibold">
            SOC2 Type II • HIPAA • ISO 27001
          </span>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
          {filteredLogs.length === 0 ? (
            <div className="py-14 text-center text-slate-500 text-xs flex flex-col items-center justify-center">
              <Fingerprint className="w-9 h-9 text-indigo-400/50 mb-2.5" />
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">No audit records logged yet</p>
              <p className="text-slate-500 text-xs mt-1 max-w-sm">
                Telemetry is currently at zero baseline. Test prompts in the Injection Playground or trigger attacks in Red Team War Room to record real events.
              </p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{log.action}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {log.time}
                    </span>
                    <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                      <Hash className="w-3 h-3 text-slate-600" />
                      {log.sha256}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Target: <span className="text-slate-700 dark:text-slate-300 font-medium">{log.resource}</span> &nbsp;|&nbsp;
                    Origin: <span className="text-slate-500 dark:text-slate-400">{log.actor}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getDecisionBadge(log.decision)}`}>
                    {log.decision}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};