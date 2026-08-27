import { fileURLToPath, URL } from "node:url";
import { createReactViteConfig } from "@iptv/config-vite";
import appInfo from "./public/appinfo.json";

export default createReactViteConfig({
  appRoot: import.meta.url,
  base: "./",
  define: {
    __IPTV_ENABLE_KEYBOARD_SHORTCUTS__: JSON.stringify(false),
    __IPTV_SHOW_PLAYER_TOOLTIPS__: JSON.stringify(false),
    __IPTV_SHOW_VOLUME_SLIDER__: JSON.stringify(false),
  },
  aliases: {
    "@iptv/web-shared/search-shortcut": fileURLToPath(
      new URL("./src/hooks/use-no-search-shortcut.ts", import.meta.url),
    ),
    "@iptv/web-shared": fileURLToPath(
      new URL("../../packages/web-shared/src", import.meta.url),
    ),
  },
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
  ],
});
