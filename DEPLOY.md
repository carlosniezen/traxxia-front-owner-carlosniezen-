# Deploy — Traxxia Personal (live demo on Vercel)

Goal: a shareable URL with a one-click **"Entrar como demo"** account. ~15 min.

---

## 1. Create a Supabase project

1. [supabase.com](https://supabase.com) → **New project**. Pick a region near your team.
2. Wait for it to provision, then collect (Settings → API and Settings → Database):
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, secret)
   - Database → Connection string → **URI** (direct, with your password) → `DATABASE_URL`
3. **Authentication → URL Configuration**
   - Site URL: your Vercel URL (add after step 3), e.g. `https://traxxia.vercel.app`
   - Redirect URLs: add `https://YOUR-APP.vercel.app/**` and `http://localhost:3000/**`
4. **Authentication → Providers → Email**: keep **Email** enabled (magic link uses it;
   the demo account uses email+password, which is on by default).

## 2. Apply schema + seed (from your machine, once)

```bash
cp .env.example .env.local          # fill in the 4 Supabase values above
npm install
npm run db:migrate                  # tables + RLS + auth→users trigger
npm run db:seed                     # the 9 dimensions
npm run db:seed:demo                # demo account + rich data (Norte, bets, today, a diagnostic)
```

`db:seed:demo` creates the demo auth user via the Supabase admin API using
`SUPABASE_SERVICE_ROLE_KEY`, with the password from `DEMO_PASSWORD`. Re-running it
wipes and reseeds the demo content (idempotent).

## 3. Deploy to Vercel

1. Push this branch and import the repo at [vercel.com/new](https://vercel.com/new)
   (Framework preset: **Next.js**, auto-detected).
2. **Environment Variables** — add all of these (Production + Preview):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (secret) |
   | `DATABASE_URL` | from Supabase (direct URI) |
   | `NEXT_PUBLIC_SITE_URL` | your Vercel URL |
   | `NEXT_PUBLIC_DEMO_ENABLED` | `1` |
   | `DEMO_EMAIL` | `demo@traxxia.app` |
   | `DEMO_PASSWORD` | a strong string (same one used in step 2) |

3. Deploy. Then go back to Supabase **Auth → URL Configuration** and make sure the
   Site URL + redirect URL match the final Vercel domain.

## 4. Demo it

Open the Vercel URL → `/login` → **Entrar como demo** → lands in a populated account:
Hoy (with coherencia % + chain), Año (9 bets), Trimestre, **Horizontes** (the maestra
view), **Coherencia** (radar), **Diagnóstico** (results). No email wait.

To show the real onboarding, use the magic-link form with a teammate's email.

---

### Notes
- **Connection pooling**: for serverless (Vercel), you can point `DATABASE_URL` at
  Supabase's **transaction pooler** (port 6543) for the app and keep the **direct**
  URL for `db:migrate`. The current `postgres-js` client sets `prepare: false`, which
  is pooler-safe.
- **Turn the demo off** for a real launch: set `NEXT_PUBLIC_DEMO_ENABLED=0` (hides the
  button) and remove the demo user.
