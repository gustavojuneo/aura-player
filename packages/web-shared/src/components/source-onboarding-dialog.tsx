import { SourceForm, type SourceFormValues } from "./source-form";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "./ui";

export function SourceOnboardingDialog({
  error,
  onSave,
  progress,
}: {
  error: string | null;
  onSave: (values: SourceFormValues) => void | Promise<void>;
  progress: string | null;
}) {
  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport>
          <DialogPopup aria-labelledby="source-onboarding-title">
            <div className="mb-[22px] flex flex-col gap-2">
              <p className="m-0 text-[0.6875rem] font-extrabold tracking-[0.08em] text-gold-bright">
                PRIMEIRO ACESSO · ETAPA 1 DE 2
              </p>
              <DialogTitle
                className="m-0 text-[1.75rem] font-[750] leading-tight tracking-[-0.03em] text-text md:text-[2rem]"
                id="source-onboarding-title"
              >
                Conecte sua primeira fonte
              </DialogTitle>
              <DialogDescription className="m-0 max-w-[650px] text-sm leading-[1.45] text-muted">
                AURA organiza links M3U/M3U8 e servidores Xtream que você já
                possui. Nenhum conteúdo é fornecido pela plataforma.
              </DialogDescription>
            </div>
            <SourceForm
              description="Informe os dados da sua primeira lista IPTV para começar."
              initialSource={{ name: "", type: "m3u" }}
              onSave={onSave}
              submitLabel="Adicionar"
              title="Adicionar Lista"
            />
            {progress && (
              <p
                className="mt-4 mb-0 rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold-bright"
                role="status"
              >
                {progress}
              </p>
            )}
            {error && (
              <p
                className="mt-4 mb-0 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger-strong"
                role="alert"
              >
                Não foi possível carregar a playlist: {error}
              </p>
            )}
            <p className="mt-4 mb-0 text-[0.6875rem] leading-4 text-muted">
              Adicione uma fonte válida para continuar.
            </p>
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  );
}
