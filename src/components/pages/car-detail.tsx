"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Gauge as GaugeIcon,
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
import { CarCard } from "@/components/site/car-card";
import { LeadForm } from "@/components/site/lead-form";
import { EmiCalculator } from "@/components/site/emi-calculator";
import { Reveal } from "@/components/ui/motion";
import { cn, EASE, emi, formatNumber, formatPrice } from "@/lib/utils";
import { CompareTray } from "./compare-tray";
import { Gauge, Tween, num } from "@/components/site/hud";

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
    { icon: GaugeIcon, label: "Top speed", value: car.topSpeed },
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


  return (
    <>
      <CarStage
        car={car}
        wish={wish}
        inCompare={inCompare}
        copied={copied}
        onWish={() => toggleWishlist(car.id)}
        onCompare={() => toggleCompare(car.id)}
        onShare={share}
      />
      <div className="container-x relative z-10 -mt-10 rounded-t-[1.75rem] bg-paper pb-24 pt-10 md:-mt-14 md:rounded-t-[3rem] md:pt-14">
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
          {/* Left column */}
          <div className="min-w-0">
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
              <p className="eyebrow mb-4 text-muted">Gallery · {car.images.length} photo{car.images.length > 1 ? "s" : ""}</p>
              <CarGallery images={car.images} alt={`${car.brand} ${car.model}`} />
            </motion.div>

            {/* Quick facts */}
            <div className="chamfer mt-8 grid grid-cols-3 divide-x divide-line bg-white py-5 text-center">
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
                    <div className="chamfer group h-full bg-white p-5 transition-colors duration-500 hover:bg-ink hover:text-white">
                      <s.icon className="size-5 text-accent" />
                      <p className="eyebrow mt-6 text-muted group-hover:text-white/50">{s.label}</p>
                      <p className="hud mt-1 text-[19px] leading-tight">{s.value}</p>
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

            <section className="chamfer chamfer-lg mt-16 flex flex-col gap-4 bg-ink p-7 text-white sm:flex-row sm:items-center sm:justify-between md:p-10">
              <div className="flex items-start gap-4">
                <ShieldCheck className="mt-1 size-7 shrink-0 text-accent" />
                <div>
                  <p className="text-xl font-semibold tracking-tight">Orbis Assurance</p>
                  <p className="mt-1 max-w-md text-[14px] text-white/60">
                    190-point inspection, transparent history, 7-day exchange and a 2-year comprehensive warranty on every certified car.
                  </p>
                </div>
              </div>
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex shrink-0 items-center gap-2 chamfer chamfer-sm bg-white px-5 py-3 text-[14px] font-medium text-ink">
                <Phone className="size-4" /> {settings.phone}
              </a>
            </section>
          </div>

          {/* Right sticky booking panel */}
          <aside id="book">
            <div className="lg:sticky lg:top-28">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
                className="chamfer chamfer-lg bg-white p-5 shadow-xl shadow-black/[0.04] md:p-7"
              >
                <p className="eyebrow text-muted">Ex-showroom price</p>
                <p className="hud mt-1 text-4xl">{formatPrice(car.price)}</p>
                <p className="mt-1 text-[13px] text-muted">
                  EMI from <b className="text-ink">₹{Math.round(monthly).toLocaleString("en-IN")}/mo</b> · 20% down, 5 yrs
                </p>

                <div className="chamfer chamfer-sm relative mt-6 grid grid-cols-3 bg-paper p-1">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn("hud relative z-10 py-2.5 text-[12px] uppercase tracking-[0.1em] transition-colors", tab === t.id ? "text-white" : "text-muted")}
                    >
                      {tab === t.id && (
                        <motion.span layoutId="detail-tab" className="absolute inset-0 -z-10 bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
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

/**
 * Dark full-bleed "stage" for a single car — same instrument language as the
 * home hero: photo wipes between angles, per-letter model name, horsepower
 * gauge and a live spec read-out.
 */
function CarStage({
  car,
  wish,
  inCompare,
  copied,
  onWish,
  onCompare,
  onShare,
}: {
  car: Car;
  wish: boolean;
  inCompare: boolean;
  copied: boolean;
  onWish: () => void;
  onCompare: () => void;
  onShare: () => void;
}) {
  const [img, setImg] = useState(0);
  const btn = "chamfer chamfer-sm grid size-11 place-items-center bg-white/10 text-white backdrop-blur-md transition active:scale-90 hover:bg-white/20";
  return (
    <section data-stage className="relative h-svh min-h-[700px] overflow-hidden bg-ink text-white">
      <AnimatePresence initial={false}>
        <motion.div
          key={img}
          className="absolute inset-0"
          initial={{ clipPath: "inset(0 0 0 100%)" }}
          animate={{ clipPath: "inset(0 0 0 0%)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.img
            src={car.images[img]}
            alt={`${car.brand} ${car.model}`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1.03 }}
            transition={{ duration: 8, ease: "easeOut" }}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/5 to-black/50" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(70%_60%_at_60%_45%,black,transparent)]" />

      <div className="container-x relative flex h-full flex-col pb-20 pt-24 md:pb-24 md:pt-28">
        <div className="flex items-start justify-between gap-4">
          <Link href="/inventory" className="eyebrow inline-flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft className="size-3.5" /> Collection
          </Link>
          <div className="flex flex-wrap justify-end gap-1.5">
            <span className="eyebrow bg-white/10 px-2.5 py-1.5 !text-[10px] backdrop-blur">{car.status}</span>
            <span className="eyebrow bg-white/10 px-2.5 py-1.5 !text-[10px] backdrop-blur">{car.condition}</span>
            {car.badge && <span className="eyebrow bg-accent px-2.5 py-1.5 !text-[10px] text-accent-ink">{car.badge}</span>}
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-8">
          <div className="min-w-0">
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
              className="eyebrow flex items-center gap-3 text-white/70"
            >
              <span className="h-px w-8 bg-accent" /> {car.brand} · {car.year}
            </motion.p>
            <h1 className="display mt-3 flex flex-wrap overflow-hidden pb-[0.06em] text-[17vw] leading-[0.86] md:text-[min(9vw,15vh)] xl:text-[min(140px,15vh)]" aria-label={`${car.brand} ${car.model}`}>
              {car.model.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ y: "105%", rotate: 8 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.04 }}
                >
                  {ch === " " ? "\u00A0" : ch}
                </motion.span>
              ))}
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              className="em-light mt-1 text-2xl text-white/80 md:text-4xl"
            >
              {car.variant}
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-3 max-w-md text-[15px] text-white/60">
              {car.tagline}
            </motion.p>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.4 }} className="hidden shrink-0 lg:block">
            <Gauge hp={num(car.power)} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          className="mt-6 grid grid-cols-3 gap-px overflow-hidden bg-white/10 ring-1 ring-white/10 backdrop-blur-md md:mt-8 md:grid-cols-[repeat(4,1fr)_auto]"
        >
          {[
            { k: "0–100 km/h", v: <><Tween value={num(car.acceleration)} format={(v) => v.toFixed(1)} /><small className="ml-1 text-[0.5em] text-white/50">s</small></> },
            { k: "Top speed", v: <><Tween value={num(car.topSpeed)} /><small className="ml-1 text-[0.5em] text-white/50">km/h</small></> },
            { k: "Torque", hideSm: true, v: <><Tween value={num(car.torque)} /><small className="ml-1 text-[0.5em] text-white/50">Nm</small></> },
            { k: "Price", v: formatPrice(car.price) },
          ].map((x) => (
            <div key={x.k} className={cn("bg-black/40 px-3 py-3 md:px-6 md:py-5", "hideSm" in x && "hidden md:block")}>
              <p className="eyebrow text-white/45">{x.k}</p>
              <p className="hud mt-1 whitespace-nowrap text-[18px] md:text-[28px]">{x.v}</p>
            </div>
          ))}
          <div className="col-span-3 flex items-center gap-2 bg-black/40 p-2.5 md:col-span-1 md:px-5">
            <button aria-label="Wishlist" onClick={onWish} className={cn(btn, wish && "!bg-accent !text-accent-ink")}>
              <Heart className={cn("size-4", wish && "fill-current")} />
            </button>
            <button aria-label="Compare" onClick={onCompare} className={cn(btn, inCompare && "!bg-white !text-ink")}>
              <GitCompareArrows className="size-4" />
            </button>
            <button aria-label="Share" onClick={onShare} className={btn}>
              {copied ? <Check className="size-4 text-accent" /> : <Share2 className="size-4" />}
            </button>
            <a href="#book" className="chamfer chamfer-sm hud flex h-11 flex-1 items-center justify-center whitespace-nowrap bg-accent px-5 text-[12px] uppercase tracking-[0.1em] text-accent-ink md:flex-none">
              Book test drive
            </a>
          </div>
        </motion.div>

        {car.images.length > 1 && (
          <div className="no-scrollbar mt-2.5 flex gap-2 overflow-x-auto">
            {car.images.map((src, k) => (
              <button
                key={src}
                onClick={() => setImg(k)}
                aria-label={`Photo ${k + 1}`}
                className={cn("chamfer chamfer-sm relative h-12 w-20 shrink-0 overflow-hidden transition-opacity", k === img ? "opacity-100 ring-2 ring-accent" : "opacity-50 hover:opacity-100")}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
                {k === img && <span className="absolute inset-x-0 bottom-0 h-[2px] bg-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
