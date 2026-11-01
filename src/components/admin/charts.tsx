"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn, EASE } from "@/lib/utils";

/** Vertical bars with hover tooltip; last bar highlighted in accent. */
export function BarChart({ data, height = 180 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div>
      <div className="relative flex items-end gap-1.5 sm:gap-2" style={{ height }}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <div key={g} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line" style={{ bottom: `${g * 100}%` }} />
        ))}
        {data.map((d, i) => {
          const h = (d.value / max) * 100;
          const last = i === data.length - 1;
          return (
            <div
              key={i}
              className="relative flex h-full flex-1 items-end"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              {hover === i && (
                <div className="absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[11px] font-medium text-white">
                  {d.value} · {d.label}
                </div>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, d.value ? 4 : 1.5)}%` }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.03 }}
                className={cn(
                  "w-full rounded-t-[6px] rounded-b-[2px] transition-colors",
                  last ? "bg-accent" : hover === i ? "bg-ink" : "bg-ink/15"
                )}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2">
        {data.map((d, i) => (
          <span key={i} className="flex-1 whitespace-nowrap text-center font-mono text-[9px] text-muted">
            {i % 2 === data.length % 2 ? d.label : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

const PALETTE = ["var(--accent)", "#0b0b0c", "#8b8a85", "#c9c6bd", "#3b82f6", "#10b981", "#a855f7"];

export function Donut({ data, size = 168 }: { data: { label: string; value: number }[]; size?: number }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const r = 52;
  const C = 2 * Math.PI * r;
  const offsets = data.map((_, i) => data.slice(0, i).reduce((a, d) => a + (d.value / total) * C, 0));
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" strokeWidth="14" className="stroke-ink/5" />
          {data.map((d, i) => {
            const len = (d.value / total) * C;
            const off = offsets[i];
            return (
              <motion.circle
                key={d.label}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                strokeWidth="14"
                stroke={PALETTE[i % PALETTE.length]}
                strokeDasharray={`${Math.max(len - 1.5, 0)} ${C}`}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: -off }}
                transition={{ duration: 1.1, ease: EASE, delay: i * 0.08 }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">{total}</span>
          <span className="eyebrow !text-[9.5px] text-muted">Leads</span>
        </div>
      </div>
      <ul className="w-full space-y-2">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5 text-[13px]">
            <span className="size-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="flex-1 truncate text-ink/80">{d.label}</span>
            <span className="font-mono text-[12px] text-muted">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Funnel({ data }: { data: { label: string; value: number; sub?: string; dot: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", d.dot)} />
              {d.label}
            </span>
            <span className="font-mono text-[12px] text-muted">
              {d.value} {d.sub && <span className="ml-1 text-ink">{d.sub}</span>}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-ink/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(d.value / max) * 100}%` }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.06 }}
              className={cn("h-full rounded-full", i === data.length - 2 ? "bg-accent" : "bg-ink/80")}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Tiny inline sparkline. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const max = Math.max(1, ...values);
  const pts = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${30 - (v / max) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={cn("h-8 w-24", className)}>
      <motion.polyline
        points={pts}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: EASE }}
      />
    </svg>
  );
}
