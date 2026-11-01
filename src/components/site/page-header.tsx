"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplitText } from "@/components/ui/motion";
import { NAV } from "@/lib/nav";
import { u } from "@/lib/seed";
import { cn, EASE } from "@/lib/utils";

const EXTRA_IMAGES: Record<string, string> = {
  "/compare": u("1606152421802-db97b9c7a11b", 2000),
  "/wishlist": u("1532581140115-3e355d1ed1de", 2000),
  "/book-test-drive": u("1568605117036-5fe5e7bab0b7", 2000),
};

/**
 * Inner-page "stage" header — the dark instrument-cluster look from the home
 * hero: full-bleed photo under heavy shading + telemetry grid, HUD breadcrumb,
 * oversized headline, optional read-out strip, and a paper "sheet" lip that the
 * page content continues on. Image is picked per route unless passed in.
 */
export function PageHeader({
  eyebrow,
  title,
  italic,
  description,
  children,
  className,
  image,
  meta,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  image?: string;
  meta?: { k: string; v: React.ReactNode }[];
}) {
  const pathname = usePathname();
  const nav = NAV.find((n) => n.href !== "/" && pathname.startsWith(n.href));
  const src = image ?? EXTRA_IMAGES[pathname] ?? nav?.image ?? NAV[0].image;
  const crumb = pathname.split("/").filter(Boolean);

  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <header ref={ref} data-stage className={cn("relative overflow-hidden bg-ink text-white", className)}>
      <motion.div style={{ y: imgY }} className="absolute inset-0">
        <motion.img
          src={src}
          alt=""
          initial={{ scale: 1.25, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
          className="h-full w-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(80%_70%_at_30%_50%,black,transparent)]" />

      <motion.div style={{ y: textY, opacity: fade }} className="container-x relative pb-24 pt-32 md:pb-32 md:pt-44">
        {/* HUD breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="eyebrow flex flex-wrap items-center gap-2 text-white/50"
        >
          <Link href="/" className="hover:text-white">Orbis</Link>
          {crumb.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-accent">/</span>
              <span className={i === crumb.length - 1 ? "text-white/80" : ""}>{decodeURIComponent(c).replace(/-/g, " ")}</span>
            </span>
          ))}
        </motion.div>

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-5xl">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
              className="eyebrow flex items-center gap-3 text-white/70"
            >
              <span className="h-px w-8 bg-accent" />
              {eyebrow}
            </motion.p>
            <h1 className="display mt-5 text-[46px] sm:text-7xl lg:text-[104px]">
              <SplitText text={title} trigger="mount" delay={0.15} />
              {italic && (
                <>
                  {" "}
                  <SplitText text={italic} wordClassName="em-light" trigger="mount" delay={0.3} />
                </>
              )}
            </h1>
          </div>
          {(description || children) && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
              className="max-w-sm shrink-0 border-l border-accent/60 pl-5"
            >
              {description && <p className="text-[15px] leading-relaxed text-white/65">{description}</p>}
              {children}
            </motion.div>
          )}
        </div>

        {meta && meta.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
            className="mt-12 grid grid-cols-2 gap-px overflow-hidden bg-white/10 ring-1 ring-white/10 backdrop-blur-md sm:grid-cols-4"
          >
            {meta.map((m) => (
              <div key={m.k} className="bg-black/40 px-4 py-4 md:px-6">
                <p className="eyebrow text-white/45">{m.k}</p>
                <p className="hud mt-1 text-[22px] text-white md:text-[28px]">{m.v}</p>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* sheet lip */}
      <div className="absolute inset-x-0 bottom-0 h-8 rounded-t-[1.75rem] bg-paper md:h-12 md:rounded-t-[3rem]" />
    </header>
  );
}
