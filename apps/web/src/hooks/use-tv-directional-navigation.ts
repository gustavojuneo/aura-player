import {
  type Direction,
  type FocusableComponent,
  getCurrentFocusKey,
  init,
  navigateByDirection,
  pause,
  ROOT_FOCUS_KEY,
  resume,
  SpatialNavigation,
  setFocus,
  updateAllLayouts,
} from "@noriginmedia/norigin-spatial-navigation";
import { useLocation, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

const focusableSelector =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])";
const regionSelector = "[data-tv-navigation-region]";
const focusKeys = new WeakMap<HTMLElement, string>();
const elementByFocusKey = new Map<string, HTMLElement>();
let nextFocusId = 0;
let initialized = false;

type NavigationRegion =
  | "catalog-categories"
  | "catalog-grid"
  | "catalog-preview"
  | "content"
  | "dialog"
  | "player"
  | "sidebar";

function initializeSpatialNavigation() {
  if (initialized) return;
  init({
    distanceCalculationMethod: "center",
    domNodeFocusOptions: { preventScroll: true },
    shouldFocusDOMNode: true,
    throttle: 80,
    throttleKeypresses: true,
  });
  initialized = true;
}

function isTextEntry(element: Element | null) {
  return (
    element?.matches(
      'input:not([type="checkbox"]):not([type="radio"]), textarea',
    ) ?? false
  );
}

function isVisible(element: HTMLElement) {
  return (
    element.getClientRects().length > 0 &&
    element.getAttribute("aria-hidden") !== "true"
  );
}

function getDirection(event: KeyboardEvent): Direction | undefined {
  if (event.key === "ArrowUp") return "up";
  if (event.key === "ArrowDown") return "down";
  if (event.key === "ArrowLeft") return "left";
  if (event.key === "ArrowRight") return "right";
  return undefined;
}

function getFocusKey(element: HTMLElement, prefix = "item") {
  const existing = focusKeys.get(element);
  if (existing) return existing;
  const focusKey = `tv-${prefix}-${nextFocusId++}`;
  focusKeys.set(element, focusKey);
  elementByFocusKey.set(focusKey, element);
  return focusKey;
}

