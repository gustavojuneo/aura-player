# Media Player Component Guide

The media player is a shared component family, not a route page. Its public
entry point is `index.tsx`; playback-specific subcomponents remain in this
folder because they are coordinated parts of the same player.

`index.tsx` is the mandatory public barrel for this family. The player
implementation lives in `media-player.tsx`, while `index.tsx` remains small and
contains no playback engine or page composition logic. Consumers must
import `MediaPlayer`, `PlayerScreen`, and all player subcomponents from
`components/media-player`, never from an internal file in this folder.

- `media-player.tsx` only composes the family hooks and visual parts; it must
  not own engine lifecycle, timers, seek batching, or control state.
- Private hooks live in `hooks/`, while pure player helpers live in `utils/`.
  Keep neither category beside the visual components at this directory's root.
- `hooks/use-playback-engine.ts` owns the external playback engine lifecycle and
  media-element synchronization. `use-player-controls.ts` owns player UI
  state and interaction timers. `use-next-episode-countdown.ts` owns the
  episode transition timer. Keep each hook focused on that responsibility.
- `player-video.tsx`, `player-header.tsx`, `player-primary-controls.tsx`, and
  `player-bottom-controls.tsx` are independently testable visual parts.
- `player-screen.tsx` coordinates catalog data for movie, series, and live
  playback; it is rendered by the route pages that represent watch URLs.
- `player-content-list.tsx`, `player-live-guide.tsx`, and
  `player-next-episode.tsx` are player subcomponents, not page components.
- Keep presentational controls in separate modules and pure calculations in
  helpers such as `player-utils.ts`.
- Use the Compound Pattern for coordinated player parts and the Render Props
  Pattern only for consumer-controlled player slots; use Hooks Pattern hooks
  for playback lifecycle and stateful engine behavior.
- Keep playback lifecycle, resume, completion, and synchronization behavior in
  hooks/services when extracting logic; do not move persistence into JSX.
- Show the content-list control only when the current playback context provides
  a live-channel list or a series-episode list; movie playback must not render
  that control.
- This directory must not be imported as `pages/app/player`; there is no player
  page route.
