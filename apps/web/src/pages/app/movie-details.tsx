import { Link, useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { ProductState } from "../../components/ui";
import { useCatalogItem, useCatalogItems } from "../../hooks/use-catalog-data";
import { useFavorites } from "../../services/favorites";
import {
  DetailCard,
  DetailHero,
  DetailHeroSkeleton,
} from "./components/detail-hero";

export function MovieDetailsPage() {
  const { movieId } = useParams({ from: "/app/movies/$movieId" });
  const { item, isLoading, isMetadataLoading } = useCatalogItem(movieId);
  const { items: movies } = useCatalogItems("movie");
  const { isFavorite, toggleFavorite } = useFavorites();
  const relatedMovies = useMemo(
    () => movies.filter((movie) => movie.id !== movieId).slice(0, 4),
    [movieId, movies],
  );

  if (isLoading || isMetadataLoading) return <DetailHeroSkeleton />;
  if (item?.kind !== "movie")
    return (
      <ProductState
        action={{
          label: "Voltar aos filmes",
          onClick: () => window.history.back(),
        }}
        className="min-h-screen justify-center"
        kind="catalog-empty"
      />
    );

  const category = item.categories?.[0] ?? item.groupTitle ?? "Filme";

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-5 sm:px-10 lg:px-[38px] lg:py-7">
        <button
          className="text-sm font-bold text-text transition-colors hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => window.history.back()}
          type="button"
        >
          <span className="sm:hidden">←</span>
          <span className="hidden sm:inline">←&nbsp; Voltar</span>
        </button>
        <span className="font-display text-[17px] font-extrabold text-text">
          AURA
        </span>
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
        watchLabel="Continuar · 42 min"
        watchParams={{ movieId: item.id }}
        watchTo="/app/movies/$movieId/watch"
      />
      <section className="mx-auto flex max-w-[1300px] flex-col gap-3.5 px-5 pb-12 sm:px-10 sm:pt-3 lg:px-[70px]">
        <h2 className="m-0 font-display text-lg font-bold text-text sm:text-[21px]">
          Você também pode gostar
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          {relatedMovies.map((movie, index) => (
            <Link
              className="min-w-0 flex-1"
              key={movie.id}
              params={{ movieId: movie.id }}
              to="/app/movies/$movieId"
            >
              <DetailCard accent={index % 2 ? "amber" : "blue"}>
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
      </section>
    </main>
  );
}
