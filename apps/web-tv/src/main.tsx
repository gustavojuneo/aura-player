import { queryClient } from "@aura/web-shared/lib-query-client";
import { configureSharedRuntime } from "@aura/web-shared/runtime-config";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createWebTvRuntimeConfig } from "./config";
import { env } from "./env";
import { router } from "./routes";
import "./styles.css";

configureSharedRuntime(createWebTvRuntimeConfig(env.VITE_API_URL));

const rootElement = document.getElementById("root");

if (!rootElement) throw new Error("Root element was not found");

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
