"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, CircleCheck, CircleX, Phone } from "lucide-react";
import { useStore } from "@/lib/store";
import { carName, cn, EASE } from "@/lib/utils";
import { AdminPage, Avatar, Btn, Chip, Empty, Tabs } from "@/components/admin/ui";
import { STAGE_MAP } from "@/components/admin/constants";
import { useToast } from "@/components/admin/toast";

type Filter = "upcoming" | "past" | "all";

export default function TestDrivesPage() {
  const leads = useStore((s) => s.leads);
  const cars = useStore((s) => s.cars);
  const staff = useStore((s) => s.staff);
  const updateLead = useStore((s) => s.updateLead);
  const addLeadNote = useStore((s) => s.addLeadNote);
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const today = new Date().toISOString().slice(0, 10);

  const groups = useMemo(() => {
    const drives = leads
      .filter((l) => l.type === "test-drive" && l.preferredDate)
      .filter((l) =>
        filter === "upcoming" ? l.preferredDate! >= today : filter === "past" ? l.preferredDate! < today : true
      )
      .sort((a, b) => {
        const k = (a.preferredDate! + (a.preferredTime ?? "")).localeCompare(b.preferredDate! + (b.preferredTime ?? ""));
        return filter === "past" ? -k : k;
      });
    const map = new Map<string, typeof drives>();
    drives.forEach((d) => map.set(d.preferredDate!, [...(map.get(d.preferredDate!) ?? []), d]));
    return [...map.entries()];
  }, [leads, filter, today]);

  const counts = {
    upcoming: leads.filter((l) => l.type === "test-drive" && l.preferredDate && l.preferredDate >= today).length,
    past: leads.filter((l) => l.type === "test-drive" && l.preferredDate && l.preferredDate < today).length,
  };

  const label = (d: string) => {
    const diff = Math.round((new Date(d).getTime() - new Date(today).getTime()) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    return new Date(d).toLocaleDateString("en-IN", { weekday: "long" });
  };

  return (
    <AdminPage eyebrow="CRM · Agenda" title="Test" italic="drives">
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { k: "Upcoming", v: counts.upcoming },
          { k: "Completed", v: leads.filter((l) => l.type === "test-drive" && l.meta?.["Test drive"] === "Completed").length },
          { k: "No-shows", v: leads.filter((l) => l.type === "test-drive" && l.meta?.["Test drive"] === "No-show").length },
          { k: "Converted", v: leads.filter((l) => l.type === "test-drive" && l.stage === "won").length },
        ].map((s, i) => (
          <motion.div
            key={s.k}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ease: EASE, duration: 0.5 }}
            className="rounded-3xl border border-line bg-white/80 p-4"
          >
            <p className="eyebrow !text-[10px] text-muted">{s.k}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{s.v}</p>
          </motion.div>
        ))}
      </div>

      <Tabs<Filter>
        id="td"
        className="mb-6"
        value={filter}
        onChange={setFilter}
        tabs={[
          { id: "upcoming", label: `Upcoming (${counts.upcoming})` },
          { id: "past", label: `Past (${counts.past})` },
          { id: "all", label: "All" },
        ]}
      />

      {groups.length === 0 ? (
        <div className="rounded-3xl border border-line bg-white/80">
          <Empty icon={<CalendarClock className="size-6" />} title="No test drives here" text="Bookings made on the website show up on this agenda automatically." />
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([date, items], gi) => (
            <motion.section
              key={date}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.05, duration: 0.5, ease: EASE }}
              className="grid gap-4 md:grid-cols-[160px_1fr]"
            >
              <div className="md:sticky md:top-24 md:self-start">
                <p className={cn("text-[15px] font-semibold", date === today && "text-accent")}>{label(date)}</p>
                <p className="font-mono text-[11.5px] text-muted">
                  {new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <ul className="space-y-2.5">
                {items.map((l) => {
                  const car = cars.find((c) => c.id === l.carId);
                  const owner = staff.find((s) => s.id === l.assignedTo);
                  const status = l.meta?.["Test drive"];
                  return (
                    <li key={l.id} className="flex flex-col gap-4 rounded-3xl border border-line bg-white/90 p-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-4 sm:w-24 sm:flex-col sm:items-start sm:gap-0">
                        <span className="text-[22px] font-semibold tracking-tight">{l.preferredTime ?? "--:--"}</span>
                        <Chip className={cn("sm:mt-1", status === "Completed" ? "bg-emerald-500/10 text-emerald-700" : status === "No-show" ? "bg-red-500/10 text-red-600" : "bg-ink/5 text-muted")}>
                          {status ?? "Scheduled"}
                        </Chip>
                      </div>
                      {car && <img src={car.images[0]} alt="" className="h-24 w-full rounded-2xl object-cover sm:h-16 sm:w-24" />}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold tracking-tight">{car ? carName(car) : "Car not specified"}</p>
                        <Link href={`/admin/leads?lead=${l.id}`} className="mt-1 flex items-center gap-2 text-[13px] text-muted hover:text-ink">
                          <Avatar name={l.name} size={22} /> {l.name}
                          <span className={cn("size-1.5 rounded-full", STAGE_MAP[l.stage].dot)} />
                          <span className="text-[12px]">{STAGE_MAP[l.stage].label}</span>
                        </Link>
                        {owner && <p className="mt-1 text-[12px] text-muted">Host: {owner.name}</p>}
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${l.phone}`} className="grid size-10 place-items-center rounded-full border border-line bg-white hover:bg-paper" aria-label="Call">
                          <Phone className="size-4" />
                        </a>
                        <Btn
                          title="Mark completed"
                          onClick={() => {
                            updateLead(l.id, { stage: l.stage === "new" || l.stage === "contacted" ? "qualified" : l.stage, meta: { ...l.meta, "Test drive": "Completed" } });
                            addLeadNote(l.id, "Test drive completed.");
                            toast(`Test drive completed · ${l.name}`);
                          }}
                          className="flex-1 sm:flex-none"
                        >
                          <CircleCheck className="size-4 text-emerald-600" /> Done
                        </Btn>
                        <Btn
                          title="Mark no-show"
                          onClick={() => {
                            updateLead(l.id, { meta: { ...l.meta, "Test drive": "No-show" } });
                            addLeadNote(l.id, "Customer did not show up for the test drive.");
                            toast(`Marked as no-show · ${l.name}`, "error");
                          }}
                          className="flex-1 sm:flex-none"
                        >
                          <CircleX className="size-4 text-red-500" /> No-show
                        </Btn>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </motion.section>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
