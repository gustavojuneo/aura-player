import { useEffect, useState } from "react";

export type FavoriteKind = "channel" | "movie" | "series";
export type Favorite = { id: string; kind: FavoriteKind };

const storageKey = "aura:favorites";
const initialFavorites: Favorite[] = [
  { id: "arena-sports", kind: "channel" },
  { id: "prime-news", kind: "channel" },
  { id: "cinema-24", kind: "channel" },
  { id: "natureza-plus", kind: "channel" },
  { id: "alem-veu-1", kind: "movie" },
  { id: "rota-norte-1", kind: "movie" },
  { id: "arquivo-zero-1", kind: "movie" },
  { id: "mare-alta-1", kind: "movie" },
  { id: "alem-do-veu-1", kind: "series" },
  { id: "rota-norte-1", kind: "series" },
  { id: "neon-selvagem-1", kind: "series" },
];

function readFavorites(): Favorite[] {
  if (typeof window === "undefined") return initialFavorites;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return initialFavorites;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return initialFavorites;
    return parsed.filter(
      (item): item is Favorite =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        (item.kind === "channel" ||
          item.kind === "movie" ||
          item.kind === "series"),
    );
  } catch {
    return initialFavorites;
  }
}

function persistFavorites(favorites: Favorite[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(favorites));
  } catch {
    // Storage can be unavailable in private browsing or restricted embeds.
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>(readFavorites);

  useEffect(() => persistFavorites(favorites), [favorites]);

  const isFavorite = (kind: FavoriteKind, id: string) =>
    favorites.some((favorite) => favorite.kind === kind && favorite.id === id);

  const toggleFavorite = (kind: FavoriteKind, id: string) => {
    setFavorites((current) => {
      const exists = current.some(
        (favorite) => favorite.kind === kind && favorite.id === id,
      );
      const next = exists
        ? current.filter(
            (favorite) => !(favorite.kind === kind && favorite.id === id),
          )
        : [...current, { id, kind }];
      persistFavorites(next);
      return next;
    });
  };

  return { favorites, isFavorite, toggleFavorite };
}
