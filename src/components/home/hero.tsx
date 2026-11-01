"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import type { Car } from "@/lib/types";
import { cn, EASE, formatPrice } from "@/lib/utils";

const SLIDE_MS = 6500;
const num = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;

/** Number that tweens from its previous value whenever `value` changes. */
function Tween({
  value,
  format = (v) => Math.round(v).toLocaleString("en-IN"),
}: {
  value: number;
  format?: (v: number) => string;
}) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 1.1, ease: EASE, onUpdate: setV });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <span className="tabular-nums">{format(v)}</span>;
}

const R = 82;
const C = 2 * Math.PI * R;

/** Speedometer: 240° arc with ticks; the needle springs to the car's power. */
function Gauge({ hp }: { hp: number }) {
  const MAX = 1100;
  const angle = useSpring(-120, { stiffness: 60, damping: 14, mass: 1.2 });
  useEffect(() => {
    angle.set(-120 + 240 * Math.min(1, hp / MAX));
  }, [hp, angle]);
  const rotate = useTransform(angle, (a) => `rotate(${a}deg)`);
  const dash = useTransform(angle, (a) => `${((a + 120) / 360) * C} ${C}`);
  return (
    <div className="relative size-[min(210px,24vh)]">
      <svg viewBox="0 0 200 200" className="size-full">
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"
          strokeDasharray={`${(240 / 360) * C} ${C}`} transform="rotate(150 100 100)" />
        <motion.circle cx="100" cy="100" r={R} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
          style={{ strokeDasharray: dash }} transform="rotate(150 100 100)" />
        {Array.from({ length: 25 }).map((_, i) => {
          const a = ((-120 + i * 10 - 90) * Math.PI) / 180;
          const major = i % 4 === 0;
          const r1 = major ? 63 : 68;
          return (
            <line key={i} x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1}
              x2={100 + Math.cos(a) * 73} y2={100 + Math.sin(a) * 73}
              stroke={major ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)"} strokeWidth={major ? 1.5 : 1} />
          );
        })}
        {[0, 4, 8, 12, 16, 20, 24].map((i) => {
          const a = ((-120 + i * 10 - 90) * Math.PI) / 180;
          return (
            <text key={i} x={100 + Math.cos(a) * 52} y={100 + Math.sin(a) * 52 + 3} textAnchor="middle"
              fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
              {Math.round((i / 24) * MAX / 100) * 100}
            </text>
          );
        })}
        <motion.g style={{ rotate, originX: "100px", originY: "100px" }}>
          <line x1="100" y1="100" x2="100" y2="30" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="100" r="6" fill="#0a0a0c" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <div className="absolute inset-x-0 bottom-5 text-center">
        <p className="display text-4xl text-white"><Tween value={hp} /></p>
        <p className="eyebrow mt-1 text-white/45">Horsepower</p>
      </div>
    </div>
  );
}

/** Big model name: each character drops in on slide change. */
function ModelName({ car }: { car: Car }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={car.id} className="min-w-0">
        <motion.p
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="eyebrow flex items-center gap-3 text-white/70"
        >
          <span className="h-px w-8 bg-accent" />
          {car.brand} · {car.year} · {car.condition}
        </motion.p>
        <h2
          className="display mt-3 flex overflow-hidden whitespace-nowrap pb-[0.06em] text-[16vw] leading-[0.86] text-white md:text-[min(8.5vw,14vh)] xl:text-[min(128px,14vh)]"
          aria-label={car.model}
        >
          {car.model.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ y: "105%", rotate: 8 }}
              animate={{ y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE, delay: 0.05 + i * 0.035 } }}
              exit={{ y: "-105%", transition: { duration: 0.35, ease: [0.7, 0, 0.84, 0], delay: i * 0.015 } }}
            >
              {ch === " " ? " " : ch}
            </motion.span>
          ))}
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.7, ease: EASE } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="em-light mt-1 truncate text-2xl text-white/80 md:text-4xl"
        >
          {car.variant}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * HERO — "Showroom stage".
 * A full-bleed, auto-playing stage that presents the featured cars one by one:
 * wipe-in imagery with a slow push-in, a speedometer whose needle springs to
 * each car's power, live-tweening spec read-outs and a filmstrip selector
 * with progress. Pointer parallax on desktop; while scrolling, the stage stays
 * pinned and recedes (scale + rounded corners) beneath the next section.
 */
