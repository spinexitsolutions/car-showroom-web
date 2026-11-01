"use client";

import { useMemo } from "react";
import { BadgePercent, CalendarClock, FileCheck2, KeyRound, Landmark, Wallet } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/site/page-header";
import { EmiCalculator } from "@/components/site/emi-calculator";
import { LeadForm } from "@/components/site/lead-form";
import { Reveal, SplitText } from "@/components/ui/motion";
import { u } from "@/lib/seed";
import { carName } from "@/lib/utils";

const BANKS = ["HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Prime", "SBI", "Mercedes-Benz FS", "BMW Financial", "Bajaj Finserv", "Tata Capital", "IDFC First", "Yes Bank", "AU Small Finance"];

const STEPS = [
  { icon: Wallet, title: "Calculate", text: "Play with tenure and down payment until the EMI feels right." },
  { icon: FileCheck2, title: "Apply in 3 min", text: "Share basic details — PAN, income and employment. No paperwork upfront." },
  { icon: BadgePercent, title: "Compare offers", text: "We fetch quotes from 12 lenders and show you the best three." },
  { icon: KeyRound, title: "Drive home", text: "Same-day approval for most profiles. Sign digitally, collect your keys." },
];

export default function FinancePage() {
  const cars = useStore((s) => s.cars);
  const fin = useStore((s) => s.settings.finance);
  const options = useMemo(() => ["Not decided yet", ...cars.filter((c) => c.status !== "sold").map((c) => carName(c))], [cars]);

  return (
    <>
      <PageHeader
        eyebrow="Finance & EMI"
        title="Ownership,"
        italic="made effortless."
        description={`Rates from ${fin.interestRate}% p.a., tenures up to ${fin.maxTenureYears} years and down payments from ${fin.minDownPct}%. Approval in as little as 4 hours.`}
      />

      {/* Calculator */}
      <section className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.25rem] bg-ink p-6 text-white grain md:p-14">
            <div className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-accent/25 blur-[120px]" />
            <div className="relative mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="display text-4xl md:text-6xl">
                <SplitText text="Your EMI," /> <SplitText text="instantly." wordClassName="em-light text-accent" delay={0.1} />
              </h2>
              <p className="max-w-xs text-[14px] text-white/50">Indicative figures. Final rate depends on lender and credit profile.</p>
            </div>
            <div className="relative">
              <EmiCalculator dark defaultPrice={15000000} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Banks marquee */}
      <section className="mt-20 overflow-hidden border-y border-line py-8">
        <p className="eyebrow container-x mb-6 text-muted">Lending partners</p>
        <div className="flex w-max animate-marquee" style={{ ["--marquee-duration" as string]: "50s" }}>
          {[...BANKS, ...BANKS].map((b, i) => (
            <span key={i} className="flex items-center gap-4 px-8 text-2xl font-semibold tracking-tight text-ink/70 md:text-3xl">
              <Landmark className="size-5 text-accent" />
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="container-x mt-24">
        <h2 className="display text-[42px] md:text-7xl">
          <SplitText text="Four steps." /> <SplitText text="Zero stress." wordClassName="em-light" delay={0.1} />
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-[1.75rem] bg-white p-7 transition-colors duration-500 hover:bg-ink hover:text-white">
                <span className="eyebrow text-muted group-hover:text-white/40">0{i + 1}</span>
                <s.icon className="mt-10 size-8 text-accent transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                <h3 className="mt-6 text-2xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[15px] text-muted group-hover:text-white/60">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Application */}
      <section className="container-x mt-24 pb-32">
        <div className="grid overflow-hidden rounded-[2.25rem] bg-white lg:grid-cols-2">
          <div className="relative min-h-[320px]">
            <img src={u("1610647752706-3bb12232b3ab", 1400)} alt="Luxury car interior" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 p-8 text-white md:p-10">
              <CalendarClock className="size-7 text-accent" />
              <p className="display mt-4 text-4xl md:text-5xl">
                Pre-approved in <span className="em-light">4 hours.</span>
              </p>
              <p className="mt-3 max-w-sm text-white/70">Soft credit check only — applying doesn&apos;t affect your score.</p>
            </div>
          </div>
          <div className="p-6 md:p-10">
            <p className="eyebrow text-muted">Finance application</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">Get your best rate</h3>
            <LeadForm
              className="mt-8"
              type="finance"
              source="Website · Finance page"
              submitLabel="Check eligibility"
              withMessage={false}
              extra={[
                { name: "car", label: "Car of interest", type: "select", options: options },
                { name: "income", label: "Monthly income (₹)", type: "number", placeholder: "e.g. 350000", required: true, half: true },
                { name: "employment", label: "Employment", type: "select", options: ["Salaried", "Self-employed", "Business owner", "Professional (Doctor/CA)"], half: true },
                { name: "down", label: "Planned down payment (₹)", type: "number", placeholder: "e.g. 2000000" },
              ]}
              successTitle="Application received"
              successText="Our finance advisor will share personalised offers within 4 working hours."
            />
          </div>
        </div>
      </section>
    </>
  );
}
