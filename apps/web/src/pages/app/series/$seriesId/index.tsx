import { Link, useParams, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "../../../../components/brand-logo";
import {
  DetailHero,
  DetailHeroSkeleton,
} from "../../../../components/detail-hero";
import { ProductState, SelectField } from "../../../../components/ui";
import { useCatalogSeriesDetails } from "../../../../hooks/use-catalog-data";
import { useFavorites } from "../../../../services/favorites";
import { markPlaybackNavigation } from "../../../../services/playback-autoplay";

const fallbackEpisodeImage = "/episode-no-image.png";
const episodesPerPage = 20;

function getPaginationPages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis-start" | "ellipsis-end"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis-end", totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis-start",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }
  return [
    1,
    "ellipsis-start",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis-end",
    totalPages,
  ];
}

export function SeriesDetailsPage() {
  const router = useRouter();
  const { seriesId } = useParams({ from: "/app/series/$seriesId" });
  const { series, episodes, isLoading, isMetadataLoading } =
    useCatalogSeriesDetails(seriesId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedSeason, setSelectedSeason] = useState<number>();
  const [currentPage, setCurrentPage] = useState(1);
  const seasons = [
    ...new Set(episodes.map((episode) => episode.seasonNumber ?? 1)),
  ].sort((a, b) => a - b);
  const firstSeason = seasons[0] ?? 1;
  const activeSeason =
    selectedSeason && seasons.includes(selectedSeason)
      ? selectedSeason
      : firstSeason;
  useEffect(() => {
    if (seasons.length && !seasons.includes(selectedSeason ?? 0)) {
      setSelectedSeason(firstSeason);
    }
  }, [firstSeason, seasons, selectedSeason]);
  const seasonEpisodes = episodes.filter(
    (episode) => (episode.seasonNumber ?? 1) === activeSeason,
  );
  const totalPages = Math.ceil(seasonEpisodes.length / episodesPerPage);
  const paginatedEpisodes = seasonEpisodes.slice(
    (currentPage - 1) * episodesPerPage,
    currentPage * episodesPerPage,
  );
  const paginationPages = getPaginationPages(currentPage, totalPages);
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(totalPages, 1)));
  }, [totalPages]);
  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return undefined;
    return `${Math.round(seconds / 60)} min`;
  };
  const episodeImage = (episode: (typeof episodes)[number]) =>
    episode.stillUrl ?? episode.logoUrl ?? series?.posterUrl;

  if (isLoading || isMetadataLoading) return <DetailHeroSkeleton />;
  if (!series)
    return (
      <ProductState
        action={{
          label: "Voltar às séries",
          onClick: () => router.history.back(),
        }}
        className="min-h-screen justify-center"
        kind="catalog-empty"
      />
    );

  const category = series.categories?.[0] ?? series.groupTitle ?? "Série";

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-[38px] lg:py-7">
        <button
          aria-label="Voltar para página anterior"
          className="-ml-2 inline-flex h-10 cursor-pointer items-center gap-1 rounded-lg bg-transparent px-2 text-sm font-bold text-text transition-colors hover:bg-transparent hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => router.history.back()}
          type="button"
        >
          <ChevronLeft aria-hidden="true" className="size-5 shrink-0" />
          <span>Voltar</span>
        </button>
        <BrandLogo
          markClassName="size-7"
          textClassName="text-[17px] font-extrabold"
        />
      </header>
      <DetailHero
        badge={`Série · ${series.seasonCount} temporadas`}
        description={
          series.description ??
          `Uma história de ${category.toLocaleLowerCase()} para acompanhar episódio por episódio.`
        }
        imageUrl={series.backdropUrl ?? series.posterUrl}
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
        extraContent={
          <SelectField
            aria-label="Selecionar temporada"
            className="relative z-50 hidden h-12 w-[170px] rounded-xl border-line bg-panel-2 px-4 text-[13px] font-bold sm:flex"
            onValueChange={(value) => {
              setSelectedSeason(Number(value));
              setCurrentPage(1);
            }}
            options={seasons.map((season) => ({
              label: `Temporada ${season}`,
              value: String(season),
            }))}
            value={String(activeSeason)}
          />
        }
      />
      <section className="flex w-full flex-col gap-3.5 px-5 pt-8 pb-12 sm:px-10 sm:pt-10 lg:px-[70px]">
        <div className="flex h-8 items-center justify-between">
          <h2 className="m-0 font-display text-lg font-[750] text-[#f6f2e8] opacity-100 sm:text-[21px]">
            <span className="sm:hidden">
              Episódios · Temporada {activeSeason}
            </span>
            <span className="hidden sm:inline">Episódios</span>
          </h2>
          <span className="text-xs text-muted sm:hidden">
            {seasonEpisodes.length} episódios
          </span>
        </div>
        <div
          className="grid grid-cols-1 gap-3.5 sm:[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]"
          data-tv-navigation-region="catalog-grid"
        >
          {paginatedEpisodes.map((episode) => (
            <Link
              className="group min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-focus"
              key={episode.id}
              onClick={markPlaybackNavigation}
              params={{ episodeId: episode.id, seriesId: series.id }}
              to="/app/series/$seriesId/episodes/$episodeId/watch"
            >
              <article className="relative flex h-[82px] items-center gap-3 overflow-hidden rounded-xl border border-transparent bg-transparent p-2.5 transition-[background-color,border-color,box-shadow] group-hover:border-gold/70 group-hover:bg-panel-2 group-hover:shadow-[0_12px_28px_rgb(0_0_0_/_25%)] sm:h-[360px] sm:flex-col sm:items-stretch sm:justify-start sm:gap-3 sm:rounded-xl sm:p-3">
                <div className="relative z-10 h-[60px] w-[90px] shrink-0 sm:h-[210px] sm:w-full">
                  <img
                    alt="Sem imagem disponível"
                    className="size-full rounded-lg object-cover"
                    decoding="async"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = fallbackEpisodeImage;
                    }}
                    src={episodeImage(episode) || fallbackEpisodeImage}
                  />
                  <span className="pointer-events-none absolute inset-0 m-auto grid size-10 place-items-center rounded-full bg-gold text-ink opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <Play aria-hidden="true" className="size-4 fill-current" />
                  </span>
                </div>
                <div className="relative z-10 min-w-0 flex-1 sm:flex-none">
                  <span className="block truncate text-sm font-bold text-text sm:text-lg">
                    {episode.title}
                  </span>
                  <span className="mt-1 block line-clamp-2 text-[11px] leading-[1.4] text-[#d6d0c5] sm:text-sm sm:leading-[1.45]">
                    {episode.description ?? "Descrição indisponível"}
                  </span>
                  <div className="mt-1 hidden items-center gap-2 text-sm text-[#d6d0c5] sm:flex">
                    {formatDuration(episode.durationSecs) && (
                      <span>{formatDuration(episode.durationSecs)}</span>
                    )}
                    {episode.rating !== undefined && episode.rating > 0 && (
                      <span>★ {episode.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
        {totalPages > 1 && (
          <nav
            aria-label="Paginação dos episódios"
            className="mt-3 flex flex-wrap items-center justify-center gap-1.5"
          >
            <button
              aria-label="Página anterior"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-xs font-bold text-text transition-colors hover:border-gold/70 hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              type="button"
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              <span>Anterior</span>
            </button>
            {paginationPages.map((page) =>
              typeof page !== "number" ? (
                <span
                  aria-hidden="true"
                  className="flex h-9 min-w-7 items-center justify-center px-1 text-sm text-muted"
                  key={page}
                >
                  …
                </span>
              ) : (
                <button
                  aria-current={page === currentPage ? "page" : undefined}
                  aria-label={`Página ${page}`}
                  className="h-9 min-w-9 rounded-lg border border-line px-2 text-xs font-bold text-text transition-colors hover:border-gold/70 hover:text-gold-bright aria-[current=page]:border-gold aria-[current=page]:bg-gold aria-[current=page]:text-ink"
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  type="button"
                >
                  {page}
                </button>
              ),
            )}
            <button
              aria-label="Próxima página"
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-line px-3 text-xs font-bold text-text transition-colors hover:border-gold/70 hover:text-gold-bright disabled:cursor-not-allowed disabled:opacity-40"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, totalPages))
              }
              type="button"
            >
              <span>Próximo</span>
              <ChevronRight aria-hidden="true" className="size-4" />
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}
