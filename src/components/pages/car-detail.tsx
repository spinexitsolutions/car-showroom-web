"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Gauge,
  Zap,
  Timer,
  Cog,
  Fuel,
  Users,
  Route,
  Heart,
  GitCompareArrows,
  Share2,
  ShieldCheck,
  Phone,
} from "lucide-react";
import type { Car } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CarGallery } from "./car-gallery";
import { CarCard, StatusPill } from "@/components/site/car-card";
import { LeadForm } from "@/components/site/lead-form";
import { EmiCalculator } from "@/components/site/emi-calculator";
import { Reveal, SplitText } from "@/components/ui/motion";
import { cn, EASE, emi, formatNumber, formatPrice } from "@/lib/utils";
import { CompareTray } from "./compare-tray";

const TABS = [
  { id: "test-drive", label: "Test drive" },
  { id: "enquiry", label: "Enquire" },
  { id: "finance", label: "Finance" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function CarDetail({ car }: { car: Car }) {
  const cars = useStore((s) => s.cars);
  const settings = useStore((s) => s.settings);
  const wish = useStore((s) => s.wishlist.includes(car.id));
  const inCompare = useStore((s) => s.compare.includes(car.id));
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const incrementViews = useStore((s) => s.incrementViews);
  const [color, setColor] = useState(0);
  const [tab, setTab] = useState<Tab>("test-drive");
  const [copied, setCopied] = useState(false);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    incrementViews(car.id);
  }, [car.id, incrementViews]);

  const similar = useMemo(
    () =>
      cars
        .filter((c) => c.id !== car.id && (c.bodyType === car.bodyType || c.brand === car.brand))
        .concat(cars.filter((c) => c.id !== car.id))
        .filter((c, i, a) => a.findIndex((x) => x.id === c.id) === i)
        .slice(0, 3),
    [cars, car]
  );

  const monthly = emi(car.price * 0.8, settings.finance.interestRate, 60);

  const specs = [
    { icon: Zap, label: "Power", value: car.power },
    { icon: Timer, label: "0–100 km/h", value: car.acceleration },
    { icon: Gauge, label: "Top speed", value: car.topSpeed },
    { icon: Cog, label: "Engine", value: car.engine },
    { icon: Route, label: "Torque", value: car.torque },
    { icon: Fuel, label: car.fuel === "Electric" ? "Range" : "Efficiency", value: car.range ?? "—" },
    { icon: Users, label: "Seats", value: String(car.seats) },
    { icon: Cog, label: "Transmission", value: car.transmission },
  ];

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: `${car.brand} ${car.model}`, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user cancelled */
    }
  }

  const iconBtn = "grid size-11 place-items-center rounded-full border border-line bg-white/70 transition active:scale-90 hover:bg-white";

  return (
    <>
      <div className="container-x pb-24 pt-28 md:pt-36">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Link href="/inventory" className="eyebrow inline-flex items-center gap-2 text-muted hover:text-ink">
            <ArrowLeft className="size-3.5" /> Back to collection
          </Link>
        </motion.div>

        {/* Title row */}
        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={car.status} />
              <span className="eyebrow rounded-full bg-paper-2 px-2.5 py-1 !text-[10px] text-muted">{car.condition}</span>
              {car.badge && <span className="eyebrow rounded-full bg-accent/15 px-2.5 py-1 !text-[10px] text-accent">{car.badge}</span>}
            </div>
            <h1 className="display mt-4 text-[44px] sm:text-6xl lg:text-[96px]">
              <SplitText text={`${car.brand} ${car.model}`} trigger="mount" />{" "}
              <SplitText text={car.variant} wordClassName="em-light text-muted" trigger="mount" delay={0.2} />
            </h1>
            <p className="mt-3 text-lg text-muted">{car.tagline}</p>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Wishlist" onClick={() => toggleWishlist(car.id)} className={cn(iconBtn, wish && "!border-accent !bg-accent text-accent-ink")}>
              <Heart className={cn("size-4", wish && "fill-current")} />
            </button>
            <button aria-label="Compare" onClick={() => toggleCompare(car.id)} className={cn(iconBtn, inCompare && "!border-ink !bg-ink text-white")}>
              <GitCompareArrows className="size-4" />
            </button>
            <button aria-label="Share" onClick={share} className={cn(iconBtn, "relative")}>
              {copied ? <Check className="size-4 text-accent" /> : <Share2 className="size-4" />}
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
          {/* Left column */}
          <div className="min-w-0">
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
              <CarGallery images={car.images} alt={`${car.brand} ${car.model}`} />
            </motion.div>

            {/* Quick facts */}
            <div className="mt-8 grid grid-cols-3 divide-x divide-line rounded-[1.5rem] border border-line bg-white/60 py-5 text-center">
              <div>
                <p className="eyebrow text-muted">Year</p>
                <p className="mt-1 text-xl font-semibold tracking-tight">{car.year}</p>
              </div>
              <div>
                <p className="eyebrow text-muted">Odometer</p>
                <p className="mt-1 text-xl font-semibold tracking-tight">{car.kmDriven ? `${formatNumber(car.kmDriven)} km` : "0 km"}</p>
              </div>
              <div>
                <p className="eyebrow text-muted">Body</p>
                <p className="mt-1 text-xl font-semibold tracking-tight">{car.bodyType}</p>
              </div>
            </div>

            {/* Specs */}
            <section className="mt-16">
              <Reveal>
                <p className="eyebrow text-muted">Performance & specs</p>
              </Reveal>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {specs.map((s, i) => (
                  <Reveal key={s.label} delay={i * 0.05}>
                    <div className="group h-full rounded-[1.5rem] bg-white p-5 transition-colors duration-500 hover:bg-ink hover:text-white">
                      <s.icon className="size-5 text-accent" />
                      <p className="eyebrow mt-6 text-muted group-hover:text-white/50">{s.label}</p>
                      <p className="mt-1 text-[19px] font-semibold leading-tight tracking-tight">{s.value}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* Colours */}
            {car.colors.length > 0 && (
              <section className="mt-16">
                <Reveal>
                  <p className="eyebrow text-muted">Available finishes</p>
                </Reveal>
                <div className="mt-6 flex flex-wrap items-center gap-6">
                  <div className="flex gap-3">
                    {car.colors.map((c, i) => (
                      <button
                        key={c.name}
                        aria-label={c.name}
                        onClick={() => setColor(i)}
                        className="relative grid size-14 place-items-center rounded-full"
                      >
                        {i === color && (
                          <motion.span layoutId="swatch-ring" className="absolute inset-0 rounded-full border-2 border-ink" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                        )}
                        <span className="size-10 rounded-full shadow-inner ring-1 ring-black/10" style={{ background: c.hex }} />
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={color}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="em-light text-3xl"
                    >
                      {car.colors[color]?.name}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </section>
            )}

            {/* Story */}
            <section className="mt-16 grid gap-8 md:grid-cols-[1fr_1.4fr]">
              <Reveal>
                <h2 className="display text-4xl md:text-5xl">
                  The <span className="em-light">story</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="text-[17px] leading-relaxed text-ink/80">{car.description}</p>
              </Reveal>
            </section>

            {/* Features */}
            <section className="mt-16">
              <Reveal>
                <p className="eyebrow text-muted">Highlights · {car.features.length} features</p>
              </Reveal>
              <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
                {car.features.map((f, i) => (
                  <Reveal as="li" key={f} delay={(i % 6) * 0.04} className="flex items-center gap-3 border-b border-line py-4 text-[15px]">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
                      <Check className="size-3.5" strokeWidth={2.5} />
                    </span>
                    {f}
                  </Reveal>
                ))}
              </ul>
            </section>

            <section className="mt-16 flex flex-col gap-4 rounded-[2rem] bg-ink p-7 text-white sm:flex-row sm:items-center sm:justify-between md:p-10">
              <div className="flex items-start gap-4">
                <ShieldCheck className="mt-1 size-7 shrink-0 text-accent" />
                <div>
                  <p className="text-xl font-semibold tracking-tight">Orbis Assurance</p>
                  <p className="mt-1 max-w-md text-[14px] text-white/60">
                    190-point inspection, transparent history, 7-day exchange and a 2-year comprehensive warranty on every certified car.
                  </p>
                </div>
              </div>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-medium text-ink">
                <Phone className="size-4" /> {settings.phone}
              </a>
            </section>
          </div>

          {/* Right sticky booking panel */}
          <aside>
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
                className="rounded-[2rem] border border-line bg-white p-5 shadow-xl shadow-black/[0.04] md:p-7"
              >
                <p className="eyebrow text-muted">Ex-showroom price</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight">{formatPrice(car.price)}</p>
                <p className="mt-1 text-[13px] text-muted">
                  EMI from <b className="text-ink">₹{Math.round(monthly).toLocaleString("en-IN")}/mo</b> · 20% down, 5 yrs
                </p>

                <div className="relative mt-6 grid grid-cols-3 rounded-full bg-paper p-1">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn("relative z-10 rounded-full py-2.5 text-[13px] font-medium transition-colors", tab === t.id ? "text-white" : "text-muted")}
                    >
                      {tab === t.id && (
                        <motion.span layoutId="detail-tab" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                      )}
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.35, ease: EASE }}
                    >
                      {car.status === "sold" && tab !== "finance" ? (
                        <div className="rounded-2xl bg-paper p-5 text-[14px] text-muted">
                          This car has found its owner. Leave your details and we&apos;ll alert you when a similar one arrives.
                          <LeadForm className="mt-5" type="enquiry" carId={car.id} source="Website · Sold car alert" submitLabel="Notify me" withMessage={false} />
                        </div>
                      ) : tab === "test-drive" ? (
                        <LeadForm
                          type="test-drive"
                          carId={car.id}
                          source="Website · Car page"
                          withSchedule
                          withMessage={false}
                          submitLabel="Book test drive"
                          extra={[{ name: "location", label: "Where?", type: "select", options: ["At the showroom", "At my home / office"] }]}
                          successTitle="Test drive booked"
                          successText={`We'll confirm your ${car.model} slot on WhatsApp shortly.`}
                        />
                      ) : tab === "enquiry" ? (
                        <LeadForm type="enquiry" carId={car.id} source="Website · Car page" submitLabel="Send enquiry" />
                      ) : (
                        <div className="[&>div]:!grid-cols-1 [&_.size-60]:!size-48">
                          <EmiCalculator defaultPrice={car.price} />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </aside>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-28">
            <div className="flex items-end justify-between">
              <h2 className="display text-4xl md:text-6xl">
                You may <span className="em-light">also</span> like
              </h2>
              <Link href="/inventory" className="eyebrow link-u hidden text-muted sm:block">
                View all
              </Link>
            </div>
            <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 no-scrollbar md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {similar.map((c) => (
                <CarCard key={c.id} car={c} className="w-[82vw] shrink-0 snap-start md:w-auto" />
              ))}
            </div>
          </section>
        )}
      </div>
      <CompareTray />
    </>
  );
}
