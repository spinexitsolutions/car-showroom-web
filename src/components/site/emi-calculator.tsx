"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { cn, emi, formatPrice } from "@/lib/utils";

function Range({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  dark,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  dark?: boolean;
}) {
  const p = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className={cn("eyebrow", dark ? "text-white/50" : "text-muted")}>{label}</span>
        <span className={cn("text-[17px] font-semibold tabular-nums tracking-tight", dark && "text-white")}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        className="range mt-4"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ["--p" as string]: `${p}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Interactive EMI calculator with an animated donut (principal vs interest). */
export function EmiCalculator({ defaultPrice = 15000000, dark }: { defaultPrice?: number; dark?: boolean }) {
  const fin = useStore((s) => s.settings.finance);
  const [price, setPrice] = useState(defaultPrice);
  const [downPct, setDownPct] = useState(Math.max(20, fin.minDownPct));
  const [years, setYears] = useState(Math.min(5, fin.maxTenureYears));
  const [rate, setRate] = useState(fin.interestRate);

  const { monthly, principal, interest } = useMemo(() => {
    const principal = price * (1 - downPct / 100);
    const monthly = emi(principal, rate, years * 12);
    return { monthly, principal, interest: monthly * years * 12 - principal };
  }, [price, downPct, years, rate]);

  const share = principal / (principal + interest || 1);
  const C = 2 * Math.PI * 52;

  return (
    <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
      <div className="space-y-8">
        <Range dark={dark} label="Car price" value={price} min={2000000} max={80000000} step={100000} onChange={setPrice} format={(v) => formatPrice(v)} />
        <Range dark={dark} label="Down payment" value={downPct} min={fin.minDownPct} max={80} step={1} onChange={setDownPct} format={(v) => `${v}% · ${formatPrice((price * v) / 100)}`} />
        <Range dark={dark} label="Tenure" value={years} min={1} max={fin.maxTenureYears} step={1} onChange={setYears} format={(v) => `${v} yr${v > 1 ? "s" : ""}`} />
        <Range dark={dark} label="Interest rate" value={rate} min={6} max={16} step={0.25} onChange={setRate} format={(v) => `${v.toFixed(2)}%`} />
      </div>
      <div className="flex flex-col items-center">
        <div className="relative size-60">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" strokeWidth="10" className={dark ? "stroke-white/10" : "stroke-ink/10"} />
            <motion.circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              stroke="var(--accent)"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - share) }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={cn("eyebrow", dark ? "text-white/50" : "text-muted")}>Monthly EMI</span>
            <motion.span
              key={Math.round(monthly / 100)}
              initial={{ opacity: 0.4, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("mt-1 text-3xl font-semibold tabular-nums tracking-tight", dark && "text-white")}
            >
              ₹{Math.round(monthly).toLocaleString("en-IN")}
            </motion.span>
            <span className={cn("mt-1 text-[12px]", dark ? "text-white/40" : "text-muted")}>for {years * 12} months</span>
          </div>
        </div>
        <div className={cn("mt-6 grid w-full grid-cols-2 gap-3 text-[13px]", dark ? "text-white/70" : "text-muted")}>
          <div className={cn("rounded-2xl p-4", dark ? "bg-white/5" : "bg-white")}>
            <span className="flex items-center gap-2"><i className="size-2 rounded-full bg-accent" /> Loan amount</span>
            <b className={cn("mt-1 block text-[15px] font-semibold", dark ? "text-white" : "text-ink")}>{formatPrice(principal)}</b>
          </div>
          <div className={cn("rounded-2xl p-4", dark ? "bg-white/5" : "bg-white")}>
            <span className="flex items-center gap-2"><i className={cn("size-2 rounded-full", dark ? "bg-white/20" : "bg-ink/15")} /> Total interest</span>
            <b className={cn("mt-1 block text-[15px] font-semibold", dark ? "text-white" : "text-ink")}>{formatPrice(interest)}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
