"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Reorder } from "framer-motion";
import { ArrowLeft, ExternalLink, GripVertical, Plus, Save, Trash2, X } from "lucide-react";
import type { BodyType, Car, CarStatus, Condition, Fuel, Transmission } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, formatPrice, slugify } from "@/lib/utils";
import { CarCard } from "@/components/site/car-card";
import { AdminPage, Btn, Card, Field, Label, Select, TextArea, Toggle } from "./ui";
import { useToast } from "./toast";

export type CarDraft = Omit<Car, "id" | "createdAt" | "views">;

export const emptyCar: CarDraft = {
  slug: "",
  brand: "",
  model: "",
  variant: "",
  year: new Date().getFullYear(),
  price: 5000000,
  bodyType: "Sedan",
  fuel: "Petrol",
  transmission: "Automatic",
  condition: "New",
  kmDriven: 0,
  engine: "",
  power: "",
  torque: "",
  topSpeed: "",
  acceleration: "",
  range: "",
  seats: 5,
  colors: [{ name: "Jet Black", hex: "#111111" }],
  images: [],
  tagline: "",
  description: "",
  features: [],
  status: "available",
  featured: false,
  badge: "",
};

export function CarEditor({ car }: { car?: Car }) {
  const router = useRouter();
  const addCar = useStore((s) => s.addCar);
  const updateCar = useStore((s) => s.updateCar);
  const deleteCar = useStore((s) => s.deleteCar);
  const logActivity = useStore((s) => s.logActivity);
  const toast = useToast();

  const [d, setD] = useState<CarDraft>(() => {
    if (!car) return emptyCar;
    const { id: _id, createdAt: _c, views: _v, ...rest } = car;
    void _id; void _c; void _v;
    return rest;
  });
  const [slugTouched, setSlugTouched] = useState(!!car);
  const [imgUrl, setImgUrl] = useState("");
  const [feature, setFeature] = useState("");

  const set = <K extends keyof CarDraft>(k: K, v: CarDraft[K]) =>
    setD((prev) => {
      const next = { ...prev, [k]: v };
      if (!slugTouched && (k === "brand" || k === "model" || k === "variant"))
        next.slug = slugify(`${next.brand} ${next.model} ${next.variant}`);
      return next;
    });

  function save() {
    if (!d.brand || !d.model) return toast("Brand and model are required", "error");
    if (!d.images.length) return toast("Add at least one image", "error");
    const payload = { ...d, slug: d.slug || slugify(`${d.brand} ${d.model} ${d.variant}`) };
    if (car) {
      updateCar(car.id, payload);
      logActivity(`${d.brand} ${d.model} updated`, "car");
      toast("Changes saved · live on site");
    } else {
      const id = addCar(payload);
      toast("Car published to inventory");
      router.replace(`/admin/inventory/${id}`);
    }
  }

  const preview: Car = { ...d, id: car?.id ?? "preview", createdAt: car?.createdAt ?? "", views: car?.views ?? 0, images: d.images.length ? d.images : ["https://images.unsplash.com/photo-1485291571150-772bcfc10da5?auto=format&fit=crop&w=1200&q=80"], brand: d.brand || "Brand", model: d.model || "Model" };

  return (
    <AdminPage
      eyebrow={car ? "Inventory · Edit" : "Inventory · New"}
      title={car ? `${car.brand} ${car.model}` : "Add a"}
      italic={car ? car.variant : "new car"}
      actions={
        <>
          <Link href="/admin/inventory" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium hover:bg-paper">
            <ArrowLeft className="size-4" /> Back
          </Link>
          {car && (
            <Link href={`/inventory/${car.slug}`} target="_blank" className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium hover:bg-paper">
              View <ExternalLink className="size-3.5" />
            </Link>
          )}
          <Btn variant="ink" onClick={save}>
            <Save className="size-4" /> {car ? "Save changes" : "Publish car"}
          </Btn>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card title="Basics">
            <div className="grid gap-3.5 sm:grid-cols-3">
              <Field label="Brand" value={d.brand} onChange={(e) => set("brand", e.target.value)} placeholder="Porsche" />
              <Field label="Model" value={d.model} onChange={(e) => set("model", e.target.value)} placeholder="911" />
              <Field label="Variant" value={d.variant} onChange={(e) => set("variant", e.target.value)} placeholder="Turbo S" />
              <Field label="Year" type="number" value={d.year} onChange={(e) => set("year", Number(e.target.value))} />
              <Field label="Price (₹)" type="number" value={d.price} onChange={(e) => set("price", Number(e.target.value))} hint={formatPrice(d.price)} />
              <Field label="Badge" value={d.badge ?? ""} onChange={(e) => set("badge", e.target.value)} placeholder="Limited" />
              <Field
                className="sm:col-span-3"
                label="URL slug"
                value={d.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
                hint={`/inventory/${d.slug || "…"}`}
              />
              <Field className="sm:col-span-3" label="Tagline" value={d.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="The benchmark, perfected." />
              <TextArea className="sm:col-span-3" label="Description" rows={4} value={d.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </Card>

          <Card title="Classification">
            <div className="grid gap-3.5 sm:grid-cols-3">
              <Select label="Body type" value={d.bodyType} onChange={(e) => set("bodyType", e.target.value as BodyType)} options={["SUV", "Sedan", "Coupe", "Supercar", "Convertible", "Hatchback"]} />
              <Select label="Fuel" value={d.fuel} onChange={(e) => set("fuel", e.target.value as Fuel)} options={["Petrol", "Diesel", "Electric", "Hybrid"]} />
              <Select label="Transmission" value={d.transmission} onChange={(e) => set("transmission", e.target.value as Transmission)} options={["Automatic", "Manual"]} />
              <Select label="Condition" value={d.condition} onChange={(e) => set("condition", e.target.value as Condition)} options={["New", "Certified Pre-Owned", "Pre-Owned"]} />
              <Field label="KM driven" type="number" value={d.kmDriven} onChange={(e) => set("kmDriven", Number(e.target.value))} />
              <Field label="Seats" type="number" value={d.seats} onChange={(e) => set("seats", Number(e.target.value))} />
            </div>
          </Card>

          <Card title="Performance & specs">
            <div className="grid gap-3.5 sm:grid-cols-3">
              <Field className="sm:col-span-3" label="Engine" value={d.engine} onChange={(e) => set("engine", e.target.value)} placeholder="3.7L Twin-Turbo Flat-6" />
              <Field label="Power" value={d.power} onChange={(e) => set("power", e.target.value)} placeholder="650 hp" />
              <Field label="Torque" value={d.torque} onChange={(e) => set("torque", e.target.value)} placeholder="800 Nm" />
              <Field label="0–100 km/h" value={d.acceleration} onChange={(e) => set("acceleration", e.target.value)} placeholder="2.7 s" />
              <Field label="Top speed" value={d.topSpeed} onChange={(e) => set("topSpeed", e.target.value)} placeholder="330 km/h" />
              <Field label="Range / efficiency" value={d.range ?? ""} onChange={(e) => set("range", e.target.value)} placeholder="8.5 km/l" />
            </div>
          </Card>

          <Card title={`Gallery · ${d.images.length}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!imgUrl.trim()) return;
                set("images", [...d.images, imgUrl.trim()]);
                setImgUrl("");
              }}
              className="flex gap-2"
            >
              <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="Paste image URL (Unsplash, CDN…)" className="field !rounded-full !py-2.5 text-[14px]" />
              <Btn type="submit" variant="ink" className="shrink-0"><Plus className="size-4" /> Add</Btn>
            </form>
            {d.images.length > 0 && (
              <Reorder.Group axis="y" values={d.images} onReorder={(v) => set("images", v)} className="mt-4 space-y-2">
                {d.images.map((src, i) => (
                  <Reorder.Item key={src} value={src} className="flex cursor-grab items-center gap-3 rounded-2xl border border-line bg-white p-2 pr-3 active:cursor-grabbing">
                    <GripVertical className="size-4 shrink-0 text-muted" />
                    <img src={src} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted">{src}</span>
                    {i === 0 && <span className="eyebrow rounded-full bg-accent/10 px-2 py-0.5 !text-[9.5px] text-accent">Cover</span>}
                    <button onClick={() => set("images", d.images.filter((x) => x !== src))} className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-red-50 hover:text-red-600" aria-label="Remove image">
                      <X className="size-4" />
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
            <p className="mt-3 text-[12px] text-muted">Drag to reorder. The first image is the cover.</p>
          </Card>

          <Card title="Colours">
            <div className="space-y-2">
              {d.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="color" value={c.hex} onChange={(e) => set("colors", d.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} className="size-11 shrink-0 cursor-pointer rounded-xl border border-line bg-white p-1" />
                  <input value={c.name} onChange={(e) => set("colors", d.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="field !py-2.5 text-[14px]" placeholder="Colour name" />
                  <button onClick={() => set("colors", d.colors.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-red-50 hover:text-red-600" aria-label="Remove colour">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <Btn className="mt-3" onClick={() => set("colors", [...d.colors, { name: "New colour", hex: "#888888" }])}>
              <Plus className="size-4" /> Add colour
            </Btn>
          </Card>

          <Card title={`Features · ${d.features.length}`}>
            <div className="flex flex-wrap gap-2">
              {d.features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 rounded-full bg-paper py-1.5 pl-3 pr-1.5 text-[13px]">
                  {f}
                  <button onClick={() => set("features", d.features.filter((x) => x !== f))} className="grid size-5 place-items-center rounded-full hover:bg-ink/10" aria-label={`Remove ${f}`}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={feature}
              onChange={(e) => setFeature(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && feature.trim()) {
                  e.preventDefault();
                  if (!d.features.includes(feature.trim())) set("features", [...d.features, feature.trim()]);
                  setFeature("");
                }
              }}
              placeholder="Type a feature and press Enter"
              className="field mt-3 !py-2.5 text-[14px]"
            />
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card title="Publishing">
            <div className="space-y-4">
              <div>
                <Label>Status</Label>
                <div className="grid grid-cols-3 gap-1 rounded-2xl bg-paper p-1">
                  {(["available", "reserved", "sold"] as CarStatus[]).map((s) => (
                    <button key={s} onClick={() => set("status", s)} className={cn("rounded-xl py-2 text-[12.5px] font-medium capitalize transition", d.status === s ? "bg-white shadow-sm" : "text-muted")}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label="Featured on homepage" description="Shows in the pinned horizontal collection." />
            </div>
          </Card>
          <Card title="Live preview">
            <div className="pointer-events-none">
              <CarCard car={preview} />
            </div>
          </Card>
          {car && (
            <Btn
              variant="danger"
              className="w-full"
              onClick={() => {
                if (confirm("Delete this car permanently?")) {
                  deleteCar(car.id);
                  toast("Car deleted");
                  router.push("/admin/inventory");
                }
              }}
            >
              <Trash2 className="size-4" /> Delete car
            </Btn>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
