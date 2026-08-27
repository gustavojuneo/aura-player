import { LoaderCircle } from "lucide-react";
import { BrandLogo } from "./brand-logo";

export function AppLoadingScreen() {
  return (
    <div
      aria-live="polite"
      aria-label="Carregando dados da aplicação"
      className="grid min-h-screen w-full place-items-center bg-bg px-6"
      role="status"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <BrandLogo className="w-full justify-center" />
        <LoaderCircle
          aria-hidden="true"
          className="size-8 animate-spin text-gold"
        />
        <div>
          <p className="m-0 text-xl font-bold text-text">Carregando</p>
          <p className="mt-2 mb-0 text-sm text-muted">
            Carregando dados da aplicação
          </p>
        </div>
      </div>
    </div>
  );
}
