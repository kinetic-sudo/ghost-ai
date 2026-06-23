import { PrismaClient } from "../app/generated/prisma";

// ---------------------------------------------------------------------------
// Cache the client on globalThis so it survives hot-reloads in development.
// In production the module is evaluated once, so this is a no-op.
// ---------------------------------------------------------------------------

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

async function createClient(): Promise<PrismaClient> {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("prisma+postgres://")) {
    // Prisma Accelerate — HTTP transport, no pg adapter needed.
    const { withAccelerate } = await import("@prisma/extension-accelerate");
    return new PrismaClient().$extends(
      withAccelerate(),
    ) as unknown as PrismaClient;
  }

  // Direct PostgreSQL via the pg adapter.
  const { Pool } = await import("pg");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function initPrisma(): Promise<void> {
  if (globalForPrisma.prisma) return;
  globalForPrisma.prisma = await createClient();
}

// Synchronous fallback for module-level imports.
// initPrisma() (called from instrumentation.ts) replaces this with the
// correctly-adapted client before any request is handled.
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma;

export default prisma;