export function Hero() {
  const hero = useStore((s) => s.settings.hero);
  const allCars = useStore((s) => s.cars);
  const show = useUI((s) => s.introDone);

  const slides = useMemo(() => {
    const f = allCars.filter((c) => c.featured && c.status !== "sold").slice(0, 5);
    return f.length ? f : allCars.slice(0, 5);
  }, [allCars]);

  const [index, setIndex] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const progress = useMotionValue(0);
  const i = slides.length ? index % slides.length : 0;
  const car = slides[i];

  const go = (n: number) => {
    if (!slides.length) return;
    const next = (n + slides.length) % slides.length;
    if (next === i) return;
    setPrev(i);
    setIndex(next);
    progress.set(0);
  };

  useAnimationFrame((_, delta) => {
    if (!show || paused || offstage || slides.length < 2) return;
    const p = progress.get() + delta / SLIDE_MS;
    if (p >= 1) go(i + 1);
    else progress.set(p);
  });

  // Pointer parallax (desktop)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });
  const imgX = useTransform(sx, (v) => v * -24);
  const imgY = useTransform(sy, (v) => v * -14);
  const txtX = useTransform(sx, (v) => v * 12);

  // Scroll: the pinned stage recedes under the next section
  // (window-based: the section is sticky, so measure against viewport height)
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(800);
  useEffect(() => {
    const r = () => setVh(window.innerHeight);
    r();
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  const scrollYProgress = useTransform(scrollY, (y) => Math.min(1, Math.max(0, y / vh)));
  const [offstage, setOffstage] = useState(false);
  useEffect(() => scrollYProgress.on("change", (v) => setOffstage(v >= 1)), [scrollYProgress]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const radius = useTransform(scrollYProgress, [0, 0.35], [0, 40]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.65]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const bar = useTransform(progress, (p) => `${p * 100}%`);

  if (!car) return null;

  return (
    <section
      className="sticky top-0 z-0 h-[calc(100svh-var(--ann-h,0px))] min-h-[620px] overflow-hidden bg-ink"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      <motion.div style={{ scale, borderRadius: radius }} className="relative h-full w-full origin-top overflow-hidden bg-ink">
        {/* ── Imagery ── */}
        <motion.div style={{ x: imgX, y: imgY }} className="absolute -inset-8">
          {prev !== null && slides[prev] && (
            <img src={slides[prev].images[0]} alt="" className="absolute inset-0 h-full w-full scale-[1.04] object-cover" />
          )}
          <motion.div
            key={car.id}
            className="absolute inset-0"
            initial={prev === null ? false : { clipPath: "inset(0 0 0 100%)" }}
            animate={{ clipPath: "inset(0 0 0 0%)" }}
            transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => setPrev(null)}
          >
            <motion.img
              src={car.images[0]}
              alt={`${car.brand} ${car.model}`}
              className="absolute inset-0 h-full w-full object-cover"
              initial={{ scale: 1.22 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: SLIDE_MS / 1000 + 1.5, ease: "easeOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Shading */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-black/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/45" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(70%_60%_at_60%_45%,black,transparent)]" />
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />

        {/* ── Content ── */}
        <motion.div
          style={{ y: contentY }}
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="container-x relative flex h-full flex-col pb-[6.5rem] pt-[5.5rem] md:pb-6 md:pt-28"
        >
          {/* Top row */}
          <div className="flex items-start justify-between gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: EASE, delay: 0.3 }}
              className="max-w-md"
            >
              <p className="eyebrow flex items-center gap-2.5 text-white/60">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative size-2 rounded-full bg-accent" />
                </span>
                {hero.eyebrow}
              </p>
              <p className="mt-4 text-[26px] font-bold leading-[1] tracking-[-0.035em] text-white [font-stretch:115%] md:text-[40px]">
                {hero.titleLine1} <span className="em-light">{hero.titleLine2}</span>
              </p>
              <p className="mt-4 hidden max-w-sm text-[14px] leading-relaxed text-white/55 [@media(min-width:1024px)_and_(min-height:860px)]:block">{hero.subtitle}</p>
            </motion.div>

            <div className="hidden text-right md:block">
              <p className="display flex justify-end overflow-hidden text-[64px] leading-none text-white">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={i}
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.6, ease: EASE }}
                    className="inline-block"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
                <span className="em-light text-white/35">/{String(slides.length).padStart(2, "0")}</span>
              </p>
              <p className="eyebrow mt-2 text-white/45">On the floor today</p>
            </div>
          </div>

          {/* Model + gauge */}
          <motion.div style={{ x: txtX }} className="mt-auto flex items-end justify-between gap-8">
            <ModelName car={car} />
            <div className="hidden shrink-0 lg:block">
              <Gauge hp={num(car.power)} />
            </div>
          </motion.div>

          {/* Spec read-out + actions */}
          <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 backdrop-blur-md md:mt-8 md:grid-cols-[repeat(4,1fr)_auto]">
            {[
              { k: "0–100 km/h", v: <><Tween value={num(car.acceleration)} format={(v) => v.toFixed(1)} /><small className="ml-1 text-[0.5em] font-semibold text-white/50">s</small></> },
              { k: "Top speed", v: <><Tween value={num(car.topSpeed)} /><small className="ml-1 text-[0.5em] font-semibold text-white/50">km/h</small></> },
              { k: "Torque", hideSm: true, v: <><Tween value={num(car.torque)} /><small className="ml-1 text-[0.5em] font-semibold text-white/50">Nm</small></> },
              { k: "Price", v: <Tween value={car.price} format={(v) => formatPrice(v)} /> },
            ].map((s) => (
              <div key={s.k} className={cn("bg-black/40 px-3 py-3 md:px-6 md:py-5", "hideSm" in s && "hidden md:block")}>
                <p className="eyebrow text-white/45">{s.k}</p>
                <p className="mt-1 whitespace-nowrap text-[17px] font-bold tracking-[-0.03em] text-white [font-stretch:112%] md:text-[30px]">{s.v}</p>
              </div>
            ))}
            <div className="col-span-3 flex items-center gap-2 bg-black/40 p-2.5 md:col-span-1 md:px-5">
              <Link
                href={`/inventory/${car.slug}`}
                className="group flex h-12 flex-1 items-center justify-between gap-3 rounded-full bg-accent pl-5 pr-1.5 text-[14px] font-semibold text-accent-ink md:flex-none"
              >
                Explore
                <span className="grid size-9 place-items-center rounded-full bg-black/15 transition-transform duration-500 group-hover:rotate-45">
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
              <Link
                href={`/book-test-drive?car=${car.slug}`}
                className="flex h-12 flex-1 items-center justify-center whitespace-nowrap rounded-full border border-white/25 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-white hover:text-ink md:flex-none"
              >
                {hero.ctaSecondary}
              </Link>
            </div>
          </div>

          {/* Filmstrip selector */}
          <div
            className="no-scrollbar -mx-5 mt-2.5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:mt-3 md:px-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {slides.map((c, k) => {
              const on = k === i;
              return (
                <button
                  key={c.id}
                  onClick={() => go(k)}
                  className={cn(
                    "group relative flex min-w-[150px] flex-1 items-center gap-3 overflow-hidden rounded-xl p-1.5 pr-3 text-left transition-colors duration-500",
                    on ? "bg-white/15" : "bg-white/[0.05] hover:bg-white/10"
                  )}
                >
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={c.images[0]}
                      alt=""
                      className={cn("h-full w-full object-cover transition-all duration-700", on ? "scale-100" : "scale-110 grayscale group-hover:grayscale-0")}
                    />
                  </span>
                  <span className="min-w-0">
                    <span className={cn("block truncate text-[13px] font-semibold", on ? "text-white" : "text-white/55")}>{c.model}</span>
                    <span className="block truncate text-[11px] text-white/40">{c.brand}</span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
                    {on && <motion.span style={{ width: bar }} className="absolute inset-y-0 left-0 bg-accent" />}
                  </span>
                </button>
              );
            })}
            <Link
              href="/inventory"
              className="hidden min-w-[140px] items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 text-[13px] font-semibold text-white/70 transition-colors hover:border-white/50 hover:text-white md:flex"
            >
              All cars <ArrowRight className="size-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
