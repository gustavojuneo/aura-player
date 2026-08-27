import type { SharedRuntimeConfig } from "@aura/web-shared/runtime-config";

export function createWebTvRuntimeConfig(apiUrl: string): SharedRuntimeConfig {
  return {
    apiUrl,
    baseUrl: "./",
    mediaSourceMode: "direct",
    playbackUrls: undefined,
    routeBasePath: "",
  };
}

export const TV_NAVIGATION_ENABLED = true;
