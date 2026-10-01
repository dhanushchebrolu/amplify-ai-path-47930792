/** Decorative 3D-ish shapes behind the homepage hero (inline SVG/CSS, no images). */
export function HeroDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
      {/* Faint orbit arcs */}
      <div className="hero-orbit left-[-18%] top-[-55%] w-[64%] aspect-square" />
      <div className="hero-orbit right-[-22%] top-[-40%] w-[60%] aspect-square" />

      {/* Ringed planet, top-left */}
      <div className="hero-float absolute left-[-14%] top-[2%] w-[52vw] sm:left-[-6%] sm:top-[8%] sm:w-[34vw] md:left-[-2%] lg:left-[0.5%] lg:w-[22vw] max-w-[420px] opacity-55 sm:opacity-80 md:opacity-100">
        <Planet />
      </div>

      {/* Glass cubes and orbs, right side */}
      <div className="hidden md:block hero-float absolute right-[2%] top-[22%] w-[170px] lg:w-[190px]" style={{ animationDelay: "-2s" }}>
        <Cube hue="violet" />
      </div>
      <div className="hidden md:block hero-float absolute right-[14%] top-[10%] w-[66px]" style={{ animationDelay: "-4s" }}>
        <Cube hue="blue" tilt={-18} />
      </div>
      <div className="hidden lg:block hero-float absolute right-[11%] top-[44%] w-[74px]" style={{ animationDelay: "-6s" }}>
        <Cube hue="lilac" tilt={14} />
      </div>
      <Orb className="hidden md:block right-[24%] top-[40%] w-12" />
      <Orb className="hidden lg:block right-[7%] top-[56%] w-4" small />
      <Orb className="left-[25%] top-[20%] w-3 hidden sm:block" small />
      <span className="absolute left-[27%] top-[42%] w-2 h-2 rounded-full bg-[#4C5EF5] opacity-70 hidden sm:block" />
      <span className="absolute right-[26%] top-[30%] w-1.5 h-1.5 rounded-full bg-[#8A6BFF] opacity-60" />

      {/* Light streak, right */}
      <div className="hero-streak hidden md:block right-[6%] top-[38%] w-[28%] rotate-[-28deg]" />
    </div>
  );
}

function Planet() {
  return (
    <svg viewBox="0 0 420 360" className="w-full h-auto overflow-visible" style={{ maxWidth: "none" }} fill="none">
      <defs>
        <radialGradient id="planet-body" cx="34%" cy="28%" r="75%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.12" stopColor="#ECEBFF" />
          <stop offset="0.38" stopColor="#B7B4FF" />
          <stop offset="0.66" stopColor="#7C80FB" />
          <stop offset="0.86" stopColor="#6A56EC" />
          <stop offset="1" stopColor="#A7C2FF" />
        </radialGradient>
        <radialGradient id="planet-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0.55" stopColor="#8B7BFF" stopOpacity="0.35" />
          <stop offset="1" stopColor="#8B7BFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="planet-ring" x1="0" x2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#C4B5FD" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7DA2FF" stopOpacity="0.85" />
        </linearGradient>
        <clipPath id="ring-front"><rect x="-300" y="0" width="600" height="200" /></clipPath>
        <filter id="ring-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5" /></filter>
      </defs>
      <circle cx="200" cy="180" r="175" fill="url(#planet-glow)" />
      {/* ring, back half */}
      <g transform="translate(200 186) rotate(-24)">
        <ellipse rx="205" ry="54" stroke="url(#planet-ring)" strokeWidth="10" opacity="0.55" filter="url(#ring-blur)" />
      </g>
      <circle cx="200" cy="180" r="128" fill="url(#planet-body)" />
      <ellipse cx="160" cy="128" rx="46" ry="30" fill="#fff" opacity="0.45" transform="rotate(-30 160 128)" />
      {/* ring, front half drawn over the planet */}
      <g transform="translate(200 186) rotate(-24)">
        <g clipPath="url(#ring-front)">
          <ellipse rx="205" ry="54" stroke="url(#planet-ring)" strokeWidth="9" />
          <ellipse rx="205" ry="54" stroke="#fff" strokeWidth="2" opacity="0.8" />
        </g>
      </g>
    </svg>
  );
}

const CUBE_COLORS = {
  violet: ["#F0C8FF", "#B78BFF", "#7C6BFF"],
  blue: ["#D7E2FF", "#8EA8FF", "#6B7CFF"],
  lilac: ["#E9DDFF", "#B49CFF", "#8D7BFF"],
} as const;

function Cube({ hue, tilt = 8 }: { hue: keyof typeof CUBE_COLORS; tilt?: number }) {
  const [top, left, right] = CUBE_COLORS[hue];
  const id = `cube-${hue}-${tilt}`;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-auto overflow-visible drop-shadow-[0_18px_28px_rgba(110,90,255,0.35)]" style={{ maxWidth: "none" }} fill="none">
      <defs>
        <linearGradient id={`${id}-t`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor={top} /></linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={left} /><stop offset="1" stopColor={right} /></linearGradient>
        <linearGradient id={`${id}-r`} x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={left} /></linearGradient>
      </defs>
      <g transform={`rotate(${tilt} 50 50)`} strokeLinejoin="round" strokeWidth="5">
        <path d="M50 12 L88 32 L50 52 L12 32Z" fill={`url(#${id}-t)`} stroke={`url(#${id}-t)`} />
        <path d="M12 32 L50 52 L50 92 L12 72Z" fill={`url(#${id}-l)`} stroke={`url(#${id}-l)`} />
        <path d="M50 52 L88 32 L88 72 L50 92Z" fill={`url(#${id}-r)`} stroke={`url(#${id}-r)`} />
        <path d="M18 34 L48 50" stroke="#fff" strokeWidth="2" opacity="0.7" />
      </g>
    </svg>
  );
}

function Orb({ className, small }: { className?: string; small?: boolean }) {
  return (
    <span
      className={`absolute aspect-square rounded-full ${className ?? ""}`}
      style={{
        background: "radial-gradient(circle at 32% 28%, #ffffff 0%, #C9D8FF 25%, #7E9BFF 62%, #6A6CF0 100%)",
        boxShadow: small ? "0 4px 10px rgba(90,110,255,0.35)" : "0 14px 28px -8px rgba(90,110,255,0.45), inset -4px -6px 10px rgba(70,60,200,0.3)",
      }}
    />
  );
}
