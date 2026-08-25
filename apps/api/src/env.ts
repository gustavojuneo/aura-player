import { z } from "zod";

const envSchema = z.object({
  CLIENT_URL: z.url().default("http://localhost:5173"),
  IPTV_PROXY_ALLOWED_HOSTS: z
    .string()
    .default("uexme.pics,dnsvornakapp.online"),
  PORT: z.coerce.number().int().positive().default(3333),
  VERCEL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
