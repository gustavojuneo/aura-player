import type { ReactNode } from "react";

import { Icon, type IconName } from "./icon";

function Highlight({
  icon,
  title,
  children,
  panel = false,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  panel?: boolean;
}) {
  return (
    <article
      className={`flex min-h-[158px] flex-col gap-2.5 rounded-[14px] border border-line p-[18px] ${panel ? "bg-panel" : ""}`}
    >
      <span className="text-gold-bright">
        <Icon name={icon} />
      </span>
      <h3 className="m-0 text-[1.062rem] font-bold text-text">{title}</h3>
      <p className="m-0 text-[0.8125rem] leading-[1.35] text-muted">
        {children}
      </p>
    </article>
  );
}

export function PlatformHighlights() {
  return (
    <section
      aria-labelledby="recursos-title"
      className="flex flex-col gap-3.5 p-5 md:grid md:grid-cols-3 md:gap-4 md:px-[70px] md:py-7"
      id="recursos"
    >
      <h2 className="sr-only" id="recursos-title">
        Recursos da AURA
      </h2>
      <Highlight icon="radio" title="TV ao vivo">
        Zapeie entre suas fontes com contexto e agilidade.
      </Highlight>
      <Highlight icon="clapperboard" title="Filmes e séries" panel>
        Capas, categorias e uma tela para encontrar o próximo play.
      </Highlight>
      <Highlight icon="refresh" title="Progresso sincronizado">
        Retome de onde parou, em qualquer momento da sua jornada.
      </Highlight>
    </section>
  );
}
