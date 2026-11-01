"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  animate,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn, EASE } from "@/lib/utils";

/** Fade + rise + un-blur when scrolled into view. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  as?: "div" | "section" | "li" | "span";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-8% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Masked line-by-line / word-by-word headline reveal. */
export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  trigger = "inView",
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  trigger?: "inView" | "mount";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const show = trigger === "mount" ? true : inView;
  const words = text.split(" ");
  return (
    <span ref={ref} className={cn("inline", className)} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span
            className={cn("inline-block will-change-transform", wordClassName)}
            initial={{ y: "110%", rotate: 4 }}
            animate={show ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Element that gently follows the pointer (desktop only). */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Number that counts up when visible. */
export function Counter({
  value,
  suffix = "",
  prefix = "",
  decimals,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const d = decimals ?? (Number.isInteger(value) ? 0 : 1);
  const [display, setDisplay] = useState((0).toFixed(d));
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setDisplay(Number(v.toFixed(d)).toLocaleString("en-IN", { minimumFractionDigits: d })),
    });
    return () => controls.stop();
  }, [inView, value, d]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

/** Image with scroll-linked parallax inside an overflow-hidden frame. */
export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  amount = 12,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        style={{ y, scale: 1 + amount / 50 }}
        className={cn("absolute inset-0 h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}

/** Word that fades from 15% to 100% opacity as the scroll passes it. */
export function ScrollWord({
  children,
  progress,
  range,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {children}
    </motion.span>
  );
}
