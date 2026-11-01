"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wrench, Sparkles, Droplets, ShieldHalf, CircleDot, ShieldCheck, Clock, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { PageHeader } from "@/components/site/page-header";
import { LeadForm } from "@/components/site/lead-form";
import { ParallaxImage, Reveal, SplitText } from "@/components/ui/motion";
import { u } from "@/lib/seed";
import { cn, EASE } from "@/lib/utils";

const SERVICES = [
  { icon: Wrench, name: "Periodic service", price: "from ₹14,900", time: "4–6 hrs", points: ["Engine oil & filters", "64-point health check", "Brake & suspension inspection", "Software updates"] },
  { icon: Sparkles, name: "Signature detailing", price: "from ₹8,500", time: "1 day", points: ["Two-bucket hand wash", "Clay bar decontamination", "Interior steam & leather care", "Engine bay detail"] },
  { icon: Droplets, name: "Ceramic coating", price: "from ₹45,000", time: "2 days", points: ["9H nano-ceramic layer", "Paint correction", "5-year warranty", "Hydrophobic gloss"] },
  { icon: ShieldHalf, name: "Paint protection film", price: "from ₹1,80,000", time: "3–4 days", points: ["Self-healing TPU film", "Gloss or matte finish", "10-year warranty", "Full or front-end kits"] },
  { icon: CircleDot, name: "Tyres & alignment", price: "from ₹2,500", time: "2 hrs", points: ["Michelin / Pirelli / Continental", "3D wheel alignment", "Nitrogen inflation", "Run-flat specialists"] },
  { icon: ShieldCheck, name: "Insurance & renewals", price: "Best quote", time: "15 min", points: ["Zero-depreciation covers", "Cashless claims at our bay", "Engine protect add-ons", "Instant renewal"] },
];

export default function ServicesPage() {
  const s = useStore((st) => st.settings);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHeader
        eyebrow="Service & care"
        title="Care that matches"
        italic="the machine."
        description="Factory-trained technicians, genuine parts and a lounge you won't want to leave. Free pick-up and drop within 25 km."
      />

      <section className="container-x">
        <ParallaxImage src={u("1615906655593-ad0386982a0f", 2000)} alt="Technician at work" className="aspect-[4/3] rounded-[2.25rem] md:aspect-[21/9]" />
      </section>

      {/* Menu */}
      <section className="container-x mt-24">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="display text-[42px] md:text-7xl">
            <SplitText text="The service" /> <SplitText text="menu." wordClassName="serif-i" delay={0.1} />
          </h2>
          <p className="max-w-sm text-muted">Transparent pricing. Approve every line item on WhatsApp before we touch your car.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((sv, i) => (
            <Reveal key={sv.name} delay={(i % 3) * 0.08}>
              <motion.div
                layout
                onClick={() => setOpen(open === i ? null : i)}
                className={cn(
                  "group cursor-pointer overflow-hidden rounded-[1.75rem] p-7 transition-colors duration-500",
                  open === i ? "bg-ink text-white" : "bg-white hover:bg-white/70"
                )}
              >
                <div className="flex items-start justify-between">
                  <sv.icon className="size-8 text-accent" />
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} className={cn("grid size-9 place-items-center rounded-full", open === i ? "bg-white/10" : "bg-paper")}>
                    <Plus className="size-4" />
                  </motion.span>
                </div>
                <h3 className="mt-10 text-2xl font-semibold tracking-tight">{sv.name}</h3>
                <div className={cn("mt-2 flex items-center gap-4 text-[14px]", open === i ? "text-white/60" : "text-muted")}>
                  <span className="font-medium">{sv.price}</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" /> {sv.time}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6">
                        {sv.points.map((p) => (
                          <li key={p} className="flex items-center gap-3 text-[14px] text-white/80">
                            <span className="size-1.5 rounded-full bg-accent" /> {p}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Booking */}
      <section className="container-x mt-24 pb-32">
        <div className="grid gap-10 overflow-hidden rounded-[2.25rem] bg-ink p-6 text-white md:p-12 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="eyebrow text-white/50">Book a service</p>
              <h3 className="display mt-3 text-4xl md:text-6xl">
                Hand us the <span className="serif-i text-accent">keys.</span>
              </h3>
              <p className="mt-4 max-w-sm text-white/60">We&apos;ll handle the rest — pick-up, updates with photos, and drop-off, washed and detailed.</p>
            </div>
            <div className="space-y-4 text-[14px]">
              <div className="rounded-2xl bg-white/5 p-5">
                <p className="eyebrow text-white/40">Service centre hours</p>
                <p className="mt-1 text-lg font-medium">{s.hours}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-5">
                <p className="eyebrow text-white/40">Location</p>
                <p className="mt-1 text-lg font-medium">{s.address}</p>
              </div>
            </div>
          </div>
          <LeadForm
            dark
            type="service"
            source="Website · Service"
            withSchedule
            submitLabel="Book service"
            extra={[
              { name: "vehicle", label: "Your vehicle", placeholder: "e.g. 2022 Audi Q5", required: true, half: true },
              { name: "service", label: "Service type", type: "select", options: SERVICES.map((x) => x.name), half: true },
              { name: "pickup", label: "Pick-up & drop", type: "select", options: ["Yes, pick up my car", "No, I'll drive in"] },
            ]}
            successTitle="Service booked"
            successText="Our service advisor will confirm your slot and pick-up time on WhatsApp."
          />
        </div>
      </section>
    </>
  );
}
