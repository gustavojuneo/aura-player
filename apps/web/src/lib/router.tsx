import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { LandingPage } from "../pages";
import { HomePage } from "../pages/app";
import { OnboardingPage } from "../pages/onboarding";

const rootRoute = createRootRoute({ component: Outlet });
const landingRoute = createRoute({
  component: LandingPage,
  getParentRoute: () => rootRoute,
  path: "/",
});
const appRoute = createRoute({
  component: Outlet,
  getParentRoute: () => rootRoute,
  path: "app",
});
const homeRoute = createRoute({
  component: HomePage,
  getParentRoute: () => appRoute,
  path: "/",
});
const onboardingRoute = createRoute({
  component: OnboardingPage,
  getParentRoute: () => appRoute,
  path: "onboarding",
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  appRoute.addChildren([homeRoute, onboardingRoute]),
]);

export const router = createRouter({
  routeTree,
});
