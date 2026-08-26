import { ArrowLeft } from "lucide-react";
import type { PlaybackDescriptor } from "../../features/playback/playback";

export function PlayerHeader({
  controlsVisible,
  descriptor,
  onBack,
}: {
  controlsVisible: boolean;
  descriptor: PlaybackDescriptor;
  onBack: () => void;
}) {
  return (
    <header
      className={`relative z-10 flex items-start justify-between px-5 pt-6 transition-opacity sm:px-9 sm:pt-7 ${controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <button
        className="flex min-w-0 items-start gap-3 text-left focus-visible:outline-2 focus-visible:outline-focus"
        onClick={onBack}
        type="button"
      >
        <ArrowLeft className="mt-0.5 size-4 shrink-0" />
        <span className="min-w-0">
          <strong className="block max-w-[220px] truncate text-xs font-bold sm:text-sm">
            {descriptor.title}
          </strong>
          {descriptor.secondaryTitle && (
            <span className="block max-w-[240px] truncate text-[10px] text-muted">
              {descriptor.secondaryTitle}
            </span>
          )}
        </span>
      </button>
      {descriptor.isLive && (
        <span className="rounded-full bg-live px-2.5 py-1 text-[9px] font-extrabold tracking-[0.08em] text-text">
          ● AO VIVO
        </span>
      )}
    </header>
  );
}
