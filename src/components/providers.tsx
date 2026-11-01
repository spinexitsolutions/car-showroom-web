"use client";

import { useEffect } from "react";
import { useStore, useStoreHydration } from "@/lib/store";

/** Root client provider: rehydrates the persisted store + applies theme accent. */
export function Providers({ children }: { children: React.ReactNode }) {
  useStoreHydration();
  const accent = useStore((s) => s.settings.accent);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
  }, [accent]);

  return <>{children}</>;
}
