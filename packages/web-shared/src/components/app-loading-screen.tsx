import { LoaderCircle } from "lucide-react";
import { Button } from "./ui";

export function AppLoadingScreen({
  error,
  loadingDescription = "Carregando dados da aplicação",
  loadingTitle = "Carregando",
  onRetry,
}: {
  error?: Error | null;
  loadingDescription?: string;
  loadingTitle?: string;
  onRetry?: () => void;
}) {
  if (error) {
    return (
      <div
        aria-live="assertive"
        className="grid min-h-screen w-full place-items-center bg-bg px-6 text-center"
        role="alert"
      >
        <div className="flex max-w-md flex-col items-center gap-4">
          <p className="m-0 text-xl font-bold text-text">
            Não foi possível carregar o catálogo
          </p>
          <p className="m-0 text-sm text-muted">{error.message}</p>
          {onRetry && (
            <Button className="h-10 px-4 text-sm" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      aria-label="Carregando dados da aplicação"
      className="grid min-h-screen w-full place-items-center bg-bg px-6"
      role="status"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <LoaderCircle
          aria-hidden="true"
          className="size-8 animate-spin text-gold"
        />
        <div>
          <p className="m-0 text-xl font-bold text-text">{loadingTitle}</p>
          <p className="mt-2 mb-0 text-sm text-muted">{loadingDescription}</p>
        </div>
      </div>
    </div>
  );
}
