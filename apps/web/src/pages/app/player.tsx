import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { MediaPlayer } from "../../components/media-player";
import {
  createPlaybackDescriptor,
  resolvePlaybackUrl,
} from "../../features/playback/playback";

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
  const content = titles[contentId] ?? { title: contentId };
  const descriptor = createPlaybackDescriptor({
    contentId,
    isLive: kind === "live",
    position: kind === "movie" ? 42 * 60 : undefined,
    secondaryTitle: content.secondaryTitle,
    streamUrl: resolvePlaybackUrl(contentId),
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
      params: { seriesId: "alem-do-veu-1" },
    });
  };

  return <MediaPlayer descriptor={descriptor} onBack={goBack} />;
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
