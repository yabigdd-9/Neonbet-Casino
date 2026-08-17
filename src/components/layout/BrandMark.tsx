// Brand logo mark with a graceful fallback. If the configured logo asset fails
// to load (e.g. a buyer hasn't supplied one), we fall back to the brand's
// short-name text badge — never a broken image.
import React, { useState } from "react";
import { brand } from "../../config/brand";

interface BrandMarkProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export default function BrandMark({ size = 44, className = "", showWordmark = false }: BrandMarkProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const badge = (
    <div
      className="grid place-items-center rounded-2xl bg-cyan-400 font-black text-slate-950 shadow-neon"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {brand.shortName}
    </div>
  );

  if (logoFailed) {
    return badge;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={brand.logo}
        alt={`${brand.name} logo`}
        width={size}
        height={size}
        className="rounded-2xl"
        onError={() => setLogoFailed(true)}
      />
      {showWordmark && (
        <span className="font-black tracking-tight text-white">{brand.name}</span>
      )}
    </div>
  );
}
