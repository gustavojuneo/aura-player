import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Heart, Play } from "lucide-react";
import { useState } from "react";

import { Button } from "../../components/ui";
import { useFavorites } from "../../services/favorites";

type Episode = {
  accent: string;
  id: string;
  meta: string;
  next?: boolean;
  title: string;
};

type SeriesDetails = {
  description: string;
  genre: string;
  seasons: number;
  title: string;
};

const episodesBySeason: Record<number, Episode[]> = {
  1: [
    {
      accent: "bg-[#253844]",
      id: "episode-1",
      meta: "2024 14",
      title: "1. A linha",
    },
    {
      accent: "bg-[#633f20]",
      id: "episode-2",
      meta: "2024 14",
      title: "2. A baixa",
    },
    {
      accent: "bg-[#253844]",
      id: "episode-3",
      meta: "2024 14",
      title: "3. O mapa",
    },
    {
      accent: "bg-[#633f20]",
      id: "episode-4",
      meta: "PRÓXIMO 48 min",
      next: true,
      title: "4. O lado de lá",
    },
  ],
  2: [
    {
      accent: "bg-[#253844]",
      id: "episode-5",
      meta: "2025 14",
      title: "1. O retorno",
    },
    {
      accent: "bg-[#633f20]",
      id: "episode-6",
      meta: "2025 14",
      title: "2. A passagem",
    },
    {
      accent: "bg-[#253844]",
      id: "episode-7",
      meta: "2025 14",
      title: "3. A outra margem",
    },
    {
      accent: "bg-[#633f20]",
      id: "episode-8",
      meta: "2025 14",
      next: true,
      title: "4. O centro",
    },
  ],
};

const seriesDetails: Record<string, SeriesDetails> = {
  "alem-do-veu-1": {
    description:
      "Uma arquiteta percebe que todos os mapas ocultam o mesmo bairro — e decide atravessar a linha que ninguém vê.",
    genre: "Suspense",
    seasons: 2,
    title: "Cidade Velada",
  },
  "alem-do-veu-2": {
    description:
      "Uma arquiteta percebe que todos os mapas ocultam o mesmo bairro — e decide atravessar a linha que ninguém vê.",
    genre: "Suspense",
    seasons: 2,
    title: "Cidade Velada",
  },
  "rota-norte-1": {
    description:
      "Uma equipe segue uma rota que desaparece dos mapas e encontra sinais de uma cidade esquecida.",
    genre: "Ação",
    seasons: 2,
    title: "Rota Norte",
  },
  "rota-norte-2": {
    description:
      "Uma equipe segue uma rota que desaparece dos mapas e encontra sinais de uma cidade esquecida.",
    genre: "Ação",
    seasons: 2,
    title: "Rota Norte",
  },
  "neon-selvagem-1": {
    description:
      "Uma cidade iluminada esconde uma rede que ninguém consegue desligar.",
    genre: "Ficção",
    seasons: 2,
    title: "Neon Selvagem",
  },
  "neon-selvagem-2": {
    description:
      "Uma cidade iluminada esconde uma rede que ninguém consegue desligar.",
    genre: "Ficção",
    seasons: 2,
    title: "Neon Selvagem",
  },
  "arquivo-zero-1": {
    description:
      "Uma investigação revela o arquivo perdido de uma missão que nunca deveria ter existido.",
    genre: "Documentário",
    seasons: 2,
    title: "Arquivo Zero",
  },
  "arquivo-zero-2": {
    description:
      "Uma investigação revela o arquivo perdido de uma missão que nunca deveria ter existido.",
    genre: "Documentário",
    seasons: 2,
    title: "Arquivo Zero",
  },
  "mare-alta-1": {
    description:
      "Quando a maré sobe, uma comunidade precisa escolher o que deseja salvar.",
    genre: "Drama",
    seasons: 2,
    title: "Maré Alta",
  },
  "mare-alta-2": {
    description:
      "Quando a maré sobe, uma comunidade precisa escolher o que deseja salvar.",
    genre: "Drama",
    seasons: 2,
    title: "Maré Alta",
  },
  "o-visitante-1": {
    description:
      "Uma presença inesperada muda para sempre a rotina de uma pequena cidade.",
    genre: "Ação",
    seasons: 2,
    title: "O Visitante",
  },
  "o-visitante-2": {
    description:
      "Uma presença inesperada muda para sempre a rotina de uma pequena cidade.",
    genre: "Ação",
    seasons: 2,
    title: "O Visitante",
  },
};

function BackLink() {
  return (
    <Link
      className="flex items-center gap-2 text-sm font-bold text-text transition-colors hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-focus"
      to="/app/series"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">Voltar</span>
    </Link>
  );
}

function EpisodeCard({
  episode,
  onPlay,
}: {
  episode: Episode;
  onPlay: (episodeId: string) => void;
}) {
  return (
    <article
      className={`group relative flex h-40 min-w-0 flex-col justify-end overflow-hidden rounded-xl border p-3 ${episode.accent} ${episode.next ? "border-2 border-gold" : "border-line"}`}
    >
      <button
        aria-label={`Assistir ${episode.title}`}
        className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-black/25 text-text opacity-0 transition-opacity hover:bg-gold hover:text-ink group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-focus"
        onClick={() => onPlay(episode.id)}
        type="button"
      >
        <Play aria-hidden="true" className="ml-0.5 size-4 fill-current" />
      </button>
      <h3 className="relative m-0 truncate text-sm font-bold text-text">
        {episode.title}
      </h3>
      <p
        className={`relative mt-1 mb-0 text-[11px] ${episode.next ? "text-gold-bright" : "text-muted"}`}
      >
        {episode.meta}
      </p>
    </article>
  );
}

