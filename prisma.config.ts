import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

function loadEnvLocal(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return {};

  const result: Record<string, string> = {};
  const content = fs.readFileSync(envPath, "utf-8");

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const raw = trimmed.slice(eqIndex + 1).trim();
    const value = raw.replace(/^(['"])(.*)\1$/, "$2");
    result[key] = value;
  }

  return result;
}

const localEnv = loadEnvLocal();
const databaseUrl = process.env["DATABASE_URL"] ?? localEnv["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL not found in environment or .env.local");
}

export default defineConfig({
  schema: "prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});