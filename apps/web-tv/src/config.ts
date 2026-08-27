import type { SharedRuntimeConfig } from "@iptv/web-shared/runtime-config";

export function createWebTvRuntimeConfig(apiUrl: string): SharedRuntimeConfig {
  return {
    apiUrl,
    baseUrl: "./",
    enableKeyboardShortcuts: false,
    mediaSourceMode: "direct",
    playbackUrls: undefined,
    routeBasePath: "",
    showFullscreen: false,
    showPlayerTooltips: false,
    showSeekButtons: false,
    showVolumeSlider: false,
  };
}

export const TV_NAVIGATION_ENABLED = true;
