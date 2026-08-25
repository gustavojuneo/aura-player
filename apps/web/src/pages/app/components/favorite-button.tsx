import { Heart } from "lucide-react";

export function FavoriteButton({
  active,
  label,
  onToggle,
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-black/35 text-gold-bright transition-colors hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-focus"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      type="button"
    >
      <Heart
        aria-hidden="true"
        className={`size-4 ${active ? "fill-current" : ""}`}
      />
    </button>
  );
}
