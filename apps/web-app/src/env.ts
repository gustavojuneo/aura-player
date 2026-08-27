import { z } from "zod";

const envSchema = z.object({
  BASE_URL: z.string().default("/"),
  VITE_API_URL: z.url().default("http://localhost:3333"),
});

export const env = envSchema.parse(import.meta.env);
