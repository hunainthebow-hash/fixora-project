import React from 'react';

interface FixoraLogoProps {
  variant?: 'full' | 'header' | 'icon-only' | 'hero' | 'compact' | 'badge' | 'with-categories';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showPill?: boolean;
  className?: string;
}

export const FixoraLogo: React.FC<FixoraLogoProps> = ({
  variant = 'header',
  size = 'md',
  showTagline = true,
  showPill = false,
  className = '',
}) => {
  // Dimension mappings
  const iconSizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-28 h-28'
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl sm:text-4xl',
    xl: 'text-5xl sm:text-6xl'
  };

  // Dedicated SVG Emblem replicating the exact 3D Fixora House + F + Hand structure
  const FixoraEmblemSvg = ({ customSize }: { customSize?: string }) => (
    <div className={`relative shrink-0 flex items-center justify-center ${customSize || iconSizes[size]}`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Blue House Roof Gradient */}
          <linearGradient id="roofGradient" x1="20" y1="20" x2="180" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="45%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#0033AA" />
          </linearGradient>

          {/* 3D Stylized 'F' Vibrant Blue Gradient */}
          <linearGradient id="fBlueGradient" x1="40" y1="50" x2="160" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="35%" stopColor="#0077FE" />
            <stop offset="85%" stopColor="#0044CC" />
            <stop offset="100%" stopColor="#001F66" />
          </linearGradient>

          {/* Sleek Metallic Hand Gradient */}
          <linearGradient id="handGradient" x1="80" y1="120" x2="160" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A5568" />
            <stop offset="40%" stopColor="#2D3748" />
            <stop offset="85%" stopColor="#1A202C" />
            <stop offset="100%" stopColor="#0D1117" />
          </linearGradient>

          {/* Gloss highlight */}
          <linearGradient id="glossGrad" x1="50" y1="40" x2="150" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.1" />
          </linearGradient>

          {/* Hexagon border gradient */}
          <linearGradient id="hexBorderGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="50%" stopColor="#0066FF" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id="fixoraGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0066FF" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Outer Shield/Hexagon House Outline */}
        <path
          d="M 100 15 L 175 60 L 175 140 L 100 185 L 25 140 L 25 60 Z"
          stroke="url(#hexBorderGrad)"
          strokeWidth="10"
          strokeLinejoin="round"
          fill="#080E1A"
        />

        {/* Chimney on the roof */}
        <rect x="135" y="32" width="16" height="24" rx="2" fill="url(#roofGradient)" />

        {/* 4-Pane Attic Window (2x2) */}
        <g transform="translate(90, 38)">
          <rect x="0" y="0" width="8" height="8" rx="1.5" fill="#00D2FF" />
          <rect x="12" y="0" width="8" height="8" rx="1.5" fill="#00D2FF" />
          <rect x="0" y="12" width="8" height="8" rx="1.5" fill="#00D2FF" />
          <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#00D2FF" />
        </g>

        {/* Large 3D Stylized 'F' */}
        <path
          d="M 52 70 C 65 62 105 60 152 60 C 158 60 162 65 158 71 C 148 83 125 87 96 88 C 122 88 145 92 142 106 C 138 118 116 122 92 123 L 74 165 C 71 172 63 175 56 172 C 50 168 50 160 52 152 L 64 85 C 64 78 58 75 52 70 Z"
          fill="url(#fBlueGradient)"
          filter="url(#fixoraGlow)"
        />

        {/* Top Gloss Edge of 'F' */}
        <path
          d="M 68 70 C 90 64 125 63 150 63 C 154 63 156 66 153 70 C 138 78 110 82 86 84 Z"
          fill="url(#glossGrad)"
        />

        {/* Sleek Metallic Hand Cupping the Bottom Base of 'F' */}
        <path
          d="M 72 165 C 85 178 110 182 140 165 C 160 152 168 130 168 105 L 155 112 C 155 130 145 145 130 154 C 110 166 90 164 78 152 Z"
          fill="url(#handGradient)"
          stroke="#334155"
          strokeWidth="1.5"
        />
        {/* Hand Thumb Contour */}
        <path
          d="M 105 130 C 118 138 135 138 148 130 C 152 127 155 130 152 134 C 140 144 122 146 108 138 Z"
          fill="#1E293B"
        />
      </svg>
    </div>
  );

  // Icon only rendering
  if (variant === 'icon-only') {
    return <FixoraEmblemSvg customSize={className} />;
  }

  // Full rich banner / hero display with Wordmark, Subtitle, and Pills
  if (variant === 'full' || variant === 'hero' || variant === 'with-categories') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {/* Emblem */}
        <div className="relative group">
          <FixoraEmblemSvg customSize="w-24 h-24 sm:w-32 sm:h-32" />
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-indigo-500/20 rounded-full blur-xl -z-10 group-hover:scale-110 transition-transform" />
        </div>

        {/* Wordmark: FIXORA with Stylized Dual-Color X */}
        <div className="mt-3 flex items-center justify-center font-black tracking-wider leading-none">
          <span className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">FI</span>
          
          {/* Custom Dual-Tone 'X' */}
          <span className="relative inline-flex items-center justify-center mx-0.5 text-3xl sm:text-5xl font-black">
            <span className="text-[#00B4D8] drop-shadow-[0_0_12px_rgba(0,180,216,0.6)]">X</span>
          </span>

          <span className="text-3xl sm:text-5xl font-black text-white drop-shadow-md">ORA</span>
        </div>

        {/* Tagline: — YOUR LOCAL SERVICE PARTNER — */}
        <div className="mt-2 flex items-center gap-3">
          <div className="h-0.5 w-6 sm:w-12 bg-gradient-to-r from-transparent to-[#00B4D8] rounded-full" />
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase text-[#94A3B8]">
            YOUR LOCAL SERVICE PARTNER
          </span>
          <div className="h-0.5 w-6 sm:w-12 bg-gradient-to-l from-transparent to-[#00B4D8] rounded-full" />
        </div>

        {/* Category Icons Row (from Image 1) */}
        {variant === 'with-categories' && (
          <div className="mt-6 flex items-center justify-center gap-2 sm:gap-3 flex-wrap max-w-2xl px-2">
            {[
              { label: 'PLUMBING', icon: '🚰' },
              { label: 'ELECTRICAL', icon: '⚡' },
              { label: 'CARPENTRY', icon: '🔨' },
              { label: 'AC REPAIR', icon: '❄️' },
              { label: 'CLEANING', icon: '🧹' },
              { label: 'PAINTING', icon: '🖌️' },
              { label: 'IT SERVICES', icon: '💻' },
              { label: '& MORE', icon: '•••' },
            ].map((cat, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-[#0F172A]/90 border border-blue-500/30 hover:border-blue-400 text-center p-1 transition-all hover:scale-105 shadow-md shadow-blue-950/40"
              >
                <span className="text-base sm:text-xl text-[#00B4D8]">{cat.icon}</span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-tight">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Header & Compact Standard Layout
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 select-none whitespace-nowrap ${className}`}>
      {/* Emblem */}
      <FixoraEmblemSvg customSize="w-7 h-7 sm:w-8 sm:h-8" />

      {/* Brand Typography in single crisp line */}
      <div className="flex items-center leading-none font-black tracking-tight">
        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wide">
          FI
        </span>
        {/* Cyan / Blue Stylized X */}
        <span className="text-lg sm:text-xl font-black text-[#00B4D8] drop-shadow-[0_0_8px_rgba(0,180,216,0.4)]">
          X
        </span>
        <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-wide">
          ORA
        </span>
      </div>
    </div>
  );
};

