import { fileURLToPath, URL } from "node:url";
import { createReactViteConfig } from "@iptv/config-vite";

export default createReactViteConfig({
  base: "/",
  aliases: {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
  },
});
