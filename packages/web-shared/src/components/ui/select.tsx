import { Select as BaseSelect } from "@base-ui/react/select";
import type { ReactNode } from "react";

import { cn } from "../../utils/cn";

export type SelectFieldOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export function SelectField({
  "aria-label": ariaLabel,
  className,
  focusAnchor = false,
  leading,
  onOpenChange,
  onValueChange,
  options,
  popupClassName,
  placeholder,
  triggerClassName,
  value,
  valueLabel,
}: {
  "aria-label": string;
  className?: string;
  focusAnchor?: boolean;
  leading?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onValueChange: (value: string) => void;
  options: readonly SelectFieldOption[];
  popupClassName?: string;
  placeholder?: ReactNode;
  triggerClassName?: string;
  value?: string;
  valueLabel?: ReactNode;
}) {
  const items = options.map(({ label, value: optionValue }) => ({
    label,
    value: optionValue,
  }));

  return (
    <BaseSelect.Root
      items={items}
      onOpenChange={onOpenChange}
      onValueChange={(nextValue) => {
        if (nextValue !== null) onValueChange(nextValue);
      }}
      value={value ?? null}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        data-player-focus-anchor={focusAnchor || undefined}
        data-tv-select-trigger
        className={cn(
          "group inline-flex h-10 min-w-0 items-center justify-between gap-2 rounded-xl border border-line bg-panel-2 px-3 text-xs font-semibold text-text outline-none transition-colors hover:border-gold/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-focus/40 disabled:cursor-not-allowed disabled:opacity-50",
          className,
          triggerClassName,
        )}
      >
        {leading}
        <span className="min-w-0 flex-1 truncate text-left">
          {valueLabel ? (
            <BaseSelect.Value>{valueLabel}</BaseSelect.Value>
          ) : (
            <BaseSelect.Value placeholder={placeholder} />
          )}
        </span>
        <BaseSelect.Icon className="shrink-0 text-muted transition-transform group-data-[popup-open]:rotate-180">
          <svg
            aria-hidden="true"
            className="size-4"
            fill="none"
            viewBox="0 0 16 16"
          >
            <path
              d="m4 6 4 4 4-4"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-[100]" side="top" sideOffset={6}>
          <BaseSelect.Popup
            className={cn(
              "z-50 max-h-[min(360px,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-xl border border-line bg-panel p-1.5 text-sm text-text shadow-2xl outline-none data-[open]:animate-in data-[closed]:animate-out",
              popupClassName,
            )}
          >
            {options.map((option) => (
              <BaseSelect.Item
                className="relative flex min-h-9 cursor-default select-none items-center rounded-lg px-2.5 py-2 outline-none transition-colors data-[highlighted]:bg-panel-2 data-[highlighted]:text-text data-[selected]:text-gold-bright data-[disabled]:pointer-events-none data-[disabled]:opacity-40"
                disabled={option.disabled}
                key={option.value}
                value={option.value}
              >
                <BaseSelect.ItemText className="min-w-0 flex-1 truncate">
                  {option.label}
                </BaseSelect.ItemText>
                <BaseSelect.ItemIndicator className="ml-3 text-gold-bright">
                  ✓
                </BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
