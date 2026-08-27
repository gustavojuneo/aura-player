import { type RefObject, useEffect } from "react";

export function useSearchShortcut(
  searchInputRef: RefObject<HTMLInputElement | null>,
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (
        target.isContentEditable ||
        target.closest("input, textarea, select, button, a, [role=dialog]")
      )
        return;
      if (event.key !== "/") return;

      const input = searchInputRef.current;
      if (!input || input.disabled) return;
      event.preventDefault();
      input.focus();
      input.select();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchInputRef]);
}
