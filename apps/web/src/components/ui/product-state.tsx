import {
  AlertCircle,
  DatabaseZap,
  FolderOpen,
  ImageOff,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Undo2,
  WifiOff,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "./button";

type ProductStateKind =
  | "loading"
  | "catalog-empty"
  | "source-empty"
  | "connection-error"
  | "stream-unavailable"
  | "session-expired"
  | "optimistic"
  | "rollback"
  | "metadata";

const states: Record<
  ProductStateKind,
  {
    description: string;
    icon: typeof LoaderCircle;
    message: string;
    tone: "accent" | "danger" | "muted";
    title: string;
  }
> = {
  loading: {
    description: "Skeletons preservam o ritmo do catálogo.",
    icon: LoaderCircle,
    message: "Preparando sua experiência…",
    title: "Carregamento inicial",
    tone: "accent",
  },
  "catalog-empty": {
    description: "Explore outra categoria ou atualize sua fonte.",
    icon: FolderOpen,
    message: "Nada por aqui ainda",
    title: "Catálogo vazio",
    tone: "muted",
  },
  "source-empty": {
    description: "Confirme o plano do provedor e sincronize novamente.",
    icon: DatabaseZap,
    message: "Esta fonte não retornou conteúdo",
    title: "Fonte sem conteúdo",
    tone: "danger",
  },
  "connection-error": {
    description: "Tentar novamente sem expor detalhes da conexão.",
    icon: WifiOff,
    message: "Não foi possível falar com o provedor",
    title: "Erro de conexão",
    tone: "danger",
  },
  "stream-unavailable": {
    description: "Tente novamente ou escolha outro conteúdo.",
    icon: AlertCircle,
    message: "Este stream não está disponível",
    title: "Stream indisponível",
    tone: "danger",
  },
  "session-expired": {
    description: "Entre novamente sem perder o progresso local.",
    icon: LockKeyhole,
    message: "Sua sessão expirou",
    title: "Sessão expirada",
    tone: "accent",
  },
  optimistic: {
    description: "Alteração aplicada localmente; sincronizando.",
    icon: RefreshCw,
    message: "Atualizando fonte…",
    title: "Operação otimista",
    tone: "accent",
  },
  rollback: {
    description: "A alteração foi desfeita com segurança.",
    icon: Undo2,
    message: "Não foi possível salvar",
    title: "Reversão após erro",
    tone: "danger",
  },
  metadata: {
    description: "Capa e informações serão atualizadas quando disponíveis.",
    icon: ImageOff,
    message: "Título indisponível",
    title: "Sem metadados",
    tone: "muted",
  },
};

const toneClasses = {
  accent: "border-gold/40 bg-panel text-gold-bright",
  danger: "border-danger/50 bg-panel text-danger-strong",
  muted: "border-line bg-panel text-muted",
};

export function ProductState({
  action,
  children,
  className = "",
  kind,
  compact = false,
}: {
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
  className?: string;
  kind: ProductStateKind;
  compact?: boolean;
}) {
  const state = states[kind];
  const Icon = state.icon;

  return (
    <section
      aria-live={
        kind === "loading" || kind === "optimistic" ? "polite" : undefined
      }
      className={`flex min-w-0 flex-col gap-2 rounded-xl border p-4 ${toneClasses[state.tone]} ${compact ? "items-start" : "items-center text-center"} ${className}`}
    >
      <Icon
        aria-hidden="true"
        className={`size-6 shrink-0 ${kind === "loading" || kind === "optimistic" ? "animate-spin" : ""}`}
        strokeWidth={1.8}
      />
      <h2 className="m-0 text-base font-bold text-text">{state.title}</h2>
      <p className="m-0 text-xs font-semibold">{state.message}</p>
      <p className="m-0 max-w-[34rem] text-xs leading-5 text-muted">
        {children ?? state.description}
      </p>
      {action && (
        <Button
          className="mt-1 h-9 px-3 text-xs"
          onClick={action.onClick}
          variant={state.tone === "danger" ? "destructive" : "secondary"}
        >
          {action.label}
        </Button>
      )}
    </section>
  );
}

export type { ProductStateKind };
