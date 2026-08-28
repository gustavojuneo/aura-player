import { isTvBackKey } from "./tv-remote-input";

export type TvBackHandler = (event: KeyboardEvent) => void;

/** Owns the webOS Back listener lifecycle while the coordinator owns policy. */
export function registerTvBackHandler(
  onBack: TvBackHandler,
  onRelease: TvBackHandler,
) {
  const handleBack = (event: KeyboardEvent) => {
    if (isTvBackKey(event)) onBack(event);
  };
  const handleRelease = (event: KeyboardEvent) => {
    if (isTvBackKey(event)) onRelease(event);
  };
  window.addEventListener("keydown", handleBack, true);
  window.addEventListener("keyup", handleRelease, true);
  return () => {
    window.removeEventListener("keydown", handleBack, true);
    window.removeEventListener("keyup", handleRelease, true);
  };
}
