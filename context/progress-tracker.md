# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Editor workspace foundation

## Current Goal

- Project API routes complete. Ready to wire UI to real data.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar` (fixed top bar with sidebar toggle), `ProjectSidebar` (floating overlay with My Projects / Shared tabs and New Project button), `EditorDialog` (reusable title / description / footer pattern using design tokens), `EditorLayout` (navbar + sidebar shell).
- `03-auth` — Clerk provider with `dark` theme and CSS variable overrides, sign-in / sign-up pages with two-panel auth layout, `proxy.ts` route protection, root redirects, `UserButton` in editor navbar.
- `04-project-dialogs` — Editor home screen, project dialogs (Create / Rename / Delete), sidebar project list with rename/delete actions, mock data, `useProjectDialogs` hook. No API calls or persistence.
- `05-prisma` — Prisma schema folder layout, `Project` + `ProjectCollaborator` models, `lib/prisma.ts` singleton (Accelerate via `withAccelerate` + `accelerateUrl`), `prisma.config.ts` at project root loading `.env.local` manually, `npx prisma db push` confirmed working.
- `06-project-api` — REST routes for list/create/rename/delete. Auth enforced via Clerk `auth()`. Owner-only mutations. No UI wiring.

## In Progress

- None.

## Next Up

- Wire `useProjectDialogs` to the real API routes (replace mock data).
- Canvas workspace and project routes.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` paths are public; all other routes require authentication.
- Editor workspace lives at `/editor`; `/` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`.
- Sidebar is a floating panel (`fixed`, `z-40`, slides from left) rendered via `top-18` offset with `p-4` gap creating a card-in-viewport effect. Dialogs are rendered outside the sidebar `<div>` to avoid clipping.
- Grid background on the editor canvas uses raw hex tokens (`#2a2a30`) in `backgroundImage` inline style — CSS variable opacity shorthand (`hsl(var(...) / alpha)`) does not work with Tailwind v4 hex-based tokens.
- Prisma uses multi-file schema (`prisma/` folder). `prisma.config.ts` lives at project root and manually parses `.env.local` since the Prisma CLI doesn't load it. Database is Prisma Postgres (`pooled.db.prisma.io`); schema applied via `npx prisma db push`.
- `lib/prisma.ts` uses `@prisma/extension-accelerate` with `accelerateUrl` — required for Prisma Postgres hosted connections. Client cached on `globalThis` in development.
- API routes use `auth()` from `@clerk/nextjs/server`. Unauthenticated → 401. Non-owner mutations → 403. `params` is `Promise<{...}>` and must be awaited (Next.js 15 dynamic route segments).

## Session Notes

- **2025-06-19 — Design system (`01-design-system`)**
  - Initialized shadcn/ui v4 with the `base-nova` preset on Next.js 16 + Tailwind v4. Config lives in `components.json`; do not edit generated `components/ui/*` files.
  - Added primitives: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea.
  - `lib/utils.ts` exports `cn()` via `clsx` + `tailwind-merge`.
  - `lucide-react` is installed and configured as the icon library in `components.json`.
  - Dark-only theme: `app/globals.css` defines Ghost design tokens (`--bg-base`, `--accent-primary`, etc.) and maps them to shadcn CSS variables. Tailwind utilities available as `bg-base`, `bg-surface`, `text-copy-primary`, `text-brand`, etc.
  - `app/layout.tsx` applies `dark` class on `<html>` (required for shadcn `dark:` variants) and loads Geist Sans + Geist Mono.
  - Build and lint pass. Components import from `@/components/ui/*`.

- **2025-06-19 — Editor chrome (`02-editor`)**
  - `components/editor/editor-navbar.tsx` — fixed `h-12` navbar with left/center/right sections; sidebar toggle uses `PanelLeftOpen` / `PanelLeftClose`.
  - `components/editor/project-sidebar.tsx` — fixed overlay (`z-40`, slides from left, does not push content); `isOpen` prop; Projects header with close button; My Projects / Shared tabs with empty placeholders; full-width New Project button.
  - `components/editor/editor-dialog.tsx` — dialog shell with title, optional description, optional footer actions; styled with `bg-elevated`, `border-surface-border`, `rounded-3xl` tokens. No concrete dialog instances wired yet.
  - Build and lint pass.

- **2025-06-21 — Auth (`03-auth`)**
  - Installed `@clerk/ui`; `lib/clerk-appearance.ts` applies Clerk `dark` theme with Ghost CSS variable overrides (no hardcoded colors).
  - `proxy.ts` at project root protects all routes except sign-in / sign-up paths from Clerk env vars.
  - `app/(auth)/sign-in` and `app/(auth)/sign-up` — two-panel layout on large screens (branding left, Clerk form right); form only on small screens.
  - `ClerkProvider` wraps root layout; `UserButton` added to editor navbar right section.
  - Editor moved to `/editor`; `/` redirects by auth state.

