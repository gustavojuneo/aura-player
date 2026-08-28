import type { Direction } from "@noriginmedia/norigin-spatial-navigation";

export function getTvDirection(event: KeyboardEvent): Direction | undefined {
  if (event.key === "ArrowUp") return "up";
  if (event.key === "ArrowDown") return "down";
  if (event.key === "ArrowLeft") return "left";
  if (event.key === "ArrowRight") return "right";
  return undefined;
}

export function isTvActivationKey(event: KeyboardEvent) {
  return event.key === "Enter" || event.key === "OK" || event.keyCode === 13;
}

export function isTvBackKey(event: KeyboardEvent) {
  return (
    event.key === "Escape" ||
    event.key === "Back" ||
    event.key === "BrowserBack" ||
    event.keyCode === 461 ||
    event.which === 461
  );
}
