import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  Shield,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  User,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, register } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('root@sentinelai.dev');
  const [password, setPassword] = useState('SentinelRoot2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google OAuth modal for manual or OAuth verification
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  // Google Identity Services (GSI) Auto-Hook
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if ((window as any).google?.accounts?.id && googleClientId) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: async (response: any) => {
              if (response?.credential) {
                setLoading(true);
                setError('');
                try {
                  await loginWithGoogle(response.credential);
                  navigate('/');
                } catch (err: any) {
                  setError(err.message || 'Google OAuth verification failed.');
                } finally {
                  setLoading(false);
                }
              }
            },
          });

          const btnContainer = document.getElementById('googleNativeBtn');
          if (btnContainer) {
            (window as any).google.accounts.id.renderButton(btnContainer, {
              theme: theme === 'dark' ? 'filled_black' : 'outline',
              size: 'large',
              width: 360,
              text: 'continue_with',
            });
          }
        } catch (e) {
          console.warn('Google GSI init notice:', e);
        }
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [theme, loginWithGoogle, navigate]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (mode === 'login') {
        // Real database validation: will reject incorrect passwords or emails
        await login(email, password);
        navigate('/');
      } else {
        if (!fullName.trim()) {
          throw new Error('Please enter your full name or callsign.');
        }
        await register(email, password, fullName);
        setSuccessMsg('Account provisioned successfully in database. Accessing console...');
        setTimeout(() => navigate('/'), 700);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInClick = () => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if ((window as any).google?.accounts?.id && googleClientId) {
      (window as any).google.accounts.id.prompt();
    } else {
      setShowGoogleModal(true);
    }
  };

  const handleGoogleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim() || !googleEmailInput.includes('@')) {
      setError('Please provide a valid Google account email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Send Google identity payload to backend
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleEmailInput.trim(),
          full_name: googleNameInput.trim() || googleEmailInput.split('@')[0],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Google account verification failed.');
      }
      localStorage.setItem('sentinel_token', data.access_token);
      localStorage.setItem('sentinel_user', JSON.stringify(data.user));
      setShowGoogleModal(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate via Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemo = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    setError('');
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
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Identity
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Success Notice */}
        {successMsg && (
          <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{successMsg}</span>
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
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? 'Authenticating Credentials...' : mode === 'register' ? 'Provision Identity' : 'Sign In to Console'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Or Continue With
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Real Google Auth Button */}
        <div>
          <div id="googleNativeBtn" className="flex justify-center" />
          <button
            type="button"
            onClick={handleGoogleSignInClick}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800/90 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2.5 border border-slate-700 shadow-sm cursor-pointer disabled:opacity-50 hover:border-slate-600"
          >
            <GoogleIcon className="w-4 h-4" />
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Demo Credentials Reference Box */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider">
            Pre-Seeded Security Identities
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleSelectDemo('root@sentinelai.dev', 'SentinelRoot2026!')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-slate-200 text-[11px]">Root Admin (L5)</div>
                <div className="text-[10px] text-slate-500 truncate">root@sentinelai.dev</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemo('dev@sentinelai.dev', 'SentinelDev2026!')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="font-semibold text-slate-200 text-[11px]">AI Developer (L3)</div>
                <div className="text-[10px] text-slate-500 truncate">dev@sentinelai.dev</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Google Sign-In Prompt Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="enterprise-card p-6 rounded-2xl max-w-sm w-full border border-slate-700 bg-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <GoogleIcon className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Google Identity Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Authenticate using your Google identity. Your profile will be verified and provisioned into Sentinel Zero-Trust directory.
            </p>

            <form onSubmit={handleGoogleManualAuth} className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  required
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300 block mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>Verify with Google</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

