"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X, ArrowDownUp } from "lucide-react";
import { useStore, useHydrated } from "@/lib/store";
import type { Car } from "@/lib/types";
import { CarCard } from "@/components/site/car-card";
import { PageHeader } from "@/components/site/page-header";
import { cn, EASE, formatPrice } from "@/lib/utils";
import { CompareTray } from "./compare-tray";

const BODY = ["SUV", "Sedan", "Coupe", "Supercar", "Convertible", "Hatchback"];
const FUEL = ["Petrol", "Diesel", "Electric", "Hybrid"];
const CONDITION = ["New", "Certified Pre-Owned", "Pre-Owned"];
const STATUS = ["available", "reserved", "sold"];
const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price · Low to high" },
  { id: "price-desc", label: "Price · High to low" },
  { id: "newest", label: "Newest arrivals" },
  { id: "views", label: "Most viewed" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

interface Filters {
  body: string[];
  fuel: string[];
  condition: string[];
  brand: string[];
  status: string[];
  maxPrice: number;
}

const split = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium capitalize transition-colors duration-300",
        active ? "border-ink text-white" : "border-line bg-white/60 text-ink hover:border-ink/30"
      )}
    >
      {active && (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 rounded-full bg-ink"
          transition={{ duration: 0.35, ease: EASE }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function FilterGroup({
  title,
  options,
  value,
  onToggle,
}: {
  title: string;
  options: string[];
  value: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-3 text-muted">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={o} active={value.includes(o)} onClick={() => onToggle(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function InventoryView() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const cars = useStore((s) => s.cars);
  const maxCarPrice = useMemo(() => Math.max(...cars.map((c) => c.price), 10000000), [cars]);
  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))).sort(), [cars]);

  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<SortId>("featured");
  const [sheet, setSheet] = useState(false);
  const [f, setF] = useState<Filters>(() => ({
    body: split(params.get("body")),
    fuel: split(params.get("fuel")),
    condition: split(params.get("condition")),
    brand: split(params.get("brand")),
    status: [],
    maxPrice: Infinity,
  }));
  const priceCap = Number.isFinite(f.maxPrice) ? f.maxPrice : maxCarPrice;

  const toggle = (k: keyof Omit<Filters, "maxPrice">) => (v: string) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const activeCount =
    f.body.length + f.fuel.length + f.condition.length + f.brand.length + f.status.length + (Number.isFinite(f.maxPrice) ? 1 : 0);

  const clearAll = () => {
    setF({ body: [], fuel: [], condition: [], brand: [], status: [], maxPrice: Infinity });
    setQ("");
  };

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = cars.filter((c: Car) => {
      if (term && !`${c.brand} ${c.model} ${c.variant} ${c.bodyType} ${c.fuel}`.toLowerCase().includes(term)) return false;
      if (f.body.length && !f.body.includes(c.bodyType)) return false;
      if (f.fuel.length && !f.fuel.includes(c.fuel)) return false;
      if (f.condition.length && !f.condition.includes(c.condition)) return false;
      if (f.brand.length && !f.brand.includes(c.brand)) return false;
      if (f.status.length && !f.status.includes(c.status)) return false;
      if (c.price > priceCap) return false;
      return true;
    });
    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "views":
        sorted.sort((a, b) => b.views - a.views);
        break;
      default:
        sorted.sort(
          (a, b) =>
            Number(b.featured) - Number(a.featured) ||
            Number(a.status === "sold") - Number(b.status === "sold") ||
            b.price - a.price
        );
    }
    return sorted;
  }, [cars, q, f, sort, priceCap]);

  const pct = (priceCap / maxCarPrice) * 100;

  const filtersPanel = (
    <div className="space-y-7">
      <FilterGroup title="Body type" options={BODY} value={f.body} onToggle={toggle("body")} />
      <FilterGroup title="Fuel" options={FUEL} value={f.fuel} onToggle={toggle("fuel")} />
      <FilterGroup title="Condition" options={CONDITION} value={f.condition} onToggle={toggle("condition")} />
      <FilterGroup title="Brand" options={brands} value={f.brand} onToggle={toggle("brand")} />
      <FilterGroup title="Availability" options={STATUS} value={f.status} onToggle={toggle("status")} />
      <div>
        <div className="flex items-baseline justify-between">
          <p className="eyebrow text-muted">Max price</p>
          <p className="text-[15px] font-semibold tabular-nums">{formatPrice(priceCap)}</p>
        </div>
        <input
          type="range"
          className="range mt-4"
          min={3000000}
          max={maxCarPrice}
          step={500000}
          value={priceCap}
          style={{ ["--p" as string]: `${pct}%` }}
          onChange={(e) => setF((p) => ({ ...p, maxPrice: Number(e.target.value) }))}
        />
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow={`The Collection · ${hydrated ? cars.filter((c) => c.status !== "sold").length : "—"} in stock`}
        title="Find your"
        italic="next obsession."
        description="Every car is hand-picked, inspected and ready for a test drive — at our showroom or at your door."
      />

      <section className="container-x pb-32">
        {/* Toolbar */}
        <div className="sticky top-3 z-30 -mx-2 mb-8 md:top-24">
          <div className="glass flex items-center gap-2 rounded-full border border-line p-1.5 shadow-lg shadow-black/5">
            <label className="flex min-w-0 flex-1 items-center gap-2.5 pl-3">
              <Search className="size-4 shrink-0 text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Porsche, SUV, electric…"
                className="w-full bg-transparent py-2 text-[15px] outline-none placeholder:text-muted"
              />
              {q && (
                <button onClick={() => setQ("")} aria-label="Clear search" className="text-muted">
                  <X className="size-4" />
                </button>
              )}
            </label>
            <div className="relative hidden items-center sm:flex">
              <ArrowDownUp className="pointer-events-none absolute left-3 size-3.5 text-muted" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="h-10 appearance-none rounded-full bg-paper-2/70 pl-8 pr-4 text-[13px] font-medium outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setSheet(true)}
              className="relative flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white lg:hidden"
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px]">{activeCount}</span>
              )}
            </button>
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-44">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[15px] font-semibold">Filters</p>
                {activeCount > 0 && (
                  <button onClick={clearAll} className="eyebrow link-u text-accent">
                    Reset ({activeCount})
                  </button>
                )}
              </div>
              {filtersPanel}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-[14px] text-muted">
                <motion.b key={results.length} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="inline-block font-semibold text-ink">
                  {hydrated ? results.length : "—"}
                </motion.b>{" "}
                cars match
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="rounded-full bg-paper-2 px-3 py-2 text-[12px] font-medium outline-none sm:hidden"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {!hydrated ? (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="skeleton aspect-[4/3] rounded-[1.75rem]" />
                    <div className="skeleton mt-4 h-5 w-2/3 rounded-full" />
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-dashed border-line py-24 text-center">
                <p className="display text-4xl">
                  Nothing <span className="em-light">here</span> — yet.
                </p>
                <p className="mx-auto mt-3 max-w-sm text-muted">
                  Try loosening a filter. Or tell us what you want and we&apos;ll source it for you.
                </p>
                <button onClick={clearAll} className="mt-6 rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-white">
                  Reset filters
                </button>
              </motion.div>
            ) : (
              <motion.div layout className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {results.map((c, i) => (
                    <CarCard key={c.id} car={c} priority={i < 3} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheet(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.55, ease: EASE }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => info.offset.y > 120 && setSheet(false)}
              className="fixed inset-x-0 bottom-0 z-[61] max-h-[88dvh] rounded-t-[2rem] bg-paper pb-[env(safe-area-inset-bottom)]"
            >
              <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-ink/15" />
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-lg font-semibold">Filters</p>
                <button onClick={clearAll} className="eyebrow text-accent">
                  Reset
                </button>
              </div>
              <div data-lenis-prevent className="max-h-[62dvh] overflow-y-auto px-5 pb-6">
                {filtersPanel}
              </div>
              <div className="border-t border-line p-4">
                <button onClick={() => setSheet(false)} className="h-13 w-full rounded-full bg-ink py-4 text-[15px] font-medium text-white">
                  Show {results.length} cars
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CompareTray />
    </>
  );
}
