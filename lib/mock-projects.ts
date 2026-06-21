export type ProjectRole = "owner" | "collaborator"

export interface Project {
  id: string
  name: string
  slug: string
  role: ProjectRole
  updatedAt: string
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_1",
    name: "E-Commerce Platform",
    slug: "e-commerce-platform",
    role: "owner",
    updatedAt: "2025-06-20",
  },
  {
    id: "proj_2",
    name: "Internal Dashboard",
    slug: "internal-dashboard",
    role: "owner",
    updatedAt: "2025-06-18",
  },
  {
    id: "proj_3",
    name: "Design System",
    slug: "design-system",
    role: "collaborator",
    updatedAt: "2025-06-15",
  },
  {
    id: "proj_4",
    name: "Mobile App Backend",
    slug: "mobile-app-backend",
    role: "collaborator",
    updatedAt: "2025-06-10",
  },
]

/**
 * Derive a URL-safe slug from a project name.
 * Lowercases, replaces spaces/special chars with hyphens, trims edges.
 */
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}