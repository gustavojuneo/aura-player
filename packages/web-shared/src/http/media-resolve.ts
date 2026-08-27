import { z } from "zod";
import { httpClient } from "./client";

const mediaResolveSchema = z.object({
  resolvedUrl: z.string().url(),
});

export async function resolveMediaUrl(url: string) {
  const response = await httpClient.post("/media-resolve", { url });
  return mediaResolveSchema.parse(response.data);
}
