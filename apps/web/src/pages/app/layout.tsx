import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppLoadingScreen } from "../../components/app-loading-screen";
import { useAppLifecycle } from "../../hooks/use-app-lifecycle";
import {
  useCatalogRefreshError,
  useCatalogRefreshInProgress,
} from "../../hooks/use-catalog-data";
import { useTvDirectionalNavigation } from "../../hooks/use-tv-directional-navigation";
import { MobileNavigation, SessionExpiredState, Sidebar } from "./components";

export function AppLayout() {
  useAppLifecycle();
  useTvDirectionalNavigation();
  const [sessionExpired, setSessionExpired] = useState(false);
  const { pathname } = useLocation();
  const isCatalogRefreshing = useCatalogRefreshInProgress();
  const catalogRefreshError = useCatalogRefreshError();
  const isPlayerRoute =
    /^\/app\/(movies\/[^/]+\/watch|series\/[^/]+\/episodes\/[^/]+\/watch|tv\/[^/]+\/watch)(\/|$)/.test(
      pathname,
    );
  const isShelllessRoute = isPlayerRoute;

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener("iptv:session-expired", handleExpired);
    return () =>
      window.removeEventListener("iptv:session-expired", handleExpired);
  }, []);

  return (
    <main
      className={
        isPlayerRoute
          ? "h-dvh overflow-hidden bg-bg text-text"
          : isShelllessRoute
            ? "min-h-screen bg-bg text-text"
            : "flex min-h-screen bg-bg text-text"
      }
    >
      {!isShelllessRoute && <Sidebar />}
      <div className="relative min-w-0 flex-1" data-tv-app-content>
        {isCatalogRefreshing && !pathname.startsWith("/app/sources") ? (
          <AppLoadingScreen />
        ) : catalogRefreshError && !pathname.startsWith("/app/sources") ? (
          <AppLoadingScreen
            error={catalogRefreshError}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <Outlet />
        )}
      </div>
      {!isShelllessRoute && <MobileNavigation />}
      {sessionExpired && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-5 backdrop-blur-sm">
          <SessionExpiredState />
        </div>
      )}
    </main>
  );
}
