import { Link, useParams } from "@tanstack/react-router";

import { ProductState } from "../../components/ui";
import { useCatalogSeriesDetails } from "../../hooks/use-catalog-data";
import { useFavorites } from "../../services/favorites";
import { DetailCard, DetailHero } from "./components/detail-hero";

export function SeriesDetailsPage() {
  const { seriesId } = useParams({ from: "/app/series/$seriesId" });
  const { series, episodes, isLoading } = useCatalogSeriesDetails(seriesId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const seasons = [
    ...new Set(episodes.map((episode) => episode.seasonNumber ?? 1)),
  ].sort((a, b) => a - b);
  const firstSeason = seasons[0] ?? 1;
  const seasonEpisodes = episodes
    .filter((episode) => (episode.seasonNumber ?? 1) === firstSeason)
    .slice(0, 4);

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

  const category = series.categories?.[0] ?? series.groupTitle ?? "Série";

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-[38px] lg:py-7">
        <Link
          className="text-sm font-bold text-text transition-colors hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-focus"
          to="/app/series"
        >
          <span className="sm:hidden">←</span>
          <span className="hidden sm:inline">←&nbsp; Voltar</span>
        </Link>
        <span className="font-display text-[17px] font-extrabold text-text">
          AURA
        </span>
      </header>
      <DetailHero
        badge={`Série · ${series.seasonCount} temporadas`}
        description={`Uma história de ${category.toLocaleLowerCase()} para acompanhar episódio por episódio.`}
        imageUrl={series.posterUrl}
        isFavorite={isFavorite("series", series.id)}
        kind="series"
        metadata={`${category} · ${series.episodeCount} episódios`}
        onToggleFavorite={() => toggleFavorite("series", series.id)}
        title={series.title}
        watchLabel="Continuar série · E4"
        watchParams={{
          seriesId: series.id,
          episodeId: seasonEpisodes[0]?.id ?? "",
        }}
        watchTo="/app/series/$seriesId/episodes/$episodeId/watch"
      />
      <section className="mx-auto flex max-w-[1300px] flex-col gap-3.5 px-5 pb-12 sm:px-10 sm:pt-3 lg:px-[70px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 font-display text-lg font-bold text-text sm:text-[21px]">
            Episódios
          </h2>
          <span className="rounded-lg bg-panel-2 px-3 py-2 text-[11px] font-bold text-text">
            Temporada {firstSeason} ▾
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          {seasonEpisodes.map((episode, index) => (
            <Link
              className="min-w-0 flex-1"
              key={episode.id}
              params={{ episodeId: episode.id, seriesId: series.id }}
              to="/app/series/$seriesId/episodes/$episodeId/watch"
            >
              <DetailCard
                accent={index % 2 ? "amber" : "blue"}
                className={
                  index === seasonEpisodes.length - 1
                    ? "border-gold"
                    : undefined
                }
              >
                <span className="truncate text-sm font-bold text-text">
                  {episode.episodeNumber ?? index + 1}. {episode.title}
                </span>
                <span className="truncate text-[11px] text-muted">
                  {index === seasonEpisodes.length - 1
                    ? "Próximo · 48 min"
                    : "Episódio"}
                </span>
              </DetailCard>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
