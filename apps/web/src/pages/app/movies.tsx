import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductState, SearchField } from "../../components/ui";
import { useCatalogItems } from "../../hooks/use-catalog-data";
import { useCatalogState } from "../../hooks/use-catalog-state";
import { AppHeader, AppLayout } from "./app-shell";

type Movie = {
  accent: string;
  genre: string;
  id: string;
  metadata: string;
  title: string;
};

type SortOption = "recent" | "title";

const genres = ["Todos", "Ação", "Drama", "Ficção", "Comédia", "Documentário"];

const movies: Movie[] = [
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

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      className={`group relative flex h-[238px] min-w-0 flex-col justify-end overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br ${movie.accent} p-3.5 transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-focus`}
      params={{ movieId: movie.id }}
      to="/app/movies/$movieId"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(255,255,255,0.1),transparent_25%),linear-gradient(to_top,rgba(0,0,0,0.62),transparent_62%)]" />
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
    </Link>
  );
}

export function MoviesPage() {
  const [genre, setGenre] = useState("Todos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const { isLoading, retry } = useCatalogState();
  const { items: importedMovies } = useCatalogItems("movie");
  const movieCatalog = useMemo<Movie[]>(
    () =>
      importedMovies.length
        ? importedMovies.map((movie) => ({
            accent: "from-[#243442] to-[#171510]",
            genre: movie.groupTitle ?? "Outros",
            id: movie.id,
            metadata: movie.year ? String(movie.year) : "Filme",
            title: movie.title,
          }))
        : movies,
    [importedMovies],
  );

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = movieCatalog.filter((movie) => {
      const matchesGenre = genre === "Todos" || movie.genre === genre;
      const matchesQuery = movie.title
        .toLocaleLowerCase()
        .includes(normalizedQuery);
      return matchesGenre && matchesQuery;
    });

    if (sort === "title") {
      return [...filtered].sort((first, second) =>
        first.title.localeCompare(second.title),
      );
    }

    return filtered;
  }, [genre, movieCatalog, query, sort]);

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-10">
        <AppHeader>
          <SearchField
            aria-label="Buscar no catálogo"
            className="max-w-[420px]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar canais, filmes e séries"
            value={query}
          />
        </AppHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text">
            Filmes
          </h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchField
              aria-label="Buscar filmes"
              className="h-10 w-full sm:w-[330px]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar filmes, títulos..."
              value={query}
            />
            <label className="relative flex h-10 items-center justify-between gap-2 rounded-xl border border-line bg-panel-2 px-3 text-xs font-semibold text-text sm:min-w-[112px]">
              <span className="sr-only">Filtrar por gênero</span>
              <span>Gênero</span>
              <ChevronDown aria-hidden="true" className="size-4 text-muted" />
              <select
                aria-label="Filtrar por gênero"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => setGenre(event.target.value)}
                value={genre}
              >
                {genres.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="relative flex h-10 items-center justify-between gap-2 rounded-xl border border-line bg-panel-2 px-3 text-xs font-semibold text-text sm:min-w-[132px]">
              <span className="sr-only">Ordenar filmes</span>
              <span>{sort === "recent" ? "Mais recentes" : "Título A-Z"}</span>
              <ChevronDown aria-hidden="true" className="size-4 text-muted" />
              <select
                aria-label="Ordenar filmes"
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => setSort(event.target.value as SortOption)}
                value={sort}
              >
                <option value="recent">Mais recentes</option>
                <option value="title">Título A-Z</option>
              </select>
            </label>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {genres.map((item) => (
            <button
              aria-pressed={genre === item}
              className={`h-9 shrink-0 rounded-[9px] border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus ${genre === item ? "border-gold bg-[#3a2b16] text-text" : "border-line bg-transparent text-muted hover:border-gold/60 hover:text-text"}`}
              key={item}
              onClick={() => setGenre(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        {isLoading ? (
          <ProductState
            action={{ label: "Tentar novamente", onClick: retry }}
            className="min-h-[240px] justify-center"
            kind="loading"
          />
        ) : visibleMovies.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-3.5">
            {visibleMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
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
      </div>
    </AppLayout>
  );
}
