"use client";

import { Hero } from "@/components/home/hero";
import { Brands } from "@/components/home/brands";
import { Featured } from "@/components/home/featured";
import { Manifesto } from "@/components/home/manifesto";
import { Categories } from "@/components/home/categories";
import { Stats } from "@/components/home/stats";
import { Process } from "@/components/home/process";
import { FinanceSection } from "@/components/home/finance";
import { Testimonials } from "@/components/home/testimonials";
import { Journal, Faq, Cta } from "@/components/home/journal-faq-cta";
import { useStore } from "@/lib/store";
import type { SectionId } from "@/lib/types";

const MAP: Record<SectionId, React.ComponentType> = {
  hero: Hero,
  brands: Brands,
  featured: Featured,
  manifesto: Manifesto,
  categories: Categories,
  stats: Stats,
  process: Process,
  finance: FinanceSection,
  testimonials: Testimonials,
  journal: Journal,
  faq: Faq,
  cta: Cta,
};

/** Homepage: section order + visibility are controlled from Admin → Content. */
export default function HomePage() {
  const sections = useStore((s) => s.settings.sections);
  const list = sections.filter((s) => s.enabled && MAP[s.id]);
  const render = (ids: typeof list) =>
    ids.map((s) => {
      const C = MAP[s.id];
      return <C key={s.id} />;
    });

  // When the hero leads, it stays pinned and the rest of the page slides
  // over it as a rounded "sheet".
  if (list[0]?.id === "hero") {
    return (
      <>
        <Hero />
        <div className="relative z-10 -mt-px rounded-t-[1.75rem] bg-paper shadow-[0_-30px_60px_-20px_rgba(0,0,0,0.5)] md:rounded-t-[3rem]">
          {render(list.slice(1))}
        </div>
      </>
    );
  }
  return <>{render(list)}</>;
}
