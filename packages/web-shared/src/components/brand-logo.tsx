import { getSharedRuntime } from "../runtime-config";
import { cn } from "../utils/cn";

export function BrandLogo({
  className,
  collapsed = false,
  markClassName,
  textClassName,
}: {
  className?: string;
  collapsed?: boolean;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <img
        alt=""
        aria-hidden="true"
        className={cn("size-9 shrink-0 rounded-[22%]", markClassName)}
        src={`${getSharedRuntime().baseUrl}logo.svg`}
      />
      <span
        className={cn(
          "font-display text-xl font-bold tracking-[-0.04em] text-text",
          collapsed &&
            "hidden group-hover/sidebar:inline group-focus-within/sidebar:inline",
          textClassName,
        )}
      >
        AURA
      </span>
    </span>
  );
}
