"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CarFront, Eye, LayoutGrid, List, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { CarStatus } from "@/lib/types";
import { useStore } from "@/lib/store";
import { carName, cn, formatNumber, formatPrice } from "@/lib/utils";
import { AdminPage, Btn, Empty, SearchInput, Select, Tabs } from "@/components/admin/ui";
import { useToast } from "@/components/admin/toast";

const STATUS: { id: CarStatus; label: string; tone: string }[] = [
  { id: "available", label: "Available", tone: "bg-emerald-500" },
  { id: "reserved", label: "Reserved", tone: "bg-amber-500" },
  { id: "sold", label: "Sold", tone: "bg-zinc-400" },
];

type View = "grid" | "list";

export default function InventoryAdmin() {
  const cars = useStore((s) => s.cars);
  const updateCar = useStore((s) => s.updateCar);
  const deleteCar = useStore((s) => s.deleteCar);
  const toast = useToast();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | CarStatus>("");
  const [body, setBody] = useState("");
  const [cond, setCond] = useState("");
  const [view, setView] = useState<View>("grid");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return cars.filter(
      (c) =>
        (!s || carName(c).toLowerCase().includes(s)) &&
        (!status || c.status === status) &&
        (!body || c.bodyType === body) &&
        (!cond || c.condition === cond)
    );
  }, [cars, q, status, body, cond]);

  const totalValue = cars.filter((c) => c.status !== "sold").reduce((a, c) => a + c.price, 0);

  function cycleStatus(id: string, cur: CarStatus) {
    const next = STATUS[(STATUS.findIndex((s) => s.id === cur) + 1) % STATUS.length].id;
    updateCar(id, { status: next });
    toast(`Marked as ${next}`);
  }

  function remove(id: string, name: string) {
    if (confirm(`Delete ${name} from inventory? This cannot be undone.`)) {
      deleteCar(id);
      toast("Car deleted");
    }
  }

  return (
    <AdminPage
      eyebrow={`Stock value · ${formatPrice(totalValue)}`}
      title="Inventory"
      italic={`· ${cars.length} cars`}
      actions={
        <Link href="/admin/inventory/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-medium text-white">
          <Plus className="size-4" /> Add car
        </Link>
      }
    >
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs<"" | CarStatus>
          id="inv-status"
          value={status}
          onChange={setStatus}
          tabs={[{ id: "", label: `All (${cars.length})` }, ...STATUS.map((s) => ({ id: s.id, label: `${s.label} (${cars.filter((c) => c.status === s.id).length})` }))]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search make or model…" className="lg:w-64" />
        <div className="flex min-w-0 gap-2 [&>select]:min-w-0 [&>select]:flex-1 lg:[&>select]:flex-none">
          <Select className="!w-auto !rounded-full" value={body} onChange={(e) => setBody(e.target.value)} options={[{ value: "", label: "All bodies" }, ...["SUV", "Sedan", "Coupe", "Supercar", "Convertible", "Hatchback"]]} />
          <Select className="!w-auto !rounded-full" value={cond} onChange={(e) => setCond(e.target.value)} options={[{ value: "", label: "Any condition" }, "New", "Certified Pre-Owned", "Pre-Owned"]} />
          <div className="ml-auto flex rounded-full border border-line bg-white p-1 lg:ml-0">
            {(["grid", "list"] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} aria-label={v} className={cn("grid size-8 place-items-center rounded-full", view === v ? "bg-ink text-white" : "text-muted")}>
                {v === "grid" ? <LayoutGrid className="size-4" /> : <List className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white/80">
          <Empty icon={<CarFront className="size-6" />} title="No cars match" text="Adjust filters or add a new car to inventory." />
        </div>
      ) : view === "grid" ? (
        <motion.div layout className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {list.map((c) => {
              const st = STATUS.find((s) => s.id === c.status)!;
              return (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="group overflow-hidden rounded-3xl border border-line bg-white"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={c.images[0]} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      onClick={() => cycleStatus(c.id, c.status)}
                      className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium backdrop-blur"
                      title="Click to change status"
                    >
                      <span className={cn("size-2 rounded-full", st.tone)} /> {st.label}
                    </button>
                    <button
                      onClick={() => {
                        updateCar(c.id, { featured: !c.featured });
                        toast(c.featured ? "Removed from featured" : "Featured on homepage");
                      }}
                      title="Toggle featured"
                      className={cn("absolute right-3 top-3 grid size-9 place-items-center rounded-full backdrop-blur", c.featured ? "bg-accent text-accent-ink" : "bg-white/90 text-ink")}
                    >
                      <Star className={cn("size-4", c.featured && "fill-current")} />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                      <span className="flex items-center gap-1 font-mono text-[11px]"><Eye className="size-3.5" /> {formatNumber(c.views)}</span>
                      <span className="text-[17px] font-semibold">{formatPrice(c.price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold tracking-tight">{c.brand} {c.model}</p>
                      <p className="truncate text-[12.5px] text-muted">{c.variant} · {c.year} · {c.condition}</p>
                    </div>
                    <Link href={`/admin/inventory/${c.id}`} className="grid size-9 place-items-center rounded-full border border-line hover:bg-paper" aria-label="Edit">
                      <Pencil className="size-4" />
                    </Link>
                    <button onClick={() => remove(c.id, carName(c))} className="grid size-9 place-items-center rounded-full border border-line text-red-600 hover:bg-red-50" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-line bg-white/80">
          <ul className="divide-y divide-line">
            {list.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3 md:gap-4 md:px-5">
                <img src={c.images[0]} alt="" className="h-12 w-16 shrink-0 rounded-xl object-cover md:w-20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{carName(c)}</p>
                  <p className="truncate text-[12px] text-muted">{c.year} · {c.bodyType} · {c.fuel} · {c.condition}</p>
                </div>
                <span className="hidden font-mono text-[12px] text-muted md:block"><Eye className="mr-1 inline size-3.5" />{formatNumber(c.views)}</span>
                <span className="hidden w-24 text-right text-[14px] font-semibold sm:block">{formatPrice(c.price)}</span>
                <select
                  value={c.status}
                  onChange={(e) => {
                    updateCar(c.id, { status: e.target.value as CarStatus });
                    toast(`Marked as ${e.target.value}`);
                  }}
                  className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px]"
                >
                  {STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <button onClick={() => updateCar(c.id, { featured: !c.featured })} className={cn("hidden size-8 place-items-center rounded-full sm:grid", c.featured ? "text-accent" : "text-muted")} aria-label="Featured">
                  <Star className={cn("size-4", c.featured && "fill-current")} />
                </button>
                <Link href={`/admin/inventory/${c.id}`} className="grid size-8 place-items-center rounded-full hover:bg-paper" aria-label="Edit"><Pencil className="size-4" /></Link>
                <Btn variant="plain" className="!size-8 !p-0 text-red-600" onClick={() => remove(c.id, carName(c))}><Trash2 className="size-4" /></Btn>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminPage>
  );
}
