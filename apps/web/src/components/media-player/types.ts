import type Hls from "hls.js";
import type mpegts from "mpegts.js";
import type { ReactNode } from "react";
import type { PlaybackDescriptor } from "../../features/playback/playback";

export type PlayerQuality = "auto" | string;
export type PlayerQualityOption = { label: string; value: string };

export type MediaPlayerProps = {
  autoPlay?: boolean;
  descriptor: PlaybackDescriptor;
  isLoading?: boolean;
  onBack: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onOpenContentList: () => void;
  renderLiveGuide?: ReactNode;
  renderNextEpisode?: (
    remainingSeconds: number,
    onSelect: () => void,
  ) => ReactNode;
  renderContentList?: (
    onClose: () => void,
    avoidLiveGuide: boolean,
  ) => ReactNode;
  showEpisodeNavigation?: boolean;
};

export type PlaybackEngine =
  | Hls
  | mpegts.Player
  | { destroy: () => Promise<void> | void }
  | null;

export type QualityEngine = {
  getHeights: () => number[];
  setQuality: (quality: string) => void;
};
