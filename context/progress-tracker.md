# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 2: Realtime collaboration infrastructure

## Current Goal

- Ready for presence UI (live cursors, user avatars) and AI sidebar implementation.

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

## In Progress

- None.

## Next Up

- Presence UI — live cursors, user avatars.
- AI sidebar implementation.

## Open Questions

- Canvas storage persistence — deferred to a later spec.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only sign-in/sign-up paths are public.
- Editor workspace lives at `/editor`; `/` redirects by auth state.
- Workspace route is `/editor/[roomId]` where `roomId` = Prisma project `id` (cuid). Project ID and Liveblocks room ID are the same value.
- Sidebar: fixed overlay, `rounded-2xl` card, collapses to `N` button at bottom-left.
- Prisma multi-file schema. `prisma.config.ts` at project root parses `.env.local` manually.
- `lib/prisma.ts` uses `@prisma/extension-accelerate` with `accelerateUrl`. Named export `{ prisma }`.
- API routes use `auth()` from `@clerk/nextjs/server`. Unauthenticated → 401. Non-owner → 403. `params` awaited (Next.js 15).
- `useProjectActions` owns all mutations. Dialog state in `ProjectDialogsProvider` context. `activeProjectId` resolved via `usePathname()`.
- `lib/project-access.ts` — `getAccessibleProject(roomId)` queries Prisma with OR: owner OR collaborator email.
- Canvas architecture: `CanvasRoom` → `LiveblocksProvider` → `RoomProvider` → `ClientSideSuspense` → `CanvasEditor`. Workspace page stays server-side.
- `useLiveblocksFlow({ suspense: true })` suspends until storage loads. Destructures `onConnect` and `onDelete` directly into `<ReactFlow>`.
- `NODE_TYPES = { canvasNode: CanvasNodeComponent }` registered in `canvas-editor.tsx` — not in `types/canvas.ts` (avoids importing a client component into a shared types file).
- Drag payload uses `DRAG_TYPE = "application/canvas-shape"` as the `dataTransfer` key. Payload shape: `{ shape, width, height }`.
- Node ID format: `{shape}-{Date.now()}-{counter}` — monotonic session counter avoids ID collisions during rapid drops.
- Drop position: `screenToFlowPosition({ x: clientX - width/2, y: clientY - height/2 })` — offsets by half the node size so the drop lands centered under the cursor.
- `CanvasNodeComponent` utilizes separate handlers for traditional CSS-styled primitives and vector-scalable SVG geometries. Drag images rely on HTML5 `setDragImage()` referencing off-screen transient DOM objects to generate native cursors.
- Node handles require explicit string `id` attributes (`top`, `right`, `bottom`, `left`) when multiple handles exist on a node so React Flow can resolve target/source edge connections correctly.
- Inline textarea editing relies on `nodrag nopan` utility classes to avoid triggering canvas pan/zoom or node dragging while typing.

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