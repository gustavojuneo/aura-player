import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, Play } from "lucide-react";

import { Button } from "../../components/ui";

type MovieDetails = {
  description: string;
  duration: string;
  genre: string;
  id: string;
  metadata: string;
  related: Array<{
    accent: string;
    title: string;
    metadata: string;
  }>;
  title: string;
};

const relatedMovies = [
  { accent: "bg-[#253844]", metadata: "2024 14", title: "Último Sinal" },
  { accent: "bg-[#633f20]", metadata: "2024 14", title: "Rota Norte" },
  { accent: "bg-[#253844]", metadata: "2024 14", title: "Arquivo Zero" },
  { accent: "bg-[#633f20]", metadata: "2024 14", title: "Maré Alta" },
];

const movieDetails: Record<string, MovieDetails> = {
  "alem-veu-1": {
    description: "Uma expedição segue um sinal impossível.",
    duration: "2h 08min",
    genre: "Ficção",
    id: "alem-veu-1",
    metadata: "2024 14",
    related: relatedMovies,
    title: "Horizonte de Âmbar",
  },
  "alem-veu-2": {
    description: "Uma expedição segue um sinal impossível.",
    duration: "2h 08min",
    genre: "Ficção",
    id: "alem-veu-2",
    metadata: "2024 14",
    related: relatedMovies,
    title: "Horizonte de Âmbar",
  },
  "rota-norte-1": {
    description:
      "Uma equipe atravessa uma fronteira esquecida em busca da última transmissão.",
    duration: "1h 55min",
    genre: "Ação",
    id: "rota-norte-1",
    metadata: "2021 13",
    related: relatedMovies,
    title: "Rota Norte",
  },
  "rota-norte-2": {
    description:
      "Uma equipe atravessa uma fronteira esquecida em busca da última transmissão.",
    duration: "1h 55min",
    genre: "Ação",
    id: "rota-norte-2",
    metadata: "2021 13",
    related: relatedMovies,
    title: "Rota Norte",
  },
  "neon-selvagem-1": {
    description:
      "Uma cidade iluminada esconde uma rede que ninguém consegue desligar.",
    duration: "2h 04min",
    genre: "Ficção",
    id: "neon-selvagem-1",
    metadata: "2022 14",
    related: relatedMovies,
    title: "Neon Selvagem",
  },
  "neon-selvagem-2": {
    description:
      "Uma cidade iluminada esconde uma rede que ninguém consegue desligar.",
    duration: "2h 04min",
    genre: "Ficção",
    id: "neon-selvagem-2",
    metadata: "2022 14",
    related: relatedMovies,
    title: "Neon Selvagem",
  },
  "arquivo-zero-1": {
    description:
      "O arquivo perdido de uma missão revela uma história impossível.",
    duration: "1h 42min",
    genre: "Documentário",
    id: "arquivo-zero-1",
    metadata: "2023 15",
    related: relatedMovies,
    title: "Arquivo Zero",
  },
  "arquivo-zero-2": {
    description:
      "O arquivo perdido de uma missão revela uma história impossível.",
    duration: "1h 42min",
    genre: "Documentário",
    id: "arquivo-zero-2",
    metadata: "2023 15",
    related: relatedMovies,
    title: "Arquivo Zero",
  },
  "mare-alta-1": {
    description:
      "Quando a maré sobe, uma comunidade precisa escolher o que deseja salvar.",
    duration: "1h 48min",
    genre: "Drama",
    id: "mare-alta-1",
    metadata: "2024 16",
    related: relatedMovies,
    title: "Maré Alta",
  },
  "mare-alta-2": {
    description:
      "Quando a maré sobe, uma comunidade precisa escolher o que deseja salvar.",
    duration: "1h 48min",
    genre: "Drama",
    id: "mare-alta-2",
    metadata: "2024 16",
    related: relatedMovies,
    title: "Maré Alta",
  },
  "o-visitante-1": {
    description:
      "Uma presença inesperada muda para sempre a rotina de uma pequena cidade.",
    duration: "1h 50min",
    genre: "Ação",
    id: "o-visitante-1",
    metadata: "2020 17",
    related: relatedMovies,
    title: "O Visitante",
  },
  "o-visitante-2": {
    description:
      "Uma presença inesperada muda para sempre a rotina de uma pequena cidade.",
    duration: "1h 50min",
    genre: "Ação",
    id: "o-visitante-2",
    metadata: "2020 17",
    related: relatedMovies,
    title: "O Visitante",
  },
};

function BackLink() {
  return (
    <Link
      className="flex items-center gap-2 text-sm font-bold text-text transition-colors hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-focus"
      to="/app/movies"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">Voltar</span>
    </Link>
  );
}

