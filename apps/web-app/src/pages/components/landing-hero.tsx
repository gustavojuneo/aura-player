import { Button } from "@aura/web-shared/components/ui";
import { defaultHeroAspectRatio } from "@aura/web-shared/hooks/use-image-aspect-ratio";
import type { CSSProperties } from "react";

const heroImage =
  "https://images.unsplash.com/photo-1659514530020-4681fb340b55?auto=format&fit=crop&w=1800&q=85";

export function LandingHero({ onAccess }: { onAccess: () => void }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-[clamp(500px,calc(100vw/var(--hero-aspect-ratio)),900px)] overflow-hidden md:min-h-[clamp(610px,calc(100vw/var(--hero-aspect-ratio)),900px)]"
      id="experiencia"
      style={{ "--hero-aspect-ratio": defaultHeroAspectRatio } as CSSProperties}
    >
      <img
        alt=""
        className="absolute inset-0 size-full object-cover object-top"
        src={heroImage}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/10 md:bg-gradient-to-r md:from-bg/[.97] md:via-bg/[.78] md:to-bg/[.18]" />
      <div className="relative flex max-w-[610px] flex-col gap-4 px-5 pb-8 pt-[170px] md:gap-5 md:px-0 md:pb-20 md:pl-20 md:pt-[120px]">
        <p className="m-0 text-xs font-extrabold tracking-[0.09em] text-gold-bright">
          SUAS FONTES. SUA EXPERIÊNCIA.
        </p>
        <h1
          className="m-0 font-sans text-[2.375rem] font-[750] leading-[1.08] tracking-[-0.04em] text-text md:text-[clamp(2.75rem,4.2vw,3.25rem)] md:tracking-[-0.045em]"
          id="hero-title"
        >
          Todo o seu universo de entretenimento, com a elegância que ele merece.
        </h1>
        <p className="m-0 max-w-[570px] text-[0.9375rem] leading-[1.45] text-[#d6d0c5] md:text-[1.062rem]">
          Conecte suas fontes, organize seu conteúdo e assista do seu jeito, em
          uma experiência feita para continuar.
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
          <Button
            className="h-12 w-full md:w-auto"
            onClick={onAccess}
            variant="primary"
          >
            Entrar
          </Button>
        </div>
      </div>
    </section>
  );
}
