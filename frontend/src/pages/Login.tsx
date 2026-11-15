import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, Shield, ArrowRight, Radio, KeyRound, UserPlus, CheckCircle2 } from 'lucide-react';
import { GhostLogo } from '../components/ui/GhostLogo';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('root@sentinelai.dev');
  const [password, setPassword] = useState('SentinelRoot2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else {
        if (!fullName.trim()) {
          throw new Error('Full Name / Operator callsign is required.');
        }
        await register(email, password, fullName);
        setSuccessMsg('IDENTITY CREATED & PROVISIONED! ENTERING PERIMETER...');
        setTimeout(() => navigate('/'), 800);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    login(pEmail, pPass).then(() => navigate('/'));
  };

  return (
    <div className="min-h-screen cyber-grid-bg flex items-center justify-center p-4 font-mono select-none">
      <div className="w-full max-w-md cyber-card cyber-corners p-8 rounded-xl relative overflow-hidden space-y-6">
        {/* Glow Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <GhostLogo size={56} glowColor="cyan" />
          <div>
            <h1 className="text-xl font-black tracking-wider text-white glow-text-cyan">
              SENTINEL<span className="text-cyan-400">.AI</span> // PORTAL
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ZERO-TRUST AGENT GOVERNANCE & IDENTITY GATEWAY
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
            <Radio className="w-3 h-3 animate-pulse" />
            CIPHER TUNNEL: SECURE // DB PERSISTENT
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded bg-slate-900 border border-slate-800 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setEmail('root@sentinelai.dev');
              setPassword('SentinelRoot2026!');
            }}
            className={`py-1.5 rounded transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            AUTHENTICATE
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
              setEmail('');
              setPassword('');
              setFullName('');
            }}
            className={`py-1.5 rounded transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            REGISTER IDENTITY
          </button>
        </div>

        {error && (
          <div className="p-3 rounded bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                OPERATOR CALLSIGN / FULL NAME
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Agent Sarah Connor"
                required
                className="w-full bg-slate-900 border border-slate-700/80 rounded px-3.5 py-2 text-xs text-emerald-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              OPERATOR IDENTITY (EMAIL)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@sentinelai.dev"
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-3.5 py-2 text-xs text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              CIPHER KEY (PASSWORD)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded px-3.5 py-2 text-xs text-cyan-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded text-slate-950 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 ${
              mode === 'register'
                ? 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
            }`}
          >
            {loading
              ? 'PROCESSING CIPHER...'
              : mode === 'register'
              ? 'PROVISION & ENTER PERIMETER'
              : 'AUTHENTICATE & ENTER'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* 1-Click Quick Demo Personas */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="text-[10px] text-slate-500 text-center tracking-wider uppercase">
            QUICK ACCESS SEEDED PERSONAS (DB VERIFIED)
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handleQuickLogin('root@sentinelai.dev', 'SentinelRoot2026!')}
              className="p-2 rounded bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-cyan-300 text-left transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3 h-3 text-cyan-400" />
              ROOT ADMIN [L5]
            </button>
            <button
              onClick={() => handleQuickLogin('dev@sentinelai.dev', 'SentinelDev2026!')}
              className="p-2 rounded bg-slate-900/80 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/50 text-emerald-300 text-left transition-colors flex items-center gap-1.5"
            >
              <Terminal className="w-3 h-3 text-emerald-400" />
              AI DEV [L3]
            </button>
            <button
              onClick={() => handleQuickLogin('auditor@sentinelai.dev', 'SentinelAudit2026!')}
              className="p-2 rounded bg-slate-900/80 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/50 text-amber-300 text-left transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              AUDITOR [L2]
            </button>
            <button
              onClick={() => handleQuickLogin('user@sentinelai.dev', 'SentinelUser2026!')}
              className="p-2 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 text-slate-300 text-left transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              END-USER [L1]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
