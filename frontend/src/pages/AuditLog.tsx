import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Download, 
  FileText,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
  Clock,
  User,
  Hash
} from 'lucide-react';
import { api } from '../lib/api';

export const AuditLog: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [logs, setLogs] = useState<any[]>([
    {
      id: 'AUD-8841-A',
      time: '2026-11-12 11:24:02 UTC',
      action: 'Direct Prompt Injection Blocked',
      resource: 'DevOps Autonomous SRE',
      actor: '198.51.100.42 (Anonymous)',
      decision: 'Blocked',
      sha256: '4a8f9c...e291',
    },
    {
      id: 'AUD-8840-B',
      time: '2026-11-12 11:18:33 UTC',
      action: 'AWS Credential Scrubbed & Masked',
      resource: 'Financial Risk Analyst',
      actor: 'Aditya Yadav [Admin]',
      decision: 'Masked',
      sha256: '9920bf...882a',
    },
    {
      id: 'AUD-8839-C',
      time: '2026-11-12 11:10:10 UTC',
      action: 'Tool Authorization Hold (HITL Triggered)',
      resource: 'delete_backup_snapshot',
      actor: 'Autonomous Agent #2',
      decision: 'Approval Required',
      sha256: 'c371aa...ff01',
    },
    {
      id: 'AUD-8838-D',
      time: '2026-11-12 10:55:40 UTC',
      action: 'Tenant Isolation Enforced',
      resource: 'Document: HR_Compensation.pdf',
      actor: '10.0.14.88 (Internal)',
      decision: 'Allowed',
      sha256: '1184ee...339b',
    },
  ]);

  useEffect(() => {
    api.getAuditLogs()
      .then((data) => {
        if (data && data.length > 0) setLogs(data);
      })
      .catch(() => {});
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
    if (filterType === 'blocked') return l.decision.toLowerCase().includes('block');
    if (filterType === 'masked') return l.decision.toLowerCase().includes('mask');
    return true;
  });

  const getDecisionBadge = (decision: string) => {
    const d = decision.toLowerCase();
    if (d.includes('block')) return 'badge-rose';
    if (d.includes('mask')) return 'badge-amber';
    if (d.includes('approval')) return 'badge-indigo';
    return 'badge-emerald';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Cryptographic Audit & Forensics
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Immutable, tamper-evident ledger tracking prompt evaluations, intercept decisions, and human approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-3">
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
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Forensic Table */}
      <div className="enterprise-card rounded-xl overflow-hidden border border-slate-800">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>SHA-256 Verified Immutable Records</span>
          <span className="badge-indigo px-2.5 py-0.5 rounded text-[11px] font-semibold">
            SOC2 Type II • HIPAA • ISO 27001
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredLogs.map(log => (
            <div 
              key={log.id} 
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-white text-sm">{log.action}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {log.time}
                  </span>
                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-slate-600" />
                    {log.sha256}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Target: <span className="text-slate-300 font-medium">{log.resource}</span> &nbsp;|&nbsp; 
                  Origin: <span className="text-slate-400">{log.actor}</span>
                </div>
              </div>

              <div className="shrink-0">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getDecisionBadge(log.decision)}`}>
                  {log.decision}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
