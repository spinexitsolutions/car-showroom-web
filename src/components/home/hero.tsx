"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { Button } from "@/components/ui/button";
import { EASE } from "@/lib/utils";

function Line({ text, serif, delay, show }: { text: string; serif?: boolean; delay: number; show: boolean }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span
        className={serif ? "serif-i block" : "block"}
        initial={{ y: "105%" }}
        animate={show ? { y: "0%" } : { y: "105%" }}
        transition={{ duration: 1.2, ease: EASE, delay }}
      >
        {text}
      </motion.span>
    </span>
  );
}

function useInset(p: MotionValue<number>, top: number, mobile: boolean) {
  const side = mobile ? 4 : 2.5;
  return useTransform(p, (v) => {
    const t = Math.min(1, v / 0.55);
    const e = 1 - Math.pow(1 - t, 3);
    const k = 1 - e;
    return `inset(${(top * k).toFixed(2)}% ${(side * k).toFixed(2)}% ${(3 * k).toFixed(2)}% ${(side * k).toFixed(2)}% round ${Math.round((mobile ? 28 : 36) * k)}px)`;
  });
}

/**
 * Hero: the headline sits above a rounded "window" onto the car. As you
 * scroll, the window expands to full-bleed (clip-path), the headline lifts
 * away and a second statement + live stats fade in over the image.
 */
export function Hero() {
  const hero = useStore((s) => s.settings.hero);
  const stats = useStore((s) => s.settings.stats);
  const count = useStore((s) => s.cars.filter((c) => c.status !== "sold").length);
  const show = useUI((s) => s.introDone);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // The image window starts right below the headline block (measured).
  const headRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(55);
  useEffect(() => {
    const measure = () => {
      const el = headRef.current;
      if (!el) return;
      const bottom = el.offsetTop + el.offsetHeight + 20;
      setTop(Math.min(72, Math.max(38, (bottom / window.innerHeight) * 100)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headRef.current) ro.observe(headRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);
  const clipD = useInset(p, top, false);
  const clipM = useInset(p, top, true);
  const imgScale = useTransform(p, [0, 0.6], [1.35, 1]);
  const headY = useTransform(p, [0, 0.4], ["0%", "-40%"]);
  const headO = useTransform(p, [0, 0.3], [1, 0]);
  const overO = useTransform(p, [0.5, 0.7], [0, 1]);
  const overY = useTransform(p, [0.5, 0.75], [60, 0]);
  const hintO = useTransform(p, [0, 0.08], [1, 0]);

  return (
    <section ref={ref} className="relative h-[210vh] md:h-[240vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Headline */}
        <motion.div ref={headRef} style={{ y: headY, opacity: headO }} className="container-x relative z-10 pt-24 md:pt-32">
          <div className="flex items-center justify-between">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
              className="eyebrow flex items-center gap-2.5 text-muted"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative size-2 rounded-full bg-accent" />
              </span>
              {hero.eyebrow}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 1 } : {}}
              transition={{ delay: 0.6 }}
              className="eyebrow hidden text-muted md:block"
            >
              {count} cars in stock · Updated today
            </motion.p>
          </div>
          <div className="mt-5 flex flex-col gap-6 md:mt-8 md:flex-row md:items-end md:justify-between">
            <h1 className="display text-[16.5vw] leading-[0.86] md:text-[min(10vw,15vh)] xl:text-[min(156px,15vh)]">
              <Line text={hero.titleLine1} delay={0.1} show={show} />
              <Line text={hero.titleLine2} serif delay={0.22} show={show} />
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: EASE, delay: 0.5 }}
              className="md:max-w-sm md:pb-4"
            >
              <p className="hidden text-[16px] leading-relaxed text-muted sm:block">{hero.subtitle}</p>
              <div className="flex flex-wrap gap-2.5 sm:mt-6">
                <Button href="/inventory" size="md">{hero.ctaPrimary}</Button>
                <Button href="/book-test-drive" variant="ghost" size="md" arrow={false}>
                  {hero.ctaSecondary}
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Expanding image window */}
        {[clipM, clipD].map((clip, i) => (
          <motion.div
            key={i}
            style={{ clipPath: clip }}
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.35 }}
            className={`absolute inset-0 bg-ink ${i === 0 ? "md:hidden" : "hidden md:block"}`}
            data-cursor="Scroll"
          >
            <motion.img
              src={hero.image}
              alt="Featured car"
              style={{ scale: imgScale }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          </motion.div>
        ))}

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintO }}
          className="absolute bottom-[calc(3%+20px)] left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex"
        >
          <span className="eyebrow !text-[10px]">Scroll to enter</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/20">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-white"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.div>

        {/* Statement over full-bleed image */}
        <motion.div
          style={{ opacity: overO, y: overY }}
          className="container-x pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-28 text-white md:pb-14"
        >
          <p className="display max-w-4xl text-[11vw] md:text-[6.5vw] xl:text-[96px]">
            Every car, <span className="serif-i">hand-picked.</span>
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/20 pt-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-semibold tracking-tight md:text-4xl">
                  {s.value.toLocaleString("en-IN")}
                  <span className="text-accent">{s.suffix}</span>
                </p>
                <p className="eyebrow mt-1 text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
