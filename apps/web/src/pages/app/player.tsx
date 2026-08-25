import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { MediaPlayer } from "../../components/media-player";
import {
  createPlaybackDescriptor,
  resolvePlaybackUrl,
} from "../../features/playback/playback";
import {
  useCatalogEpisode,
  useCatalogItem,
} from "../../hooks/use-catalog-data";
import { usePlaybackSource } from "../../hooks/use-playback-source";

type PlayerPageProps = { kind: "live" | "movie" | "episode" };

const titles: Record<string, { secondaryTitle?: string; title: string }> = {
  "alem-veu-1": {
    secondaryTitle: "42 min restantes",
    title: "Horizonte de Âmbar",
  },
  "arena-sports": {
    secondaryTitle: "Final continental",
    title: "Arena Sports",
  },
  "episode-4": {
    secondaryTitle: "Episódio 4 · O lado de lá",
    title: "Cidade Velada",
  },
};

export function PlayerPage({ kind }: PlayerPageProps) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const contentId =
    kind === "live"
      ? (params.channelId ?? "arena-sports")
      : kind === "movie"
        ? (params.movieId ?? "alem-veu-1")
        : (params.episodeId ?? "episode-4");
  const movie = useCatalogItem(kind === "movie" ? contentId : undefined);
  const episode = useCatalogEpisode(
    kind === "episode" ? contentId : undefined,
    kind === "episode" ? params.seriesId : undefined,
  );
  const item = kind === "episode" ? episode.item : movie.item;
  const isLoading = kind === "episode" ? episode.isLoading : movie.isLoading;
  const content = item ?? titles[contentId] ?? { title: contentId };
  const rawStreamUrl = item?.streamUrl ?? resolvePlaybackUrl(contentId);
  const playbackSource = usePlaybackSource(rawStreamUrl, Boolean(rawStreamUrl));
  if (playbackSource.error)
    return (
      <main className="grid min-h-screen place-items-center bg-bg p-6 text-center text-sm text-danger-strong">
        Não foi possível preparar este conteúdo.
      </main>
    );
  const descriptor = createPlaybackDescriptor({
    contentId,
    delivery: item?.delivery,
    isLive: kind === "live",
    position: undefined,
    secondaryTitle:
      "secondaryTitle" in content ? content.secondaryTitle : item?.groupTitle,
    streamUrl: playbackSource.source,
    title: content.title,
  });

  const goBack = () => {
    if (kind === "live") return void navigate({ to: "/app/tv" });
    if (kind === "movie")
      return void navigate({
        to: "/app/movies/$movieId",
        params: { movieId: contentId },
      });
    return void navigate({
      to: "/app/series/$seriesId",
      params: { seriesId: item?.seriesId ?? "" },
    });
  };

  return (
    <MediaPlayer
      autoPlay={kind === "episode"}
      descriptor={descriptor}
      isLoading={isLoading || playbackSource.isLoading}
      onBack={goBack}
    />
  );
}

export function PlayerFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg p-6 text-center text-text">
      <div>
        <h1 className="font-display text-2xl font-bold">
          Player não encontrado
        </h1>
        <Link className="mt-4 inline-block text-sm text-gold-bright" to="/app">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
