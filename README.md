# fatsees-overview

Single-page live team dashboard for the Fatsees build. Everyone edits the
same document in the browser; edits sync via Vercel KV so what one dev
saves, every other dev sees on refresh.

## Stack

- `index.html` — the whole UI (dark-theme dashboard, edit mode, dropdown
  dev picker, priority reorder, add/remove cards, Export/Import). No
  framework, no build step.
- `api/state.js` — Vercel serverless function. `GET` returns the current
  state blob, `POST` overwrites it.
- Vercel KV — persistent shared store. localStorage is kept only as an
  offline / API-down fallback.

## First deploy setup

1. Import repo into Vercel (or `vercel link` from CLI).
2. Vercel Dashboard → **Storage** → **Create KV Database** → link to
   this project. Vercel auto-populates the `KV_*` env vars.
3. Redeploy. The store is now live at `/api/state`.

## Edit flow

Open the URL. Click **✎ Edit**. Rename portals, switch dev via dropdown,
bump percentages, drag priority order, mark cards Done. Every change
auto-saves (400ms debounce) to KV. Other devs refresh and see it.