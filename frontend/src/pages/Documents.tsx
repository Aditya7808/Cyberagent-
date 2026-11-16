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
      summary: 'Corporate compliance, encryption standards, and 90-day retention policies for telemetry logs.',
      keywords: ['retention', 'policy', 'telemetry', 'logs', 'soc2', 'audit', 'encryption', 'compliance'],
      sampleChunk: 'Section 4.1: Cryptographic data retention standards mandate that all audit and telemetry logs remain encrypted via AES-GCM-256 for a minimum of 90 days before immutable archival.',
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
      summary: 'Automated infrastructure failover runbooks, Kubernetes cluster recovery, and database replication.',
      keywords: ['failover', 'disaster', 'recovery', 'kubernetes', 'database', 'infrastructure', 'runbook', 'cluster'],
      sampleChunk: 'Runbook Step 12: In event of primary database cluster outage, initiate automated replica promotion across secondary availability zone and verify zero data-loss replication status.',
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
      summary: 'OpenAPI specification for PCI-DSS compliant credit card tokenization and webhook HMAC verification.',
      keywords: ['payment', 'webhook', 'signature', 'secrets', 'api', 'gateway', 'pci', 'credit', 'card'],
      sampleChunk: 'Endpoint /v2/webhooks: Incoming event payloads must include X-Signature-SHA256 header verified using the 30-day rotated merchant API secret.',
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
      summary: 'Defense-grade flight control telemetry, tactical radar navigation, and autonomous drone guidance.',
      keywords: ['avionics', 'defense', 'flight', 'telemetry', 'drone', 'radar', 'navigation', 'tactical'],
      sampleChunk: 'Spec 8.4: Autonomous flight control bus utilizes real-time encrypted telemetry channels isolated from auxiliary mission computer networks.',
    },
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 300);
  };

  const filteredDocs = docs.filter(doc => {
    if (selectedTenant !== 'all' && !doc.tenant.toLowerCase().includes(selectedTenant.toLowerCase())) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inTitle = doc.title.toLowerCase().includes(q);
    const inTenant = doc.tenant.toLowerCase().includes(q);
    const inSummary = doc.summary?.toLowerCase().includes(q);
    const inKeywords = doc.keywords?.some((k: string) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()));
    return inTitle || inTenant || inSummary || inKeywords;
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
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
        {filteredDocs.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center enterprise-card rounded-2xl border border-slate-200 dark:border-slate-800">
            <Layers className="w-8 h-8 text-indigo-400/60 mb-2" />
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No documents matched query</p>
            <p className="text-slate-500 text-xs mt-1">Tenant boundary isolation active. Adjust search terms or switch tenant filter.</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div key={doc.id} className="enterprise-card p-5 rounded-2xl space-y-4 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  {doc.title}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                  doc.access === 'Restricted' ? 'badge-rose' : 'badge-amber'
                }`}>
                  {doc.access}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {doc.summary}
              </p>

              {searchQuery && doc.sampleChunk && (
                <div className="p-3 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Semantic Vector Match
                    </span>
                    <span className="font-mono">98% Grounded</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                    "{doc.sampleChunk}"
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  Tenant: <span className="text-slate-800 dark:text-slate-200 font-medium">{doc.tenant}</span>
                </span>
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  {doc.size}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <EyeOff className="w-3.5 h-3.5" />
                  PII Scrubbed
                </span>
                <span className="font-medium text-slate-500 dark:text-slate-400">{doc.chunks} Chunks ({doc.embeddings})</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};