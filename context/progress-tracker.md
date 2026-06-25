# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Editor workspace foundation

## Current Goal

- Workspace shell complete. Ready for canvas and Liveblocks integration.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar`, `ProjectSidebar`, `EditorDialog`, `EditorLayout` shell.
- `03-auth` — Clerk provider, sign-in/sign-up, `proxy.ts` route protection, `UserButton` in navbar.
- `04-project-dialogs` — Editor home screen, Create/Rename/Delete dialogs, sidebar with mock data.
- `05-prisma` — Multi-file schema, `Project` + `ProjectCollaborator` models, `lib/prisma.ts` (Accelerate), `prisma.config.ts` loading `.env.local`. `db push` confirmed working.
- `06-project-api` — REST routes GET/POST `/api/projects`, PATCH/DELETE `/api/projects/[projectId]`. Auth + owner checks.
- `07-wire-editor-home` — Server-side data fetch, `useProjectActions` hook, real API mutations, navigate/refresh/redirect wired.
- `08-editor-workspace-shell` — `/editor/[roomId]` workspace page, access checks, `AccessDenied` component, `lib/project-access.ts` helpers, workspace navbar with Share + AI toggle, AI sidebar placeholder, active project highlight in sidebar.

## In Progress

- None.

## Next Up

- Canvas workspace with Liveblocks.
- AI sidebar implementation.
- Share/collaborator flow.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only sign-in/sign-up paths are public.
- Editor workspace lives at `/editor`; `/` redirects by auth state.
- Workspace route is `/editor/[roomId]` where `roomId` = Prisma project `id` (cuid). Project ID and room ID are the same value.
- Sidebar floating panel: `fixed top-18 left-0 bottom-0`, `p-4` gap, `rounded-2xl` inner card. Active project gets `border-brand bg-brand/10`. Tab auto-switches to whichever tab contains the active project.
- Grid background uses `rgba(255,255,255,0.04)` at `40px` — avoids CSS variable resolution issues.
- Prisma multi-file schema. `prisma.config.ts` at project root parses `.env.local` manually. Prisma Postgres via `db push`.
- `lib/prisma.ts` uses `@prisma/extension-accelerate` with `accelerateUrl`. Named export `{ prisma }`.
- API routes use `auth()` from `@clerk/nextjs/server`. Unauthenticated → 401. Non-owner → 403. `params` awaited (Next.js 15).
- Project data: server component (`app/editor/layout.tsx`) fetches via `getProjects()`, passes as props to client `EditorLayout`. No client-side fetching on initial load.
- `useProjectActions` owns all mutations. Dialog state lives in context (`ProjectDialogsProvider`). `activeProjectId` flows from layout params → provider → hook for correct delete redirect.
- `lib/project-access.ts` — `getCurrentIdentity()` returns `{ userId, email }` via Clerk. `getAccessibleProject(roomId)` queries Prisma with OR: owner match OR collaborator email match. Returns `null` for missing or unauthorized projects; page renders `<AccessDenied />` in both cases.
- `ProjectItem` is wrapped in `<Link href="/editor/${project.id}">`. Action buttons call `e.preventDefault()` + `e.stopPropagation()` to prevent navigation on rename/delete clicks.

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
  - `lib/project-access.ts` — `getCurrentIdentity()` (userId + primary email via clerkClient), `getAccessibleProject(roomId)` (Prisma OR query: owner or collaborator).
  - `components/editor/access-denied.tsx` — centered layout, `Lock` icon, short message, back link.
  - `app/(editor)/editor/[roomId]/page.tsx` — server component. Auth check → redirect to `/sign-in` if unauthenticated. `getAccessibleProject` → `<AccessDenied />` if null. Workspace layout: inner top bar with project name + Share button + AI toggle, canvas placeholder (`bg-background`, centered message), right `<aside>` (AI sidebar placeholder, `w-80`). Height `calc(100vh-48px)` to sit under the main navbar.
  - `components/editor/project-sidebar.tsx` — `activeProjectId` prop added; active item styled `border-brand bg-brand/10`; tab auto-switches on mount/change via `useEffect`; `ProjectItem` wrapped in `<Link>` with `e.preventDefault()` on action buttons.
  - `components/editor/editor-layout.tsx` — `activeProjectId` prop added, passed to `ProjectSidebar`.
  - `app/editor/layout.tsx` — resolves `params?.roomId` and threads `activeProjectId` into both `ProjectDialogsProvider` and `EditorLayout`.
  - **Bug fixed:** page had `import ... from "@/lib/project-acess"` (missing `c`) → corrected to `@/lib/project-access`.