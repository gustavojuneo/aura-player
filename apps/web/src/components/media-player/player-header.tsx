import { ArrowLeft } from "lucide-react";
import type { PlaybackDescriptor } from "../../features/playback/playback";

export function PlayerHeader({
  descriptor,
  onBack,
}: {
  descriptor: PlaybackDescriptor;
  onBack: () => void;
}) {
  return (
    <header className="relative z-10 flex items-start justify-between px-5 pt-6 sm:px-9 sm:pt-7">
      <button
        data-player-back
        className="flex min-w-0 cursor-pointer items-start gap-3 rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-left text-text outline-2 outline-offset-2 outline-transparent transition-colors hover:bg-white/10 hover:text-gold-bright focus-visible:outline-focus"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="mt-0.5 size-4 shrink-0" />
        <span className="min-w-0">
          <strong className="block max-w-[220px] truncate text-xs font-bold sm:text-sm">
            {descriptor.title}
          </strong>
          {descriptor.secondaryTitle && (
            <span className="block max-w-[240px] truncate text-[0.625rem] text-muted">
              {descriptor.secondaryTitle}
            </span>
          )}
        </span>
      </button>
      {descriptor.isLive && (
        <span className="rounded-full bg-live px-2.5 py-1 text-[0.5625rem] font-extrabold tracking-[0.08em] text-text">
          ● AO VIVO
        </span>
      )}
    </header>
  );
}
