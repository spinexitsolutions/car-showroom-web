"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { u } from "@/lib/seed";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn, EASE } from "@/lib/utils";

const CATS = [
  { key: "SUV", q: "body=SUV", label: "SUV", line: "Command every road", img: u("1520031441872-265e4ff70366", 1400) },
  { key: "Sedan", q: "body=Sedan", label: "Sedan", line: "Executive calm", img: u("1601362840469-51e4d8d58785", 1400) },
  { key: "Coupe", q: "body=Coupe", label: "Coupé", line: "Two doors, no compromise", img: u("1617531653332-bd46c24f2068", 1400) },
  { key: "Supercar", q: "body=Supercar", label: "Supercar", line: "Pure theatre", img: u("1592198084033-aade902d1aae", 1400) },
  { key: "Electric", q: "fuel=Electric", label: "Electric", line: "Silent velocity", img: u("1620891549027-942fdc95d3f5", 1400) },
];

/** Expanding accordion panels (horizontal on desktop, vertical on mobile). */
export function Categories() {
  const cars = useStore((s) => s.cars);
  const [active, setActive] = useState(0);
  const count = (k: string) =>
    cars.filter((c) => (k === "Electric" ? c.fuel === "Electric" : c.bodyType === k) && c.status !== "sold").length;

  return (
    <section className="container-x py-20 md:py-32">
      <SectionHeading
        index="03"
        eyebrow="Browse by category"
        title="Find your"
        italic="kind of drive."
        description="From silent electric saloons to screaming V10s — pick a mood, we'll handle the rest."
      />
      <div className="mt-12 flex h-[640px] flex-col gap-2.5 md:mt-16 md:h-[560px] md:flex-row md:gap-3">
        {CATS.map((c, i) => {
          const on = active === i;
          return (
            <motion.div
              key={c.key}
              layout
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              transition={{ layout: { duration: 0.7, ease: EASE } }}
              className={cn(
                "relative cursor-pointer overflow-hidden rounded-[1.75rem] bg-ink text-white",
                on ? "flex-[5]" : "flex-[1]"
              )}
            >
              <motion.img
                src={c.img}
                alt={c.label}
                loading="lazy"
                animate={{ scale: on ? 1 : 1.25, opacity: on ? 1 : 0.55 }}
                transition={{ duration: 1, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              {/* collapsed label */}
              <AnimatePresence>
                {!on && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center px-6 md:items-end md:justify-center md:px-0 md:pb-8"
                  >
                    <span className="display text-xl md:rotate-180 md:text-2xl md:[writing-mode:vertical-rl]">{c.label}</span>
                  </motion.span>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {on && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
                    className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 md:p-8"
                  >
                    <div>
                      <p className="eyebrow text-white/60">{count(c.key)} available</p>
                      <h3 className="display mt-2 text-5xl md:text-7xl">{c.label}</h3>
                      <p className="em-light mt-1 text-xl text-white/75 md:text-2xl">{c.line}</p>
                    </div>
                    <Link
                      href={`/inventory?${c.q}`}
                      data-cursor="Browse"
                      className="grid size-14 shrink-0 place-items-center rounded-full bg-white text-ink transition-transform duration-500 hover:rotate-45"
                      aria-label={`Browse ${c.label}`}
                    >
                      <ArrowUpRight className="size-5" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
