import { Link } from "@tanstack/react-router";
import { memo, useMemo, useRef, useState } from "react";
import { CatalogGridSkeleton } from "../../../components/catalog-skeleton";
import {
  CategoryDialog,
  CategoryFilterTrigger,
  CategorySidebar,
} from "../../../components/category-dialog";
import {
  ProductState,
  ScrollArea,
  SearchField,
  SelectField,
  VirtualizedGrid,
} from "../../../components/ui";
import { useCatalogItems } from "../../../hooks/use-catalog-data";
import { useInfiniteCatalog } from "../../../hooks/use-infinite-catalog";
import { useSearchShortcut } from "../../../hooks/use-search-shortcut";
import { AppHeader } from "../components";

type Movie = {
  accent: string;
  categories?: string[];
  genre: string;
  id: string;
  logoUrl?: string;
  metadata: string;
  title: string;
};

type SortOption = "recent" | "title";

const _movies: Movie[] = [
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Drama",
    id: "alem-veu-1",
    metadata: "2020 12",
    title: "Além Véu",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ação",
    id: "rota-norte-1",
    metadata: "2021 13",
    title: "Rota Norte",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Ficção",
    id: "neon-selvagem-1",
    metadata: "2022 14",
    title: "Neon Selvagem",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Documentário",
    id: "arquivo-zero-1",
    metadata: "2023 15",
    title: "Arquivo Zero",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Drama",
    id: "mare-alta-1",
    metadata: "2024 16",
    title: "Maré Alta",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ação",
    id: "o-visitante-1",
    metadata: "2020 17",
    title: "O Visitante",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ficção",
    id: "alem-veu-2",
    metadata: "2020 12",
    title: "Além Véu",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Ação",
    id: "rota-norte-2",
    metadata: "2021 13",
    title: "Rota Norte",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Ficção",
    id: "neon-selvagem-2",
    metadata: "2022 14",
    title: "Neon Selvagem",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Documentário",
    id: "arquivo-zero-2",
    metadata: "2023 15",
    title: "Arquivo Zero",
  },
  {
    accent: "from-[#78502a] to-[#171510]",
    genre: "Drama",
    id: "mare-alta-2",
    metadata: "2024 16",
    title: "Maré Alta",
  },
  {
    accent: "from-[#243442] to-[#171510]",
    genre: "Ação",
    id: "o-visitante-2",
    metadata: "2020 17",
    title: "O Visitante",
  },
];

