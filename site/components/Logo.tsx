// Ember Roast mark: a coffee bean whose crease is a small flame. Drawn in code (no real logo).

export const LOGO_PATHS = {
  bean: "M16 3.2c6.4 0 10.6 5.9 10.6 12.8S22.4 28.8 16 28.8 5.4 22.9 5.4 16 9.6 3.2 16 3.2Z",
  crease: "M15.2 6.2c-3.4 3.6 3.9 6.6 0.4 10.2s-2.6 6.8 1.2 9.4",
};

export function LogoMark({ className = "", glow = true }: { className?: string; glow?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <g transform="rotate(28 16 16)">
        <path d={LOGO_PATHS.bean} fill="currentColor" />
        <path d={LOGO_PATHS.crease} stroke="#e0913f" strokeWidth="1.9" strokeLinecap="round" />
      </g>
      {glow && <circle cx="24.5" cy="7" r="1.8" fill="#e0913f" />}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-7 w-7 text-[#f4e9d8]" />
      <span className="font-display text-[21px] leading-none tracking-[-0.01em]">Ember Roast</span>
    </span>
  );
}

export const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1b120c"/><g transform="rotate(28 16 16)"><path d="${LOGO_PATHS.bean}" fill="#f4e9d8" transform="translate(3.2 3.2) scale(.8)"/><path d="${LOGO_PATHS.crease}" stroke="#e0913f" stroke-width="2.2" stroke-linecap="round" fill="none" transform="translate(3.2 3.2) scale(.8)"/></g></svg>`;
