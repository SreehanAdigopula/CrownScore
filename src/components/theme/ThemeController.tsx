"use client";

import { useEffect } from "react";

export const THEME_KEY = "crownscore-theme";
export type CrownScoreTheme = "light" | "dark";

export function applyCrownScoreTheme(theme: CrownScoreTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function getStoredCrownScoreTheme(): CrownScoreTheme {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function persistCrownScoreTheme(theme: CrownScoreTheme) {
  localStorage.setItem(THEME_KEY, theme);
  applyCrownScoreTheme(theme);
}

export function ThemeController() {
  useEffect(() => {
    applyCrownScoreTheme(getStoredCrownScoreTheme());
  }, []);

  return null;
}
