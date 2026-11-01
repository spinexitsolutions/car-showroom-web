"use client";

import { Star, ShieldCheck, Home, Repeat, Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { u } from "@/lib/seed";
import { Counter, ParallaxImage, Reveal } from "@/components/ui/motion";
import { SectionHeading } from "@/components/ui/section-heading";

/** Dark bento grid: why buy from us, with live counters. */
export function Stats() {
  const stats = useStore((s) => s.settings.stats);
  const t = useStore((s) => s.testimonials);
  return (
    <section className="grain relative mx-2 overflow-hidden rounded-[2rem] bg-ink py-24 text-white md:mx-4 md:rounded-[3rem] md:py-36">
      <div className="container-x relative">
        <SectionHeading
          dark
          index="04"
          eyebrow="Why Orbis"
          title="Buying a car,"
          italic="reimagined."
          description="No haggling, no hidden fees, no pressure. Just a calm, transparent experience — from first look to first service."
        />

        <div className="mt-14 grid auto-rows-[minmax(180px,auto)] grid-cols-2 gap-3 md:mt-20 md:grid-cols-4 md:gap-4">
          <Reveal className="col-span-2 row-span-2 overflow-hidden rounded-[2rem]">
            <div className="relative h-full min-h-[380px]">
              <ParallaxImage src={u("1583121274602-3e2820c69888", 1600)} alt="Showroom" className="h-full min-h-[380px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-6xl font-semibold tracking-tight md:text-7xl">
                  <Counter value={stats[0]?.value ?? 0} suffix={stats[0]?.suffix} />
                </p>
                <p className="mt-1 text-white/60">{stats[0]?.label} across India</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05} className="rounded-[2rem] bg-white/[0.06] p-6 ring-1 ring-white/10">
            <ShieldCheck className="size-6 text-accent" />
            <p className="mt-8 text-4xl font-semibold tracking-tight">190</p>
            <p className="mt-1 text-[14px] text-white/55">point inspection on every certified car</p>
          </Reveal>

          <Reveal delay={0.1} className="rounded-[2rem] bg-accent p-6">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-white" />
              ))}
            </div>
            <p className="mt-8 text-4xl font-semibold tracking-tight">
              <Counter value={stats[2]?.value ?? 4.9} decimals={1} />
            </p>
            <p className="mt-1 text-[14px] text-white/80">from {t.length * 312}+ verified owners</p>
          </Reveal>

          <Reveal delay={0.15} className="col-span-2 flex flex-col justify-between rounded-[2rem] bg-white p-6 text-ink md:col-span-1">
            <Home className="size-6" />
            <div>
              <p className="mt-6 text-xl font-semibold tracking-tight">Test drives at your doorstep</p>
              <p className="mt-1 text-[14px] text-muted">We bring the car to you — home or office.</p>
            </div>
          </Reveal>

          <Reveal delay={0.2} className="rounded-[2rem] bg-white/[0.06] p-6 ring-1 ring-white/10">
            <Repeat className="size-6 text-accent" />
            <p className="mt-8 text-xl font-semibold tracking-tight">Instant trade-in</p>
            <p className="mt-1 text-[14px] text-white/55">Valuation in 30 minutes</p>
          </Reveal>

          <Reveal delay={0.25} className="col-span-2 flex items-center justify-between gap-6 rounded-[2rem] bg-white/[0.06] p-6 ring-1 ring-white/10 md:col-span-2">
            <div>
              <Sparkles className="size-6 text-accent" />
              <p className="mt-6 text-xl font-semibold tracking-tight">
                <Counter value={stats[3]?.value ?? 14} /> years · <Counter value={stats[1]?.value ?? 24} /> marques
              </p>
              <p className="mt-1 text-[14px] text-white/55">One standard of care, whatever you drive.</p>
            </div>
            <div className="relative hidden size-28 shrink-0 sm:block">
              <svg viewBox="0 0 100 100" className="absolute inset-0 animate-spin-slow">
                <defs>
                  <path id="circ" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text className="fill-white/60 font-mono text-[9px] uppercase tracking-[0.3em]">
                  <textPath href="#circ">Certified · Trusted · Since 2012 ·</textPath>
                </text>
              </svg>
              <span className="absolute inset-0 m-auto size-3 rounded-full bg-accent" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
