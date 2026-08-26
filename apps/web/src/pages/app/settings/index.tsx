import {
  ChevronRight,
  HardDrive,
  Languages,
  Palette,
  Play,
  Shield,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { AppLayout } from "../../../components/app-layout";
import { Button, Switch } from "../../../components/ui";
import { clearFavorites } from "../../../services/favorites";
import {
  clearPlaybackPreferences,
  defaultPlaybackPreferences,
  type PlaybackPreferences,
  usePlaybackPreferences,
} from "../../../services/playback-preferences";

type Section =
  | "account"
  | "language"
  | "appearance"
  | "playback"
  | "data"
  | "privacy";
const sections: Array<{
  id: Section;
  label: string;
  mobileLabel?: string;
  icon: typeof User;
}> = [
  { id: "account", label: "Conta", icon: User },
  {
    id: "language",
    label: "Idioma",
    mobileLabel: "Idioma · Português (BR)",
    icon: Languages,
  },
  {
    id: "appearance",
    label: "Aparência",
    mobileLabel: "Aparência · Escuro",
    icon: Palette,
  },
  {
    id: "playback",
    label: "Reprodução",
    mobileLabel: "Preferências de reprodução",
    icon: Play,
  },
  {
    id: "data",
    label: "Dados locais",
    mobileLabel: "Gestão de dados locais",
    icon: HardDrive,
  },
  {
    id: "privacy",
    label: "Informações e privacidade",
    mobileLabel: "Informações e privacidade",
    icon: Shield,
  },
];

export function SettingsPage() {
  const [section, setSection] = useState<Section>("playback");
  const [clearDialog, setClearDialog] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { preferences, updatePreference } = usePlaybackPreferences();
  const clearData = () => {
    clearFavorites();
    clearPlaybackPreferences();
    updatePreference("autoResume", defaultPlaybackPreferences.autoResume);
    updatePreference(
      "autoNextEpisode",
      defaultPlaybackPreferences.autoNextEpisode,
    );
    updatePreference("hideControls", defaultPlaybackPreferences.hideControls);
    updatePreference("reduceMotion", defaultPlaybackPreferences.reduceMotion);
    updatePreference("quality", defaultPlaybackPreferences.quality);
    setClearDialog(false);
    setNotice(
      "Dados locais removidos. As preferências padrão foram restauradas.",
    );
  };

  return (
    <AppLayout>
      <main className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-5 px-4 pb-24 pt-5 sm:px-6 lg:gap-5 lg:px-9 lg:pb-10">
        <header className="flex items-center justify-between">
          <span className="font-display text-lg font-extrabold text-text lg:text-[19px]">
            ◉ AURA
          </span>
          <button
            className="text-sm font-semibold text-muted hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
            onClick={() => window.history.back()}
            type="button"
          >
            <span className="hidden sm:inline">← Início</span>
            <X className="size-5 sm:hidden" />
          </button>
        </header>
        <h1 className="m-0 font-display text-[28px] font-bold tracking-[-0.05em] text-text sm:text-[30px]">
          Configurações
        </h1>
        {notice && (
          <p
            aria-live="polite"
            className="m-0 rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-xs font-semibold text-success"
          >
            {notice}
          </p>
        )}
        <div className="grid min-h-0 gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          <nav
            aria-label="Seções de configurações"
            className="flex flex-col gap-2 lg:rounded-xl lg:border lg:border-line lg:bg-panel lg:p-3"
          >
            {sections.map(({ icon: Icon, id, label, mobileLabel }) => (
              <button
                aria-current={section === id ? "page" : undefined}
                className={`flex h-[68px] w-full items-center justify-between gap-3 rounded-[11px] border px-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-focus lg:h-[46px] lg:justify-start lg:rounded-[9px] lg:border-transparent lg:px-3 ${section === id ? "border-gold bg-[#302719] text-text lg:border-transparent" : "border-line bg-panel text-text hover:border-gold/60 lg:bg-transparent"}`}
                key={id}
                onClick={() => {
                  setSection(id);
                  setNotice(null);
                }}
                type="button"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon
                    className={`size-5 shrink-0 ${section === id ? "text-gold-bright" : "text-muted"}`}
                  />
                  <span className="truncate text-[13px] font-semibold">
                    {mobileLabel ?? label}
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted lg:hidden" />
              </button>
            ))}
          </nav>
          <section className="min-w-0">
            {section === "playback" && (
              <PlaybackPanel
                preferences={preferences}
                updatePreference={updatePreference}
              />
            )}
            {section === "data" && (
              <DataPanel onClear={() => setClearDialog(true)} />
            )}
            {section === "account" && (
              <InfoPanel
                icon={User}
                title="Conta"
                description="Sua conta local"
                body="Marina · Casa ativa"
              />
            )}
            {section === "language" && (
              <InfoPanel
                icon={Languages}
                title="Idioma"
                description="Idioma da interface"
                body="Português (Brasil)"
              />
            )}
            {section === "appearance" && (
              <InfoPanel
                icon={Palette}
                title="Aparência"
                description="Tema atual da AURA"
                body="Escuro"
              />
            )}
            {section === "privacy" && (
              <InfoPanel
                icon={Shield}
                title="Informações e privacidade"
                description="Seus dados ficam sob seu controle."
                body="As fontes e preferências desta demonstração são mantidas localmente neste navegador."
              />
            )}
          </section>
        </div>
        {clearDialog && (
          <ClearDialog
            onCancel={() => setClearDialog(false)}
            onConfirm={clearData}
          />
        )}
      </main>
    </AppLayout>
  );
}

function PlaybackPanel({
  preferences,
  updatePreference,
}: {
  preferences: PlaybackPreferences;
  updatePreference: <K extends keyof PlaybackPreferences>(
    key: K,
    value: PlaybackPreferences[K],
  ) => void;
}) {
  const rows: Array<{
    key: "autoResume" | "autoNextEpisode" | "hideControls" | "reduceMotion";
    title: string;
    description: string;
  }> = [
    {
      key: "autoResume",
      title: "Retomar automaticamente",
      description: "Continua do ponto salvo.",
    },
    {
      key: "autoNextEpisode",
      title: "Reproduzir episódio",
      description: "Inicia o próximo episódio.",
    },
    {
      key: "hideControls",
      title: "Ocultar controles",
      description: "Esconde após 3 segundos.",
    },
    {
      key: "reduceMotion",
      title: "Reduzir movimento",
      description: "Remove animações essenciais.",
    },
  ];
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-panel">
      <div className="flex flex-col gap-1.5 p-5 sm:p-[22px]">
        <h2 className="m-0 font-display text-[21px] font-bold text-text sm:text-[23px]">
          Preferências de reprodução
        </h2>
        <p className="m-0 text-[13px] text-muted">
          Ajuste a experiência ao assistir.
        </p>
      </div>
      {rows.map((row) => (
        <div
          className="flex min-h-[78px] items-center justify-between gap-4 border-t border-line px-5 sm:px-[22px]"
          key={row.key}
        >
          <div className="min-w-0">
            <h3 className="m-0 truncate text-sm font-bold text-text">
              {row.title}
            </h3>
            <p className="mt-1 mb-0 text-xs text-muted">{row.description}</p>
          </div>
          <Switch
            checked={preferences[row.key]}
            label={row.title}
            onCheckedChange={(value) => updatePreference(row.key, value)}
          />
        </div>
      ))}
      <div className="flex min-h-[82px] items-center justify-between gap-4 border-t border-line px-5 sm:px-[22px]">
        <div className="min-w-0">
          <h3 className="m-0 text-sm font-bold text-text">Qualidade padrão</h3>
          <p className="mt-1 mb-0 text-xs text-muted">
            Automática prioriza estabilidade.
          </p>
        </div>
        <select
          aria-label="Qualidade padrão"
          className="h-10 rounded-xl border border-line bg-panel-2 px-3 text-xs font-bold text-text outline-none focus:border-gold focus:ring-2 focus:ring-focus/40"
          onChange={(event) =>
            updatePreference(
              "quality",
              event.target.value as PlaybackPreferences["quality"],
            )
          }
          value={preferences.quality}
        >
          <option value="auto">Automática</option>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
        </select>
      </div>
    </div>
  );
}

