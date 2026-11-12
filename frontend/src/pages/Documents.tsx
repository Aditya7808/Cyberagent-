import React, { useState, useEffect } from 'react';
import { 
  FileCode2, 
  Upload, 
  Lock, 
  Search, 
  Database,
  Plus,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';

export const Documents: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [docs, setDocs] = useState<any[]>([
    {
      title: 'corporate_security_policy.md',
      tenant: 'Acme Corporation',
      access: 'CONFIDENTIAL',
      chunks: 8,
      piiScrubbed: true,
      size: '14.2 KB',
      embeddings: '1,536-dim',
    },
    {
      id: 'doc-002',
      title: 'cloud_infra_runbook.json',
      tenant: 'Acme Corporation',
      access: 'RESTRICTED',
      chunks: 14,
      piiScrubbed: true,
      size: '42.1 KB',
      embeddings: '1,536-dim',
    },
    {
      id: 'doc-003',
      title: 'payment_gateway_api_spec.yaml',
      tenant: 'Global Bank',
      access: 'CONFIDENTIAL',
      chunks: 26,
      piiScrubbed: true,
      size: '68.0 KB',
      embeddings: '1,536-dim',
    },
    {
      id: 'doc-004',
      title: 'defense_avionics_specs.md',
      tenant: 'Wayne Enterprises',
      access: 'RESTRICTED',
      chunks: 48,
      piiScrubbed: true,
      size: '124.5 KB',
      embeddings: '1,536-dim',
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  const filteredDocs = docs.filter(doc => {
    if (selectedTenant === 'all') return true;
    return doc.tenant.toLowerCase().includes(selectedTenant.toLowerCase());
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg border border-slate-800 bg-slate-950/80 cyber-corners">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-cyan-950/60 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <FileCode2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              SECURE RAG VECTOR VAULT
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict multi-tenant document isolation with real-time PII scrubbing during vector ingestion.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">ALL TENANTS</option>
            <option value="Acme">ACME CORP</option>
            <option value="Global">GLOBAL BANK</option>
            <option value="Wayne">WAYNE ENTERPRISES</option>
          </select>
        </div>
      </div>

      {/* Semantic Vector Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RAG embeddings with semantic query..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
        >
          {isSearching ? 'SEARCHING...' : 'VECTOR SEARCH'}
        </button>
      </form>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc, idx) => (
          <div key={idx} className="cyber-card cyber-corners p-5 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-cyan-400" />
                {doc.title}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                doc.access === 'RESTRICTED'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {doc.access}
              </span>
            </div>

            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>TENANT: <span className="text-cyan-300">{doc.tenant}</span></span>
              <span className="text-slate-500">{doc.size}</span>
            </div>

            <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <EyeOff className="w-3.5 h-3.5" />
                PII Scrubbed
              </span>
              <span>{doc.chunks} Chunks ({doc.embeddings})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
