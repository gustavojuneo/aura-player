import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "../../components/ui";
import { importM3uSource, saveM3uSource } from "../../services/catalog-service";

type SourceType = "m3u" | "xtream";

const sourceOptions: Array<{
  description: string;
  label: string;
  type: SourceType;
}> = [
  {
    description: "Uma URL simples para canais e catálogo.",
    label: "Adicionar M3U",
    type: "m3u",
  },
  {
    description: "Servidor, usuário e senha com teste prévio.",
    label: "Adicionar Xtream Codes",
    type: "xtream",
  },
];

function LinkIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path
        d="m10 13.8 4-4m-6.5 7.7H6a4 4 0 0 1 0-8h3m6-5.5H18a4 4 0 0 1 0 8h-3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <rect height="6" rx="1.5" width="17" x="3.5" y="4" />
      <rect height="6" rx="1.5" width="17" x="3.5" y="14" />
      <path d="M7 7h.01M7 17h.01M11 7h6M11 17h6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8 12 2.5 2.5L16 9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-xs font-semibold text-muted">
      {label}
      {children}
      {error && <span className="font-medium text-danger-strong">{error}</span>}
    </div>
  );
}

function TextInput({
  error,
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={`flex h-[50px] items-center gap-2.5 rounded-[10px] border bg-search px-3.5 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-focus/40 ${error ? "border-danger" : "border-line"}`}
    >
      {icon && <span className="shrink-0 text-muted">{icon}</span>}
      <input
        {...props}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-text outline-none placeholder:text-muted"
      />
    </span>
  );
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const [sourceType, setSourceType] = useState<SourceType>("m3u");
  const [name, setName] = useState("Minha casa");
  const [url, setUrl] = useState("");
  const [server, setServer] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isM3uUrlValid = (() => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
    } catch {
      return false;
    }
  })();
  const isXtreamValid =
    server.trim() !== "" && username.trim() !== "" && password.trim() !== "";
  const isValid =
    name.trim() !== "" &&
    (sourceType === "m3u" ? isM3uUrlValid : isXtreamValid);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setError(null);
    if (!isValid || sourceType !== "m3u") return;
    void (async () => {
      try {
        setProgress("Salvando fonte...");
        const source = await saveM3uSource({ name, url });
        await importM3uSource(source, {
          onProgress: (phase) =>
            setProgress(
              phase === "fetching"
                ? "Baixando playlist..."
                : phase === "parsing"
                  ? "Analisando conteúdo..."
                  : "Indexando catálogo...",
            ),
        });
        void navigate({ to: "/app" });
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível importar a fonte.",
        );
        setProgress(null);
      }
    })();
  }

  function selectSource(type: SourceType) {
    setSourceType(type);
    setSubmitted(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_65%_10%,#342719_0%,#15130f_62%)] px-5 py-8 text-text md:py-12">
      <form
        aria-labelledby="onboarding-title"
        className="flex w-full max-w-[760px] flex-col gap-[22px] rounded-[18px] border border-line bg-panel p-6 shadow-[0_18px_40px_rgb(0_0_0_/_45%)] md:p-[38px]"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-2">
          <p className="m-0 text-[11px] font-extrabold tracking-[0.08em] text-gold-bright">
            PRIMEIRO ACESSO · ETAPA 1 DE 2
          </p>
          <h1
            className="m-0 text-[28px] font-[750] leading-tight tracking-[-0.03em] text-text md:text-[32px]"
            id="onboarding-title"
          >
            <span className="md:hidden">Conecte sua fonte</span>
            <span className="hidden md:inline">Conecte sua primeira fonte</span>
          </h1>
          <p className="m-0 max-w-[650px] text-sm leading-[1.45] text-muted">
            <span className="md:hidden">Escolha M3U ou Xtream Codes.</span>
            <span className="hidden md:inline">
              AURA organiza links M3U/M3U8 e servidores Xtream que você já
              possui. Nenhum conteúdo é fornecido pela plataforma.
            </span>
          </p>
        </div>

        <fieldset className="m-0 grid gap-3.5 border-0 p-0 md:grid-cols-2">
          <legend className="sr-only">Tipo de fonte</legend>
          {sourceOptions.map((option) => {
            const selected = sourceType === option.type;
            return (
              <button
                aria-pressed={selected}
                className={`flex min-h-[118px] flex-col items-start gap-3 rounded-[14px] border p-5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${selected ? "border-2 border-gold bg-[#302719]" : "border-line bg-[#1a1814] hover:border-gold/60"}`}
                key={option.type}
                onClick={() => selectSource(option.type)}
                type="button"
              >
                <span className={selected ? "text-gold-bright" : "text-muted"}>
                  {option.type === "m3u" ? <LinkIcon /> : <ServerIcon />}
                </span>
                <span className="text-[17px] font-bold text-text">
                  {option.label}
                </span>
                <span className="text-xs text-muted">{option.description}</span>
              </button>
            );
          })}
        </fieldset>

        <div className="flex flex-col gap-3">
          <Field
            error={
              submitted && !name.trim()
                ? "Informe um nome para a fonte."
                : undefined
            }
            label="Nome da fonte"
          >
            <TextInput
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </Field>

          {sourceType === "m3u" ? (
            <Field
              error={
                submitted && !isM3uUrlValid
                  ? "Informe uma URL http:// ou https:// válida."
                  : undefined
              }
              label="URL M3U/M3U8"
            >
              <TextInput
                autoComplete="url"
                error={submitted && !isM3uUrlValid}
                icon={<LinkIcon />}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setSubmitted(false);
                }}
                placeholder="https://servidor.exemplo/lista.m3u"
                type="url"
                value={url}
              />
            </Field>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="Servidor">
                <TextInput
                  onChange={(event) => setServer(event.target.value)}
                  placeholder="https://servidor.exemplo"
                  value={server}
                />
              </Field>
              <Field label="Usuário">
                <TextInput
                  autoComplete="username"
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Seu usuário"
                  value={username}
                />
              </Field>
              <Field label="Senha">
                <TextInput
                  autoComplete="current-password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Sua senha"
                  type="password"
                  value={password}
                />
              </Field>
            </div>
          )}
        </div>

        {progress && (
          <p
            className="m-0 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold-bright"
            role="status"
          >
            {progress}
          </p>
        )}
        {error && (
          <p
            className="m-0 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger-strong"
            role="alert"
          >
            Não foi possível carregar a playlist: {error}
          </p>
        )}
        {submitted && isValid && !progress && (
          <p
            className="m-0 flex items-center gap-2 text-xs font-semibold text-success"
            role="status"
          >
            <CheckIcon />
            {sourceType === "m3u"
              ? "URL válida e pronta para adicionar."
              : "Dados preenchidos e prontos para adicionar."}
          </p>
        )}

        <Button
          className="h-12 w-full"
          disabled={Boolean(progress)}
          type="submit"
          variant="primary"
        >
          {sourceType === "m3u"
            ? "Validar e adicionar fonte"
            : "Validar e adicionar"}
        </Button>
        <p className="m-0 text-[11px] leading-4 text-muted">
          Esta etapa não pode ser fechada antes de uma fonte válida.
        </p>
      </form>
    </main>
  );
}
