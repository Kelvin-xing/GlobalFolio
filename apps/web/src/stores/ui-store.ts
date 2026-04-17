import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  baseCurrency: string;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setBaseCurrency: (currency: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      baseCurrency: "USD",
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setBaseCurrency: (currency) => set({ baseCurrency: currency }),
    }),
    { name: "globalfolio-ui" }
  )
);
