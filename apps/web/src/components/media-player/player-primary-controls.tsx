import { LoaderCircle, Pause, Play, RotateCcw, RotateCw } from "lucide-react";

type PlayerPrimaryControlsProps = {
  controlsVisible: boolean;
  isLive: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  pendingSeek: number;
  onSeek: (delta: number) => void;
  onTogglePlay: () => void;
  reduceMotion: boolean;
};
export function PlayerPrimaryControls({
  controlsVisible,
  isLive,
  isPlaying,
  isLoading,
  pendingSeek,
  onSeek,
  onTogglePlay,
  reduceMotion,
}: PlayerPrimaryControlsProps) {
  return (
    <div
      className={`absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      {!isLive && (
        <button
          aria-label={`Retroceder ${Math.abs(pendingSeek < 0 ? pendingSeek : 10)} segundos`}
          className="flex h-16 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-base font-bold text-text opacity-60 transition-[background-color,opacity] hover:bg-white/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-40"
          disabled={isLoading}
          onClick={() => onSeek(-10)}
          type="button"
        >
          <RotateCcw aria-hidden="true" className="size-5" />
          <span>{pendingSeek < 0 ? `${pendingSeek}s` : "-10s"}</span>
        </button>
      )}
      <button
        aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        className={`grid size-[88px] cursor-pointer place-items-center rounded-full border border-white/20 bg-[#171510CC] text-text opacity-60 focus-visible:outline-2 focus-visible:outline-focus hover:opacity-100 ${isLoading ? "cursor-wait" : ""} ${reduceMotion ? "transition-none" : "transition-[opacity,transform] hover:scale-105"}`}
        disabled={isLoading}
        onClick={onTogglePlay}
        type="button"
      >
        {isLoading ? (
          <LoaderCircle aria-hidden="true" className="size-8 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-8" />
        ) : (
          <Play className="ml-1 size-8 fill-current" />
        )}
      </button>
      {!isLive && (
        <button
          aria-label={`Avançar ${pendingSeek > 0 ? pendingSeek : 10} segundos`}
          className="flex h-16 min-w-20 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-base font-bold text-text opacity-60 transition-[background-color,opacity] hover:bg-white/10 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-wait disabled:opacity-40"
          disabled={isLoading}
          onClick={() => onSeek(10)}
          type="button"
        >
          <span>{pendingSeek > 0 ? `+${pendingSeek}s` : "+10s"}</span>
          <RotateCw aria-hidden="true" className="size-5" />
        </button>
      )}
    </div>
  );
}
