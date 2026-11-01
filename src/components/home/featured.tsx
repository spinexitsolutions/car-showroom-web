"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import type { Car } from "@/lib/types";
import { SplitText } from "@/components/ui/motion";

function Panel({ car, i, total }: { car: Car; i: number; total: number }) {
  return (
    <Link
      href={`/inventory/${car.slug}`}
      data-cursor="Explore"
      className="group relative block h-[62svh] w-[82vw] shrink-0 overflow-hidden rounded-[2rem] bg-ink text-white sm:w-[60vw] md:h-[70vh] md:w-[46vw]"
    >
      <img
        src={car.images[0]}
        alt={`${car.brand} ${car.model}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-6">
        <span className="eyebrow rounded-full bg-white/15 px-3 py-1.5 backdrop-blur-md">
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="grid size-11 place-items-center rounded-full bg-white text-ink transition-transform duration-500 ease-out-expo group-hover:rotate-45">
          <ArrowUpRight className="size-5" />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="eyebrow text-white/60">{car.brand} · {car.year}</p>
        <h3 className="display mt-2 truncate text-5xl md:text-7xl">{car.model}</h3>
        <p className="serif-i truncate text-2xl text-white/80 md:text-4xl">{car.variant}</p>
        <p className="mt-2 text-white/60">{car.tagline}</p>
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-5 text-[13px]">
          <div>
            <p className="text-white/50">Power</p>
            <p className="mt-1 text-lg font-semibold">{car.power}</p>
          </div>
          <div>
            <p className="text-white/50">0–100</p>
            <p className="mt-1 text-lg font-semibold">{car.acceleration}</p>
          </div>
          <div>
            <p className="text-white/50">Price</p>
            <p className="mt-1 text-lg font-semibold">{formatPrice(car.price)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/**
 * Pinned horizontal gallery: vertical scroll drives a horizontal track.
 * Works with touch too because it's still native vertical scrolling.
 */
export function Featured() {
  const all = useStore((s) => s.cars);
  const cars = useMemo(() => all.filter((c) => c.featured && c.status !== "sold"), [all]);
  const total = useStore((s) => s.cars.length);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  const panels = cars.length + 2;
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setDist(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [cars.length]);
  const x = useTransform(smooth, [0, 1], [0, -dist]);
  const bar = useTransform(smooth, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative" style={{ height: `${Math.max(3, panels) * 70}vh` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="flex w-max items-center gap-4 pl-5 md:gap-6 md:pl-10">
          {/* Intro panel */}
          <div className="flex h-[62svh] w-[82vw] shrink-0 flex-col justify-between sm:w-[60vw] md:h-[70vh] md:w-[38vw] md:pr-10">
            <p className="eyebrow flex items-center gap-3 text-muted">
              <span className="text-ink">01</span>
              <span className="h-px w-8 bg-current opacity-40" /> The collection
            </p>
            <div>
              <h2 className="display text-[15vw] md:text-[7vw] xl:text-[112px]">
                <SplitText text="Hand-picked" /> <SplitText text="this month." wordClassName="serif-i" delay={0.15} />
              </h2>
              <p className="mt-6 max-w-sm text-[16px] leading-relaxed text-muted">
                Every car below has been personally driven, inspected and approved by our specialists. Keep scrolling →
              </p>
            </div>
            <div className="h-px w-full bg-line">
              <motion.div style={{ width: bar }} className="h-px bg-ink" />
            </div>
          </div>

          {cars.map((c, i) => (
            <Panel key={c.id} car={c} i={i} total={cars.length} />
          ))}

          {/* Outro panel */}
          <Link
            href="/inventory"
            data-cursor="All cars"
            className="group grid h-[62svh] w-[70vw] shrink-0 place-items-center rounded-[2rem] border border-line sm:w-[40vw] md:h-[70vh] md:w-[28vw]"
          >
            <div className="text-center">
              <span className="mx-auto grid size-24 place-items-center rounded-full bg-accent text-white transition-transform duration-700 ease-out-expo group-hover:scale-110 group-hover:rotate-45">
                <ArrowUpRight className="size-8" />
              </span>
              <p className="display mt-8 text-4xl">
                View all <span className="serif-i">{total}</span>
              </p>
              <p className="mt-2 text-muted">cars in the collection</p>
            </div>
          </Link>
          <div className="w-5 shrink-0 md:w-10" />
        </motion.div>
      </div>
    </section>
  );
}
