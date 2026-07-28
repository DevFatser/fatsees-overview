// One-shot: update EST days + TARGET on all of Victor's in-progress
// cards on the Build Overview board. Response to Audun 2026-07-28
// #all-teams-general-chat ping: "I need those estimates on timeline
// today! Update now."
//
// Data-shape note (Victor 2026-07-28 audit).
// Supabase overview_state.data is stored SECTION-first:
//   { devs: [...], progress: [card,...], done: [...], planned: [...],
//     priority: [...], updated, updated_by, events }
// Each card carries `{ id, portal, devs: ['Victor', ...], pct, fe, be,
//                       note, estimate_days, target_date }`.
// The DEV-first shape `{ developers: [{ name, in_progress[]... }] }`
// only exists at read-time in netlify/functions/state.js, which
// reshapes on the fly for Audun's reporter. An earlier version of
// the sibling push script targeted the reader shape and aborted
// with "Victor block missing" — never actually wrote. Same trap
// avoided here by walking data.progress[] and filtering
// `card.devs?.includes('Victor') || card.dev === 'Victor'`.
//
// CAS-safe (mirrors app.js performSave):
//   - fetches BEFORE patching (never blind-writes)
//   - PATCH with ?updated_at=eq.{baseUpdatedAt} filter
//   - PostgREST returns [] on CAS miss; we re-fetch, re-apply
//     (idempotent), retry once
//   - Second miss aborts with a clear message rather than clobber
//
// Only touches cards Victor owns; other devs untouched.

const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

// Card portal → { estimate_days, target_date }.
// Portal names MUST match exactly what's on the card. Case + spaces
// + slashes count. Mismatches are reported before write, not silently
// skipped.
const UPDATES = new Map([
  ['Marketplace (/marketplace)',                                     { estimate_days: 1, target_date: '2026-07-29' }],
  ['Main branch launch tasks',                                       { estimate_days: 1, target_date: '2026-07-29' }],
  ['Fat AI Integration',                                             { estimate_days: 1, target_date: '2026-07-29' }],
  ['Test: fatai,mollie,e2e - /eiendom + /leie + /leie-eiendom',      { estimate_days: 2, target_date: '2026-07-30' }],
  ['Mollie Checkout on each portal',                                 { estimate_days: 4, target_date: '2026-08-01' }],
  ['Fat for life',                                                   { estimate_days: 8, target_date: '2026-08-07' }],
]);

const OWNER = 'Victor';

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

// A card "belongs" to a dev when either the legacy `dev` string
// matches OR the newer `devs[]` list includes them. app.js uses the
// same predicate at read-time — mirroring it here so we never miss
// a card because of the two-column transition.
function cardOwnedBy(card, name) {
  if (!card) return false;
  if (card.dev === name) return true;
  if (Array.isArray(card.devs) && card.devs.includes(name)) return true;
  return false;
}

// Idempotent: re-running assigns the same values a second time. Safe
// under the CAS-retry loop.
function applyDeltas(remote) {
  const progress = Array.isArray(remote.progress) ? remote.progress : [];

  const applied = [];
  const missing = [];
  for (const [portal, patch] of UPDATES) {
    const card = progress.find((c) => c.portal === portal && cardOwnedBy(c, OWNER));
    if (!card) {
      missing.push(portal);
      continue;
    }
    Object.assign(card, patch);
    applied.push({ portal, ...patch });
  }

  return { applied, missing };
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
  if (!res.ok) {
    console.error('\nUpsert failed:', res.status, await res.text());
    process.exit(1);
  }
  const returned = await res.json();
  if (!Array.isArray(returned) || returned.length === 0) return null;
  return returned[0].updated_at;
}

let attempt = 0;
while (true) {
  attempt += 1;
  const { data: remote, updated_at: baseUpdatedAt } = await fetchRow();
  console.log(`Fetched row (attempt ${attempt}, updated_at=${baseUpdatedAt}).`);

  const { applied, missing } = applyDeltas(remote);

  remote.updated = new Date().toISOString();
  remote.updated_by = OWNER;

  if (attempt === 1) {
    log('Cards patched', applied);
    if (missing.length > 0) log('Cards NOT found (portal name mismatch)', missing);
  }

  const newUpdatedAt = await casPatch(baseUpdatedAt, remote);
  if (newUpdatedAt) {
    console.log(`\nUpsert OK (attempt ${attempt}). New updated_at=${newUpdatedAt}`);
    if (missing.length > 0) {
      console.log(`\nWARNING: ${missing.length} card(s) skipped — portal names in UPDATES map do not match any card in progress[]. Fix names + re-run.`);
    }
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
  console.log('\nCAS miss — someone edited between fetch and PATCH. Re-fetching + retrying once.');
}
