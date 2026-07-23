import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Applies generated Drizzle migrations. Run with: npm run db:migrate
 * Use the DIRECT (non-pooled) Supabase connection string for DDL.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("Running migrations…");
  await migrate(db, { migrationsFolder: "lib/db/migrations" });
  console.log("Migrations complete.");

  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
