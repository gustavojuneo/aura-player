import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, Play } from "lucide-react";

import { Button, ProductState } from "../../components/ui";
import { useCatalogItem } from "../../hooks/use-catalog-data";
import { useFavorites } from "../../services/favorites";
import { AppLayout } from "./app-shell";

export function MovieDetailsPage() {
  const { movieId } = useParams({ from: "/app/movies/$movieId" });
  const { item, isLoading } = useCatalogItem(movieId);
  const { isFavorite, toggleFavorite } = useFavorites();

  if (isLoading)
    return (
      <ProductState className="min-h-screen justify-center" kind="loading" />
    );
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

  return (
    <AppLayout>
      <main className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pb-24 pt-6 sm:px-8 lg:pb-10">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-text"
          to="/app/movies"
        >
          <ArrowLeft className="size-4" /> Voltar aos filmes
        </Link>
        <section className="grid gap-6 rounded-2xl border border-line bg-panel p-5 md:grid-cols-[220px_1fr] md:p-8">
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#765c3c] to-[#171510]">
            {item.logoUrl && (
              <img
                alt={item.title}
                className="size-full object-cover"
                decoding="async"
                src={item.logoUrl}
              />
            )}
          </div>
          <div className="flex flex-col items-start justify-end gap-4">
            <p className="m-0 text-[11px] font-extrabold uppercase tracking-[0.1em] text-gold-bright">
              Filme
            </p>
            <h1 className="m-0 font-display text-3xl font-bold text-text md:text-5xl">
              {item.title}
            </h1>
            <p className="m-0 text-sm text-muted">
              {item.year ?? "Ano não informado"} ·{" "}
              {item.groupTitle ?? "Sem categoria"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gold bg-gold px-[22px] text-sm font-bold text-ink"
                params={{ movieId: item.id }}
                to="/app/movies/$movieId/watch"
              >
                <Play className="size-4 fill-current" /> Assistir
              </Link>
              <Button
                onClick={() => toggleFavorite("movie", item.id)}
                variant="secondary"
              >
                <Heart
                  className={
                    isFavorite("movie", item.id) ? "fill-gold text-gold" : ""
                  }
                />
                {isFavorite("movie", item.id) ? "Favorito" : "Favoritar"}
              </Button>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
