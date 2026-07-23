# BienTomado — front-end

Mobile-first React app for **BienTomado**: register what you drink, learn how it
treats *you* (cruda, estómago, sueño, congestión), and get better choices — to
drink **less and better**, not to drink more without consequences. It is **not**
an addiction-treatment app.

## Stack

- React 18 + Vite
- Talks to the [BienTomado API](../traxxia-api) (Express/SQLite)

## Getting started

```bash
# 1. Start the API (in traxxia-api)
npm install && npm start        # http://localhost:4000

# 2. Start the front-end (this repo)
npm install && npm run dev      # http://localhost:5173
```

Point at a different API with `VITE_API_URL` (defaults to `http://localhost:4000`).

## Screens (`src/`)

- **Onboarding** (`Onboarding.jsx`) — 3 steps: sensitivities, goal, optional weekly
  unit goal. Includes the "not a treatment app" disclaimer.
- **Registrar** (`LogView.jsx`) — tap a category → quick sheet → confirm (≤2 taps).
- **Check-in matutino** (`CheckinView.jsx`) — 4 sliders (cabeza, estómago, sueño,
  energía) + optional congestion, surfaced by a morning banner.
- **¿Qué tomo hoy?** (`RecommendView.jsx`) — occasion + what's available → the pick
  that suits you with a moderate amount, what to avoid and why, a NoLo alternative,
  and mitigation tips.
- **Mi semana** (`DashboardView.jsx`) — units vs goal, 4-week trend, personal
  best/worst ranking, a highlighted insight, alcohol-free streak, and the care
  message shown on a risk pattern.

## Design notes

Calm teal accent (moderation, not indulgence). No badges for drinking; the only
streak celebrated is alcohol-free days. Copy is in Spanish; the tone is empathetic
and never punitive.
