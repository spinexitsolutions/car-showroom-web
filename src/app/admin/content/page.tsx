"use client";

import { useState } from "react";
import { Reorder, motion } from "framer-motion";
import { ExternalLink, GripVertical, Play, Plus, Trash2, X } from "lucide-react";
import { AdminPage, Btn, Card, Field, Label, Tabs, TextArea, Toggle } from "@/components/admin/ui";
import { SaveBar, useSettingsDraft } from "@/components/admin/settings-draft";
import { cn } from "@/lib/utils";

type Tab = "hero" | "intro" | "sections" | "story" | "brands" | "announcement";

export default function ContentPage() {
  const { draft, patch, save, reset, dirty } = useSettingsDraft();
  const [tab, setTab] = useState<Tab>("hero");
  const [brand, setBrand] = useState("");
  const h = draft.hero;
  const intro = draft.intro;

  return (
    <AdminPage eyebrow="CMS" title="Website" italic="content">
      <Tabs<Tab>
        id="cms"
        className="mb-6"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "hero", label: "Hero" },
          { id: "intro", label: "Intro animation" },
          { id: "sections", label: "Homepage sections" },
          { id: "story", label: "Manifesto & stats" },
          { id: "brands", label: "Brands" },
          { id: "announcement", label: "Announcement" },
        ]}
      />

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === "hero" && (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <Card title="Hero copy">
              <div className="space-y-3.5">
                <Field label="Eyebrow" value={h.eyebrow} onChange={(e) => patch("hero", { ...h, eyebrow: e.target.value })} />
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Title · line 1" value={h.titleLine1} onChange={(e) => patch("hero", { ...h, titleLine1: e.target.value })} />
                  <Field label="Title · line 2 (italic)" value={h.titleLine2} onChange={(e) => patch("hero", { ...h, titleLine2: e.target.value })} />
                </div>
                <TextArea label="Subtitle" rows={3} value={h.subtitle} onChange={(e) => patch("hero", { ...h, subtitle: e.target.value })} />
                <Field label="Background image URL" value={h.image} onChange={(e) => patch("hero", { ...h, image: e.target.value })} />
                <div className="grid gap-3.5 sm:grid-cols-2">
                  <Field label="Primary button" value={h.ctaPrimary} onChange={(e) => patch("hero", { ...h, ctaPrimary: e.target.value })} />
                  <Field label="Secondary button" value={h.ctaSecondary} onChange={(e) => patch("hero", { ...h, ctaSecondary: e.target.value })} />
                </div>
              </div>
            </Card>
            <Card title="Preview" action={<a href="/" target="_blank" className="eyebrow inline-flex items-center gap-1 !text-[10px] text-muted">Open site <ExternalLink className="size-3" /></a>}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink sm:aspect-[16/11]">
                {h.image && <img src={h.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <p className="eyebrow !text-[9px] text-white/60">{h.eyebrow}</p>
                  <p className="display mt-2 text-4xl sm:text-5xl">
                    {h.titleLine1} <span className="em-light">{h.titleLine2}</span>
                  </p>
                  <p className="mt-3 line-clamp-2 max-w-sm text-[12px] text-white/60">{h.subtitle}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="chamfer chamfer-sm bg-white px-3 py-1.5 text-[11px] font-medium text-ink">{h.ctaPrimary}</span>
                    <span className="chamfer chamfer-sm border border-white/30 px-3 py-1.5 text-[11px] font-medium">{h.ctaSecondary}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "intro" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Intro animation">
              <div className="space-y-4">
                <Toggle checked={intro.enabled} onChange={(v) => patch("intro", { ...intro, enabled: v })} label="Show intro animation" description="Full-screen brand reveal when visitors land on the site." />
                <Toggle checked={intro.oncePerSession} onChange={(v) => patch("intro", { ...intro, oncePerSession: v })} label="Only once per session" description="Returning within the same tab skips the intro." />
                <Field label="Intro title" value={intro.title} onChange={(e) => patch("intro", { ...intro, title: e.target.value })} />
                <Field label="Intro subtitle" value={intro.subtitle} onChange={(e) => patch("intro", { ...intro, subtitle: e.target.value })} />
                <div>
                  <div className="flex items-baseline justify-between">
                    <Label>Duration</Label>
                    <span className="font-mono text-[12px]">{(intro.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    className="range"
                    min={1200}
                    max={5000}
                    step={100}
                    value={intro.durationMs}
                    style={{ ["--p" as string]: `${((intro.durationMs - 1200) / 3800) * 100}%` }}
                    onChange={(e) => patch("intro", { ...intro, durationMs: Number(e.target.value) })}
                  />
                </div>
                <Btn
                  variant="ink"
                  onClick={() => {
                    if (dirty) save("Intro animation");
                    try {
                      sessionStorage.removeItem("orbis-intro-seen");
                    } catch {}
                    window.open("/", "_blank");
                  }}
                >
                  <Play className="size-4" /> Preview intro
                </Btn>
              </div>
            </Card>
            <Card title="Mock">
              <div className={cn("relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-ink text-white transition-opacity", !intro.enabled && "opacity-30")}>
                <motion.div
                  key={intro.title + intro.durationMs}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: Math.min(intro.durationMs / 2500, 1.4), ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <p className="display text-5xl tracking-[-0.06em] sm:text-6xl">{intro.title}</p>
                  <p className="eyebrow mt-3 !text-[10px] text-white/50">{intro.subtitle}</p>
                </motion.div>
                <motion.div
                  key={"bar" + intro.durationMs}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: intro.durationMs / 1000, ease: "linear" }}
                  className="absolute inset-x-0 bottom-0 h-1 origin-left bg-accent"
                />
              </div>
              {!intro.enabled && <p className="mt-3 text-center text-[12px] text-muted">Intro is disabled — visitors land straight on the homepage.</p>}
            </Card>
          </div>
        )}

        {tab === "sections" && (
          <Card title="Homepage sections" action={<span className="eyebrow !text-[10px] text-muted">Drag to reorder</span>}>
            <Reorder.Group axis="y" values={draft.sections} onReorder={(v) => patch("sections", v)} className="space-y-2">
              {draft.sections.map((s, i) => (
                <Reorder.Item key={s.id} value={s} className={cn("flex cursor-grab items-center gap-3 chamfer chamfer-sm border border-line bg-white px-3 py-3 active:cursor-grabbing", !s.enabled && "opacity-55")}>
                  <GripVertical className="size-4 shrink-0 text-muted" />
                  <span className="w-6 font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 truncate text-[14px] font-medium">{s.label}</span>
                  <div className="flex items-center gap-1">
                    <button disabled={i === 0} onClick={() => { const a = [...draft.sections]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; patch("sections", a); }} className="hidden size-8 place-items-center rounded-full text-muted hover:bg-paper disabled:opacity-30 sm:grid" aria-label="Move up">↑</button>
                    <button disabled={i === draft.sections.length - 1} onClick={() => { const a = [...draft.sections]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; patch("sections", a); }} className="hidden size-8 place-items-center rounded-full text-muted hover:bg-paper disabled:opacity-30 sm:grid" aria-label="Move down">↓</button>
                    <Toggle checked={s.enabled} onChange={(v) => patch("sections", draft.sections.map((x) => (x.id === s.id ? { ...x, enabled: v } : x)))} />
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </Card>
        )}

        {tab === "story" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card title="Manifesto (scroll reveal text)">
              <TextArea label="Text" rows={6} value={draft.manifesto} onChange={(e) => patch("manifesto", e.target.value)} />
              <p className="mt-2 text-[12px] text-muted">Each word lights up as the visitor scrolls.</p>
            </Card>
            <Card title="Stats">
              <div className="space-y-2">
                {draft.stats.map((s, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_60px_auto] items-end gap-2">
                    <Field label={i === 0 ? "Label" : ""} value={s.label} onChange={(e) => patch("stats", draft.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                    <Field label={i === 0 ? "Value" : ""} type="number" step="0.1" value={s.value} onChange={(e) => patch("stats", draft.stats.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) } : x)))} />
                    <Field label={i === 0 ? "Suffix" : ""} value={s.suffix} onChange={(e) => patch("stats", draft.stats.map((x, j) => (j === i ? { ...x, suffix: e.target.value } : x)))} />
                    <button onClick={() => patch("stats", draft.stats.filter((_, j) => j !== i))} className="grid size-11 place-items-center rounded-full hover:bg-red-50 hover:text-red-600" aria-label="Remove stat">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <Btn className="mt-3" onClick={() => patch("stats", [...draft.stats, { label: "New stat", value: 10, suffix: "+" }])}>
                <Plus className="size-4" /> Add stat
              </Btn>
            </Card>
          </div>
        )}

        {tab === "brands" && (
          <Card title={`Brand marquee · ${draft.brands.length}`}>
            <Reorder.Group axis="x" values={draft.brands} onReorder={(v) => patch("brands", v)} className="flex flex-wrap gap-2">
              {draft.brands.map((b) => (
                <Reorder.Item key={b} value={b} className="inline-flex cursor-grab items-center gap-2 rounded-full border border-line bg-white py-2 pl-4 pr-2 text-[14px] font-medium">
                  {b}
                  <button onClick={() => patch("brands", draft.brands.filter((x) => x !== b))} className="grid size-6 place-items-center rounded-full hover:bg-ink/10" aria-label={`Remove ${b}`}>
                    <X className="size-3.5" />
                  </button>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (brand.trim() && !draft.brands.includes(brand.trim())) patch("brands", [...draft.brands, brand.trim()]);
                setBrand("");
              }}
            >
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Add a brand…" className="field !rounded-full !py-2.5 text-[14px]" />
              <Btn type="submit" variant="ink" className="shrink-0"><Plus className="size-4" /> Add</Btn>
            </form>
            <div className="relative mt-6 overflow-hidden chamfer chamfer-sm bg-ink py-5 text-white">
              <div className="flex w-max animate-marquee gap-10 whitespace-nowrap" style={{ ["--marquee-duration" as string]: "25s" }}>
                {[...draft.brands, ...draft.brands].map((b, i) => (
                  <span key={i} className="text-2xl font-semibold tracking-tight">
                    {b} <span className="em-light text-accent">✦</span>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        )}

        {tab === "announcement" && (
          <Card title="Announcement bar">
            <div className="space-y-4">
              <Toggle checked={draft.announcement.enabled} onChange={(v) => patch("announcement", { ...draft.announcement, enabled: v })} label="Show announcement" description="A slim bar above the navigation on every page." />
              <Field label="Text" value={draft.announcement.text} onChange={(e) => patch("announcement", { ...draft.announcement, text: e.target.value })} />
              <Field label="Link" value={draft.announcement.link} onChange={(e) => patch("announcement", { ...draft.announcement, link: e.target.value })} placeholder="/inventory" />
              <div className={cn("flex items-center justify-center gap-2 chamfer chamfer-sm bg-ink px-4 py-2.5 text-center text-[12.5px] text-white", !draft.announcement.enabled && "opacity-30")}>
                <span className="size-1.5 rounded-full bg-accent" /> {draft.announcement.text} <span className="underline underline-offset-2">→</span>
              </div>
            </div>
          </Card>
        )}
      </motion.div>

      <SaveBar dirty={dirty} onSave={() => save()} onReset={reset} />
    </AdminPage>
  );
}
