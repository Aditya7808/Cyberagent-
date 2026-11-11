import React, { useState } from 'react';
import { FileText, Shield, Upload, Lock, Database } from 'lucide-react';

export const Documents: React.FC = () => {
  const [selectedTenant, setSelectedTenant] = useState('all');

  const docs = [
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
  ];

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
        <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-semibold text-sm rounded-lg transition-colors">
          <Upload className="w-4 h-4" />
          Ingest Document
        </button>
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
    </div>
  );
};
