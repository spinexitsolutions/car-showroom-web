"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowUp, ArrowRight } from "lucide-react";
import { NAV } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { Magnetic } from "@/components/ui/motion";
import { EASE } from "@/lib/utils";
import { LogoMark } from "./navbar";

/**
 * Footer that "rises" from beneath the page: content parallaxes upward as it
 * enters, and the oversized wordmark letters spring up one by one.
 */
export function Footer() {
  const s = useStore((st) => st.settings);
  const addLead = useStore((st) => st.addLead);
  const ref = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wordRef, { once: true, margin: "-5% 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-25%", "0%"]);
  const [subscribed, setSubscribed] = useState(false);

  const groups = [
    { title: "Explore", links: NAV.slice(0, 4) },
    { title: "Company", links: NAV.slice(4) },
    {
      title: "Tools",
      links: [
        { href: "/compare", label: "Compare cars" },
        { href: "/wishlist", label: "Wishlist" },
        { href: "/book-test-drive", label: "Book test drive" },
        { href: "/admin", label: "Admin panel" },
      ],
    },
  ];

  return (
    <footer ref={ref} className="relative overflow-hidden bg-ink text-white">
      <motion.div style={{ y }} className="container-x relative pb-32 pt-20 md:pb-10 md:pt-28">
        <div className="grid gap-14 md:grid-cols-[1.2fr_2fr]">
          <div>
            <p className="eyebrow text-white/40">Newsletter</p>
            <h3 className="display mt-4 text-4xl md:text-5xl">
              First look at <span className="em-light">new arrivals.</span>
            </h3>
            {subscribed ? (
              <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-white/70">
                ✓ You&apos;re on the list. Welcome to the club.
              </motion.p>
            ) : (
              <form
                className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-white/15 p-1.5 focus-within:border-white/40"
                onSubmit={(e) => {
                  e.preventDefault();
                  const email = String(new FormData(e.currentTarget).get("email") ?? "");
                  addLead({ type: "newsletter", name: email.split("@")[0], email, phone: "", source: "Website · Footer" });
                  setSubscribed(true);
                }}
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="min-w-0 flex-1 bg-transparent px-4 text-[15px] outline-none placeholder:text-white/30"
                />
                <button className="grid size-11 shrink-0 place-items-center rounded-full bg-accent transition-transform active:scale-90" aria-label="Subscribe">
                  <ArrowRight className="size-4" />
                </button>
              </form>
            )}
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="eyebrow mb-5 text-white/40">{g.title}</p>
                <ul className="space-y-3 text-[15px]">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="link-u text-white/75 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="eyebrow mb-5 text-white/40">Showroom</p>
              <p className="text-[15px] leading-relaxed text-white/75">{s.address}</p>
              <p className="mt-3 text-[13px] text-white/45">{s.hours}</p>
              <a href={`tel:${s.phone}`} className="mt-3 block text-[15px] text-white/75 hover:text-white">
                {s.phone}
              </a>
            </div>
          </div>
        </div>

        <div ref={wordRef} className="relative mt-20 flex items-end justify-between gap-6 md:mt-28">
          <h2 className="display flex select-none overflow-hidden text-[23vw] leading-[0.78] md:text-[19vw]" aria-label={s.brandShort}>
            {s.brandShort.split("").map((l, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: "100%" }}
                animate={inView ? { y: "0%" } : undefined}
                transition={{ duration: 1.1, ease: EASE, delay: i * 0.06 }}
              >
                {l}
              </motion.span>
            ))}
          </h2>
          <Magnetic className="mb-[3vw] hidden md:block">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="grid size-24 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-ink"
              data-cursor="Top"
              aria-label="Back to top"
            >
              <ArrowUp className="size-5" />
            </button>
          </Magnetic>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-[12px] text-white/40 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoMark dark className="size-6" />
            <span>© {new Date().getFullYear()} {s.brandName}. All rights reserved.</span>
          </div>
          <div className="flex gap-5">
            {Object.entries(s.socials).map(([k, v]) => (
              <a key={k} href={v} target="_blank" rel="noreferrer" className="capitalize hover:text-white">
                {k}
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </footer>
  );
}
