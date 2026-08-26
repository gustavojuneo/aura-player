const playbackNavigationKey = "aura:playback-navigation";
const playbackFavoritesOriginKey = "aura:playback-favorites-origin";
export type FavoritesOrigin =
  | "/app/favorites"
  | "/app/favorites/movies"
  | "/app/favorites/series"
  | "/app/favorites/channels";

export function markPlaybackNavigation() {
  try {
    window.sessionStorage.setItem(playbackNavigationKey, "1");
  } catch {
    // Autoplay remains disabled if session storage is unavailable.
  }
}

export function consumePlaybackNavigation() {
  try {
    const shouldAutoplay =
      window.sessionStorage.getItem(playbackNavigationKey) === "1";
    window.sessionStorage.removeItem(playbackNavigationKey);
    return shouldAutoplay;
  } catch {
    return false;
  }
}

export function markFavoritesOrigin() {
  try {
    const pathname = window.location.pathname as FavoritesOrigin;
    const origin = pathname.startsWith("/app/favorites")
      ? pathname
      : "/app/favorites";
    window.sessionStorage.setItem(playbackFavoritesOriginKey, origin);
  } catch {
    // The player keeps its default parent route if session storage is unavailable.
  }
}

export function consumeFavoritesOrigin(): FavoritesOrigin | null {
  try {
    const origin = window.sessionStorage.getItem(playbackFavoritesOriginKey);
    window.sessionStorage.removeItem(playbackFavoritesOriginKey);
    if (
      origin === "/app/favorites" ||
      origin === "/app/favorites/movies" ||
      origin === "/app/favorites/series" ||
      origin === "/app/favorites/channels"
    ) {
      return origin;
    }
    return null;
  } catch {
    return null;
  }
}
