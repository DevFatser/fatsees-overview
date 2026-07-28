// One-shot: update the "Marketplace escrow E2E log" card's note with
// the tightened scope Audun locked in his 2026-07-28 Fatsees Reporter
// reply:
//
//   "the log must cover BOTH release legs — buyer-confirm → payout
//    AND the day-14 auto-release (simulate the clock, don't wait 14
//    days). The auto-release leg is the one that pays out without
//    anyone clicking — it can't be the untested one. Dispute → refund
//    branch staying in scope is good."
//
// Idempotent — re-run replaces the note with the same string. No new
// insert; the card was created by add-marketplace-escrow-card.mjs.
// CAS-safe: mirrors the sibling scripts' pattern.

const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

const CARD_PORTAL = 'Marketplace escrow E2E log';
const NEW_NOTE =
  'Audun 2026-07-28 — gates purchases, must be named not implied. ' +
  'Full flow: buyer pay via Mollie → funds held in escrow → BOTH release legs covered: ' +
  '(a) buyer-confirm → payout (user-triggered) AND ' +
  '(b) day-14 auto-release → payout (no user action; clock simulated, we do not wait 14 real days — Audun 2026-07-28: "the auto-release leg pays out without anyone clicking, it can\'t be the untested one"). ' +
  'Plus the dispute → refund branch. ' +
  'Playwright spec + persistent audit log as the deliverable artifact so we can point at green runs. ' +
  'Depends on "Mollie Checkout on each portal" landing (target 2026-08-01) — 3 days after that to script + stabilise.';

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
  const card = progress.find((c) => c.portal === CARD_PORTAL);
  if (!card) {
    console.error(`Card "${CARD_PORTAL}" not found in progress[]. Run add-marketplace-escrow-card.mjs first.`);
    process.exit(1);
  }

  const oldNote = card.note || '';
  card.note = NEW_NOTE;
  remote.progress = progress;
  remote.updated = new Date().toISOString();
  remote.updated_by = 'Victor';

  if (attempt === 1) {
    console.log(`Fetched row (updated_at=${baseUpdatedAt}).`);
    console.log(`\nOld note (${oldNote.length} chars):\n  ${oldNote}`);
    console.log(`\nNew note (${NEW_NOTE.length} chars):\n  ${NEW_NOTE}`);
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
