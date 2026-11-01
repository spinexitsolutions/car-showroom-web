"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, Trophy } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import type { Car } from "@/lib/types";
import { PageHeader } from "@/components/site/page-header";
import { Button } from "@/components/ui/button";
import { cn, EASE, formatNumber, formatPrice } from "@/lib/utils";

const num = (s?: string) => {
  if (!s) return NaN;
  const m = s.replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : NaN;
};

type Row = {
  label: string;
  get: (c: Car) => string;
  score?: (c: Car) => number; // higher is better
};

const ROWS: Row[] = [
  { label: "Price", get: (c) => formatPrice(c.price), score: (c) => -c.price },
  { label: "Power", get: (c) => c.power, score: (c) => num(c.power) },
  { label: "Torque", get: (c) => c.torque, score: (c) => num(c.torque) },
  { label: "0–100 km/h", get: (c) => c.acceleration, score: (c) => -num(c.acceleration) },
  { label: "Top speed", get: (c) => c.topSpeed, score: (c) => num(c.topSpeed) },
  { label: "Engine", get: (c) => c.engine },
  { label: "Range / efficiency", get: (c) => c.range ?? "—" },
  { label: "Fuel", get: (c) => c.fuel },
  { label: "Transmission", get: (c) => c.transmission },
  { label: "Body type", get: (c) => c.bodyType },
  { label: "Seats", get: (c) => String(c.seats), score: (c) => c.seats },
  { label: "Year", get: (c) => String(c.year), score: (c) => c.year },
  { label: "Odometer", get: (c) => `${formatNumber(c.kmDriven)} km`, score: (c) => -c.kmDriven },
  { label: "Condition", get: (c) => c.condition },
  { label: "Features", get: (c) => `${c.features.length} listed`, score: (c) => c.features.length },
];

export default function ComparePage() {
  const hydrated = useHydrated();
  const cars = useStore((s) => s.cars);
  const compare = useStore((s) => s.compare);
  const toggle = useStore((s) => s.toggleCompare);
  const [picker, setPicker] = useState(false);
  const selected = compare.map((id) => cars.find((c) => c.id === id)).filter((c): c is Car => !!c);
  const slots = Math.max(selected.length + (selected.length < 3 ? 1 : 0), 2);
  const cols = `160px repeat(${slots}, minmax(220px, 1fr))`;

  const best = (row: Row) => {
    if (!row.score || selected.length < 2) return null;
    const scores = selected.map((c) => row.score!(c));
    if (scores.some((s) => Number.isNaN(s))) return null;
    const max = Math.max(...scores);
    if (scores.every((s) => s === max)) return null;
    return selected[scores.indexOf(max)].id;
  };

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title="Side by"
        italic="side."
        description="Line up to three cars and let the numbers do the talking. Winning values are highlighted."
      />
      <section className="container-x pb-32">
        {!hydrated ? (
          <div className="skeleton h-96 rounded-[2rem]" />
        ) : (
          <div data-lenis-prevent className="-mx-5 overflow-x-auto px-5 pb-6 no-scrollbar md:mx-0 md:px-0">
            <div className="min-w-fit">
              {/* Head */}
              <div className="grid gap-4" style={{ gridTemplateColumns: cols }}>
                <div className="flex items-end pb-4">
                  <p className="eyebrow text-muted">{selected.length} / 3 selected</p>
                </div>
                <AnimatePresence mode="popLayout">
                  {selected.map((c) => (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="relative"
                    >
                      <Link href={`/inventory/${c.slug}`} className="block overflow-hidden rounded-[1.5rem]">
                        <img src={c.images[0]} alt="" className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105" />
                      </Link>
                      <button
                        onClick={() => toggle(c.id)}
                        aria-label="Remove"
                        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 backdrop-blur"
                      >
                        <X className="size-4" />
                      </button>
                      <p className="eyebrow mt-4 text-muted">{c.brand}</p>
                      <p className="mt-1 text-xl font-semibold tracking-tight">
                        {c.model} <span className="serif-i font-normal text-muted">{c.variant}</span>
                      </p>
                    </motion.div>
                  ))}
                  {selected.length < 3 && (
                    <motion.button
                      layout
                      key="add"
                      onClick={() => setPicker(true)}
                      className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed border-line text-muted transition-colors hover:border-ink/40 hover:text-ink"
                    >
                      <span className="grid size-12 place-items-center rounded-full bg-white">
                        <Plus className="size-5" />
                      </span>
                      <span className="text-[14px] font-medium">Add a car</span>
                    </motion.button>
                  )}
                  {selected.length === 0 && <div key="ghost" className="aspect-[4/3] rounded-[1.5rem] bg-paper-2/60" />}
                </AnimatePresence>
              </div>

              {/* Rows */}
              {selected.length > 0 && (
                <div className="mt-10">
                  {ROWS.map((row, ri) => {
                    const winner = best(row);
                    return (
                      <motion.div
                        key={row.label}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: ri * 0.02 }}
                        className="grid gap-4 border-t border-line py-4"
                        style={{ gridTemplateColumns: cols }}
                      >
                        <p className="eyebrow self-center text-muted">{row.label}</p>
                        {selected.map((c) => (
                          <p
                            key={c.id}
                            className={cn(
                              "flex items-center gap-2 text-[15px] font-medium transition-colors",
                              winner === c.id && "text-accent"
                            )}
                          >
                            {row.get(c)}
                            {winner === c.id && <Trophy className="size-3.5" />}
                          </p>
                        ))}
                        {Array.from({ length: slots - selected.length }).map((_, i) => (
                          <span key={i} />
                        ))}
                      </motion.div>
                    );
                  })}
                  <div className="grid gap-4 border-t border-line pt-6" style={{ gridTemplateColumns: cols }}>
                    <span />
                    {selected.map((c) => (
                      <Button key={c.id} href={`/book-test-drive?car=${c.slug}`} size="sm">
                        Test drive
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {selected.length === 0 && (
                <p className="mt-10 max-w-md text-muted">
                  Tap the compare icon on any car in the{" "}
                  <Link href="/inventory" className="link-u text-ink">
                    collection
                  </Link>{" "}
                  or add one here to get started.
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Picker */}
      <AnimatePresence>
        {picker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPicker(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <div className="pointer-events-none fixed inset-0 z-[61] flex items-end justify-center md:items-center md:p-6">
            <motion.div
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.6 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="pointer-events-auto max-h-[80dvh] w-full max-w-3xl rounded-t-[2rem] bg-paper md:rounded-[2rem]"
            >
              <div className="flex items-center justify-between p-5">
                <p className="text-lg font-semibold">Add to comparison</p>
                <button onClick={() => setPicker(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-white">
                  <X className="size-4" />
                </button>
              </div>
              <div data-lenis-prevent className="grid max-h-[62dvh] gap-3 overflow-y-auto px-5 pb-6 sm:grid-cols-2">
                {cars
                  .filter((c) => !compare.includes(c.id))
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        toggle(c.id);
                        setPicker(false);
                      }}
                      className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-4 text-left transition hover:ring-2 hover:ring-ink/10"
                    >
                      <img src={c.images[0]} alt="" className="aspect-[4/3] w-20 rounded-xl object-cover" />
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold">
                          {c.brand} {c.model}
                        </span>
                        <span className="block text-[13px] text-muted">{formatPrice(c.price)}</span>
                      </span>
                    </button>
                  ))}
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
