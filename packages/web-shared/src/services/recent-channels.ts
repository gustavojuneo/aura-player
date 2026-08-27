import type { CatalogItem } from "../features/catalog/catalog";

const storageKey = "aura:recent-channels";
const recentChannelsEvent = "aura-recent-channels-change";
const maxRecentChannels = 10;

export type RecentChannel = Pick<
  CatalogItem,
  "id" | "sourceId" | "title" | "logoUrl" | "groupTitle" | "providerId"
> & { accessedAt: number };

function readRecentChannels() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is RecentChannel => {
      if (!item || typeof item !== "object") return false;
      const value = item as Record<string, unknown>;
      return (
        typeof value.id === "string" &&
        typeof value.sourceId === "string" &&
        typeof value.title === "string" &&
        typeof value.accessedAt === "number"
      );
    });
  } catch {
    return [];
  }
}

export function loadRecentChannels() {
  return readRecentChannels().sort(
    (first, second) => second.accessedAt - first.accessedAt,
  );
}

export function recordRecentChannel(channel: CatalogItem) {
  const next = [
    {
      accessedAt: Date.now(),
      groupTitle: channel.groupTitle,
      id: channel.id,
      logoUrl: channel.logoUrl,
      providerId: channel.providerId,
      sourceId: channel.sourceId,
      title: channel.title,
    },
    ...readRecentChannels().filter((item) => item.id !== channel.id),
  ].slice(0, maxRecentChannels);
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new Event(recentChannelsEvent));
}

export function removeRecentChannelsBySource(sourceId: string) {
  const next = readRecentChannels().filter(
    (channel) => channel.sourceId !== sourceId,
  );
  window.localStorage.setItem(storageKey, JSON.stringify(next));
  window.dispatchEvent(new Event(recentChannelsEvent));
}

export { recentChannelsEvent };
