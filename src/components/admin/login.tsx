"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { DEMO_ADMIN, useStore } from "@/lib/store";
import { u } from "@/lib/seed";
import { EASE } from "@/lib/utils";

export function AdminLogin() {
  const login = useStore((s) => s.login);
  const brand = useStore((s) => s.settings.brandShort);
  const [email, setEmail] = useState(DEMO_ADMIN.email);
  const [password, setPassword] = useState(DEMO_ADMIN.password);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(email, password)) {
      setError("Those credentials don't match. Try the demo login below.");
      setShake((s) => s + 1);
    }
  }

  return (
    <div className="relative grid min-h-dvh bg-ink text-white lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: EASE }}
          src={u("1617814076367-b759c7d7e738", 1800)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/30 via-ink/20 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        <div className="absolute bottom-12 left-12 max-w-md">
          <p className="eyebrow text-white/50">Dealer OS</p>
          <h2 className="display mt-4 text-6xl">
            Run the showroom <span className="em-light text-accent">beautifully.</span>
          </h2>
          <p className="mt-5 text-white/60">
            Inventory, leads, test drives and every word on your website — one calm place.
          </p>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-5 py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px circle at 70% 20%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 60%)",
          }}
        />
        <motion.div
          key={shake}
          initial={{ opacity: 0, y: 20 }}
          animate={shake ? { x: [0, -10, 10, -6, 6, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          transition={{ duration: shake ? 0.45 : 0.9, ease: EASE }}
          className="relative w-full max-w-sm"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-white text-[15px] font-bold tracking-tighter text-ink">
              {brand.slice(0, 1)}
            </span>
            <div>
              <p className="font-semibold tracking-tight">{brand}</p>
              <p className="eyebrow !text-[10px] text-white/40">Admin console</p>
            </div>
          </div>

          <h1 className="mt-10 text-4xl font-semibold tracking-[-0.04em]">
            Welcome <span className="em-light text-white/60">back.</span>
          </h1>
          <p className="mt-2 text-[14px] text-white/50">Sign in to manage your showroom.</p>

          <form onSubmit={submit} className="mt-8 space-y-3.5">
            <label className="block">
              <span className="eyebrow mb-2 block text-white/40">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="field field-dark" />
            </label>
            <label className="block">
              <span className="eyebrow mb-2 block text-white/40">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="field field-dark"
              />
            </label>
            {error && <p className="text-[13px] text-red-400">{error}</p>}
            <button
              type="submit"
              className="group mt-2 flex h-13 w-full items-center justify-between rounded-full bg-white py-2 pl-6 pr-2 text-[15px] font-medium text-ink transition active:scale-[0.98]"
            >
              Sign in
              <span className="grid size-9 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </button>
          </form>

          <div className="mt-8 flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-[13px]">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
            <div className="text-white/60">
              <p className="font-medium text-white">Demo access</p>
              <p className="mt-1 font-mono text-[12px]">
                {DEMO_ADMIN.email} · {DEMO_ADMIN.password}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
