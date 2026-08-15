# Multi-window chat grid (WIP) — DeepSeek Harness Web GUI

Work-in-progress feature: let the user view **up to 6 concurrent, live chat
panes** in the central area of the web GUI as a responsive grid, with a
slider/pagination when more than 6 sessions are pinned. Each pane is a full
conversation bound to its own session, independent of the global "current"
selection.

Deliverable: `multi-window-grid.patch` (in the repo root) — a `git diff`
against the cloned HEAD. Apply with `git apply multi-window-grid.patch`.

## Why the GUI only showed one chat

The conversation surface is scoped to a single "current session" via the shell
renderer's `BindingContext` (`packages/client/web-react`). The
`conversation` slot occupant (`SessionMaybeEntry`) and every nested
`conversation.*` slot read that one binding. Showing N chats at once therefore
needs (a) a way to resolve a *specific* session's provide bundle, and (b) a
renderer seat that pins a subtree to that bundle.

## What changed

### `packages/client/runtime` — resolve any session's provide bundle
- `sessions/provide.ts`: added `onRosterChange()` — a roster-change signal the
  pinned-bundle observables subscribe to (bundles rebuild on roster change).
- `sessions/service.ts`: added `SessionRuntime.infoFor(id)` — returns an
  `HostObservable<SessionProvideInfo | undefined>` for an explicit session id,
  minting the session scope on first resolve (listed sessions only). Backed by
  the existing private `provideInfo(id)`.
- `slots.ts`: the renderer host face's `sessions` now exposes `infoFor`.
- `contract/sessions.ts`: `ISessions` gains `infoFor` (the widened face).

### `packages/client/ui-slots` — types
- `renderer.ts`: `SlotRendererHost.sessions` gains `infoFor(id)`.
- `index.ts`: new `SessionPinnedProps` / `SessionPinnedProviderComponent` and
  an optional `SessionPinnedProvider` seat in `PropsRenderSlots` (optional so
  hand-built test props need not provide it; the renderer always supplies it
  to entries that declare children).

### `packages/client/web-react` — pinning seat + nested scoping
- `session-provider.tsx`:
  - **Changed `SessionProvider` to read the nearest `BindingContext`** instead
    of the host's current `provideInfo`. In the ordinary single-session GUI the
    nearest context is the root `SessionMaybeProvider`, so behavior is
    unchanged; inside a pinned pane it resolves to that pane's session, which
    is what makes nested `conversation.*` slots follow the pinned session.
  - Added `SessionPinnedProvider({ sessionId, children })` — resolves
    `host.sessions.infoFor(sessionId)` and provides the bundle as the nearest
    binding context (renders nothing for an unknown session).
- `scoped-slots.tsx` / `index.ts`: `SessionPinnedProvider` is injected into the
  standard kit for every children-declaring entry and exported.

### `packages/client/ui-layout` — the multi-pane surface
- `stores.ts`: layout store gains `GRID_SIZE = 6`, `pinned: SessionId[]`, and
  `page` plus actions `addSession` / `removeSession` / `setPage` / `resetPinned`
  (page clamps to the last full window).
- `AppFrame.tsx`: the center column now renders `MultiPaneGrid` — a toolbar
  (add-window select, prev/next slider when > GRID_SIZE pinned, per-pane
  close) over a responsive grid; each pane wraps
  `<SessionPinnedProvider sessionId={id}>{renderSlot('conversation', {})}</...>`
  so each pane is a full conversation for its own session. With no pinned
  sessions it falls back to the ordinary single conversation slot; if the
  `SessionPinnedProvider` seat is absent (should not happen) it degrades to the
  single chat.
- `AppFrame.module.css`: grid / toolbar / pane styling using existing
  `--dsw-*` tokens.

### Tests
- `test-support/client-runtime/src/sessions.ts`: `TestSessions` implements
  `infoFor`.
- `web-react/tests/*`: test host objects gain a stub `infoFor`; the
  `SessionProvider` "fails loud outside the tree" expectation updated for the
  (now binding-provider) error message.
- `ui-layout/tests/*`: layout-store expectations updated for the new init
  state + new pinned-action unit test; service fake panels gain the new
  actions.

## Verification run (all green)
- `pnpm run typecheck` (host build + client `tsc -b`) — passes.
- `pnpm run test:gui` — **271 files / 3755 tests passed** (`272 total; 1
  skipped; 4 skipped`). Targeted suites also green: ui-layout, web-react,
  runtime, test-support, ui-slots.
- `pnpm --filter @deepseek-ai/dsh-client-ui-layout run bundle` — client bundle
  (incl. CSS module) builds.

## Remaining / follow-up for the upstream PR
1. **Real-assembly snapshot/e2e coverage**: repo policy requires a
   REAL-composition test + keyless snapshot for a product-visible UI change
   (`DSH_SNAPSHOT=replay pnpm run test:web`). Not included here.
2. **Pinned-session history window**: `infoFor` mints the scope but does not
   pull the session's history window (`session.open()` is only called for the
   current session). Pinned panes render the session's live data; pulling full
   history for pinned sessions is object-layer follow-up (open pinning-time,
   outside render).
3. **Agent Note** (`/.agents/notes/...`) is required by repo convention for a
   non-trivial change; not written yet.
4. **Coverage gate**: `pnpm run test:coverage` enforces per-file 100%; the new
   branches (grid fallbacks, page clamping) need explicit coverage.
5. **Grid polish**: drag-to-reorder panes, session-title dedup currently shows
   raw id as fallback, empty-state copy is English (product copy is zh-CN),
   responsive column/row counts could be smarter than the fixed
   `data-count` presets.
6. Built on the repo's **master at `0.1.0-rc.5`** (the latest published state);
   the running npm install was `0.1.0-rc.6`. The same edits apply to rc.6
   sources (source layout is identical).
