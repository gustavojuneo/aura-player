import type { NavigationRegion } from "./tv-focus-registry";

export type TvNavigationPolicy = "sidebar" | "catalog" | "dialog" | "player";

export function getTvNavigationPolicy(
  element: HTMLElement,
  region?: NavigationRegion,
): TvNavigationPolicy | undefined {
  if (region === "dialog" || element.closest('[role="dialog"]')) return "dialog";
  if (region === "player" || element.closest("[data-player-root]")) return "player";
  if (region === "sidebar" || element.closest('[data-tv-navigation-region="sidebar"]')) return "sidebar";
  if (
    region === "catalog-grid" ||
    region === "catalog-categories" ||
    region === "catalog-preview"
  ) return "catalog";
  return undefined;
}
