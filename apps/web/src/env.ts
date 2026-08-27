import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z.url().default("http://localhost:3333"),
  VITE_DEVICE_TYPE: z.enum(["web", "tv"]).default("web"),
  VITE_ENABLE_TV_NAVIGATION: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  VITE_PLAYBACK_URLS: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
