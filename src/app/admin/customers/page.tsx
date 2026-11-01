"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, EASE, formatPrice, timeAgo } from "@/lib/utils";
import { AdminPage, Avatar, Chip, Empty, SearchInput, Tabs } from "@/components/admin/ui";
import { TYPE_MAP } from "@/components/admin/constants";
import type { LeadType } from "@/lib/types";

type Seg = "all" | "buyers" | "prospects";

export default function CustomersPage() {
  const leads = useStore((s) => s.leads);
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<Seg>("all");

  const customers = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; email: string; phone: string; count: number; won: number; last: string; types: Set<LeadType>; leadId: string }
    >();
    leads.forEach((l) => {
      const key = (l.email || l.phone).toLowerCase();
      const c = map.get(key);
      if (!c) {
        map.set(key, {
          key,
          name: l.name,
          email: l.email,
          phone: l.phone,
          count: 1,
          won: l.stage === "won" ? l.value ?? 0 : 0,
          last: l.updatedAt,
          types: new Set([l.type]),
          leadId: l.id,
        });
      } else {
        c.count++;
        if (l.stage === "won") c.won += l.value ?? 0;
        if (l.updatedAt > c.last) {
          c.last = l.updatedAt;
          c.leadId = l.id;
        }
        c.types.add(l.type);
      }
    });
    const s = q.trim().toLowerCase();
    return [...map.values()]
      .filter((c) => (seg === "buyers" ? c.won > 0 : seg === "prospects" ? c.won === 0 : true))
      .filter((c) => !s || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(s))
      .sort((a, b) => b.last.localeCompare(a.last));
  }, [leads, q, seg]);

  const lifetime = customers.reduce((a, c) => a + c.won, 0);

  return (
    <AdminPage eyebrow="CRM" title="Customers" italic={`· ${customers.length}`}>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Tabs<Seg>
            id="seg"
            value={seg}
            onChange={setSeg}
            tabs={[
              { id: "all", label: "All" },
              { id: "buyers", label: "Buyers" },
              { id: "prospects", label: "Prospects" },
            ]}
          />
          <SearchInput value={q} onChange={setQ} placeholder="Search customers…" className="md:w-72" />
        </div>
        <p className="font-mono text-[12px] text-muted">Lifetime value · <b className="text-ink">{formatPrice(lifetime)}</b></p>
      </div>

      {customers.length === 0 ? (
        <div className="chamfer border border-line bg-white/80">
          <Empty icon={<Users className="size-6" />} title="No customers found" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {customers.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.5, ease: EASE }}
              className="group chamfer border border-line bg-white/90 p-5 transition-shadow hover:shadow-xl hover:shadow-black/5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={c.name} size={44} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold tracking-tight">{c.name}</p>
                    <p className="font-mono text-[11px] text-muted">Active {timeAgo(c.last)}</p>
                  </div>
                </div>
                {c.won > 0 && <Chip className="bg-emerald-500/10 text-emerald-700">Buyer</Chip>}
              </div>
              <div className="mt-4 space-y-1.5 text-[13px] text-ink/70">
                <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:text-ink"><Phone className="size-3.5" /> {c.phone}</a>
                <a href={`mailto:${c.email}`} className="flex items-center gap-2 truncate hover:text-ink"><Mail className="size-3.5" /> {c.email}</a>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {[...c.types].map((t) => (
                  <Chip key={t} className={TYPE_MAP[t].tone}>{TYPE_MAP[t].label}</Chip>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
                <div>
                  <p className="eyebrow !text-[9.5px] text-muted">Interactions</p>
                  <p className="text-lg font-semibold">{c.count}</p>
                </div>
                <div>
                  <p className="eyebrow !text-[9.5px] text-muted">Value won</p>
                  <p className={cn("text-lg font-semibold", !c.won && "text-muted")}>{c.won ? formatPrice(c.won) : "—"}</p>
                </div>
              </div>
              <Link href={`/admin/leads?lead=${c.leadId}`} className="eyebrow mt-4 inline-block !text-[10px] text-muted link-u">
                Open latest lead →
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
