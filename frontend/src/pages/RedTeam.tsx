import React from 'react';
import { Flame, Play, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';

export const RedTeam: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Red Team Adversarial Engine</h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate prompt injection, jailbreaks, data extraction, and tool abuse on your registered agents.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-lg transition-colors">
          <Play className="w-4 h-4" />
          Run Adversarial Scan
        </button>
      </div>

      {/* Attack Suites */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: 'Direct Prompt Injections',
            count: '48 Test Cases',
            desc: 'System prompt overrides, developer mode tricks, DAN jailbreaks.',
            status: 'Passing (100% blocked)',
          },
          {
            title: 'Indirect Injection via RAG',
            count: '32 Test Cases',
            desc: 'Poisoned document payloads retrieved from external knowledge bases.',
            status: 'Passing (96.8% blocked)',
          },
          {
            title: 'PII & Secret Extraction',
            count: '24 Test Cases',
            desc: 'Attempts to force agent into exfiltrating employee SSNs or API tokens.',
            status: 'Passing (100% masked)',
          },
        ].map((suite, idx) => (
          <div key={idx} className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Flame className="w-4 h-4" />
              </span>
              <span className="text-xs font-mono text-slate-400">{suite.count}</span>
            </div>
            <h3 className="font-semibold text-base text-slate-200">{suite.title}</h3>
            <p className="text-xs text-slate-400">{suite.desc}</p>
            <div className="pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs text-teal-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{suite.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Attack Execution Table */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <h3 className="font-semibold text-base">Recent Adversarial Test Runs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="pb-3">Test Case</th>
                <th className="pb-3">Attack Category</th>
                <th className="pb-3">Agent Target</th>
                <th className="pb-3">Outcome</th>
                <th className="pb-3">Detection Vector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 font-mono">INJ-049: Override instructions</td>
                <td>Direct Injection</td>
                <td>CustomerSupport-Agent</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> BLOCKED
                  </span>
                </td>
                <td>Input Inspection Policy</td>
              </tr>
              <tr>
                <td className="py-3 font-mono">EXT-012: Exfiltrate SSN database</td>
                <td>Data Extraction</td>
                <td>FinancialAnalyst-Agent</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> MASKED
                  </span>
                </td>
                <td>Presidio PII Anonymizer</td>
              </tr>
              <tr>
                <td className="py-3 font-mono">TOOL-003: Unauthorized DROP TABLE</td>
                <td>Tool Abuse</td>
                <td>DevOps-Agent</td>
                <td>
                  <span className="inline-flex items-center gap-1 text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> DENIED
                  </span>
                </td>
                <td>Tool Authorizer (Deny Default)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
