import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { dimensions } from "./schema";
import { DIMENSIONS } from "../dimensions";

/**
 * Seeds the 9 S.T.R.A.T.E.G.I.C. dimensions. Idempotent (upsert on id).
 * Run with: npm run db:seed
 */
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("Seeding dimensions…");
  for (const d of DIMENSIONS) {
    await db
      .insert(dimensions)
      .values({
        id: d.id,
        letter: d.letter,
        nameEs: d.nameEs,
        nameEn: d.nameEn,
        blurbEs: d.blurbEs,
        blurbEn: d.blurbEn,
        color: d.color,
        orderIndex: d.orderIndex,
      })
      .onConflictDoUpdate({
        target: dimensions.id,
        set: {
          letter: d.letter,
          nameEs: d.nameEs,
          nameEn: d.nameEn,
          blurbEs: d.blurbEs,
          blurbEn: d.blurbEn,
          color: d.color,
          orderIndex: d.orderIndex,
        },
      });
  }
  console.log(`Seeded ${DIMENSIONS.length} dimensions.`);

  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
