"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";
import { Heart, Phone, ArrowUpRight } from "lucide-react";
import { NAV, NAV_INLINE } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { cn, EASE } from "@/lib/utils";

/** Slanted racing monogram: two parallelograms forming an "O" in motion. */
export function LogoMark({ className }: { className?: string; dark?: boolean }) {
  return (
    <svg viewBox="0 0 40 28" className={cn("h-6 w-auto", className)} aria-hidden>
      <path d="M10 0h28l-8 28H2z" fill="currentColor" />
      <path d="M17 7h12l-4 14H13z" fill="var(--accent)" />
    </svg>
  );
}

/** Wordmark: wide, slanted, heavy. */
function Wordmark({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[18px] font-extrabold uppercase italic leading-none tracking-[0.02em] [font-stretch:125%]">
        {text}
      </span>
    </span>
  );
}

/** Live showroom clock + open/closed state (from the admin "hours" text). */
function useShowroomStatus(hours: string) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!now) return { time: "--:--", open: true };
  const m = hours.match(/(\d{1,2}):(\d{2}).*?(\d{1,2}):(\d{2})/);
  const mins = now.getHours() * 60 + now.getMinutes();
  const open = m ? mins >= +m[1] * 60 + +m[2] && mins < +m[3] * 60 + +m[4] : true;
  return {
    time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }),
    open,
  };
}

/**
 * "Corner HUD" navigation.
 * Brand anchored top-left, actions top-right, links as numbered gauge-ticks in
 * between. At the top it floats over the dark stage; once you scroll it
 * becomes a solid instrument strip with a full-width accent "rev bar" showing
 * scroll progress, hides on scroll-down and returns on scroll-up.
 * Mobile: corners only + a contextual quick-action bar (call · WhatsApp ·
 * test drive) that docks at the bottom once you start scrolling.
 */
