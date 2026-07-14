# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 2: Realtime collaboration infrastructure

## Current Goal

- Liveblocks server auth complete. Client-side room/presence wiring comes in the canvas spec.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar`, `ProjectSidebar`, `EditorDialog`, `EditorLayout` shell.
- `03-auth` — Clerk provider, sign-in/sign-up, `proxy.ts` route protection, `UserButton` in navbar.
- `04-project-dialogs` — Editor home screen, Create/Rename/Delete dialogs, sidebar with mock data.
- `05-prisma` — Multi-file schema, `Project` + `ProjectCollaborator` models, `lib/prisma.ts` (Accelerate), `prisma.config.ts` loading `.env.local`. `db push` confirmed working.
- `06-project-api` — REST routes GET/POST `/api/projects`, PATCH/DELETE `/api/projects/[projectId]`. Auth + owner checks.
- `07-wire-editor-home` — Server-side data fetch, `useProjectActions` hook, real API mutations, navigate/refresh/redirect wired.
- `08-editor-workspace-shell` — `/editor/[roomId]` workspace page, access checks, `AccessDenied` component, `lib/project-access.ts` helpers, workspace shell with AI sidebar placeholder.
- `09-share-dialog` — Collaborator API routes (GET/POST `/api/projects/[projectId]/collaborators`, DELETE `/api/projects/[projectId]/collaborators/[email]`), Clerk enrichment for name/avatar, `useShareDialog` hook, `ShareDialog` component (workspace link card, invite input owner-only, people list with OWNER badge, copy link with Copied! feedback), `EditorNavbar` wired with `projectId` + `isOwner` props. `isOwner` prop passed directly to dialog so invite row renders immediately without waiting for fetch.
- `10-liveblocks-setup` — **Server-side only.** `liveblocks.config.ts` (Presence: cursor + isThinking; UserMeta: id + name + avatar + color), `lib/liveblocks.ts` (cached `getLiveblocks()` singleton on `globalThis`, `getUserCursorColor()` hashing userId to 8-color palette), `POST /api/liveblocks-auth` (Clerk auth → `getAccessibleProject` check → `getOrCreateRoom` → session token with name/avatar/color). Bug fixed: Cursor generated import as `@/lib/project-acess` (missing `c`) — corrected to `@/lib/project-access`.

## In Progress

- None.

## Next Up

- Canvas workspace — client-side Liveblocks (`RoomProvider`, `useOthers`, `useSelf`, cursor presence UI).
- AI sidebar implementation.

## Open Questions

- Canvas storage schema (nodes, edges) — to be defined in canvas spec.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only sign-in/sign-up paths are public.
- Editor workspace lives at `/editor`; `/` redirects by auth state.
- Workspace route is `/editor/[roomId]` where `roomId` = Prisma project `id` (cuid). **Project ID and Liveblocks room ID are intentionally the same value** — no separate mapping needed.
- Sidebar: fixed overlay, `rounded-2xl` card, collapses to `N` button at bottom-left. Active project highlighted with teal dot + `border-white/10 bg-white/[0.04]`.
- Grid background uses `rgba(255,255,255,0.04)` at `32px` — avoids CSS variable resolution issues.
- Prisma multi-file schema. `prisma.config.ts` at project root parses `.env.local` manually (Prisma CLI doesn't load `.env.local`). Prisma Postgres via `db push`.
- `lib/prisma.ts` uses `@prisma/extension-accelerate` with `accelerateUrl`. Named export `{ prisma }`.
- API routes use `auth()` from `@clerk/nextjs/server`. Unauthenticated → 401. Non-owner → 403. `params` awaited (Next.js 15).
- Project data: server component fetches via `getProjects()`, passes as props to client `EditorLayout`. No client-side fetching on initial load.
- `useProjectActions` owns all mutations. Dialog state in `ProjectDialogsProvider` context. `activeProjectId` resolved client-side via `usePathname()` in `EditorLayout` — layouts don't receive route params in Next.js.
- `lib/project-access.ts` — `getCurrentIdentity()` returns `{ userId, email }` via Clerk. `getAccessibleProject(roomId)` queries Prisma with OR: owner match OR collaborator email match. Used by both the workspace page and the Liveblocks auth route.
- `ShareDialog` receives `isOwner` prop from `EditorNavbar` so the invite row renders immediately without waiting for the collaborators fetch to complete.
- Liveblocks auth: `getOrCreateRoom` lazily provisions the room on first join. `getUserCursorColor` hashes `userId` with `(hash << 5) - hash` and indexes into an 8-color palette deterministically. **Client-side `RoomProvider` and presence hooks are out of scope for `10-liveblocks-setup`** — they belong in the canvas spec.

## Session Notes

- **2025-06-19 — Design system (`01-design-system`)**
  - Initialized shadcn/ui v4 with the `base-nova` preset on Next.js 16 + Tailwind v4.
  - Added primitives: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea.
  - Dark-only theme with Ghost design tokens.

- **2025-06-19 — Editor chrome (`02-editor`)**
  - Fixed navbar, floating sidebar, reusable dialog shell.

- **2025-06-21 — Auth (`03-auth`)**
  - Clerk provider, two-panel auth pages, `proxy.ts`, `UserButton`.

- **2025-06-22 — Project dialogs (`04-project-dialogs`)**
  - Mock data, Create/Rename/Delete dialogs, sidebar with hover actions.

- **2025-06-24 — Prisma (`05-prisma`)**
  - Multi-file schema, `Project` + `ProjectCollaborator`, Accelerate client, `prisma.config.ts`.

- **2025-06-24 — Project API (`06-project-api`)**
  - GET/POST `/api/projects`, PATCH/DELETE `/api/projects/[projectId]`. Named `{ prisma }` export.

- **2025-06-25 — Wire editor home (`07-wire-editor-home`)**
  - `types/project.ts`, `lib/projects.ts`, `useProjectActions`, context updated, server layout fetches real data.

- **2025-06-25 — Editor workspace shell (`08-editor-workspace-shell`)**
  - `lib/project-access.ts` — `getCurrentIdentity()`, `getAccessibleProject(roomId)`.
  - `components/editor/access-denied.tsx` — centered, Lock icon, back link.
  - `app/(editor)/editor/[roomId]/page.tsx` — server component, auth + access checks, WorkspaceShell client component.
  - `components/editor/project-sidebar.tsx` — activeProjectId, tab auto-switch, Link wrapper on items.
  - `components/editor/editor-layout.tsx` — resolves activeProjectId from usePathname(), passes to sidebar + navbar.
  - `app/(editor)/layout.tsx` — async server component, fetches projects, wraps with ProjectDialogsProvider + EditorLayout. Removed params (layouts don't receive route params).

- **2025-07-11 — Share dialog (`09-share-dialog`)**
  - `types/collaborator.ts` — `{ email, createdAt, name|null, imageUrl|null, isOwner? }`.
  - `app/api/projects/[projectId]/collaborators/route.ts` — GET returns `{ collaborators, isOwner, owner }`. Owner enriched via `clerkClient().users.getUser(ownerId)`. POST invites (owner only), upserts.
  - `app/api/projects/[projectId]/collaborators/[email]/route.ts` — DELETE (owner only), `decodeURIComponent` on email segment.
  - `hooks/use-share-dialog.ts` — fetches on open, manages list/invite/remove/copy state.
  - `components/editor/share-dialog.tsx` — workspace link card + Copy link button (→ Copied! teal), invite row (owner only, uses prop not API state), People list (owner first with OWNER badge, collaborators with remove), Avatar with Clerk image or initials fallback.
  - `components/editor/editor-navbar.tsx` — optional `projectId` + `isOwner` props. Share button only shown on workspace pages. ShareDialog mounted in navbar component.

- **2025-07-14 — Liveblocks setup (`10-liveblocks-setup`) — server-side only**
  - `liveblocks.config.ts` — Presence `{ cursor: {x,y}|null, isThinking: boolean }`, UserMeta `{ id, info: { name, avatar, color } }`. Storage/events/threads empty — filled in canvas spec.
  - `lib/liveblocks.ts` — `getLiveblocks()` cached on `globalThis.liveblocks`. `getUserCursorColor(userId)` deterministic 8-color palette via charCode hash.
  - `app/api/liveblocks-auth/route.ts` — POST: Clerk auth (401) → room in body (400) → `getAccessibleProject` (403) → `getOrCreateRoom` → Clerk user fetch → session with name/avatar/color → `FULL_ACCESS` on room → return token.
  - Bug fixed: Cursor-generated import `@/lib/project-acess` → `@/lib/project-access`.
  - Client-side `RoomProvider`, `useOthers`, `useSelf`, cursor rendering — **deferred to canvas spec**.
  - Requires `LIVEBLOCKS_SECRET_KEY` in `.env.local`.