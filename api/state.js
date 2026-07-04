// Shared-state backend for the Fatsees Build Overview.
//
// GET  /api/state → returns { data: <blob or null> }
// POST /api/state → body is the whole state blob; overwrites in KV
//
// Storage: Vercel KV (managed Upstash Redis under the hood). Provisioned
// via Vercel Dashboard → Storage → Create KV → connect to project. The
// connect flow auto-populates KV_* env vars on the project.
//
// No auth: this is an internal team dashboard. If anyone hostile finds
// the URL they can vandalise the state — recover via Export → re-Import
// (button in the UI). Consider adding a shared secret header on POST if
// abuse becomes a real problem.

import { kv } from '@vercel/kv';

const STATE_KEY = 'fatsees_build_overview_v8';

export default async function handler(req, res) {
  // CORS off by default (same-origin). Keep tight; no cross-site edits.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'GET') {
    try {
      const data = await kv.get(STATE_KEY);
      return res.status(200).json({ data: data ?? null });
    } catch (err) {
      // KV not yet provisioned or transient outage. Return null so the
      // client falls through to SEED-first-run flow.
      console.error('[state] GET failed:', err?.message || err);
      return res.status(200).json({ data: null, warn: 'kv_unavailable' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Body arrives pre-parsed on Vercel's Node runtime.
      const body = req.body;
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'invalid_body' });
      }
      await kv.set(STATE_KEY, body);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[state] POST failed:', err?.message || err);
      return res.status(500).json({ error: 'kv_write_failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method_not_allowed' });
}
