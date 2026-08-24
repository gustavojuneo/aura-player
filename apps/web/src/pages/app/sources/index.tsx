import { Plus } from "lucide-react";
import { useState } from "react";

import { Button, ProductState } from "../../../components/ui";
import { AppHeader, AppLayout } from "../app-shell";
import { SourceCard } from "./components/source-card";
import { SourceForm } from "./components/source-form";
import type { Source, SourceFormValues } from "./types";

const initialSources: Source[] = [
  {
    id: "home",
    name: "Casa",
    type: "xtream",
    status: "active",
    detail: "Xtream · ativa",
    server: "https://servidor.exemplo",
    username: "casa",
    password: "senha",
    contentCount: 24,
  },
  {
    id: "office",
    name: "Escritório",
    type: "m3u",
    status: "available",
    detail: "M3U · disponível",
    url: "https://servidor.exemplo/lista.m3u",
    contentCount: 0,
  },
  {
    id: "travel",
    name: "Viagem",
    type: "m3u",
    status: "error",
    detail: "M3U · erro de conexão",
    url: "https://servidor.exemplo/viagem.m3u",
  },
];

export function SourcesPage() {
  const [sources, setSources] = useState(initialSources);
  const [activeId, setActiveId] = useState("home");
  const [editing, setEditing] = useState<Source | undefined>();
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [rollbackId, setRollbackId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };
  const openEdit = (source: Source) => {
    setEditing(source);
    setFormOpen(true);
  };
  const saveSource = (values: SourceFormValues) => {
    const next: Source = {
      id: editing?.id ?? `source-${Date.now()}`,
      name: values.name.trim(),
      type: values.type,
      status: "available",
      detail:
        values.type === "xtream" ? "Xtream · disponível" : "M3U · disponível",
      server: values.server,
      username: values.username,
      password: values.password,
      url: values.url,
      contentCount: editing?.contentCount ?? 0,
    };
    setSources((current) =>
      editing
        ? current.map((source) => (source.id === editing.id ? next : source))
        : [...current, next],
    );
    setFormOpen(false);
    setNotice(`${next.name} foi salva.`);
  };

  const refreshSource = (source: Source) => {
    setRollbackId(null);
    setSyncingId(source.id);
    window.setTimeout(() => {
      setSyncingId(null);
      if (source.status === "error") {
        setRollbackId(source.id);
        return;
      }
      setNotice(`${source.name} foi sincronizada.`);
    }, 700);
  };

  return (
    <AppLayout>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:gap-6 lg:px-[30px] lg:pb-10">
        <AppHeader />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text sm:text-[30px]">
              Fontes IPTV
            </h1>
            <p className="mt-1 mb-0 text-[13px] text-muted">
              Gerencie conexões sem expor credenciais.
            </p>
          </div>
          <Button
            className="hidden h-10 shrink-0 px-4 text-xs lg:inline-flex"
            onClick={openCreate}
            variant="primary"
          >
            <Plus className="size-4" />
            Adicionar fonte
          </Button>
          <button
            className="shrink-0 pt-1 text-xs font-bold text-gold-bright lg:hidden"
            onClick={openCreate}
            type="button"
          >
            <Plus className="inline size-3.5" /> Adicionar
          </button>
        </div>
        {notice && (
          <p
            aria-live="polite"
            className="m-0 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-xs font-semibold text-success"
          >
            {notice}
          </p>
        )}
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,650px)_minmax(330px,1fr)]">
          <section
            className="flex min-w-0 flex-col gap-2.5"
            aria-label="Fontes cadastradas"
          >
            {sources.map((source) => (
              <div className="flex flex-col gap-2" key={source.id}>
                <SourceCard
                  active={activeId === source.id}
                  onActivate={() => {
                    setActiveId(source.id);
                    setNotice(`${source.name} agora é a fonte ativa.`);
                  }}
                  onDelete={() => {
                    setSources((current) =>
                      current.filter((item) => item.id !== source.id),
                    );
                    if (activeId === source.id)
                      setActiveId(
                        sources.find((item) => item.id !== source.id)?.id ?? "",
                      );
                  }}
                  onEdit={() => openEdit(source)}
                  onRefresh={() => refreshSource(source)}
                  source={source}
                  syncing={syncingId === source.id}
                />
                {rollbackId === source.id && (
                  <ProductState
                    action={{
                      label: "Tentar novamente",
                      onClick: () => refreshSource(source),
                    }}
                    kind="rollback"
                  />
                )}
                {activeId === source.id && source.contentCount === 0 && (
                  <ProductState
                    action={{
                      label: "Sincronizar",
                      onClick: () => refreshSource(source),
                    }}
                    kind="source-empty"
                  />
                )}
              </div>
            ))}
          </section>
          <section
            className={`${formOpen ? "flex" : "hidden"} flex-col rounded-[14px] border border-line bg-panel p-5 sm:p-[22px] lg:flex`}
          >
            <SourceForm
              initialSource={editing}
              onCancel={() => setFormOpen(false)}
              onSave={saveSource}
            />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
