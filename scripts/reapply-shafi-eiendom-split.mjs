// One-shot: re-apply Shafi's 2026-07-29 11:21 split of Victor's
// combined test card into three portal-specific cards (/leie,
// /eiendom, /leie-eiendom). Nahid's stale tab at 19:11 reverted the
// split by opaque-array merging Shafi's realtime push out of local
// state; the stale-tab defense (BUNDLE_VERSION guard) prevents
// re-occurrence but the historical revert still needs undoing.
//
// This script:
//   1. Removes the old combined card
//      "Test: fatai,mollie,e2e - /eiendom + /leie + /leie-eiendom"
//   2. Adds three new cards owned by Victor with the fields Shafi
//      left them at, matching his screenshot exactly.
//   3. Stamps data.app_version = '2026-07-29-1' so the write carries
//      the current bundle version and stale tabs correctly detect it.
//
// Idempotent — re-running is a no-op once the split is in place.
// CAS-safe — mirrors the sibling script pattern.

const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';
const OLD_CARD_PORTAL = 'Test: fatai,mollie,e2e - /eiendom + /leie + /leie-eiendom';
const APP_VERSION = '2026-07-29-1';

// Three new cards Shafi added. Field values match his 2026-07-29
// screenshot exactly:
//   /leie          — 90%, 2 days, 2026-07-30, FE In prog, BE To do
//   /eiendom       — 90%, 1 day,  2026-08-07, FE In prog, BE To do
//   /leie-eiendom  —  0%, 1 day,  2026-08-07, FE In prog, BE To do
const NEW_CARDS = [
  {
    portal: '/leie',
    devs: ['Victor'],
    pct: 90,
    fe: 'prog',
    be: 'todo',
    estimate_days: 2,
    target_date: '2026-07-30',
    note: 'Testing remaining on: Fat ai, mollie, end-to-end test',
  },
  {
    portal: '/eiendom',
    devs: ['Victor'],
    pct: 90,
    fe: 'prog',
    be: 'todo',
    estimate_days: 1,
    target_date: '2026-08-07',
    note: 'Test: e2e, fat ai',
  },
  {
    portal: '/leie-eiendom',
    devs: ['Victor'],
    pct: 0,
    fe: 'prog',
    be: 'todo',
    estimate_days: 1,
    target_date: '2026-08-07',
    note: 'Test: fatai e2e',
  },
];

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

async function fetchRow() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/overview_state?id=eq.${STATE_ROW_ID}&select=data,updated_at`,
    { headers },
  );
  if (!res.ok) { console.error('Fetch failed:', res.status, await res.text()); process.exit(1); }
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]?.data) { console.error('Row not found. Aborting.'); process.exit(1); }
  return { data: rows[0].data, updated_at: rows[0].updated_at };
}

async function casPatch(baseUpdatedAt, nextData) {
  const nextUpdatedAt = new Date().toISOString();
  const url =
    `${SUPABASE_URL}/rest/v1/overview_state` +
    `?id=eq.${STATE_ROW_ID}` +
    `&updated_at=eq.${encodeURIComponent(baseUpdatedAt)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ data: nextData, updated_at: nextUpdatedAt }),
  });
  if (!res.ok) { console.error('\nUpsert failed:', res.status, await res.text()); process.exit(1); }
  const returned = await res.json();
  if (!Array.isArray(returned) || returned.length === 0) return null;
  return returned[0].updated_at;
}

let attempt = 0;
while (true) {
  attempt += 1;
  const { data: remote, updated_at: baseUpdatedAt } = await fetchRow();
  const progress = Array.isArray(remote.progress) ? remote.progress : [];

  // 1. Delete the old combined card (if it exists).
  const oldIdx = progress.findIndex((c) => c.portal === OLD_CARD_PORTAL);
  const oldRemoved = oldIdx !== -1;
  if (oldRemoved) progress.splice(oldIdx, 1);

  // 2. Add each new card if not already present (idempotent).
  const added = [];
  const skipped = [];
  for (const card of NEW_CARDS) {
    if (progress.some((c) => c.portal === card.portal)) {
      skipped.push(card.portal);
      continue;
    }
    progress.push({ id: crypto.randomUUID(), ...card });
    added.push(card.portal);
  }

  remote.progress = progress;
  remote.updated = new Date().toISOString();
  remote.updated_by = 'Victor (re-applying Shafi split)';
  remote.app_version = APP_VERSION;

  if (attempt === 1) {
    console.log(`Fetched row (updated_at=${baseUpdatedAt}).`);
    console.log(`Removed old card    : ${oldRemoved ? 'yes' : 'no (already gone)'}`);
    console.log(`Added new cards     : ${added.length ? added.join(', ') : '(none — all already present)'}`);
    if (skipped.length) console.log(`Skipped (already in): ${skipped.join(', ')}`);
    if (!oldRemoved && !added.length) {
      console.log('\nNothing to change — split already in place. Exiting clean.');
      process.exit(0);
    }
  }

  const newUpdatedAt = await casPatch(baseUpdatedAt, remote);
  if (newUpdatedAt) {
    console.log(`\nUpsert OK (attempt ${attempt}). New updated_at=${newUpdatedAt}`);
    break;
  }

  if (attempt >= 2) {
    console.error('\nCAS miss after retry — aborting rather than clobber. Re-run.');
    process.exit(2);
  }
  console.log('\nCAS miss — someone edited between fetch and PATCH. Re-fetching + retrying once.');
}
