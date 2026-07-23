# Traxxia — Strategic Agenda (front-end)

A personal agenda app built on the **S.T.R.A.T.E.G.I.C.** framework
(*Mentalidad Estratégica 2.0*). Every block of your day is tagged to the pillar
it serves — Strategies, Tactics, Resources, Analytics and Data, Technology,
Execution, Governance, Innovation, Culture — so you can see at a glance whether
your calendar is actually serving your strategy.

A second tab tracks **strategic bets** (owner, hypothesis, expected result,
status, due date) organized under the same nine pillars.

## Stack

- React 18 + Vite
- Talks to the [traxxia-api](../traxxia-api) Express/SQLite backend

## Getting started

```bash
# 1. Start the API (in traxxia-api)
npm install && npm start        # http://localhost:4000

# 2. Start the front-end (in this repo)
npm install && npm run dev      # http://localhost:5173
```

To point at a different API, set `VITE_API_URL` (defaults to `http://localhost:4000`).

## Features

**My Agenda (default tab)**
- Daily agenda with date navigation, time slots, and done checkboxes
- Each item tagged to the STRATEGIC pillar it serves (or "no pillar")
- **"Where your time goes"** — a live bar showing scheduled time split across
  pillars, with un-strategic time called out

**Strategic Bets**
- Pillar board with all 9 STRATEGIC pillars and their bets at a glance
- Create/edit bets with owner, hypothesis, expected result, due date, notes
- Status tracking: Idea → Planned → In Progress → At Risk → Done, changeable inline
- Editable pillar wording (✎) — though it now ships with the model's official definitions
