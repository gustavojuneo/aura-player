/** TV-owned adapter for the spatial engine used by the application. */
export {
  getCurrentFocusKey,
  init,
  navigateByDirection,
  pause,
  ROOT_FOCUS_KEY,
  resume,
  setFocus,
  updateAllLayouts,
} from "@noriginmedia/norigin-spatial-navigation";
export { SpatialNavigation } from "@noriginmedia/norigin-spatial-navigation";
export type {
  Direction,
  FocusableComponent,
} from "@noriginmedia/norigin-spatial-navigation";

let initialized = false;

export function initializeTvSpatialNavigation() {
  if (initialized) return;
  init({
    distanceCalculationMethod: "center",
    domNodeFocusOptions: { preventScroll: true },
    shouldFocusDOMNode: true,
    throttle: 80,
    throttleKeypresses: true,
  });
  initialized = true;
}
