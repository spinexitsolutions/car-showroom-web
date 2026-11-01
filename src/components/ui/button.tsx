"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "ink" | "accent" | "ghost" | "light" | "outline-light";

const styles: Record<Variant, string> = {
  ink: "bg-ink text-white",
  accent: "bg-accent text-accent-ink",
  ghost: "bg-ink/[0.06] text-ink hover:bg-ink/10",
  light: "bg-white text-ink",
  "outline-light": "bg-white/10 text-white hover:bg-white/15",
};

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  arrow?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Chamfered "instrument" button. Hover: an accent bar wipes across from the
 * left, the label rolls up, and the arrow cell slides out and back in.
 */
export function Button({
  children,
  href,
  onClick,
  variant = "ink",
  className,
  type = "button",
  disabled,
  arrow = true,
  size = "md",
}: Props) {
  const sizes = {
    sm: "h-10 text-[12px]",
    md: "h-12 text-[13px]",
    lg: "h-14 text-[14px]",
  }[size];
  const pad = { sm: "px-4", md: "px-5", lg: "px-6" }[size];
  const cell = { sm: "w-10", md: "w-12", lg: "w-14" }[size];
  const wipe = variant === "accent" ? "bg-ink" : variant === "light" ? "bg-accent" : "bg-accent";
  const cls = cn(
    "chamfer chamfer-sm group relative inline-flex select-none items-stretch overflow-hidden font-semibold uppercase tracking-[0.08em] [font-family:var(--font-chakra)] transition-transform duration-300 active:scale-[0.97] disabled:opacity-50",
    styles[variant],
    sizes,
    className
  );
  const inner = (
    <>
      <span className={cn("absolute inset-0 -translate-x-[101%] transition-transform duration-500 ease-out-expo group-hover:translate-x-0", wipe)} />
      <span className={cn("relative flex flex-1 items-center justify-between gap-3 overflow-hidden transition-colors duration-300", pad, variant !== "accent" && "group-hover:text-accent-ink", variant === "accent" && "group-hover:text-white")}>
        <span className="relative block overflow-hidden">
          <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">{children}</span>
          <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">{children}</span>
        </span>
      </span>
      {arrow && (
        <span className={cn("relative grid shrink-0 place-items-center overflow-hidden border-l border-current/15 transition-colors duration-300", cell, variant !== "accent" && "group-hover:text-accent-ink", variant === "accent" && "group-hover:text-white")}>
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-6 group-hover:-translate-y-6" strokeWidth={2} />
          <ArrowUpRight className="absolute size-4 -translate-x-6 translate-y-6 transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0" strokeWidth={2} />
        </span>
      )}
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
