# Traxxia Personal

> El sistema operativo estratégico del ejecutivo C-suite. Conecta **horizontes
> temporales** (Norte → Década → Año → Trimestre → Mes → Semana → Hoy) con el
> framework dimensional **S.T.R.A.T.E.G.I.C.** (versión personal: Sentido,
> Tiempo, Relaciones, Autoconocimiento, Talento, Energía, Gobierno, Innovación,
> Carácter).

El diferenciador no es la app en sí — es la **conexión entre horizonte y
dimensión**: cada prioridad diaria etiquetada revela en qué dimensiones estás
invirtiendo tiempo real.

---

## Estado — Fase 1 (Fundamentos)

Este repo contiene el MVP en construcción por fases (ver spec). **Fases 1 y 2**
están implementadas:

**Fase 1 — Fundamentos**
- ✅ Next.js 15 (App Router) + React 19 + TypeScript strict
- ✅ Tailwind CSS + componentes base estilo shadcn/ui
- ✅ Tipografía Fraunces (serif) + Manrope (sans) vía `next/font`
- ✅ Tema oscuro por default + toggle claro/oscuro (`next-themes`)
- ✅ Auth con **magic link** (Supabase) + middleware de sesión + gating de rutas
- ✅ Esquema Drizzle con **todas** las tablas del modelo de datos
- ✅ Migraciones + **RLS** + trigger `auth.users → public.users`
- ✅ Seed de las 9 dimensiones
- ✅ Landing pública + layout con navegación lateral (y nav móvil)
- ✅ **Vista Norte** editable con CRUD completo (propósito, valores, visión 75)

**Fase 2 — Horizontes y goals**
- ✅ Auto-creación de horizontes estándar (año, trimestre, mes, semana, hoy)
- ✅ CRUD de goals con dimensiones (1–3) y relación padre-hijo (`parent_goal_id`)
- ✅ **Vista Año** — apuestas anuales + dimensiones sin cubrir
- ✅ **Vista Trimestre** — outcomes conectados a apuestas, con progreso
- ✅ **Vista Hoy** — 3 prioridades, cadena hacia arriba, coherencia % y balance
  dimensional del día, alerta de "sin conexión estratégica"

Las vistas de fases posteriores (Semana, Mes, Horizontes, Coherencia,
Diagnóstico…) existen como placeholders navegables.

> Nota: la ruta del Año es `/dashboard/ano` (ASCII) para evitar el 404 de
> Next.js con segmentos no-ASCII codificados; la etiqueta visible sigue siendo
> "Año".

> Nota de arquitectura: el spec describe **una** app Next.js donde Supabase es el
> backend (Server Components consultan la base directo). Por eso todo el producto
> vive en este repo; el repo `traxxia-api` (Express + SQLite) queda superado por
> esta arquitectura.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 App Router · React 19 · TypeScript strict |
| Estilos | Tailwind CSS · componentes estilo shadcn/ui · lucide-react |
| Backend | Supabase (Auth magic link · Postgres · Row Level Security) |
| ORM | Drizzle ORM (driver `postgres-js`) |
| Fuentes | Fraunces (headings) · Manrope (UI/body) |
| Estado | Server Components para data · Zustand para client-state |
| Validación | Zod en endpoints y server actions |
| Deploy | Vercel |

---

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Rellena con los datos de tu proyecto Supabase (Settings → API y Settings →
Database). Ver `.env.example` para la lista completa.

### 3. Aplicar migraciones y seed

Usa la conexión **directa** (no el pooler) para DDL:

```bash
npm run db:migrate   # crea tablas, RLS, trigger de auth
npm run db:seed      # inserta las 9 dimensiones (idempotente)
```

> Alternativa: pega el contenido de `lib/db/migrations/*.sql` en el SQL Editor de
> Supabase, en orden.

### 4. Levantar la app

```bash
npm run dev          # http://localhost:3000
```

Entra en `/login`, pide el enlace mágico y ábrelo en el mismo dispositivo.

---

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run db:generate` | Genera SQL de migración desde el schema Drizzle |
| `npm run db:migrate` | Aplica migraciones |
| `npm run db:seed` | Seed de dimensiones |

---

## Estructura

```
app/
  layout.tsx            # fuentes + theme provider
  page.tsx              # landing pública
  login/                # magic link
  auth/confirm/         # verificación del OTP del enlace
  dashboard/
    layout.tsx          # shell con sidebar + nav móvil
    norte/              # ★ Vista Norte (CRUD, Fase 1)
    hoy|semana|...      # placeholders de fases posteriores
  settings/
lib/
  db/                   # schema, migraciones, seed, cliente Drizzle
  supabase/             # clientes server/browser/middleware
  dimensions.ts         # las 9 dimensiones (fuente de verdad)
  validations.ts        # esquemas Zod
  nav.ts                # config de navegación
components/
  ui/                   # primitivas estilo shadcn
  nav/                  # sidebar + mobile nav
docs/
  design-references.md  # dirección estética
```

### Nota sobre RLS y Drizzle

Drizzle se conecta con el rol dueño de Postgres, que **omite RLS**. Por eso toda
consulta de datos de usuario se **acota por `userId`** en código (obtenido de la
sesión Supabase autenticada). Las políticas RLS son la segunda línea de defensa
para cualquier acceso vía API pública de Supabase.

---

## Seguridad y privacidad

- Row Level Security activa en todas las tablas con `user_id` desde el día 1.
- El contenido del usuario (propósito, valores, prioridades) nunca se envía a
  analytics — solo eventos de uso agregado (a instrumentar con Posthog).
