import { zodResolver } from "@hookform/resolvers/zod";
import { Link as LinkIcon, LoaderCircle, Server, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SOURCE_OPTIONS, type SourceType } from "../utils/constants";
import { Button, Field, FieldError, FieldLabel, Input } from "./ui";

const formSchema = z
  .object({
    name: z.string().trim().min(3, "Informe pelo menos 3 caracteres."),
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
    try {
      const server = new URL(values.server);
      if (server.protocol !== "http:" && server.protocol !== "https:")
        throw new Error();
    } catch {
      context.addIssue({
        code: "custom",
        message: "Informe uma URL http:// ou https:// válida.",
        path: ["server"],
      });
    }
    if (values.username.trim().length < 3)
      context.addIssue({
        code: "custom",
        message: "Informe pelo menos 3 caracteres.",
        path: ["username"],
      });
    if (values.password.trim().length < 3)
      context.addIssue({
        code: "custom",
        message: "Informe pelo menos 3 caracteres.",
        path: ["password"],
      });
  });

export type SourceFormValues = {
  name: string;
  type: SourceType;
  server: string;
  username: string;
  password: string;
  url: string;
};

export type SourceFormInitialSource = Partial<SourceFormValues> &
  Pick<SourceFormValues, "name" | "type">;

const emptyValues: SourceFormValues = {
  name: "",
  type: "m3u",
  server: "",
  username: "",
  password: "",
  url: "",
};

export function SourceForm({
  description = "Informe os dados da lista IPTV que deseja adicionar.",
  initialSource,
  onCancel,
  onSave,
  submitLabel = "Adicionar",
  title,
}: {
  description?: string;
  initialSource?: SourceFormInitialSource;
  onCancel?: () => void;
  onSave: (values: SourceFormValues) => void | Promise<void>;
  submitLabel?: string;
  title?: string;
}) {
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
  const submitForm = form.handleSubmit(async (values, event) => {
    const submitButton =
      event?.currentTarget instanceof HTMLFormElement
        ? event.currentTarget.querySelector<HTMLButtonElement>(
            'button[type="submit"]',
          )
        : null;
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) activeElement.blur();
    submitButton?.focus();
    await onSave(values);
  });

  return (
    <form className="flex flex-col gap-3" onSubmit={submitForm}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="m-0 font-display text-[1.312rem] font-bold text-text">
            {title ?? (initialSource ? "Editar fonte" : "Adicionar Lista")}
          </h2>
          <p className="mt-1 mb-0 text-xs text-muted">{description}</p>
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
      <div className="flex flex-col gap-2 text-[0.6875rem] font-semibold text-muted">
        Tipo da fonte
        <div className="grid grid-cols-2 gap-2">
          {SOURCE_OPTIONS.map((option) => (
            <button
              aria-pressed={type === option.type}
              className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-bold ${type === option.type ? "border-gold bg-[#3a2b16] text-text" : "border-line bg-search text-muted"}`}
              data-tv-navigation-group="source-type"
              key={option.type}
              onClick={() => {
                form.setValue("type", option.type);
              }}
              type="button"
            >
              {option.type === "xtream" ? (
                <Server className="size-4" />
              ) : (
                <LinkIcon className="size-4" />
              )}
              {option.type === "xtream" ? "Xtream" : "M3U"}
            </button>
          ))}
        </div>
      </div>
      <Field invalid={Boolean(form.formState.errors.name)}>
        <FieldLabel>Nome da fonte</FieldLabel>
        <Input
          {...form.register("name")}
          aria-invalid={Boolean(form.formState.errors.name)}
          autoCapitalize="sentences"
          autoCorrect="on"
          inputMode="text"
          placeholder="Casa principal"
          type="text"
        />
        {form.formState.errors.name?.message && (
          <FieldError match>{form.formState.errors.name.message}</FieldError>
        )}
      </Field>
      {type === "m3u" ? (
        <Field invalid={Boolean(form.formState.errors.url)}>
          <FieldLabel>URL M3U/M3U8</FieldLabel>
          <Input
            {...form.register("url")}
            aria-invalid={Boolean(form.formState.errors.url)}
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="url"
            placeholder="https://servidor.exemplo/lista.m3u"
            type="url"
          />
          {form.formState.errors.url?.message && (
            <FieldError match>{form.formState.errors.url.message}</FieldError>
          )}
        </Field>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            className="sm:col-span-2"
            invalid={Boolean(form.formState.errors.server)}
          >
            <FieldLabel>URL do servidor</FieldLabel>
            <Input
              {...form.register("server")}
              aria-invalid={Boolean(form.formState.errors.server)}
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="url"
              placeholder="https://servidor.exemplo"
              type="url"
            />
            {form.formState.errors.server?.message && (
              <FieldError match>
                {form.formState.errors.server.message}
              </FieldError>
            )}
          </Field>
          <Field invalid={Boolean(form.formState.errors.username)}>
            <FieldLabel>Usuário</FieldLabel>
            <Input
              {...form.register("username")}
              aria-invalid={Boolean(form.formState.errors.username)}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Seu usuário"
              type="text"
            />
            {form.formState.errors.username?.message && (
              <FieldError match>
                {form.formState.errors.username.message}
              </FieldError>
            )}
          </Field>
          <Field invalid={Boolean(form.formState.errors.password)}>
            <FieldLabel>Senha</FieldLabel>
            <Input
              {...form.register("password")}
              aria-invalid={Boolean(form.formState.errors.password)}
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Sua senha"
              type="password"
            />
            {form.formState.errors.password?.message && (
              <FieldError match>
                {form.formState.errors.password.message}
              </FieldError>
            )}
          </Field>
        </div>
      )}
      <div className="grid gap-2">
        <Button
          aria-busy={form.formState.isSubmitting}
          className="h-11 w-full"
          disabled={form.formState.isSubmitting}
          type="submit"
          variant="primary"
        >
          {form.formState.isSubmitting && (
            <LoaderCircle className="size-4 animate-spin" />
          )}
          {form.formState.isSubmitting ? "Adicionando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
