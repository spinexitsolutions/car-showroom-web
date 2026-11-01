"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Gem, HeartHandshake, Eye, Leaf } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { PageHeader } from "@/components/site/page-header";
import { Counter, ParallaxImage, Reveal, SplitText } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { u } from "@/lib/seed";

const VALUES = [
  { icon: Eye, title: "Radical transparency", text: "Full history, inspection reports and pricing — shared before you ask." },
  { icon: Gem, title: "Curation over volume", text: "We'd rather stock 40 exceptional cars than 400 ordinary ones." },
  { icon: HeartHandshake, title: "Relationships, not transactions", text: "Most of our customers are on their second or third car with us." },
  { icon: Leaf, title: "Responsible performance", text: "A growing electric line-up and carbon-offset deliveries since 2022." },
];

const TIMELINE = [
  { year: "2012", title: "A single bay in Bandra", text: "Two friends, three cars and a belief that buying a luxury car should feel as special as owning one." },
  { year: "2016", title: "Certified Pre-Owned launch", text: "Our 190-point certification sets a new benchmark for pre-owned luxury in India." },
  { year: "2019", title: "The flagship showroom", text: "A 22,000 sq ft gallery-style space on Linking Road with a café and a delivery stage." },
  { year: "2022", title: "Going electric", text: "Dedicated EV studio with home-charger installation and battery health certification." },
  { year: "2025", title: "3,000 deliveries", text: "Over three thousand cars delivered — and a 4.9★ rating we work for every single day." },
];

function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div ref={ref} className="relative mt-16 pl-10 md:pl-0">
      <div className="absolute left-3 top-0 h-full w-px bg-line md:left-1/2" />
      <motion.div style={{ scaleY }} className="absolute left-3 top-0 h-full w-px origin-top bg-accent md:left-1/2" />
      <div className="space-y-16 md:space-y-24">
        {TIMELINE.map((t, i) => (
          <div key={t.year} className="relative md:grid md:grid-cols-2 md:gap-20">
            <span className="absolute -left-[33px] top-3 size-3 rounded-full bg-accent ring-4 ring-paper md:left-1/2 md:-ml-1.5" />
            <Reveal className={i % 2 ? "md:col-start-2" : "md:text-right"}>
              <p className="display text-6xl text-ink/15 md:text-8xl">{t.year}</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight">{t.title}</h3>
              <p className={`mt-2 max-w-md text-muted ${i % 2 ? "" : "md:ml-auto"}`}>{t.text}</p>
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const hydrated = useHydrated();
  const settings = useStore((s) => s.settings);
  const staff = useStore((s) => s.staff);

  return (
    <>
      <PageHeader
        eyebrow={`About ${settings.brandName}`}
        title="Obsessed with"
        italic="the details."
        description="Since 2012 we've helped thousands of people find the car that makes them take the long way home."
      />

      <section className="container-x">
        <ParallaxImage src={u("1583121274602-3e2820c69888", 2200)} alt="Our showroom" className="aspect-[4/3] rounded-[2.25rem] md:aspect-[21/9]" amount={10} />
      </section>

      {/* Story */}
      <section className="container-x mt-24 grid gap-10 md:grid-cols-[1fr_1.3fr]">
        <Reveal>
          <p className="eyebrow text-muted">Our story</p>
        </Reveal>
        <div>
          <p className="text-[26px] font-medium leading-snug tracking-tight md:text-4xl">
            <SplitText text={settings.manifesto} stagger={0.02} />
          </p>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-xl text-[17px] leading-relaxed text-muted">
              What began as a three-car garage is now one of India&apos;s most trusted destinations for luxury and performance cars. The
              cars changed; the philosophy didn&apos;t. Every vehicle is personally inspected, every customer has one dedicated advisor, and
              every delivery is an occasion.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="container-x mt-24">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] bg-line md:grid-cols-4">
          {settings.stats.map((s) => (
            <div key={s.label} className="bg-paper p-6 md:p-10">
              <p className="display text-5xl md:text-7xl">
                {hydrated ? <Counter value={s.value} suffix={s.suffix} /> : "—"}
              </p>
              <p className="eyebrow mt-3 text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="mt-24 bg-ink py-24 text-white md:py-32">
        <div className="container-x">
          <h2 className="display text-[42px] md:text-7xl">
            <SplitText text="What we" /> <SplitText text="stand for." wordClassName="serif-i text-accent" delay={0.1} />
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="h-full rounded-[1.75rem] border border-white/10 p-7 transition-colors duration-500 hover:bg-white/5">
                  <v.icon className="size-8 text-accent" />
                  <h3 className="mt-12 text-xl font-semibold tracking-tight">{v.title}</h3>
                  <p className="mt-2 text-[15px] text-white/55">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="container-x mt-24 md:mt-32">
        <h2 className="display text-[42px] md:text-center md:text-7xl">
          <SplitText text="Fourteen years," /> <SplitText text="in motion." wordClassName="serif-i" delay={0.1} />
        </h2>
        <Timeline />
      </section>

      {/* Team */}
      <section className="container-x mt-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="display text-[42px] md:text-7xl">
            <SplitText text="The people" /> <SplitText text="behind it." wordClassName="serif-i" delay={0.1} />
          </h2>
          <p className="max-w-sm text-muted">Car people first, salespeople never. Meet the team you&apos;ll actually talk to.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {staff.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.08}>
              <div className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.75rem] bg-paper-2">
                  <img src={m.avatar.replace("w=200", "w=700")} alt={m.name} loading="lazy" className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                </div>
                <p className="mt-4 text-lg font-semibold tracking-tight">{m.name}</p>
                <p className="eyebrow mt-1 text-muted">{m.role}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="container-x mt-28 pb-32">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
          <ParallaxImage src={u("1590362891991-f776e747a588", 1400)} alt="" className="col-span-2 row-span-2 aspect-square rounded-[1.75rem] md:aspect-auto" />
          <ParallaxImage src={u("1606577924006-27d39b132ae2", 900)} alt="" className="aspect-square rounded-[1.75rem]" />
          <ParallaxImage src={u("1514316454349-750a7fd3da3a", 900)} alt="" className="aspect-square rounded-[1.75rem]" />
          <ParallaxImage src={u("1610647752706-3bb12232b3ab", 1200)} alt="" className="col-span-2 aspect-[2/1] rounded-[1.75rem]" />
        </div>
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="display text-4xl md:text-6xl">
            Come say <span className="serif-i">hello.</span>
          </p>
          <p className="mt-3 text-muted">{settings.address}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/contact">Plan a visit</Button>
            <Button href="/inventory" variant="ghost">
              See the collection
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
