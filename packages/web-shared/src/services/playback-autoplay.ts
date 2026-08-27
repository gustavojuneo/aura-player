const playbackNavigationKey = "aura:playback-navigation";

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