function MobileEpisode({ episode }: { episode: Episode }) {
  return (
    <article
      className={`flex h-[82px] items-center gap-3 rounded-[10px] border bg-panel p-2.5 ${episode.next ? "border-gold" : "border-line"}`}
    >
      <span
        className={`h-[60px] w-[90px] shrink-0 rounded-lg ${episode.accent}`}
      />
      <h3 className="truncate text-[13px] font-bold text-text">
        {episode.title.replace(/^\d+\. /, "Episódio ")}
      </h3>
    </article>
  );
}

function MissingSeries() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-5 text-center text-text">
      <h1 className="m-0 font-display text-2xl font-bold">
        Série não encontrada
      </h1>
      <p className="m-0 text-sm text-muted">
        Esse título não está disponível no catálogo.
      </p>
      <Link
        className="inline-flex h-10 items-center rounded-xl border border-line bg-panel-2 px-4 text-xs font-bold text-text transition-colors hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-focus"
        to="/app/series"
      >
        Voltar às séries
      </Link>
    </main>
  );
}

export function SeriesDetailsPage() {
  const { seriesId } = useParams({ from: "/app/series/$seriesId" });
  const navigate = useNavigate();
  const series = seriesDetails[seriesId];
  const { isFavorite, toggleFavorite } = useFavorites();
  const [season, setSeason] = useState(1);
  const episodes = episodesBySeason[season];

  if (!series) {
    return <MissingSeries />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-bg text-text">
      <section className="relative min-h-[650px] overflow-hidden md:min-h-[665px]">
        <img
          alt=""
          className="absolute inset-0 hidden size-full object-cover md:block"
          src="https://images.unsplash.com/photo-1704494944992-fa43871020ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODc1OTkzMTB8&ixlib=rb-4.1.0&q=80&w=1080"
        />
        <div className="absolute inset-0 bg-[#284151] md:bg-gradient-to-b md:from-transparent md:via-bg/35 md:to-bg" />
        <div className="absolute inset-x-0 top-[120px] h-[300px] bg-gradient-to-b from-transparent to-bg md:hidden" />
        <header className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-[38px] md:pt-7">
          <BackLink />
          <span className="font-display text-[17px] font-extrabold text-text">
            AURA
          </span>
        </header>
        <div className="relative z-10 mx-auto flex max-w-[1300px] flex-col gap-3 px-5 pb-10 pt-[220px] md:gap-[15px] md:px-0 md:pb-10 md:pt-[195px]">
          <p className="m-0 text-[10px] font-extrabold tracking-[0.08em] text-gold-bright md:text-[11px]">
            SÉRIE · {series.seasons} TEMPORADAS
          </p>
          <h1 className="m-0 max-w-[720px] font-display text-[30px] font-bold leading-tight tracking-[-0.05em] text-text md:text-[46px]">
            {series.title}
          </h1>
          <p className="m-0 text-xs font-semibold text-muted md:text-sm md:text-[#d6d0c5]">
            2024 · {series.genre} · 16 · 8 episódios
          </p>
          <p className="m-0 max-w-[680px] text-sm leading-[1.45] text-[#d6d0c5] md:text-[15px]">
            {series.description}
          </p>
          <div className="flex flex-col gap-2.5 pt-0.5 sm:flex-row">
            <Button
              className="h-12 w-full px-[22px] text-sm sm:w-auto"
              onClick={() =>
                void navigate({
                  to: "/app/series/$seriesId/episodes/$episodeId/watch",
                  params: { seriesId, episodeId: "episode-4" },
                })
              }
              variant="primary"
            >
              <Play aria-hidden="true" className="size-4 fill-current" />
              Continuar E4
            </Button>
            <Button
              aria-pressed={isFavorite("series", seriesId)}
              className="hidden h-12 px-[22px] sm:inline-flex"
              onClick={() => toggleFavorite("series", seriesId)}
              variant="secondary"
            >
              <Heart
                aria-hidden="true"
                className={`size-4 ${isFavorite("series", seriesId) ? "fill-current text-gold" : ""}`}
              />
              {isFavorite("series", seriesId) ? "Favoritada" : "Favorito"}
            </Button>
          </div>
          <section className="flex flex-col gap-3 md:hidden">
            <h2 className="m-0 font-display text-lg font-bold text-text">
              Episódios · Temporada {season}
            </h2>
            <div className="flex flex-col gap-2">
              {episodes.slice(2).map((episode) => (
                <MobileEpisode episode={episode} key={episode.id} />
              ))}
            </div>
          </section>
        </div>
      </section>
      <section className="mx-auto hidden max-w-[1300px] px-5 pb-10 md:flex md:flex-col md:gap-3.5 md:px-0">
        <div className="flex items-center justify-between gap-4">
          <h2 className="m-0 font-display text-[21px] font-bold tracking-[-0.04em] text-text">
            Episódios
          </h2>
          <label className="relative flex h-10 min-w-[132px] items-center justify-between gap-2 rounded-xl border border-line bg-panel-2 px-3 text-xs font-semibold text-text">
            <span className="sr-only">Selecionar temporada</span>
            <span>Temporada {season}</span>
            <span aria-hidden="true">⌄</span>
            <select
              aria-label="Selecionar temporada"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(event) => setSeason(Number(event.target.value))}
              value={season}
            >
              {Array.from(
                { length: series.seasons },
                (_, index) => index + 1,
              ).map((item) => (
                <option key={item} value={item}>
                  Temporada {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {episodes.map((episode) => (
            <EpisodeCard
              episode={episode}
              key={episode.id}
              onPlay={(episodeId) =>
                void navigate({
                  to: "/app/series/$seriesId/episodes/$episodeId/watch",
                  params: { seriesId, episodeId },
                })
              }
            />
          ))}
        </div>
      </section>
    </main>
  );
}
