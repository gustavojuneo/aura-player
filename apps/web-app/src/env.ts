import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.string().default("/"),
  VITE_API_URL: z.url().default("http://localhost:3333"),
  VITE_MEDIA_SOURCE_MODE: z.enum(["proxy", "direct"]).default("proxy"),
  VITE_PLAYBACK_URLS: z.string().optional(),
});

export const env = envSchema.parse(import.meta.env);
