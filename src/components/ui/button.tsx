"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "ink" | "accent" | "ghost" | "light" | "outline-light";

const styles: Record<Variant, string> = {
  ink: "bg-ink text-white hover:bg-ink-2",
  accent: "bg-accent text-white",
  ghost: "border border-line bg-white/50 text-ink hover:bg-white",
  light: "bg-white text-ink hover:bg-paper",
  "outline-light": "border border-white/25 text-white hover:bg-white/10",
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
 * Pill button with a rolling-text hover: the label slides up and a copy
 * slides in from below; the arrow chip spins 45°.
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
    sm: "h-10 pl-4 pr-1.5 text-[13px]",
    md: "h-12 pl-5 pr-1.5 text-[14px]",
    lg: "h-14 pl-7 pr-2 text-[15px]",
  }[size];
  const chip = { sm: "size-7", md: "size-9", lg: "size-10" }[size];
  const cls = cn(
    "group relative inline-flex select-none items-center gap-3 rounded-full font-medium tracking-tight transition-[background,transform,opacity] duration-300 active:scale-[0.97] disabled:opacity-50",
    styles[variant],
    !arrow && "pr-5",
    sizes,
    className
  );
  const inner = (
    <>
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full">
          {children}
        </span>
        <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-out-expo group-hover:translate-y-0">
          {children}
        </span>
      </span>
      {arrow && (
        <span
          className={cn(
            "grid place-items-center rounded-full transition-transform duration-500 ease-out-expo group-hover:rotate-45",
            chip,
            variant === "ink" || variant === "accent" || variant === "outline-light"
              ? "bg-white/15"
              : "bg-ink text-white"
          )}
        >
          <ArrowUpRight className="size-4" strokeWidth={2} />
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
