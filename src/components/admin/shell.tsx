"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  CarFront,
  ExternalLink,
  FileText,
  HelpCircle,
  Kanban,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  MoreHorizontal,
  Newspaper,
  PanelLeftClose,
  PanelLeft,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useHydrated, useStore } from "@/lib/store";
import { carName, cn } from "@/lib/utils";
import { AdminLogin } from "./login";
import { ToastProvider } from "./toast";
import { Avatar, Drawer } from "./ui";

const GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads & pipeline", icon: Kanban },
      { href: "/admin/test-drives", label: "Test drives", icon: CalendarClock },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Catalogue",
    items: [{ href: "/admin/inventory", label: "Inventory", icon: CarFront }],
  },
  {
    label: "CMS",
    items: [
      { href: "/admin/content", label: "Website content", icon: FileText },
      { href: "/admin/journal", label: "Journal", icon: Newspaper },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
    ],
  },
  {
    label: "System",
    items: [{ href: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const MOBILE_TABS = [
  { href: "/admin", label: "Home", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Kanban },
  { href: "/admin/inventory", label: "Cars", icon: CarFront },
  { href: "/admin/content", label: "Content", icon: FileText },
];

const isActive = (path: string, href: string) =>
  href === "/admin" ? path === "/admin" : path === href || path.startsWith(href + "/");

export function AdminShell({ children }: { children: React.ReactNode }) {
  const hydrated = useHydrated();
  const user = useStore((s) => s.adminUser);

  if (!hydrated)
    return (
      <div className="grid min-h-dvh place-items-center bg-paper">
        <div className="size-8 animate-spin rounded-full border-2 border-ink/10 border-t-accent" />
      </div>
    );
  if (!user) return <AdminLogin />;
  return (
    <ToastProvider>
      <Frame>{children}</Frame>
    </ToastProvider>
  );
}

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  const newLeads = useStore((s) => s.leads.filter((l) => l.stage === "new").length);
  return (
    <nav className="space-y-5">
      {GROUPS.map((g) => (
        <div key={g.label}>
          {!collapsed && <p className="eyebrow mb-1.5 px-3 !text-[10px] text-muted/70">{g.label}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => {
              const active = isActive(path, it.href);
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={onNavigate}
                    title={collapsed ? it.label : undefined}
                    className={cn(
                      "relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors",
                      active ? "text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink",
                      collapsed && "justify-center px-0"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId={onNavigate ? "nav-active-m" : "nav-active"}
                        className="absolute inset-0 rounded-xl bg-ink"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <Icon className="relative size-[18px] shrink-0" strokeWidth={1.8} />
                    {!collapsed && <span className="relative flex-1 truncate">{it.label}</span>}
                    {!collapsed && it.href === "/admin/leads" && newLeads > 0 && (
                      <span
                        className={cn(
                          "relative rounded-full px-2 py-0.5 text-[11px] font-semibold",
                          active ? "bg-white/20 text-white" : "bg-accent text-accent-ink"
                        )}
                      >
                        {newLeads}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const user = useStore((s) => s.adminUser)!;
  const logout = useStore((s) => s.logout);
  const brand = useStore((s) => s.settings.brandShort);

  return (
    <div className="min-h-dvh bg-paper">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-paper-2/60 backdrop-blur-xl md:flex"
      >
        <div className={cn("flex h-16 items-center gap-3 px-5", collapsed && "justify-center px-0")}>
          <Link href="/admin" className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-[14px] font-bold text-white">
            {brand.slice(0, 1)}
          </Link>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold tracking-tight">{brand}</p>
              <p className="eyebrow !text-[9.5px] text-muted">Dealer OS</p>
            </div>
          )}
        </div>
        <div className={cn("flex-1 overflow-y-auto pb-4 pt-3", collapsed ? "px-3" : "px-3")}>
          <NavList collapsed={collapsed} />
        </div>
        <div className="border-t border-line p-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13px] text-muted hover:bg-ink/5 hover:text-ink",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? <PanelLeft className="size-[18px]" /> : <PanelLeftClose className="size-[18px]" />}
            {!collapsed && "Collapse"}
          </button>
        </div>
      </motion.aside>

      <motion.div
        animate={{ paddingLeft: collapsed ? 76 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        className="max-md:!pl-0"
      >
        {/* Top bar */}
        <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line px-4 md:px-8">
          <Link href="/admin" className="grid size-9 shrink-0 place-items-center rounded-xl bg-ink text-[14px] font-bold text-white md:hidden">
            {brand.slice(0, 1)}
          </Link>
          <GlobalSearch />
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-medium hover:bg-paper sm:flex"
            >
              View site <ExternalLink className="size-3.5" />
            </Link>
            <UserMenu name={user.name} email={user.email} onLogout={logout} />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main key={path} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {children}
          </motion.main>
        </AnimatePresence>
      </motion.div>

      {/* Mobile tab bar */}
      <nav className="glass fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-[1.4rem] border border-line p-1.5 shadow-xl shadow-black/5 md:hidden" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
        {MOBILE_TABS.map((t) => {
          const active = isActive(path, t.href);
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href} className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2">
              {active && (
                <motion.span layoutId="tab-active" className="absolute inset-0 rounded-2xl bg-ink" transition={{ type: "spring", stiffness: 420, damping: 36 }} />
              )}
              <Icon className={cn("relative size-5", active ? "text-white" : "text-ink/60")} strokeWidth={1.8} />
              <span className={cn("relative text-[10.5px] font-medium", active ? "text-white" : "text-ink/60")}>{t.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMoreOpen(true)} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-ink/60">
          <MoreHorizontal className="size-5" />
          <span className="text-[10.5px] font-medium">More</span>
        </button>
      </nav>
      <Drawer open={moreOpen} onClose={() => setMoreOpen(false)} title="Menu">
        <NavList onNavigate={() => setMoreOpen(false)} />
        <Link href="/" target="_blank" className="mt-6 flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white text-[14px] font-medium">
          View website <ExternalLink className="size-4" />
        </Link>
      </Drawer>
    </div>
  );
}

function UserMenu({ name, email, onLogout }: { name: string; email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 hover:bg-ink/5 sm:pr-3">
        <Avatar name={name} size={36} />
        <span className="hidden text-[13px] font-medium lg:block">{name}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-60 origin-top-right rounded-2xl border border-line bg-white p-2 shadow-2xl shadow-black/10"
          >
            <div className="px-3 py-2">
              <p className="text-[14px] font-semibold">{name}</p>
              <p className="text-[12px] text-muted">{email}</p>
            </div>
            <Link href="/admin/settings" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] hover:bg-paper">
              <Settings className="size-4" /> Settings
            </Link>
            <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] text-red-600 hover:bg-red-50">
              <LogOut className="size-4" /> Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlobalSearch() {
  const router = useRouter();
  const cars = useStore((s) => s.cars);
  const leads = useStore((s) => s.leads);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    const c = cars
      .filter((x) => carName(x).toLowerCase().includes(s))
      .slice(0, 4)
      .map((x) => ({ id: x.id, label: carName(x), sub: "Inventory", href: `/admin/inventory/${x.id}`, img: x.images[0] }));
    const l = leads
      .filter((x) => `${x.name} ${x.email} ${x.phone}`.toLowerCase().includes(s))
      .slice(0, 5)
      .map((x) => ({ id: x.id, label: x.name, sub: `Lead · ${x.type}`, href: `/admin/leads?lead=${x.id}`, img: "" }));
    return [...l, ...c];
  }, [q, cars, leads]);

  return (
    <div className="relative min-w-0 flex-1 md:max-w-md">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
      <input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search leads, cars…"
        className="h-10 w-full rounded-full border border-line bg-white/70 pl-10 pr-14 text-[14px] outline-none transition focus:border-ink focus:bg-white"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
        ⌘K
      </kbd>
      <AnimatePresence>
        {open && q && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-2xl shadow-black/10"
          >
            {results.length === 0 ? (
              <p className="px-3 py-4 text-center text-[13px] text-muted">No matches for “{q}”</p>
            ) : (
              results.map((r) => (
                <button
                  key={r.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    router.push(r.href);
                    setQ("");
                    setOpen(false);
                    inputRef.current?.blur();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-paper"
                >
                  {r.img ? (
                    <img src={r.img} alt="" className="size-9 rounded-lg object-cover" />
                  ) : (
                    <Avatar name={r.label} size={36} />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium">{r.label}</span>
                    <span className="eyebrow block !text-[9.5px] text-muted">{r.sub}</span>
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
