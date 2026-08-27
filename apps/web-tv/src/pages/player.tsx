import { PlayerScreen } from "@aura/web-shared/components/media-player/tv";
import { TvMediaPlayer } from "../components/tv-media-player";

export function MoviePlayerPage() {
  return <PlayerScreen kind="movie" player={TvMediaPlayer} />;
}

export function EpisodePlayerPage() {
  return <PlayerScreen kind="episode" player={TvMediaPlayer} />;
}

export function LivePlayerPage() {
  return <PlayerScreen kind="live" player={TvMediaPlayer} />;
}
