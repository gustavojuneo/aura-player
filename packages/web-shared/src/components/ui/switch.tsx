import { cn } from "../../utils/cn";

export function Switch({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        checked ? "justify-end bg-gold" : "justify-start bg-panel-2",
      )}
      onClick={() => onCheckedChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "size-[18px] rounded-full",
          checked ? "bg-ink" : "bg-muted",
        )}
      />
    </button>
  );
}
