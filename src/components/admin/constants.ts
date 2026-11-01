import type { LeadPriority, LeadStage, LeadType } from "@/lib/types";

export const STAGES: { id: LeadStage; label: string; dot: string }[] = [
  { id: "new", label: "New", dot: "bg-sky-500" },
  { id: "contacted", label: "Contacted", dot: "bg-violet-500" },
  { id: "qualified", label: "Qualified", dot: "bg-amber-500" },
  { id: "negotiation", label: "Negotiation", dot: "bg-orange-500" },
  { id: "won", label: "Won", dot: "bg-emerald-500" },
  { id: "lost", label: "Lost", dot: "bg-zinc-400" },
];

export const STAGE_MAP = Object.fromEntries(STAGES.map((s) => [s.id, s])) as Record<
  LeadStage,
  (typeof STAGES)[number]
>;

export const LEAD_TYPES: { id: LeadType; label: string; tone: string }[] = [
  { id: "enquiry", label: "Enquiry", tone: "bg-sky-500/10 text-sky-700" },
  { id: "test-drive", label: "Test drive", tone: "bg-accent/10 text-accent" },
  { id: "trade-in", label: "Trade-in", tone: "bg-violet-500/10 text-violet-700" },
  { id: "service", label: "Service", tone: "bg-teal-500/10 text-teal-700" },
  { id: "finance", label: "Finance", tone: "bg-amber-500/10 text-amber-700" },
  { id: "contact", label: "Contact", tone: "bg-zinc-500/10 text-zinc-700" },
  { id: "newsletter", label: "Newsletter", tone: "bg-pink-500/10 text-pink-700" },
];

export const TYPE_MAP = Object.fromEntries(LEAD_TYPES.map((t) => [t.id, t])) as Record<
  LeadType,
  (typeof LEAD_TYPES)[number]
>;

export const PRIORITIES: { id: LeadPriority; label: string; tone: string }[] = [
  { id: "low", label: "Low", tone: "bg-zinc-500/10 text-zinc-600" },
  { id: "medium", label: "Medium", tone: "bg-amber-500/10 text-amber-700" },
  { id: "high", label: "High", tone: "bg-red-500/10 text-red-600" },
];

export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.id, p])) as Record<
  LeadPriority,
  (typeof PRIORITIES)[number]
>;

export const ACCENT_PRESETS = ["#ff5b1f", "#2563eb", "#10b981", "#e11d48", "#a855f7", "#d4a017"];
