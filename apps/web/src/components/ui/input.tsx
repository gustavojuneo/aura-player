import { Input as InputPrimitive } from "@base-ui/react/input";
import type { ComponentProps } from "react";

import { cn } from "../../utils/cn";

export function Input({
  className,
  ...props
}: ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      className={cn(
        "flex h-10 w-full rounded-md border border-line bg-search px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-focus/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
