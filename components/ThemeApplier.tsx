"use client";

import { useEffect } from "react";
import { readStoredTheme } from "@/lib/theme";

// Tema düğmesi olmayan sayfalarda (ör. /privacy) kayıtlı tema tercihini uygular.
export function ThemeApplier() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", readStoredTheme());
  }, []);

  return null;
}
