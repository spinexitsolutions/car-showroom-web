"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Mail, MessageCircle, Phone, Send, Trash2 } from "lucide-react";
import type { Lead, LeadType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { carName, formatDate, formatPrice, timeAgo } from "@/lib/utils";
import { Avatar, Btn, Chip, Drawer, Field, Label, Select, TextArea } from "./ui";
import { LEAD_TYPES, PRIORITIES, STAGES, TYPE_MAP } from "./constants";
import { useToast } from "./toast";

export function LeadDrawer({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const cars = useStore((s) => s.cars);
  const staff = useStore((s) => s.staff);
  const updateLead = useStore((s) => s.updateLead);
  const deleteLead = useStore((s) => s.deleteLead);
  const addLeadNote = useStore((s) => s.addLeadNote);
  const toast = useToast();
  const [note, setNote] = useState("");

  const car = lead?.carId ? cars.find((c) => c.id === lead.carId) : undefined;
  const wa = lead?.phone.replace(/\D/g, "");

  return (
    <Drawer
      open={!!lead}
      onClose={onClose}
      wide
      title={
        lead && (
          <div className="flex items-center gap-3">
            <Avatar name={lead.name} size={38} />
            <div className="min-w-0">
              <p className="truncate">{lead.name}</p>
              <p className="font-mono text-[11px] font-normal text-muted">
                Created {timeAgo(lead.createdAt)} · {lead.source}
              </p>
            </div>
          </div>
        )
      }
      footer={
        lead && (
          <div className="flex items-center justify-between gap-2">
            <Btn
              variant="danger"
              onClick={() => {
                if (confirm(`Delete lead “${lead.name}”? This cannot be undone.`)) {
                  deleteLead(lead.id);
                  toast("Lead deleted");
                  onClose();
                }
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Btn>
            <Btn variant="ink" onClick={onClose}>
              Done
            </Btn>
          </div>
        )
      }
    >
      {lead && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            <a href={`tel:${lead.phone}`} className="flex flex-col items-center gap-1.5 chamfer chamfer-sm bg-white py-3 text-[12px] font-medium hover:bg-paper-2">
              <Phone className="size-4" /> Call
            </a>
            <a href={`mailto:${lead.email}`} className="flex flex-col items-center gap-1.5 chamfer chamfer-sm bg-white py-3 text-[12px] font-medium hover:bg-paper-2">
              <Mail className="size-4" /> Email
            </a>
            <a
              href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hi ${lead.name.split(" ")[0]}, this is from Orbis Motors regarding your ${TYPE_MAP[lead.type].label.toLowerCase()}.`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-1.5 chamfer chamfer-sm bg-[#25D366] py-3 text-[12px] font-medium text-white"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          </div>

          <div className="grid gap-3 chamfer chamfer-sm bg-white p-4 text-[13.5px] sm:grid-cols-2">
            <Info k="Phone" v={lead.phone} />
            <Info k="Email" v={lead.email} />
            <Info k="Type" v={<Chip className={TYPE_MAP[lead.type].tone}>{TYPE_MAP[lead.type].label}</Chip>} />
            {lead.preferredDate && (
              <Info
                k="Preferred slot"
                v={
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-accent" />
                    {formatDate(lead.preferredDate)} · {lead.preferredTime}
                  </span>
                }
              />
            )}
            {lead.meta &&
              Object.entries(lead.meta).map(([k, v]) => <Info key={k} k={k} v={v} />)}
            {lead.message && (
              <div className="sm:col-span-2">
                <Label>Message</Label>
                <p className="chamfer chamfer-sm bg-paper p-3 leading-relaxed text-ink/80">“{lead.message}”</p>
              </div>
            )}
          </div>

          {car && (
            <Link href={`/admin/inventory/${car.id}`} className="flex items-center gap-3 chamfer chamfer-sm bg-white p-3 hover:bg-paper-2">
              <img src={car.images[0]} alt="" className="h-14 w-20 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="eyebrow !text-[10px] text-muted">Interested in</p>
                <p className="truncate font-medium">{carName(car)}</p>
              </div>
              <span className="text-[14px] font-semibold">{formatPrice(car.price)}</span>
            </Link>
          )}

          <div>
            <Label>Stage</Label>
            <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
              {STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateLead(lead.id, { stage: s.id })}
                  className={`relative flex shrink-0 items-center gap-2 chamfer chamfer-sm px-3.5 py-2 text-[12.5px] font-medium transition-colors ${
                    lead.stage === s.id ? "text-white" : "bg-white text-ink/70 hover:text-ink"
                  }`}
                >
                  {lead.stage === s.id && (
                    <motion.span layoutId="stage-pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className={`relative size-2 rounded-full ${s.dot}`} />
                  <span className="relative">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Select
              label="Priority"
              value={lead.priority}
              onChange={(e) => updateLead(lead.id, { priority: e.target.value as Lead["priority"] })}
              options={PRIORITIES.map((p) => ({ value: p.id, label: p.label }))}
            />
            <Select
              label="Assigned to"
              value={lead.assignedTo ?? ""}
              onChange={(e) => updateLead(lead.id, { assignedTo: e.target.value || undefined })}
              options={[{ value: "", label: "Unassigned" }, ...staff.map((s) => ({ value: s.id, label: s.name }))]}
            />
            <Field
              label="Deal value (₹)"
              type="number"
              value={lead.value ?? ""}
              onChange={(e) => updateLead(lead.id, { value: e.target.value ? Number(e.target.value) : undefined })}
            />
          </div>
          <Select
            label="Interested car"
            value={lead.carId ?? ""}
            onChange={(e) => updateLead(lead.id, { carId: e.target.value || undefined })}
            options={[{ value: "", label: "— None —" }, ...cars.map((c) => ({ value: c.id, label: carName(c) }))]}
          />

          <div>
            <Label>Notes & timeline</Label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                addLeadNote(lead.id, note.trim());
                setNote("");
                toast("Note added");
              }}
              className="flex gap-2"
            >
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Log a call, meeting, follow-up…" className="field !rounded-full !py-2.5 text-[14px]" />
              <button type="submit" aria-label="Add note" className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white active:scale-95">
                <Send className="size-4" />
              </button>
            </form>
            <ul className="mt-4 space-y-3">
              <AnimatePresence initial={false}>
                {lead.notes.map((n) => (
                  <motion.li
                    key={n.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="chamfer chamfer-sm border border-line bg-white p-3.5"
                  >
                    <p className="text-[13.5px] leading-relaxed">{n.text}</p>
                    <p className="mt-1.5 font-mono text-[10.5px] text-muted">
                      {n.by} · {timeAgo(n.at)}
                    </p>
                  </motion.li>
                ))}
              </AnimatePresence>
              <li className="flex items-center gap-2 px-1 font-mono text-[10.5px] text-muted">
                <span className="size-1.5 rounded-full bg-accent" /> Lead created {formatDate(lead.createdAt)} via {lead.source}
              </li>
            </ul>
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Info({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="eyebrow !text-[10px] text-muted">{k}</p>
      <div className="mt-1 truncate font-medium">{v}</div>
    </div>
  );
}

export function NewLeadDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const cars = useStore((s) => s.cars);
  const addLead = useStore((s) => s.addLead);
  const toast = useToast();
  return (
    <Drawer open={open} onClose={onClose} title="Add lead manually">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const g = (k: string) => String(fd.get(k) ?? "").trim();
          addLead({
            type: g("type") as LeadType,
            name: g("name"),
            email: g("email"),
            phone: g("phone"),
            carId: g("carId") || undefined,
            message: g("message") || undefined,
            preferredDate: g("date") || undefined,
            preferredTime: g("time") || undefined,
            source: g("source") || "Walk-in",
          });
          toast("Lead added to pipeline");
          onClose();
        }}
        className="grid grid-cols-2 gap-3.5"
      >
        <Field className="col-span-2" label="Full name" name="name" required />
        <Field className="col-span-2 sm:col-span-1" label="Phone" name="phone" required />
        <Field className="col-span-2 sm:col-span-1" label="Email" name="email" type="email" required />
        <Select className="col-span-1" label="Type" name="type" options={LEAD_TYPES.map((t) => ({ value: t.id, label: t.label }))} />
        <Select className="col-span-1" label="Source" name="source" options={["Walk-in", "Phone call", "Referral", "Instagram Ad", "Google", "Event"]} />
        <Select className="col-span-2" label="Interested car" name="carId" options={[{ value: "", label: "— None —" }, ...cars.map((c) => ({ value: c.id, label: carName(c) }))]} />
        <Field className="col-span-1" label="Date (optional)" name="date" type="date" />
        <Field className="col-span-1" label="Time" name="time" type="time" />
        <TextArea className="col-span-2" label="Notes" name="message" rows={3} />
        <Btn type="submit" variant="ink" className="col-span-2 mt-2 h-12">
          Add to pipeline
        </Btn>
      </form>
    </Drawer>
  );
}
