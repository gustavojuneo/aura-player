import { zodResolver } from "@hookform/resolvers/zod";
import { Link as LinkIcon, LoaderCircle, Server, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../../../../components/ui";
import type { Source, SourceFormValues } from "../types";

const formSchema = z
  .object({
    name: z.string().trim().min(1, "Informe um nome para a fonte."),
    type: z.enum(["m3u", "xtream"]),
    server: z.string(),
    username: z.string(),
    password: z.string(),
    url: z.string(),
  })
  .superRefine((values, context) => {
    if (values.type === "m3u") {
      try {
        const url = new URL(values.url);
        if (url.protocol !== "http:" && url.protocol !== "https:")
          throw new Error();
      } catch {
        context.addIssue({
          code: "custom",
          message: "Informe uma URL http:// ou https:// válida.",
          path: ["url"],
        });
      }
      return;
    }
    if (!values.server.trim())
      context.addIssue({
        code: "custom",
        message: "Informe o servidor.",
        path: ["server"],
      });
    if (!values.username.trim())
      context.addIssue({
        code: "custom",
        message: "Informe o usuário.",
        path: ["username"],
      });
    if (!values.password.trim())
      context.addIssue({
        code: "custom",
        message: "Informe a senha.",
        path: ["password"],
      });
  });

const emptyValues: SourceFormValues = {
  name: "",
  type: "xtream",
  server: "",
  username: "",
  password: "",
  url: "",
};

export function SourceForm({
  initialSource,
  onCancel,
  onSave,
}: {
  initialSource?: Source;
  onCancel?: () => void;
  onSave: (values: SourceFormValues) => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(
    null,
  );
  const form = useForm<SourceFormValues>({
    defaultValues: initialSource
      ? {
          name: initialSource.name,
          type: initialSource.type,
          server: initialSource.server ?? "",
          username: initialSource.username ?? "",
          password: initialSource.password ?? "",
          url: initialSource.url ?? "",
        }
      : emptyValues,
    resolver: zodResolver(formSchema),
  });
  const type = form.watch("type");

  const testConnection = async () => {
    const valid = await form.trigger();
    if (!valid) return;
    setTesting(true);
    setTestResult(null);
    window.setTimeout(() => {
      setTesting(false);
      setTestResult("success");
    }, 650);
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSave)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="m-0 font-display text-[21px] font-bold text-text">
            {initialSource ? "Editar fonte" : "Adicionar Xtream Codes"}
          </h2>
          <p className="mt-1 mb-0 text-xs text-muted">
            Teste a conexão antes de salvar.
          </p>
        </div>
        {onCancel && (
          <button
            aria-label="Fechar formulário"
            className="grid size-8 place-items-center rounded-lg text-muted hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-focus"
            onClick={onCancel}
            type="button"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2 text-[11px] font-semibold text-muted">
        Tipo da fonte
        <div className="grid grid-cols-2 gap-2">
          {(["xtream", "m3u"] as const).map((item) => (
            <button
              aria-pressed={type === item}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-bold ${type === item ? "border-gold bg-[#3a2b16] text-text" : "border-line bg-search text-muted"}`}
              key={item}
              onClick={() => {
                form.setValue("type", item);
                setTestResult(null);
              }}
              type="button"
            >
              {item === "xtream" ? (
                <Server className="size-4" />
              ) : (
                <LinkIcon className="size-4" />
              )}
              {item === "xtream" ? "Xtream" : "M3U"}
            </button>
          ))}
        </div>
      </div>
      <Field label="Nome da fonte" error={form.formState.errors.name?.message}>
        <Input {...form.register("name")} placeholder="Casa principal" />
      </Field>
      {type === "m3u" ? (
        <Field label="URL M3U/M3U8" error={form.formState.errors.url?.message}>
          <Input
            {...form.register("url")}
            placeholder="https://servidor.exemplo/lista.m3u"
            type="url"
          />
        </Field>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="URL do servidor"
            error={form.formState.errors.server?.message}
          >
            <Input
              {...form.register("server")}
              placeholder="https://servidor.exemplo"
            />
          </Field>
          <Field
            label="Usuário"
            error={form.formState.errors.username?.message}
          >
            <Input {...form.register("username")} placeholder="Seu usuário" />
          </Field>
          <Field label="Senha" error={form.formState.errors.password?.message}>
            <Input
              {...form.register("password")}
              placeholder="Sua senha"
              type="password"
            />
          </Field>
        </div>
      )}
      {testResult === "success" && (
        <p
          aria-live="polite"
          className="m-0 text-xs font-semibold text-success"
        >
          Conexão testada com sucesso.
        </p>
      )}
      {testResult === "error" && (
        <p
          aria-live="polite"
          className="m-0 text-xs font-semibold text-danger-strong"
        >
          Não foi possível conectar. Tente novamente.
        </p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          className="h-11 w-full"
          disabled={testing}
          onClick={() => void testConnection()}
          type="button"
          variant="secondary"
        >
          {testing && <LoaderCircle className="size-4 animate-spin" />}
          {testing ? "Testando..." : "Testar conexão"}
        </Button>
        <Button className="h-11 w-full" type="submit" variant="primary">
          Salvar fonte
        </Button>
      </div>
    </form>
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
    <div className="flex flex-col gap-2 text-[11px] font-semibold text-muted">
      {label}
      {children}
      {error && <span className="font-medium text-danger-strong">{error}</span>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-[46px] min-w-0 rounded-[9px] border border-line bg-search px-3 text-sm font-medium text-text outline-none placeholder:text-muted focus:border-gold focus:ring-2 focus:ring-focus/40"
    />
  );
}
