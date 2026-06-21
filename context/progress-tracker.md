# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Editor workspace foundation

## Current Goal

- Auth wired; editor shell ready for canvas workspace and project routes.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar` (fixed top bar with sidebar toggle), `ProjectSidebar` (floating overlay with My Projects / Shared tabs and New Project button), `EditorDialog` (reusable title / description / footer pattern using design tokens), `EditorLayout` (navbar + sidebar shell).
- `03-auth` — Clerk provider with `dark` theme and CSS variable overrides, sign-in / sign-up pages with two-panel auth layout, `proxy.ts` route protection, root redirects, `UserButton` in editor navbar.

## In Progress

- None.

## Next Up

- Features that build on the editor shell (canvas workspace, project routes, etc.).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Route protection uses protected-first `proxy.ts`: only `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` paths are public; all other routes require authentication.
- Editor workspace lives at `/editor`; `/` redirects authenticated users to `/editor` and unauthenticated users to `/sign-in`.

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
