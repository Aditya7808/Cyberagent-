import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Bot, 
  Cpu, 
  Wrench, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { api } from '../lib/api';

interface SecurityMeta {
  is_blocked?: boolean;
  block_reason?: string;
  input_security?: {
    is_safe: boolean;
    violations: string[];
    risk_score: number;
  };
  output_security?: {
    is_safe: boolean;
    violations: string[];
    pii_detected: any[];
    was_redacted: boolean;
  };
  tool_results?: any[];
}

interface MessageItem {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  security_metadata?: SecurityMeta;
  tokens_used?: number;
  latency_ms?: number;
}

export const Playground: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('default-agent');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Sentinel-secured enterprise agent. What can I help you analyze today?',
      security_metadata: {
        input_security: { is_safe: true, violations: [], risk_score: 0 },
        output_security: { is_safe: true, violations: [], pii_detected: [], was_redacted: false },
      },
    },
  ]);

  useEffect(() => {
    // Attempt to fetch agents from backend
    api.getAgents()
      .then((data) => {
        if (data && data.length > 0) {
          setAgents(data);
          setSelectedAgentId(data[0].id);
        }
      })
      .catch(() => {
        // Fallback default agents list
        setAgents([
          { id: 'agent-acme-hr', name: 'Acme HR Policy Agent', model_id: 'Claude 3 Sonnet' },
          { id: 'agent-fin-advisory', name: 'Financial Advisory Agent', model_id: 'Claude 3 Sonnet' },
          { id: 'agent-devops-sre', name: 'DevOps & SRE Assistant', model_id: 'Claude 3 Sonnet' },
        ]);
      });
  }, []);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;

    const userText = prompt.trim();
    setPrompt('');
    setLoading(true);

    const userMsg: MessageItem = {
      role: 'user',
      content: userText,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let currentConvId = conversationId;
      if (!currentConvId) {
        try {
          const newConv = await api.createConversation(selectedAgentId, 'Playground Session');
          currentConvId = newConv.id;
          setConversationId(newConv.id);
        } catch {
          currentConvId = 'local-session';
        }
      }

      // Try sending to real backend
      const resp = await api.sendMessage(currentConvId!, userText);
      const botMsg: MessageItem = {
        role: 'assistant',
        content: resp.content,
        security_metadata: resp.security_metadata,
        tokens_used: resp.tokens_used,
        latency_ms: resp.latency_ms,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Local graceful simulation if backend is not yet started in container
      const isInjection = /ignore|previous|instructions|reveal|system prompt/i.test(userText);
      const isPII = /leave|pto|salary|employee/i.test(userText);

      setTimeout(() => {
        let content = '';
        let secMeta: SecurityMeta = {};

        if (isInjection) {
          content = '🛡️ [Sentinel Security Alert]: Your prompt was flagged by runtime input inspection for potential adversarial behavior. Violation: Prompt injection pattern detected.';
          secMeta = {
            is_blocked: true,
            input_security: { is_safe: false, violations: ['Prompt injection pattern detected'], risk_score: 0.9 },
          };
        } else if (isPII) {
          content = 'According to Acme Corporation policy, full-time employees accrue 20 days paid leave. HR contact: <PII_REDACTED> (SSN: <PII_REDACTED>).';
          secMeta = {
            input_security: { is_safe: true, violations: [], risk_score: 0 },
            output_security: { is_safe: true, violations: ['PII detected'], pii_detected: [{ type: 'SSN' }], was_redacted: true },
          };
        } else {
          content = `I analyzed your request: "${userText}". All operations conform to the tenant isolation boundary. Tools available: search_documents, calculator.`;
          secMeta = {
            input_security: { is_safe: true, violations: [], risk_score: 0 },
            output_security: { is_safe: true, violations: [], pii_detected: [], was_redacted: false },
          };
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content,
            security_metadata: secMeta,
            tokens_used: 142,
            latency_ms: 320,
          },
        ]);
      }, 400);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Chat Area */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <div className="flex items-center gap-3">
              <select
                value={selectedAgentId}
                onChange={(e) => {
                  setSelectedAgentId(e.target.value);
                  setConversationId(null);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm font-semibold text-slate-200 focus:outline-none focus:border-teal-500"
              >
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.name}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500 font-mono">
                {conversationId ? `Conv: ${conversationId.slice(0, 8)}...` : 'New Session'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20 font-medium">
            <Shield className="w-3.5 h-3.5" />
            <span>Sentinel Runtime Protection Active</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => {
            const sec = m.security_metadata;
            const isBlocked = sec?.is_blocked || (sec?.input_security && !sec.input_security.is_safe);
            const wasRedacted = sec?.output_security?.was_redacted;
            const toolsRun = sec?.tool_results?.length || 0;

            return (
              <div
                key={idx}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[75%] p-3.5 rounded-xl text-sm ${
                    m.role === 'user'
                      ? 'bg-teal-500 text-slate-950 font-medium'
                      : isBlocked
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>

                {/* Turn Metrics & Security Badges */}
                {m.role === 'assistant' && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    {isBlocked ? (
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <AlertTriangle className="w-3 h-3" /> Input Blocked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-teal-400">
                        <CheckCircle2 className="w-3 h-3" /> Input Verified
                      </span>
                    )}

                    {wasRedacted && (
                      <span className="text-blue-400 font-medium flex items-center gap-0.5">
                        • PII Redacted
                      </span>
                    )}

                    {toolsRun > 0 && (
                      <span className="text-amber-400 font-medium flex items-center gap-0.5">
                        <Wrench className="w-3 h-3 inline" /> {toolsRun} Tool(s) Run
                      </span>
                    )}

                    {m.tokens_used ? (
                      <span className="text-slate-500 font-mono">
                        • {m.tokens_used} tok
                      </span>
                    ) : null}

                    {m.latency_ms ? (
                      <span className="text-slate-500 font-mono">
                        • {m.latency_ms.toFixed(0)}ms
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <span>Orchestrating agent workflow (Input Inspection → LLM → Output Masking)...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about company leave policy, or test prompt injection ('Ignore instructions...')..."
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Security Inspector Side Panel */}
      <div className="w-80 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-6 overflow-y-auto">
        <h3 className="font-semibold text-sm tracking-tight flex items-center gap-2 text-slate-200">
          <Lock className="w-4 h-4 text-teal-400" />
          Active Policy Enforcement
        </h3>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              Input Guardrail
            </span>
            <div className="flex justify-between text-slate-400">
              <span>Injection Filter</span>
              <span className="text-teal-400 font-semibold">Deterministic</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Risk Threshold</span>
              <span className="text-slate-300 font-mono">&lt; 0.40</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Presidio Anonymizer
            </span>
            <div className="flex justify-between text-slate-400">
              <span>Entities Checked</span>
              <span className="text-slate-300">SSN, Phone, Email</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Mode</span>
              <span className="text-teal-400 font-semibold">Redaction Masking</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg space-y-1.5">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Tool Allowlist Gate
            </span>
            <div className="flex justify-between text-slate-400">
              <span>search_documents</span>
              <span className="text-teal-400 font-mono">Open</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>calculator</span>
              <span className="text-teal-400 font-mono">Open</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>get_policy</span>
              <span className="text-rose-400 font-mono">Restricted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
