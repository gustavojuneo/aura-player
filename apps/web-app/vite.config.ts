import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  define: {
    __IPTV_ENABLE_KEYBOARD_SHORTCUTS__: JSON.stringify(true),
    __IPTV_SHOW_PLAYER_TOOLTIPS__: JSON.stringify(true),
    __IPTV_SHOW_VOLUME_SLIDER__: JSON.stringify(true),
  },
  publicDir: "../../packages/web-shared/public",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@iptv/web-shared": fileURLToPath(
        new URL("../../packages/web-shared/src", import.meta.url),
      ),
    },
  },
  build: {
    target: "chrome68",
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", { target: "19" }]],
      },
    }),
    tailwindcss(),
  ],
});
