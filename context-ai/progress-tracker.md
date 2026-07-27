# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 2: Realtime collaboration infrastructure

## Current Goal

- Ready for presence UI (live cursors, user avatars — already implemented via `LiveCursors`/`CollaboratorAvatar`, confirm polish) and full AI sidebar backend implementation.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar`, `ProjectSidebar`, `EditorDialog`, `EditorLayout` shell.
- `03-auth` — Clerk provider, sign-in/sign-up, `proxy.ts` route protection, `UserButton` in navbar.
- `04-project-dialogs` — Editor home screen, Create/Rename/Delete dialogs, sidebar with mock data.
- `05-prisma` — Multi-file schema, `Project` + `ProjectCollaborator` models, `lib/prisma.ts` (Accelerate), `prisma.config.ts` loading `.env.local`. `db push` confirmed working.
- `06-project-api` — REST routes GET/POST `/api/projects`, PATCH/DELETE `/api/projects/[projectId]`. Auth + owner checks.
- `07-wire-editor-home` — Server-side data fetch, `useProjectActions` hook, real API mutations, navigate/refresh/redirect wired.
- `08-editor-workspace-shell` — `/editor/[roomId]` workspace page, access checks, `AccessDenied` component, `lib/project-access.ts` helpers, workspace shell with AI sidebar placeholder.
- `09-share-dialog` — Collaborator API routes, Clerk enrichment, `useShareDialog` hook, `ShareDialog` component, `EditorNavbar` wired with `projectId` + `isOwner` props.
- `10-liveblocks-setup` — **Server-side only.** `liveblocks.config.ts`, `lib/liveblocks.ts`, `POST /api/liveblocks-auth`.
- `11-base-canvas` — `types/canvas.ts`, `canvas-room.tsx`, `canvas-editor.tsx`, `WorkspaceShell` updated to render CanvasRoom.
- `12-shape-panel` — Floating shape toolbar, drag payload, drop handler, `CanvasNodeComponent` basic renderer, `types/canvas.ts` extended with `DRAG_TYPE`, `ShapeDragPayload`, `DEFAULT_NODE_COLOR`.
- `13-shape-rendering` — Implemented proper CSS rendering (rectangle, pill, circle) and dynamic scalable SVG rendering (diamond, hexagon, cylinder). Native HTML5 drag preview ghosts fully functional and attached to cursor.
- `14-node-editing` — Resizing support via `<NodeResizer>`, double-click inline label editing with `<textarea class="nodrag nopan">`, `onConnect` and `onDelete` passed from `useLiveblocksFlow` to `<ReactFlow>`, and explicit handle IDs (`top`, `right`, `bottom`, `left`) wired for edge creation and Liveblocks room storage node deletion.
- `15-color-toolbar` — Floating node toolbar with predefined background and text color swatches (`NODE_COLORS`). Swatches feature active ring states and hover glowing effects matching text colors. Dragging and panning during toolbar interaction prevented via `nodrag nopan`. Node state updated real-time using `updateNodeData`.
- `16-edge-behavior` — Custom right-angle edge renderer with arrow markers (`CanvasEdgeComponent`). Wide 20px hit-path for effortless edge selection. Connection handles on all 4 node sides fading in on hover with `ConnectionMode.Loose`. Double-click inline label editing powered by `EdgeLabelRenderer` and `getSmoothStepPath` midpoint coordinates. Auto-growing input with `nodrag nopan` and collaborative state synchronization via `useLiveblocksFlow`.
- `17-canvas-controls` — Added pill-shaped control bar at bottom-left (`CanvasControls`) containing animated zoom controls (`zoomIn`, `zoomOut`, `fitView`) and Liveblocks history controls (`useUndo`, `useRedo`, `useCanUndo`, `useCanRedo`). Built `useKeyboardShortcuts` hook to handle `+`/`=` (zoom in), `-` (zoom out), `Cmd/Ctrl+Z` (undo), and `Cmd/Ctrl+Shift+Z` / `Cmd/Ctrl+Y` (redo), automatically skipping trigger events when focused on editable input fields or textareas.
- `18-starter-templates` — `StarterTemplatesModal`, `CanvasTemplate` type, `handleImportTemplate` wired in `CanvasEditor` via `setNodes`/`setEdges` + `fitView`. Triggered from `EditorNavbar` via `onOpenTemplates` prop or `open-templates` custom window event.
- `19-canvas-presence` — `CollaboratorAvatar` and `LiveCursors` components rendered as overlays inside `CanvasEditor`. Pointer move/leave handlers update `useMyPresence()` cursor state.
- `20-navbar-dedup` — Fixed duplicate `EditorNavbar`/`AiSidebar` rendering caused by both `EditorLayout` and `WorkspaceShell` independently mounting them. Introduced `AiSidebarProvider`/`useAiSidebar` context (`components/editor/ai-sidebar-context.tsx`) so `EditorLayout` is now the single owner of both `EditorNavbar` and `AiSidebar`; `WorkspaceShell` reads `aiOpen` from context and only renders `CanvasRoom`. Removed dead unused `shareOpen` state/`ShareDialog` instance from `WorkspaceShell` (the real one lives in `EditorNavbar`). Fixed `AiSidebar` floating panel top offset (`top-16` → `top-[4.5rem]`) to align its 16px inset with the `right-4`/`bottom-4` edges relative to the `h-14` navbar.
- `21-canvas-autosave` — `PUT`/`GET /api/projects/[projectId]/canvas` routes (Vercel Blob for canvas JSON, Prisma `canvasJsonPath` reused for the blob URL — no schema migration needed). `hooks/use-canvas-autosave.ts` debounces saves (1500ms) off Liveblocks `nodes`/`edges`, aborts in-flight requests on rapid changes, skips the first enabling render. `contexts/save-status-context.tsx` (`SaveStatusProvider`/`useSaveStatus`) bridges save status from `CanvasEditor` (inside the Liveblocks room tree) up to `EditorNavbar` (in `EditorLayout`, outside it) — same cross-boundary pattern as `AiSidebarContext`. `CanvasEditor` now takes a `projectId` prop (passed from `CanvasRoom`'s `roomId`) and runs a mount-only load effect: hydrates from the saved blob only if the room is empty, otherwise skips entirely to avoid overwriting active collaboration.

## In Progress

- None.

## Next Up

- AI sidebar implementation (real backend — currently `AiSidebar` is a UI shell with mock `setTimeout` responses and a disabled Specs download button).

## Open Questions

- None.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only sign-in/sign-up paths are public.
- Editor workspace lives at `/editor`; `/` redirects by auth state.
- Workspace route is `/editor/[roomId]` where `roomId` = Prisma project `id` (cuid). Project ID and Liveblocks room ID are the same value.
- Sidebar: fixed overlay, `rounded-2xl` card, collapses to `N` button at bottom-left.
- Prisma multi-file schema. `prisma.config.ts` at project root parses `.env.local` manually.
- `lib/prisma.ts` uses `@prisma/extension-accelerate` with `accelerateUrl`. Named export `{ prisma }`.
- API routes use `auth()` from `@clerk/nextjs/server`. Unauthenticated → 401. Non-owner → 403. `params` awaited (Next.js 15).
- `useProjectActions` owns all mutations. Dialog state in `ProjectDialogsProvider` context. `activeProjectId` resolved via `usePathname()`.
- `lib/project-access.ts` — `getAccessibleProject(roomId)` queries Prisma with OR: owner OR collaborator email. Used for both page-level access checks and canvas API route access checks (owner-or-collaborator), as opposed to the owner-only `getOwnedProject` helper used for project rename/delete.
- Canvas architecture: `CanvasRoom` → `LiveblocksProvider` → `RoomProvider` → `ClientSideSuspense` → `CanvasEditor`. Workspace page stays server-side. `CanvasRoom` passes its `roomId` down to `CanvasEditor` as `projectId`, since the two values are identical by design.
- `useLiveblocksFlow({ suspense: true })` hook wraps Liveblocks `useStorage` and `useMutation` to handle node/edge changes, connect actions, deletions, and setNodes/setEdges updates directly in room storage.
- `NODE_TYPES = { canvasNode: CanvasNodeComponent }` and `EDGE_TYPES = { canvasEdge: CanvasEdgeComponent }` registered in `canvas-editor.tsx`.
- Drag payload uses `DRAG_TYPE = "application/canvas-shape"` as the `dataTransfer` key. Payload shape: `{ shape, width, height }`.
- Node ID format: `{shape}-{Date.now()}-{counter}` — monotonic session counter avoids ID collisions during rapid drops.
- Drop position: `screenToFlowPosition({ x: clientX - width/2, y: clientY - height/2 })` — offsets by half the node size so the drop lands centered under the cursor.
- `CanvasNodeComponent` utilizes separate handlers for traditional CSS-styled primitives and vector-scalable SVG geometries. Drag images rely on HTML5 `setDragImage()` referencing off-screen transient DOM objects to generate native cursors.
- Connection handles use explicit string `id` attributes (`top`, `right`, `bottom`, `left`) with `ConnectionMode.Loose` to allow any-handle-to-any-handle connections across nodes.
- `CanvasEdgeComponent` renders an invisible 20px hit path for easy mouse target selection and positions interactive label overlays via `EdgeLabelRenderer` and `getSmoothStepPath` coordinates.
- Inline textarea/input editing and floating toolbars rely on `nodrag nopan` utility classes to prevent canvas panning/zooming or node dragging during text editing or color selection.
- `useKeyboardShortcuts` isolates window keyboard listeners from firing shortcuts when focus is inside HTML `<input>`, `<textarea>`, or `isContentEditable` nodes.
- Cross-boundary UI state (AI sidebar open/closed, canvas save status) uses React Context providers wrapping `EditorLayoutInner` (`AiSidebarProvider`, `SaveStatusProvider`), since `EditorNavbar` and the Liveblocks room tree sit on opposite sides of the `{children}` boundary in `EditorLayout` and can't be prop-drilled directly. `EditorLayoutInner` reads each context and passes plain props down into `EditorNavbar`.
- `EditorLayout` is the single owner of `EditorNavbar` and `AiSidebar` — `WorkspaceShell` must never render either directly, to avoid duplicate-mount regressions.
- Canvas persistence: Prisma (`canvasJsonPath` on `Project`) stores only the Vercel Blob URL; Vercel Blob stores the actual `{ nodes, edges }` JSON at a stable path (`canvas/{projectId}.json`, `addRandomSuffix: false`, `allowOverwrite: true`) so re-saves overwrite in place instead of orphaning old blobs.
- Canvas load-on-mount only hydrates from the saved blob if the Liveblocks room is empty (`nodes.length === 0 && edges.length === 0`) at mount time; otherwise it's skipped entirely so active collaboration state is never clobbered.

## Session Notes

- **2025-06-19 — Design system (`01-design-system`)** — shadcn/ui v4, dark tokens, primitives.
- **2025-06-19 — Editor chrome (`02-editor`)** — navbar, sidebar, dialog shell.
- **2025-06-21 — Auth (`03-auth`)** — Clerk, sign-in/up, proxy, UserButton.
- **2025-06-22 — Project dialogs (`04-project-dialogs`)** — mock data, Create/Rename/Delete dialogs.
- **2025-06-24 — Prisma (`05-prisma`)** — schema, models, Accelerate client, prisma.config.ts.
- **2025-06-24 — Project API (`06-project-api`)** — REST routes, auth + owner checks.
- **2025-06-25 — Wire editor home (`07-wire-editor-home`)** — server fetch, useProjectActions, real mutations.
- **2025-06-25 — Editor workspace shell (`08-editor-workspace-shell`)** — workspace page, access checks, sidebar active state.
- **2025-07-11 — Share dialog (`09-share-dialog`)** — collaborator API, useShareDialog, ShareDialog, EditorNavbar wired.
- **2025-07-14 — Liveblocks setup (`10-liveblocks-setup`)** — config types, server client, auth route.
- **2025-07-16 — Base canvas (`11-base-canvas`)** — canvas-room, canvas-editor, types, WorkspaceShell updated.
- **2025-07-16 — Shape panel (`12-shape-panel`)**
  - `types/canvas.ts` — extended: `DRAG_TYPE = "application/canvas-shape"`, `ShapeDragPayload { shape, width, height }`, `DEFAULT_NODE_COLOR = NODE_COLORS[0]`, `CanvasEdgeData { label? }`.
  - `components/canvas/canvas-node.tsx` — `CanvasNodeComponent` (memo). Renders bordered rectangle with label centered. Handles on all 4 sides (source type, hidden until hover via opacity). Uses `data.color` / `data.textColor` with `DEFAULT_NODE_COLOR` fallback. Selected state shows `#00E5FF` border + ring.
  - `components/canvas/shape-panel.tsx` — `ShapePanel` renders a `position: absolute bottom-6` pill-shaped toolbar. One `ShapeButton` per shape. `onDragStart` sets `dataTransfer` with `DRAG_TYPE` key and JSON-serialised `ShapeDragPayload`. Lucide icons: `RectangleHorizontal`, `Diamond`, `Circle`, `Pill`, `Cylinder`, `Hexagon`.
  - `components/canvas/canvas-editor.tsx` — `NODE_TYPES = { canvasNode: CanvasNodeComponent }` registered locally. `onDragOver` allows copy. `onDrop` reads `DRAG_TYPE` payload, calls `screenToFlowPosition({ x: clientX - w/2, y: clientY - h/2 })`, creates `CanvasNode` with `type: "canvasNode"`, empty label, default color, dragged shape, calls `setNodes(prev => [...prev, newNode])`. `ShapePanel` rendered as overlay inside the wrapper div.
