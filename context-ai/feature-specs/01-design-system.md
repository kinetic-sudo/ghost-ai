READ `AGENT.MD` before starting 

We're addind the design system and UI primitive components.

Install and configure `shadcn/ui`

Add these shadcn component:
- Button
- Card 
- Dialog
- Inputs 
- Tabs
- Textarea 
- ScrollArea

Do not modify the generated `components/ui/*` files after installion. 

Also install `lucide-react`.

Create `lib/utils.ts` with a reusable `cn()` helper for merging Tailwind classes.

Ensure all of the components matches the existing dark theme in `global.css`.

### Check when done

- All components import without errors
- `cn()` works properly
- No default light styling appears
