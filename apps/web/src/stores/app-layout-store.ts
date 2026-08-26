import { create } from "zustand";

type AppLayoutStore = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
};

export const useAppLayoutStore = create<AppLayoutStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
