import clsx, { type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const uid = () =>
  Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

/** ₹ 3.35 Cr / ₹ 59 L style formatting (Indian numbering). */
export function formatPrice(n: number, compact = true) {
  if (!compact) return "₹ " + Math.round(n).toLocaleString("en-IN");
  if (n >= 1e7) return `₹ ${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹ ${trim(n / 1e5)} L`;
  return "₹ " + Math.round(n).toLocaleString("en-IN");
}
const trim = (v: number) => (Math.round(v * 100) / 100).toString();

export const formatNumber = (n: number) => Math.round(n).toLocaleString("en-IN");

export function emi(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 0) return "upcoming";
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const carName = (c: { brand: string; model: string; variant?: string }) =>
  `${c.brand} ${c.model}${c.variant ? " " + c.variant : ""}`;

export const EASE = [0.22, 1, 0.36, 1] as const; // expo-ish out
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;
