"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useEffect, useState } from "react";
import type {
  Activity,
  Car,
  Faq,
  Lead,
  LeadNote,
  Post,
  SiteSettings,
  StaffMember,
  Testimonial,
} from "./types";
import {
  seedActivity,
  seedCars,
  seedFaqs,
  seedLeads,
  seedPosts,
  seedSettings,
  seedStaff,
  seedTestimonials,
} from "./seed";
import { uid } from "./utils";

/**
 * Single client-side data store for the demo.
 * Everything (CMS content, inventory, CRM leads, settings) lives here and is
 * persisted to localStorage, so the admin panel controls the whole website
 * without needing a backend. Swap these actions for API calls to go to prod.
 */

type NewLead = Omit<Lead, "id" | "stage" | "priority" | "notes" | "createdAt" | "updatedAt"> &
  Partial<Pick<Lead, "stage" | "priority">>;

interface State {
  cars: Car[];
  leads: Lead[];
  posts: Post[];
  testimonials: Testimonial[];
  faqs: Faq[];
  staff: StaffMember[];
  settings: SiteSettings;
  activity: Activity[];
  // visitor-side
  wishlist: string[];
  compare: string[];
  // admin auth (demo)
  adminUser: { name: string; email: string } | null;

  // cars
  addCar: (car: Omit<Car, "id" | "createdAt" | "views">) => string;
  updateCar: (id: string, patch: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  incrementViews: (id: string) => void;

  // leads / CRM
  addLead: (lead: NewLead) => string;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addLeadNote: (id: string, text: string) => void;

  // CMS
  upsertPost: (post: Post) => void;
  deletePost: (id: string) => void;
  upsertTestimonial: (t: Testimonial) => void;
  deleteTestimonial: (id: string) => void;
  upsertFaq: (f: Faq) => void;
  deleteFaq: (id: string) => void;
  updateSettings: (patch: Partial<SiteSettings>) => void;
  logActivity: (text: string, kind: Activity["kind"]) => void;

  // visitor
  toggleWishlist: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // admin
  login: (email: string, password: string) => boolean;
  logout: () => void;
  resetDemo: () => void;
}

const seed = () => ({
  cars: seedCars,
  leads: seedLeads,
  posts: seedPosts,
  testimonials: seedTestimonials,
  faqs: seedFaqs,
  staff: seedStaff,
  settings: seedSettings,
  activity: seedActivity,
});

export const DEMO_ADMIN = { email: "admin@orbis.com", password: "admin123" };

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...seed(),
      wishlist: [],
      compare: [],
      adminUser: null,

      logActivity: (text, kind) =>
        set((s) => ({
          activity: [{ id: uid(), text, kind, at: new Date().toISOString() }, ...s.activity].slice(0, 60),
        })),

      addCar: (car) => {
        const id = uid();
        set((s) => ({
          cars: [{ ...car, id, views: 0, createdAt: new Date().toISOString() }, ...s.cars],
        }));
        get().logActivity(`${car.brand} ${car.model} added to inventory`, "car");
        return id;
      },
      updateCar: (id, patch) =>
        set((s) => ({ cars: s.cars.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCar: (id) => {
        const car = get().cars.find((c) => c.id === id);
        set((s) => ({
          cars: s.cars.filter((c) => c.id !== id),
          wishlist: s.wishlist.filter((w) => w !== id),
          compare: s.compare.filter((w) => w !== id),
        }));
        if (car) get().logActivity(`${car.brand} ${car.model} removed from inventory`, "car");
      },
      incrementViews: (id) =>
        set((s) => ({ cars: s.cars.map((c) => (c.id === id ? { ...c, views: c.views + 1 } : c)) })),

      addLead: (lead) => {
        const id = uid();
        const now = new Date().toISOString();
        const car = lead.carId ? get().cars.find((c) => c.id === lead.carId) : undefined;
        set((s) => ({
          leads: [
            {
              stage: "new",
              priority: lead.type === "test-drive" ? "high" : "medium",
              value: car?.price,
              ...lead,
              id,
              notes: [],
              createdAt: now,
              updatedAt: now,
            },
            ...s.leads,
          ],
        }));
        const label = lead.type.replace("-", " ");
        get().logActivity(
          `New ${label} from ${lead.name}${car ? ` · ${car.brand} ${car.model}` : ""}`,
          "lead"
        );
        return id;
      },
      updateLead: (id, patch) =>
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, ...patch, updatedAt: new Date().toISOString() } : l
          ),
        })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id !== id) })),
      addLeadNote: (id, text) => {
        const note: LeadNote = {
          id: uid(),
          text,
          at: new Date().toISOString(),
          by: get().adminUser?.name ?? "Admin",
        };
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === id ? { ...l, notes: [note, ...l.notes], updatedAt: note.at } : l
          ),
        }));
      },

      upsertPost: (post) => {
        set((s) => ({
          posts: s.posts.some((p) => p.id === post.id)
            ? s.posts.map((p) => (p.id === post.id ? post : p))
            : [post, ...s.posts],
        }));
        get().logActivity(`Journal post saved: “${post.title}”`, "cms");
      },
      deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),
      upsertTestimonial: (t) =>
        set((s) => ({
          testimonials: s.testimonials.some((x) => x.id === t.id)
            ? s.testimonials.map((x) => (x.id === t.id ? t : x))
            : [...s.testimonials, t],
        })),
      deleteTestimonial: (id) => set((s) => ({ testimonials: s.testimonials.filter((t) => t.id !== id) })),
      upsertFaq: (f) =>
        set((s) => ({
          faqs: s.faqs.some((x) => x.id === f.id) ? s.faqs.map((x) => (x.id === f.id ? f : x)) : [...s.faqs, f],
        })),
      deleteFaq: (id) => set((s) => ({ faqs: s.faqs.filter((f) => f.id !== id) })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id) ? s.wishlist.filter((w) => w !== id) : [...s.wishlist, id],
        })),
      toggleCompare: (id) =>
        set((s) => {
          if (s.compare.includes(id)) return { compare: s.compare.filter((c) => c !== id) };
          return { compare: [...s.compare, id].slice(-3) };
        }),
      clearCompare: () => set({ compare: [] }),

      login: (email, password) => {
        if (email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
          set({ adminUser: { name: "Aarav Mehta", email } });
          return true;
        }
        return false;
      },
      logout: () => set({ adminUser: null }),
      resetDemo: () => set({ ...seed(), wishlist: [], compare: [] }),
    }),
    {
      name: "orbis-store-v1",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);

/** Rehydrate the persisted store once on the client. */
export function useStoreHydration() {
  const [hydrated, setHydrated] = useState(() => useStore.persist?.hasHydrated?.() ?? false);
  useEffect(() => {
    if (useStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = useStore.persist.onFinishHydration(() => setHydrated(true));
    useStore.persist.rehydrate();
    return unsub;
  }, []);
  return hydrated;
}

/** True once the persisted store has been loaded from localStorage. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => {
    if (useStore.persist.hasHydrated()) setH(true);
    return useStore.persist.onFinishHydration(() => setH(true));
  }, []);
  return h;
}

export const useSettings = () => useStore((s) => s.settings);
