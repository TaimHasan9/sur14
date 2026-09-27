import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@/db";
import path from "path";

export async function runMigrations() {
  const migrationsFolder = path.join(process.cwd(), "drizzle");
  await migrate(db, { migrationsFolder });
  return { ok: true, migrationsFolder };
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("✅ Database migrations applied successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed:", err);
      process.exit(1);
    });
}
