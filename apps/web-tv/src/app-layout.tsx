import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLoadingScreen } from "@iptv/web-shared/components/app-loading-screen";
import { useAppLifecycle } from "@iptv/web-shared/hooks/use-app-lifecycle";
import {
  useCatalogRefreshError,
  useCatalogRefreshInProgress,
} from "@iptv/web-shared/hooks/use-catalog-data";
import { SessionExpiredState, Sidebar } from "@iptv/web-shared/pages/app/components";
import { useTvDirectionalNavigation } from "./hooks/use-tv-directional-navigation";

export function AppLayout() {
  useAppLifecycle();
  useTvDirectionalNavigation();
  const [sessionExpired, setSessionExpired] = useState(false);
  const { pathname } = useLocation();
  const isCatalogRefreshing = useCatalogRefreshInProgress();
  const catalogRefreshError = useCatalogRefreshError();
  const isPlayerRoute = /\/watch(\/|$)/.test(pathname);

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener("iptv:session-expired", handleExpired);
    return () =>
      window.removeEventListener("iptv:session-expired", handleExpired);
  }, []);

  return (
    <main className={isPlayerRoute ? "h-dvh overflow-hidden bg-bg text-text" : "flex min-h-screen bg-bg text-text"}>
      {!isPlayerRoute && <Sidebar isTv />}
      <div className="relative min-w-0 flex-1" data-tv-app-content>
        {isCatalogRefreshing && !pathname.startsWith("/app/sources") ? (
          <AppLoadingScreen />
        ) : catalogRefreshError && !pathname.startsWith("/app/sources") ? (
          <AppLoadingScreen error={catalogRefreshError} onRetry={() => window.location.reload()} />
        ) : (
          <Outlet />
        )}
      </div>
      {sessionExpired && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-5">
          <SessionExpiredState />
        </div>
      )}
    </main>
  );
}
