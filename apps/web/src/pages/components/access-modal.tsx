import { useEffect, useRef } from "react";

import { Button } from "../../components/ui";
import { Icon } from "./icon";

export function AccessModal({ onClose }: { onClose: () => void }) {
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.keyCode === 461) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      aria-labelledby="access-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_65%_10%,#342719_0%,#15130f_62%)] p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
    >
      <form
        className="relative flex w-full max-w-[480px] flex-col gap-[18px] rounded-[18px] border border-line bg-panel p-6 shadow-[0_18px_40px_rgb(0_0_0_/_60%)] md:p-8"
        onSubmit={(event) => event.preventDefault()}
      >
        <button
          aria-label="Fechar modal de acesso"
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-panel-2 hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" />
        </button>
        <p className="m-0 text-base font-extrabold text-gold-bright">AURA</p>
        <div className="flex flex-col gap-2">
          <h2
            className="m-0 pr-8 text-[26px] font-[750] tracking-[-0.03em] text-text"
            id="access-title"
          >
            Entre na sua experiência
          </h2>
          <p className="m-0 text-sm leading-5 text-muted">
            Seu progresso e suas fontes ficam disponíveis em qualquer tela.
          </p>
        </div>
        <label className="flex flex-col gap-2 text-xs font-semibold text-muted">
          E-mail
          <span className="flex h-[50px] items-center gap-2.5 rounded-[10px] border border-line bg-search px-3.5 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-focus/40">
            <span className="text-muted">
              <Icon name="mail" />
            </span>
            <input
              ref={firstFieldRef}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-text outline-none placeholder:text-muted"
              autoCapitalize="none"
              autoCorrect="off"
              inputMode="email"
              placeholder="voce@exemplo.com"
              type="email"
            />
          </span>
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold text-muted">
          Senha
          <span className="flex h-[50px] items-center gap-2.5 rounded-[10px] border border-line bg-search px-3.5 transition-colors focus-within:border-gold focus-within:ring-2 focus-within:ring-focus/40">
            <span className="text-muted">
              <Icon name="lock" />
            </span>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-medium text-text outline-none placeholder:text-muted"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="••••••••"
              type="password"
            />
          </span>
        </label>
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted">
            <input className="accent-gold" type="checkbox" />
            Lembrar de mim
          </label>
          <button
            className="font-bold text-gold-bright hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            type="button"
          >
            Esqueci minha senha
          </button>
        </div>
        <Button className="h-12 w-full" type="submit" variant="primary">
          Entrar
        </Button>
        <div className="h-px w-full bg-line" />
        <Button
          className="h-12 w-full"
          onClick={onClose}
          type="button"
          variant="secondary"
        >
          Continuar convidado
        </Button>
        <p className="m-0 text-[11px] leading-4 text-muted">
          Ao continuar, você concorda com os termos de privacidade da AURA.
        </p>
      </form>
    </div>
  );
}