- **2025-06-22 — Project dialogs (`04-project-dialogs`)**
  - `lib/mock-projects.ts` — `Project` type (`id`, `name`, `slug`, `role`, `updatedAt`), `MOCK_PROJECTS` array (2 owned, 2 shared), `nameToSlug()` utility.
  - `hooks/use-project-dialogs.ts` — single hook owns all dialog state (`type: "create" | "rename" | "delete" | null`), form state (`name`, `slug`, `slugError`), and loading state. Slug validation checks for empty slug and duplicate slugs against existing projects; error is surfaced via `form.slugError`. Rename excludes the current project from the duplicate check by ID. Exposes `openCreate`, `openRename(project)`, `openDelete(project)`, `closeDialog`, `handleNameChange`, `handleCreate`, `handleRename`, `handleDelete`. No API calls; mock 400ms delay only.
  - `components/editor/project-dialogs.tsx` — three dialog components, all typed via `ReturnType<typeof useProjectDialogs>`:
    - `CreateProjectDialog` — name input + readonly slug input showing `/editor/{slug}` live preview; title "Create project"; description "Enter a project name to create a new room."
    - `RenameProjectDialog` — prefilled name input, `useEffect` auto-focus on open, Enter submits, current name shown in description.
    - `DeleteProjectDialog` — no input, destructive confirm button (`variant="destructive"`).
  - `components/editor/project-sidebar.tsx` — rebuilt as floating card panel (`fixed top-18 left-0 bottom-0`, `p-4` outer gap, `rounded-2xl border bg-surface` inner card). Layout: teal `FolderOpen` icon + "PROJECTS" uppercase header, subtitle, full-width "Create project" button, My Projects / Shared tabs, scrollable project list. `ProjectItem` shows pencil + trash icon buttons on hover (`opacity-0 group-hover:opacity-100`), teal border/background tint on hover (`hover:border-brand/50 hover:bg-brand/5`), trash turns red on its own hover. Actions shown for `role === "owner"` only; shared projects render without action buttons. All three dialogs rendered outside the sidebar div to avoid z-index/overflow clipping.
  - `app/editor/page.tsx` — replaced placeholder with centered heading ("Create a project or open an existing one"), muted description, teal "New project" button wired to `CreateProjectDialog`. Full-area grid background using `backgroundImage` with `linear-gradient` at `32px` spacing using raw hex `#2a2a30` (= `--border-default` token).
  - No API calls or persistence added anywhere in this feature.

- **2025-06-24 — Prisma schema and data layer (`05-prisma`)**
  - Multi-file schema in `prisma/` folder. `prisma/schema.prisma` has only `generator` + `datasource` (no `url`). `prisma/models/project.prisma` has `ProjectStatus` enum, `Project` and `ProjectCollaborator` models.
  - `prisma.config.ts` at **project root** — manually parses `.env.local` line-by-line into a plain object, then resolves `DATABASE_URL` via `process.env["DATABASE_URL"] ?? localEnv["DATABASE_URL"]`. This is required because the Prisma CLI doesn't load `.env.local`, and `prisma/schema` has no `url` in the datasource block.
  - `lib/prisma.ts` — singleton using `@prisma/extension-accelerate` with `accelerateUrl`. Import from `@/app/generated/prisma` (generated output path). Cached on `globalThis` in development.
  - Database: Prisma Postgres (`pooled.db.prisma.io`). Applied via `npx prisma db push` (not `migrate dev` — Prisma Postgres doesn't support shadow databases required by `migrate dev`).
  - `npx prisma generate` outputs client to `app/generated/prisma`.

- **2025-06-24 — Project API routes (`06-project-api`)**
  - `app/api/projects/route.ts` — `GET` returns all projects owned by the authenticated user (`ownerId: userId`), ordered by `createdAt` desc. `POST` creates a project; missing/blank `name` defaults to `"Untitled Project"`; uses schema's cuid ID strategy.
  - `app/api/projects/[projectId]/route.ts` — `PATCH` renames a project (requires `name` in body); `DELETE` removes a project. Both use a shared `getOwnedProject()` helper that fetches the project and checks `ownerId === userId` — returns `"not_found"` or `"forbidden"` discriminants. Unauthenticated → 401, non-owner → 403, missing project → 404. `DELETE` returns 204 No Content. `params` is awaited as `Promise<{ projectId: string }>` per Next.js 15.
  - No UI wiring in this feature — mock data in `useProjectDialogs` unchanged.