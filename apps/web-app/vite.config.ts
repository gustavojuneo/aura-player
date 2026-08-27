import { fileURLToPath, URL } from "node:url";
import { createReactViteConfig } from "@iptv/config-vite";

export default createReactViteConfig({
  appRoot: import.meta.url,
  base: "/",
  define: {
    __IPTV_ENABLE_KEYBOARD_SHORTCUTS__: JSON.stringify(true),
    __IPTV_SHOW_PLAYER_TOOLTIPS__: JSON.stringify(true),
    __IPTV_SHOW_VOLUME_SLIDER__: JSON.stringify(true),
  },
  aliases: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
    "@iptv/web-shared": fileURLToPath(
      new URL("../../packages/web-shared/src", import.meta.url),
    ),
  },
});
