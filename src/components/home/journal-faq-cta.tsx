"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { u } from "@/lib/seed";
import { SectionHeading } from "@/components/ui/section-heading";
import { Magnetic, Reveal, SplitText } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { cn, EASE, formatDate } from "@/lib/utils";

export function Journal() {
  const all = useStore((s) => s.posts);
  const posts = useMemo(() => all.filter((p) => p.published).slice(0, 3), [all]);
  if (!posts.length) return null;
  return (
    <section className="container-x py-24 md:py-32">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <SectionHeading index="08" eyebrow="The journal" title="Stories &" italic="field notes." />
        <Reveal>
          <Button href="/journal" variant="ghost">All stories</Button>
        </Reveal>
      </div>
      <div className="no-scrollbar -mx-5 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="w-[82vw] shrink-0 snap-start md:w-auto">
            <Link href={`/journal/${p.slug}`} className="group block" data-cursor="Read">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem]">
                <img src={p.cover} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105" />
                <span className="eyebrow absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 !text-[10px] backdrop-blur">{p.category}</span>
              </div>
              <p className="eyebrow mt-5 text-muted">{formatDate(p.date)} · {p.author}</p>
              <h3 className="mt-2 text-[22px] font-semibold leading-tight tracking-tight">
                <span className="link-u">{p.title}</span>
              </h3>
              <p className="mt-2 line-clamp-2 text-[15px] text-muted">{p.excerpt}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  const faqs = useStore((s) => s.faqs);
  const phone = useStore((s) => s.settings.phone);
  const [open, setOpen] = useState<string | null>(faqs[0]?.id ?? null);
  return (
    <section className="container-x py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-[1fr_1.5fr] md:gap-20">
        <div>
          <SectionHeading index="09" eyebrow="Questions" title="Good to" italic="know." />
          <Reveal delay={0.2}>
            <div className="mt-10 rounded-[1.75rem] bg-white p-6 ring-1 ring-black/5">
              <p className="text-lg font-semibold tracking-tight">Still curious?</p>
              <p className="mt-1 text-[15px] text-muted">Our specialists answer within minutes.</p>
              <a href={`tel:${phone}`} className="mt-4 inline-block text-[15px] font-medium link-u">{phone}</a>
            </div>
          </Reveal>
        </div>
        <ul className="border-t border-line">
          {faqs.map((f, i) => {
            const on = open === f.id;
            return (
              <Reveal as="li" key={f.id} delay={i * 0.05} className="border-b border-line">
                <button onClick={() => setOpen(on ? null : f.id)} className="flex w-full items-center justify-between gap-6 py-6 text-left">
                  <span className="text-[18px] font-medium tracking-tight md:text-[22px]">{f.q}</span>
                  <motion.span
                    animate={{ rotate: on ? 45 : 0, backgroundColor: on ? "var(--accent)" : "rgba(0,0,0,0)" }}
                    className={cn("grid size-10 shrink-0 place-items-center rounded-full border", on ? "border-transparent text-white" : "border-line")}
                  >
                    <Plus className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-2xl pb-7 text-[16px] leading-relaxed text-muted">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Closing CTA: image zooms out as it scrolls in, magnetic round button. */
export function Cta() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.3, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [120, 32]);
  return (
    <section ref={ref} className="px-2 pb-2 pt-10 md:px-4 md:pb-4">
      <motion.div style={{ borderRadius: radius }} className="relative overflow-hidden bg-ink text-white">
        <motion.img
          style={{ scale }}
          src={u("1626668893632-6f3a4466d22f", 2000)}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="container-x relative flex min-h-[80svh] flex-col justify-end gap-10 py-14 md:flex-row md:items-end md:justify-between md:py-20">
          <div>
            <p className="eyebrow text-white/60">Your next chapter</p>
            <h2 className="display mt-5 text-[14vw] md:text-[8vw] xl:text-[128px]">
              <SplitText text="Your drive" /> <br />
              <SplitText text="starts here." wordClassName="em-light" delay={0.15} />
            </h2>
          </div>
          <Magnetic strength={0.4}>
            <Link
              href="/book-test-drive"
              data-cursor="Book"
              className="group relative grid size-40 place-items-center overflow-hidden rounded-full bg-accent text-center text-[15px] font-medium md:size-48"
            >
              <span className="absolute inset-0 scale-0 rounded-full bg-white transition-transform duration-700 ease-out-expo group-hover:scale-100" />
              <span className="relative transition-colors duration-500 group-hover:text-ink">
                Book a<br />test drive
                <ArrowUpRight className="mx-auto mt-2 size-5" />
              </span>
            </Link>
          </Magnetic>
        </div>
      </motion.div>
    </section>
  );
}
