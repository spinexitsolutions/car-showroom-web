"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SiteSettings } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Btn } from "./ui";
import { useToast } from "./toast";

/** Local draft of site settings with an iOS-style floating save bar. */
export function useSettingsDraft() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const logActivity = useStore((s) => s.logActivity);
  const toast = useToast();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  const patch = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const save = (what = "Website content") => {
    updateSettings(draft);
    logActivity(`${what} updated`, "cms");
    toast("Saved · changes are live");
  };
  const reset = () => setDraft(settings);
  return { draft, setDraft, patch, save, reset, dirty };
}

export function SaveBar({ dirty, onSave, onReset }: { dirty: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-white shadow-2xl shadow-black/30 md:bottom-6"
        >
          <span className="flex items-center gap-2 text-[13px]">
            <span className="size-2 animate-pulse rounded-full bg-accent" /> Unsaved changes
          </span>
          <div className="flex gap-1.5">
            <Btn variant="plain" className="!text-white/70 hover:!bg-white/10" onClick={onReset}>
              Discard
            </Btn>
            <Btn variant="accent" onClick={onSave}>
              Save
            </Btn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
