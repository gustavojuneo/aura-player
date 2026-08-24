import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, Play } from "lucide-react";

import { ProductState } from "../../components/ui";
import { useCatalogSeriesDetails } from "../../hooks/use-catalog-data";
import { useFavorites } from "../../services/favorites";
import { AppLayout } from "./app-shell";

export function SeriesDetailsPage() {
  const { seriesId } = useParams({ from: "/app/series/$seriesId" });
  const { series, episodes, isLoading } = useCatalogSeriesDetails(seriesId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const seasons = [
    ...new Set(episodes.map((episode) => episode.seasonNumber ?? 1)),
  ].sort((a, b) => a - b);

  if (isLoading)
    return (
      <ProductState className="min-h-screen justify-center" kind="loading" />
    );
  if (!series)
    return (
      <ProductState
        action={{
          label: "Voltar às séries",
          onClick: () => window.history.back(),
        }}
        className="min-h-screen justify-center"
        kind="catalog-empty"
      />
    );

  return (
    <AppLayout>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-24 pt-6 sm:px-8 lg:pb-10">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"
          to="/app/series"
        >
          <ArrowLeft className="size-4" /> Voltar às séries
        </Link>
        <section className="grid gap-6 rounded-2xl border border-line bg-panel p-5 md:grid-cols-[220px_1fr] md:p-8">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#765c3c] to-[#171510]">
            {series.posterUrl && (
              <img
                alt={series.title}
                className="size-full object-cover"
                decoding="async"
                src={series.posterUrl}
              />
            )}
          </div>
          <div className="flex flex-col items-start justify-end gap-4">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.1em] text-gold-bright">
              Série
            </p>
            <h1 className="m-0 font-display text-3xl font-bold text-text md:text-5xl">
              {series.title}
            </h1>
            <p className="m-0 text-sm text-muted">
              {series.seasonCount} temporadas · {series.episodeCount} episódios
              · {series.groupTitle ?? "Sem categoria"}
            </p>
            <button
              className="inline-flex items-center gap-2 text-sm font-bold text-gold-bright"
              onClick={() => toggleFavorite("series", series.id)}
              type="button"
            >
              <Heart
                className={
                  isFavorite("series", series.id)
                    ? "fill-gold text-gold"
                    : "size-4"
                }
              />
              {isFavorite("series", series.id) ? "Favorito" : "Favoritar"}
            </button>
          </div>
        </section>
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-2xl font-bold text-text">
            Episódios
          </h2>
          {seasons.map((season) => (
            <div
              className="rounded-xl border border-line bg-panel p-4"
              key={season}
            >
              <h3 className="m-0 text-sm font-bold text-text">
                Temporada {season}
              </h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {episodes
                  .filter((episode) => (episode.seasonNumber ?? 1) === season)
                  .map((episode) => (
                    <Link
                      className="flex items-center justify-between gap-3 rounded-lg border border-line bg-panel-2 px-3 py-3 text-sm text-text hover:border-gold"
                      key={episode.id}
                      params={{ episodeId: episode.id, seriesId: series.id }}
                      to="/app/series/$seriesId/episodes/$episodeId/watch"
                    >
                      <span className="min-w-0 truncate">
                        E{episode.episodeNumber ?? "-"} · {episode.title}
                      </span>
                      <Play className="size-4 shrink-0 text-gold" />
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </AppLayout>
  );
}
