import { AppLoadingScreen } from "@aura/web-shared/components/app-loading-screen";
import { useAppLifecycle } from "@aura/web-shared/hooks/use-app-lifecycle";
import {
  useCatalogRefreshError,
  useCatalogRefreshInProgress,
} from "@aura/web-shared/hooks/use-catalog-data";
import {
  SessionExpiredState,
  Sidebar,
} from "@aura/web-shared/pages/app/components";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTvDirectionalNavigation } from "../../hooks/use-tv-directional-navigation";
import { useTvFavoriteShortcut } from "../../hooks/use-tv-favorite-shortcut";

export function AppLayout() {
  useAppLifecycle();
  useTvFavoriteShortcut();
  useTvDirectionalNavigation();
  const [sessionExpired, setSessionExpired] = useState(false);
  const { pathname } = useLocation();
  const isCatalogRefreshing = useCatalogRefreshInProgress();
  const catalogRefreshError = useCatalogRefreshError();
  const isPlayerRoute = /\/watch(\/|$)/.test(pathname);

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener("aura:session-expired", handleExpired);
    return () =>
      window.removeEventListener("aura:session-expired", handleExpired);
  }, []);

  if (isCatalogRefreshing) {
    return (
      <AppLoadingScreen
        loadingDescription="Aguarde enquanto o catálogo é carregado."
        loadingTitle="Carregando catálogo"
      />
    );
  }

  if (catalogRefreshError) {
    return (
      <AppLoadingScreen
        error={catalogRefreshError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <main
      className={
        isPlayerRoute
          ? "h-dvh overflow-hidden bg-bg text-text"
          : "flex min-h-screen bg-bg text-text"
      }
    >
      {!isPlayerRoute && <Sidebar isTv />}
      <div className="relative min-w-0 flex-1" data-tv-app-content>
        <Outlet />
      </div>
      {sessionExpired && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-5">
          <SessionExpiredState />
        </div>
      )}
    </main>
  );
}
