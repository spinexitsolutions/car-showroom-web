"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { NAV } from "@/lib/nav";

let firstMount = true;

/**
 * Route transition: an ink curtain with the page name sweeps up and away,
 * then content rises in. Skipped on the very first load (the intro owns that).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const enabled = useStore((s) => s.settings.pageTransitions);
  const pathname = usePathname();
  // Decided once at mount so it never re-triggers mid-page.
  const [isFirst] = useState(() => firstMount);
  const [curtain] = useState(
    () => !firstMount && useStore.getState().settings.pageTransitions && useUI.getState().introDone
  );
  useEffect(() => {
    firstMount = false;
  }, []);
  const name =
    NAV.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href)))?.label ??
    pathname.split("/").filter(Boolean)[0]?.replace(/-/g, " ") ??
    "Home";

  return (
    <>
      {curtain && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-ink text-white"
          initial={{ y: "0%" }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
          style={{ borderBottomLeftRadius: "50% 8vh", borderBottomRightRadius: "50% 8vh" }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: [0, 1, 1, 0], y: [20, 0, 0, -30] }}
            transition={{ duration: 0.9, times: [0, 0.3, 0.6, 1] }}
            className="em-light text-5xl capitalize md:text-7xl"
          >
            {name}
          </motion.span>
        </motion.div>
      )}
      <motion.div
        initial={enabled && !isFirst ? { opacity: 0, y: 40 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: curtain ? 0.45 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}
