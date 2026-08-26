import type { ReactNode } from "react";

export function ControlButton({
  active = false,
  label,
  children,
  disabled = false,
  onClick,
}: {
  active?: boolean;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active || undefined}
      className={`grid size-7 place-items-center rounded-md text-text transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-35 sm:size-8 ${active ? "bg-gold/20 text-gold-bright" : ""}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
