import { BrandLogo } from "@aura/web-shared/components/brand-logo";
import { Button } from "@aura/web-shared/components/ui";
import { Icon } from "./icon";

function AuraMark() {
  return (
    <a
      className="flex items-center gap-2.5 rounded-lg bg-panel px-2 py-1 outline-2 outline-offset-2 outline-transparent transition-colors hover:bg-panel-2 focus-visible:outline-focus"
      href="#inicio"
      aria-label="AURA, início"
    >
      <BrandLogo
        markClassName="size-8"
        textClassName="font-extrabold tracking-[0.06em]"
      />
    </a>
  );
}

export function LandingHeader() {
  return (
    <header className="relative z-10 flex h-[72px] items-center justify-between border-b border-line bg-bg/95 px-5 md:px-12">
      <AuraMark />
      <nav
        aria-label="Navegação principal"
        className="hidden items-center gap-7 md:flex"
      >
        <a
          className="rounded-lg border border-line bg-panel px-3 py-2 text-[0.8125rem] font-semibold text-muted outline-2 outline-offset-2 outline-transparent transition-colors hover:border-gold/60 hover:bg-panel-2 hover:text-text focus-visible:outline-focus"
          href="#experiencia"
        >
          Experiência
        </a>
        <a
          className="rounded-lg border border-line bg-panel px-3 py-2 text-[0.8125rem] font-semibold text-muted outline-2 outline-offset-2 outline-transparent transition-colors hover:border-gold/60 hover:bg-panel-2 hover:text-text focus-visible:outline-focus"
          href="#recursos"
        >
          Recursos
        </a>
        <a
          className="rounded-lg border border-line bg-panel px-3 py-2 text-[0.8125rem] font-semibold text-muted outline-2 outline-offset-2 outline-transparent transition-colors hover:border-gold/60 hover:bg-panel-2 hover:text-text focus-visible:outline-focus"
          href="#privacidade"
        >
          Privacidade
        </a>
        <Button className="ml-1 h-12 px-[22px] text-sm" variant="secondary">
          Ver detalhes
        </Button>
      </nav>
      <button
        aria-label="Abrir menu"
        className="inline-flex size-11 items-center justify-center rounded-[10px] border border-transparent text-text transition-colors hover:bg-panel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus md:hidden"
        type="button"
      >
        <Icon name="menu" />
      </button>
    </header>
  );
}
