import type { DemoScenario } from "@/server/domain/types";

const KEY = "folliq-demo-scenario";
export function getDemoScenario(): DemoScenario {
  if (typeof window === "undefined") return "healthy";
  const value = localStorage.getItem(KEY);
  return value === "shedding" || value === "adherence" || value === "safety" ? value : "healthy";
}
export function setDemoScenario(value: DemoScenario) {
  localStorage.setItem(KEY, value);
  window.dispatchEvent(new CustomEvent("folliq:scenario", { detail: value }));
}
