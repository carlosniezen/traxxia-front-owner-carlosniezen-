# MiTienda — Storefront + Admin (front-end)

A [MiTienda.pe](https://mitienda.pe)-style online store: a branded customer
**storefront** and a merchant **admin panel**, in one React app.

Built with **React 18 + Vite**. Talks to the
[`mitienda` API](../../traxxia-api/mitienda) (Express + SQLite).

## Getting started

```bash
# 1. Start the API (in traxxia-api/mitienda)
cd ../../traxxia-api/mitienda && npm install && npm start   # http://localhost:4100

# 2. Start this app
npm install && npm run dev                                  # http://localhost:5174
```

Point at a different API with `VITE_API_URL` (defaults to `http://localhost:4100`).

## What's inside

**Storefront** (`src/storefront/`)
- Branded header/footer that pick up the merchant's store name, logo and colors
- Home with hero, category chips, search and a responsive product grid
- Product detail with quantity selector, sale price and stock
- Cart (persisted in `localStorage`) and a checkout with coupon codes,
  shipping calculation and multiple payment methods
- Order confirmation

**Admin panel** (`src/admin/`, route `#/admin`)
- Token-based login (demo: `admin@mitienda.pe` / `admin123`)
- Dashboard with sales/orders/stock stats and recent orders
- Product management (create/edit/delete, inventory, featured, visibility)
- Orders list with inline status changes and an order-detail view
- Coupons (percentage or fixed amount, minimum purchase)
- Store settings — name, tagline, logo, brand colors, currency and contact

## Architecture notes
- Tiny hash-based router (`#/`, `#/product/:slug`, `#/admin/...`) — no router
  dependency, only React.
- Brand colors are applied as CSS variables from the store settings, so
  changing them in the admin instantly re-themes the storefront.
- Prices travel as integer **cents** and are formatted for display in `lib.jsx`.
- Standalone project inside the repo — independent of the existing Traxxia
  agenda front-end.
