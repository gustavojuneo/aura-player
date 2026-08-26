import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useCatalogSources } from "../hooks/use-catalog-data";
import { getActiveSourceId, setActiveSourceId } from "../services/catalog-db";
import { Icon, type IconName } from "./icon";
import { SourceSelector } from "./source-selector";
import { ProductState } from "./ui";

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-7 place-items-center rounded-full bg-gold text-[10px] font-extrabold text-ink">
        A
      </span>
      <span className="font-display text-[19px] font-bold tracking-[-0.04em] text-text">
        AURA
      </span>
    </div>
  );
}

const navigation: Array<{
  icon: IconName;
  label: string;
  to?:
    | "/app"
    | "/app/tv"
    | "/app/movies"
    | "/app/series"
    | "/app/favorites"
    | "/app/sources"
    | "/app/settings";
}> = [
  { icon: "home", label: "Início", to: "/app" },
  { icon: "radio", label: "TV ao vivo", to: "/app/tv" },
  { icon: "clapperboard", label: "Filmes", to: "/app/movies" },
  { icon: "tv", label: "Séries", to: "/app/series" },
  { icon: "heart", label: "Favoritos", to: "/app/favorites" },
  { icon: "database", label: "Fontes IPTV", to: "/app/sources" },
];

const itemClassName =
  "flex h-11 w-full items-center gap-3 rounded-[10px] px-3 text-left text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

function NavigationItem({
  item,
  mobile = false,
}: {
  item: (typeof navigation)[number];
  mobile?: boolean;
}) {
  if (item.to) {
    return (
      <Link
        activeOptions={{ exact: item.to === "/app" }}
        activeProps={{
          className: `${itemClassName} border border-gold/80 bg-[#3b2e18] text-text ${mobile ? "h-auto w-16 flex-col gap-1 px-0 text-[10px]" : ""}`,
        }}
        className={`${itemClassName} border border-transparent text-muted hover:bg-panel hover:text-text ${mobile ? "h-auto w-16 flex-col gap-1 px-0 text-[10px]" : ""}`}
        to={item.to}
      >
        <Icon
          className={`size-5 shrink-0 text-muted ${mobile ? "text-current" : ""}`}
          name={item.icon}
        />
        <span className="truncate">
          {mobile && item.label === "TV ao vivo" ? "Ao vivo" : item.label}
        </span>
      </Link>
    );
  }

  return (
    <button
      className={`${itemClassName} border border-transparent text-muted hover:bg-panel hover:text-text ${mobile ? "h-auto w-16 flex-col gap-1 px-0 text-[10px]" : ""}`}
      disabled
      type="button"
    >
      <Icon className="size-5 shrink-0" name={item.icon} />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export function Sidebar() {
  const { sources } = useCatalogSources();
  const activeSourceId = getActiveSourceId() ?? sources[0]?.id;
  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-2 overflow-hidden border-r border-line bg-[#11100d] p-[26px_18px] lg:flex">
      <Brand />
      <SourceSelector
        activeSourceId={activeSourceId}
        className="mt-5 w-full"
        onChange={(sourceId) => setActiveSourceId(sourceId)}
        sources={sources}
      />
      <nav
        aria-label="Navegação principal"
        className="mt-2 flex flex-col gap-1"
      >
        {navigation.map((item) => (
          <NavigationItem item={item} key={item.label} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1">
        <NavigationItem
          item={{
            icon: "settings",
            label: "Configurações",
            to: "/app/settings",
          }}
        />
        <button
          className="mt-3 flex items-center gap-2 border-t border-line px-3 pt-4 text-xs font-semibold text-muted hover:text-text"
          type="button"
        >
          <span className="grid size-8 place-items-center rounded-full bg-gold text-xs font-extrabold text-ink">
            M
          </span>
          <span className="truncate">Marina</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  return (
    <nav
      aria-label="Navegação mobile"
      className="fixed inset-x-0 bottom-0 z-20 flex h-[72px] items-center justify-around border-t border-line bg-[#16140fF2] px-2 backdrop-blur-lg lg:hidden"
    >
      {navigation.slice(0, 5).map((item) => (
        <NavigationItem item={item} key={item.label} mobile />
      ))}
    </nav>
  );
}

export function AppHeader({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={`flex min-h-12 items-center justify-between gap-4 ${className ?? ""}`}
    >
      <div className="lg:hidden">
        <Brand />
      </div>
      <div className="hidden flex-1 md:block">{children}</div>
      <div className="ml-auto flex items-center gap-4 text-muted md:hidden">
        <button aria-label="Buscar" className="md:hidden" type="button">
          <Icon name="search" />
        </button>
      </div>
    </header>
  );
}

export function AppLayout({
  children,
  fixedViewport = false,
}: {
  children: ReactNode;
  fixedViewport?: boolean;
}) {
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener("iptv:session-expired", handleExpired);
    return () =>
      window.removeEventListener("iptv:session-expired", handleExpired);
  }, []);

  return (
    <main
      className={`flex bg-bg text-text ${fixedViewport ? "h-dvh min-h-0 overflow-hidden" : "min-h-screen"}`}
    >
      <Sidebar />
      <div
        className={`min-w-0 flex-1 ${fixedViewport ? "min-h-0 overflow-hidden" : ""}`}
      >
        {children}
      </div>
      <MobileNavigation />
      {sessionExpired && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-5 backdrop-blur-sm">
          <ProductState
            action={{
              label: "Entrar novamente",
              onClick: () => {
                window.location.assign("/");
              },
            }}
            className="w-full max-w-md"
            kind="session-expired"
          />
        </div>
      )}
    </main>
  );
}
