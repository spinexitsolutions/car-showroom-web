"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn, EASE } from "@/lib/utils";

/** Swipeable hero gallery with thumbnails and a fullscreen lightbox. */
export function CarGallery({ images, alt }: { images: string[]; alt: string }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [open, setOpen] = useState(false);
  const n = images.length;

  const go = useCallback(
    (d: number) => setState(([i]) => [(i + d + n) % n, d]),
    [n]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "12%" : d < 0 ? "-12%" : 0, opacity: 0, scale: 1.04 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: d > 0 ? "-12%" : "12%", opacity: 0, scale: 0.98 }),
  };

  const renderSlide = (big?: boolean) => (
    <AnimatePresence initial={false} custom={dir} mode="popLayout">
      <motion.img
        key={index}
        src={images[index]}
        alt={alt}
        custom={dir}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.8, ease: EASE }}
        drag={n > 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.25}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) go(1);
          else if (info.offset.x > 60) go(-1);
        }}
        className={cn(
          "absolute inset-0 h-full w-full cursor-grab select-none active:cursor-grabbing",
          big ? "object-contain" : "object-cover"
        )}
        draggable={false}
      />
    </AnimatePresence>
  );

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-ink md:aspect-[16/10]">
        {renderSlide()}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <span className="eyebrow rounded-full bg-black/40 px-3 py-1.5 text-white backdrop-blur">
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
          <div className="flex gap-2">
            {n > 1 && (
              <>
                <button aria-label="Previous" onClick={() => go(-1)} className="grid size-10 place-items-center rounded-full bg-white/85 text-ink backdrop-blur transition active:scale-90">
                  <ChevronLeft className="size-4" />
                </button>
                <button aria-label="Next" onClick={() => go(1)} className="grid size-10 place-items-center rounded-full bg-white/85 text-ink backdrop-blur transition active:scale-90">
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}
            <button aria-label="Fullscreen" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-full bg-white/85 text-ink backdrop-blur transition active:scale-90">
              <Expand className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {n > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setState([i, i > index ? 1 : -1])}
              className={cn(
                "relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-2xl transition-opacity md:w-32",
                i === index ? "opacity-100" : "opacity-50 hover:opacity-80"
              )}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === index && (
                <motion.span layoutId="thumb-ring" className="absolute inset-0 rounded-2xl ring-2 ring-inset ring-accent" />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <div className="absolute inset-0">
              {renderSlide(true)}
            </div>
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <X className="size-5" />
            </button>
            {n > 1 && (
              <div className="absolute inset-x-0 bottom-8 flex items-center justify-center gap-3">
                <button aria-label="Previous" onClick={() => go(-1)} className="grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur">
                  <ChevronLeft className="size-5" />
                </button>
                <span className="eyebrow text-white/70">
                  {index + 1} / {n}
                </span>
                <button aria-label="Next" onClick={() => go(1)} className="grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur">
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
