import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.string().default("./"),
  VITE_API_URL: z.url().default("http://localhost:3333"),
  VITE_ENABLE_TV_NAVIGATION: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
});

export const env = envSchema.parse(import.meta.env);
