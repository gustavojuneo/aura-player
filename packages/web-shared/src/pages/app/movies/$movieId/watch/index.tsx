import {
  MediaPlayer,
  PlayerScreen,
} from "../../../../../components/media-player";

export function MoviePlayerPage() {
  return <PlayerScreen kind="movie" player={MediaPlayer} />;
}
