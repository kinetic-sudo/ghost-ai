import { PrismaClient } from "@/app/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  return new PrismaClient({
    // Prisma Postgres (pooled.db.prisma.io) uses accelerateUrl
    accelerateUrl: process.env.DATABASE_URL!,
  }).$extends(withAccelerate()) as unknown as PrismaClient;
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createClient();
}

const prisma = globalForPrisma.prisma;

export default prisma;