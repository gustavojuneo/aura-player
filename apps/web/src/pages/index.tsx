import { useNavigate } from "@tanstack/react-router";

import { useTvDirectionalNavigation } from "../hooks/use-tv-directional-navigation";
import { LandingHeader } from "./components/landing-header";
import { LandingHero } from "./components/landing-hero";
import { PlatformHighlights } from "./components/platform-highlights";

export function LandingPage() {
  const navigate = useNavigate();
  useTvDirectionalNavigation();

  function handleAccess() {
    void navigate({ to: "/app" });
  }

  return (
    <main
      className="min-h-screen overflow-hidden bg-bg text-text"
      data-tv-app-content
      id="inicio"
    >
      <LandingHeader />
      <LandingHero onAccess={handleAccess} />
      <PlatformHighlights />
      <footer
        className="flex flex-col gap-1.5 border-t border-line px-5 pb-7 pt-0 text-[0.6875rem] text-muted md:flex-row md:justify-between md:gap-[18px] md:px-[70px] md:pb-7 md:pt-[18px]"
        id="privacidade"
      >
        <p className="m-0">A AURA não fornece conteúdo ou listas IPTV.</p>
        <p className="m-0">Organize e assista às suas próprias fontes.</p>
      </footer>
    </main>
  );
}
