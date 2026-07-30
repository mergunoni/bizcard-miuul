export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "bizcard-theme";

// Kayıtlı tercih varsa o, yoksa işletim sistemi tercihi (prefers-color-scheme).
export function readStoredTheme(): Theme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}
