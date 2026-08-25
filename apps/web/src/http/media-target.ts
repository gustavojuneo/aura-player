import { z } from "zod";
import { httpClient } from "./client";

const mediaTargetSchema = z.object({
  targetId: z.string().min(1),
});

const mediaResolveSchema = z.object({
  resolvedUrl: z.string().url(),
});

export async function createMediaTarget(url: string) {
  const response = await httpClient.post("/media-targets", { url });
  return mediaTargetSchema.parse(response.data).targetId;
}

export async function resolveMediaUrl(url: string) {
  const response = await httpClient.post("/media-resolve", { url });
  return mediaResolveSchema.parse(response.data).resolvedUrl;
}
