"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Home, Coffee, Route, ShieldCheck } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { PageHeader } from "@/components/site/page-header";
import { LeadForm } from "@/components/site/lead-form";
import { Reveal } from "@/components/ui/motion";
import { cn, EASE, formatPrice } from "@/lib/utils";

const PERKS = [
  { icon: Home, title: "At your doorstep", text: "We bring the car to your home or office — free within city limits." },
  { icon: Route, title: "45 minutes, your route", text: "Highway, city, your daily commute. No rushed laps around the block." },
  { icon: Coffee, title: "Showroom lounge", text: "Prefer to visit? Espresso and a quiet bay are waiting." },
  { icon: ShieldCheck, title: "Fully insured", text: "Every test drive is covered. Just bring your licence." },
];

export function BookTestDrive() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const all = useStore((s) => s.cars);
  const cars = useMemo(() => all.filter((c) => c.status !== "sold"), [all]);
  const initial = params.get("car");
  const [picked, setPicked] = useState<string | null>(null);
  const selectedId = picked ?? cars.find((c) => c.slug === initial)?.id ?? null;
  const selected = cars.find((c) => c.id === selectedId);

  return (
    <>
      <PageHeader
        eyebrow="Test drive"
        title="Feel it"
        italic="before you sign."
        description="Pick a car, choose a slot, and we'll handle the rest. Confirmation on WhatsApp in minutes."
      />

      <section className="container-x pb-32">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow mb-5 text-muted">01 · Choose your car</p>
            {!hydrated ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton aspect-[4/3] rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {cars.map((c, i) => {
                  const active = c.id === selectedId;
                  return (
                    <motion.button
                      key={c.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: Math.min(i, 9) * 0.04 }}
                      onClick={() => setPicked(c.id)}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl bg-white text-left transition-shadow",
                        active ? "ring-2 ring-accent" : "ring-1 ring-line hover:ring-ink/20"
                      )}
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={c.images[0]} alt="" loading="lazy" className={cn("h-full w-full object-cover transition-transform duration-700", active ? "scale-105" : "group-hover:scale-105")} />
                      </div>
                      <div className="p-3">
                        <p className="truncate text-[14px] font-semibold tracking-tight">
                          {c.brand} {c.model}
                        </p>
                        <p className="text-[12px] text-muted">{formatPrice(c.price)}</p>
                      </div>
                      <AnimatePresence>
                        {active && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-accent text-accent-ink"
                          >
                            <Check className="size-4" strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="lg:sticky lg:top-28">
              <p className="eyebrow mb-5 text-muted">02 · Your details</p>
              <div className="rounded-[2rem] bg-white p-6 md:p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selected?.id ?? "none"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 flex items-center gap-4 rounded-2xl bg-paper p-3"
                  >
                    {selected ? (
                      <>
                        <img src={selected.images[0]} alt="" className="aspect-[4/3] w-20 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <p className="eyebrow text-muted">Selected</p>
                          <p className="truncate text-[16px] font-semibold tracking-tight">
                            {selected.brand} {selected.model} <span className="em-light font-normal text-muted">{selected.variant}</span>
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="px-2 py-4 text-[14px] text-muted">Select a car — or leave it open and we&apos;ll suggest a few.</p>
                    )}
                  </motion.div>
                </AnimatePresence>
                <LeadForm
                  type="test-drive"
                  carId={selected?.id}
                  source="Website · Book test drive"
                  withSchedule
                  withMessage={false}
                  submitLabel="Confirm test drive"
                  extra={[{ name: "location", label: "Where?", type: "select", options: ["At the showroom", "At my home / office"] }]}
                  successTitle="You're booked in"
                  successText="We'll confirm your slot on WhatsApp shortly. See you behind the wheel."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.07}>
              <div className="h-full rounded-[1.75rem] border border-line p-6">
                <p.icon className="size-6 text-accent" />
                <h3 className="mt-8 text-lg font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-1.5 text-[14px] text-muted">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
