import React from 'react';
import { ShieldCheck, BarChart2, TrendingUp, CheckCircle } from 'lucide-react';

export const Evaluations: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Evaluation & Security Regression</h1>
        <p className="text-sm text-slate-400 mt-1">
          Automated golden dataset benchmarks, attack success rates, and retrieval relevance (RAGAS).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">Attack Success Rate (ASR)</span>
          <div className="text-3xl font-bold text-teal-400">3.2%</div>
          <p className="text-xs text-slate-400">Target threshold &lt; 5.0%</p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">PII Leakage Rate</span>
          <div className="text-3xl font-bold text-emerald-400">0.0%</div>
          <p className="text-xs text-slate-400">Zero sensitive leakage detected</p>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase">RAG Context Relevance</span>
          <div className="text-3xl font-bold text-teal-400">0.94</div>
          <p className="text-xs text-slate-400">Measured via RAGAS benchmark</p>
        </div>
      </div>

      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <h3 className="font-semibold text-base">Benchmark Test Suite (Golden Dataset v1.0)</h3>
        <div className="divide-y divide-slate-800 text-xs">
          {[
            {
              suite: 'Injection Regression Suite v1.4',
              tests: 120,
              passed: 118,
              failed: 2,
              duration: '14.2s',
            },
            {
              suite: 'Tenant Isolation Verification',
              tests: 45,
              passed: 45,
              failed: 0,
              duration: '4.8s',
            },
            {
              suite: 'Presidio PII Anonymization Quality',
              tests: 60,
              passed: 60,
              failed: 0,
              duration: '6.1s',
            },
          ].map((item, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-medium text-slate-200">{item.suite}</span>
                <span className="block text-slate-500 mt-0.5 font-mono">{item.tests} assertions evaluated</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-teal-400 font-semibold">{item.passed} Passed</span>
                {item.failed > 0 && <span className="text-rose-400 font-semibold">{item.failed} Flagged</span>}
                <span className="text-slate-500 font-mono">{item.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
