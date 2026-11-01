"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, GitCompareArrows, ArrowUpRight } from "lucide-react";
import type { Car } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export function StatusPill({ status }: { status: Car["status"] }) {
  const map = {
    available: "bg-emerald-500/15 text-emerald-700",
    reserved: "bg-amber-500/15 text-amber-700",
    sold: "bg-ink/10 text-ink/60",
  } as const;
  return <span className={cn("eyebrow chamfer chamfer-sm px-2.5 py-1 !text-[10px]", map[status])}>{status}</span>;
}

/**
 * "Spec plate" card: chamfered photo window with HUD corner tags, then a
 * read-out row (power · 0–100 · price) like an instrument cluster.
 * Hover: photo pushes in, second photo wipes across, accent rail fills.
 */
export function CarCard({ car, className, priority }: { car: Car; className?: string; priority?: boolean }) {
  const wish = useStore((s) => s.wishlist.includes(car.id));
  const inCompare = useStore((s) => s.compare.includes(car.id));
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const second = car.images[1];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative bg-white", className)}
    >
      <Link href={`/inventory/${car.slug}`} data-cursor="View" className="block p-2">
        <div className="chamfer relative aspect-[16/11] overflow-hidden bg-ink">
          <img
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.07]"
          />
          {second && (
            <img
              src={second}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-[clip-path] duration-700 ease-out-expo [clip-path:inset(0_0_0_100%)] group-hover:[clip-path:inset(0_0_0_0%)]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className="eyebrow bg-black/55 px-2 py-1 !text-[9.5px] text-white backdrop-blur">
              {car.year} · {car.condition === "New" ? "New" : `${formatNumber(car.kmDriven)} km`}
            </span>
            {car.badge && <span className="eyebrow bg-accent px-2 py-1 !text-[9.5px] text-accent-ink">{car.badge}</span>}
            {car.status !== "available" && (
              <span className="eyebrow bg-white px-2 py-1 !text-[9.5px] text-ink">{car.status}</span>
            )}
          </div>
          <span className="hud absolute bottom-3 left-3 text-[11px] uppercase tracking-[0.18em] text-white/70">
            {car.bodyType} · {car.fuel}
          </span>
        </div>
      </Link>

      <div className="absolute right-4 top-4 flex flex-col gap-1.5">
        <button
          aria-label="Save to wishlist"
          onClick={() => toggleWishlist(car.id)}
          className={cn(
            "chamfer chamfer-sm grid size-9 place-items-center backdrop-blur-md transition-all duration-300 active:scale-90",
            wish ? "bg-accent text-accent-ink" : "bg-white/85 text-ink hover:bg-white"
          )}
        >
          <Heart className={cn("size-4", wish && "fill-current")} />
        </button>
        <button
          aria-label="Add to compare"
          onClick={() => toggleCompare(car.id)}
          className={cn(
            "chamfer chamfer-sm grid size-9 place-items-center backdrop-blur-md transition-all duration-300 active:scale-90",
            inCompare ? "bg-ink text-white" : "bg-white/85 text-ink hover:bg-white"
          )}
        >
          <GitCompareArrows className="size-4" />
        </button>
      </div>

      <Link href={`/inventory/${car.slug}`} className="block px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-muted">{car.brand}</p>
            <h3 className="mt-1 truncate text-[22px] font-extrabold leading-none tracking-[-0.03em] [font-stretch:112%]">
              {car.model} <span className="em-light text-[20px] text-muted">{car.variant}</span>
            </h3>
          </div>
          <span className="chamfer chamfer-sm grid size-9 shrink-0 place-items-center bg-ink/[0.06] transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-ink">
            <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 border-t border-line pt-3">
          {[
            { k: "Power", v: car.power },
            { k: "0–100", v: car.acceleration },
            { k: "Price", v: formatPrice(car.price) },
          ].map((s, i) => (
            <div key={s.k} className={cn(i > 0 && "border-l border-line pl-3")}>
              <p className="eyebrow !text-[9.5px] text-muted">{s.k}</p>
              <p className={cn("hud mt-0.5 truncate text-[15px]", i === 2 && "text-ink")}>{s.v}</p>
            </div>
          ))}
        </div>
      </Link>
      {/* accent rail */}
      <span className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
    </motion.article>
  );
}
