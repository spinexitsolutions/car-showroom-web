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
import { Heart, Phone, Home, CarFront, X } from "lucide-react";
import { NAV, NAV_INLINE } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { cn, EASE } from "@/lib/utils";

/** Logo mark: monogram inside a slowly rotating dashed orbit. */
export function LogoMark({ className, dark }: { className?: string; dark?: boolean }) {
  return (
    <span className={cn("relative grid size-9 place-items-center", className)}>
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full animate-spin-slow">
        <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" opacity="0.45" />
        <circle cx="20" cy="2" r="2.2" fill="var(--accent)" />
      </svg>
      <span className={cn("size-4 rounded-full", dark ? "bg-white" : "bg-ink")} />
    </span>
  );
}

function ProgressRing() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  return (
    <svg viewBox="0 0 24 24" className="size-6 -rotate-90">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        style={{ pathLength: p }}
      />
    </svg>
  );
}

/** Hamburger that morphs into an X. */
function MenuGlyph({ open, light }: { open: boolean; light?: boolean }) {
  return (
    <span className="relative block h-3 w-5">
      <motion.span
        className={cn("absolute left-0 h-[1.5px] w-full rounded", light ? "bg-white" : "bg-current")}
        animate={open ? { top: "50%", rotate: 45, y: "-50%" } : { top: "0%", rotate: 0, y: "0%" }}
        transition={{ duration: 0.4, ease: EASE }}
      />
      <motion.span
        className={cn("absolute left-0 h-[1.5px] rounded", light ? "bg-white" : "bg-current")}
        animate={open ? { top: "50%", rotate: -45, y: "-50%", width: "100%" } : { top: "100%", rotate: 0, y: "-100%", width: "60%" }}
        transition={{ duration: 0.4, ease: EASE }}
      />
    </span>
  );
}

/**
 * "Orbit Island" navigation.
 * Desktop: a floating Dynamic-Island-style pill. Scrolling down collapses it
 * into a compact capsule (logo · progress ring · menu); hovering re-expands.
 * Mobile: minimal top capsule + a floating bottom dock with a morphing menu
 * button that opens a circular-reveal full-screen menu.
 */
export function Navbar() {
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const introDone = useUI((s) => s.introDone);
  const annVisible = useUI((s) => s.annVisible);
  const [atTop, setAtTop] = useState(true);
  const wishCount = useStore((s) => s.wishlist.length);
  const settings = useStore((s) => s.settings);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCompact(y > 140);
    setAtTop(y < 30);
    setHidden(y > 400 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  const expanded = !compact || hover;
  const offset = annVisible && atTop && !menuOpen ? 40 : 0;
  const inline = NAV.filter((n) => NAV_INLINE.includes(n.href));
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* ───────── Desktop island ───────── */}
      <motion.div
        className="pointer-events-none fixed inset-x-0 top-4 z-50 hidden justify-center md:flex"
        initial={{ y: -100, opacity: 0 }}
        animate={introDone ? { y: hidden && !menuOpen ? -110 : offset, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: introDone && !compact ? 0.3 : 0 }}
      >
        <motion.nav
          layout
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => {
            setHover(false);
            setHovered(null);
          }}
          transition={{ layout: { duration: 0.55, ease: EASE } }}
          style={{ borderRadius: 999 }}
          className={cn(
            "pointer-events-auto flex items-center gap-1 p-1.5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)] ring-1",
            menuOpen ? "glass-dark text-white ring-white/10" : "glass text-ink ring-black/5"
          )}
        >
          <motion.div layout="position">
            <Link href="/" className="flex items-center gap-2.5 rounded-full py-1 pl-1.5 pr-3" data-cursor="Home">
              <LogoMark dark={menuOpen} />
              <span className="text-[15px] font-semibold tracking-[-0.03em]">{settings.brandShort}</span>
            </Link>
          </motion.div>

          <AnimatePresence initial={false} mode="popLayout">
            {expanded ? (
              <motion.ul
                key="links"
                layout
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.35 }}
                className="flex items-center"
              >
                {inline.map((n) => (
                  <li key={n.href} className="relative" onMouseEnter={() => setHovered(n.href)}>
                    {(hovered ?? (isActive(n.href) ? n.href : null)) === n.href && (
                      <motion.span
                        layoutId="nav-pill"
                        className={cn("absolute inset-0 rounded-full", menuOpen ? "bg-white/10" : "bg-ink/[0.06]")}
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Link
                      href={n.href}
                      className="relative flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 text-[13.5px] font-medium tracking-tight"
                    >
                      {isActive(n.href) && <span className="size-1 rounded-full bg-accent" />}
                      {n.label}
                    </Link>
                  </li>
                ))}
              </motion.ul>
            ) : (
              <motion.div
                key="compact"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-2"
              >
                <ProgressRing />
                <span className="eyebrow !text-[10px] text-muted">
                  {NAV.find((n) => isActive(n.href))?.label ?? "Explore"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.span layout="position" className="mx-1 h-5 w-px bg-current opacity-15" />

          <motion.div layout="position" className="flex items-center gap-1">
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className={cn(
                "relative grid size-10 place-items-center rounded-full transition-colors",
                menuOpen ? "hover:bg-white/10" : "hover:bg-ink/[0.06]"
              )}
            >
              <Heart className="size-[17px]" />
              <AnimatePresence>
                {wishCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold text-white"
                  >
                    {wishCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-full px-4 text-[13px] font-medium transition-colors",
                menuOpen ? "hover:bg-white/10" : "hover:bg-ink/[0.06]"
              )}
            >
              <MenuGlyph open={menuOpen} />
              <span className="hidden lg:inline">{menuOpen ? "Close" : "Menu"}</span>
            </button>
            <Link
              href="/book-test-drive"
              className="group relative flex h-10 items-center overflow-hidden rounded-full bg-accent px-4 text-[13px] font-medium text-white"
            >
              <span className="relative z-10">Test drive</span>
              <span className="absolute inset-0 -translate-x-full bg-ink transition-transform duration-500 ease-out-expo group-hover:translate-x-0" />
            </Link>
          </motion.div>
        </motion.nav>
      </motion.div>

      {/* ───────── Mobile top capsule ───────── */}
      <motion.div
        className="fixed inset-x-0 top-3 z-50 flex justify-between px-3 md:hidden"
        initial={{ y: -80 }}
        animate={{ y: introDone && !hidden ? offset : -80 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-full py-1 pl-1 pr-4 shadow-lg ring-1",
            menuOpen ? "glass-dark text-white ring-white/10" : "glass ring-black/5"
          )}
        >
          <LogoMark dark={menuOpen} />
          <span className="text-[15px] font-semibold tracking-[-0.03em]">{settings.brandShort}</span>
        </Link>
        <Link
          href="/book-test-drive"
          className="flex items-center rounded-full bg-accent px-4 text-[13px] font-medium text-white shadow-lg"
        >
          Test drive
        </Link>
      </motion.div>

      {/* ───────── Mobile bottom dock ───────── */}
      <motion.div
        className="fixed inset-x-0 bottom-[max(12px,env(safe-area-inset-bottom))] z-[60] flex justify-center md:hidden"
        initial={{ y: 120 }}
        animate={{ y: introDone ? 0 : 120 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
      >
        <nav className="glass-dark flex items-center gap-1 rounded-full p-1.5 text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/inventory", icon: CarFront, label: "Cars" },
          ].map((t) => (
            <DockLink key={t.href} {...t} active={isActive(t.href) && !menuOpen} />
          ))}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            className="relative mx-1 grid size-14 place-items-center rounded-full bg-accent text-white transition-transform active:scale-90"
          >
            {menuOpen ? <X className="size-5" /> : <MenuGlyph open={false} light />}
          </button>
          <DockLink href="/wishlist" icon={Heart} label="Saved" active={isActive("/wishlist") && !menuOpen} badge={wishCount} />
          <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex w-14 flex-col items-center gap-0.5 py-1.5 text-white/60">
            <Phone className="size-[18px]" />
            <span className="text-[9px] font-medium">Call</span>
          </a>
        </nav>
      </motion.div>

      <FullMenu open={menuOpen} onClose={() => setMenuOpen(false)} isActive={isActive} />
    </>
  );
}

