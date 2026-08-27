import type { ReactNode } from "react";

export function ControlButton({
  active = false,
  label,
  children,
  disabled = false,
  onClick,
  shortcut,
}: {
  active?: boolean;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  shortcut?: string;
}) {
  return (
    <span className="group/player-tooltip relative inline-flex">
      <button
        aria-keyshortcuts={shortcut}
        aria-label={label}
        aria-pressed={active || undefined}
        className={`grid size-7 cursor-pointer place-items-center rounded-md text-text transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35 sm:size-8 ${active ? "bg-gold/20 text-gold-bright" : ""}`}
        disabled={disabled}
        data-player-focus-anchor
        onClick={onClick}
        type="button"
      >
        {children}
      </button>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 flex -translate-x-1/2 translate-y-1 items-center gap-2 whitespace-nowrap rounded-md bg-black/90 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-text opacity-0 shadow-xl transition-[opacity,transform] group-hover/player-tooltip:pointer-events-auto group-hover/player-tooltip:translate-y-0 group-hover/player-tooltip:opacity-100"
        role="tooltip"
      >
        {label}
        {shortcut && (
          <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 text-[0.625rem] font-bold text-gold-bright">
            {shortcut}
          </kbd>
        )}
      </span>
    </span>
  );
}