- **2026-07-19 — Shape rendering (`13-shape-rendering`)**
  - Updated `components/canvas/canvas-node.tsx` to handle distinct logic sets dividing scalable SVG elements and basic CSS geometry.
  - Implemented dynamic off-screen DOM injection with HTML5 `setDragImage()` in `components/canvas/shape-panel.tsx` to securely track visual proxies matching drop-scale sizing directly to the user drag action natively.
- **2026-07-20 — Node editing, connections & deletion fix (`14-node-editing`)**
  - Integrated `<NodeResizer>` with subtle handles for scaling controls.
  - Added double-click event listener to trigger inline label editing via centered `<textarea>` with `nodrag nopan` styling.
  - Synchronized text modifications live with `updateNodeData`.
  - Passed `onConnect` and `onDelete` directly from `useLiveblocksFlow` to `<ReactFlow>` to persist edge connections and shape deletions into Liveblocks room storage.
  - Assigned explicit `id` parameters (`top`, `right`, `bottom`, `left`) to `<Handle>` elements to restore proper edge connections.
- **2026-07-20 — Node color toolbar (`15-color-toolbar`)**
  - Created floating node toolbar displaying color swatches defined in `types/canvas.ts`.
  - Swatch interaction updates both background (`color`) and matching `textColor` dynamically via `updateNodeData`.
  - Active color swatches display highlighted outline rings; hover interactions show a glow effect matching the swatch text color.
  - Applied `nodrag nopan` classes across the toolbar to prevent dragging nodes or panning canvas when changing color options.
