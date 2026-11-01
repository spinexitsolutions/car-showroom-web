"use client";

import { EmiCalculator } from "@/components/site/emi-calculator";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";
import { useStore } from "@/lib/store";

export function FinanceSection() {
  const rate = useStore((s) => s.settings.finance.interestRate);
  return (
    <section className="container-x py-24 md:py-36">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
        <div className="flex flex-col justify-between gap-10">
          <SectionHeading
            index="06"
            eyebrow="Finance, simplified"
            title="Plan your"
            italic="monthly."
            description={`Rates from ${rate}% p.a. with 12 partner banks. Play with the numbers — then let our finance desk do the paperwork.`}
          />
          <Reveal>
            <div className="flex flex-wrap gap-2.5">
              <Button href="/finance">Get pre-approved</Button>
              <Button href="/sell" variant="ghost" arrow={false}>Value my trade-in</Button>
            </div>
          </Reveal>
        </div>
        <Reveal className="rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)] ring-1 ring-black/5 md:p-10">
          <EmiCalculator />
        </Reveal>
      </div>
    </section>
  );
}
