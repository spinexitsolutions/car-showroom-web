"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn, EASE } from "@/lib/utils";

/** Large quote that crossfades word-by-word; auto-advances; swipe on mobile. */
export function Testimonials() {
  const list = useStore((s) => s.testimonials);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = list.length;

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setTimeout(() => setI((v) => (v + 1) % n), 7000);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  if (!n) return null;
  const t = list[i % n];
  const go = (d: number) => setI((v) => (v + d + n) % n);

  return (
    <section
      className="container-x py-24 md:py-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <SectionHeading index="07" eyebrow="Owner stories" title="Words from" italic="the driver's seat." />

      <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-[1fr_2.2fr] md:gap-16">
        <div className="order-2 flex flex-col justify-between gap-8 md:order-1">
          <ul className="flex gap-3 md:flex-col md:gap-2">
            {list.map((x, k) => (
              <li key={x.id}>
                <button
                  onClick={() => setI(k)}
                  className={cn(
                    "flex items-center gap-3 rounded-full p-1 pr-4 text-left transition-all duration-500 md:w-full",
                    k === i ? "bg-white shadow-sm ring-1 ring-black/5" : "opacity-50 hover:opacity-100"
                  )}
                >
                  <img src={x.avatar} alt={x.name} className="size-11 rounded-full object-cover" />
                  <span className="hidden md:block">
                    <span className="block text-[14px] font-semibold">{x.name}</span>
                    <span className="block text-[12px] text-muted">{x.car}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button onClick={() => go(-1)} aria-label="Previous" className="grid size-12 place-items-center rounded-full border border-line hover:bg-white">
              <ArrowLeft className="size-4" />
            </button>
            <button onClick={() => go(1)} aria-label="Next" className="grid size-12 place-items-center rounded-full bg-ink text-white">
              <ArrowRight className="size-4" />
            </button>
            <div className="ml-3 h-px flex-1 bg-line">
              <motion.div
                key={`${i}-${paused}`}
                className="h-px bg-ink"
                initial={{ width: "0%" }}
                animate={{ width: paused ? "0%" : "100%" }}
                transition={{ duration: paused ? 0 : 7, ease: "linear" }}
              />
            </div>
          </div>
        </div>

        <motion.div
          className="order-1 min-h-[300px] md:order-2"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            if (info.offset.x > 60) go(-1);
          }}
          data-cursor="Drag"
        >
          <AnimatePresence mode="wait">
            <motion.figure key={t.id} initial="hidden" animate="show" exit="exit">
              <div className="flex gap-1 text-accent">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-6 text-[28px] font-medium leading-[1.15] tracking-[-0.03em] md:text-[44px]">
                {t.quote.split(" ").map((w, k) => (
                  <motion.span
                    key={k}
                    className="inline-block"
                    variants={{
                      hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
                      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE, delay: k * 0.018 } },
                      exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
                    }}
                  >
                    {k === 0 ? "“" : ""}
                    {w}
                    {k === t.quote.split(" ").length - 1 ? "”" : ""}&nbsp;
                  </motion.span>
                ))}
              </blockquote>
              <motion.figcaption
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.5 } }, exit: { opacity: 0 } }}
                className="mt-8 flex items-center gap-4"
              >
                <span className="h-px w-10 bg-ink" />
                <span>
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-muted"> — {t.role} · </span>
                  <span className="serif-i text-lg">{t.car}</span>
                </span>
              </motion.figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
