"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, Reorder, motion } from "framer-motion";
import { ChevronDown, HelpCircle, MessageSquareQuote, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { Faq, Testimonial } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cn, uid } from "@/lib/utils";
import { AdminPage, Avatar, Btn, Drawer, Empty, Field, Label, TextArea } from "./ui";
import { useToast } from "./toast";

function SubNav({ active }: { active: "testimonials" | "faqs" }) {
  return (
    <div className="mb-6 inline-flex gap-1 rounded-full border border-line bg-white p-1">
      {(["testimonials", "faqs"] as const).map((t) => (
        <Link
          key={t}
          href={`/admin/${t}`}
          className={cn("relative chamfer chamfer-sm px-4 py-2 text-[13px] font-medium", active === t ? "text-white" : "text-muted hover:text-ink")}
        >
          {active === t && <motion.span layoutId="rf-pill" className="absolute inset-0 rounded-full bg-ink" />}
          <span className="relative">{t === "faqs" ? "FAQs" : "Testimonials"}</span>
        </Link>
      ))}
    </div>
  );
}

export function TestimonialsManager() {
  const items = useStore((s) => s.testimonials);
  const upsert = useStore((s) => s.upsertTestimonial);
  const del = useStore((s) => s.deleteTestimonial);
  const toast = useToast();
  const [edit, setEdit] = useState<Testimonial | null>(null);

  return (
    <AdminPage
      eyebrow="CMS"
      title="Reviews &"
      italic="FAQ"
      actions={
        <Btn variant="ink" onClick={() => setEdit({ id: uid(), name: "", role: "", car: "", quote: "", avatar: "", rating: 5 })}>
          <Plus className="size-4" /> Add testimonial
        </Btn>
      }
    >
      <SubNav active="testimonials" />
      {items.length === 0 ? (
        <div className="chamfer border border-line bg-white/80">
          <Empty icon={<MessageSquareQuote className="size-6" />} title="No testimonials" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence>
            {items.map((t) => (
              <motion.figure key={t.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} className="flex flex-col chamfer border border-line bg-white p-6">
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={cn("size-4", i < t.rating ? "fill-current" : "opacity-25")} />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[16px] leading-relaxed tracking-tight">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name || "?"} src={t.avatar || undefined} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{t.name}</p>
                    <p className="truncate text-[12px] text-muted">{t.role} · <span className="em-light text-[13px]">{t.car}</span></p>
                  </div>
                  <button onClick={() => setEdit(t)} className="grid size-9 place-items-center rounded-full border border-line hover:bg-paper" aria-label="Edit"><Pencil className="size-4" /></button>
                  <button onClick={() => { if (confirm("Delete testimonial?")) { del(t.id); toast("Testimonial deleted"); } }} className="grid size-9 place-items-center rounded-full text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="size-4" /></button>
                </figcaption>
              </motion.figure>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Testimonial"
        footer={
          <Btn
            variant="ink"
            className="w-full"
            onClick={() => {
              if (!edit?.name || !edit.quote) return toast("Name and quote are required", "error");
              upsert(edit);
              toast("Testimonial saved");
              setEdit(null);
            }}
          >
            Save
          </Btn>
        }
      >
        {edit && (
          <div className="space-y-3.5">
            <Field label="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
            <div className="grid gap-3.5 sm:grid-cols-2">
              <Field label="Role / company" value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })} />
              <Field label="Car purchased" value={edit.car} onChange={(e) => setEdit({ ...edit, car: e.target.value })} />
            </div>
            <Field label="Avatar URL" value={edit.avatar} onChange={(e) => setEdit({ ...edit, avatar: e.target.value })} />
            <TextArea label="Quote" rows={5} value={edit.quote} onChange={(e) => setEdit({ ...edit, quote: e.target.value })} />
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setEdit({ ...edit, rating: n })} className="text-accent" aria-label={`${n} stars`}>
                    <Star className={cn("size-7", n <= edit.rating ? "fill-current" : "opacity-25")} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </AdminPage>
  );
}

export function FaqManager() {
  const faqs = useStore((s) => s.faqs);
  const upsert = useStore((s) => s.upsertFaq);
  const del = useStore((s) => s.deleteFaq);
  const toast = useToast();
  const [edit, setEdit] = useState<Faq | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <AdminPage
      eyebrow="CMS"
      title="Reviews &"
      italic="FAQ"
      actions={
        <Btn variant="ink" onClick={() => setEdit({ id: uid(), q: "", a: "" })}>
          <Plus className="size-4" /> Add question
        </Btn>
      }
    >
      <SubNav active="faqs" />
      {faqs.length === 0 ? (
        <div className="chamfer border border-line bg-white/80">
          <Empty icon={<HelpCircle className="size-6" />} title="No FAQs yet" />
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={faqs}
          onReorder={(v) => useStore.setState({ faqs: v })}
          className="space-y-2"
        >
          {faqs.map((f, i) => (
            <Reorder.Item key={f.id} value={f} className="cursor-grab overflow-hidden rounded-2xl border border-line bg-white active:cursor-grabbing">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, "0")}</span>
                <button onClick={() => setOpen(open === f.id ? null : f.id)} className="flex flex-1 items-center justify-between gap-3 text-left">
                  <span className="text-[14.5px] font-medium">{f.q}</span>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", open === f.id && "rotate-180")} />
                </button>
                <button onClick={() => setEdit(f)} className="grid size-8 place-items-center rounded-full hover:bg-paper" aria-label="Edit"><Pencil className="size-4" /></button>
                <button onClick={() => { if (confirm("Delete this FAQ?")) { del(f.id); toast("FAQ deleted"); } }} className="grid size-8 place-items-center rounded-full text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 className="size-4" /></button>
              </div>
              <AnimatePresence initial={false}>
                {open === f.id && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-12 pb-4 text-[14px] leading-relaxed text-muted">
                    {f.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
      <p className="mt-3 text-[12px] text-muted">Drag to reorder — order is reflected on the website.</p>

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="FAQ"
        footer={
          <Btn
            variant="ink"
            className="w-full"
            onClick={() => {
              if (!edit?.q || !edit.a) return toast("Question and answer are required", "error");
              upsert(edit);
              toast("FAQ saved");
              setEdit(null);
            }}
          >
            Save
          </Btn>
        }
      >
        {edit && (
          <div className="space-y-3.5">
            <Field label="Question" value={edit.q} onChange={(e) => setEdit({ ...edit, q: e.target.value })} />
            <TextArea label="Answer" rows={6} value={edit.a} onChange={(e) => setEdit({ ...edit, a: e.target.value })} />
          </div>
        )}
      </Drawer>
    </AdminPage>
  );
}
