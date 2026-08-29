export function focusTvPlayerTarget(selector: string) {
  const target = document.querySelector<HTMLElement>(selector);
  target?.focus({ preventScroll: true });
}