const MovieCard = memo(function MovieCard({ movie }: { movie: Movie }) {
  return (
    <article
      className={`[content-visibility:auto] group relative flex aspect-[2/3] min-w-0 flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br ${movie.accent} p-3.5 transition-transform hover:-translate-y-1`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(255,255,255,0.1),transparent_25%),linear-gradient(to_top,rgba(0,0,0,0.62),transparent_62%)]" />
      <Link
        aria-label={`Abrir ${movie.title}`}
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-focus"
        params={{ movieId: movie.id }}
        to="/app/movies/$movieId"
      />
      {movie.logoUrl && (
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          decoding="async"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
          referrerPolicy="no-referrer"
          src={movie.logoUrl}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 shadow-[inset_0_-90px_70px_-28px_rgba(0,0,0,0.9)]"
      />
      <div className="relative min-w-0">
        {movie.title ? (
          <h2 className="truncate text-sm font-bold text-text">
            {movie.title}
          </h2>
        ) : (
          <ProductState compact kind="metadata" />
        )}
        <p className="mt-1 mb-0 truncate text-[11px] text-[#d0c8bb]">
          {movie.metadata}
        </p>
      </div>
    </article>
  );
});

export function MoviesPage() {
  const [genre, setGenre] = useState("Todos");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const searchInputRef = useRef<HTMLInputElement>(null);
  useSearchShortcut(searchInputRef);
  const { items: importedMovies, isLoading } = useCatalogItems("movie");
  const movieCatalog = useMemo<Movie[]>(
    () =>
      importedMovies.map((movie) => ({
        accent: "from-[#243442] to-[#171510]",
        categories: movie.categories?.length
          ? movie.categories
          : movie.groupTitle
            ? [movie.groupTitle]
            : ["Sem categoria"],
        genre: movie.categories?.[0] ?? movie.groupTitle ?? "Sem categoria",
        id: movie.id,
        logoUrl: movie.logoUrl,
        metadata: movie.year ? String(movie.year) : "Filme",
        title: movie.title,
      })),
    [importedMovies],
  );

  const categories = useMemo(
    () => [
      "Todos",
      ...new Set(
        movieCatalog.flatMap((movie) =>
          movie.categories?.length ? movie.categories : [movie.genre],
        ),
      ),
    ],
    [movieCatalog],
  );
  const {
    visibleItems: visibleMovies,
    filteredCount,
    hasMore,
    sentinelRef,
  } = useInfiniteCatalog(
    movieCatalog,
    (movie, search, category) =>
      (search.length > 0 ||
        category === "Todos" ||
        (movie.categories?.length ? movie.categories : [movie.genre]).includes(
          category,
        )) &&
      movie.title.toLocaleLowerCase().includes(search),
    sort === "title"
      ? (first, second) => first.title.localeCompare(second.title)
      : () => 0,
    query,
    genre,
  );

  return (
    <>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-10">
        <AppHeader className="sticky top-0 z-30 bg-bg/95 py-2 backdrop-blur-sm">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
            <h1 className="hidden min-w-0 truncate font-display text-[28px] font-bold tracking-[-0.05em] text-text md:block">
              Filmes
            </h1>
            <div className="hidden min-w-0 items-center gap-2 lg:flex">
              <SearchField
                aria-label="Buscar filmes"
                className="h-10 w-[330px]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar filmes, títulos..."
                ref={searchInputRef}
                value={query}
              />
              <SelectField
                aria-label="Ordenar filmes"
                className="min-w-[132px]"
                onValueChange={(value) => setSort(value as SortOption)}
                options={[
                  { label: "Mais recentes", value: "recent" },
                  { label: "Título A-Z", value: "title" },
                ]}
                value={sort}
                valueLabel={sort === "recent" ? "Mais recentes" : "Título A-Z"}
              />
            </div>
          </div>
        </AppHeader>
        <div className="md:hidden">
          <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text">
            Filmes
          </h1>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <CategoryFilterTrigger onClick={() => setCategoryDialogOpen(true)} />
        </div>
        <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start">
          <CategorySidebar
            categories={categories}
            isLoading={isLoading}
            onSelect={setGenre}
            selected={genre}
          />
          <ScrollArea className="h-[calc(100vh-8rem)] min-w-0 flex-1">
            {isLoading ? (
              <CatalogGridSkeleton />
            ) : visibleMovies.length > 0 ? (
              <div className="relative">
                <VirtualizedGrid
                  columnCount={(width) =>
                    width < 640 ? 2 : width < 1024 ? 4 : width < 1280 ? 5 : 6
                  }
                  getItemKey={(movie) => movie.id}
                  items={visibleMovies}
                  renderItem={(movie) => <MovieCard movie={movie} />}
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1"
                  ref={sentinelRef}
                />
              </div>
            ) : (
              <ProductState
                action={{
                  label: "Limpar filtros",
                  onClick: () => {
                    setGenre("Todos");
                    setQuery("");
                  },
                }}
                className="min-h-[240px] justify-center"
                kind="catalog-empty"
              />
            )}
            {hasMore && visibleMovies.length > 0 && (
              <p
                className="mt-5 mb-0 text-center text-xs text-muted"
                role="status"
              >
                Mostrando {visibleMovies.length} de {filteredCount} filmes...
              </p>
            )}
          </ScrollArea>
        </div>
      </div>
      {categoryDialogOpen && (
        <CategoryDialog
          categories={categories}
          onClose={() => setCategoryDialogOpen(false)}
          onSelect={setGenre}
          selected={genre}
        />
      )}
    </>
  );
}
