"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import { useStore } from "@/lib/store";
import { u } from "@/lib/seed";
import { ScrollWord } from "@/components/ui/motion";

const PILLS = [u("1606577924006-27d39b132ae2", 400), u("1514316454349-750a7fd3da3a", 400), u("1610647752706-3bb12232b3ab", 400)];

/**
 * Manifesto: each word brightens as you scroll past it. Small rounded image
 * "pills" are woven inline between words (editorial / Apple keynote style).
 */
export function Manifesto() {
  const text = useStore((s) => s.settings.manifesto);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(" ");
  const pillAt = new Set([Math.floor(words.length * 0.18), Math.floor(words.length * 0.5), Math.floor(words.length * 0.8)]);
  let pillIdx = 0;

  return (
    <section className="container-x py-28 md:py-44">
      <p className="eyebrow mb-10 flex items-center gap-3 text-muted">
        <span className="text-ink">02</span>
        <span className="h-px w-8 bg-current opacity-40" /> Our philosophy
      </p>
      <div ref={ref} className="display max-w-6xl text-[9.5vw] leading-[1.02] md:text-[5.6vw] xl:text-[84px]">
        {words.map((w, i) => {
          const start = i / words.length;
          const end = start + 1 / words.length;
          const pill = pillAt.has(i) ? PILLS[pillIdx++ % PILLS.length] : null;
          return (
            <span key={i}>
              {pill && (
                <span className="relative mx-[0.15em] inline-block h-[0.78em] w-[1.7em] -translate-y-[0.06em] overflow-hidden rounded-full align-middle">
                  <img src={pill} alt="" className="h-full w-full object-cover" loading="lazy" />
                </span>
              )}
              <ScrollWord progress={scrollYProgress} range={[start, end]}>
                <span className={i % 7 === 3 ? "em-light" : undefined}>{w}</span>
              </ScrollWord>{" "}
            </span>
          );
        })}
      </div>
    </section>
  );
}
