import { z } from "zod";

const envSchema = z.object({
  CLIENT_URL: z.url().default("http://localhost:5173"),
  IPTV_PROXY_ALLOWED_HOSTS: z
    .string()
    .default("uexme.pics,dnsvornakapp.online"),
  IPTV_STREAM_USER_AGENT: z
    .string()
    .default(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
    ),
  PORT: z.coerce.number().int().positive().default(3333),
  VERCEL: z.string().optional(),
});

export const env = envSchema.parse(process.env);
