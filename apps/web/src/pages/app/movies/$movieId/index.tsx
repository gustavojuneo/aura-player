import { Link, useParams, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useMemo } from "react";
import { BrandLogo } from "../../../../components/brand-logo";
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
import { useFavorites } from "../../../../services/favorites";

export function MovieDetailsPage() {
  const router = useRouter();
  const { movieId } = useParams({ from: "/app/movies/$movieId" });
  const { item, isLoading, isMetadataLoading } = useCatalogItem(movieId);
  const { items: movies } = useCatalogItems("movie");
  const { isFavorite, toggleFavorite } = useFavorites();
  const relatedCategories = useMemo(
    () =>
      new Set(
        [
          ...(item?.categories ?? []),
          ...(item?.groupTitle ? [item.groupTitle] : []),
        ].map((category) => category.trim().toLocaleLowerCase()),
      ),
    [item],
  );
  const relatedMovies = useMemo(
    () =>
      movies
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
        .slice(0, 15),
    [movieId, movies, relatedCategories],
  );

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
        watchLabel="Continuar · 42 min"
        watchParams={{ movieId: item.id }}
        watchTo="/app/movies/$movieId/watch"
      />
      <section className="relative z-30 flex h-[clamp(360px,45vh,480px)] w-full shrink-0 flex-col gap-3.5 overflow-hidden bg-bg px-5 pt-6 pb-10 sm:px-10 sm:pt-6 lg:px-[70px]">
        <h2 className="m-0 font-display text-lg font-bold text-text sm:text-[21px]">
          Você também pode gostar
        </h2>
        <Carousel ariaLabel="Filmes relacionados" edgeToEdge>
          <div
            className="flex min-w-max flex-nowrap gap-3"
            data-tv-navigation-region="catalog-grid"
          >
            {relatedMovies.map((movie, index) => (
              <Link
                className="w-[clamp(153px,calc((45vh_-_100px)*2/3),240px)] min-w-[clamp(153px,calc((45vh_-_100px)*2/3),240px)] shrink-0"
                key={movie.id}
                params={{ movieId: movie.id }}
                to="/app/movies/$movieId"
              >
                <DetailCard
                  accent={index % 2 ? "amber" : "blue"}
                  imageUrl={movie.logoUrl ?? movie.backdropUrl}
                >
                  <span className="truncate text-sm font-bold text-text">
                    {movie.title}
                  </span>
                  <span className="truncate text-[11px] text-muted">
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
