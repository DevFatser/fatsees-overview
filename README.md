# fatsees-overview

Single-page live team dashboard for the Fatsees build. Everyone edits the
same document in the browser; edits sync via **Supabase Realtime** so
what one dev saves, every other dev sees **without refreshing**.

## Stack

- **`index.html`** — markup only. Sidebar nav, hero stats, four sections
  (Done / In progress / Planned / Priority), inline editing, dev-picker
  dropdown, Export/Import. No framework, no build step.
- **`styles.css`** — design tokens + all component styling.
- **`app.js`** — Supabase client, seed data, render + edit logic, Realtime
  subscription.
- **Supabase Postgres** — the shared store. Single row in one table
  (`overview_state`) holds the whole state blob as `jsonb`. Realtime
  subscription pushes changes to every open browser.
- **Netlify** — static hosting. Push to `main` → auto-deploys.

## First-time Supabase setup (do once)

1. Open your Supabase project (the Fatsees `dev` branch is fine).
2. **SQL Editor** → run:
   ```sql
   create table overview_state (
     id         text primary key,
     data       jsonb,
     updated_at timestamptz default now()
   );
   alter table overview_state enable row level security;
   create policy "anyone can read overview" on overview_state
     for select using (true);
   create policy "anyone can write overview" on overview_state
     for insert with check (true);
   create policy "anyone can update overview" on overview_state
     for update using (true);
   -- Enable realtime so subscriptions fire on changes
   alter publication supabase_realtime add table overview_state;
   ```
3. **Settings → API** → copy the **Project URL** + **anon public key**.
4. Open `app.js`, paste them into the two constants at the top:
   ```js
   const SUPABASE_URL = 'https://...supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOi...';
   ```
   *(Already baked in for the Fatsees dev branch — no action needed.)*

## Deploy to Netlify

- Simplest: `https://app.netlify.com/drop` → drag this folder → get a
  URL in 5 seconds.
- Long-term: **Add new site → Import from Git → GitHub → DevFatser/
  fatsees-overview**. Every push to `main` re-deploys automatically.

Netlify handles static file serving; no build config needed beyond
`netlify.toml` (already in the repo).

## Edit flow

Open the URL. Click **✎ Edit**. Rename portals, switch dev via dropdown,
bump percentages, reorder priority, mark cards Done. Every change
auto-saves (400ms debounce) to Supabase. Anyone else with the page open
sees your change **live** — no refresh needed (Realtime).

## Team roster

Fixed: Shafi, Victor, Apple, Nahid. The dev-picker dropdown on every card
maps to these four. To change the roster, edit `SEED.devs` in `app.js`
and reset (menu → Reset to seed).

## Reset / Export / Import

Menu (`⋯` button in the header):
- **Export JSON** — downloads the whole state as a backup.
- **Import JSON** — re-loads a backup (overwrites shared state).
- **Reset to seed** — nukes the shared state back to the hard-coded seed
  in `index.html`. Confirmation required.
