import { queryClient } from "@iptv/web-shared/lib-query-client";
import { configureSharedRuntime } from "@iptv/web-shared/runtime-config";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { env } from "./env";
import { router } from "./routes";
import "./styles.css";

configureSharedRuntime({
  apiUrl: env.VITE_API_URL,
  baseUrl: env.BASE_URL,
  routeBasePath: "/app",
  mediaSourceMode: env.VITE_MEDIA_SOURCE_MODE,
  playbackUrls: env.VITE_PLAYBACK_URLS,
  showFullscreen: env.VITE_SHOW_FULLSCREEN,
  showPlayerTooltips: env.VITE_SHOW_PLAYER_TOOLTIPS,
  showSeekButtons: env.VITE_SHOW_SEEK_BUTTONS,
  showVolumeSlider: env.VITE_SHOW_VOLUME_SLIDER,
  enableKeyboardShortcuts: env.VITE_ENABLE_KEYBOARD_SHORTCUTS,
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
