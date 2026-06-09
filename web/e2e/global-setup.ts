import { execSync } from "node:child_process";

// Runs once before the E2E suite: push the schema and seed the DB so the live
// app (auth + DB-wired screens) has data. Requires Postgres reachable
// (DATABASE_URL in .env). Start it with: docker compose up -d db
export default function globalSetup() {
  execSync("npx prisma db push --skip-generate --accept-data-loss", { stdio: "inherit" });
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
}
