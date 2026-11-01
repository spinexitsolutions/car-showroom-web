"use client";

import { useEffect, useMemo, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Camera, ClipboardCheck, Banknote, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { LeadForm } from "@/components/site/lead-form";
import { Reveal, SplitText } from "@/components/ui/motion";
import { u } from "@/lib/seed";
import { cn, EASE, formatPrice } from "@/lib/utils";

const BRANDS: Record<string, number> = {
  "Maruti Suzuki": 900000,
  Hyundai: 1400000,
  Tata: 1300000,
  Mahindra: 1800000,
  Toyota: 2800000,
  Honda: 1500000,
  Kia: 1700000,
  Skoda: 2200000,
  Volkswagen: 2000000,
  Audi: 6500000,
  BMW: 7500000,
  "Mercedes-Benz": 8000000,
  Volvo: 6500000,
  "Land Rover": 12000000,
  Porsche: 18000000,
  Lexus: 9000000,
  Other: 2500000,
};
const CONDITIONS = [
  { id: "Excellent", mult: 1.06, note: "Like new, no scratches" },
  { id: "Good", mult: 1, note: "Minor wear, well kept" },
  { id: "Fair", mult: 0.88, note: "Visible wear or repairs" },
];
const YEAR_NOW = new Date().getFullYear();

function Money({ value }: { value: number }) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => formatPrice(v));
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.9, ease: EASE });
    return () => c.stop();
  }, [value, mv]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

const STEPS = [
  { icon: Camera, title: "Share details", text: "Tell us about your car — or snap a few photos on WhatsApp." },
  { icon: ClipboardCheck, title: "30-min inspection", text: "At your home or our showroom. We check 120 points, transparently." },
  { icon: Banknote, title: "Get paid same day", text: "Instant bank transfer, RC transfer and loan closure handled by us." },
];

