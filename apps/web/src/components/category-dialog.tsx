import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "../utils/cn";
import {
  Dialog,
  DialogBackdrop,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
  ScrollArea,
  Skeleton,
} from "./ui";

export function CategoryDialog({
  categories,
  onClose,
  onSelect,
  selected,
}: {
  categories: readonly string[];
  onClose: () => void;
  onSelect: (category: string) => void;
  selected: string;
}) {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport className="items-end sm:items-center">
          <DialogPopup className="max-w-[360px] p-4 shadow-2xl sm:max-w-[420px]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="m-0 text-[0.625rem] font-extrabold uppercase tracking-[0.14em] text-gold">
                  Catálogo
                </p>
                <DialogTitle
                  className="mt-1 mb-0 font-display text-lg font-bold text-text"
                  id="category-dialog-title"
                >
                  Selecionar categoria
                </DialogTitle>
              </div>
              <button
                aria-label="Fechar categorias"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
                onClick={onClose}
                type="button"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
            <div
              aria-label="Categorias"
              className="mt-4 grid gap-2"
              role="listbox"
            >
              {categories.map((category) => (
                <button
                  aria-selected={selected === category}
                  className={cn(
                    "flex min-h-11 items-center justify-between rounded-xl border px-3.5 text-left text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                    selected === category
                      ? "border-gold bg-[#3a2b16] text-text"
                      : "border-line bg-transparent text-muted hover:border-gold/60 hover:bg-panel-2 hover:text-text",
                  )}
                  key={category}
                  onClick={() => {
                    onSelect(category);
                    onClose();
                  }}
                  role="option"
                  type="button"
                >
                  <span>{category}</span>
                  {selected === category && (
                    <span aria-hidden="true" className="text-gold-bright">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  );
}

export function CategoryFilterTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex h-9 shrink-0 items-center gap-2 rounded-[9px] border border-line bg-panel px-3 text-xs font-semibold text-text transition-colors hover:border-gold/60 focus-visible:outline-2 focus-visible:outline-focus"
      onClick={onClick}
      type="button"
    >
      <SlidersHorizontal aria-hidden="true" className="size-3.5 text-gold" />
      Filtros
    </button>
  );
}

export function CategorySidebar({
  categories,
  isLoading = false,
  onSelect,
  selected,
}: {
  categories: readonly string[];
  isLoading?: boolean;
  onSelect: (category: string) => void;
  selected: string;
}) {
  return (
    <aside
      className="sticky top-20 mb-6 hidden h-[calc(100vh-8rem)] w-[290px] shrink-0 flex-col self-start overflow-hidden rounded-xl bg-search lg:flex"
      data-tv-navigation-region="catalog-categories"
    >
      <h2 className="m-0 shrink-0 px-6 pt-3 pb-2 text-[0.6875rem] font-extrabold tracking-[0.08em] text-muted">
        CATEGORIAS
      </h2>
      <ScrollArea
        className="min-h-0 flex-1"
        contentClassName="px-3 pt-2 pb-3 pr-6"
      >
        <div
          className="flex flex-col gap-1"
          role={isLoading ? "status" : undefined}
        >
          {isLoading
            ? Array.from(
                { length: 7 },
                (_, index) => `category-skeleton-${index}`,
              ).map((skeletonId) => (
                <Skeleton
                  className="h-10 w-full rounded-[9px]"
                  key={skeletonId}
                />
              ))
            : categories.map((category) => (
                <button
                  aria-pressed={selected === category}
                  className={cn(
                    "flex min-h-10 items-center rounded-[9px] px-3 text-left text-[0.8125rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                    selected === category
                      ? "bg-[#3a2b16] font-bold text-text"
                      : "text-muted hover:bg-panel hover:text-text",
                  )}
                  data-tv-navigation-zone="catalog-categories"
                  key={category}
                  onClick={() => onSelect(category)}
                  type="button"
                >
                  <span className="min-w-0 break-words">{category}</span>
                </button>
              ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
