import { Play, Radio, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { CatalogItem } from "../../features/catalog/catalog";
import { ScrollArea } from "../ui";
import { PlayerContentSelector } from "./player-content-selector";

const transparentPanel =
  "border border-white/15 bg-black/35 shadow-2xl backdrop-blur-md";

export function PlayerLiveContentList({
  avoidLiveGuide,
  channels,
  categories,
  currentChannelId,
  onCategoryChange,
  onClose,
  onInteraction,
  onSelectChannel,
  selectedCategory,
}: {
  avoidLiveGuide: boolean;
  channels: readonly CatalogItem[];
  categories: readonly string[];
  currentChannelId: string;
  onCategoryChange: (category: string) => void;
  onClose: () => void;
  onInteraction: () => void;
  onSelectChannel: (channelId: string) => void;
  selectedCategory: string;
}) {
  return (
    <PlayerContentListShell
      eyebrow="TV AO VIVO"
      onClose={onClose}
      onInteraction={onInteraction}
      avoidLiveGuide={avoidLiveGuide}
      title={selectedCategory}
    >
      <PlayerContentSelector
        aria-label="Selecionar categoria de canais"
        onInteraction={onInteraction}
        onValueChange={onCategoryChange}
        options={categories.map((category) => ({
          label: category,
          value: category,
        }))}
        value={selectedCategory}
      />
      {categories.length > 0 && (
        <span className="mt-3 px-1 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-white/55">
          Canais
        </span>
      )}
      <ScrollArea className="mt-3 min-h-0 flex-1">
        <div className="grid gap-1.5 pr-1">
          {channels
            .filter(
              (channel) =>
                (channel.groupTitle ??
                  channel.categories?.[0] ??
                  "Sem categoria") === selectedCategory,
            )
            .map((channel) => (
              <button
                aria-current={
                  channel.id === currentChannelId ? "true" : undefined
                }
                className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-focus ${channel.id === currentChannelId ? "border-gold bg-gold/15" : "border-transparent bg-black/15 hover:border-white/15 hover:bg-white/10"}`}
                data-player-content-item="true"
                key={channel.id}
                onClick={() => onSelectChannel(channel.id)}
                type="button"
              >
                <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-black/25 text-white/65">
                  {channel.logoUrl ? (
                    <img
                      alt=""
                      className="size-full object-cover"
                      src={channel.logoUrl}
                    />
                  ) : (
                    <Radio aria-hidden="true" className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">
                  {channel.title}
                </span>
                {channel.id === currentChannelId && (
                  <span className="shrink-0 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-gold-bright">
                    Atual
                  </span>
                )}
              </button>
            ))}
        </div>
      </ScrollArea>
    </PlayerContentListShell>
  );
}

export function PlayerSeriesContentList({
  avoidLiveGuide,
  currentEpisodeId,
  episodes,
  onClose,
  onInteraction,
  onSeasonChange,
  onSelectEpisode,
  seasons,
  selectedSeason,
}: {
  avoidLiveGuide: boolean;
  currentEpisodeId: string;
  episodes: readonly CatalogItem[];
  onClose: () => void;
  onInteraction: () => void;
  onSeasonChange: (season: number) => void;
  onSelectEpisode: (episode: CatalogItem) => void;
  seasons: readonly number[];
  selectedSeason: number;
}) {
  const visibleEpisodes = episodes.filter(
    (episode) => (episode.seasonNumber ?? 1) === selectedSeason,
  );

  return (
    <PlayerContentListShell
      eyebrow="SÉRIE"
      onClose={onClose}
      onInteraction={onInteraction}
      avoidLiveGuide={avoidLiveGuide}
      title={`Temporada ${selectedSeason}`}
    >
      <PlayerContentSelector
        aria-label="Selecionar temporada"
        onInteraction={onInteraction}
        onValueChange={(value) => onSeasonChange(Number(value))}
        options={seasons.map((season) => ({
          label: `Temporada ${season}`,
          value: String(season),
        }))}
        popupClassName="!backdrop-blur-md"
        value={String(selectedSeason)}
      />
      <ScrollArea className="mt-3 min-h-0 flex-1">
        <div className="grid gap-1.5 pr-1">
          {visibleEpisodes.map((episode) => (
            <button
              aria-current={
                episode.id === currentEpisodeId ? "true" : undefined
              }
              className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-focus ${episode.id === currentEpisodeId ? "border-gold bg-gold/15" : "border-transparent bg-black/15 hover:border-white/15 hover:bg-white/10"}`}
              data-player-content-item="true"
              key={episode.id}
              onClick={() => onSelectEpisode(episode)}
              type="button"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-black/25 text-white/65">
                <Play aria-hidden="true" className="size-3.5 fill-current" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-sm font-semibold text-white">
                  {episode.title}
                </strong>
                <span className="mt-0.5 block text-[0.6875rem] text-white/55">
                  Episódio {episode.episodeNumber ?? "—"}
                </span>
              </span>
              {episode.id === currentEpisodeId && (
                <span className="shrink-0 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-gold-bright">
                  Atual
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </PlayerContentListShell>
  );
}

function PlayerContentListShell({
  avoidLiveGuide,
  children,
  eyebrow,
  onClose,
  onInteraction,
  title,
}: {
  avoidLiveGuide: boolean;
  children: React.ReactNode;
  eyebrow: string;
  onClose: () => void;
  onInteraction: () => void;
  title: string;
}) {
  const contentListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleItemNavigation = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        !(activeElement instanceof HTMLElement) ||
        !contentListRef.current?.contains(activeElement)
      )
        return;

      onInteraction();
      const contentSelector = contentListRef.current.querySelector<HTMLElement>(
        '[data-player-content-select="true"]:not([disabled])',
      );
      if (activeElement.matches('[aria-label="Fechar lista de conteúdo"]')) {
        if (
          event.key === "Enter" ||
          event.keyCode === 13 ||
          event.key === " "
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          onClose();
          return;
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          event.stopImmediatePropagation();
          contentSelector?.focus();
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
        return;
      }

      if (!activeElement.matches('[data-player-content-item="true"]')) return;

      if (event.key === "Escape" || event.keyCode === 461) {
        event.preventDefault();
        event.stopImmediatePropagation();
        onClose();
        return;
      }
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

      const items = Array.from(
        contentListRef.current.querySelectorAll<HTMLElement>(
          '[data-player-content-item="true"]:not([disabled])',
        ),
      );
      const currentIndex = items.indexOf(activeElement);
      if (currentIndex < 0) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.key === "ArrowUp" && currentIndex === 0) {
        contentSelector?.focus();
        return;
      }
      const nextIndex = Math.min(
        items.length - 1,
        Math.max(0, currentIndex + (event.key === "ArrowDown" ? 1 : -1)),
      );
      items[nextIndex]?.focus();
    };
    window.addEventListener("keydown", handleItemNavigation, true);
    return () =>
      window.removeEventListener("keydown", handleItemNavigation, true);
  }, [onClose, onInteraction]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      contentListRef.current
        ?.querySelector<HTMLElement>(
          '[data-player-content-item="true"]:not([disabled])',
        )
        ?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-label="Lista de conteúdo"
      className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-end overflow-hidden bg-transparent p-4 pt-20 sm:p-8 sm:pt-24 ${avoidLiveGuide ? "bottom-[280px] sm:bottom-[300px]" : "bottom-[88px] sm:bottom-[112px]"}`}
      data-player-content-list
      onPointerDown={onInteraction}
      ref={contentListRef}
      role="dialog"
    >
      <div
        className={`pointer-events-auto flex h-full max-h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl p-4 ${transparentPanel}`}
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="m-0 text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-gold-bright">
              {eyebrow}
            </p>
            <h2 className="mt-1 mb-0 truncate font-display text-xl font-bold text-white">
              {title}
            </h2>
          </div>
          <button
            aria-label="Fechar lista de conteúdo"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-focus"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </header>
        <div className="mt-3 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
