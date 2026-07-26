'use client';

// Pulsyn Logo — Minimal lightning bolt + data flow
export function PulsynLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring — represents data flow */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="url(#logo-gradient)"
        strokeWidth="1.5"
        opacity="0.3"
      />
      
      {/* Inner ring — represents CDC engine */}
      <circle
        cx="24"
        cy="24"
        r="15"
        stroke="url(#logo-gradient)"
        strokeWidth="1"
        opacity="0.2"
      />
      
      {/* Lightning bolt — represents speed/real-time */}
      <path
        d="M28 8L16 26h8l-2 14L34 22h-8l2-14z"
        fill="url(#logo-gradient)"
        strokeLinejoin="round"
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Pulsyn Logo with text
export function PulsynLogoFull({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <PulsynLogo size={size} />
      <span className="text-lg font-bold text-white tracking-tight">Pulsyn</span>
    </div>
  );
}

// Pulsyn Icon only (for favicon, small spaces)
export function PulsynIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14 4L8 12h4l-1 8L17 12h-4l1-8z"
        fill="url(#icon-gradient)"
      />
      <defs>
        <linearGradient id="icon-gradient" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
