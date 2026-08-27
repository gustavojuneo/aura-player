export interface SharedRuntimeConfig {
  baseUrl: string;
  apiUrl: string;
  mediaSourceMode: "proxy" | "direct";
  playbackUrls?: string;
  showFullscreen: boolean;
  showPlayerTooltips: boolean;
  showSeekButtons: boolean;
  showVolumeSlider: boolean;
}

const DEFAULT_RUNTIME_CONFIG: SharedRuntimeConfig = {
  baseUrl: "/",
  apiUrl: "http://localhost:3333",
  mediaSourceMode: "proxy",
  showFullscreen: true,
  showPlayerTooltips: true,
  showSeekButtons: true,
  showVolumeSlider: true,
};

let runtimeConfig = DEFAULT_RUNTIME_CONFIG;

export function configureSharedRuntime(config: SharedRuntimeConfig) {
  runtimeConfig = config;
}

export function getSharedRuntime() {
  return runtimeConfig;
}
