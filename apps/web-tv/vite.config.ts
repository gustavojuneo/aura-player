import { fileURLToPath, URL } from "node:url";
import appInfo from "./public/appinfo.json";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  define: { __IPTV_SHOW_VOLUME_SLIDER__: JSON.stringify(false) },
  publicDir: "../../packages/web-shared/public",
  resolve: {
    alias: {
      "@iptv/web-shared": fileURLToPath(
        new URL("../../packages/web-shared/src", import.meta.url),
      ),
    },
  },
  build: { target: "chrome68" },
  plugins: [
    {
      name: "emit-webos-appinfo",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "appinfo.json",
          source: `${JSON.stringify(appInfo, null, 2)}\n`,
        });
      },
    },
    react({
      babel: { plugins: [["babel-plugin-react-compiler", { target: "19" }]] },
    }),
    tailwindcss(),
  ],
});
