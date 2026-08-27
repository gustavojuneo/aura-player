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
import { TV_NAVIGATION_ENABLED } from "../config";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([data-tv-scroll-area]):not([data-tv-scroll-viewport]):not([data-tv-scroll-content])';
const regionSelector = "[data-tv-navigation-region]";
const focusKeys = new WeakMap<HTMLElement, string>();
const elementByFocusKey = new Map<string, HTMLElement>();
let nextFocusId = 0;
let initialized = false;
let lastPlayerBottomControl: HTMLElement | undefined;
const playerInitialFocusAssigned = new WeakSet<HTMLElement>();
let suppressNextFocusScroll = false;

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
  const isFocusAnchor = element.hasAttribute("data-player-focus-anchor");
  if (
    element.getClientRects().length === 0 ||
    element.getAttribute("aria-hidden") === "true"
  )
    return false;
  let current: HTMLElement | null = element;
  while (current) {
    const styles = window.getComputedStyle(current);
    if (
      styles.visibility === "hidden" ||
      styles.display === "none" ||
      (!isFocusAnchor &&
        (styles.opacity === "0" || styles.pointerEvents === "none"))
    )
      return false;
    current = current.parentElement;
  }
  return true;
}

function getDirection(event: KeyboardEvent): Direction | undefined {
  if (event.key === "ArrowUp") return "up";
  if (event.key === "ArrowDown") return "down";
  if (event.key === "ArrowLeft") return "left";
  if (event.key === "ArrowRight") return "right";
  return undefined;
}

function isActivationKey(event: KeyboardEvent) {
  return event.key === "Enter" || event.key === "OK" || event.keyCode === 13;
}

function isBackKey(event: KeyboardEvent) {
  return (
    event.key === "Escape" ||
    event.key === "Back" ||
    event.key === "BrowserBack" ||
    event.keyCode === 461 ||
    event.which === 461
  );
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
  if (
    element instanceof HTMLInputElement &&
    isTextEntry(element) &&
    element.dataset.keyboardReady !== "true"
  ) {
    element.readOnly = true;
  }
  const focusKey = focusKeys.get(element);
  // Some controls, such as the live preview, can be enabled by selecting a
  // channel immediately before the next directional key. Move DOM focus
  // first, then synchronize Norigin when its key is available.
  element.focus({ preventScroll: true });
  if (focusKey) void setFocus(focusKey);
}

function scrollRegionToStart(element: HTMLElement) {
  let current: HTMLElement | null = element.parentElement;
  while (current) {
    if (current.scrollHeight > current.clientHeight) {
      current.scrollTop = 0;
      return;
    }
    current = current.parentElement;
  }
  window.scrollTo({ left: 0, top: 0, behavior: "auto" });
}

function handleTextInputEnter(element: HTMLInputElement) {
  activateTextInput(element);
  element.focus({ preventScroll: true });
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
    activateTextInput(nextInput);
    focusElement(nextInput);
    return;
  }
  form.requestSubmit();
}

function activateTextInput(element: HTMLInputElement) {
  element.dataset.keyboardReady = "true";
  element.readOnly = false;
}

function getRegionItems(region: NavigationRegion) {
  return Array.from(elementByFocusKey.values()).filter(
    (element) =>
      getRegion(element) === region &&
      !element.matches(regionSelector) &&
      isVisible(element),
  );
}

function getPlayerBottomControls() {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "[data-player-controls] button:not([disabled])",
    ),
  ).filter(isVisible);
}

