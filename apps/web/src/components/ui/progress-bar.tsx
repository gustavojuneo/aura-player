import { cn } from "../../utils/cn";

export function ProgressBar({
  value = 61,
  className,
}: {
  value?: number;
  className?: string;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div
      aria-label={`${safeValue}% concluído`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={safeValue}
      className={cn("h-1.5 overflow-hidden rounded-full bg-line", className)}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-gold transition-[width]"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
