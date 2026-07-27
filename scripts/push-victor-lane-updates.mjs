// One-shot: fetch the current overview_state row from Supabase, patch
// Victor's lane cards + append the save-protection card, upsert back
// with updated_by = 'Victor'. Realtime channel pushes the change to
// any open portal tab within ~200ms.
//
// Safe by design:
//   - fetches BEFORE patching (never blind-writes)
//   - shows before/after diff of Victor's cards
//   - only touches Victor's block + adds one new card to Victor's
//     in_progress list; other devs untouched
//   - CAS on updated_at (Victor 2026-07-28) — mirrors app.js
//     performSave() so a re-run cannot silently clobber edits made in
//     the web UI between the fetch here and the PATCH. On CAS miss
//     the script re-fetches, re-applies the deltas (Object.assign +
//     idempotent append), and retries once. Second miss aborts with
//     a clear message so the human decides.

const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

// Deltas — bump progress + rewrite notes based on today's work.
const UPDATES = new Map([
  // portal-title → { pct, note, fe, be }
  ['jobs',
    {
      pct: 99, fe: 'prog', be: 'prog',
      note: 'Dark mode + Fat Hero rewired via bubble (3 lanes: filter inline / nav via bubble confirm / answer via bubble) + CV upload/parse with Experience field + PG scrubber for text answers. Awaiting post-a-job end-to-end test.',
      estimate_days: 1,
    },
  ],
  ['/eiendom + /leie + /leie-eiendom',
    {
      pct: 95, fe: 'prog', be: 'prog',
      note: 'Dark mode + Fat Hero PG-parity across all three (SEARCH / NAVIGATE / TEXT via bubble). Fat search chip on /eiendom. End-to-end Fat AI + Mollie test still pending.',
      estimate_days: 1,
    },
  ],
  ['Main branch launch tasks',
    {
      pct: 98, fe: 'prog', be: 'prog',
      note: 'Prod migrations 0157–0179 + 0180 (some_subscriptions.updated_at) all landed on main + dev, schema.ts in sync. Massive dark-mode sweep (~350 files, ~2700 substitutions) pushed. PR bundle for Shafi to merge.',
      estimate_days: 1,
    },
  ],
]);

// NEW card — Audun's ask on the fatsees-overview save-protection.
const NEW_CARD = {
  portal: 'fatsees-overview save-protection',
  note: 'Audun 2026-07-25 ask — optimistic locking via updated_at CAS + client-side merge on conflict. Two devs editing different cards → both preserved. Same field within the retry window → last-write-wins + history entry tagged "merge conflict" so nothing silently disappears. Realtime already subscribed for the "someone else edited" toast.',
  pct: 0,
  fe: 'todo',
  be: 'todo',
  estimate_days: 1,
  target_date: '2026-07-28', // Mon
};

function log(label, obj) {
  console.log(`\n== ${label} ==`);
  console.log(JSON.stringify(obj, null, 2));
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

// Fetch the row. Returns { data, updated_at } or exits.
async function fetchRow() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/overview_state?id=eq.${STATE_ROW_ID}&select=data,updated_at`,
    { headers },
  );
  if (!res.ok) {
    console.error('Fetch failed:', res.status, await res.text());
    process.exit(1);
  }
  const rows = await res.json();
  if (!Array.isArray(rows) || !rows[0]?.data) {
    console.error('Row not found. Aborting.');
    process.exit(1);
  }
  return { data: rows[0].data, updated_at: rows[0].updated_at };
}

// Apply the deltas idempotently to a fresh copy of the state.
// Both operations are safe to re-run on a CAS-retry:
//   - Object.assign into a card by portal-name is idempotent
//   - the NEW_CARD append is guarded by a portal-name existence check
function applyDeltas(remote) {
  const devs = Array.isArray(remote.developers) ? remote.developers : [];
  const victor = devs.find((d) => d.name === 'Victor');
  if (!victor) {
    console.error('Victor block missing from state. Aborting.');
    process.exit(1);
  }
  const inprog = Array.isArray(victor.in_progress) ? victor.in_progress : [];
  for (const card of inprog) {
    const patch = UPDATES.get(card.portal);
    if (!patch) continue;
    Object.assign(card, patch);
  }
  const hasSaveProtection = inprog.some((c) => c.portal === NEW_CARD.portal);
  if (!hasSaveProtection) {
    inprog.push({ id: crypto.randomUUID(), ...NEW_CARD });
  }
  victor.in_progress = inprog;
  return victor;
}

// CAS-guarded PATCH. Returns the new updated_at on success, or null
// on CAS miss (row was updated between fetch and write — PostgREST
// returns an empty array because the updated_at filter matched nothing).
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
  if (!res.ok) {
    console.error('\nUpsert failed:', res.status, await res.text());
    process.exit(1);
  }
  const returned = await res.json();
  if (!Array.isArray(returned) || returned.length === 0) return null;
  return returned[0].updated_at;
}

// 1. Fetch → apply → CAS-PATCH → retry once on miss.
let attempt = 0;
while (true) {
  attempt += 1;
  const { data: remote, updated_at: baseUpdatedAt } = await fetchRow();
  console.log(`Fetched row (attempt ${attempt}, updated_at=${baseUpdatedAt}).`);

  const beforeSnapshot = attempt === 1
    ? JSON.parse(JSON.stringify(
        (remote.developers || []).find((d) => d.name === 'Victor')?.in_progress ?? [],
      ))
    : null;

  applyDeltas(remote);
  remote.updated = new Date().toISOString();
  remote.updated_by = 'Victor';

  if (beforeSnapshot) {
    log('BEFORE (Victor.in_progress)', beforeSnapshot);
    const victorAfter = (remote.developers || []).find((d) => d.name === 'Victor');
    log('AFTER  (Victor.in_progress)', victorAfter?.in_progress ?? []);
  }

  const newUpdatedAt = await casPatch(baseUpdatedAt, remote);
  if (newUpdatedAt) {
    console.log(`\nUpsert OK (attempt ${attempt}). New updated_at=${newUpdatedAt}`);
    break;
  }

  if (attempt >= 2) {
    console.error(
      '\nCAS miss after retry — the row changed twice while this script was running. ' +
      'Aborting rather than clobber. Re-run the script; if it keeps failing, ' +
      'coordinate with whoever is actively editing the BO.',
    );
    process.exit(2);
  }
  console.log('\nCAS miss — someone edited the row between fetch and PATCH. Re-fetching + retrying once.');
}
