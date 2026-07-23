/**
 * Seeds a fully-populated demo account for the "Entrar como demo" experience.
 *
 *   npm run db:seed:demo
 *
 * Requires DATABASE_URL. If SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
 * are set, the auth user is (re)created via the Supabase admin API with a real
 * password (so password sign-in works). Otherwise a fixed demo id is inserted
 * directly into auth.users (local dev / verification only).
 *
 * Idempotent: wipes the demo user's content and reseeds.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import {
  users,
  norte,
  horizons,
  goals,
  goalDimensions,
  diagnostics,
} from "./schema";
import { standardPeriods } from "../horizons";
import { QUESTIONS } from "../questions";

const FIXED_DEMO_ID = "00000000-0000-4000-8000-000000000001";
const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@traxxia.app";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "traxxia-demo-2026";

// Target Likert level (1–5) per dimension → drives the demo diagnostic.
const LEVELS: Record<string, number> = {
  S: 5,
  T1: 3,
  R: 4,
  A: 4,
  T2: 4,
  E: 2,
  G: 3,
  I: 5,
  C: 4,
};

async function resolveDemoUserId(sql: postgres.Sql): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Remove any existing demo user, then recreate with a known password.
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
    if (existing) await admin.auth.admin.deleteUser(existing.id);
    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Carlos (demo)" },
    });
    if (error || !data.user) throw error ?? new Error("createUser failed");
    return data.user.id;
  }

  // Local fallback: insert directly into the auth.users shim.
  await sql`insert into auth.users (id, email) values (${FIXED_DEMO_ID}, ${DEMO_EMAIL}) on conflict (id) do nothing`;
  return FIXED_DEMO_ID;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);

  const userId = await resolveDemoUserId(sql);

  await db
    .insert(users)
    .values({ id: userId, email: DEMO_EMAIL, fullName: "Carlos (demo)" })
    .onConflictDoNothing();

  // Reset content (idempotent reseed).
  await db.delete(goals).where(eq(goals.userId, userId));
  await db.delete(horizons).where(eq(horizons.userId, userId));
  await db.delete(norte).where(eq(norte.userId, userId));
  await db.delete(diagnostics).where(eq(diagnostics.userId, userId));

  // Norte
  await db.insert(norte).values({
    userId,
    proposito:
      "Construir instituciones que sobrevivan a sus fundadores y liberen el potencial de quienes las habitan.",
    valores: [
      "Honestidad intelectual",
      "Largo plazo",
      "Templanza",
      "Generosidad",
      "Coraje",
    ],
    vision75:
      "A los 75 miro atrás sin arrepentimientos: una familia unida, un puñado de personas cuya vida cambió porque nos cruzamos, y la calma de haber jugado mi juego, no el de otros.",
  });

  // Horizons
  const periods = standardPeriods();
  const hById: Record<string, string> = {};
  for (const p of periods) {
    const [h] = await db
      .insert(horizons)
      .values({
        userId,
        kind: p.kind,
        label: p.label,
        startDate: p.startDate,
        endDate: p.endDate,
      })
      .returning({ id: horizons.id, kind: horizons.kind });
    if (h) hById[h.kind] = h.id;
  }

  async function addGoal(
    horizonId: string,
    title: string,
    dims: string[],
    parentGoalId?: string,
    completed?: boolean,
  ) {
    const [g] = await db
      .insert(goals)
      .values({
        userId,
        horizonId,
        title,
        parentGoalId,
        status: completed ? "completed" : "active",
        completedAt: completed ? new Date() : null,
      })
      .returning({ id: goals.id });
    if (g && dims.length) {
      await db
        .insert(goalDimensions)
        .values(dims.map((d) => ({ goalId: g.id, dimensionId: d })));
    }
    return g!.id;
  }

  // Annual bets — one per dimension
  const year = hById.year!;
  const betSentido = await addGoal(
    year,
    "Vivir cada trimestre alineado a un propósito escrito y revisado",
    ["S"],
  );
  await addGoal(year, "Recuperar el estado físico de mis 30", ["E"]);
  const betInnov = await addGoal(
    year,
    "Lanzar Traxxia a 50 usuarios beta del círculo cercano",
    ["I", "S"],
  );
  await addGoal(year, "Cerrar el fondo con 3 LPs ancla", ["G", "R"]);
  await addGoal(year, "Un viaje largo con la familia, sin pantallas", ["R"]);
  await addGoal(year, "Dominar la asignación de mi tiempo por temas", ["T1"]);
  await addGoal(year, "Desarrollar a 2 líderes que puedan reemplazarme", ["T2"]);
  await addGoal(year, "Instaurar un ritual mensual de autoevaluación", ["A"]);
  await addGoal(year, "Decidir siempre desde mis valores, aun bajo presión", [
    "C",
  ]);

  // Quarterly outcomes
  const quarter = hById.quarter!;
  const outEntrevistas = await addGoal(
    quarter,
    "10 entrevistas de descubrimiento con betas",
    ["I", "R"],
    betInnov,
  );
  await addGoal(
    quarter,
    "Diagnóstico S.T.R.A.T.E.G.I.C. propio, con plan de brechas",
    ["A"],
    betSentido,
  );
  await addGoal(quarter, "Rutina de sueño de 7h, 6 días de 7", ["E"]);

  // Week
  const week = hById.week!;
  const wkGuion = await addGoal(
    week,
    "Guion de entrevista validado con 2 asesores",
    ["I"],
    outEntrevistas,
  );

  // Today's priorities
  const day = hById.day!;
  await addGoal(day, "Escribir el guion de entrevista", ["I"], wkGuion);
  await addGoal(
    day,
    "Bloquear 2h en agenda para llamadas beta",
    ["T1"],
    outEntrevistas,
  );
  await addGoal(day, "Caminar 30 minutos al mediodía", ["E"]);

  // A diagnostic snapshot
  const scores: Record<string, number> = {};
  const answers: Record<string, number> = {};
  for (const q of QUESTIONS) {
    const level = LEVELS[q.dimensionId] ?? 3;
    answers[q.id] = level;
  }
  for (const dim of Object.keys(LEVELS)) {
    scores[dim] = Math.round(((LEVELS[dim]! - 1) / 4) * 100);
  }
  await db.insert(diagnostics).values({
    userId,
    scope: "personal",
    scores,
    answers,
  });

  console.log(`Demo account seeded: ${DEMO_EMAIL} (${userId})`);
  await sql.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
