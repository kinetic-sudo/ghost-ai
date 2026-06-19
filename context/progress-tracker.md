# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Editor workspace foundation

## Current Goal

- Editor chrome complete; ready for canvas workspace and project routes.

## Completed

- `01-design-system` — shadcn/ui configured, only dark-theme tokens in `globals.css`, `lib/utils.ts` with `cn()`, lucide-react installed, UI primitives added (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea).
- `02-editor` — `EditorNavbar` (fixed top bar with sidebar toggle), `ProjectSidebar` (floating overlay with My Projects / Shared tabs and New Project button), `EditorDialog` (reusable title / description / footer pattern using design tokens).

## In Progress

- None.

## Next Up

- Features that build on the editor shell (canvas workspace, project routes, etc.).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Add decisions that affect the system design or data model.

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
  - `components/editor/editor-layout.tsx` — full-viewport shell composing navbar + project sidebar with shared open state; used by `app/(editor)/layout.tsx`.
  - Build and lint pass.
