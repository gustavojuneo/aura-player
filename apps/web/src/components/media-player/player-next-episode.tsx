import type { CatalogItem } from "../../features/catalog/catalog";

export function PlayerNextEpisode({
  episode,
  onHide,
  onSelect,
  remainingSeconds,
}: {
  episode: CatalogItem;
  onHide: () => void;
  onSelect: () => void;
  remainingSeconds: number;
}) {
  const imageUrl = episode.stillUrl ?? episode.logoUrl;

  const handleSelect = () => onSelect();

  return (
    <aside
      className="flex w-full max-w-sm cursor-pointer flex-col items-stretch gap-3 rounded-2xl border border-white/15 bg-black/55 p-4 text-white shadow-2xl backdrop-blur-md sm:gap-4 sm:p-5"
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
    >
      {imageUrl && (
        <button
          aria-label={`Assistir ${episode.title}`}
          className="block w-full shrink-0 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-focus"
          onClick={(event) => {
            event.stopPropagation();
            handleSelect();
          }}
          type="button"
        >
          <img
            alt=""
            className="aspect-video w-full cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80"
            src={imageUrl}
          />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-xs font-extrabold uppercase tracking-[0.14em] text-gold-bright sm:text-sm">
            A seguir
          </p>
          <button
            className="shrink-0 cursor-pointer text-xs font-semibold text-white/60 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-focus"
            onClick={(event) => {
              event.stopPropagation();
              onHide();
            }}
            type="button"
          >
            Ocultar
          </button>
        </div>
        <h2 className="mt-2 mb-0 truncate font-display text-lg font-bold sm:text-2xl">
          {episode.title}
        </h2>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/65 sm:text-sm">
          <span>
            T{episode.seasonNumber ?? 1} · E{episode.episodeNumber ?? "—"}
          </span>
          {episode.rating !== undefined && episode.rating > 0 && (
            <span>★ {episode.rating.toFixed(1)}</span>
          )}
        </div>
        <p className="mt-3 mb-0 text-sm font-semibold text-white/85 sm:text-base">
          Próximo episódio em {remainingSeconds} segundos
        </p>
      </div>
    </aside>
  );
}
