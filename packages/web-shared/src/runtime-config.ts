export interface SharedRuntimeConfig {
  baseUrl: string;
  routeBasePath: "/app" | "";
  apiUrl: string;
  mediaSourceMode: "proxy" | "direct";
  playbackUrls?: string;
  showFullscreen: boolean;
  showPlayerTooltips: boolean;
  showSeekButtons: boolean;
  showVolumeSlider: boolean;
  enableKeyboardShortcuts: boolean;
}

const DEFAULT_RUNTIME_CONFIG: SharedRuntimeConfig = {
  baseUrl: "/",
  routeBasePath: "/app",
  apiUrl: "http://localhost:3333",
  mediaSourceMode: "proxy",
  showFullscreen: true,
  showPlayerTooltips: true,
  showSeekButtons: true,
  showVolumeSlider: true,
  enableKeyboardShortcuts: true,
};

let runtimeConfig = DEFAULT_RUNTIME_CONFIG;

export function configureSharedRuntime(config: SharedRuntimeConfig) {
  runtimeConfig = config;
}

export function getSharedRuntime() {
  return runtimeConfig;
}

export function appRoute(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${runtimeConfig.routeBasePath}${normalizedPath}` || "/";
}
