import { z } from "zod";
import { getSharedRuntime } from "../../runtime-config";

export const playbackDescriptorSchema = z.object({
  contentId: z.string().min(1),
  delivery: z.enum(["hls", "mpeg-ts", "dash", "native"]),
  isLive: z.boolean(),
  mimeType: z.string().optional(),
  position: z.number().min(0).optional(),
  secondaryTitle: z.string().optional(),
  streamUrl: z.string().url().optional(),
  title: z.string().min(1),
});

export type PlaybackDescriptor = z.infer<typeof playbackDescriptorSchema>;

type PlaybackInput = {
  contentId: string;
  delivery?: PlaybackDescriptor["delivery"];
  isLive: boolean;
  secondaryTitle?: string;
  streamUrl?: string;
  title: string;
  position?: number;
};

function deliveryFromUrl(
  url: string | undefined,
): PlaybackDescriptor["delivery"] {
  if (!url) return "native";
  const parsed = new URL(url);
  const pathname = parsed.pathname.toLowerCase();
  const declared = (
    parsed.searchParams.get("format") ??
    parsed.searchParams.get("extension") ??
    ""
  )
    .toLowerCase()
    .replace(/^\./, "");
  const extension = declared || pathname.split(".").pop() || "";
  if (extension === "m3u8" || extension === "hls") return "hls";
  if (extension === "ts" || extension === "mpegts" || extension === "mpeg-ts")
    return "mpeg-ts";
  if (extension === "mpd") return "dash";
  return "native";
}

export function createPlaybackDescriptor(
  input: PlaybackInput,
): PlaybackDescriptor {
  const streamUrl = input.streamUrl?.trim() || undefined;
  return playbackDescriptorSchema.parse({
    contentId: input.contentId,
    delivery: input.delivery ?? deliveryFromUrl(streamUrl),
    isLive: input.isLive,
    position: input.position,
    secondaryTitle: input.secondaryTitle,
    streamUrl,
    title: input.title,
  });
}

export function resolvePlaybackUrl(contentId: string): string | undefined {
  const configured = getSharedRuntime().playbackUrls;
  if (!configured) return undefined;

  try {
    const urls = JSON.parse(configured) as Record<string, unknown>;
    const value = urls[contentId];
    return typeof value === "string" ? value : undefined;
  } catch {
    return undefined;
  }
}

export function formatPlaybackTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remaining = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}
