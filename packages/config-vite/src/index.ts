import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type UserConfig } from "vite";

type ViteConfigOptions = {
  base: string;
  aliases?: Record<string, string>;
  plugins?: Plugin[];
};

export function createReactViteConfig({
  base,
  aliases = {},
  plugins = [],
}: ViteConfigOptions): UserConfig {
  return defineConfig({
    base,
    publicDir: "public",
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
