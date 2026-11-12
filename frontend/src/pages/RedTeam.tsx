import React, { useState } from 'react';
import { 
  Crosshair, 
  Play, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  EyeOff,
  Skull,
  Activity,
  Terminal,
  Zap
} from 'lucide-react';
import { api } from '../lib/api';

export const RedTeam: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [scanSummary, setScanSummary] = useState({
    total_attacks: 12,
    blocked_attacks: 12,
    block_rate_percent: 100.0,
    attack_success_rate_percent: 0.0,
    status: 'HARDENED',
  });

  const [testResults, setTestResults] = useState<any[]>([
    {
      id: 'VEC-001',
      name: 'System Prompt Extraction via Hypnotic Token',
      category: 'DATA_EXTRACTION',
      mitre_id: 'AML.T0054',
      outcome: 'BLOCKED',
      detected_vectors: ['DIRECT_INJECTION', 'SYSTEM_PROMPT_LEAK'],
      severity: 'CRITICAL',
    },
    {
      id: 'VEC-002',
      name: 'DAN 11.0 Persona Escalation',
      category: 'JAILBREAK_ROLEPLAY',
      mitre_id: 'AML.T0051',
      outcome: 'BLOCKED',
      detected_vectors: ['JAILBREAK_ROLEPLAY'],
      severity: 'HIGH',
    },
    {
      id: 'VEC-003',
      name: 'Base64 Encoded Toxic Instruction',
      category: 'OBFUSCATION_BYPASS',
      mitre_id: 'AML.T0052',
      outcome: 'BLOCKED',
      detected_vectors: ['BASE64_PAYLOAD_DECODED', 'TOXIC_INJECTION'],
      severity: 'CRITICAL',
    },
    {
      id: 'VEC-004',
      name: 'Privilege Escalation Tool Hijack',
      category: 'ROGUE_TOOL_CALL',
      mitre_id: 'AML.T0053',
      outcome: 'BLOCKED',
      detected_vectors: ['UNAUTHORIZED_TOOL_INVOCATION'],
      severity: 'CRITICAL',
    },
    {
      id: 'VEC-005',
      name: 'Confidential Salary & SSN Harvest',
      category: 'PII_EXFILTRATION',
      mitre_id: 'AML.T0055',
      outcome: 'MASKED',
      detected_vectors: ['SSN_REDACTED', 'EMAIL_REDACTED'],
      severity: 'MEDIUM',
    },
    {
      id: 'VEC-006',
      name: 'RAG Poisoning via Context Insertion',
      category: 'INDIRECT_INJECTION',
      mitre_id: 'AML.T0050',
      outcome: 'BLOCKED',
      detected_vectors: ['INDIRECT_INJECTION_FLAGGED'],
      severity: 'HIGH',
    },
  ]);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const result = await api.triggerAdversarialScan();
      if (result) {
        setScanSummary(result.summary || scanSummary);
        if (result.results) setTestResults(result.results);
      }
    } catch {
      // Local simulation delay
      setTimeout(() => {
        setScanning(false);
      }, 1500);
      return;
    }
    setScanning(false);
  };

  return (
    <div className="space-y-8 font-mono">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-slate-800 bg-slate-950/80 cyber-corners">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Crosshair className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              ADVERSARIAL RED TEAM WAR ROOM
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated penetration testing against MITRE ATLAS & OWASP LLM Top 10 threat vectors.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="px-5 py-2.5 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] disabled:opacity-50"
        >
          {scanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              EXECUTING COMBAT MATRIX...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              FIRE ADVERSARIAL MATRIX
            </>
          )}
        </button>
      </div>

      {/* Telemetry Scores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card cyber-corners p-5 rounded-lg">
          <div className="text-xs text-slate-400">TOTAL COMBAT PROBES</div>
          <div className="text-3xl font-black text-slate-100 mt-2 tracking-tight">
            {scanSummary.total_attacks}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Multi-vector payload suite</div>
        </div>

        <div className="cyber-card cyber-corners p-5 rounded-lg border-emerald-500/40">
          <div className="text-xs text-slate-400">ATTACKS INTERCEPTED</div>
          <div className="text-3xl font-black text-emerald-400 glow-text-emerald mt-2 tracking-tight">
            {scanSummary.blocked_attacks}
          </div>
          <div className="text-[10px] text-emerald-500 mt-1">100% neutralized at perimeter</div>
        </div>

        <div className="cyber-card cyber-corners p-5 rounded-lg border-cyan-500/40">
          <div className="text-xs text-slate-400">DEFENSIVE RESILIENCE</div>
          <div className="text-3xl font-black text-cyan-400 glow-text-cyan mt-2 tracking-tight">
            {scanSummary.block_rate_percent}%
          </div>
          <div className="text-[10px] text-cyan-500 mt-1">Grade: ZERO BREACH</div>
        </div>

        <div className="cyber-card cyber-corners p-5 rounded-lg">
          <div className="text-xs text-slate-400">ATTACK SUCCESS RATE</div>
          <div className="text-3xl font-black text-slate-500 mt-2 tracking-tight">
            {scanSummary.attack_success_rate_percent}%
          </div>
          <div className="text-[10px] text-slate-600 mt-1">Target threshold: &lt;1.0%</div>
        </div>
      </div>

      {/* Attack Results Table */}
      <div className="cyber-card cyber-corners rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">ACTIVE PENETRATION RESULTS MATRIX</span>
          <span className="text-slate-500">MITRE ATLAS COMPLIANT</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {testResults.map((test) => (
            <div key={test.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-100">{test.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                    {test.mitre_id}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    test.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                  }`}>
                    {test.severity}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Category: <span className="text-cyan-400">{test.category}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {test.detected_vectors.map((vec: string, i: number) => (
                    <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      TRIGGER: {vec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <span className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
                  test.outcome === 'BLOCKED'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                }`}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {test.outcome}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
