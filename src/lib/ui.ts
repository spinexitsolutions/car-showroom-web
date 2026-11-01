"use client";

import { create } from "zustand";

/** Ephemeral UI state (not persisted). */
interface UI {
  introDone: boolean;
  menuOpen: boolean;
  annVisible: boolean;
  setAnnVisible: (v: boolean) => void;
  setIntroDone: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
}

export const useUI = create<UI>()((set) => ({
  introDone: false,
  menuOpen: false,
  annVisible: false,
  setAnnVisible: (annVisible) => set({ annVisible }),
  setIntroDone: (introDone) => set({ introDone }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
}));

export const INTRO_KEY = "orbis-intro-seen";
