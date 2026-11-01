"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, GitCompareArrows } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { EASE } from "@/lib/utils";

/** Floating tray that appears while cars are queued for comparison. */
export function CompareTray() {
  const hydrated = useHydrated();
  const compare = useStore((s) => s.compare);
  const cars = useStore((s) => s.cars);
  const toggle = useStore((s) => s.toggleCompare);
  const clear = useStore((s) => s.clearCompare);
  const items = compare.map((id) => cars.find((c) => c.id === id)).filter(Boolean);

  return (
    <AnimatePresence>
      {hydrated && items.length > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-2xl md:bottom-6"
        >
          <div className="glass-dark flex items-center gap-3 rounded-[1.6rem] p-2 pl-3 text-white shadow-2xl shadow-black/30">
            <GitCompareArrows className="size-4 shrink-0 text-white/60 max-sm:hidden" />
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto no-scrollbar">
              <AnimatePresence initial={false}>
                {items.map((c) => (
                  <motion.div
                    layout
                    key={c!.id}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-2"
                  >
                    <img src={c!.images[0]} alt="" className="size-8 rounded-full object-cover" />
                    <span className="max-w-24 truncate text-[12px] font-medium">{c!.model}</span>
                    <button aria-label="Remove" onClick={() => toggle(c!.id)} className="text-white/50 hover:text-white">
                      <X className="size-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button onClick={clear} className="eyebrow shrink-0 px-2 text-white/50 hover:text-white max-sm:hidden">
              Clear
            </button>
            <Link
              href="/compare"
              className="shrink-0 rounded-full bg-accent px-4 py-2.5 text-[13px] font-medium text-accent-ink transition-transform active:scale-95"
            >
              Compare {items.length}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
