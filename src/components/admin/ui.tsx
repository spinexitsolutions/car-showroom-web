"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn, EASE } from "@/lib/utils";

export function AdminPage({
  eyebrow,
  title,
  italic,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-6 md:px-8 md:pb-16 md:pt-8"
    >
      <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow flex items-center gap-2 text-muted">
            <span className="size-1.5 rounded-full bg-accent" />
            {eyebrow}
          </p>
          <h1 className="mt-2 text-[32px] font-semibold leading-none tracking-[-0.04em] md:text-[44px]">
            {title} {italic && <span className="em-light text-muted">{italic}</span>}
          </h1>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </motion.div>
  );
}

export function Card({
  children,
  className,
  title,
  action,
  pad = true,
}: {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  action?: React.ReactNode;
  pad?: boolean;
}) {
  return (
    <section className={cn("rounded-3xl border border-line bg-white/80 shadow-[0_1px_0_rgba(0,0,0,0.02)]", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          {action}
        </div>
      )}
      <div className={cn(pad && "p-5")}>{children}</div>
    </section>
  );
}

export function Btn({
  children,
  onClick,
  variant = "ghost",
  className,
  type = "button",
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "ink" | "ghost" | "accent" | "danger" | "plain";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  const v = {
    ink: "bg-ink text-white hover:bg-ink-2",
    accent: "bg-accent text-accent-ink hover:brightness-110",
    ghost: "border border-line bg-white hover:bg-paper",
    danger: "border border-red-500/20 bg-red-500/5 text-red-600 hover:bg-red-500/10",
    plain: "hover:bg-ink/5",
  }[variant];
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-medium tracking-tight transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
        v,
        className
      )}
    >
      {children}
    </button>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <span className="eyebrow mb-2 block text-muted">{children}</span>;
}

export function Field({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      <input {...props} className={cn("field !py-2.5 text-[14px]", props.type === "color" && "!h-11 !p-1")} />
      {hint && <span className="mt-1.5 block text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      <textarea {...props} className="field resize-y !py-2.5 text-[14px] leading-relaxed" />
    </label>
  );
}

export function Select({
  label,
  options,
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: (string | { value: string; label: string })[];
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  const el = (
    <select {...props} className={cn("field !py-2.5 text-[14px]", !label && className)}>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
  if (!label) return el;
  return (
    <label className={cn("block", className)}>
      <Label>{label}</Label>
      {el}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
}) {
  const sw = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
        checked ? "bg-accent" : "bg-ink/15"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn("absolute top-1 size-5 rounded-full bg-white shadow", checked ? "right-1" : "left-1")}
      />
    </button>
  );
  if (!label) return sw;
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-[14px] font-medium">{label}</p>
        {description && <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>}
      </div>
      {sw}
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  id = "tabs",
  className,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("no-scrollbar -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <div className="inline-flex gap-1 rounded-full border border-line bg-white p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              "relative whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
              value === t.id ? "text-white" : "text-muted hover:text-ink"
            )}
          >
            {value === t.id && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium", className)}>
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 32 }: { name: string; src?: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src)
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover ring-2 ring-white"
      />
    );
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-ink to-ink-2 font-semibold text-white ring-2 ring-white"
    >
      {initials}
    </span>
  );
}

/** Slide-over panel from the right (bottom sheet on mobile). */
export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    setIsMobile(m.matches);
    const on = () => setIsMobile(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.aside
            data-lenis-prevent
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className={cn(
              "absolute flex flex-col bg-paper shadow-2xl",
              "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[2rem]",
              "md:inset-y-2 md:left-auto md:right-2 md:max-h-none md:rounded-[2rem]",
              wide ? "md:w-[680px]" : "md:w-[520px]"
            )}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-ink/15 md:hidden" />
            <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
              <div className="min-w-0 text-[17px] font-semibold tracking-tight">{title}</div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-ink/5 hover:bg-ink/10"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
            {footer && <div className="border-t border-line px-5 py-4 md:px-6">{footer}</div>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Empty({ icon, title, text }: { icon: React.ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-ink/5 text-muted">{icon}</div>
      <p className="mt-4 font-semibold tracking-tight">{title}</p>
      {text && <p className="mt-1 max-w-xs text-[13px] text-muted">{text}</p>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field !rounded-full !py-2.5 !pl-10 text-[14px]"
      />
    </div>
  );
}