export function Navbar() {
  const pathname = usePathname();
  const { scrollY, scrollYProgress } = useScroll();
  const rev = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [deep, setDeep] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const introDone = useUI((s) => s.introDone);
  const annVisible = useUI((s) => s.annVisible);
  const wishCount = useStore((s) => s.wishlist.length);
  const settings = useStore((s) => s.settings);
  const carCount = useStore((s) => s.cars.filter((c) => c.status !== "sold").length);
  const status = useShowroomStatus(settings.hours);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setSolid(y > 60);
    setDeep(y > 500);
    if (y > 300 && y > prev + 6) setHidden(true);
    else if (y < prev - 6 || y < 300) setHidden(false);
  });

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  // Pages that open on a dark "stage" let the bar float transparently;
  // anything else gets the solid strip from the start.
  const [onStage, setOnStage] = useState(true);
  useEffect(() => {
    const main = document.querySelector("main") ?? document.body;
    const check = () => setOnStage(!!main.querySelector("[data-stage]"));
    check();
    const mo = new MutationObserver(check);
    mo.observe(main, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [pathname]);
  const strip = (solid || !onStage) && !menuOpen;

  const offset = annVisible && !solid && !menuOpen ? 38 : 0;
  const inline = NAV.filter((n) => NAV_INLINE.includes(n.href));
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const tel = `tel:${settings.phone.replace(/\s/g, "")}`;

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 text-white"
        initial={{ y: -120 }}
        animate={{ y: !introDone ? -120 : hidden && !menuOpen ? -90 : offset }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {/* solid strip */}
        <motion.div
          className="absolute inset-0 border-b border-white/10 bg-ink/85 backdrop-blur-xl"
          initial={false}
          animate={{ opacity: strip ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
        <div className="container-x relative flex h-16 items-center justify-between gap-6 md:h-[76px]">
          {/* Brand + HUD read-out */}
          <Link href="/" className="flex items-center gap-5" data-cursor="Home">
            <Wordmark text={settings.brandShort} />
            <span className="hidden h-8 w-px bg-white/15 xl:block" />
            <span className="hud hidden flex-col text-[10px] uppercase leading-tight tracking-[0.14em] text-white/55 xl:flex">
              <span className="flex items-center gap-1.5">
                <span className={cn("size-1.5 rounded-full", status.open ? "bg-emerald-400" : "bg-white/40")} />
                {status.open ? "Showroom open" : "Closed now"} · {status.time}
              </span>
              <span>{carCount} cars on the floor</span>
            </span>
          </Link>

          {/* Links — numbered gauge ticks */}
          <nav className="hidden items-center lg:flex" onMouseLeave={() => setHovered(null)}>
            {inline.map((n, i) => {
              const on = isActive(n.href);
              const hl = hovered ? hovered === n.href : on;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  onMouseEnter={() => setHovered(n.href)}
                  className="group relative flex flex-col items-start px-4 py-2"
                >
                  <span className={cn("hud text-[10px] transition-colors", on ? "text-accent" : "text-white/35")}>
                    0{i + 1}
                  </span>
                  <span className={cn("text-[14px] font-semibold tracking-[-0.01em] [font-stretch:110%] transition-colors", hl ? "text-white" : "text-white/65")}>
                    {n.label}
                  </span>
                  {hl && (
                    <motion.span
                      layoutId="nav-tick"
                      className="absolute -bottom-0.5 left-4 right-4 h-[2px] bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden size-11 place-items-center text-white/80 transition-colors hover:text-white sm:grid"
            >
              <Heart className="size-[18px]" />
              {wishCount > 0 && (
                <span className="hud absolute right-1 top-1 grid min-w-4 place-items-center bg-accent px-1 text-[9px] text-accent-ink">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              href="/book-test-drive"
              className="chamfer chamfer-sm group relative hidden h-11 items-center gap-2 overflow-hidden bg-accent pl-4 pr-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-accent-ink [font-family:var(--font-chakra)] sm:flex"
            >
              <span className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 ease-out-expo group-hover:translate-x-0" />
              <span className="relative transition-colors group-hover:text-ink">Test drive</span>
              <ArrowUpRight className="relative size-4 transition-all group-hover:rotate-45 group-hover:text-ink" />
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="chamfer chamfer-sm flex h-11 items-center gap-3 bg-white/10 pl-4 pr-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] backdrop-blur-md transition-colors [font-family:var(--font-chakra)] hover:bg-white/20"
            >
              <span className="hidden sm:inline">{menuOpen ? "Close" : "Menu"}</span>
              <span className="relative block h-3 w-5">
                <motion.span
                  className="absolute right-0 h-[2px] bg-current"
                  animate={menuOpen ? { top: "45%", rotate: 45, width: "100%" } : { top: "0%", rotate: 0, width: "100%" }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
                <motion.span
                  className="absolute right-0 h-[2px] bg-current"
                  animate={menuOpen ? { top: "45%", rotate: -45, width: "100%" } : { top: "85%", rotate: 0, width: "60%" }}
                  transition={{ duration: 0.4, ease: EASE }}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Rev bar: scroll progress across the full width */}
        <div className={cn("absolute inset-x-0 bottom-0 h-[2px] transition-opacity duration-500", solid && !menuOpen ? "opacity-100" : "opacity-0")}>
          <motion.div style={{ scaleX: rev }} className="h-full origin-left bg-accent" />
        </div>
      </motion.header>

      {/* ───────── Mobile quick-action bar ───────── */}
      <AnimatePresence>
        {introDone && deep && !menuOpen && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-ink/90 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl md:hidden"
          >
            <div className="flex items-stretch gap-2">
              <a href={tel} aria-label="Call" className="chamfer chamfer-sm grid w-12 place-items-center bg-white/10 text-white">
                <Phone className="size-[18px]" />
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                aria-label="WhatsApp"
                className="chamfer chamfer-sm grid w-12 place-items-center bg-[#25D366] text-white"
              >
                <svg viewBox="0 0 24 24" className="size-5 fill-current"><path d="M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36A9.43 9.43 0 1 1 12.05 21.5m8.02-17.45A11.33 11.33 0 0 0 12.05.72C5.8.72.71 5.8.7 12.06c0 2 .52 3.95 1.52 5.67L.6 23.6l6.01-1.58a11.3 11.3 0 0 0 5.43 1.38h.01c6.25 0 11.34-5.08 11.35-11.33a11.27 11.27 0 0 0-3.33-8.02" /></svg>
              </a>
              <Link
                href="/book-test-drive"
                className="chamfer chamfer-sm flex h-12 flex-1 items-center justify-between bg-accent px-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-accent-ink [font-family:var(--font-chakra)]"
              >
                Book a test drive <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <FullMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </>
  );
}

/**
 * Full-screen menu with a "shutter" reveal: five vertical blades drop in
 * sequence, then the index slides in. Hovering a link swaps the framed image.
 */
function FullMenu({
  open,
  onClose,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (h: string) => boolean;
}) {
  const [preview, setPreview] = useState(0);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-40 text-white" initial="closed" animate="open" exit="closed">
          {/* shutter blades */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-full flex-1 origin-top bg-ink"
                variants={{
                  closed: { scaleY: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: (4 - i) * 0.04 } },
                  open: { scaleY: 1, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: i * 0.05 } },
                }}
              />
            ))}
          </div>

          <motion.div
            data-lenis-prevent
            className="relative h-full overflow-y-auto"
            variants={{ closed: { opacity: 0, transition: { duration: 0.2 } }, open: { opacity: 1, transition: { delay: 0.35 } } }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:64px_64px]" />
            <div className="container-x relative grid min-h-full gap-10 pb-16 pt-24 md:grid-cols-[1.25fr_1fr] md:pt-32">
              <ul className="flex flex-col justify-center">
                {NAV.map((n, i) => (
                  <motion.li
                    key={n.href}
                    variants={{
                      closed: { opacity: 0, x: -30 },
                      open: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE, delay: 0.4 + i * 0.045 } },
                    }}
                    onMouseEnter={() => setPreview(i)}
                    className="border-b border-white/10"
                  >
                    <Link href={n.href} onClick={onClose} className="group flex items-center gap-5 py-3 md:py-3.5">
                      <span className={cn("hud w-7 text-[12px]", isActive(n.href) ? "text-accent" : "text-white/35")}>0{i + 1}</span>
                      <span
                        className={cn(
                          "display text-[38px] uppercase transition-all duration-500 ease-out-expo group-hover:translate-x-3 group-hover:text-white md:text-[56px]",
                          isActive(n.href) ? "text-white" : "text-white/45"
                        )}
                      >
                        {n.label}
                      </span>
                      <ArrowUpRight className="ml-auto size-6 -translate-x-3 text-accent opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col justify-center gap-8">
                <div className="relative hidden aspect-[4/5] p-3 text-white/40 brackets md:block">
                  <div className="chamfer chamfer-lg relative h-full overflow-hidden">
                    <AnimatePresence mode="popLayout">
                      <motion.img
                        key={preview}
                        src={NAV[preview].image}
                        alt=""
                        initial={{ clipPath: "inset(0 0 0 100%)", scale: 1.15 }}
                        animate={{ clipPath: "inset(0 0 0 0%)", scale: 1 }}
                        exit={{ opacity: 0.6 }}
                        transition={{ duration: 0.8, ease: EASE }}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <p className="display absolute bottom-6 left-6 text-4xl uppercase text-white">{NAV[preview].label}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-[14px]">
                  <div>
                    <p className="eyebrow mb-2 text-white/40">Visit</p>
                    <p className="text-white/80">{settings.address}</p>
                    <p className="hud mt-2 text-[12px] text-white/45">{settings.hours}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-2 text-white/40">Talk</p>
                    <a href={`tel:${settings.phone}`} className="hud block text-white/80">{settings.phone}</a>
                    <a href={`mailto:${settings.email}`} className="block text-white/80">{settings.email}</a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
