// One-shot: add "Marketplace escrow E2E log" as a new dedicated card
// on the Build Overview board. Response to Audun 2026-07-28 ask
// (Fatsees Reporter): "which card carries the marketplace escrow E2E
// log … I want it named, not implied."
//
// Why a NEW card rather than expanding the existing rental-E2E card:
//   - The existing "Test: fatai,mollie,e2e - /eiendom + /leie +
//     /leie-eiendom" card scopes exclusively to the three rental
//     portals and to Mollie BOOKING (pay-to-reserve). Escrow is a
//     different flow (hold → release / refund on dispute) that lives
//     on /marketplace. Mixing them buries a purchase-gating test
//     inside a rental-scoped card — the exact "implied not named"
//     failure Audun called out.
//
// Idempotent: if a card with the same portal name already exists in
// progress[], we skip the insert (log + exit 0 clean). Safe to re-run.
//
// CAS-safe (mirrors app.js performSave + the sibling scripts):
//   - fetch BEFORE patching
//   - PATCH with ?updated_at=eq.{baseUpdatedAt} filter
//   - retry once on CAS miss with fresh re-fetch + re-apply
//   - second miss aborts with a clear message

const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

const NEW_CARD = {
  portal: 'Marketplace escrow E2E log',
  devs: ['Victor'],
  pct: 0,
  fe: 'todo',
  be: 'todo',
  estimate_days: 3,
  target_date: '2026-08-04',
  note:
    'Audun 2026-07-28 — gates purchases, must be named not implied. ' +
    'Full flow: buyer pay via Mollie → funds held in escrow → ' +
    'delivery confirmation → release to seller; plus the dispute → ' +
    'refund branch. Playwright spec + persistent audit log so we can ' +
    'point at green runs. Depends on "Mollie Checkout on each portal" ' +
    'landing (target 2026-08-01) — 3 days after that to script + ' +
    'stabilise.',
};

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
  const progress = Array.isArray(remote.progress) ? remote.progress : [];

  const already = progress.some((c) => c.portal === NEW_CARD.portal);
  if (already) {
    console.log(`Card "${NEW_CARD.portal}" already exists in progress[] — nothing to do.`);
    process.exit(0);
  }

  progress.push({ id: crypto.randomUUID(), ...NEW_CARD });
  remote.progress = progress;
  remote.updated = new Date().toISOString();
  remote.updated_by = 'Victor';

  if (attempt === 1) {
    console.log(`Fetched row (updated_at=${baseUpdatedAt}). Adding card:\n`);
    console.log(JSON.stringify(NEW_CARD, null, 2));
  }

  const newUpdatedAt = await casPatch(baseUpdatedAt, remote);
  if (newUpdatedAt) {
    console.log(`\nUpsert OK (attempt ${attempt}). New updated_at=${newUpdatedAt}`);
    break;
  }

  if (attempt >= 2) {
    console.error(
      '\nCAS miss after retry — the row changed twice while this script was running. ' +
      'Aborting rather than clobber. Re-run the script.',
    );
    process.exit(2);
  }
  console.log('\nCAS miss — someone edited between fetch and PATCH. Re-fetching + retrying once.');
}
