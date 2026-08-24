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
      <SearchIcon />
      <input
        {...props}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-text outline-none placeholder:text-muted"
        id="aura-search"
        type="search"
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-muted"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m16 16 4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
