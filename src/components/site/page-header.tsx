"use client";

import { motion } from "framer-motion";
import { SplitText } from "@/components/ui/motion";
import { cn, EASE } from "@/lib/utils";

/**
 * Shared hero for inner pages: mono breadcrumb, oversized headline with
 * serif-italic emphasis, optional description + right-side slot.
 */
export function PageHeader({
  eyebrow,
  title,
  italic,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("container-x pb-10 pt-32 md:pb-16 md:pt-44", className)}>
      <motion.p
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="eyebrow flex items-center gap-3 text-muted"
      >
        <span className="size-1.5 rounded-full bg-accent" />
        {eyebrow}
      </motion.p>
      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <h1 className="display max-w-5xl text-[48px] sm:text-7xl lg:text-[112px]">
          <SplitText text={title} trigger="mount" delay={0.1} />
          {italic && (
            <>
              {" "}
              <SplitText text={italic} wordClassName="serif-i" trigger="mount" delay={0.25} />
            </>
          )}
        </h1>
        {(description || children) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
            className="max-w-sm shrink-0"
          >
            {description && <p className="text-[16px] leading-relaxed text-muted">{description}</p>}
            {children}
          </motion.div>
        )}
      </div>
    </header>
  );
}
