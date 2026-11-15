import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIBadgeProps {
  label?: string;
  variant?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan';
  pulse?: boolean;
  size?: 'sm' | 'md';
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  label = 'AI Powered',
  variant = 'indigo',
  pulse = true,
  size = 'sm'
}) => {
  const variantClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'indigo' ? 'bg-indigo-400' :
            variant === 'emerald' ? 'bg-emerald-400' :
            variant === 'rose' ? 'bg-rose-400' :
            variant === 'amber' ? 'bg-amber-400' : 'bg-cyan-400'
          }`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            variant === 'indigo' ? 'bg-indigo-400' :
            variant === 'emerald' ? 'bg-emerald-400' :
            variant === 'rose' ? 'bg-rose-400' :
            variant === 'amber' ? 'bg-amber-400' : 'bg-cyan-400'
          }`} />
        </span>
      )}
      <Sparkles className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
      {label}
    </span>
  );
};

/* AI Insight Banner - Rotating intelligence strip */
export const AIInsightBanner: React.FC<{ insight: string }> = ({ insight }) => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 p-4 flex items-center gap-3">
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="absolute inset-0 rounded-lg bg-indigo-500/20 animate-ping opacity-20" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-semibold text-indigo-400 dark:text-indigo-300">Sentinel AI Insight</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">LIVE</span>
        </div>
        <p className="text-xs text-slate-300 dark:text-slate-400 truncate">{insight}</p>
      </div>
      <Sparkles className="w-4 h-4 text-indigo-400/50 flex-shrink-0" />
    </div>
  );
};