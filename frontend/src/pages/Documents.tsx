import React, { useState } from 'react';
import {
  FileCode2,
  Search,
  Database,
  EyeOff,
  Building,
  HardDrive,
  Layers,
  ShieldCheck
} from 'lucide-react';

export const Documents: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [docs] = useState<any[]>([
    {
      id: 'doc-001',
      title: 'corporate_security_policy.md',
      tenant: 'Acme Corporation',
      access: 'Confidential',
      chunks: 8,
      piiScrubbed: true,
      size: '14.2 KB',
      embeddings: '1,536-dim text-embedding-3',
    },
    {
      id: 'doc-002',
      title: 'cloud_infra_runbook.json',
      tenant: 'Acme Corporation',
      access: 'Restricted',
      chunks: 14,
      piiScrubbed: true,
      size: '42.1 KB',
      embeddings: '1,536-dim text-embedding-3',
    },
    {
      id: 'doc-003',
      title: 'payment_gateway_api_spec.yaml',
      tenant: 'Global Bank',
      access: 'Confidential',
      chunks: 26,
      piiScrubbed: true,
      size: '68.0 KB',
      embeddings: '1,536-dim text-embedding-3',
    },
    {
      id: 'doc-004',
      title: 'defense_avionics_specs.md',
      tenant: 'Wayne Enterprises',
      access: 'Restricted',
      chunks: 48,
      piiScrubbed: true,
      size: '124.5 KB',
      embeddings: '1,536-dim text-embedding-3',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Secure RAG Vector Vault
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Multi-tenant document isolation with automatic PII sanitization and role-governed semantic retrieval.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Tenant Filter:</span>
          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Enterprise Tenants</option>
            <option value="Acme">Acme Corporation</option>
            <option value="Global">Global Bank</option>
            <option value="Wayne">Wayne Enterprises</option>
          </select>
        </div>
      </div>

      {/* Semantic Vector Search */}
      <form onSubmit={handleSearch} className="flex gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RAG knowledge base via semantic embeddings query..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          {isSearching ? 'Querying...' : 'Semantic Search'}
        </button>
      </form>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="enterprise-card p-5 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-indigo-400" />
                {doc.title}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                doc.access === 'Restricted' ? 'badge-rose' : 'badge-amber'
              }`}>
                {doc.access}
              </span>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                Tenant: <span className="text-slate-800 dark:text-slate-200 font-medium">{doc.tenant}</span>
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                {doc.size}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <EyeOff className="w-3.5 h-3.5" />
                PII Scrubbed
              </span>
              <span className="text-slate-500 font-medium">{doc.chunks} Chunks ({doc.embeddings})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};