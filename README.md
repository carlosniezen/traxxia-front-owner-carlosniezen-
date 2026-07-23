# Traxxia — Strategic Agenda (front-end)

A client-facing strategic agenda app built on the **S.T.R.A.T.E.G.I.C.** framework
(*Mentalidad Estratégica 2.0*). Strategic priorities are captured as **strategic
bets** — each with an owner, hypothesis, expected result, status and due date —
organized under the framework's nine pillars.

The nine pillar names/descriptions ship as editable defaults: click ✎ on any
pillar to align the wording with the model.

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

- **Pillar board** — all 9 STRATEGIC pillars with their bets at a glance
- **Strategic bets** — create/edit with owner, hypothesis, expected result, due date, notes
- **Status tracking** — Idea → Planned → In Progress → At Risk → Done, changeable inline
- **Summary bar** — portfolio counts by status
- **Editable framework wording** — rename pillars and descriptions in place
