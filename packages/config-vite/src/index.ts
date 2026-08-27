import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type UserConfig } from "vite";

type ViteConfigOptions = {
  appRoot: string;
  base: string;
  define: Record<string, string>;
  aliases?: Record<string, string>;
  plugins?: Plugin[];
};

export function createReactViteConfig({
  appRoot,
  base,
  define,
  aliases = {},
  plugins = [],
}: ViteConfigOptions): UserConfig {
  return defineConfig({
    base,
    define,
    publicDir: fileURLToPath(
      new URL("../../packages/web-shared/public", appRoot),
    ),
    resolve: { alias: aliases },
    build: { target: "chrome68" },
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler", { target: "19" }]],
        },
      }),
      tailwindcss(),
      ...plugins,
    ],
  });
}
