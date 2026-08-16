// Centralised design tokens surfaced to Tailwind via tailwind.config.js.
// Theme values are kept here so buyer theming is data-driven.

interface Tokens {
  color: Record<string, string>;
  radius: Record<string, string>;
  font: Record<string, string>;
}

export const tokens: Tokens = {
  color: {
    background: "#020617", // slate-950
    surface: "rgba(255,255,255,0.06)",
    "surface-elevated": "rgba(255,255,255,0.09)",
    "surface-hover": "rgba(255,255,255,0.12)",
    border: "rgba(255,255,255,0.10)",
    "border-active": "rgba(34,211,238,0.40)",
    "text-primary": "#ffffff",
    "text-secondary": "#cbd5e1", // slate-300
    "text-muted": "#64748b", // slate-500
    "brand-primary": "#22d3ee", // cyan-400
    "brand-secondary": "#a855f7", // purple-500
    success: "#34d399", // emerald-400
    warning: "#fbbf24", // amber-300
    danger: "#fb7185", // rose-400
    info: "#38bdf8", // sky-400
  },
  radius: {
    sm: "0.75rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  font: {
    display: "font-black",
    h1: "text-4xl md:text-6xl font-black",
    h2: "text-2xl md:text-3xl font-black",
    h3: "text-xl font-black",
    body: "text-sm leading-6 text-slate-400",
    numeric: "tabular-nums font-black",
  },
};

export default tokens;
