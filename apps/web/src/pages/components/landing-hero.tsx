import { Button } from "../../components/ui";

const heroImage =
  "https://images.unsplash.com/photo-1659514530020-4681fb340b55?auto=format&fit=crop&w=1800&q=85";

export function LandingHero({ onAccess }: { onAccess: () => void }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-[500px] overflow-hidden md:min-h-[610px]"
      id="experiencia"
    >
      <img
        alt=""
        className="absolute inset-0 size-full object-cover"
        src={heroImage}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/10 md:bg-gradient-to-r md:from-bg/[.97] md:via-bg/[.78] md:to-bg/[.18]" />
      <div className="relative flex max-w-[610px] flex-col gap-4 px-5 pb-8 pt-[170px] md:gap-5 md:px-0 md:pb-20 md:pl-20 md:pt-[120px]">
        <p className="m-0 text-xs font-extrabold tracking-[0.09em] text-gold-bright">
          SUAS FONTES. SUA EXPERIÊNCIA.
        </p>
        <h1
          className="m-0 font-sans text-[38px] font-[750] leading-[1.08] tracking-[-0.04em] text-text md:text-[clamp(2.75rem,4.2vw,3.25rem)] md:tracking-[-0.045em]"
          id="hero-title"
        >
          Todo o seu universo IPTV, como a elegância que ele merece.
        </h1>
        <p className="m-0 max-w-[570px] text-[15px] leading-[1.45] text-[#d6d0c5] md:text-[17px]">
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
          <Button className="h-12 w-full md:w-auto" variant="secondary">
            Continuar como convidado
          </Button>
        </div>
      </div>
    </section>
  );
}
