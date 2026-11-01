"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity as ActivityIcon, ArrowUpRight, CalendarClock, CarFront, Eye, IndianRupee, Inbox, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import { carName, cn, EASE, formatPrice, timeAgo } from "@/lib/utils";
import { AdminPage, Avatar, Card, Chip, Empty } from "@/components/admin/ui";
import { BarChart, Donut, Funnel, Sparkline } from "@/components/admin/charts";
import { STAGES, TYPE_MAP } from "@/components/admin/constants";
import { Gauge } from "@/components/site/hud";

const DAY = 86400000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default function Dashboard() {
  const leads = useStore((s) => s.leads);
  const cars = useStore((s) => s.cars);
  const activity = useStore((s) => s.activity);
  const user = useStore((s) => s.adminUser);

  const [now] = useState(() => Date.now());
  const stats = useMemo(() => {
    const open = leads.filter((l) => !["won", "lost"].includes(l.stage));
    const pipeline = open.reduce((a, l) => a + (l.value ?? 0), 0);
    const weekLeads = leads.filter((l) => now - new Date(l.createdAt).getTime() < 7 * DAY);
    const prevWeek = leads.filter((l) => {
      const t = now - new Date(l.createdAt).getTime();
      return t >= 7 * DAY && t < 14 * DAY;
    });
    const today = dayKey(new Date());
    const upcoming = leads
      .filter((l) => l.type === "test-drive" && l.preferredDate && l.preferredDate >= today && l.stage !== "lost")
      .sort((a, b) => (a.preferredDate! + a.preferredTime).localeCompare(b.preferredDate! + b.preferredTime));
    const won = leads.filter((l) => l.stage === "won");
    const closed = leads.filter((l) => l.stage === "won" || l.stage === "lost").length;
    const conv = closed ? Math.round((won.length / closed) * 100) : 0;
    const revenue = won.reduce((a, l) => a + (l.value ?? 0), 0);

    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now - (13 - i) * DAY);
      const k = dayKey(d);
      return {
        label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        value: leads.filter((l) => l.createdAt.slice(0, 10) === k).length,
      };
    });

    const sourceMap = new Map<string, number>();
    leads.forEach((l) => {
      const k = l.source.split("·")[0].trim();
      sourceMap.set(k, (sourceMap.get(k) ?? 0) + 1);
    });
    const sources = [...sourceMap.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const funnel = STAGES.filter((s) => s.id !== "lost").map((s) => {
      const ls = leads.filter((l) => l.stage === s.id);
      return {
        label: s.label,
        value: ls.length,
        dot: s.dot,
        sub: formatPrice(ls.reduce((a, l) => a + (l.value ?? 0), 0)),
      };
    });

    return {
      pipeline,
      openCount: open.length,
      weekLeads: weekLeads.length,
      weekDelta: weekLeads.length - prevWeek.length,
      upcoming,
      conv,
      revenue,
      days,
      sources,
      funnel,
    };
  }, [leads, now]);

  const available = cars.filter((c) => c.status === "available").length;
  const sold = cars.filter((c) => c.status === "sold").length;
  const reserved = cars.filter((c) => c.status === "reserved").length;
  const topCars = [...cars].sort((a, b) => b.views - a.views).slice(0, 5);
  const maxViews = topCars[0]?.views ?? 1;
  const hour = new Date(now).getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const kpis = [
    {
      label: "Open pipeline",
      value: formatPrice(stats.pipeline),
      sub: `${stats.openCount} active deals`,
      icon: IndianRupee,
      spark: stats.days.map((d) => d.value),
    },
    {
      label: "New leads · 7d",
      value: String(stats.weekLeads),
      sub: `${stats.weekDelta >= 0 ? "+" : ""}${stats.weekDelta} vs last week`,
      icon: Inbox,
      up: stats.weekDelta >= 0,
    },
    {
      label: "Upcoming test drives",
      value: String(stats.upcoming.length),
      sub: stats.upcoming[0] ? `Next: ${stats.upcoming[0].preferredDate} ${stats.upcoming[0].preferredTime ?? ""}` : "None scheduled",
      icon: CalendarClock,
    },
    {
      label: "Inventory",
      value: String(cars.length),
      sub: `${available} available · ${reserved} reserved · ${sold} sold`,
      icon: CarFront,
    },
    {
      label: "Win rate",
      value: `${stats.conv}%`,
      sub: `${formatPrice(stats.revenue)} closed`,
      icon: TrendingUp,
      up: true,
    },
  ];

  return (
    <AdminPage
      eyebrow={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
      title={`${greet},`}
      italic={user?.name.split(" ")[0] ?? "there"}
      actions={
        <>
          <Link href="/admin/leads" className="btn-ghost hud inline-flex h-10 items-center gap-2 chamfer chamfer-sm px-4 text-[11.5px] uppercase tracking-[0.1em]">
            Open pipeline
          </Link>
          <Link href="/admin/inventory/new" className="btn-ink hud inline-flex h-10 items-center gap-2 chamfer chamfer-sm px-4 text-[11.5px] uppercase tracking-[0.1em]">
            Add car <ArrowUpRight className="size-4" />
          </Link>
        </>
      }
    >
      {/* Instrument cluster */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="chamfer chamfer-lg relative mb-4 overflow-hidden bg-ink text-white"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-3">
          <span className="hud flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-white/60">
            <span className="h-3 w-[3px] bg-accent" /> Showroom telemetry
          </span>
          <span className="hud flex items-center gap-1.5 text-[10px] text-emerald-400">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
          </span>
        </div>
        <div className="no-scrollbar relative flex snap-x items-center gap-2 overflow-x-auto p-4 sm:grid sm:grid-cols-3 sm:overflow-visible md:p-6">
          {[
            { v: stats.conv, max: 100, label: "Win rate", suffix: "%" },
            { v: stats.weekLeads, max: Math.max(20, Math.ceil(stats.weekLeads / 10) * 10), label: "Leads · 7 days", suffix: "" },
            { v: cars.length ? Math.round((available / cars.length) * 100) : 0, max: 100, label: "Stock available", suffix: "%" },
          ].map((g) => (
            <div key={g.label} className="flex shrink-0 snap-center justify-center">
              <Gauge hp={g.v} max={g.max} label={g.label} suffix={g.suffix} size="size-[200px]" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:px-0 xl:grid-cols-5">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
              className={cn(
                "relative min-w-[240px] snap-start overflow-hidden chamfer p-5 md:min-w-0",
                i === 0 ? "bg-accent text-accent-ink" : "bg-white"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("eyebrow !text-[10px]", i === 0 ? "opacity-70" : "text-muted")}>{k.label}</span>
                <span className={cn("chamfer chamfer-sm grid size-8 place-items-center", i === 0 ? "bg-black/15" : "bg-ink/5")}>
                  <Icon className="size-4" />
                </span>
              </div>
              <p className="hud mt-5 text-[30px] leading-none">{k.value}</p>
              <div className="mt-3 flex items-end justify-between gap-2">
                <p className={cn("text-[12px]", i === 0 ? "opacity-75" : k.up === false ? "text-red-600" : k.up ? "text-emerald-600" : "text-muted")}>
                  {k.sub}
                </p>
                {k.spark && <Sparkline values={k.spark} />}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Leads · last 14 days" action={<span className="eyebrow !text-[10px] text-muted">{stats.days.reduce((a, d) => a + d.value, 0)} total</span>}>
          <BarChart data={stats.days} />
        </Card>
        <Card title="Lead sources">
          <Donut data={stats.sources} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Pipeline by stage" action={<Link href="/admin/leads" className="eyebrow !text-[10px] text-muted link-u">Board →</Link>}>
          <Funnel data={stats.funnel} />
        </Card>

        <Card title="Upcoming test drives" pad={false} action={<Link href="/admin/test-drives" className="eyebrow !text-[10px] text-muted link-u">All →</Link>}>
          {stats.upcoming.length === 0 ? (
            <Empty icon={<CalendarClock className="size-6" />} title="Nothing scheduled" text="New bookings from the website appear here instantly." />
          ) : (
            <ul className="divide-y divide-line">
              {stats.upcoming.slice(0, 5).map((l) => {
                const car = cars.find((c) => c.id === l.carId);
                const d = new Date(l.preferredDate!);
                return (
                  <li key={l.id}>
                    <Link href={`/admin/leads?lead=${l.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-paper/60">
                      <div className="grid w-12 shrink-0 place-items-center chamfer chamfer-sm bg-paper py-1.5 text-center">
                        <span className="eyebrow !text-[9px] text-accent">{d.toLocaleDateString("en-IN", { month: "short" })}</span>
                        <span className="text-[18px] font-semibold leading-none">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium">{l.name}</p>
                        <p className="truncate text-[12px] text-muted">{car ? carName(car) : "Any car"}</p>
                      </div>
                      <span className="font-mono text-[12px] text-muted">{l.preferredTime}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card title="Recent activity" pad={false}>
          <ul className="max-h-[340px] overflow-y-auto px-5 py-3" data-lenis-prevent>
            {activity.slice(0, 12).map((a, i) => (
              <li key={a.id} className="relative flex gap-3 pb-4 last:pb-1">
                {i < Math.min(activity.length, 12) - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-line" />}
                <span
                  className={cn(
                    "relative mt-1 size-[15px] shrink-0 rounded-full border-[3px] border-white shadow",
                    a.kind === "lead" ? "bg-accent" : a.kind === "car" ? "bg-ink" : a.kind === "cms" ? "bg-sky-500" : "bg-zinc-400"
                  )}
                />
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug">{a.text}</p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-muted">{timeAgo(a.at)}</p>
                </div>
              </li>
            ))}
            {activity.length === 0 && <Empty icon={<ActivityIcon className="size-6" />} title="No activity yet" />}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3" title="Most viewed cars" pad={false}>
          <ul className="divide-y divide-line">
            {topCars.map((c, i) => (
              <li key={c.id}>
                <Link href={`/admin/inventory/${c.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-paper/60">
                  <span className="w-4 font-mono text-[12px] text-muted">{i + 1}</span>
                  <img src={c.images[0]} alt="" className="h-11 w-16 shrink-0 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium">{carName(c)}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(c.views / maxViews) * 100}%` }}
                        transition={{ duration: 1, ease: EASE, delay: i * 0.05 }}
                        className="h-full rounded-full bg-ink/70"
                      />
                    </div>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[12px] text-muted">
                    <Eye className="size-3.5" /> {c.views.toLocaleString("en-IN")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2" title="Latest leads" pad={false} action={<Link href="/admin/leads" className="eyebrow !text-[10px] text-muted link-u">All →</Link>}>
          <ul className="divide-y divide-line">
            {[...leads]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .slice(0, 6)
              .map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads?lead=${l.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-paper/60">
                    <Avatar name={l.name} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium">{l.name}</p>
                      <p className="font-mono text-[10.5px] text-muted">{timeAgo(l.createdAt)}</p>
                    </div>
                    <Chip className={TYPE_MAP[l.type].tone}>{TYPE_MAP[l.type].label}</Chip>
                  </Link>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </AdminPage>
  );
}
