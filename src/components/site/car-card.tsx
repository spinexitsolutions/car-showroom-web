"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, GitCompareArrows, Gauge, Fuel, Zap } from "lucide-react";
import type { Car } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatNumber, formatPrice } from "@/lib/utils";

export function StatusPill({ status }: { status: Car["status"] }) {
  const map = {
    available: "bg-emerald-500/15 text-emerald-700",
    reserved: "bg-amber-500/15 text-amber-700",
    sold: "bg-ink/10 text-ink/60",
  } as const;
  return (
    <span className={cn("eyebrow rounded-full px-2.5 py-1 !text-[10px]", map[status])}>{status}</span>
  );
}

/**
 * Inventory card. Hover: image zooms + second photo cross-fades in,
 * spec strip slides up. Data attribute drives the custom cursor label.
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
      className={cn("group relative", className)}
    >
      <Link href={`/inventory/${car.slug}`} data-cursor="View" className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-paper-2">
          <img
            src={car.images[0]}
            alt={`${car.brand} ${car.model}`}
            loading={priority ? "eager" : "lazy"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[1.2s] ease-out-expo group-hover:scale-[1.06]",
              second && "group-hover:opacity-0"
            )}
          />
          {second && (
            <img
              src={second}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-[1.06] object-cover opacity-0 transition-[transform,opacity] duration-[1.2s] ease-out-expo group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
            {car.badge && (
              <span className="eyebrow rounded-full bg-white/90 px-2.5 py-1 !text-[10px] text-ink backdrop-blur">
                {car.badge}
              </span>
            )}
            {car.status !== "available" && (
              <span className="eyebrow rounded-full bg-ink/80 px-2.5 py-1 !text-[10px] text-white backdrop-blur">
                {car.status}
              </span>
            )}
          </div>
          <div className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center gap-4 text-[12px] text-white/90 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5" /> {car.power}
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge className="size-3.5" /> {car.acceleration}
            </span>
            <span className="flex items-center gap-1.5">
              <Fuel className="size-3.5" /> {car.fuel}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute right-3 top-3 flex flex-col gap-2">
        <button
          aria-label="Save to wishlist"
          onClick={() => toggleWishlist(car.id)}
          className={cn(
            "grid size-10 place-items-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90",
            wish ? "bg-accent text-accent-ink" : "bg-white/80 text-ink hover:bg-white"
          )}
        >
          <Heart className={cn("size-4", wish && "fill-current")} />
        </button>
        <button
          aria-label="Add to compare"
          onClick={() => toggleCompare(car.id)}
          className={cn(
            "grid size-10 place-items-center rounded-full backdrop-blur-md transition-all duration-300 active:scale-90",
            inCompare ? "bg-ink text-white" : "bg-white/80 text-ink hover:bg-white"
          )}
        >
          <GitCompareArrows className="size-4" />
        </button>
      </div>

      <Link href={`/inventory/${car.slug}`} className="mt-4 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="eyebrow text-muted">
            {car.year} · {car.condition === "New" ? "New" : `${formatNumber(car.kmDriven)} km`}
          </p>
          <h3 className="mt-1.5 truncate text-[19px] font-semibold tracking-tight">
            {car.brand} {car.model}{" "}
            <span className="em-light text-[21px] font-normal text-muted">{car.variant}</span>
          </h3>
        </div>
        <p className="shrink-0 pt-5 text-[17px] font-semibold tracking-tight">{formatPrice(car.price)}</p>
      </Link>
    </motion.article>
  );
}
