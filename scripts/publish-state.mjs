// Fetches the Build Overview board state from Supabase, reshapes it
// into Audun's per-developer format, and writes ./state.json.
//
// Audun 2026-07-23 follow-up: his automated reporter sandbox can only
// reach discord.com + api.github.com — Netlify is blocked. So we
// mirror the same JSON into this repo via a scheduled GitHub Action
// (see .github/workflows/publish-state.yml), and the reporter reads it
// through the GitHub Contents API:
//   https://api.github.com/repos/DevFatser/fatsees-overview/contents/state.json?ref=main
//
// The Netlify Function at /state.json is kept in parallel so anyone
// browsing from a non-sandboxed environment still gets the fast path.
// Both stay in sync because both derive from the same Supabase row.

import { writeFile, readFile } from 'node:fs/promises';

const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

const ROSTER_FALLBACK = ['Victor', 'Apple', 'Nahid', 'Shafi', 'Audun'];
const OUT_PATH = new URL('../state.json', import.meta.url);

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function cardOwners(card) {
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
    };
  }
  return base;
}

async function fetchSupabaseRow() {
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
    throw new Error(`Supabase ${res.status} ${await res.text().catch(() => '')}`);
  }
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('overview_state row missing');
  }
  return rows[0];
}

function reshape(row) {
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
    priority: [], // team-shared queue below
  }));

  return {
    updated_at: row.updated_at || d.updated || null,
    updated_by: d.updated_by || null,
    developers,
    priority_queue: safeArray(d.priority).map((c) => summarize(c, 'priority')),
  };
}

async function main() {
  const row = await fetchSupabaseRow();
  const payload = reshape(row);
  const nextJson = JSON.stringify(payload, null, 2) + '\n';

  // Skip the commit noise if nothing changed.
  let prev = null;
  try {
    prev = await readFile(OUT_PATH, 'utf8');
  } catch { /* file doesn't exist yet — first run */ }

  if (prev === nextJson) {
    console.log('publish-state: no changes; state.json is up to date.');
    return;
  }

  await writeFile(OUT_PATH, nextJson, 'utf8');
  console.log(`publish-state: wrote state.json (${nextJson.length} bytes, updated_at=${payload.updated_at}).`);
}

main().catch((err) => {
  console.error('publish-state failed:', err);
  process.exitCode = 1;
});
