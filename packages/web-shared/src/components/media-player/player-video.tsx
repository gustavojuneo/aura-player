import type { RefObject } from "react";
import type { PlaybackDescriptor } from "../../features/playback/playback";
import type { PlayerAspectRatio } from "../../utils/constants";

type PlayerVideoProps = {
  aspectRatio: PlayerAspectRatio;
  autoPlay: boolean;
  descriptor: PlaybackDescriptor;
  videoRef: RefObject<HTMLVideoElement | null>;
};

export function PlayerVideo({
  aspectRatio,
  autoPlay,
  descriptor,
  videoRef,
}: PlayerVideoProps) {
  const fixedAspect = aspectRatio === "16:9" || aspectRatio === "4:3";
  const style = fixedAspect
    ? {
        aspectRatio: aspectRatio === "16:9" ? "16 / 9" : "4 / 3",
        width:
          aspectRatio === "16:9"
            ? "min(100%, 177.78vh)"
            : "min(100%, 133.33vh)",
      }
    : undefined;
  const className =
    aspectRatio === "original"
      ? "absolute inset-0 size-full object-contain"
      : aspectRatio === "fill"
        ? "absolute inset-0 size-full object-fill"
        : aspectRatio === "crop"
          ? "absolute inset-0 size-full object-cover"
          : "absolute left-1/2 top-1/2 h-auto max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 object-contain";
  return (
    <video
      aria-label={descriptor.title}
      autoPlay={autoPlay}
      className={className}
      preload={descriptor.isLive ? "none" : "metadata"}
      playsInline
      ref={videoRef}
      style={style}
    >
      <track
        kind="captions"
        label="Português"
        src="data:text/vtt,WEBVTT"
        srcLang="pt-BR"
      />
    </video>
  );
}
