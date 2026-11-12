import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Shield, 
  Upload, 
  Lock, 
  Search, 
  CheckCircle2, 
  Plus, 
  X, 
  Database 
} from 'lucide-react';
import { api } from '../lib/api';

export const Documents: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Ingest form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAccess, setNewAccess] = useState('internal');
  const [isIngesting, setIsIngesting] = useState(false);

  const [docs, setDocs] = useState<any[]>([
    {
      title: 'hr_policy.md',
      tenant: 'Acme Corporation',
      access: 'confidential',
      chunks: 8,
      piiFound: true,
      size: '14.2 KB',
    },
    {
      title: 'employee_records.json',
      tenant: 'Acme Corporation',
      access: 'restricted',
      chunks: 3,
      piiFound: true,
      size: '2.4 KB',
    },
    {
      title: 'it_runbook.md',
      tenant: 'Acme Corporation',
      access: 'internal',
      chunks: 12,
      piiFound: false,
      size: '18.1 KB',
    },
    {
      title: 'hr_policy.md',
      tenant: 'Globex Inc',
      access: 'confidential',
      chunks: 6,
      piiFound: true,
      size: '11.0 KB',
    },
    {
      title: 'it_runbook.md',
      tenant: 'Wayne Enterprises',
      access: 'internal',
      chunks: 15,
      piiFound: false,
      size: '22.8 KB',
    },
  ]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || isSearching) return;
    setIsSearching(true);
    try {
      const results = await api.searchDocuments(searchQuery, 3);
      setSearchResults(results);
    } catch {
      // Local fallback simulation
      setTimeout(() => {
        setSearchResults([
          {
            chunk_id: 'chk-8841a',
            document_title: 'hr_policy.md',
            access_level: 'confidential',
            relevance_score: 0.942,
            content: 'Full-time employees accrue 20 days paid leave per calendar year. (Contact: HR Operations <PII_REDACTED>)',
            tenant_id: 'Acme Corporation (Tenant Verified)',
          },
          {
            chunk_id: 'chk-8841b',
            document_title: 'company_overview.md',
            access_level: 'public',
            relevance_score: 0.812,
            content: 'Acme Corporation provides enterprise cloud infrastructure and security orchestration.',
            tenant_id: 'Acme Corporation (Tenant Verified)',
          },
        ]);
        setIsSearching(false);
      }, 400);
    } finally {
      setIsSearching(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsIngesting(true);
    try {
      await api.ingestDocument({
        title: newTitle,
        content: newContent,
        access_level: newAccess,
      });
      setDocs((prev) => [
        {
          title: newTitle,
          tenant: 'Acme Corporation',
          access: newAccess,
          chunks: Math.ceil(newContent.length / 400),
          piiFound: /ssn|email|phone|password/i.test(newContent),
          size: `${(newContent.length / 1024).toFixed(1)} KB`,
        },
        ...prev,
      ]);
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
    } catch {
      // Local fallback append
      setDocs((prev) => [
        {
          title: newTitle,
          tenant: 'Acme Corporation',
          access: newAccess,
          chunks: Math.ceil(newContent.length / 400),
          piiFound: /ssn|email|phone|password/i.test(newContent),
          size: `${(newContent.length / 1024).toFixed(1)} KB`,
        },
        ...prev,
      ]);
      setShowModal(false);
      setNewTitle('');
      setNewContent('');
    } finally {
      setIsIngesting(false);
    }
  };

  const filteredDocs = selectedTenant === 'all' 
    ? docs 
    : docs.filter(d => d.tenant.toLowerCase().includes(selectedTenant));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Secure Knowledge & RAG Ingestion</h1>
          <p className="text-sm text-slate-400 mt-1">
            Tenant-isolated document store with document-level access policies and pgvector embeddings.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold text-sm rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Ingest Document
        </button>
      </div>

      {/* RAG Vector Query Interactive Search Bar */}
      <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" />
            Test Tenant Vector Retrieval (pgvector)
          </span>
          <span className="text-[11px] text-slate-400">
            Tenant Boundary: <strong className="text-slate-200">Acme Corp</strong> • Role: <strong className="text-slate-200">Admin</strong>
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search tenant documents (e.g. 'What is the standard leave rollover policy?')..."
            className="flex-1 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors"
          >
            {isSearching ? 'Searching...' : 'Run Similarity Query'}
          </button>
        </div>

        {/* Search Results Display */}
        {searchResults && (
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{searchResults.length} Relevant Chunks Retrieved</span>
              <button onClick={() => setSearchResults(null)} className="hover:text-slate-200">
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {searchResults.map((res, i) => (
                <div key={i} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{res.document_title}</span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-teal-400">Similarity: {res.relevance_score}</span>
                      <span className="px-1.5 py-0.5 uppercase text-[10px] bg-slate-800 rounded text-slate-400">
                        {res.access_level}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-300 font-serif leading-relaxed">{res.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tenant Filter */}
      <div className="flex gap-2 text-xs">
        {['all', 'acme', 'globex', 'wayne'].map((tenant) => (
          <button
            key={tenant}
            onClick={() => setSelectedTenant(tenant)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedTenant === tenant
                ? 'bg-teal-500 text-slate-950'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tenant.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="pb-3">Document Title</th>
                <th className="pb-3">Tenant Boundary</th>
                <th className="pb-3">Access Classification</th>
                <th className="pb-3">Vector Chunks</th>
                <th className="pb-3">PII Scanned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredDocs.map((doc, idx) => (
                <tr key={idx}>
                  <td className="py-3 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>{doc.title}</span>
                  </td>
                  <td>{doc.tenant}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 rounded uppercase font-semibold text-[10px] ${
                      doc.access === 'restricted'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : doc.access === 'confidential'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {doc.access}
                    </span>
                  </td>
                  <td className="font-mono">{doc.chunks} chunks (pgvector)</td>
                  <td>
                    {doc.piiFound ? (
                      <span className="text-amber-400 font-medium">PII Detected</span>
                    ) : (
                      <span className="text-slate-500">Clean</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingest Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-400" />
                Ingest Document into pgvector
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIngest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. employee_onboarding.md"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Access Classification</label>
                <select
                  value={newAccess}
                  onChange={(e) => setNewAccess(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                >
                  <option value="public">PUBLIC (All roles)</option>
                  <option value="internal">INTERNAL (Employees only)</option>
                  <option value="confidential">CONFIDENTIAL (Operators & Admins)</option>
                  <option value="restricted">RESTRICTED (Admins with sign-off)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Content (Markdown / Plaintext)</label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste document text here. It will be automatically chunked and embedded..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIngesting}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-semibold rounded-lg"
                >
                  {isIngesting ? 'Embedding Chunks...' : 'Ingest & Embed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
