import { Plus } from "lucide-react";
import { useState } from "react";

import { Button, ProductState } from "../../../components/ui";
import { useCatalogSources } from "../../../hooks/use-catalog-data";
import {
  importM3uSource,
  removeM3uSource,
  saveM3uSource,
} from "../../../services/catalog-service";
import { AppHeader, AppLayout } from "../app-shell";
import { SourceCard } from "./components/source-card";
import { SourceForm } from "./components/source-form";
import type { Source, SourceFormValues } from "./types";

const initialSources: Source[] = [];

export function SourcesPage() {
  const { sources: importedSources } = useCatalogSources();
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
    if (values.type !== "m3u" || !values.url) {
      setNotice("Neste primeiro marco, apenas fontes M3U estão disponíveis.");
      return;
    }
    void (async () => {
      try {
        const source = await saveM3uSource({
          name: values.name,
          url: values.url,
        });
        await importM3uSource(source);
        setActiveId(source.id);
        setFormOpen(false);
        setNotice(`${source.name} foi importada.`);
      } catch (error) {
        setNotice(
          error instanceof Error
            ? `Falha na importação: ${error.message}`
            : "Falha na importação.",
        );
      }
    })();
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
            {[
              ...sources,
              ...importedSources.map((source) => ({
                id: source.id,
                name: source.name,
                type: "m3u" as const,
                status:
                  source.status === "error"
                    ? ("error" as const)
                    : source.status === "ready"
                      ? ("available" as const)
                      : ("available" as const),
                detail: `M3U · ${source.status}`,
                contentCount: source.itemCount,
                url: source.url,
              })),
            ].map((source) => (
              <div className="flex flex-col gap-2" key={source.id}>
                <SourceCard
                  active={activeId === source.id}
                  onActivate={() => {
                    setActiveId(source.id);
                    setNotice(`${source.name} agora é a fonte ativa.`);
                  }}
                  onDelete={() => {
                    void removeM3uSource(source.id);
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
