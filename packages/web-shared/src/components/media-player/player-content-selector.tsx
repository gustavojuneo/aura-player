import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { ScrollArea } from "../ui";

type PlayerContentSelectorOption = {
  label: string;
  value: string;
};

export function PlayerContentSelector({
  "aria-label": ariaLabel,
  onInteraction,
  onValueChange,
  options,
  popupClassName,
  value,
}: {
  "aria-label": string;
  onInteraction: () => void;
  onValueChange: (value: string) => void;
  options: readonly PlayerContentSelectorOption[];
  popupClassName?: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const focusFirstItem = () => {
      triggerRef.current
        ?.closest("[data-player-content-list]")
        ?.querySelector<HTMLElement>(
          '[data-player-content-item="true"]:not([disabled])',
        )
        ?.focus();
    };

    const focusOption = (index: number) => {
      const options = Array.from(
        popupRef.current?.querySelectorAll<HTMLElement>(
          '[data-player-content-select-option="true"]:not([disabled])',
        ) ?? [],
      );
      options[index]?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLElement)) return;

      if (activeElement === triggerRef.current) {
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopImmediatePropagation();
          onInteraction();
          setOpen((isOpen) => {
            if (!isOpen) {
              window.requestAnimationFrame(() => {
                const selectedIndex = options.findIndex(
                  (option) => option.value === value,
                );
                focusOption(Math.max(0, selectedIndex));
              });
            }
            return !isOpen;
          });
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          event.stopImmediatePropagation();
          onInteraction();
          focusFirstItem();
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          event.stopImmediatePropagation();
          onInteraction();
          triggerRef.current
            ?.closest("[data-player-content-list]")
            ?.querySelector<HTMLElement>(
              '[aria-label="Fechar lista de conteúdo"]',
            )
            ?.focus();
        }
        return;
      }

      if (!popupRef.current?.contains(activeElement)) return;

      const optionElements = Array.from(
        popupRef.current.querySelectorAll<HTMLElement>(
          '[data-player-content-select-option="true"]:not([disabled])',
        ),
      );
      const currentIndex = optionElements.indexOf(activeElement);
      if (currentIndex < 0) return;

      if (event.key === "Enter") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onInteraction();
        activeElement.click();
        return;
      }

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        event.stopImmediatePropagation();
        onInteraction();
        if (event.key === "ArrowUp" && currentIndex === 0) {
          setOpen(false);
          triggerRef.current?.focus();
          return;
        }
        const offset = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex = Math.min(
          optionElements.length - 1,
          Math.max(0, currentIndex + offset),
        );
        focusOption(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onInteraction, options, value]);

  const handleValueSelect = (nextValue: string) => {
    onInteraction();
    setOpen(false);
    onValueChange(nextValue);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <div className="relative">
      <button
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="group inline-flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-white/15 bg-transparent px-3 text-xs font-semibold text-text outline-none transition-colors hover:border-gold/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-focus/40"
        data-player-content-select="true"
        onClick={() => {
          onInteraction();
          setOpen((isOpen) => !isOpen);
        }}
        ref={triggerRef}
        type="button"
      >
        <span className="min-w-0 flex-1 truncate text-left">
          {options.find((option) => option.value === value)?.label}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          className={cn(
            "absolute top-full right-0 z-30 mt-1.5 w-full rounded-xl border border-line bg-panel p-1.5 text-sm text-text shadow-2xl",
            popupClassName,
          )}
          ref={popupRef}
          role="listbox"
        >
          <ScrollArea className="h-60">
            <div className="grid gap-0.5">
              {options.map((option) => (
                <button
                  aria-selected={option.value === value}
                  className="flex min-h-9 w-full cursor-pointer items-center rounded-lg px-2.5 py-2 text-left outline-none transition-colors hover:bg-panel-2 focus:bg-panel-2"
                  data-player-content-select-option="true"
                  key={option.value}
                  onClick={() => handleValueSelect(option.value)}
                  role="option"
                  type="button"
                >
                  <span className="min-w-0 flex-1 truncate">
                    {option.label}
                  </span>
                  {option.value === value && (
                    <span aria-hidden="true" className="ml-3 text-gold-bright">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
