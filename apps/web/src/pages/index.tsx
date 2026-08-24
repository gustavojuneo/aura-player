import { useState } from "react";

import { AccessModal } from "./components/access-modal";
import { LandingHeader } from "./components/landing-header";
import { LandingHero } from "./components/landing-hero";
import { PlatformHighlights } from "./components/platform-highlights";

export function LandingPage() {
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-bg text-text" id="inicio">
      <LandingHeader />
      <LandingHero onAccess={() => setIsAccessOpen(true)} />
      <PlatformHighlights />
      <footer
        className="flex flex-col gap-1.5 border-t border-line px-5 pb-7 pt-0 text-[11px] text-muted md:flex-row md:justify-between md:gap-[18px] md:px-[70px] md:pb-7 md:pt-[18px]"
        id="privacidade"
      >
        <p className="m-0">A AURA não fornece conteúdo ou listas IPTV.</p>
        <p className="m-0">Organize e assista às suas próprias fontes.</p>
      </footer>
      {isAccessOpen && <AccessModal onClose={() => setIsAccessOpen(false)} />}
    </main>
  );
}
