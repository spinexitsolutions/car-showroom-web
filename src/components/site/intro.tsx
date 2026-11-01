"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate } from "framer-motion";
import { useHydrated, useStore } from "@/lib/store";
import { INTRO_KEY, useUI } from "@/lib/ui";
import { EASE, EASE_IN_OUT } from "@/lib/utils";

/**
 * Cinematic intro (fully admin-controlled):
 * 1. ink screen, mono counter 000 → 100 + a "rev" gauge line
 * 2. brand letters rise through a mask, subtitle fades in
 * 3. split-curtain: top & bottom halves slide apart to reveal the site
 */
export function Intro() {
  const hydrated = useHydrated();
  const intro = useStore((s) => s.settings.intro);
  const setIntroDone = useUI((s) => s.setIntroDone);
  const [phase, setPhase] = useState<"boot" | "play" | "exit" | "gone">("boot");
  const [count, setCount] = useState(0);

  // Decide whether to play once settings are loaded.
  useEffect(() => {
    if (!hydrated || phase !== "boot") return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!intro.enabled || (intro.oncePerSession && seen) || reduce) {
      setPhase("gone");
      setIntroDone(true);
      return;
    }
    setPhase("play");
  }, [hydrated, intro.enabled, intro.oncePerSession, phase, setIntroDone]);

  useEffect(() => {
    if (phase !== "play") return;
    document.documentElement.style.overflow = "hidden";
    const d = Math.max(1200, intro.durationMs) / 1000;
    const c = animate(0, 100, {
      duration: d * 0.72,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (v) => setCount(Math.round(v)),
    });
    const t = setTimeout(() => {
      setPhase("exit");
      setIntroDone(true);
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
    }, d * 1000);
    return () => {
      c.stop();
      clearTimeout(t);
    };
  }, [phase, intro.durationMs, setIntroDone]);

  useEffect(() => {
    if (phase === "gone") document.documentElement.style.overflow = "";
  }, [phase]);

  const letters = (intro.title || "ORBIS").split("");
  const d = Math.max(1200, intro.durationMs) / 1000;

  return (
    <AnimatePresence onExitComplete={() => setPhase("gone")}>
      {(phase === "boot" || phase === "play") && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] text-white"
          exit={{ pointerEvents: "none" }}
          transition={{ duration: 1.1 }}
          aria-hidden
        >
          {/* split curtain */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-ink"
            exit={{ y: "-100%" }}
            transition={{ duration: 1.1, ease: EASE_IN_OUT }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-ink"
            exit={{ y: "100%" }}
            transition={{ duration: 1.1, ease: EASE_IN_OUT }}
          />

          <motion.div
            className="relative flex h-full flex-col items-center justify-center"
            exit={{ opacity: 0, scale: 1.08, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {phase === "play" && (
              <>
                <h1 className="display flex overflow-hidden text-[22vw] leading-[0.85] md:text-[15vw]">
                  {letters.map((l, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={{ y: "105%" }}
                      animate={{ y: "0%" }}
                      transition={{ duration: 1, ease: EASE, delay: 0.15 + i * 0.07 }}
                    >
                      {l === " " ? " " : l}
                    </motion.span>
                  ))}
                </h1>
                <motion.p
                  className="em-light mt-2 text-xl text-white/60 md:text-3xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.6 }}
                >
                  {intro.subtitle}
                </motion.p>

                {/* rev gauge */}
                <div className="absolute inset-x-5 bottom-10 md:inset-x-10">
                  <div className="flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
                    <span>Starting engine</span>
                    <span className="text-5xl font-medium tracking-tighter text-white tabular-nums md:text-7xl">
                      {String(count).padStart(3, "0")}
                    </span>
                  </div>
                  <div className="relative mt-4 h-px w-full bg-white/15">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-accent"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: d * 0.72, ease: [0.65, 0, 0.35, 1] }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between font-mono text-[10px] text-white/30">
                    {Array.from({ length: 9 }).map((_, i) => (
                      <span key={i}>{i}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
