"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { u } from "@/lib/seed";
import { SectionHeading } from "@/components/ui/section-heading";

const STEPS = [
  { t: "Discover", d: "Browse online or walk in. A dedicated specialist curates a shortlist around how you actually drive.", img: u("1583121274602-3e2820c69888", 1400), tone: "bg-white" },
  { t: "Experience", d: "Back-to-back test drives — at our showroom, your home, or on an open highway. No time limits.", img: u("1568605117036-5fe5e7bab0b7", 1400), tone: "bg-paper-2" },
  { t: "Finance", d: "Pre-approved offers from 12 lenders, instant trade-in valuation and one transparent final price.", img: u("1610647752706-3bb12232b3ab", 1400), tone: "bg-[#e4e1d8]" },
  { t: "Drive home", d: "Registration, insurance, ceramic coat and a delivery ceremony — handled. Your first service is on us.", img: u("1590362891991-f776e747a588", 1400), tone: "bg-ink text-white" },
];

function Card({ i, step, progress }: { i: number; step: (typeof STEPS)[number]; progress: MotionValue<number> }) {
  const target = 1 - (STEPS.length - i) * 0.04;
  const scale = useTransform(progress, [i / STEPS.length, 1], [1, target]);
  return (
    <div className="sticky top-0 flex h-svh items-center justify-center">
      <motion.div
        style={{ scale, top: `calc(8vh + ${i * 22}px)` }}
        className={`relative grid h-[72svh] w-full origin-top grid-rows-[auto_1fr] overflow-hidden rounded-[2rem] shadow-[0_-20px_60px_-30px_rgba(0,0,0,0.3)] md:h-[64vh] md:grid-cols-2 md:grid-rows-1 md:rounded-[2.5rem] ${step.tone}`}
      >
        <div className="flex flex-col justify-between p-7 md:p-12">
          <div className="flex items-center justify-between">
            <span className="eyebrow opacity-50">Step</span>
            <span className="font-mono text-sm opacity-50">0{i + 1} / 0{STEPS.length}</span>
          </div>
          <div className="mt-6 md:mt-0">
            <h3 className="display text-[14vw] md:text-[6vw] xl:text-[96px]">
              {step.t.split(" ")[0]} <span className="serif-i">{step.t.split(" ")[1] ?? ""}</span>
            </h3>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed opacity-70 md:text-lg">{step.d}</p>
          </div>
        </div>
        <div className="relative m-3 overflow-hidden rounded-[1.5rem] md:m-4 md:rounded-[2rem]">
          <img src={step.img} alt={step.t} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        </div>
      </motion.div>
    </div>
  );
}

/** Sticky stacking cards: each step slides over the last, which recedes. */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <section className="container-x pt-24 md:pt-36">
      <SectionHeading
        index="05"
        eyebrow="The ownership journey"
        title="Four steps."
        italic="Zero stress."
      />
      <div ref={ref} className="relative mt-4">
        {STEPS.map((s, i) => (
          <Card key={s.t} i={i} step={s} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
