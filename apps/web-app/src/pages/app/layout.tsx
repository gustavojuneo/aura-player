import { AppLoadingScreen } from "@aura/web-shared/components/app-loading-screen";
import { useAppLifecycle } from "@aura/web-shared/hooks/use-app-lifecycle";
import {
  useCatalogRefreshError,
  useCatalogRefreshInProgress,
} from "@aura/web-shared/hooks/use-catalog-data";
import {
  MobileNavigation,
  SessionExpiredState,
  Sidebar,
} from "@aura/web-shared/pages/app/components";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function AppLayout() {
  useAppLifecycle();
  const [sessionExpired, setSessionExpired] = useState(false);
  const { pathname } = useLocation();
  const isCatalogRefreshing = useCatalogRefreshInProgress();
  const catalogRefreshError = useCatalogRefreshError();
  const isPlayerRoute =
    /^\/app\/(movies\/[^/]+\/watch|series\/[^/]+\/episodes\/[^/]+\/watch|tv\/[^/]+\/watch)(\/|$)/.test(
      pathname,
    );

  useEffect(() => {
    const handleExpired = () => setSessionExpired(true);
    window.addEventListener("aura:session-expired", handleExpired);
    return () =>
      window.removeEventListener("aura:session-expired", handleExpired);
  }, []);

  return (
    <main
      className={
        isPlayerRoute
          ? "h-dvh overflow-hidden bg-bg text-text"
          : "flex min-h-screen bg-bg text-text"
      }
    >
      {!isPlayerRoute && <Sidebar />}
      <div className="relative min-w-0 flex-1">
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
      {!isPlayerRoute && <MobileNavigation />}
      {sessionExpired && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-bg/90 p-5 backdrop-blur-sm">
          <SessionExpiredState />
        </div>
      )}
    </main>
  );
}
