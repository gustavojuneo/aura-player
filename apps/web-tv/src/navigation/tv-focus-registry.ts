export type NavigationRegion =
  | "catalog-categories"
  | "catalog-grid"
  | "catalog-preview"
  | "content"
  | "dialog"
  | "player"
  | "sidebar";

export const focusKeys = new WeakMap<HTMLElement, string>();
export const elementByFocusKey = new Map<string, HTMLElement>();
export const regionSelector = "[data-tv-navigation-region]";

let nextFocusId = 0;

export function getFocusKey(element: HTMLElement, prefix = "item") {
  const existing = focusKeys.get(element);
  if (existing) return existing;
  const focusKey = `tv-${prefix}-${nextFocusId++}`;
  focusKeys.set(element, focusKey);
  elementByFocusKey.set(focusKey, element);
  return focusKey;
}

export function getRegion(element: HTMLElement): NavigationRegion | undefined {
  if (element.closest('[role="dialog"]')) return "dialog";
  if (element.closest("[data-player-root]")) return "player";
  const explicitRegion =
    element.closest<HTMLElement>(regionSelector)?.dataset.tvNavigationRegion;
  if (
    explicitRegion === "sidebar" ||
    explicitRegion === "catalog-categories" ||
    explicitRegion === "catalog-grid" ||
    explicitRegion === "catalog-preview"
  ) {
    return explicitRegion;
  }
  if (element.closest("[data-tv-app-content]")) return "content";
  return undefined;
}

export function getRegionElement(region: NavigationRegion) {
  if (region === "dialog") return document.querySelector<HTMLElement>('[role="dialog"]');
  if (region === "content") return document.querySelector<HTMLElement>("[data-tv-app-content]");
  if (region === "player") return document.querySelector<HTMLElement>("[data-player-root]");
  return document.querySelector<HTMLElement>(
    `[data-tv-navigation-region="${region}"]`,
  );
}
