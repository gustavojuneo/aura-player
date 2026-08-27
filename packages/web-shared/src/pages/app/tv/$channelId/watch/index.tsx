import {
  MediaPlayer,
  PlayerScreen,
} from "../../../../../components/media-player";

export function LivePlayerPage() {
  return <PlayerScreen kind="live" player={MediaPlayer} />;
}
