import { Search } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "../../utils/cn";

export const SearchField = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function SearchField({ className, ...props }, ref) {
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
        aria-keyshortcuts="/"
        className="min-w-0 flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-muted"
        id="aura-search"
        inputMode="search"
        enterKeyHint="search"
        ref={ref}
        type="text"
      />
    </div>
  );
});
