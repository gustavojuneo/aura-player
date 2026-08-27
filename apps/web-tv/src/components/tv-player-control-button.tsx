import type { ReactNode } from "react";

export function TvPlayerControlButton({
  active = false,
  children,
  disabled = false,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active || undefined}
      className={`grid size-8 cursor-pointer place-items-center rounded-md text-text transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35 ${active ? "bg-gold/20 text-gold-bright" : ""}`}
      disabled={disabled}
      data-player-focus-anchor
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
