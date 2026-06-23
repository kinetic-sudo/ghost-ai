export async function register() {
    // Only run on the Node.js runtime (not the Edge runtime).
    if (process.env.NEXT_RUNTIME === "nodejs") {
      const { initPrisma } = await import("@/lib/prisma");
      await initPrisma();
    }
  }