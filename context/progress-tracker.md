# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Editor workspace foundation

## Current Goal

- Editor home wired to real project data. Ready for canvas workspace.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar` (fixed top bar with sidebar toggle), `ProjectSidebar` (floating overlay with My Projects / Shared tabs and New Project button), `EditorDialog` (reusable title / description / footer pattern using design tokens), `EditorLayout` (navbar + sidebar shell).
- `03-auth` — Clerk provider with `dark` theme and CSS variable overrides, sign-in / sign-up pages with two-panel auth layout, `proxy.ts` route protection, root redirects, `UserButton` in editor navbar.
- `04-project-dialogs` — Editor home screen, project dialogs (Create / Rename / Delete), sidebar project list with rename/delete actions, mock data, `useProjectDialogs` hook.
- `05-prisma` — Prisma schema folder layout, `Project` + `ProjectCollaborator` models, `lib/prisma.ts` singleton (Accelerate via `withAccelerate` + `accelerateUrl`), `prisma.config.ts` at project root loading `.env.local` manually, `npx prisma db push` confirmed working.
- `06-project-api` — REST routes for list/create/rename/delete. Auth enforced via Clerk `auth()`. Owner-only mutations. No UI wiring.
- `07-wire-editor-home` — Sidebar and dialogs wired to real API. Server-side data fetch. `useProjectActions` hook. Create navigates to workspace. Rename refreshes. Delete redirects or refreshes.

## In Progress

- None.

## Next Up

- Canvas workspace at `/editor/[projectId]`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` paths are public; all other routes require authentication.
- Editor workspace lives at `/editor`; `/` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`.
- Sidebar is a floating panel (`fixed`, `z-40`, slides from left) rendered via `top-18` offset with `p-4` gap creating a card-in-viewport effect. Dialogs rendered in `EditorLayout` to avoid clipping.
- Grid background on the editor canvas uses `rgba(255,255,255,0.04)` at `40px` grid — avoids CSS variable resolution issues.
- Prisma uses multi-file schema (`prisma/` folder). `prisma.config.ts` lives at project root and manually parses `.env.local`. Database is Prisma Postgres; schema applied via `npx prisma db push`.
- `lib/prisma.ts` uses `@prisma/extension-accelerate` with `accelerateUrl`. Named export: `export const prisma`.
- API routes use `auth()` from `@clerk/nextjs/server`. Unauthenticated → 401. Non-owner mutations → 403. `params` awaited as `Promise<{...}>` (Next.js 15).
- Project data flows server → client: `app/editor/layout.tsx` (server) fetches via `lib/projects.ts`, passes `ownedProjects` + `sharedProjects` as props to `EditorLayout` (client). No client-side fetching for initial load.
- `useProjectActions` (not `useProjectDialogs`) owns all mutations and dialog state for the wired UI. `useProjectDialogs` remains for reference but is no longer used in the main flow.
- Room ID = slugified project name + 5-char random suffix, generated at dialog-open time and kept stable while typing (only slug portion updates, suffix stays fixed).
- `types/project.ts` defines the shared `Project` type used across server helpers, API routes, and client components. Replaces the mock `Project` type from `lib/mock-projects.ts`.

## Session Notes

- **2025-06-19 — Design system (`01-design-system`)**
  - Initialized shadcn/ui v4 with the `base-nova` preset on Next.js 16 + Tailwind v4. Config lives in `components.json`; do not edit generated `components/ui/*` files.
  - Added primitives: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea.
  - `lib/utils.ts` exports `cn()` via `clsx` + `tailwind-merge`.
  - `lucide-react` is installed and configured as the icon library in `components.json`.
  - Dark-only theme: `app/globals.css` defines Ghost design tokens (`--bg-base`, `--accent-primary`, etc.) and maps them to shadcn CSS variables.
  - `app/layout.tsx` applies `dark` class on `<html>` and loads Geist Sans + Geist Mono.
  - Build and lint pass.

- **2025-06-19 — Editor chrome (`02-editor`)**
  - `components/editor/editor-navbar.tsx` — fixed `h-12` navbar with sidebar toggle.
  - `components/editor/project-sidebar.tsx` — fixed overlay, My Projects / Shared tabs, New Project button.
  - `components/editor/editor-dialog.tsx` — reusable dialog shell with design tokens.
  - Build and lint pass.

- **2025-06-21 — Auth (`03-auth`)**
  - Clerk provider, sign-in/sign-up pages, `proxy.ts` route protection, `UserButton` in navbar.
  - Editor at `/editor`; `/` redirects by auth state.

- **2025-06-22 — Project dialogs (`04-project-dialogs`)**
  - `lib/mock-projects.ts`, `hooks/use-project-dialogs.ts`, `components/editor/project-dialogs.tsx`, `project-sidebar.tsx`, `app/editor/page.tsx`.
  - Mock data only, no API calls.

- **2025-06-24 — Prisma (`05-prisma`)**
  - Multi-file schema, `prisma/models/project.prisma`, `lib/prisma.ts` (Accelerate), `prisma.config.ts` at root.
  - `npx prisma db push` working.

- **2025-06-24 — Project API (`06-project-api`)**
  - `app/api/projects/route.ts` (GET, POST), `app/api/projects/[projectId]/route.ts` (PATCH, DELETE).
  - `{ prisma }` named export. Auth + owner checks enforced.

- **2025-06-25 — Wire editor home (`07-wire-editor-home`)**
  - `types/project.ts` — shared `Project` type (id, name, description, status, canvasJsonPath, createdAt, updatedAt, role).
  - `lib/projects.ts` — `getProjects()` server helper: fetches owned projects and collaborator rows via Prisma, serialises dates to ISO strings, returns `{ ownedProjects, sharedProjects }`.
  - `hooks/use-project-actions.ts` — replaces mock logic. `openCreate` generates a room ID (slug + 5-char suffix) immediately on open; `handleNameChange` updates slug portion while keeping suffix stable. `handleCreate` POSTs to `/api/projects` then navigates to `/editor/${project.id}`. `handleRename` PATCHes then calls `router.refresh()`. `handleDelete` DELETEs then redirects to `/editor` if deleting the active project, else refreshes. Accepts optional `activeProjectId` param.
  - `components/editor/project-dialog-context.tsx` — updated to use `useProjectActions` instead of `useProjectDialogs`. `ProjectDialogsProvider` accepts optional `activeProjectId` prop.
  - `components/editor/project-dialogs.tsx` — typed against `useProjectActions`. Create dialog shows live room ID preview (`/editor/${form.roomId}`). Rename pre-fills current name. Delete shows project name.
  - `components/editor/project-sidebar.tsx` — accepts `ownedProjects` + `sharedProjects` as props (no internal state). Uses `useProjectDialogsContext` for action callbacks only. Project path shows `/editor/${project.id}`.
  - `components/editor/editor-layout.tsx` — accepts `ownedProjects` + `sharedProjects` props, passes to sidebar. All three dialogs rendered here.
  - `components/editor/editor-home-client.tsx` — new client component for the home page hero; uses context for `openCreate`.
  - `app/editor/layout.tsx` — async server component; calls `getProjects()`, wraps with `ProjectDialogsProvider` + `EditorLayout` passing project lists.
  - `app/editor/page.tsx` — thin server component shell rendering `<EditorHomeClient />`.