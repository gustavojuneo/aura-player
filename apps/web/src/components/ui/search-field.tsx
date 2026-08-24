import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

export function SearchField({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2.5 rounded-xl border border-line bg-search px-3.5",
        className,
      )}
    >
      <Search
        aria-hidden="true"
        className="size-5 shrink-0 text-muted"
        strokeWidth={1.8}
      />
      <input
        {...props}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-muted"
        id="aura-search"
        type="search"
      />
    </div>
  );
}
