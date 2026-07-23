// GET /state.json — expose the Build Overview board state as static-shaped
// JSON so Audun's automated Claude report can pull it 3× a day with a
// plain HTTPS GET (no headless browser, no auth headers).
//
// Audun's ask (2026-07-23): "expose the board's underlying data at a URL
// that a plain HTTPS GET can fetch (no JavaScript execution required)".
// He gave a preferred per-developer shape; we reshape the section-first
// board blob stored in Supabase (`overview_state.data`) into that shape.
//
// Response shape:
// {
//   "updated_at":  "2026-07-23T14:00:00Z",   // Supabase row.updated_at (ISO)
//   "updated_by":  "Victor",                 // most recent editor (identity picker)
//   "developers": [
//     { "name": "Victor",
//       "done":         [{ portal, note, ... }],
//       "in_progress":  [{ portal, note, pct, fe, be, ... }],
//       "planned_next": [{ portal, note, ... }],
//       "priority":     [] // shared queue, mirrored at top-level below
//     },
//     ...
//   ],
//   "priority_queue": [{ item, note }, ...]  // team-shared unowned backlog
// }
//
// No auth on the endpoint — the underlying Supabase row is already
// world-readable via the `overview_state` SELECT-all RLS policy, so
// there is no additional surface to expose. Access-Control-Allow-Origin
// is `*` so Audun's reporter can hit it from anywhere.

const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

const ROSTER_FALLBACK = ['Victor', 'Apple', 'Nahid', 'Shafi', 'Audun'];

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function cardOwners(card) {
  // `done` + `progress` use `card.devs` (array); `planned` uses `card.dev` (single).
  if (Array.isArray(card.devs)) return card.devs;
  if (typeof card.dev === 'string') return [card.dev];
  return [];
}

function summarize(card, kind) {
  const base = {
    id: card.id || null,
    portal: card.portal || card.next || card.item || '(untitled)',
    note: card.note || '',
  };
  if (kind === 'progress') {
    return {
      ...base,
      pct: typeof card.pct === 'number' ? card.pct : null,
      fe: card.fe || null,
      be: card.be || null,
      // Audun 2026-07-23 — remaining-work estimate. Devs update at
      // EOD alongside %; either or both fields may be null.
      estimate_days: typeof card.estimate_days === 'number' ? card.estimate_days : null,
      target_date: card.target_date || null,
    };
  }
  return base;
}

export async function handler() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/overview_state?id=eq.${STATE_ROW_ID}&select=data,updated_at`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: `Supabase ${res.status}` }),
      };
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No board state row' }),
      };
    }
    const row = rows[0];
    const d = row.data || {};

    const roster = safeArray(d.devs).length > 0 ? d.devs : ROSTER_FALLBACK;

    const developers = roster.map((name) => ({
      name,
      done: safeArray(d.done)
        .filter((c) => cardOwners(c).includes(name))
        .map((c) => summarize(c, 'done')),
      in_progress: safeArray(d.progress)
        .filter((c) => cardOwners(c).includes(name))
        .map((c) => summarize(c, 'progress')),
      planned_next: safeArray(d.planned)
        .filter((c) => cardOwners(c).includes(name))
        .map((c) => summarize(c, 'planned')),
      // Team priority queue is unowned — mirrored at top level below.
      // Kept as empty array here so the shape stays uniform per dev.
      priority: [],
    }));

    const priority_queue = safeArray(d.priority).map((c) => summarize(c, 'priority'));

    const body = JSON.stringify(
      {
        updated_at: row.updated_at || d.updated || null,
        updated_by: d.updated_by || null,
        developers,
        priority_queue,
      },
      null,
      2
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // 60s edge cache is plenty — Audun polls 3×/day; Realtime board
        // edits round-trip fast enough that any refresh sees fresh data.
        'Cache-Control': 'public, max-age=60, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
      body,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: String(err && err.message ? err.message : err) }),
    };
  }
}
