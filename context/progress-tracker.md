# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 2: Realtime collaboration infrastructure

## Current Goal

- Base canvas live. Ready for presence UI, custom nodes, and AI sidebar.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar`, `ProjectSidebar`, `EditorDialog`, `EditorLayout` shell.
- `03-auth` — Clerk provider, sign-in/sign-up, `proxy.ts` route protection, `UserButton` in navbar.
- `04-project-dialogs` — Editor home screen, Create/Rename/Delete dialogs, sidebar with mock data.
- `05-prisma` — Multi-file schema, `Project` + `ProjectCollaborator` models, `lib/prisma.ts` (Accelerate), `prisma.config.ts` loading `.env.local`. `db push` confirmed working.
- `06-project-api` — REST routes GET/POST `/api/projects`, PATCH/DELETE `/api/projects/[projectId]`. Auth + owner checks.
- `07-wire-editor-home` — Server-side data fetch, `useProjectActions` hook, real API mutations, navigate/refresh/redirect wired.
- `08-editor-workspace-shell` — `/editor/[roomId]` workspace page, access checks, `AccessDenied` component, `lib/project-access.ts` helpers, workspace shell with AI sidebar placeholder.
- `09-share-dialog` — Collaborator API routes (GET/POST `/api/projects/[projectId]/collaborators`, DELETE `/api/projects/[projectId]/collaborators/[email]`), Clerk enrichment for name/avatar, `useShareDialog` hook, `ShareDialog` component, `EditorNavbar` wired with `projectId` + `isOwner` props.
- `10-liveblocks-setup` — **Server-side only.** `liveblocks.config.ts`, `lib/liveblocks.ts` (cached singleton + color helper), `POST /api/liveblocks-auth` (auth → access check → room provision → session token).
- `11-base-canvas` — `types/canvas.ts` (CanvasNodeData, CanvasNode, CanvasEdge, NODE_TYPES, EDGE_TYPES), `components/canvas/canvas-room.tsx` (LiveblocksProvider + RoomProvider + ClientSideSuspense + error fallback), `components/canvas/canvas-editor.tsx` (ReactFlow + useLiveblocksFlow + dot Background + MiniMap + loose connections + fitView), `WorkspaceShell` updated to render CanvasRoom.

## In Progress

- None.

## Next Up

- Presence UI — live cursors, user avatars in the toolbar.
- Custom node and edge renderers.
- AI sidebar implementation.

## Open Questions

- Canvas storage schema for persistence — deferred to a later spec.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only sign-in/sign-up paths are public.
- Editor workspace lives at `/editor`; `/` redirects by auth state.
- Workspace route is `/editor/[roomId]` where `roomId` = Prisma project `id` (cuid). **Project ID and Liveblocks room ID are intentionally the same value.**
- Sidebar: fixed overlay, `rounded-2xl` card, collapses to `N` button at bottom-left.
- Prisma multi-file schema. `prisma.config.ts` at project root parses `.env.local` manually.
- `lib/prisma.ts` uses `@prisma/extension-accelerate` with `accelerateUrl`. Named export `{ prisma }`.
- API routes use `auth()` from `@clerk/nextjs/server`. Unauthenticated → 401. Non-owner → 403. `params` awaited (Next.js 15).
- `useProjectActions` owns all mutations. Dialog state in `ProjectDialogsProvider` context. `activeProjectId` resolved client-side via `usePathname()`.
- `lib/project-access.ts` — `getAccessibleProject(roomId)` queries Prisma with OR: owner OR collaborator email. Used by workspace page and Liveblocks auth route.
- Canvas architecture: `CanvasRoom` (client) wraps `LiveblocksProvider` → `RoomProvider` → `ClientSideSuspense` → `CanvasEditor`. The workspace page stays server-side; only `CanvasRoom` and below are client components.
- `useLiveblocksFlow({ suspense: true })` — suspends until Liveblocks Storage is loaded; `ClientSideSuspense` above handles the loading spinner. Starts with empty nodes/edges from Liveblocks Storage.
- `NODE_TYPES` and `EDGE_TYPES` are empty maps for now — custom renderers added in later specs without changing the canvas wiring.
- React Flow `ConnectionMode.Loose` allows connections from any handle. `proOptions: { hideAttribution: true }` suppresses the watermark.
- `@xyflow/react/dist/style.css` imported inside `CanvasEditor` — must be a client component import only.

## Session Notes

- **2025-06-19 — Design system (`01-design-system`)** — shadcn/ui v4, dark tokens, primitives.
- **2025-06-19 — Editor chrome (`02-editor`)** — navbar, sidebar, dialog shell.
- **2025-06-21 — Auth (`03-auth`)** — Clerk, sign-in/up, proxy, UserButton.
- **2025-06-22 — Project dialogs (`04-project-dialogs`)** — mock data, Create/Rename/Delete dialogs.
- **2025-06-24 — Prisma (`05-prisma`)** — schema, models, Accelerate client, prisma.config.ts.
- **2025-06-24 — Project API (`06-project-api`)** — REST routes, auth + owner checks.
- **2025-06-25 — Wire editor home (`07-wire-editor-home`)** — server fetch, useProjectActions, real mutations.
- **2025-06-25 — Editor workspace shell (`08-editor-workspace-shell`)** — workspace page, access checks, sidebar active state.
- **2025-07-11 — Share dialog (`09-share-dialog`)** — collaborator API, useShareDialog, ShareDialog component, EditorNavbar wired.
- **2025-07-14 — Liveblocks setup (`10-liveblocks-setup`)** — config types, server client, auth route, typo fix.
- **2025-07-16 — Base canvas (`11-base-canvas`)**
  - `types/canvas.ts` — `CanvasNodeData { label, color?, shape? }`, `CanvasNode = Node<CanvasNodeData, "canvasNode">`, `CanvasEdge = Edge<..., "canvasEdge">`, empty `NODE_TYPES` + `EDGE_TYPES` maps ready for custom renderers.
  - `components/canvas/canvas-room.tsx` — `LiveblocksProvider authEndpoint="/api/liveblocks-auth"` → `RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}` → `ClientSideSuspense fallback={<CanvasLoadingState />}`. Renders `<CanvasEditor />` inside suspense. Inline `CanvasErrorFallback` for connection errors.
  - `components/canvas/canvas-editor.tsx` — `useLiveblocksFlow({ suspense: true })` provides `{ nodes, edges, onNodesChange, onEdgesChange }`. `ReactFlow` receives synced state + memoised handlers. `Background variant=Dots gap=24 size=1`. `MiniMap` with dark styling. `ConnectionMode.Loose`. `fitView`. `proOptions.hideAttribution`. Imports `@xyflow/react/dist/style.css`.
  - `components/editor/workspace-shell.tsx` — canvas placeholder div replaced with `<CanvasRoom roomId={projectId} />`. Share dialog now wired directly in WorkspaceShell (no longer in EditorNavbar).
  - `app/(editor)/editor/[roomId]/page.tsx` — unchanged; still server-side, still passes `project.id` + `project.name` to `WorkspaceShell`.