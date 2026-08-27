# Shared Components Guide

Place here every composed React component shared by more than one page or by a
stable application area. Examples include catalog, carousel, hero, header,
icon, favorite button, source selector, program guide, and player panels.

The player component family lives under `components/media-player/`: its
`index.tsx` is the public entry point, while playback lists, guides, next
episode UI, controls, and helpers stay in that folder.

- Keep business data loading in hooks/services; components receive typed data
  and callbacks.
- Do not define meaningful child components inside a parent file. Extract
  children into modules and compose them explicitly.
- Use the Compound Components Pattern for coordinated families of parts.
- Use the Render Props Pattern only when the component must own a subtree or
  boundary while the consumer must control the rendered JSX. For ordinary data
  sharing, use a custom hook.
- Generic controls belong in `components/ui/`, not here.
- Page-private components belong in the owning `pages/<route>/components/`.
