import { Link as LinkIcon, MoreHorizontal, Server } from "lucide-react";
import { useState } from "react";

import { ProductState } from "../../../../components/ui";
import type { Source } from "../types";

const statusLabel = {
  active: "Ativa · sincronizada agora",
  available: "Disponível · há 2 dias",
  importing: "Importando catálogo...",
  error: "Erro de conexão · tentar novamente",
} as const;

const statusClass = {
  active: "text-gold-bright",
  available: "text-success",
  importing: "text-gold-bright",
  error: "text-danger",
} as const;

export function SourceCard({
  active,
  onActivate,
  onDelete,
  onEdit,
  onRefresh,
  source,
  syncing = false,
}: {
  active: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onRefresh: () => void;
  source: Source;
  syncing?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const Icon = source.type === "xtream" ? Server : LinkIcon;

  if (syncing || source.status === "importing")
    return (
      <ProductState
        action={{ label: "Sincronizando", onClick: onRefresh }}
        kind="optimistic"
      />
    );

  if (source.status === "error")
    return (
      <ProductState
        action={{ label: "Tentar novamente", onClick: onRefresh }}
        kind="connection-error"
      />
    );

  return (
    <article
      className={`relative flex min-w-0 flex-col gap-3 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center sm:gap-3.5 ${active ? "border-2 border-gold bg-[#302719]" : "border-line bg-panel"}`}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-[10px] bg-panel-2 text-gold-bright">
        <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3 sm:block">
          <h2 className="m-0 truncate text-base font-bold text-text">
            {source.name}
          </h2>
          <span
            className={`text-[10px] font-extrabold uppercase tracking-[0.08em] sm:hidden ${statusClass[source.status]}`}
          >
            {source.status === "active"
              ? "ATIVA"
              : source.status === "available"
                ? "OK"
                : source.status === "importing"
                  ? "IMPORTANDO"
                  : "ERRO"}
          </span>
        </div>
        <p className="mt-1 mb-0 text-xs text-muted">
          {source.type === "xtream" ? "Xtream Codes" : "M3U"}
        </p>
        <p
          className={`mt-1 mb-0 text-[11px] font-semibold ${statusClass[source.status]}`}
        >
          {statusLabel[source.status]}
        </p>
      </div>
      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <button
          className="text-xs font-semibold text-gold-bright hover:text-gold focus-visible:outline-2 focus-visible:outline-focus"
          onClick={onActivate}
          type="button"
        >
          {active ? "Ativa" : "Ativar"}
        </button>
        <button
          className="text-xs font-semibold text-gold-bright hover:text-gold focus-visible:outline-2 focus-visible:outline-focus"
          onClick={onEdit}
          type="button"
        >
          Editar
        </button>
        <button
          aria-label={`Mais ações para ${source.name}`}
          className="grid size-8 place-items-center rounded-lg text-gold-bright hover:bg-gold/10 focus-visible:outline-2 focus-visible:outline-focus"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <MoreHorizontal aria-hidden="true" className="size-4" />
        </button>
      </div>
      {menuOpen && (
        <div className="absolute right-3 top-[calc(100%-8px)] z-10 flex min-w-32 flex-col rounded-lg border border-line bg-panel-2 p-1 shadow-xl">
          <button
            className="rounded-md px-3 py-2 text-left text-xs font-semibold text-text hover:bg-panel"
            onClick={onRefresh}
            type="button"
          >
            Atualizar
          </button>
          <button
            className="rounded-md px-3 py-2 text-left text-xs font-semibold text-danger-strong hover:bg-danger-surface"
            onClick={onDelete}
            type="button"
          >
            Remover
          </button>
        </div>
      )}
    </article>
  );
}
