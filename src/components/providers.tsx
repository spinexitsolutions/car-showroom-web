"use client";

import { useEffect } from "react";
import { useStore, useStoreHydration } from "@/lib/store";

/** Pick black or white text for best contrast on the accent colour. */
function inkFor(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "#ffffff";
  const [r, g, b] = m.slice(1).map((h) => {
    const c = parseInt(h, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return L > 0.4 ? "#0a0a0c" : "#ffffff";
}

/** Root client provider: rehydrates the persisted store + applies theme accent. */
export function Providers({ children }: { children: React.ReactNode }) {
  useStoreHydration();
  const accent = useStore((s) => s.settings.accent);

  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--accent", accent);
    root.setProperty("--accent-ink", inkFor(accent));
  }, [accent]);

  return <>{children}</>;
}
