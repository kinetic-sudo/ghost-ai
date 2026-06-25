// Shared project type used across server and client.
// Matches the shape returned by the API routes (select subset of Prisma model).
export interface Project {
    id: string;
    name: string;
    description: string | null;
    status: "DRAFT" | "ARCHIVED";
    canvasJsonPath: string | null;
    createdAt: string; // serialised as ISO string over the wire
    updatedAt: string;
    // role is derived from context (owned vs collaborator), not stored on model
    role: "owner" | "collaborator";
  }