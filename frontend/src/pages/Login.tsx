import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, ArrowRight, UserPlus, CheckCircle2, AlertCircle, KeyRound, Mail, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
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
          throw new Error('Please enter your full name or callsign.');
        }
        await register(email, password, fullName);
        setSuccessMsg('Account provisioned successfully. Accessing console...');
        setTimeout(() => navigate('/'), 700);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
  };

  return (
    <div className="min-h-screen enterprise-bg flex items-center justify-center p-4 selection:bg-indigo-500/30 relative">
      {/* Top Right Theme Toggle */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all flex items-center gap-2 shadow-sm text-xs font-semibold cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
          <span className="capitalize">{theme === 'dark' ? 'Dark' : 'Light'} Mode</span>
        </button>
      </div>

      <div className="w-full max-w-md enterprise-card p-8 rounded-2xl relative shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Shield className="w-6 h-6 fill-white/20" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Sentinel<span className="text-indigo-400">AI</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Zero-Trust Autonomous Agent Security & Governance
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
              setEmail('root@sentinelai.dev');
              setPassword('SentinelRoot2026!');
            }}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In
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
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Identity
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name / Operator Callsign
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                required
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Corporate Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@company.com"
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Account Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'register' ? 'Provision Identity' : 'Sign In to Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Reference Box */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Pre-Seeded Security Identities
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectDemo('root@sentinelai.dev', 'SentinelRoot2026!')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <div>
                <div className="font-semibold text-slate-200 text-[11px]">Root Admin (L5)</div>
                <div className="text-[10px] text-slate-500">root@sentinelai.dev</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('dev@sentinelai.dev', 'SentinelDev2026!')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <div className="font-semibold text-slate-200 text-[11px]">AI Developer (L3)</div>
                <div className="text-[10px] text-slate-500">dev@sentinelai.dev</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
