-- Custom migration: link public.users to Supabase auth, enable RLS, add policies.
-- Safe to run on Supabase (auth schema exists there).

-- 1. Link public.users.id to auth.users(id) ---------------------------------
ALTER TABLE "users"
  ADD CONSTRAINT "users_id_auth_users_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
--> statement-breakpoint

-- 2. Auto-create a public.users row on signup -------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
--> statement-breakpoint

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
--> statement-breakpoint
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
--> statement-breakpoint

-- 3. Enable Row Level Security ----------------------------------------------
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "norte" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "horizons" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "goals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "goal_dimensions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "diagnostics" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "dimensions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

-- 4. users: a user can see/update only their own row ------------------------
CREATE POLICY "users_select_own" ON "users"
  FOR SELECT USING (auth.uid() = id);--> statement-breakpoint
CREATE POLICY "users_update_own" ON "users"
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);--> statement-breakpoint

-- 5. Owner-scoped tables (user_id = auth.uid()) -----------------------------
CREATE POLICY "norte_all_own" ON "norte"
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "horizons_all_own" ON "horizons"
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "goals_all_own" ON "goals"
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint
CREATE POLICY "diagnostics_all_own" ON "diagnostics"
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);--> statement-breakpoint

-- 6. goal_dimensions: scoped through the owning goal ------------------------
CREATE POLICY "goal_dimensions_all_own" ON "goal_dimensions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "goals" g
      WHERE g.id = goal_dimensions.goal_id AND g.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "goals" g
      WHERE g.id = goal_dimensions.goal_id AND g.user_id = auth.uid()
    )
  );--> statement-breakpoint

-- 7. Global read tables for any authenticated user --------------------------
CREATE POLICY "dimensions_read_all" ON "dimensions"
  FOR SELECT TO authenticated USING (true);--> statement-breakpoint
CREATE POLICY "templates_read_system" ON "templates"
  FOR SELECT TO authenticated USING (is_system = true);