function getRegion(element: HTMLElement): NavigationRegion | undefined {
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

function getRegionElement(region: NavigationRegion) {
  if (region === "dialog") {
    return document.querySelector<HTMLElement>('[role="dialog"]');
  }
  if (region === "content") {
    return document.querySelector<HTMLElement>("[data-tv-app-content]");
  }
  if (region === "player") {
    return document.querySelector<HTMLElement>("[data-player-root]");
  }
  return document.querySelector<HTMLElement>(
    `[data-tv-navigation-region="${region}"]`,
  );
}

function overlapsOnSecondaryAxis(
  current: DOMRect,
  candidate: DOMRect,
  direction: Direction,
) {
  const horizontal = direction === "left" || direction === "right";
  const overlap = horizontal
    ? Math.min(current.bottom, candidate.bottom) -
      Math.max(current.top, candidate.top)
    : Math.min(current.right, candidate.right) -
      Math.max(current.left, candidate.left);
  const minimumSize = horizontal
    ? Math.min(current.height, candidate.height)
    : Math.min(current.width, candidate.width);
  return overlap >= minimumSize * 0.5;
}

function isInDirection(
  current: DOMRect,
  candidate: DOMRect,
  direction: Direction,
) {
  const currentX = current.left + current.width / 2;
  const currentY = current.top + current.height / 2;
  const candidateX = candidate.left + candidate.width / 2;
  const candidateY = candidate.top + candidate.height / 2;
  if (direction === "left") return candidateX < currentX - 4;
  if (direction === "right") return candidateX > currentX + 4;
  if (direction === "up") return candidateY < currentY - 4;
  return candidateY > currentY + 4;
}

function findAxisAlignedElement(
  current: HTMLElement,
  direction: Direction,
  candidates: HTMLElement[],
) {
  const currentRect = current.getBoundingClientRect();
  const horizontal = direction === "left" || direction === "right";
  return candidates
    .filter((candidate) => {
      if (candidate === current || !isVisible(candidate)) return false;
      const rect = candidate.getBoundingClientRect();
      return (
        isInDirection(currentRect, rect, direction) &&
        overlapsOnSecondaryAxis(currentRect, rect, direction)
      );
    })
    .sort((first, second) => {
      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      const currentPrimary = horizontal
        ? currentRect.left + currentRect.width / 2
        : currentRect.top + currentRect.height / 2;
      const firstPrimary = horizontal
        ? firstRect.left + firstRect.width / 2
        : firstRect.top + firstRect.height / 2;
      const secondPrimary = horizontal
        ? secondRect.left + secondRect.width / 2
        : secondRect.top + secondRect.height / 2;
      return (
        Math.abs(firstPrimary - currentPrimary) -
        Math.abs(secondPrimary - currentPrimary)
      );
    })[0];
}

function findClosestByRow(current: HTMLElement, candidates: HTMLElement[]) {
  const currentRect = current.getBoundingClientRect();
  const currentY = currentRect.top + currentRect.height / 2;
  return candidates.filter(isVisible).sort((first, second) => {
    const firstRect = first.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();
    return (
      Math.abs(firstRect.top + firstRect.height / 2 - currentY) -
      Math.abs(secondRect.top + secondRect.height / 2 - currentY)
    );
  })[0];
}

function findClosestAbove(current: HTMLElement, candidates: HTMLElement[]) {
  const currentRect = current.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;
  return candidates
    .filter((candidate) => {
      if (!isVisible(candidate)) return false;
      const rect = candidate.getBoundingClientRect();
      return rect.top + rect.height / 2 < currentY - 4;
    })
    .sort((first, second) => {
      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      const firstX = firstRect.left + firstRect.width / 2;
      const secondX = secondRect.left + secondRect.width / 2;
      const firstY = firstRect.top + firstRect.height / 2;
      const secondY = secondRect.top + secondRect.height / 2;
      return (
        Math.abs(firstX - currentX) -
        Math.abs(secondX - currentX) +
        (Math.abs(firstY - currentY) - Math.abs(secondY - currentY)) * 0.2
      );
    })[0];
}

function findClosestBelow(current: HTMLElement, candidates: HTMLElement[]) {
  const currentRect = current.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;
  return candidates
    .filter((candidate) => {
      if (!isVisible(candidate)) return false;
      const rect = candidate.getBoundingClientRect();
      return rect.top + rect.height / 2 > currentY + 4;
    })
    .sort((first, second) => {
      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      const firstX = firstRect.left + firstRect.width / 2;
      const secondX = secondRect.left + secondRect.width / 2;
      const firstY = firstRect.top + firstRect.height / 2;
      const secondY = secondRect.top + secondRect.height / 2;
      return (
        Math.abs(firstY - currentY) -
        Math.abs(secondY - currentY) +
        (Math.abs(firstX - currentX) - Math.abs(secondX - currentX)) * 0.2
      );
    })[0];
}

function focusElement(element: HTMLElement | undefined) {
  if (!element) return;
  const focusKey = focusKeys.get(element);
  if (focusKey) void setFocus(focusKey);
}

function handleTextInputEnter(element: HTMLInputElement) {
  const form = element.closest("form");
  if (!form) return;
  const inputs = Array.from(
    form.querySelectorAll<HTMLInputElement>(
      'input:not([disabled]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="hidden"])',
    ),
  ).filter(isVisible);
  const currentIndex = inputs.indexOf(element);
  const nextInput = inputs[currentIndex + 1];
  if (nextInput) {
    focusElement(nextInput);
    return;
  }
  form.requestSubmit();
}

function getRegionItems(region: NavigationRegion) {
  return Array.from(elementByFocusKey.values()).filter(
    (element) => getRegion(element) === region && isVisible(element),
  );
}

function createRegionResolver(region: NavigationRegion) {
  return (
    direction: Direction,
    currentFocusKey: string,
    siblings: FocusableComponent[],
  ) => {
    if (region === "sidebar" || region === "catalog-categories") {
      if (direction !== "up" && direction !== "down") return null;
      const ordered = [...siblings].sort((first, second) => {
        const firstNode = first.node as HTMLElement;
        const secondNode = second.node as HTMLElement;
        return firstNode.compareDocumentPosition(secondNode) &
          Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1;
      });
      const currentIndex = ordered.findIndex(
        (item) => item.focusKey === currentFocusKey,
      );
      return ordered[currentIndex + (direction === "down" ? 1 : -1)] ?? null;
    }

    const currentElement = elementByFocusKey.get(currentFocusKey);
    if (!currentElement) return null;
    const elements = siblings
      .map((item) => elementByFocusKey.get(item.focusKey))
      .filter((element): element is HTMLElement => Boolean(element));
    const axisAlignedCandidate = findAxisAlignedElement(
      currentElement,
      direction,
      elements,
    );
    const candidate =
      axisAlignedCandidate ??
      (region === "content" && direction === "up"
        ? findClosestAbove(currentElement, elements)
        : region === "content" && direction === "down"
          ? findClosestBelow(currentElement, elements)
          : undefined);
    if (!candidate) return null;
    const candidateKey = focusKeys.get(candidate);
    return siblings.find((item) => item.focusKey === candidateKey) ?? null;
  };
}

function handleRegionExit(
  element: HTMLElement,
  region: NavigationRegion,
  direction: Direction,
) {
  if (region === "sidebar") {
    if (direction !== "right") {
      return direction === "up" || direction === "down";
    }
    const destination =
      findClosestByRow(element, getRegionItems("catalog-categories")) ??
      findClosestByRow(element, getRegionItems("catalog-grid")) ??
      findClosestByRow(element, getRegionItems("content"));
    focusElement(destination);
    return false;
  }

  if (region === "catalog-categories") {
    if (direction === "right") {
      focusElement(findClosestByRow(element, getRegionItems("catalog-grid")));
      return false;
    }
    if (direction === "left") {
      focusElement(findClosestByRow(element, getRegionItems("sidebar")));
      return false;
    }
    return true;
  }

  const group = element.dataset.tvNavigationGroup;
  if (group && (direction === "left" || direction === "right")) {
    const groupItems = getRegionItems(region).filter(
      (item) => item.dataset.tvNavigationGroup === group,
    );
    focusElement(findAxisAlignedElement(element, direction, groupItems));
    return false;
  }

  if (element instanceof HTMLInputElement && element.type === "range") {
    const shortcuts = element.getAttribute("aria-keyshortcuts") ?? "";
    const shortcutDirection =
      direction === "left"
        ? "ArrowLeft"
        : direction === "right"
          ? "ArrowRight"
          : direction === "up"
            ? "ArrowUp"
            : "ArrowDown";
    if (shortcuts.includes(shortcutDirection)) {
      const increment = direction === "right" || direction === "up";
      if (increment) element.stepUp();
      else element.stepDown();
      element.dispatchEvent(new Event("input", { bubbles: true }));
      return false;
    }
  }

  if (isTextEntry(element) && (direction === "left" || direction === "right")) {
    return false;
  }

  if (region === "catalog-grid" && direction === "left") {
    const sameRowItem = findAxisAlignedElement(
      element,
      "left",
      getRegionItems("catalog-grid"),
    );
    if (!sameRowItem) {
      const destination =
        findClosestByRow(element, getRegionItems("catalog-categories")) ??
        findClosestByRow(element, getRegionItems("sidebar"));
      focusElement(destination);
      return false;
    }
  }

  if (region === "catalog-grid" && direction === "right") {
    const sameRowItem = findAxisAlignedElement(
      element,
      "right",
      getRegionItems("catalog-grid"),
    );
    if (!sameRowItem) {
      const previewItem = findClosestByRow(
        element,
        getRegionItems("catalog-preview"),
      );
      if (previewItem) focusElement(previewItem);
      return false;
    }
  }

  if (region === "catalog-grid" && direction === "up") {
    const previousRowItem = findAxisAlignedElement(
      element,
      "up",
      getRegionItems("catalog-grid"),
    );
    if (!previousRowItem) {
      focusElement(findClosestAbove(element, getRegionItems("content")));
      return false;
    }
  }

  if (region === "catalog-grid" && direction === "down") {
    const nextRowItem = findAxisAlignedElement(
      element,
      "down",
      getRegionItems("catalog-grid"),
    );
    if (!nextRowItem) {
      const contentItem = findClosestBelow(element, getRegionItems("content"));
      if (contentItem) focusElement(contentItem);
      return false;
    }
  }

  if (region === "catalog-preview" && direction === "left") {
    focusElement(findClosestByRow(element, getRegionItems("catalog-grid")));
    return false;
  }

  if (region === "content" && direction === "down") {
    const nextContentItem = findAxisAlignedElement(
      element,
      "down",
      getRegionItems("content"),
    );
    if (!nextContentItem) {
      const gridItem = findClosestBelow(
        element,
        getRegionItems("catalog-grid"),
      );
      if (gridItem) {
        focusElement(gridItem);
        return false;
      }
    }
  }

  if (direction === "left" || direction === "right") {
    const sameRowItem = findAxisAlignedElement(
      element,
      direction,
      getRegionItems(region),
    );
    if (!sameRowItem && direction === "left" && region === "content") {
      focusElement(findClosestByRow(element, getRegionItems("sidebar")));
      return false;
    }
    return Boolean(sameRowItem);
  }
  return true;
}

function createFocusableRegistration(
  focusKey: string,
  element: HTMLElement,
  parentFocusKey: string,
  region: NavigationRegion,
): FocusableComponent {
  return {
    autoRestoreFocus: true,
    focusKey,
    focusable: true,
    forceFocus: false,
    isFocusBoundary: false,
    node: element,
    onArrowPress: (direction) =>
      handleRegionExit(element, region, direction as Direction),
    onArrowRelease: () => undefined,
    onBlur: () => undefined,
    onEnterPress: () => {
      if (element instanceof HTMLInputElement && isTextEntry(element)) {
        handleTextInputEnter(element);
        return;
      }
      element.click();
    },
    onEnterRelease: () => undefined,
    onFocus: () =>
      element.scrollIntoView({ block: "nearest", inline: "nearest" }),
    onUpdateFocus: () => undefined,
    onUpdateHasFocusedChild: () => undefined,
    parentFocusKey,
    saveLastFocusedChild: false,
    trackChildren: false,
  };
}

function createRegionRegistration(
  focusKey: string,
  element: HTMLElement,
  region: NavigationRegion,
): FocusableComponent {
  return {
    autoRestoreFocus: true,
    focusKey,
    focusable: false,
    forceFocus: false,
    isFocusBoundary: true,
    node: element,
    onArrowPress: () => true,
    onArrowRelease: () => undefined,
    onBlur: () => undefined,
    onEnterPress: () => undefined,
    onEnterRelease: () => undefined,
    onFocus: () => undefined,
    onUpdateFocus: () => undefined,
    onUpdateHasFocusedChild: () => undefined,
    parentFocusKey: ROOT_FOCUS_KEY,
    saveLastFocusedChild: true,
    trackChildren: true,
    nextFocusResolver: createRegionResolver(region),
  };
}

async function registerFocusableTree() {
  const activeKeys = new Set<string>();
  const regions: NavigationRegion[] = [
    "sidebar",
    "catalog-categories",
    "catalog-grid",
    "catalog-preview",
    "content",
    "dialog",
    "player",
  ];

  for (const region of regions) {
    const regionElement = getRegionElement(region);
    if (!regionElement || !isVisible(regionElement)) continue;
    const regionKey = getFocusKey(regionElement, region);
    activeKeys.add(regionKey);
    if (!SpatialNavigation.doesFocusableExist(regionKey)) {
      SpatialNavigation.addFocusable(
        createRegionRegistration(regionKey, regionElement, region),
      );
    }
  }

  for (const element of document.querySelectorAll<HTMLElement>(
    focusableSelector,
  )) {
    if (!isVisible(element)) continue;
    const region = getRegion(element);
    const regionElement = region ? getRegionElement(region) : undefined;
    if (!region || !regionElement) continue;
    const focusKey = getFocusKey(element);
    const parentFocusKey = getFocusKey(regionElement, region);
    activeKeys.add(focusKey);
    if (!SpatialNavigation.doesFocusableExist(focusKey)) {
      SpatialNavigation.addFocusable(
        createFocusableRegistration(focusKey, element, parentFocusKey, region),
      );
    }
  }

  for (const [focusKey, element] of elementByFocusKey) {
    if (activeKeys.has(focusKey)) continue;
    if (SpatialNavigation.doesFocusableExist(focusKey)) {
      SpatialNavigation.removeFocusable({ focusKey });
    }
    elementByFocusKey.delete(focusKey);
    focusKeys.delete(element);
  }

  await updateAllLayouts();
}

function focusInitialElement() {
  const activeElement = document.activeElement;
  if (activeElement instanceof HTMLElement && activeElement !== document.body) {
    const activeFocusKey = focusKeys.get(activeElement);
    if (activeFocusKey && activeFocusKey !== getCurrentFocusKey()) {
      void setFocus(activeFocusKey);
    }
    return;
  }
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  const player = document.querySelector<HTMLElement>("[data-player-root]");
  const scope =
    dialog ?? player ?? document.querySelector("[data-tv-app-content]");
  const first = Array.from(
    scope?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
  ).find(
    (element) =>
      isVisible(element) && (Boolean(dialog) || !isTextEntry(element)),
  );
  focusElement(first);
}

initializeSpatialNavigation();

export function useTvDirectionalNavigation() {
  const { pathname } = useLocation();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    resume();
    let frame: number | undefined;
    const scheduleRegistration = () => {
      if (frame !== undefined) return;
      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        void registerFocusableTree().then(focusInitialElement);
      });
    };
    const observer = new MutationObserver(scheduleRegistration);
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleRegistration();

    const handleFocusIn = (event: FocusEvent) => {
      const element = event.target;
      if (!(element instanceof HTMLElement)) return;
      if (element.closest('[role="option"]')) {
        pause();
        return;
      }
      const focusKey = focusKeys.get(element);
      if (focusKey) resume();
      if (focusKey && focusKey !== getCurrentFocusKey())
        void setFocus(focusKey);
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", handleFocusIn);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    const handleDialogNavigation = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;

      const direction = getDirection(event);
      if (
        direction &&
        activeElement.hasAttribute("data-tv-select-trigger") &&
        activeElement.getAttribute("aria-expanded") !== "true"
      ) {
        event.preventDefault();
        event.stopPropagation();
        const region = getRegion(activeElement);
        const shouldNavigate = region
          ? handleRegionExit(activeElement, region, direction)
          : true;
        if (shouldNavigate) void navigateByDirection(direction, { event });
        return;
      }

      if (!activeElement.closest('[role="dialog"]')) return;
      if (activeElement.closest('[role="option"]')) return;

      if (direction) {
        if (
          isTextEntry(activeElement) &&
          (direction === "left" || direction === "right")
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        void navigateByDirection(direction, { event });
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        SpatialNavigation.onEnterPress({ pressedKeys: {} });
      }
    };
    document.addEventListener("keydown", handleDialogNavigation, true);
    return () =>
      document.removeEventListener("keydown", handleDialogNavigation, true);
  }, []);

  useEffect(() => {
    const handleBack = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.keyCode !== 461) return;
      if (document.querySelector('[role="dialog"]')) return;
      if (
        !document.querySelector("[data-player-root]") &&
        pathname !== "/app"
      ) {
        event.preventDefault();
        void router.history.back();
      }
    };
    document.addEventListener("keydown", handleBack, true);
    return () => document.removeEventListener("keydown", handleBack, true);
  }, [pathname, router]);
}
