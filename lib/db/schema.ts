import {
  pgTable,
  pgEnum,
  uuid,
  text,
  jsonb,
  integer,
  boolean,
  timestamp,
  date,
  primaryKey,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*  Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const localeEnum = pgEnum("locale", ["es", "en"]);
export const horizonKindEnum = pgEnum("horizon_kind", [
  "life",
  "decade",
  "year",
  "quarter",
  "month",
  "week",
  "day",
]);
export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "abandoned",
]);
export const diagnosticScopeEnum = pgEnum("diagnostic_scope", [
  "personal",
  "enterprise",
]);
export const templateKindEnum = pgEnum("template_kind", [
  "quarterly_review",
  "annual_planning",
  "weekly_review",
  "decision_filter",
]);

/* -------------------------------------------------------------------------- */
/*  users — extends Supabase auth.users (id === auth.uid())                    */
/* -------------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  locale: localeEnum("locale").notNull().default("es"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  norte — one row per user (their personal constitution)                     */
/* -------------------------------------------------------------------------- */

export const norte = pgTable("norte", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  proposito: text("proposito"),
  valores: jsonb("valores").$type<string[]>().notNull().default([]),
  vision75: text("vision_75"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  horizons — temporal hierarchy                                             */
/* -------------------------------------------------------------------------- */

export const horizons = pgTable("horizons", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kind: horizonKindEnum("kind").notNull(),
  label: text("label").notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  dimensions — the 9 S.T.R.A.T.E.G.I.C. letters (global, seeded)            */
/* -------------------------------------------------------------------------- */

export const dimensions = pgTable("dimensions", {
  id: text("id").primaryKey(),
  letter: text("letter").notNull(),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  blurbEs: text("blurb_es"),
  blurbEn: text("blurb_en"),
  color: text("color").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
});

/* -------------------------------------------------------------------------- */
/*  goals — universal unit (norte, annual bet, quarterly outcome, today...)   */
/* -------------------------------------------------------------------------- */

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  horizonId: uuid("horizon_id")
    .notNull()
    .references(() => horizons.id, { onDelete: "cascade" }),
  parentGoalId: uuid("parent_goal_id").references(
    (): AnyPgColumn => goals.id,
    { onDelete: "set null" },
  ),
  title: text("title").notNull(),
  description: text("description"),
  status: goalStatusEnum("status").notNull().default("active"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  goal_dimensions — many-to-many between goals and dimensions               */
/* -------------------------------------------------------------------------- */

export const goalDimensions = pgTable(
  "goal_dimensions",
  {
    goalId: uuid("goal_id")
      .notNull()
      .references(() => goals.id, { onDelete: "cascade" }),
    dimensionId: text("dimension_id")
      .notNull()
      .references(() => dimensions.id, { onDelete: "cascade" }),
    weight: integer("weight").notNull().default(1),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.goalId, t.dimensionId] }),
  }),
);

/* -------------------------------------------------------------------------- */
/*  diagnostics — S.T.R.A.T.E.G.I.C. snapshots over time                      */
/* -------------------------------------------------------------------------- */

export const diagnostics = pgTable("diagnostics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scope: diagnosticScopeEnum("scope").notNull().default("personal"),
  scores: jsonb("scores").$type<Record<string, number>>().notNull(),
  answers: jsonb("answers").$type<Record<string, number>>().notNull(),
  takenAt: timestamp("taken_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  templates — saved templates (system-only in v0)                          */
/* -------------------------------------------------------------------------- */

export const templates = pgTable("templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  kind: templateKindEnum("kind").notNull(),
  structure: jsonb("structure").$type<Record<string, unknown>>().notNull(),
  isSystem: boolean("is_system").notNull().default(true),
});

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                            */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type Norte = typeof norte.$inferSelect;
export type NewNorte = typeof norte.$inferInsert;
export type Horizon = typeof horizons.$inferSelect;
export type Dimension = typeof dimensions.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type GoalDimension = typeof goalDimensions.$inferSelect;
export type Diagnostic = typeof diagnostics.$inferSelect;
export type Template = typeof templates.$inferSelect;
