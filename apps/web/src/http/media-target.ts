import { z } from "zod";
import { httpClient } from "./client";

const mediaTargetSchema = z.object({
  targetId: z.string().min(1),
});

export async function createMediaTarget(url: string) {
  const response = await httpClient.post("/media-targets", { url });
  return mediaTargetSchema.parse(response.data).targetId;
}
