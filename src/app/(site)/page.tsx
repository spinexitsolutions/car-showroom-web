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
  return (
    <>
      {sections
        .filter((s) => s.enabled && MAP[s.id])
        .map((s) => {
          const C = MAP[s.id];
          return <C key={s.id} />;
        })}
    </>
  );
}
