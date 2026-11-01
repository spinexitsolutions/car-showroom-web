"use client";

import { Check, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AdminPage, Avatar, Btn, Card, Field, Label, Toggle } from "@/components/admin/ui";
import { SaveBar, useSettingsDraft } from "@/components/admin/settings-draft";
import { ACCENT_PRESETS } from "@/components/admin/constants";
import { useToast } from "@/components/admin/toast";

export default function SettingsPage() {
  const { draft, patch, save, reset, dirty, setDraft } = useSettingsDraft();
  const staff = useStore((s) => s.staff);
  const resetDemo = useStore((s) => s.resetDemo);
  const updateSettings = useStore((s) => s.updateSettings);
  const toast = useToast();

  const setAccent = (hex: string) => {
    patch("accent", hex);
    updateSettings({ accent: hex }); // live preview
  };

  return (
    <AdminPage eyebrow="System" title="Settings">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Brand">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Brand name" value={draft.brandName} onChange={(e) => patch("brandName", e.target.value)} />
            <Field label="Short name (logo)" value={draft.brandShort} onChange={(e) => patch("brandShort", e.target.value)} />
            <Field className="sm:col-span-2" label="Tagline" value={draft.tagline} onChange={(e) => patch("tagline", e.target.value)} />
            <div className="sm:col-span-2">
              <Label>Accent colour</Label>
              <div className="flex flex-wrap items-center gap-2.5">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    aria-label={c}
                    style={{ background: c }}
                    className={cn("grid size-10 place-items-center rounded-full ring-offset-2 ring-offset-white transition", draft.accent.toLowerCase() === c && "ring-2 ring-ink")}
                  >
                    {draft.accent.toLowerCase() === c && <Check className="size-4 text-white" strokeWidth={3} />}
                  </button>
                ))}
                <label className="relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-ink/30 text-[11px] text-muted">
                  +
                  <input type="color" value={draft.accent} onChange={(e) => setAccent(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
                </label>
                <span className="ml-1 font-mono text-[12px] text-muted">{draft.accent}</span>
              </div>
              <p className="mt-2 text-[12px] text-muted">Applies instantly across the website and admin.</p>
            </div>
          </div>
        </Card>

        <Card title="Contact & showroom">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <Field label="Phone" value={draft.phone} onChange={(e) => patch("phone", e.target.value)} />
            <Field label="WhatsApp (digits)" value={draft.whatsapp} onChange={(e) => patch("whatsapp", e.target.value.replace(/\D/g, ""))} />
            <Field className="sm:col-span-2" label="Email" value={draft.email} onChange={(e) => patch("email", e.target.value)} />
            <Field className="sm:col-span-2" label="Address" value={draft.address} onChange={(e) => patch("address", e.target.value)} />
            <Field label="Opening hours" value={draft.hours} onChange={(e) => patch("hours", e.target.value)} />
            <Field label="Map search query" value={draft.mapQuery} onChange={(e) => patch("mapQuery", e.target.value)} />
          </div>
        </Card>

        <Card title="Social links">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {(Object.keys(draft.socials) as (keyof typeof draft.socials)[]).map((k) => (
              <Field key={k} label={k === "x" ? "X / Twitter" : k} value={draft.socials[k]} onChange={(e) => patch("socials", { ...draft.socials, [k]: e.target.value })} />
            ))}
          </div>
        </Card>

        <Card title="Finance defaults">
          <div className="grid gap-3.5 sm:grid-cols-3">
            <Field label="Interest rate %" type="number" step="0.05" value={draft.finance.interestRate} onChange={(e) => patch("finance", { ...draft.finance, interestRate: Number(e.target.value) })} />
            <Field label="Max tenure (yrs)" type="number" value={draft.finance.maxTenureYears} onChange={(e) => patch("finance", { ...draft.finance, maxTenureYears: Number(e.target.value) })} />
            <Field label="Min down %" type="number" value={draft.finance.minDownPct} onChange={(e) => patch("finance", { ...draft.finance, minDownPct: Number(e.target.value) })} />
          </div>
          <p className="mt-3 text-[12px] text-muted">Used by every EMI calculator on the website.</p>
        </Card>

        <Card title="SEO">
          <div className="space-y-3.5">
            <Field label="Meta title" value={draft.seo.title} onChange={(e) => patch("seo", { ...draft.seo, title: e.target.value })} hint={`${draft.seo.title.length}/60`} />
            <label className="block">
              <Label>Meta description</Label>
              <textarea rows={3} value={draft.seo.description} onChange={(e) => patch("seo", { ...draft.seo, description: e.target.value })} className="field resize-none !py-2.5 text-[14px]" />
              <span className="mt-1 block text-[12px] text-muted">{draft.seo.description.length}/160</span>
            </label>
            <div className="rounded-2xl bg-white p-4">
              <p className="truncate text-[12px] text-emerald-700">orbismotors.in</p>
              <p className="truncate text-[17px] text-[#1a0dab]">{draft.seo.title}</p>
              <p className="line-clamp-2 text-[13px] text-muted">{draft.seo.description}</p>
            </div>
          </div>
        </Card>

        <Card title="Experience">
          <div className="divide-y divide-line">
            <div className="pb-3"><Toggle checked={draft.pageTransitions} onChange={(v) => patch("pageTransitions", v)} label="Page transitions" description="Animated curtain between pages." /></div>
            <div className="py-3"><Toggle checked={draft.customCursor} onChange={(v) => patch("customCursor", v)} label="Custom cursor" description="Magnetic cursor on desktop devices." /></div>
            <div className="pt-3"><Toggle checked={draft.smoothScroll} onChange={(v) => patch("smoothScroll", v)} label="Smooth scrolling" description="Inertia scrolling powered by Lenis." /></div>
          </div>
        </Card>

        <Card title="Team">
          <ul className="space-y-3">
            {staff.map((s) => (
              <li key={s.id} className="flex items-center gap-3">
                <Avatar name={s.name} src={s.avatar} size={40} />
                <div>
                  <p className="text-[14px] font-medium">{s.name}</p>
                  <p className="text-[12px] text-muted">{s.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={<span className="text-red-600">Danger zone</span>} className="border-red-500/20">
          <p className="text-[14px] text-ink/80">Reset all inventory, leads, content and settings back to the original demo data.</p>
          <Btn
            variant="danger"
            className="mt-4"
            onClick={() => {
              if (confirm("Reset ALL demo data? Every change you made will be lost.")) {
                resetDemo();
                setDraft(useStore.getState().settings);
                toast("Demo data restored");
              }
            }}
          >
            <RotateCcw className="size-4" /> Reset demo data
          </Btn>
        </Card>
      </div>

      <SaveBar dirty={dirty} onSave={() => save("Site settings")} onReset={reset} />
    </AdminPage>
  );
}
