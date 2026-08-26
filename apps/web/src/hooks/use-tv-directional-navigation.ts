import { useLocation, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function isTextEntry(element: Element | null) {
  return (
    element?.matches(
      'input:not([type="checkbox"]):not([type="radio"]), textarea',
    ) ?? false
  );
}

function getDirection(event: KeyboardEvent) {
  const legacyKey = (
    event as KeyboardEvent & { keyIdentifier?: string }
  ).keyIdentifier;
  const key =
    typeof event.key === "string" && event.key
      ? event.key.toLowerCase()
      : legacyKey?.toLowerCase();
  if (key === "arrowup" || key === "up") return "up";
  if (key === "arrowdown" || key === "down") return "down";
  if (key === "arrowleft" || key === "left") return "left";
  if (key === "arrowright" || key === "right") return "right";
  return (
    { 37: "left", 38: "up", 39: "right", 40: "down" } as Record<
      number,
      string
    >
  )[event.keyCode];
}

function isVisible(element: HTMLElement) {
  return (
    element.getClientRects().length > 0 &&
    element.getAttribute("aria-hidden") !== "true"
  );
}

function findDirectionalCandidate(
  current: HTMLElement,
  direction: string,
  elements: HTMLElement[],
) {
  const currentRect = current.getBoundingClientRect();
  const currentX = currentRect.left + currentRect.width / 2;
  const currentY = currentRect.top + currentRect.height / 2;
  const candidates = elements.filter((element) => {
    if (element === current || !isVisible(element)) return false;
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    if (direction === "left") return x < currentX - 4;
    if (direction === "right") return x > currentX + 4;
    if (direction === "up") return y < currentY - 4;
    return y > currentY + 4;
  });

  return candidates.sort((first, second) => {
    const firstRect = first.getBoundingClientRect();
    const secondRect = second.getBoundingClientRect();
    const firstX = firstRect.left + firstRect.width / 2;
    const firstY = firstRect.top + firstRect.height / 2;
    const secondX = secondRect.left + secondRect.width / 2;
    const secondY = secondRect.top + secondRect.height / 2;
    const horizontal = direction === "left" || direction === "right";
    const firstPrimary = horizontal
      ? Math.abs(firstX - currentX)
      : Math.abs(firstY - currentY);
    const secondPrimary = horizontal
      ? Math.abs(secondX - currentX)
      : Math.abs(secondY - currentY);
    const firstSecondary = horizontal
      ? Math.abs(firstY - currentY)
      : Math.abs(firstX - currentX);
    const secondSecondary = horizontal
      ? Math.abs(secondY - currentY)
      : Math.abs(secondX - currentX);
    return (
      firstPrimary - secondPrimary + (firstSecondary - secondSecondary) * 0.35
    );
  })[0];
}

function findNextFocusable(current: HTMLElement, direction: string) {
  const scope = current.closest('[role="dialog"]') ?? document;
  return findDirectionalCandidate(
    current,
    direction,
    Array.from(scope.querySelectorAll<HTMLElement>(focusableSelector)),
  );
}

function findNextInNavigationGroup(
  current: HTMLElement,
  direction: string,
) {
  if (direction !== "left" && direction !== "right") return undefined;
  const group = current.dataset.tvNavigationGroup;
  if (!group) return undefined;
  const scope = current.closest('[role="dialog"], form') ?? document;
  const items = Array.from(
    scope.querySelectorAll<HTMLElement>(
      `[data-tv-navigation-group="${group}"]`,
    ),
  ).filter(isVisible);
  const currentIndex = items.indexOf(current);
  if (currentIndex < 0) return undefined;
  return items[currentIndex + (direction === "right" ? 1 : -1)];
}

function findNextInNavigationZone(
  current: HTMLElement,
  direction: string,
) {
  const currentZone = current.dataset.tvNavigationZone;
  const scope = document.querySelector("[data-tv-app-content]") ?? document;
  if (currentZone === "catalog-items") {
    const nextItem = findDirectionalCandidate(
      current,
      direction,
      Array.from(
        scope.querySelectorAll<HTMLElement>(
          '[data-tv-navigation-zone="catalog-items"]',
        ),
      ),
    );
    if (nextItem) return nextItem;
  }
  const targetZone =
    direction === "right" && currentZone === "catalog-categories"
      ? "catalog-items"
      : direction === "left" && currentZone === "catalog-items"
        ? "catalog-categories"
        : undefined;
  if (!targetZone) return undefined;
  const currentRect = current.getBoundingClientRect();
  const currentY = currentRect.top + currentRect.height / 2;
  return Array.from(
    scope.querySelectorAll<HTMLElement>(
      `[data-tv-navigation-zone="${targetZone}"]`,
    ),
  )
    .filter(isVisible)
    .sort((first, second) => {
      const firstRect = first.getBoundingClientRect();
      const secondRect = second.getBoundingClientRect();
      const firstY = firstRect.top + firstRect.height / 2;
      const secondY = secondRect.top + secondRect.height / 2;
      return Math.abs(firstY - currentY) - Math.abs(secondY - currentY);
    })[0];
}

export function useTvDirectionalNavigation() {
  const { pathname } = useLocation();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    const frame = window.requestAnimationFrame(() => {
      if (document.querySelector("[data-player-root]")) return;
      const dialog = document.querySelector('[role="dialog"]');
      const root =
        dialog ?? document.querySelector("[data-tv-app-content]");
      const first = Array.from(
        root?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).find(
        (element) =>
          isVisible(element) && (Boolean(dialog) || !isTextEntry(element)),
      );
      first?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    const focusDialog = () => {
      const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
      if (!dialog || dialog.contains(document.activeElement)) return;
      const first = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).find(isVisible);
      first?.focus();
    };
    const observer = new MutationObserver(focusDialog);
    observer.observe(document.body, { childList: true, subtree: true });
    focusDialog();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.keyCode === 461) {
        const dialog = document.querySelector('[role="dialog"]');
        if (dialog) {
          const active = document.activeElement;
          if (active instanceof HTMLElement) {
            active.dispatchEvent(
              new KeyboardEvent("keydown", {
                bubbles: true,
                cancelable: true,
                key: "Escape",
              }),
            );
          }
          event.preventDefault();
          return;
        }
        if (
          !document.querySelector("[data-player-root]") &&
          pathname !== "/app"
        ) {
          event.preventDefault();
          void router.history.back();
        }
        return;
      }
      const direction = getDirection(event);
      if (!direction) return;
      const current = document.activeElement;
      if (!(current instanceof HTMLElement)) return;
      if (current.closest("[data-player-root]")) return;
      if (current.closest('[role="option"]')) return;

      if (current.hasAttribute("data-tv-select-trigger")) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (
        (isTextEntry(current) && (direction === "left" || direction === "right"))
      )
        return;

      const next =
        findNextInNavigationGroup(current, direction) ??
        findNextInNavigationZone(current, direction) ??
        findNextFocusable(current, direction);
      if (!next) {
        if (current.matches('[role="combobox"]')) event.preventDefault();
        return;
      }
      event.preventDefault();
      next.focus();
      next.scrollIntoView({ block: "nearest", inline: "nearest" });
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [pathname, router]);
}
