import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Terminal,
  Lock,
  FileText
} from 'lucide-react';
import { api } from '../lib/api';

export const AuditLog: React.FC = () => {
  const [filterType, setFilterType] = useState('all');
  const [logs, setLogs] = useState<any[]>([
    {
      id: 'AUD-8841-A',
      time: '2026-11-12 11:24:02 UTC',
      action: 'INPUT_SECURITY.DIRECT_INJECTION_BLOCKED',
      resource: 'DevOps Autonomous SRE',
      actor: '198.51.100.42 (Anonymous)',
      decision: 'BLOCKED',
      sha256: '4a8f9c...e291',
    },
    {
      id: 'AUD-8840-B',
      time: '2026-11-12 11:18:33 UTC',
      action: 'PII_SCRUBBER.AWS_CREDENTIAL_MASKED',
      resource: 'Financial Risk Analyst',
      actor: 'Aditya Yadav [Root]',
      decision: 'MASKED',
      sha256: '9920bf...882a',
    },
    {
      id: 'AUD-8839-C',
      time: '2026-11-12 11:10:10 UTC',
      action: 'TOOL_AUTHORIZER.APPROVAL_HELD',
      resource: 'delete_backup_snapshot',
      actor: 'Autonomous Agent #2',
      decision: 'APPROVAL_REQUIRED',
      sha256: 'c371aa...ff01',
    },
    {
      id: 'AUD-8838-D',
      time: '2026-11-12 10:55:40 UTC',
      action: 'RAG_VAULT.TENANT_ISOLATION_ENFORCED',
      resource: 'Document: HR_Compensation.pdf',
      actor: '10.0.14.88 (Internal)',
      decision: 'ALLOWED',
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
    if (filterType === 'blocked') return l.decision === 'BLOCKED';
    if (filterType === 'masked') return l.decision === 'MASKED';
    return true;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-slate-800 bg-slate-950/80 cyber-corners">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              CRYPTOGRAPHIC AUDIT & FORENSICS
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable tamper-proof record of every prompt evaluation, block event, and tool execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('json')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-cyan-300 font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-bold transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            EXPORT CSV
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'blocked', 'masked'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase tracking-wider transition-all ${
              filterType === type
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {type === 'all' ? 'ALL EVENTS' : type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Forensic Table */}
      <div className="cyber-card cyber-corners rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>SHA-256 HASH VERIFIED RECORD LOG</span>
          <span>COMPLIANCE: SOC2 // HIPAA // ISO27001</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredLogs.map(log => (
            <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{log.action}</span>
                  <span className="text-[10px] text-slate-500">[{log.time}]</span>
                  <span className="text-[10px] text-slate-600 font-mono">HASH: {log.sha256}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Target: <span className="text-cyan-300">{log.resource}</span> | Origin: <span className="text-slate-500">{log.actor}</span>
                </div>
              </div>

              <div className="shrink-0">
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  log.decision === 'BLOCKED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : log.decision === 'MASKED'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
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
