import { Link, useParams, useRouter } from "@tanstack/react-router";

import { Carousel } from "../../../../components/carousel";
import {
  DetailCard,
  DetailHero,
  DetailHeroSkeleton,
} from "../../../../components/detail-hero";
import { ProductState } from "../../../../components/ui";
import {
  useCatalogItem,
  useCatalogItems,
} from "../../../../hooks/use-catalog-data";
import { appRoute } from "../../../../runtime-config";
import { useFavorites } from "../../../../services/favorites";
import { loadPlaybackProgress } from "../../../../services/playback-progress";

export function MovieDetailsPage() {
  const router = useRouter();
  const { movieId } = useParams({ from: "/app/movies/$movieId" });
  const { item, isLoading, isMetadataLoading } = useCatalogItem(movieId);
  const { items: movies } = useCatalogItems("movie");
  const { isFavorite, toggleFavorite } = useFavorites();
  const progress = loadPlaybackProgress().find(
    (entry) => entry.contentId === movieId,
  );
  const relatedCategories = new Set(
    [
      ...(item?.categories ?? []),
      ...(item?.groupTitle ? [item.groupTitle] : []),
    ].map((category) => category.trim().toLocaleLowerCase()),
  );
  const relatedMovies = movies
    .filter((movie) => {
      if (movie.id === movieId || relatedCategories.size === 0) {
        return false;
      }
      const movieCategories = [
        ...movie.categories,
        ...(movie.groupTitle ? [movie.groupTitle] : []),
      ];
      return movieCategories.some((category) =>
        relatedCategories.has(category.trim().toLocaleLowerCase()),
      );
    })
    .slice(0, 15);

  if (isLoading || isMetadataLoading) return <DetailHeroSkeleton />;
  if (item?.kind !== "movie")
    return (
      <ProductState
        action={{
          label: "Voltar aos filmes",
          onClick: () => router.history.back(),
        }}
        className="min-h-screen justify-center"
        kind="catalog-empty"
      />
    );

  const category = item.categories?.[0] ?? item.groupTitle ?? "Filme";

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-bg text-text">
      <DetailHero
        badge={`Filme · ${item.year ?? "Destaque"}`}
        description={
          item.description ??
          `Uma nova história de ${category.toLocaleLowerCase()} disponível para assistir agora no seu catálogo.`
        }
        imageUrl={item.backdropUrl ?? item.logoUrl}
        isFavorite={isFavorite("movie", item.id)}
        kind="movie"
        metadata={`${item.year ?? "Ano não informado"} · ${category}`}
        onToggleFavorite={() => toggleFavorite("movie", item.id)}
        title={item.title}
        fitViewport
        watchLabel={
          progress
            ? `Continuar · ${Math.max(1, Math.ceil((progress.durationSecs - progress.positionSecs) / 60))} min`
            : "Assistir"
        }
        watchProgress={
          progress
            ? (progress.positionSecs / Math.max(progress.durationSecs, 1)) * 100
            : undefined
        }
        watchParams={{ movieId: item.id }}
        watchTo={appRoute("/movies/$movieId/watch")}
      />
      <section className="relative z-30 flex h-[clamp(360px,45vh,480px)] w-full shrink-0 flex-col gap-3.5 overflow-hidden bg-bg px-5 pt-6 pb-16 sm:px-10 sm:pt-6 lg:px-[70px]">
        <h2 className="m-0 font-display text-lg font-bold text-text sm:text-[1.312rem]">
          Você também pode gostar
        </h2>
        <Carousel ariaLabel="Filmes relacionados" edgeToEdge>
          <div
            className="flex min-w-max flex-nowrap gap-3"
            data-tv-navigation-region="catalog-grid"
          >
            {relatedMovies.map((movie, index) => (
              <Link
                className="w-[clamp(153px,calc((45vh_-_100px)*2/3),240px)] min-w-[clamp(153px,calc((45vh_-_100px)*2/3),240px)] shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-focus"
                data-tv-navigation-zone="catalog-items"
                key={movie.id}
                params={{ movieId: movie.id } as never}
                to={appRoute("/movies/$movieId") as never}
              >
                <DetailCard
                  accent={index % 2 ? "amber" : "blue"}
                  imageUrl={movie.logoUrl ?? movie.backdropUrl}
                >
                  <span className="truncate text-sm font-bold text-text">
                    {movie.title}
                  </span>
                  <span className="truncate text-[0.6875rem] text-muted">
                    {movie.year ?? "Filme"} ·{" "}
                    {movie.categories?.[0] ?? "Sem categoria"}
                  </span>
                </DetailCard>
              </Link>
            ))}
          </div>
        </Carousel>
      </section>
    </main>
  );
}
