"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { LeadType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ExtraField {
  name: string;
  label: string;
  type?: "text" | "number" | "select" | "date" | "time";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  half?: boolean;
}

/**
 * Universal CRM capture form. Every public form on the site (test drive,
 * enquiry, trade-in, service, finance, contact) funnels into the admin CRM.
 */
export function LeadForm({
  type,
  carId,
  source,
  submitLabel = "Submit",
  withMessage = true,
  withSchedule = false,
  extra = [],
  dark,
  className,
  successTitle = "Request received",
  successText = "A specialist will reach out within 30 minutes during showroom hours.",
}: {
  type: LeadType;
  carId?: string;
  source: string;
  submitLabel?: string;
  withMessage?: boolean;
  withSchedule?: boolean;
  extra?: ExtraField[];
  dark?: boolean;
  className?: string;
  successTitle?: string;
  successText?: string;
}) {
  const addLead = useStore((s) => s.addLead);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const f = cn("field", dark && "field-dark");
  const label = cn("eyebrow mb-2 block", dark ? "text-white/50" : "text-muted");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const meta: Record<string, string> = {};
    extra.forEach((x) => {
      const v = get(x.name);
      if (v) meta[x.label] = v;
    });
    setLoading(true);
    setTimeout(() => {
      addLead({
        type,
        carId: carId || get("carId") || undefined,
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        message: get("message") || undefined,
        preferredDate: get("date") || undefined,
        preferredTime: get("time") || undefined,
        source,
        meta: Object.keys(meta).length ? meta : undefined,
      });
      setLoading(false);
      setDone(true);
    }, 700);
  }

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-10 text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
              className="grid size-16 place-items-center rounded-full bg-accent text-white"
            >
              <Check className="size-7" strokeWidth={2.5} />
            </motion.div>
            <h3 className={cn("mt-6 text-2xl font-semibold tracking-tight", dark && "text-white")}>{successTitle}</h3>
            <p className={cn("mt-2 max-w-sm text-[15px]", dark ? "text-white/60" : "text-muted")}>{successText}</p>
            <button
              onClick={() => setDone(false)}
              className={cn("eyebrow mt-6 link-u", dark ? "text-white/70" : "text-ink")}
            >
              Submit another
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={onSubmit}
            className="grid grid-cols-2 gap-3.5"
          >
            <div className="col-span-2">
              <label className={label}>Full name</label>
              <input name="name" required placeholder="Your name" className={f} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={label}>Phone</label>
              <input name="phone" required type="tel" placeholder="+91" className={f} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={label}>Email</label>
              <input name="email" required type="email" placeholder="you@email.com" className={f} />
            </div>
            {withSchedule && (
              <>
                <div className="col-span-1">
                  <label className={label}>Preferred date</label>
                  <input
                    name="date"
                    required
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    className={f}
                  />
                </div>
                <div className="col-span-1">
                  <label className={label}>Time</label>
                  <select name="time" className={f} defaultValue="11:00">
                    {["10:00", "11:00", "12:30", "14:00", "15:30", "17:00", "18:30"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {extra.map((x) => (
              <div key={x.name} className={cn(x.half ? "col-span-2 sm:col-span-1" : "col-span-2")}>
                <label className={label}>{x.label}</label>
                {x.type === "select" ? (
                  <select name={x.name} required={x.required} className={f} defaultValue={x.options?.[0]}>
                    {x.options?.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={x.name}
                    type={x.type ?? "text"}
                    required={x.required}
                    placeholder={x.placeholder}
                    className={f}
                  />
                )}
              </div>
            ))}
            {withMessage && (
              <div className="col-span-2">
                <label className={label}>Message (optional)</label>
                <textarea name="message" rows={3} placeholder="Anything we should know?" className={cn(f, "resize-none")} />
              </div>
            )}
            <div className="col-span-2 mt-2">
              <Button
                type="submit"
                variant={dark ? "light" : "ink"}
                size="lg"
                disabled={loading}
                className="w-full justify-between"
              >
                {loading ? "Sending…" : submitLabel}
              </Button>
              <p className={cn("mt-3 text-[12px]", dark ? "text-white/40" : "text-muted")}>
                By submitting you agree to be contacted by our team. No spam, ever.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