function getSelectedSidebarItem() {
  const sidebarItems = getRegionItems("sidebar");
  return (
    sidebarItems.find(
      (item) => item.getAttribute("data-status") === "active",
    ) ?? sidebarItems[0]
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
  if (direction === "up" && element.closest("[data-tv-home-hero-actions]")) {
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    return false;
  }

  if (
    direction === "up" &&
    element.hasAttribute("data-tv-select-trigger") &&
    element.getAttribute("aria-expanded") !== "true" &&
    region !== "sidebar"
  ) {
    const detailWatch = document.querySelector<HTMLElement>(
      '[data-tv-detail-watch="true"]',
    );
    if (detailWatch) {
      focusElement(detailWatch);
      return false;
    }
  }

  if (direction === "up" && element.closest('[data-tv-detail-hero="true"]')) {
    element
      .closest<HTMLElement>('[data-tv-detail-hero="true"]')
      ?.scrollIntoView({ block: "start", inline: "nearest" });
    window.scrollTo({ left: 0, top: 0, behavior: "auto" });
    return false;
  }

  if (region === "sidebar") {
    if (direction !== "right") {
      return direction === "up" || direction === "down";
    }
    const destination =
      findClosestByRow(element, getRegionItems("catalog-categories")) ??
      findClosestByRow(element, getRegionItems("catalog-grid")) ??
      findClosestByRow(element, getRegionItems("content")) ??
      getRegionItems("catalog-grid")[0] ??
      getRegionItems("content")[0];
    focusElement(destination);
    return false;
  }

  if (region === "catalog-categories") {
    if (direction === "left") {
      focusElement(getSelectedSidebarItem());
      return false;
    }
    if (direction === "right") {
      focusElement(findClosestByRow(element, getRegionItems("catalog-grid")));
      return false;
    }
    return true;
  }

  if (region === "player") {
    const nextEpisode = document.querySelector<HTMLElement>(
      "[data-player-next-episode]",
    );
    if (nextEpisode && isVisible(nextEpisode)) {
      if (element.hasAttribute("data-player-next-episode")) {
        if (direction === "right") {
          focusElement(
            nextEpisode.querySelector<HTMLElement>(
              "[data-player-next-episode-hide]",
            ) ?? undefined,
          );
          return false;
        }
        if (direction === "left") {
          focusElement(
            document.querySelector<HTMLElement>(
              "[data-player-primary-play]",
            ) ?? undefined,
          );
          return false;
        }
      }
      if (element.hasAttribute("data-player-next-episode-hide")) {
        if (direction === "left") {
          focusElement(nextEpisode);
          return false;
        }
      }
      if (direction === "right") {
        const bottomControls = getPlayerBottomControls();
        const isLastBottomControl =
          bottomControls[bottomControls.length - 1] === element;
        const isPrimaryPlay = element.matches("[data-player-primary-play]");
        const isBack = element.matches("[data-player-back]");
        if (isPrimaryPlay || isBack || isLastBottomControl) {
          focusElement(nextEpisode);
          return false;
        }
      }
    }
    if (direction === "down" && element.matches("[data-player-back]")) {
      const primaryPlay = document.querySelector<HTMLElement>(
        "[data-player-primary-play]",
      );
      focusElement(primaryPlay ?? undefined);
      return false;
    }
    if (
      (direction === "left" || direction === "right") &&
      element.closest("[data-player-controls]") &&
      !element.matches("[data-player-progress]")
    ) {
      const controls = getPlayerBottomControls();
      const currentIndex = controls.indexOf(element);
      const offset = direction === "left" ? -1 : 1;
      focusElement(controls[currentIndex + offset]);
      return false;
    }
    if (direction === "left" || direction === "right") {
      return false;
    }
    if (
      direction === "down" &&
      element.closest("[data-player-primary-controls]")
    ) {
      lastPlayerBottomControl = undefined;
      const progress = document.querySelector<HTMLElement>(
        "[data-player-controls] [data-player-progress]",
      );
      if (progress) {
        focusElement(progress);
        return false;
      }
      focusElement(getPlayerBottomControls()[0]);
      return false;
    }
    if (
      direction === "up" &&
      element.closest("[data-player-primary-controls]")
    ) {
      focusElement(
        document.querySelector<HTMLElement>("[data-player-back]") ?? undefined,
      );
      return false;
    }
    if (direction === "up" && element.matches("[data-player-progress]")) {
      const primaryPlay = document.querySelector<HTMLElement>(
        "[data-player-primary-play]",
      );
      focusElement(primaryPlay ?? undefined);
      return false;
    }
    if (direction === "down" && element.matches("[data-player-progress]")) {
      const controls = getPlayerBottomControls();
      const returnControl =
        lastPlayerBottomControl && controls.includes(lastPlayerBottomControl)
          ? lastPlayerBottomControl
          : controls[0];
      focusElement(returnControl);
      return false;
    }
    if (direction === "up" && element.closest("[data-player-controls]")) {
      lastPlayerBottomControl = element;
      const progress = document.querySelector<HTMLElement>(
        "[data-player-controls] [data-player-progress]",
      );
      if (progress) {
        focusElement(progress);
        return false;
      }
      const primaryPlay = document.querySelector<HTMLElement>(
        '[data-player-primary-controls] button[aria-label="Reproduzir"], [data-player-primary-controls] button[aria-label="Pausar"]',
      );
      focusElement(primaryPlay ?? undefined);
      return false;
    }
  }

  const group = element.dataset.tvNavigationGroup;
  if (group && (direction === "left" || direction === "right")) {
    const groupItems = getRegionItems(region).filter(
      (item) => item.dataset.tvNavigationGroup === group,
    );
    const sibling = findAxisAlignedElement(element, direction, groupItems);
    if (sibling) {
      focusElement(sibling);
      return false;
    }
    if (group === "guide-days" && direction === "left") {
      focusElement(findClosestByRow(element, getRegionItems("catalog-grid")));
    }
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
    if (direction === "right") {
      const nextControl = findAxisAlignedElement(
        element,
        "right",
        getRegionItems(region),
      );
      if (nextControl) {
        focusElement(nextControl);
        return false;
      }
    }
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
    const previewPlayer = document.querySelector<HTMLElement>(
      '[data-tv-preview-player="true"]:not([disabled])',
    );
    if (
      element.closest("[data-tv-channel-row]") &&
      previewPlayer &&
      isVisible(previewPlayer)
    ) {
      focusElement(previewPlayer);
      return false;
    }
    const sameRowItem = findAxisAlignedElement(
      element,
      "right",
      getRegionItems("catalog-grid"),
    );
    if (sameRowItem) {
      focusElement(sameRowItem);
      return false;
    }
    if (!sameRowItem) {
      const epgItems = getRegionItems("catalog-preview").filter((item) =>
        item.hasAttribute("data-tv-epg-item"),
      );
      const previewItem = findClosestByRow(
        element,
        epgItems.length > 0 ? epgItems : getRegionItems("catalog-preview"),
      );
      focusElement(
        previewItem ??
          (epgItems.length > 0
            ? epgItems[0]
            : getRegionItems("catalog-preview")[0]),
      );
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
      scrollRegionToStart(element);
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
    if (element.closest('[data-tv-detail-hero="true"]')) {
      const detailContent = findClosestBelow(
        element,
        getRegionItems("catalog-grid"),
      );
      if (detailContent) {
        focusElement(detailContent);
        return false;
      }
    }
    const homeCards = element.closest("[data-tv-home-hero-actions]")
      ? getRegionItems("content").filter((item) =>
          item.hasAttribute("data-tv-home-card"),
        )
      : [];
    const destination = findClosestBelow(
      element,
      homeCards.length > 0
        ? homeCards
        : [...getRegionItems("content"), ...getRegionItems("catalog-grid")],
    );
    if (destination) {
      focusElement(destination);
      return false;
    }
  }

  if (direction === "left" || direction === "right") {
    const sameRowItem = findAxisAlignedElement(
      element,
      direction,
      getRegionItems(region),
    );
    if (!sameRowItem && direction === "left" && region === "content") {
      focusElement(getSelectedSidebarItem());
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
    onFocus: () => {
      if (
        element instanceof HTMLInputElement &&
        isTextEntry(element) &&
        element.dataset.keyboardReady !== "true"
      ) {
        element.readOnly = true;
      }
      if (suppressNextFocusScroll) {
        suppressNextFocusScroll = false;
        return;
      }
      // Detail selects live in the hero. Focusing them must not reposition
      // the page; directional navigation already chose the visible control.
      if (element.hasAttribute("data-tv-select-trigger")) return;
      element.scrollIntoView({ block: "nearest", inline: "nearest" });
    },
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
    onFocus: () => {
      window.requestAnimationFrame(() => {
        const firstItem = getRegionItems(region)[0];
        if (firstItem) focusElement(firstItem);
      });
    },
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
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  const player = document.querySelector<HTMLElement>("[data-player-root]");
  if (dialog) return;
  if (player) {
    const primaryPlay = player.querySelector<HTMLElement>(
      "[data-player-primary-play]:not([disabled])",
    );
    const errorAction = player.querySelector<HTMLElement>(
      "[data-player-error] button:not([disabled])",
    );
    const initialTarget =
      primaryPlay && isVisible(primaryPlay)
        ? primaryPlay
        : errorAction && isVisible(errorAction)
          ? errorAction
          : undefined;
    if (!initialTarget) {
      playerInitialFocusAssigned.delete(player);
      return;
    }
    if (!playerInitialFocusAssigned.has(player)) {
      suppressNextFocusScroll = true;
      focusElement(initialTarget);
      playerInitialFocusAssigned.add(player);
      return;
    }
    return;
  }
  if (
    activeElement instanceof HTMLElement &&
    (activeElement.hasAttribute("data-tv-select-trigger") ||
      activeElement.closest('[role="option"]'))
  ) {
    return;
  }
  const detailWatch = document.querySelector<HTMLElement>(
    '[data-tv-detail-watch="true"]',
  );
  if (detailWatch && isVisible(detailWatch)) {
    suppressNextFocusScroll = true;
    focusElement(detailWatch);
    return;
  }
  if (activeElement instanceof HTMLElement && activeElement !== document.body) {
    const activeFocusKey = focusKeys.get(activeElement);
    if (activeFocusKey && activeFocusKey !== getCurrentFocusKey()) {
      void setFocus(activeFocusKey);
    }
    return;
  }
  const scope = document.querySelector("[data-tv-app-content]");
  const first = Array.from(
    scope?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
  ).find(
    (element) =>
      isVisible(element) && (Boolean(dialog) || !isTextEntry(element)),
  );
  if (first) suppressNextFocusScroll = true;
  focusElement(first);
}

export function useTvDirectionalNavigation() {
  const { pathname } = useLocation();
  const router = useRouter();
  const enabled = TV_NAVIGATION_ENABLED;

  useEffect(() => {
    if (!enabled || !pathname) return;
    initializeSpatialNavigation();
    if (pathname === "/app" || pathname === "/app/")
      window.scrollTo({ left: 0, top: 0 });
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
    observer.observe(document.body, {
      attributeFilter: ["aria-hidden", "class", "disabled", "style"],
      attributes: true,
      childList: true,
      subtree: true,
    });
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
    const handleTextInputClick = (event: MouseEvent) => {
      const element = event.target;
      if (!(element instanceof HTMLInputElement) || !isTextEntry(element))
        return;
      activateTextInput(element);
      window.requestAnimationFrame(() => element.focus());
    };
    document.addEventListener("click", handleTextInputClick, true);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("click", handleTextInputClick, true);
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [enabled, pathname]);

  useEffect(() => {
    if (!enabled) return;
    const handleDialogNavigation = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;

      if (activeElement.closest("[data-player-content-list]")) return;

      if (
        isActivationKey(event) &&
        activeElement.hasAttribute("data-tv-select-trigger")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        activeElement.click();
        return;
      }

      if (
        isActivationKey(event) &&
        activeElement.closest("[data-player-root]") &&
        (activeElement instanceof HTMLButtonElement ||
          activeElement.hasAttribute("data-player-next-episode"))
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        activeElement.click();
        return;
      }

      if (
        activeElement.matches(
          '[data-player-content-item="true"], [data-player-content-select="true"]',
        )
      )
        return;

      const direction = getDirection(event);
      if (
        direction &&
        activeElement instanceof HTMLInputElement &&
        activeElement.matches("[data-player-progress]") &&
        (direction === "left" || direction === "right")
      ) {
        if (direction === "right") activeElement.stepUp();
        else activeElement.stepDown();
        activeElement.dispatchEvent(new Event("input", { bubbles: true }));
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      if (
        direction &&
        activeElement.closest("[data-player-root]") &&
        !activeElement.closest('[role="dialog"]')
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        handleRegionExit(activeElement, "player", direction);
        return;
      }
      if (
        direction &&
        isTextEntry(activeElement) &&
        (direction === "up" || direction === "down")
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

      if (
        event.key === "Enter" &&
        activeElement instanceof HTMLInputElement &&
        isTextEntry(activeElement)
      ) {
        event.preventDefault();
        event.stopPropagation();
        handleTextInputEnter(activeElement);
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
      if (isActivationKey(event)) {
        event.preventDefault();
        event.stopPropagation();
        SpatialNavigation.onEnterPress({ pressedKeys: {} });
      }
    };
    document.addEventListener("keydown", handleDialogNavigation, true);
    return () =>
      document.removeEventListener("keydown", handleDialogNavigation, true);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const handleBack = (event: KeyboardEvent) => {
      if (!isBackKey(event)) return;

      const player = document.querySelector<HTMLElement>("[data-player-root]");
      if (player) {
        // webOS sends the LG remote Back key as keyCode 461. Stop it before
        // the browser/router can interpret it as history navigation.
        event.preventDefault();
        event.stopImmediatePropagation();
      }

      const openSourceSelector = document.querySelector<HTMLElement>(
        "[data-source-selector-open] [data-tv-select-trigger]",
      );
      if (openSourceSelector) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openSourceSelector.click();
        return;
      }
      const openSelect = document.querySelector<HTMLElement>(
        '[data-tv-select-trigger][aria-expanded="true"], [data-tv-select-trigger][data-popup-open], [data-player-content-select="true"][aria-expanded="true"]',
      );
      if (openSelect) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openSelect.click();
        return;
      }
      const playerSettings = document.querySelector<HTMLElement>(
        '[aria-label="Configurações do player"]',
      );
      if (playerSettings) {
        event.preventDefault();
        event.stopImmediatePropagation();
        document
          .querySelector<HTMLElement>('[aria-label="Configurações"]')
          ?.click();
        return;
      }
      const contentListCloseButton = document.querySelector<HTMLElement>(
        '[data-player-content-list] [aria-label="Fechar lista de conteúdo"]',
      );
      if (contentListCloseButton) {
        contentListCloseButton.click();
        return;
      }
      if (player) {
        document
          .querySelector<HTMLElement>('[data-player-root] [data-player-back]')
          ?.click();
        return;
      }
      if (document.querySelector('[role="dialog"]')) return;
      if (
        !document.querySelector("[data-player-root]") &&
        pathname !== "/app"
      ) {
        event.preventDefault();
        void router.history.back();
      }
    };
    window.addEventListener("keydown", handleBack, true);
    return () => window.removeEventListener("keydown", handleBack, true);
  }, [enabled, pathname, router]);
}