function DockLink({
  href,
  icon: Icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link href={href} className={cn("relative flex w-14 flex-col items-center gap-0.5 py-1.5 transition-colors", active ? "text-white" : "text-white/55")}>
      {active && (
        <motion.span layoutId="dock-dot" className="absolute -top-0.5 size-1 rounded-full bg-accent" />
      )}
      <Icon className="size-[18px]" />
      <span className="text-[9px] font-medium">{label}</span>
      {!!badge && (
        <span className="absolute right-2.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold">
          {badge}
        </span>
      )}
    </Link>
  );
}

/** Full-screen menu with circular clip-path reveal + hover image preview. */
function FullMenu({
  open,
  onClose,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (h: string) => boolean;
}) {
  const [preview, setPreview] = useState<number>(0);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("menu-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 overflow-y-auto bg-ink text-white"
          data-lenis-prevent
          initial={{ clipPath: "circle(0% at 50% 100%)" }}
          animate={{ clipPath: "circle(150% at 50% 100%)" }}
          exit={{ clipPath: "circle(0% at 50% 100%)" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="grain pointer-events-none absolute inset-0" />
          <div className="container-x relative grid min-h-full gap-10 pb-36 pt-24 md:grid-cols-[1.3fr_1fr] md:pb-12 md:pt-32">
            <ul className="flex flex-col justify-center">
              {NAV.map((n, i) => (
                <motion.li
                  key={n.href}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.25 + i * 0.05 }}
                  onMouseEnter={() => setPreview(i)}
                  className="border-b border-white/10"
                >
                  <Link href={n.href} onClick={onClose} className="group flex items-baseline gap-4 py-3 md:py-4">
                    <span className="font-mono text-[11px] text-white/35">0{i + 1}</span>
                    <span
                      className={cn(
                        "display text-[40px] transition-all duration-500 ease-out-expo group-hover:translate-x-3 md:text-[64px]",
                        isActive(n.href) ? "text-white" : "text-white/55 group-hover:text-white"
                      )}
                    >
                      {n.label.split(" ")[0]}{" "}
                      <span className="serif-i">{n.label.split(" ").slice(1).join(" ")}</span>
                    </span>
                    {isActive(n.href) && <span className="ml-auto size-2 rounded-full bg-accent" />}
                  </Link>
                </motion.li>
              ))}
            </ul>

            <div className="flex flex-col justify-between gap-8">
              <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] md:block">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={preview}
                    src={NAV[preview].image}
                    alt=""
                    initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.2 }}
                    animate={{ clipPath: "inset(0% 0 0 0)", scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="serif-i absolute bottom-6 left-6 text-4xl">{NAV[preview].label}</p>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-2 gap-6 text-[14px]"
              >
                <div>
                  <p className="eyebrow mb-2 text-white/40">Visit</p>
                  <p className="text-white/80">{settings.address}</p>
                </div>
                <div>
                  <p className="eyebrow mb-2 text-white/40">Talk</p>
                  <a href={`tel:${settings.phone}`} className="block text-white/80">{settings.phone}</a>
                  <a href={`mailto:${settings.email}`} className="block text-white/80">{settings.email}</a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
