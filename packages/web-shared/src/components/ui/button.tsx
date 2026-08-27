import type { ButtonHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

import { cn } from "../../utils/cn";

export const button = tv({
  base: "inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-[22px] text-sm font-bold outline-2 outline-offset-2 outline-transparent transition-colors focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    variant: {
      primary: "border-gold bg-gold text-ink hover:bg-gold-bright",
      secondary:
        "border-line bg-panel-2 text-text hover:border-gold/60 hover:bg-panel-2/80",
      quiet:
        "border-line bg-panel text-muted hover:border-gold/60 hover:bg-panel-2 hover:text-text",
      text: "border-line bg-panel-2 text-gold-bright hover:border-gold/60 hover:bg-panel hover:text-text",
      destructive:
        "border-danger bg-danger-surface text-danger-strong hover:bg-danger/20",
    },
  },
  defaultVariants: { variant: "primary" },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({
  variant,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(button({ variant }), className)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
