"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/motion";
import { cn, EASE, formatDate } from "@/lib/utils";

export default function JournalPage() {
  const hydrated = useHydrated();
  const all = useStore((s) => s.posts);
  const posts = useMemo(
    () => all.filter((p) => p.published).sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [all]
  );
  const cats = useMemo(() => ["All", ...Array.from(new Set(posts.map((p) => p.category)))], [posts]);
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? posts : posts.filter((p) => p.category === cat);
  const [lead, ...rest] = list;

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="Stories from"
        italic="the fast lane."
        description="Buying guides, behind-the-scenes and the occasional love letter to an engine."
      />

      <section className="container-x pb-32">
        <div className="mb-10 flex gap-2 overflow-x-auto no-scrollbar">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn("relative shrink-0 chamfer chamfer-sm px-4 py-2 text-[13px] font-medium transition-colors", cat === c ? "text-white" : "text-muted hover:text-ink")}
            >
              {cat === c && <motion.span layoutId="journal-cat" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{c}</span>
            </button>
          ))}
        </div>

        {!hydrated ? (
          <div className="skeleton aspect-[21/9] rounded-[2rem]" />
        ) : !lead ? (
          <p className="py-24 text-center text-muted">No stories published yet.</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={cat} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: EASE }}>
              <Link href={`/journal/${lead.slug}`} data-cursor="Read" className="group grid overflow-hidden rounded-[2rem] bg-white lg:grid-cols-[1.4fr_1fr]">
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[480px]">
                  <img src={lead.cover} alt={lead.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105" />
                </div>
                <div className="flex flex-col justify-between gap-10 p-6 md:p-10">
                  <div>
                    <p className="eyebrow text-accent">{lead.category} · Latest</p>
                    <h2 className="display mt-4 text-4xl md:text-5xl">{lead.title}</h2>
                    <p className="mt-4 text-[16px] leading-relaxed text-muted">{lead.excerpt}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] text-muted">
                      {lead.author} · {formatDate(lead.date)}
                    </p>
                    <span className="grid size-12 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight className="size-5" />
                    </span>
                  </div>
                </div>
              </Link>

              <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) * 0.08}>
                    <Link href={`/journal/${p.slug}`} data-cursor="Read" className="group block">
                      <div className="aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-paper-2">
                        <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" />
                      </div>
                      <p className="eyebrow mt-5 text-muted">
                        {p.category} · {formatDate(p.date)}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{p.title}</h3>
                      <p className="mt-2 line-clamp-2 text-[15px] text-muted">{p.excerpt}</p>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </section>
    </>
  );
}
