"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownUp, CalendarClock, Download, Inbox, Kanban, Plus, Table2 } from "lucide-react";
import type { Lead, LeadStage } from "@/lib/types";
import { useStore } from "@/lib/store";
import { carName, cn, formatPrice, timeAgo } from "@/lib/utils";
import { AdminPage, Avatar, Btn, Chip, Empty, SearchInput, Select, Tabs } from "@/components/admin/ui";
import { LEAD_TYPES, PRIORITIES, PRIORITY_MAP, STAGES, STAGE_MAP, TYPE_MAP } from "@/components/admin/constants";
import { LeadDrawer, NewLeadDrawer } from "@/components/admin/lead-drawer";
import { useToast } from "@/components/admin/toast";

export default function LeadsPage() {
  return (
    <Suspense>
      <Leads />
    </Suspense>
  );
}

type View = "board" | "table";
type Sort = "newest" | "oldest" | "value" | "name";

function Leads() {
  const leads = useStore((s) => s.leads);
  const cars = useStore((s) => s.cars);
  const staff = useStore((s) => s.staff);
  const updateLead = useStore((s) => s.updateLead);
  const toast = useToast();
  const params = useSearchParams();
  const router = useRouter();

  const [view, setView] = useState<View>("board");
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const id = params.get("lead");
    if (id) setOpenId(id);
  }, [params]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = leads.filter((l) => {
      if (type && l.type !== type) return false;
      if (stage && l.stage !== stage) return false;
      if (priority && l.priority !== priority) return false;
      if (assignee === "none" && l.assignedTo) return false;
      if (assignee && assignee !== "none" && l.assignedTo !== assignee) return false;
      if (s) {
        const car = cars.find((c) => c.id === l.carId);
        const hay = `${l.name} ${l.email} ${l.phone} ${l.source} ${car ? carName(car) : ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "value") return (b.value ?? 0) - (a.value ?? 0);
      return a.name.localeCompare(b.name);
    });
  }, [leads, cars, q, type, stage, priority, assignee, sort]);

  const openLead = leads.find((l) => l.id === openId) ?? null;

  function close() {
    setOpenId(null);
    if (params.get("lead")) router.replace("/admin/leads");
  }

  function exportCsv() {
    const head = ["Name", "Email", "Phone", "Type", "Stage", "Priority", "Source", "Car", "Value", "Preferred date", "Preferred time", "Assigned to", "Created"];
    const rows = filtered.map((l) => {
      const car = cars.find((c) => c.id === l.carId);
      return [
        l.name, l.email, l.phone, l.type, l.stage, l.priority, l.source,
        car ? carName(car) : "", l.value ?? "", l.preferredDate ?? "", l.preferredTime ?? "",
        staff.find((s) => s.id === l.assignedTo)?.name ?? "", l.createdAt,
      ];
    });
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast(`Exported ${filtered.length} leads`);
  }

  const activeFilters = [type, stage, priority, assignee].filter(Boolean).length;

  return (
    <AdminPage
      eyebrow="CRM"
      title="Leads &"
      italic="pipeline"
      actions={
        <>
          <Btn onClick={exportCsv}>
            <Download className="size-4" /> Export CSV
          </Btn>
          <Btn variant="ink" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Add lead
          </Btn>
        </>
      }
    >
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs<View>
          id="leadview"
          tabs={[
            { id: "board", label: "Board" },
            { id: "table", label: "Table" },
          ]}
          value={view}
          onChange={setView}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search name, phone, car…" className="lg:w-72" />
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          <Select className="!w-auto !rounded-full" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: "", label: "All types" }, ...LEAD_TYPES.map((t) => ({ value: t.id, label: t.label }))]} />
          {view === "table" && (
            <Select className="!w-auto !rounded-full" value={stage} onChange={(e) => setStage(e.target.value)} options={[{ value: "", label: "All stages" }, ...STAGES.map((t) => ({ value: t.id, label: t.label }))]} />
          )}
          <Select className="!w-auto !rounded-full" value={priority} onChange={(e) => setPriority(e.target.value)} options={[{ value: "", label: "Any priority" }, ...PRIORITIES.map((t) => ({ value: t.id, label: t.label }))]} />
          <Select className="!w-auto !rounded-full" value={assignee} onChange={(e) => setAssignee(e.target.value)} options={[{ value: "", label: "Everyone" }, { value: "none", label: "Unassigned" }, ...staff.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select className="!w-auto !rounded-full" value={sort} onChange={(e) => setSort(e.target.value as Sort)} options={[{ value: "newest", label: "Newest" }, { value: "oldest", label: "Oldest" }, { value: "value", label: "Highest value" }, { value: "name", label: "Name A–Z" }]} />
          {activeFilters > 0 && (
            <Btn variant="plain" onClick={() => { setType(""); setStage(""); setPriority(""); setAssignee(""); }}>
              Clear ({activeFilters})
            </Btn>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "board" ? (
          <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Board
              leads={filtered}
              onOpen={setOpenId}
              onMove={(id, s) => {
                const l = leads.find((x) => x.id === id);
                if (l && l.stage !== s) {
                  updateLead(id, { stage: s });
                  toast(`${l.name} → ${STAGE_MAP[s].label}`);
                }
              }}
            />
          </motion.div>
        ) : (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LeadTable leads={filtered} onOpen={setOpenId} />
          </motion.div>
        )}
      </AnimatePresence>

      <LeadDrawer lead={openLead} onClose={close} />
      <NewLeadDrawer open={adding} onClose={() => setAdding(false)} />
    </AdminPage>
  );
}

function Board({
  leads,
  onOpen,
  onMove,
}: {
  leads: Lead[];
  onOpen: (id: string) => void;
  onMove: (id: string, s: LeadStage) => void;
}) {
  const [over, setOver] = useState<LeadStage | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
      {STAGES.map((s) => {
        const col = leads.filter((l) => l.stage === s.id);
        const total = col.reduce((a, l) => a + (l.value ?? 0), 0);
        return (
          <div
            key={s.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(s.id);
            }}
            onDragLeave={() => setOver((o) => (o === s.id ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("text/plain");
              if (id) onMove(id, s.id);
              setOver(null);
              setDragging(null);
            }}
            className={cn(
              "flex w-[82vw] shrink-0 snap-start flex-col rounded-3xl border p-2 transition-colors sm:w-[300px]",
              over === s.id ? "border-accent bg-accent/5" : "border-line bg-paper-2/50"
            )}
          >
            <div className="flex items-center justify-between px-2.5 pb-2.5 pt-2">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", s.dot)} />
                <span className="text-[13.5px] font-semibold">{s.label}</span>
                <span className="rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[11px] text-muted">{col.length}</span>
              </div>
              <span className="font-mono text-[11px] text-muted">{total ? formatPrice(total) : ""}</span>
            </div>
            <div className="flex min-h-[120px] flex-1 flex-col gap-2">
              <AnimatePresence initial={false}>
                {col.map((l) => (
                  <motion.div
                    key={l.id}
                    layout
                    layoutId={`lead-${l.id}`}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: dragging === l.id ? 0.4 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  >
                    <LeadCard lead={l} onOpen={onOpen} onMove={onMove} onDragStart={() => setDragging(l.id)} onDragEnd={() => setDragging(null)} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {col.length === 0 && (
                <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-line py-8 text-[12px] text-muted">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeadCard({
  lead,
  onOpen,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  onOpen: (id: string) => void;
  onMove: (id: string, s: LeadStage) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const car = useStore((s) => s.cars.find((c) => c.id === lead.carId));
  const staff = useStore((s) => s.staff.find((x) => x.id === lead.assignedTo));
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", lead.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(lead.id)}
      className="group cursor-grab rounded-2xl border border-line bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-shadow hover:shadow-lg hover:shadow-black/5 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={lead.name} size={30} />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium leading-tight">{lead.name}</p>
            <p className="font-mono text-[10.5px] text-muted">{timeAgo(lead.createdAt)}</p>
          </div>
        </div>
        <Chip className={PRIORITY_MAP[lead.priority].tone}>{PRIORITY_MAP[lead.priority].label}</Chip>
      </div>
      {car && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-paper p-1.5 pr-2.5">
          <img src={car.images[0]} alt="" className="h-8 w-11 rounded-lg object-cover" />
          <span className="truncate text-[12.5px]">{carName(car)}</span>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Chip className={TYPE_MAP[lead.type].tone}>{TYPE_MAP[lead.type].label}</Chip>
          {lead.preferredDate && <CalendarClock className="size-3.5 text-muted" />}
        </div>
        <div className="flex items-center gap-2">
          {lead.value ? <span className="text-[12.5px] font-semibold">{formatPrice(lead.value)}</span> : null}
          {staff && <Avatar name={staff.name} src={staff.avatar} size={22} />}
        </div>
      </div>
      {/* Mobile fallback for drag & drop */}
      <select
        value={lead.stage}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => onMove(lead.id, e.target.value as LeadStage)}
        className="mt-3 w-full rounded-xl border border-line bg-paper px-2.5 py-1.5 text-[12px] md:hidden"
        aria-label="Move to stage"
      >
        {STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            Move to · {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function LeadTable({ leads, onOpen }: { leads: Lead[]; onOpen: (id: string) => void }) {
  const cars = useStore((s) => s.cars);
  const staff = useStore((s) => s.staff);
  if (!leads.length)
    return (
      <div className="rounded-3xl border border-line bg-white/80">
        <Empty icon={<Inbox className="size-6" />} title="No leads match" text="Try clearing filters or searching for something else." />
      </div>
    );
  return (
    <>
      {/* Mobile list */}
      <ul className="space-y-2 md:hidden">
        {leads.map((l) => {
          const car = cars.find((c) => c.id === l.carId);
          return (
            <li key={l.id}>
              <button onClick={() => onOpen(l.id)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left">
                <Avatar name={l.name} size={38} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[14px] font-medium">{l.name}</p>
                    <span className={cn("size-2 shrink-0 rounded-full", STAGE_MAP[l.stage].dot)} />
                  </div>
                  <p className="truncate text-[12px] text-muted">{car ? carName(car) : l.source}</p>
                </div>
                <Chip className={TYPE_MAP[l.type].tone}>{TYPE_MAP[l.type].label}</Chip>
              </button>
            </li>
          );
        })}
      </ul>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-3xl border border-line bg-white/80 md:block">
        <table className="w-full text-left text-[13.5px]">
          <thead className="border-b border-line bg-paper/60">
            <tr className="eyebrow !text-[10px] text-muted">
              <th className="px-5 py-3 font-normal">Lead</th>
              <th className="px-3 py-3 font-normal">Type</th>
              <th className="px-3 py-3 font-normal">Interest</th>
              <th className="px-3 py-3 font-normal">Stage</th>
              <th className="px-3 py-3 font-normal">Priority</th>
              <th className="px-3 py-3 font-normal">Owner</th>
              <th className="px-3 py-3 text-right font-normal">
                <span className="inline-flex items-center gap-1">Value <ArrowDownUp className="size-3" /></span>
              </th>
              <th className="px-5 py-3 text-right font-normal">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads.map((l) => {
              const car = cars.find((c) => c.id === l.carId);
              const owner = staff.find((s) => s.id === l.assignedTo);
              return (
                <tr key={l.id} onClick={() => onOpen(l.id)} className="cursor-pointer transition-colors hover:bg-paper/70">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.name} size={32} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{l.name}</p>
                        <p className="truncate text-[12px] text-muted">{l.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><Chip className={TYPE_MAP[l.type].tone}>{TYPE_MAP[l.type].label}</Chip></td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-ink/80">{car ? carName(car) : <span className="text-muted">—</span>}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-2"><span className={cn("size-2 rounded-full", STAGE_MAP[l.stage].dot)} />{STAGE_MAP[l.stage].label}</span>
                  </td>
                  <td className="px-3 py-3"><Chip className={PRIORITY_MAP[l.priority].tone}>{PRIORITY_MAP[l.priority].label}</Chip></td>
                  <td className="px-3 py-3">{owner ? <span className="flex items-center gap-2"><Avatar name={owner.name} src={owner.avatar} size={24} /><span className="truncate">{owner.name.split(" ")[0]}</span></span> : <span className="text-muted">—</span>}</td>
                  <td className="px-3 py-3 text-right font-medium">{l.value ? formatPrice(l.value) : "—"}</td>
                  <td className="px-5 py-3 text-right font-mono text-[11.5px] text-muted">{timeAgo(l.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 px-1 font-mono text-[11px] text-muted">
        <Kanban className="mr-1 inline size-3" /> {leads.length} leads · <Table2 className="mx-1 inline size-3" /> click a row to open
      </p>
    </>
  );
}