export default function SellPage() {
  const [brand, setBrand] = useState("BMW");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(YEAR_NOW - 4);
  const [km, setKm] = useState(40000);
  const [cond, setCond] = useState("Good");

  const { low, high } = useMemo(() => {
    const base = BRANDS[brand] ?? BRANDS.Other;
    const age = Math.max(0, YEAR_NOW - year);
    const dep = Math.pow(0.86, age);
    const kmFactor = Math.max(0.6, 1 - Math.max(0, km - age * 12000) / 400000 - km / 1500000);
    const mult = CONDITIONS.find((c) => c.id === cond)?.mult ?? 1;
    const mid = base * dep * kmFactor * mult;
    return { low: mid * 0.94, high: mid * 1.06 };
  }, [brand, year, km, cond]);

  const kmPct = (km / 200000) * 100;
  const yearPct = ((year - (YEAR_NOW - 15)) / 15) * 100;

  return (
    <>
      <PageHeader
        eyebrow="Sell / Trade-in"
        title="Your car is worth"
        italic="more here."
        description="Instant indicative valuation, a no-pressure inspection and payment on the same day. Or trade it in towards your next car and save on taxes."
      />

      <section className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Estimator */}
          <Reveal>
            <div className="h-full rounded-[2.25rem] bg-white p-6 md:p-10">
              <p className="eyebrow flex items-center gap-2 text-muted">
                <Sparkles className="size-3.5 text-accent" /> Instant estimate
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="eyebrow mb-2 block text-muted">Brand</label>
                  <select value={brand} onChange={(e) => setBrand(e.target.value)} className="field">
                    {Object.keys(BRANDS).map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="eyebrow mb-2 block text-muted">Model</label>
                  <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. 530d" className="field" />
                </div>
              </div>
              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <span className="eyebrow text-muted">Year</span>
                  <span className="text-[17px] font-semibold tabular-nums">{year}</span>
                </div>
                <input type="range" className="range mt-4" min={YEAR_NOW - 15} max={YEAR_NOW} value={year} style={{ ["--p" as string]: `${yearPct}%` }} onChange={(e) => setYear(Number(e.target.value))} />
              </div>
              <div className="mt-8">
                <div className="flex items-baseline justify-between">
                  <span className="eyebrow text-muted">Kilometres driven</span>
                  <span className="text-[17px] font-semibold tabular-nums">{km.toLocaleString("en-IN")} km</span>
                </div>
                <input type="range" className="range mt-4" min={0} max={200000} step={1000} value={km} style={{ ["--p" as string]: `${kmPct}%` }} onChange={(e) => setKm(Number(e.target.value))} />
              </div>
              <div className="mt-8">
                <span className="eyebrow text-muted">Condition</span>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCond(c.id)}
                      className={cn(
                        "relative rounded-2xl border p-3 text-left transition-colors",
                        cond === c.id ? "border-ink" : "border-line hover:border-ink/30"
                      )}
                    >
                      {cond === c.id && <motion.span layoutId="cond" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                      <span className={cn("relative block text-[14px] font-semibold", cond === c.id && "text-white")}>{c.id}</span>
                      <span className={cn("relative mt-0.5 block text-[11px] leading-tight", cond === c.id ? "text-white/60" : "text-muted")}>{c.note}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Result */}
          <Reveal delay={0.1}>
            <div className="relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden rounded-[2.25rem] bg-ink p-6 text-white grain md:p-10">
              <img src={u("1617531653332-bd46c24f2068", 1200)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
              <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/60 to-ink" />
              <div className="relative">
                <p className="eyebrow text-white/50">Estimated value</p>
                <p className="mt-2 text-white/70">
                  {year} {brand} {model}
                </p>
              </div>
              <div className="relative">
                <p className="display text-[44px] leading-none md:text-6xl">
                  <Money value={low} />
                </p>
                <p className="em-light mt-1 text-3xl text-white/60">
                  to <Money value={high} />
                </p>
                <p className="mt-6 max-w-sm text-[13px] text-white/50">
                  Indicative range based on market data. Your final offer follows a free 30-minute inspection and is valid for 7 days.
                </p>
                <a href="#sell-form" className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-[14px] font-medium text-accent-ink">
                  Lock this estimate →
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Steps */}
      <section className="container-x mt-24">
        <h2 className="display text-[42px] md:text-7xl">
          <SplitText text="Sold in" /> <SplitText text="one afternoon." wordClassName="em-light" delay={0.1} />
        </h2>
        <div className="relative mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="h-full rounded-[1.75rem] border border-line p-7">
                <div className="flex items-center justify-between">
                  <s.icon className="size-7 text-accent" />
                  <span className="display text-5xl text-ink/10">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-2xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="sell-form" className="container-x mt-24 scroll-mt-28 pb-32">
        <div className="grid gap-10 rounded-[2.25rem] bg-white p-6 md:p-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow text-muted">Book inspection</p>
            <h3 className="display mt-3 text-4xl md:text-5xl">
              Let&apos;s make it <span className="em-light">official.</span>
            </h3>
            <p className="mt-4 max-w-sm text-muted">
              Current estimate: <b className="text-ink">{formatPrice(low)} – {formatPrice(high)}</b>. Our evaluator will confirm the final offer after inspection.
            </p>
          </div>
          <LeadForm
            type="trade-in"
            source="Website · Sell your car"
            submitLabel="Request inspection"
            extra={[
              { name: "vehicle", label: "Vehicle", placeholder: `${year} ${brand} ${model}`.trim(), required: true },
              { name: "km", label: "Kilometres", placeholder: km.toLocaleString("en-IN"), half: true },
              { name: "intent", label: "I want to", type: "select", options: ["Sell outright", "Trade-in for a new car"], half: true },
            ]}
            successTitle="Inspection requested"
            successText="Our evaluator will call you within the hour to schedule your inspection."
          />
        </div>
      </section>
    </>
  );
}
