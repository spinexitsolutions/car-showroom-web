"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useSpring, useTransform } from "framer-motion";
import { EASE } from "@/lib/utils";

/* Instrument-cluster building blocks shared by the hero and car pages. */

export const num = (s: string) => parseFloat(s.replace(/,/g, "")) || 0;

/** Number that tweens from its previous value whenever `value` changes. */
export function Tween({
  value,
  format = (v) => Math.round(v).toLocaleString("en-IN"),
}: {
  value: number;
  format?: (v: number) => string;
}) {
  const [v, setV] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 1.1, ease: EASE, onUpdate: setV });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <span className="tabular-nums">{format(v)}</span>;
}

const R = 82;
const C = 2 * Math.PI * R;

/** Speedometer: 240° arc with ticks; the needle springs to the car's power. */
export function Gauge({
  hp,
  max: MAX = 1100,
  label = "Horsepower",
  suffix = "",
  size = "size-[min(210px,24vh)]",
}: {
  hp: number;
  max?: number;
  label?: string;
  suffix?: string;
  size?: string;
}) {
  const angle = useSpring(-120, { stiffness: 60, damping: 14, mass: 1.2 });
  useEffect(() => {
    angle.set(-120 + 240 * Math.min(1, hp / MAX));
  }, [hp, angle, MAX]);
  const rotate = useTransform(angle, (a) => `rotate(${a}deg)`);
  const dash = useTransform(angle, (a) => `${((a + 120) / 360) * C} ${C}`);
  return (
    <div className={`relative ${size}`}>
      <svg viewBox="0 0 200 200" className="size-full">
        <circle cx="100" cy="100" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"
          strokeDasharray={`${(240 / 360) * C} ${C}`} transform="rotate(150 100 100)" />
        <motion.circle cx="100" cy="100" r={R} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round"
          style={{ strokeDasharray: dash }} transform="rotate(150 100 100)" />
        {Array.from({ length: 25 }).map((_, i) => {
          const a = ((-120 + i * 10 - 90) * Math.PI) / 180;
          const major = i % 4 === 0;
          const r1 = major ? 63 : 68;
          return (
            <line key={i} x1={100 + Math.cos(a) * r1} y1={100 + Math.sin(a) * r1}
              x2={100 + Math.cos(a) * 73} y2={100 + Math.sin(a) * 73}
              stroke={major ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.25)"} strokeWidth={major ? 1.5 : 1} />
          );
        })}
        {[0, 4, 8, 12, 16, 20, 24].map((i) => {
          const a = ((-120 + i * 10 - 90) * Math.PI) / 180;
          return (
            <text key={i} x={100 + Math.cos(a) * 52} y={100 + Math.sin(a) * 52 + 3} textAnchor="middle"
              fill="rgba(255,255,255,0.4)" fontSize="8" fontWeight="600">
              {MAX >= 500 ? Math.round(((i / 24) * MAX) / 100) * 100 : Math.round((i / 24) * MAX)}
            </text>
          );
        })}
        <motion.g style={{ rotate, originX: "100px", originY: "100px" }}>
          <line x1="100" y1="100" x2="100" y2="30" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="100" r="6" fill="#0a0a0c" stroke="var(--accent)" strokeWidth="2" />
      </svg>
      <div className="absolute inset-x-0 bottom-5 text-center">
        <p className="display text-4xl text-white"><Tween value={hp} />{suffix && <span className="text-[0.55em] text-white/50">{suffix}</span>}</p>
        <p className="eyebrow mt-1 text-white/45">{label}</p>
      </div>
    </div>
  );
}

