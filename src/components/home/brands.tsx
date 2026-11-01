"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { useStore } from "@/lib/store";

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** Velocity-aware marquee: speeds up and skews with scroll, reverses direction. */
function VelocityRow({ items, base = 3 }: { items: string[]; base?: number }) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [0, 1000], [0, 4], { clamp: false });
  const skew = useTransform(vel, [-2000, 2000], [8, -8]);
  const dir = useRef(1);
  const xp = useTransform(x, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    let move = dir.current * base * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * move * Math.abs(f);
    x.set(x.get() - move);
  });

  const row = [...items, ...items];
  return (
    <div className="flex overflow-hidden whitespace-nowrap">
      <motion.div style={{ x: xp, skewX: skew }} className="flex shrink-0 items-center">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((b, i) => (
              <span key={`${k}-${i}`} className="flex items-center">
                <span
                  className={
                    i % 2
                      ? "em-light px-6 text-[13vw] leading-none text-ink/85 md:px-10 md:text-[7vw]"
                      : "display px-6 text-[13vw] leading-none md:px-10 md:text-[7vw]"
                  }
                >
                  {b}
                </span>
                <svg viewBox="0 0 24 24" className="size-[5vw] shrink-0 text-accent md:size-[2.6vw]">
                  <path fill="currentColor" d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function Brands() {
  const brands = useStore((s) => s.settings.brands);
  return (
    <section className="relative overflow-hidden border-y border-line py-10 md:py-16">
      <p className="eyebrow container-x mb-8 text-muted">Authorised & certified marques</p>
      <VelocityRow items={brands} />
    </section>
  );
}
