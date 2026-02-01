import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("teachmate-theme") || "forest",
  setTheme: (theme) => {
    localStorage.setItem("teachmate-theme", theme);
    set({ theme });
  },
}));