function DataPanel({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-[14px] border border-danger bg-danger-surface p-5 sm:p-6">
      <h2 className="m-0 font-display text-xl font-bold text-danger-strong">
        Dados locais
      </h2>
      <p className="mt-2 mb-5 text-sm leading-5 text-danger-strong/80">
        Remova favoritos e preferências salvas neste navegador. Fontes mockadas
        e catálogo serão restaurados ao recarregar.
      </p>
      <Button
        className="h-10 px-4 text-xs"
        onClick={onClear}
        variant="destructive"
      >
        Limpar dados locais
      </Button>
    </div>
  );
}
function InfoPanel({
  body,
  description,
  icon: Icon,
  title,
}: {
  body: string;
  description: string;
  icon: typeof User;
  title: string;
}) {
  return (
    <div className="rounded-[14px] border border-line bg-panel p-5 sm:p-6">
      <Icon className="size-5 text-gold-bright" />
      <h2 className="mt-4 mb-0 font-display text-xl font-bold text-text">
        {title}
      </h2>
      <p className="mt-2 mb-0 text-sm text-muted">{description}</p>
      <p className="mt-6 mb-0 rounded-xl border border-line bg-panel-2 p-4 text-sm leading-6 text-text">
        {body}
      </p>
    </div>
  );
}
function ClearDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      aria-labelledby="clear-data-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      role="dialog"
    >
      <div className="w-full max-w-[420px] rounded-2xl border border-line bg-panel p-6 shadow-2xl">
        <h2
          className="m-0 font-display text-xl font-bold text-text"
          id="clear-data-title"
        >
          Limpar dados locais?
        </h2>
        <p className="mt-2 mb-0 text-sm leading-5 text-muted">
          Essa ação remove favoritos e preferências salvas neste navegador.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            className="h-10 px-4 text-xs"
            onClick={onCancel}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            className="h-10 px-4 text-xs"
            onClick={onConfirm}
            variant="destructive"
          >
            Limpar dados
          </Button>
        </div>
      </div>
    </div>
  );
}