function RelatedDesktop({ movies }: { movies: MovieDetails["related"] }) {
  return (
    <section className="hidden md:flex md:flex-col md:gap-3.5">
      <h2 className="m-0 font-display text-[21px] font-bold tracking-[-0.04em] text-text">
        Você também pode gostar
      </h2>
      <div className="grid grid-cols-4 gap-3">
        {movies.map((movie) => (
          <article
            className={`flex h-40 flex-col justify-end rounded-xl border border-line p-3 ${movie.accent}`}
            key={movie.title}
          >
            <h3 className="m-0 truncate text-sm font-bold text-text">
              {movie.title}
            </h3>
            <p className="mt-1 mb-0 text-[11px] text-muted">{movie.metadata}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RelatedMobile({ movies }: { movies: MovieDetails["related"] }) {
  return (
    <section className="flex flex-col gap-3 md:hidden">
      <h2 className="m-0 font-display text-lg font-bold text-text">
        Relacionados
      </h2>
      <div className="flex flex-col gap-2">
        {movies.slice(0, 2).map((movie) => (
          <article
            className="flex h-[82px] items-center gap-3 rounded-[10px] border border-line bg-panel p-2.5"
            key={movie.title}
          >
            <span
              className={`h-[60px] w-[90px] shrink-0 rounded-lg ${movie.accent}`}
            />
            <h3 className="truncate text-[13px] font-bold text-text">
              {movie.title}
            </h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function MissingMovie() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-5 text-center text-text">
      <h1 className="m-0 font-display text-2xl font-bold">
        Filme não encontrado
      </h1>
      <p className="m-0 text-sm text-muted">
        Esse título não está disponível no catálogo.
      </p>
      <Button className="h-10 px-4 text-xs" variant="secondary">
        <Link to="/app/movies">Voltar aos filmes</Link>
      </Button>
    </main>
  );
}

export function MovieDetailsPage() {
  const { movieId } = useParams({ from: "/app/movies/$movieId" });
  const movie = movieDetails[movieId];

  if (!movie) {
    return <MissingMovie />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-bg text-text">
      <section className="relative min-h-[650px] overflow-hidden md:min-h-[665px]">
        <img
          alt=""
          className="absolute inset-0 hidden size-full object-cover md:block"
          src="https://images.unsplash.com/photo-1769128189569-3220e369984c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODc1OTkzMTB8&ixlib=rb-4.1.0&q=80&w=1080"
        />
        <div className="absolute inset-0 bg-[#6f441e] md:bg-gradient-to-b md:from-transparent md:via-bg/35 md:to-bg" />
        <div className="absolute inset-x-0 top-[120px] h-[300px] bg-gradient-to-b from-transparent to-bg md:hidden" />
        <header className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-[38px] md:pt-7">
          <BackLink />
          <span className="font-display text-[17px] font-extrabold text-text">
            AURA
          </span>
        </header>
        <div className="relative z-10 mx-auto flex max-w-[1300px] flex-col gap-3 px-5 pb-10 pt-[220px] md:gap-[15px] md:px-0 md:pb-10 md:pt-[195px]">
          <p className="m-0 text-[10px] font-extrabold tracking-[0.08em] text-gold-bright md:text-[11px]">
            <span className="md:hidden">
              FILME · {movie.metadata.slice(0, 4)}
            </span>
            <span className="hidden md:inline">FILME DESTAQUE</span>
          </p>
          <h1 className="m-0 max-w-[720px] font-display text-[30px] font-bold leading-tight tracking-[-0.05em] text-text md:text-[46px]">
            {movie.title}
          </h1>
          <p className="m-0 text-xs font-semibold text-muted md:text-sm md:text-[#d6d0c5]">
            <span className="md:hidden">
              {movie.duration} · {movie.genre} · {movie.metadata.slice(-2)}
            </span>
            <span className="hidden md:inline">{movie.metadata}</span>
          </p>
          <p className="m-0 max-w-[680px] text-sm leading-[1.45] text-[#d6d0c5] md:text-[15px]">
            {movie.description}
          </p>
          <div className="flex flex-col gap-2.5 pt-0.5 sm:flex-row">
            <Button
              className="h-12 w-full px-[22px] text-sm sm:w-auto"
              variant="primary"
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Continuar 42 min
            </Button>
            <Button
              className="hidden h-12 px-[22px] sm:inline-flex"
              variant="secondary"
            >
              <Heart aria-hidden="true" className="size-4" />
              Favorito
            </Button>
          </div>
          <RelatedMobile movies={movie.related} />
        </div>
      </section>
      <div className="mx-auto hidden max-w-[1300px] px-5 pb-10 md:block md:px-0">
        <RelatedDesktop movies={movie.related} />
      </div>
    </main>
  );
}
