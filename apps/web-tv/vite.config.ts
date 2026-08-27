import { createReactViteConfig } from "@aura/config-vite";
import appInfo from "./public/appinfo.json";

export default createReactViteConfig({
  base: "./",
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
