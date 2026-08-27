import { useEffect } from "react";

export function useTvFavoriteShortcut() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Yellow" && event.keyCode !== 405) return;
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;
      const channelFavoriteButton = activeElement
        .closest("[data-tv-channel-row]")
        ?.querySelector<HTMLButtonElement>('[data-channel-favorite="true"]');
      const favoriteButton =
        channelFavoriteButton ??
        document.querySelector<HTMLButtonElement>(
          '[data-tv-detail-hero] [data-favorite-action="true"]',
        );
      if (!favoriteButton) return;
      event.preventDefault();
      event.stopPropagation();
      favoriteButton.click();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, []);
}
