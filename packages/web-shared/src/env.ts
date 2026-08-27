import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.string().default("/"),
  VITE_API_URL: z.url().default("http://localhost:3333"),
  VITE_MEDIA_SOURCE_MODE: z.enum(["proxy", "direct"]).default("proxy"),
  VITE_PLAYBACK_URLS: z.string().optional(),
  VITE_SHOW_FULLSCREEN: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  VITE_SHOW_PLAYER_TOOLTIPS: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  VITE_SHOW_SEEK_BUTTONS: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
  VITE_SHOW_VOLUME_SLIDER: z.enum(["true", "false"]).default("true").transform((value) => value === "true"),
});

export const env = envSchema.parse(import.meta.env);
