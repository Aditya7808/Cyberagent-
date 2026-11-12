import React from 'react';

interface GhostLogoProps {
  className?: string;
  size?: number;
  glowColor?: 'emerald' | 'cyan' | 'rose' | 'amber';
}

export const GhostLogo: React.FC<GhostLogoProps> = ({ 
  className = '', 
  size = 40,
  glowColor = 'emerald'
}) => {
  const glowMap = {
    emerald: 'drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]',
    cyan: 'drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]',
    rose: 'drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]',
    amber: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${glowMap[glowColor]} transition-transform duration-300 hover:scale-105`}
      >
        <defs>
          <linearGradient id="ghostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="darkArmor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Hex Shield / Cyber Halo */}
        <path
          d="M50 4 L88 22 L88 68 L50 96 L12 68 L12 22 Z"
          stroke="url(#ghostGradient)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.6"
        />

        {/* Tactical Crosshair / Corner Reticles */}
        <line x1="50" y1="0" x2="50" y2="8" stroke="#10b981" strokeWidth="2" opacity="0.8" />
        <line x1="50" y1="92" x2="50" y2="100" stroke="#06b6d4" strokeWidth="2" opacity="0.8" />
        <line x1="4" y1="50" x2="12" y2="50" stroke="#10b981" strokeWidth="2" opacity="0.8" />
        <line x1="88" y1="50" x2="96" y2="50" stroke="#06b6d4" strokeWidth="2" opacity="0.8" />

        {/* Ghost Cybernetic Hood & Cloak Outer Boundary */}
        <path
          d="M50 14 C36 14 22 26 22 46 C22 64 28 80 18 88 C32 84 38 72 44 86 C48 78 52 78 56 86 C62 72 68 84 82 88 C72 80 78 64 78 46 C78 26 64 14 50 14 Z"
          fill="url(#darkArmor)"
          stroke="url(#ghostGradient)"
          strokeWidth="2.5"
        />

        {/* Inner Hood Dark Shadow */}
        <path
          d="M50 20 C40 20 29 30 29 48 C29 64 36 74 38 78 C42 70 48 72 50 72 C52 72 58 70 62 78 C64 74 71 64 71 48 C71 30 60 20 50 20 Z"
          fill="#030712"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Angular Cybernetic Face Mask / Visor Lines */}
        <path
          d="M36 44 L44 54 L50 51 L56 54 L64 44 L60 62 L50 68 L40 62 Z"
          fill="#090d16"
          stroke="#0e7490"
          strokeWidth="1.5"
        />

        {/* Menacing Glowing Eyes / Optics */}
        <polygon
          points="36,44 45,46 42,50 34,47"
          fill="url(#eyeGlow)"
          filter="url(#neonFilter)"
        />
        <polygon
          points="64,44 55,46 58,50 66,47"
          fill="url(#eyeGlow)"
          filter="url(#neonFilter)"
        />

        {/* Center Cyber Core Diamond */}
        <polygon
          points="50,32 54,38 50,44 46,38"
          fill="#10b981"
          opacity="0.9"
        />

        {/* Tech Nodes & Circuit Traces */}
        <circle cx="50" cy="38" r="1.5" fill="#f8fafc" />
        <circle cx="34" cy="47" r="1" fill="#38bdf8" />
        <circle cx="66" cy="47" r="1" fill="#38bdf8" />

        {/* Jaw Grille / Filter Vents */}
        <line x1="46" y1="62" x2="54" y2="62" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <line x1="47" y1="65" x2="53" y2="65" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    </div>
  );
};