- **2026-07-20 — Custom canvas edges & Liveblocks hook (`16-edge-behavior`)**
  - Created `hooks/use-liveblocks-flow.ts` to connect React Flow actions (`onNodesChange`, `onEdgesChange`, `onConnect`, `onDelete`, `setNodes`, `setEdges`) directly to Liveblocks room storage mutations.
  - Built `CanvasEdgeComponent` utilizing `getSmoothStepPath` right-angle routing, closed arrowhead markers, and `#00E5FF` hover/selection highlights.
  - Added wide 20px hit-path to ensure smooth edge hovering and double-clicking.
  - Integrated connection handles on all 4 node sides fading in on hover with `ConnectionMode.Loose`.
  - Implemented inline edge label editing via `EdgeLabelRenderer` placed at midpoint coordinates, featuring auto-scaling inputs, pill badge renders, faint "+ Label" active hints, and `nodrag nopan` canvas isolation.
- **2026-07-20 — Canvas controls & keyboard shortcuts (`17-canvas-controls`)**
  - Created `hooks/use-keyboard-shortcuts.ts` to handle shortcut keydown listeners for zooming (`+`/`=`, `-`) and history undo/redo (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`, `Cmd/Ctrl+Y`). Added check preventing activation during active text input editing.
  - Created `components/canvas/canvas-controls.tsx` floating control bar at bottom-left of the canvas. Grouped smooth-animated zoom buttons and Liveblocks undo/redo buttons with visual disable states (`opacity-30 pointer-events-none`).
  - Integrated `CanvasControls` inside `CanvasEditor`.
- **2026-07-24 — Navbar/AI-sidebar deduplication fix (`20-navbar-dedup`)**
  - Diagnosed duplicate `EditorNavbar` + `ShareDialog` rendering: `EditorLayout` rendered a navbar around `{children}`, and `WorkspaceShell` (rendered as those children) rendered its own second navbar and a second, dead (unreachable) `ShareDialog`.
  - Removed the unused `shareOpen` state and dead `ShareDialog` instance from `WorkspaceShell`.
  - Introduced `components/editor/ai-sidebar-context.tsx` (`AiSidebarProvider`/`useAiSidebar`) so `aiOpen` state can be shared between `EditorLayout` (owns `EditorNavbar`, the toggle trigger) and `WorkspaceShell`/`CanvasEditor` (need `aiOpen` for the `CanvasRoom`/presence UI), which sit on opposite sides of the `children` boundary.
  - `EditorLayout` is now the sole renderer of `EditorNavbar` and `AiSidebar`; `WorkspaceShell` was reduced to just rendering `CanvasRoom` and reading `aiOpen` from context.
  - Fixed floating `AiSidebar` panel's top offset from `top-16` (64px, mismatched against the `h-14`/56px navbar) to `top-[4.5rem]` (navbar height + `1rem`), matching the `1rem` inset used on `right-4`/`bottom-4` so all three margins are visually even.
- **2026-07-24 — Canvas autosave (`21-canvas-autosave`)**
  - Reviewed `prisma/model/project.prisma` — existing `canvasJsonPath` field reused directly for the Blob URL; no migration required.
  - Installed `@vercel/blob`.
  - Built `PUT`/`GET /api/projects/[projectId]/canvas` in `app/api/projects/[projectId]/canvas/route.ts`. `PUT` uploads `{ nodes, edges }` JSON via `put()` to a stable path (`canvas/{projectId}.json`, `allowOverwrite: true`) and writes the returned URL to `Project.canvasJsonPath`. `GET` reads the URL from Prisma and fetches/returns the JSON from Blob, defaulting to `{ nodes: [], edges: [] }` if nothing saved yet. Both routes gate access via `getAccessibleProject` (owner or collaborator) rather than owner-only.
  - Created `contexts/save-status-context.tsx` (`SaveStatusProvider`/`useSaveStatus`) to carry save status (`idle` | `saving` | `saved` | `error`) across the `EditorLayout`/`{children}` boundary, mirroring the `AiSidebarContext` pattern from `20-navbar-dedup`.
  - Created `hooks/use-canvas-autosave.ts` — debounces 1500ms off `nodes`/`edges` reference changes, aborts in-flight requests via `AbortController` on rapid edits, skips the first render after being enabled (avoids re-saving a just-loaded canvas), writes status into `SaveStatusContext`.
  - Updated `CanvasRoom` to pass its `roomId` down to `CanvasEditor` as a new `projectId` prop.
  - Updated `CanvasEditor`: added mount-only load effect — checks Liveblocks room storage for existing nodes/edges first; if empty, fetches the saved canvas via the new `GET` route and hydrates via `setNodes`/`setEdges`; if the room already has content, skips the fetch entirely. Wired `useCanvasAutosave` with `enabled` gated on load completion.
  - Updated `EditorNavbar` with a `saveStatus` prop and a small non-interactive status indicator (`Loader2` spinning / `Check` / `AlertTriangle`), hidden entirely on `idle` so it stays invisible until the first autosave fires.
  - Updated `EditorLayout` to wrap `EditorLayoutInner` in `SaveStatusProvider` (nested alongside `AiSidebarProvider`) and pass `saveStatus` from `useSaveStatus()` into `EditorNavbar`.
  - **Unverified assumption:** `getAccessibleProject`'s exact signature was inferred from its usage in `WorkspacePage` (`getAccessibleProject(roomId)`, no separate `userId` arg) — the real `lib/project-access.ts` source wasn't available when this was written. Confirm signature matches before relying on the canvas routes' access checks.