"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";

/** Lenis inertial scrolling (toggle in admin → settings). */
export function SmoothScroll() {
  const enabled = useStore((s) => s.settings.smoothScroll);
  const menuOpen = useUI((s) => s.menuOpen);
  const pathname = usePathname();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let raf = 0;
    const loop = (t: number) => {
      l.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    setLenis(l);
    return () => {
      cancelAnimationFrame(raf);
      l.destroy();
      setLenis(null);
    };
  }, [enabled]);

  useEffect(() => {
    if (!lenis) return;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [menuOpen, lenis]);

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, lenis]);

  return null;
}

/**
 * Custom cursor: a precise dot plus a lagging ring. Over [data-cursor]
 * elements the ring grows into a label bubble ("View", "Drag" …).
 */
export function Cursor() {
  const enabled = useStore((s) => s.settings.customCursor);
  const [active, setActive] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hoverLink, setHoverLink] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });

  useEffect(() => {
    if (!enabled || !window.matchMedia("(pointer: fine)").matches) return;
    setActive(true);
    document.documentElement.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      const c = t?.closest<HTMLElement>("[data-cursor]");
      setLabel(c?.dataset.cursor ?? null);
      setHoverLink(!!t?.closest("a,button,input,select,textarea,label,[role=button]"));
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
      setActive(false);
    };
  }, [enabled, x, y]);

  if (!active) return null;
  const size = label ? 84 : hoverLink ? 52 : 34;
  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[200] mix-blend-difference"
        style={{ x, y }}
      >
        <div className="size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
      </motion.div>
      <motion.div className="pointer-events-none fixed left-0 top-0 z-[199]" style={{ x: rx, y: ry }}>
        <motion.div
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
          animate={{
            width: size,
            height: size,
            scale: down ? 0.85 : 1,
            backgroundColor: label ? "var(--accent)" : "rgba(0,0,0,0)",
            borderColor: label ? "rgba(0,0,0,0)" : "rgba(127,127,127,0.55)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{ borderWidth: 1, borderStyle: "solid" }}
        >
          <AnimatePresence>
            {label && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="eyebrow !text-[10px] text-white"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </>
  );
}

/** Dismissible announcement strip (admin → content). */
export function AnnouncementBar() {
  const a = useStore((s) => s.settings.announcement);
  const introDone = useUI((s) => s.introDone);
  const [closed, setClosed] = useState(false);
  const setAnnVisible = useUI((s) => s.setAnnVisible);
  const visible = a.enabled && !closed;
  useEffect(() => setAnnVisible(visible), [visible, setAnnVisible]);
  if (!visible) return null;
  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: introDone ? "auto" : 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-[45] overflow-hidden bg-ink text-white"
    >
      <div className="container-x flex items-center justify-center gap-3 py-2.5 pr-10 text-center text-[12.5px]">
        <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
        <a href={a.link} className="truncate text-white/85 hover:text-white">
          {a.text} <span className="text-white/50">→</span>
        </a>
        <button
          onClick={() => setClosed(true)}
          aria-label="Dismiss"
          className="absolute right-4 text-white/50 hover:text-white"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}

export function WhatsAppButton() {
  const s = useStore((st) => st.settings);
  const introDone = useUI((st) => st.introDone);
  return (
    <motion.a
      href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Hi ${s.brandName}, I'd like to know more about your cars.`)}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: introDone ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1 }}
      className="fixed bottom-6 right-6 z-40 hidden size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl md:grid"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
      <svg viewBox="0 0 24 24" className="relative size-7 fill-current">
        <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36A9.43 9.43 0 1 1 12.05 21.5m8.02-17.45A11.33 11.33 0 0 0 12.05.72C5.8.72.71 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.6l6.01-1.58a11.3 11.3 0 0 0 5.43 1.38h.01c6.25 0 11.34-5.08 11.35-11.33a11.27 11.27 0 0 0-3.33-8.02" />
      </svg>
    </motion.a>
  );
}
