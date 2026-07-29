/* ─── Supabase config ─────────────────────────────────────────────────
   Anon key is safe to expose (public by design; RLS controls access). */
const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

/* ─── Stale-tab detection ──────────────────────────────────────────────
   Victor 2026-07-29 (Shafi 11:21 split reverted at 19:11 by Nahid).
   Root cause: Nahid's tab was open since before the id-keyed
   deepMerge (commit d9bc78a, 2026-07-28) landed. His stale app.js
   opaque-array-merged Shafi's realtime split, dropped the new cards
   from local state, then his next save wrote a state without them.
   The fix (id-keyed merge) is deployed, but existing tabs still run
   whatever bundle they loaded on first open — indefinitely.

   BUNDLE_VERSION is bumped on every change to app.js that affects
   save/merge/realtime behaviour. Any tab whose BUNDLE_VERSION is
   older than the server-observed one refuses to save + shows a
   modal telling the user to reload. Better UX than silently losing
   edits every time someone leaves a tab open across a deploy.

   Every performSave() stamps `data.app_version = BUNDLE_VERSION`.
   The realtime + load handlers read `remoteData.app_version`; if it
   parses to a NEWER date than ours, we know a newer tab wrote, so
   the deploy has moved forward. Same-or-older newer-writes don't
   trigger the modal (they can only happen from tabs running same
   or older code — no upgrade needed on our side).

   Bump this on EVERY app.js change that touches:
     - deepMerge / mergeCardArrays
     - performSave / CAS handling
     - realtime subscription handler
     - migrate() shape
   Cosmetic-only edits don't need a bump. */
const BUNDLE_VERSION = '2026-07-29-1';

/* ─── Constants ────────────────────────────────────────────────────── */
const DEV_COLORS = {
  Shafi:  '#5b8cff',
  Victor: '#22c55e',
  Apple:  '#f59e0b',
  Nahid:  '#a855f7',
  Audun:  '#ec4899',
};
const STATUS_STATES = ['todo', 'prog', 'done'];
const STATUS_LABELS = { todo: 'To do', prog: 'In prog', done: 'Done' };

/* ─── Seed data (fallback if the state row is empty on first load) ─── */
const SEED = {
  updated: new Date().toISOString().slice(0, 16).replace('T', ' '),
  devs: ['Shafi', 'Victor', 'Apple', 'Nahid', 'Audun'],
  done: [
    { portal: 'Community',                       devs: ['Shafi'],           note: 'Portal shipped; Q&A threads live; help surface still to add.' },
    { portal: 'Social (/some)',                  devs: ['Victor'],          note: 'Fatsees Profile portal — shipped.' },
    { portal: 'My Profile',                      devs: ['Shafi'],           note: 'Shipped.' },
    { portal: 'fatsees-main — live prod server', devs: ['Shafi', 'Victor'], note: 'Ready to test. Shafi: separate Vercel project. Victor: Supabase Branching enabled today (~$9.68/mo, read-only replica later).' },
  ],
  progress: [
    { portal: 'Fat for life',                     devs: ['Victor'], pct: 50, fe: 'prog', be: 'prog', note: 'Text chat done; LiveKit voice: scaffold + STT + TTS + Phase 4 streaming shipped (PRs #289/#297/#310). Adapter + agent swap + frontend hook next.' },
    { portal: 'Founders',                         devs: ['Nahid'],  pct: 98, fe: 'done', be: 'done', note: 'Wrapped; e2e punchlist to clear before Done. Fix: feedback review from Shafi.' },
    { portal: 'Dashboard / custom URL',           devs: ['Nahid'],  pct: 95, fe: 'prog', be: 'prog', note: 'PR 6 plan167 Analytics (Phase 4) branch: feat-dashboards-analytics--nahid. View-count + block-click endpoints + owner analytics tab dep: lowest priority.' },
    { portal: 'Fat AI Integration',               devs: ['Victor'], pct: 0,  fe: 'prog', be: 'todo', note: 'Fat AI on (/eiendom) + (/leie) + (/leie-eiendom). Dispute handling tied in.' },
    { portal: 'Freja Identity Verification Test', devs: ['Apple'],  pct: 10, fe: 'prog', be: 'todo', note: 'Setup ready (guide + sandbox PFX); testing not started yet. Identified-tier local test pass per _docs/FREJA_LOCAL_SETUP_GUIDE.md.' },
    { portal: 'Mollie Checkout on each portal',   devs: ['Victor'], pct: 0,  fe: 'prog', be: 'todo', note: 'Mollie checkout on /Marketplace, /leie, /leie-eiendom.' },
    { portal: 'VideoPay',                         devs: ['Apple'],  pct: 80, fe: 'prog', be: 'prog', note: 'Coding done + E2E tested (one-sided NET fee verified live). Received Shafi\'s testing feedback (F1–F14); working through remaining fixes.' },
    { portal: 'Motor',                            devs: ['Apple'],  pct: 10, fe: 'prog', be: 'prog', note: 'Started Thursday. Server-side search API already merged (PR #300, Shafi-reviewed). Next: browse kit + /bil rebuild.' },
    { portal: 'PR Reviews',                       devs: ['Shafi'],  pct: 50, fe: 'prog', be: 'prog', note: 'Rolling: review 12+ PRs.' },
  ],
  planned: [
    // One realistic next card per developer (Audun's spec: 1 per dev, 2 at most).
    { dev: 'Shafi',  next: 'Push Dev → main', note: 'After Video + Founders + Mollie + Fat AI integ completes.' },
    { dev: 'Victor', next: 'Supabase Branching', note: 'Dev branch enabled; read-only replica later.' },
    { dev: 'Apple',  next: 'Jobs (/jobs)', note: 'Kicks off after Motor + Freja test wrap.' },
    { dev: 'Nahid',  next: 'Equity (/aksjer)', note: 'Green-lit; picks up after Founders 100% + Dashboard 100%.' },
  ],
  priority: [
    // Ranked queue of untouched builds. Longest section by design.
    { item: 'Marketplace (/marketplace)',       note: 'Buy/sell + escrow + fee reference path. Pulled from Done pending Mollie completion.' },
    { item: 'Real Estate (/eiendom)',           note: 'Fat AI integ + Finn-parity NL search.' },
    { item: 'Rent Anything (/leie)',            note: 'Mollie + Fat AI integ remaining.' },
    { item: 'Property Rental (/leie-eiendom)',  note: 'Mollie + Fat AI integ remaining.' },
    { item: 'Work Marketplace (/services)',     note: 'Splits from Jobs — separate deliverable.' },
    { item: 'Suppliers (/suppliers)',           note: 'Works with zero inventory (Fat web-search).' },
    { item: 'Apps (/apps)',                     note: '' },
    { item: 'Charity (/charity)',               note: '' },
    { item: 'World of Business (/world)',       note: '' },
    { item: 'LiveKit Phase 4c-2 adapter',       note: 'Fat for life continuation — adapter + agent swap + frontend hook.' },
    { item: 'UIUX design pass across portals',  note: 'Shafi-led sweep once Dev → main merges.' },
  ],
};

/* ─── Supabase client ─────────────────────────────────────────────── */
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── App state ───────────────────────────────────────────────────── */
let data = migrate(structuredClone(SEED));
let editing = false;
let saveTimer = null;
let realtimeChannel = null;
// Victor 2026-07-26 save-protection —
//   lastServerUpdatedAt: the row's updated_at ISO string as of the last
//     confirmed sync (load, successful save, or accepted realtime push).
//     Used as the CAS token on save — if the DB row's updated_at no
//     longer matches, someone else saved in between and we merge instead
//     of clobbering.
//   lastServerData: the row's `data` snapshot at the same moment. Diffing
//     (localData, lastServerData) gives us exactly the fields THIS user
//     touched — those override on merge; every other field survives.
//   activeFieldPath: the DOM path (contenteditable dataset or input's
//     data-field) the user is currently focused on. On incoming realtime
//     updates we merge ALL remote fields EXCEPT this one — so if two
//     devs edit different fields simultaneously, both changes stick.
let lastServerUpdatedAt = null;
let lastServerData = null;
let activeFieldPath = null;
// Highest BUNDLE_VERSION we've seen the SERVER row carry. Updated by
// load() and the realtime subscription. Used by isStaleTab() to
// decide whether this tab is running an out-of-date bundle. Compared
// lexicographically — BUNDLE_VERSION strings are date-first
// ('YYYY-MM-DD-N') so plain string > works.
let serverAppVersion = null;

// True when the server row's app_version is greater than ours. That
// means a newer-code tab has already written; our old-code writes
// would silently drop what it added (the exact bug that lost
// Shafi's split 2026-07-29). Prompt reload instead.
function isStaleTab() {
  if (!serverAppVersion) return false;
  return serverAppVersion > BUNDLE_VERSION;
}

// Show a full-screen modal telling the user to reload. Idempotent —
// re-called on every attempted save while stale, but only mounts one
// modal element.
function showStaleTabModal() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('bo-stale-tab-modal')) return;
  const overlay = document.createElement('div');
  overlay.id = 'bo-stale-tab-modal';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:100000;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif;';
  overlay.innerHTML = `
    <div style="max-width:420px;background:#1a1a20;color:#fff;border-radius:12px;padding:24px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
      <div style="font-size:18px;font-weight:700;margin-bottom:8px;">Board updated — please reload</div>
      <div style="font-size:14px;line-height:1.5;opacity:0.85;margin-bottom:16px;">
        This tab is running an older version of the board (loaded before the latest deploy).
        Saving from here would silently overwrite other people's edits.
        Reload to pick up the newest version.
      </div>
      <button id="bo-stale-tab-reload" style="padding:10px 20px;border:none;border-radius:8px;background:linear-gradient(135deg,#e0294a,#6b21a8);color:#fff;font-weight:700;font-size:14px;cursor:pointer;">
        Reload now
      </button>
    </div>
  `;
  document.body.appendChild(overlay);
  const btn = overlay.querySelector('#bo-stale-tab-reload');
  if (btn) btn.addEventListener('click', () => location.reload());
}

/* ─── Identity (Victor 2026-07-21, Audun-approved) ────────────────────
   First-visit: user picks their name from a fixed roster and it lands
   in localStorage. No server change. Every subsequent card mutation
   reads that identity and stamps the event log so silent reverts like
   Motor 45→70 become traceable ("who changed what, when"). Explicitly
   NOT auth — just an honesty-system attribution ping. */
const IDENTITY_KEY = 'fatsees_overview_identity';
const IDENTITY_ROSTER = ['Victor', 'Apple', 'Nahid', 'Shafi', 'Audun'];
function getIdentity() {
  try { return localStorage.getItem(IDENTITY_KEY) || ''; } catch { return ''; }
}
function setIdentity(name) {
  try { localStorage.setItem(IDENTITY_KEY, name); } catch {}
  renderIdentityChip();
}
function renderIdentityChip() {
  const chip = document.getElementById('identity-chip');
  if (!chip) return;
  const who = getIdentity();
  if (who) {
    chip.innerHTML = `
      <span class="dev-avatar" style="background:${devColor(who)}">${initial(who)}</span>
      <span class="identity-name">${escapeHTML(who)}</span>
      <span class="identity-change" title="Change identity">Change</span>`;
    chip.style.display = '';
  } else {
    chip.style.display = 'none';
  }
}
function showIdentityPicker() {
  const modal = document.getElementById('identity-modal');
  if (!modal) return;
  const input = document.getElementById('identity-input');
  const suggEl = document.getElementById('identity-suggestions');
  const proceed = document.getElementById('identity-proceed');
  // Pre-fill with any prior identity so Change → adjust flows work.
  input.value = getIdentity() || '';

  const commit = () => {
    const name = input.value.trim();
    if (!name) return;
    setIdentity(name);
    modal.style.display = 'none';
  };

  const renderSuggestions = () => {
    const q = input.value.trim().toLowerCase();
    // Victor 2026-07-21 — no roster preview. Suggestions only appear
    // once the user has typed something AND the query prefix-matches
    // a roster name that isn't already the exact input.
    const matches = q
      ? IDENTITY_ROSTER.filter(n => n.toLowerCase().startsWith(q) && n.toLowerCase() !== q)
      : [];
    suggEl.innerHTML = matches.map(n => `
      <button type="button" class="identity-suggestion" data-sugg="${escapeHTML(n)}">
        <span class="dev-avatar" style="background:${devColor(n)}">${initial(n)}</span>
        <span>${escapeHTML(n)}</span>
      </button>`).join('');
    suggEl.querySelectorAll('[data-sugg]').forEach(btn => {
      btn.onclick = () => {
        input.value = btn.dataset.sugg;
        proceed.disabled = false;
        renderSuggestions();
        input.focus();
      };
    });
    proceed.disabled = input.value.trim().length === 0;
  };

  input.oninput = renderSuggestions;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
  };
  proceed.onclick = commit;

  modal.style.display = 'flex';
  renderSuggestions();
  // Defer focus one tick — some browsers race the display:flex layout.
  setTimeout(() => input.focus(), 0);
}

/* ─── Event log (per-card edit history) ───────────────────────────────
   `data.events` is an append-only ring buffer capped at 200 entries so
   the state blob stays small. Every mutation goes through `save()`; we
   diff prevState → data and append one event per changed path. Older
   events fall off the front once we hit the cap. */
const EVENT_CAP = 200;
let prevSnapshot = null;
function snap() { return JSON.parse(JSON.stringify(data)); }
function diffAndLogEvents(before, after) {
  if (!after.events) after.events = [];
  const who = getIdentity() || '(anonymous)';
  const at = new Date().toISOString();
  const changes = [];

  // Path prefixes like `progress.3` identify a card. Snapshot the
  // card's stable id + current title at event time so the history
  // popover can filter reliably even after the card is reordered
  // or renamed. `id` field itself is not a user-visible change.
  const cardFromPath = (path) => {
    const parts = path.split('.');
    if (parts.length < 2) return null;
    const section = parts[0], idx = parseInt(parts[1], 10);
    if (!['done','progress','planned','priority'].includes(section)) return null;
    if (Number.isNaN(idx)) return null;
    return (after[section] && after[section][idx]) || (before[section] && before[section][idx]) || null;
  };
  const fieldFromPath = (path) => {
    const parts = path.split('.');
    return parts.length >= 3 ? parts.slice(2).join('.') : parts[parts.length - 1] || null;
  };

  const push = (path, from, to) => {
    if (path.endsWith('.id') || path === 'id') return;
    const card = cardFromPath(path);
    changes.push({
      at, by: who, path, from, to,
      field: fieldFromPath(path),
      card_id: card && card.id || null,
      card_title: card && cardLabel(card) || null,
    });
  };

  const collect = (a, b, path) => {
    if (a === b) return;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      push(path, a, b);
      return;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
      const aa = Array.isArray(a) ? a : [];
      const bb = Array.isArray(b) ? b : [];
      // Same-length object arrays (e.g. `progress` cards, `priority`
      // list) → recurse per index so a pct change on card 3 lands as
      // `progress.3.pct` with a real card_id, not as one opaque
      // `progress` blob. Different-length or primitive arrays (like
      // a card's `devs: ['Victor','Apple']`) → JSON summary at the
      // outer path (still gets a card_id from the outer segment,
      // which is what history filtering needs).
      const bothObjects = aa.every(x => x && typeof x === 'object') && bb.every(x => x && typeof x === 'object');
      if (bothObjects && aa.length === bb.length) {
        for (let i = 0; i < aa.length; i++) {
          collect(aa[i], bb[i], `${path}.${i}`);
        }
      } else {
        const aj = JSON.stringify(a), bj = JSON.stringify(b);
        if (aj !== bj) push(path, aj.slice(0, 200), bj.slice(0, 200));
      }
      return;
    }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if (k === 'events' || k === 'updated' || k === 'updated_by') continue;
      collect(a[k], b[k], path ? `${path}.${k}` : k);
    }
  };
  collect(before, after, '');
  if (changes.length === 0) return;
  after.events.push(...changes);
  if (after.events.length > EVENT_CAP) {
    after.events = after.events.slice(after.events.length - EVENT_CAP);
  }
}

/* ─── Utility ─────────────────────────────────────────────────────── */
function stamp() { return new Date().toISOString().slice(0, 16).replace('T', ' '); }
function devColor(name) { return DEV_COLORS[name] || '#8b5cf6'; }
function initial(name) { return (name || '?').charAt(0).toUpperCase(); }
function getRef(path) {
  const keys = path.split('.'); let o = data;
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
  return [o, keys[keys.length - 1]];
}
function escapeHTML(s) { return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ─── Data migrations (idempotent, run on every load) ─────────────── */
function newId() {
  try { return crypto.randomUUID(); }
  catch { return 'c_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
}
function migrate(d) {
  if (!d) return null;
  if (!d.devs) d.devs = SEED.devs.slice();
  d.devs = d.devs.filter(n => n !== 'TBD');
  if (!d.done) d.done = [];
  if (!d.progress) d.progress = [];
  if (!d.planned) d.planned = [];
  if (!d.priority) d.priority = [];
  // Victor 2026-07-21 — stable per-card ids so history survives
  // reorder/delete. Cards created before this migration get one
  // stamped on first load; new cards get one at add-time (see the
  // [data-add] handler in bind()).
  for (const section of ['done', 'progress', 'planned', 'priority']) {
    for (const card of d[section]) {
      if (!card.id) card.id = newId();
    }
  }
  return d;
}
function cardLabel(card) {
  return card && (card.portal || card.next || card.item) || '(untitled)';
}

/* ─── Sync-status pill ────────────────────────────────────────────── */
const syncEl = document.getElementById('sync-status');
const syncTextEl = document.getElementById('sync-text');
function setSyncStatus(state, text) {
  syncEl.className = 'sync-status ' + state;
  syncTextEl.textContent = text;
}

/* ─── Toast ───────────────────────────────────────────────────────── */
const toastEl = document.getElementById('toast');
function toast(msg, kind) {
  toastEl.textContent = msg;
  toastEl.classList.toggle('error', kind === 'error');
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2400);
}

/* ─── Load state from Supabase ────────────────────────────────────── */
async function load() {
  setSyncStatus('saving', 'Loading…');
  try {
    const { data: rows, error } = await supa
      .from('overview_state')
      .select('data, updated_at')
      .eq('id', STATE_ROW_ID)
      .maybeSingle();
    if (error) throw error;
    if (rows && rows.data) {
      data = migrate(rows.data);
      lastServerUpdatedAt = rows.updated_at;
      lastServerData = structuredClone(data);
      // Track the highest app_version we've seen on the server. If
      // it's newer than ours on load, we're already stale — prompt
      // reload immediately rather than let the user type into a
      // doomed session.
      if (typeof rows.data.app_version === 'string') {
        serverAppVersion = rows.data.app_version;
        if (isStaleTab()) showStaleTabModal();
      }
    } else {
      data = migrate(structuredClone(SEED));
      const nowIso = new Date().toISOString();
      await supa.from('overview_state').upsert({ id: STATE_ROW_ID, data, updated_at: nowIso });
      lastServerUpdatedAt = nowIso;
      lastServerData = structuredClone(data);
    }
    prevSnapshot = snap();
    setSyncStatus('', 'Connected');
  } catch (e) {
    console.error('load failed', e);
    setSyncStatus('error', 'Offline');
    toast('Could not load from server — showing seed', 'error');
    data = migrate(structuredClone(SEED));
    prevSnapshot = snap();
  }
}

/* ─── Persist state (debounced) ───────────────────────────────────── */
// Deep JSON merge — `mine` (this session's local mutations) overrides
// `theirs` (fresh server state) at the leaf level, keyed on paths.
// Arrays are treated as opaque values: if `mine` touched an array,
// mine's version wins entirely for that array (we don't try to reconcile
// per-element card ordering — that way madness lies). Object keys we
// didn't touch fall through to `theirs`. Missing-in-mine (i.e. mine
// deleted the key) also wins (JSON `undefined` roundtrips as absent).
// Victor 2026-07-28 audit — id-keyed reconciliation for card arrays.
// Before: arrays were opaque leaves. If BOTH mine and theirs added a
// (different) card to progress[], mine's array wins entirely and
// theirs' new card silently drops. That's the "things going missing"
// class of bug Audun kept flagging.
//
// After: when both arrays are cards-with-ids, we merge by id:
//   - card exists on both sides → recurse (per-field merge)
//   - card only on mine → keep mine (I added it or theirs deleted it —
//     tiebreak favours preservation; deletion via BO is rare, adds
//     are common)
//   - card only on theirs → keep theirs (they added; we haven't seen it)
// Cards that were on `base` but on neither side → treated as
// deliberately deleted, dropped.
// Cards on base but only on one side → depends: if the side still has
// it, keep it; if only one side dropped, honour the drop (single
// deleter wins). Concurrent adds now coexist.
//
// Any array whose first element does NOT look like an id-keyed card
// falls back to the old opaque-leaf behaviour so this doesn't leak
// out to non-card arrays (e.g. events[], devs[]).
function isCardArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const first = arr[0];
  return first && typeof first === 'object' && typeof first.id === 'string' && first.id.length > 0;
}

function mergeCardArrays(mine, theirs, base) {
  // Union of ids present in either mine or theirs.
  const mineById   = new Map((mine   || []).filter((c) => c && c.id).map((c) => [c.id, c]));
  const theirsById = new Map((theirs || []).filter((c) => c && c.id).map((c) => [c.id, c]));
  const baseById   = new Map((base   || []).filter((c) => c && c.id).map((c) => [c.id, c]));

  const order = [];
  const seen = new Set();
  // Preserve mine's ordering first (user's local view stays visually
  // stable), then append any ids only in theirs at the end. This keeps
  // reorder-in-progress behaviour intuitive.
  for (const c of mine   || []) if (c && c.id && !seen.has(c.id)) { order.push(c.id); seen.add(c.id); }
  for (const c of theirs || []) if (c && c.id && !seen.has(c.id)) { order.push(c.id); seen.add(c.id); }

  const out = [];
  for (const id of order) {
    const inMine   = mineById.has(id);
    const inTheirs = theirsById.has(id);
    const inBase   = baseById.has(id);
    if (inMine && inTheirs) {
      out.push(deepMerge(mineById.get(id), theirsById.get(id), baseById.get(id)));
    } else if (inMine && !inTheirs) {
      // Only mine has it. If it WAS on base, theirs deleted it — honour delete.
      // If not on base, mine added it — keep.
      if (!inBase) out.push(mineById.get(id));
    } else if (!inMine && inTheirs) {
      // Only theirs has it. If it WAS on base, mine deleted it — honour delete.
      // If not on base, theirs added it — keep.
      if (!inBase) out.push(theirsById.get(id));
    }
  }
  return out;
}

function deepMerge(mine, theirs, base) {
  if (mine === theirs) return theirs;

  // Id-keyed card arrays get real reconciliation instead of opaque leaf.
  if (isCardArray(mine) || isCardArray(theirs)) {
    return mergeCardArrays(mine, theirs, base);
  }

  const mineIsObj = mine && typeof mine === 'object' && !Array.isArray(mine);
  const theirsIsObj = theirs && typeof theirs === 'object' && !Array.isArray(theirs);
  const baseIsObj = base && typeof base === 'object' && !Array.isArray(base);
  if (!mineIsObj || !theirsIsObj) {
    // Leaf or non-card array — if mine differs from base, mine wins; else theirs.
    return JSON.stringify(mine) === JSON.stringify(base) ? theirs : mine;
  }
  // Merge keys from both sides.
  const out = {};
  const keys = new Set([...Object.keys(mine), ...Object.keys(theirs)]);
  for (const k of keys) {
    out[k] = deepMerge(mine[k], theirs[k], baseIsObj ? base[k] : undefined);
  }
  return out;
}

function save(opts) {
  // Diff against the last-flushed snapshot and append events for the
  // changed paths BEFORE stamping updated/updated_by (those are logged
  // as noise otherwise). Runs synchronously so realtime pushes carry
  // the events too.
  if (prevSnapshot) diffAndLogEvents(prevSnapshot, data);
  data.updated = stamp();
  data.updated_by = getIdentity() || '(anonymous)';
  prevSnapshot = snap();
  render();

  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await performSave();
  }, opts && opts.immediate ? 0 : 400);
}

// Extracted so we can retry on CAS conflict. Uses .update().eq('updated_at', ...)
// as the compare-and-swap — Postgres returns zero rows if updated_at
// changed between our load and our write, which means someone else saved
// in between. On conflict: fetch latest, deep-merge our local mutations
// on top, retry ONCE. If the second attempt also conflicts (rare — two
// concurrent writers hammering the same tick), give up and surface the
// error so the user can reload.
async function performSave(retryCount = 0) {
  // Stale-tab defense: if a newer BUNDLE_VERSION has been observed on
  // the server (via realtime or the initial load), refuse to write.
  // This tab is running out-of-date code and its save WILL clobber
  // whatever the newer-code tabs did that this tab doesn't know how
  // to preserve. Prompt reload instead.
  if (isStaleTab()) {
    setSyncStatus('error', 'Reload needed');
    showStaleTabModal();
    return;
  }
  setSyncStatus('saving', 'Saving…');
  // Stamp OUR bundle version so newer-code tabs can detect stale
  // writes from older-code tabs on realtime.
  data.app_version = BUNDLE_VERSION;
  const newUpdatedAt = new Date().toISOString();
  try {
    // First attempt: CAS on lastServerUpdatedAt. `.select()` forces the
    // client to return the affected rows so we can detect zero-match.
    const { data: rows, error } = await supa
      .from('overview_state')
      .update({ data, updated_at: newUpdatedAt })
      .eq('id', STATE_ROW_ID)
      .eq('updated_at', lastServerUpdatedAt)
      .select('updated_at');
    if (error) throw error;

    if (rows && rows.length > 0) {
      // Won the race — commit the new baseline.
      lastServerUpdatedAt = rows[0].updated_at;
      lastServerData = structuredClone(data);
      setSyncStatus('', 'Connected');
      return;
    }

    // Zero rows returned → CAS mismatch. Someone else saved between our
    // load and our write. Fetch latest and merge.
    if (retryCount >= 1) {
      // Already retried once — bail out rather than loop forever. This
      // only fires if a third writer races us on the retry too, which
      // is extremely rare for a 5-person team but the safety valve
      // matters.
      console.warn('[save] CAS conflict persisted after retry — aborting');
      setSyncStatus('error', 'Save conflict — reload page');
      toast('Save collision — please reload to pick up latest changes', 'error');
      return;
    }

    setSyncStatus('saving', 'Merging…');
    const { data: latestRow, error: fetchErr } = await supa
      .from('overview_state')
      .select('data, updated_at')
      .eq('id', STATE_ROW_ID)
      .maybeSingle();
    if (fetchErr) throw fetchErr;
    if (!latestRow || !latestRow.data) {
      throw new Error('overview_state row disappeared during merge');
    }

    // Merge: my local mutations on top of the fresh remote. lastServerData
    // is the base — fields I changed vs it override; fields I didn't touch
    // fall through to whatever the other writer put there.
    const merged = deepMerge(data, migrate(latestRow.data), lastServerData);
    merged.updated = stamp();
    merged.updated_by = getIdentity() || '(anonymous)';
    data = merged;
    prevSnapshot = snap();
    // Rebase to the winner's timestamp so the retry CAS matches.
    lastServerUpdatedAt = latestRow.updated_at;
    lastServerData = structuredClone(migrate(latestRow.data));
    render();

    // Retry with the merged data. Recursive call bounded by retryCount.
    await performSave(retryCount + 1);
  } catch (e) {
    console.error('save failed', e);
    setSyncStatus('error', 'Save failed');
    toast('Save failed — check console', 'error');
  }
}
/* ─── Real-time subscription ──────────────────────────────────────── */
// Victor 2026-07-26 save-protection fix.
//
// Old behavior: if the user was focused on ANY contenteditable/input/
// select the incoming remote update was DROPPED entirely. That's the
// root of Audun's "estimate_days + target_date got wiped" bug: while
// user A was editing, user B saved. User A's page kept its stale copy
// (never learned about B's estimate_days changes), then when A saved
// they clobbered B's fields because their local `data` never held them.
//
// New behavior: ALWAYS merge the remote payload into local `data`.
// Fields the user has locally mutated (deepMerge detects via base
// comparison) stay theirs; every other field picks up the remote value.
// Also always advance the CAS baseline (lastServerUpdatedAt +
// lastServerData) so the next save is checking against reality, not a
// stale snapshot.
function subscribeRealtime() {
  if (realtimeChannel) return;
  realtimeChannel = supa
    .channel('overview_state_changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'overview_state',
      filter: `id=eq.${STATE_ROW_ID}`,
    }, (payload) => {
      if (!payload.new || !payload.new.data) return;
      const remoteData = migrate(payload.new.data);
      const remoteUpdatedAt = payload.new.updated_at;
      const who = payload.new.data.updated_by ? ` by ${payload.new.data.updated_by}` : '';

      // Track the newest app_version we've seen on the server. If a
      // newer-code tab wrote (their BUNDLE_VERSION > ours), we flip
      // to stale-tab mode: block saves + show reload modal. This
      // catches the bug where a stale tab receives realtime updates
      // from a newer tab, drops fields it doesn't understand
      // (opaque-array merge era), then clobbers them on the next
      // save.
      if (typeof payload.new.data.app_version === 'string' &&
          (!serverAppVersion || payload.new.data.app_version > serverAppVersion)) {
        serverAppVersion = payload.new.data.app_version;
        if (isStaleTab()) showStaleTabModal();
      }

      // If the incoming payload is our own echo (we just saved and the
      // realtime channel replayed it), lastServerUpdatedAt will already
      // match — skip the merge and just advance the baseline.
      if (remoteUpdatedAt === lastServerUpdatedAt) return;

      // Merge remote on top of local, using lastServerData as the base.
      // Any field this session has locally mutated (mine !== base) is
      // preserved; every other field snaps to remote. This is the same
      // deepMerge used on save-conflict retry — one code path.
      const merged = deepMerge(data, remoteData, lastServerData || remoteData);
      data = merged;

      // Advance CAS baseline so the user's next save is comparing against
      // the fresh remote state, not the pre-merge one.
      lastServerUpdatedAt = remoteUpdatedAt;
      lastServerData = structuredClone(remoteData);
      prevSnapshot = snap();

      // If the user is actively typing in an editable, DO NOT re-render
      // — that would wipe their cursor mid-word. Data is already merged
      // silently into `data` so save-protection is intact. A re-render
      // will fire on blur (see the blur listener attached in init()).
      const isTyping = document.activeElement && document.activeElement.matches(
        '[contenteditable], input, select, textarea',
      );
      if (isTyping) {
        pendingRenderAfterBlur = true;
        return;
      }
      render();
      toast(`Updated${who}`);
    })
    .subscribe();
}

// Set by the realtime handler when a merge lands while the user is
// typing. The document-level blur listener reads this and fires the
// deferred render as soon as focus leaves the editable.
let pendingRenderAfterBlur = false;

/* ─── Render ──────────────────────────────────────────────────────── */
function render() {
  renderDone();
  renderProgress();
  renderPlanned();
  renderPriority();
  applyEditGates();
  bind();
}

/* ─── History popover (Victor 2026-07-21) ────────────────────────────
   One shared popover element. Every card renders a small "🕒 history"
   button carrying `data-history="<card_id>"`; clicking it filters
   `data.events` down to that card and renders a compact log. Second
   click on the same card, or clicking outside, closes it. */
function historyBtnHTML(cardId) {
  return `<button class="history-btn" data-history="${escapeHTML(cardId)}" title="Change history for this card">🕒 history</button>`;
}
function formatEventTime(iso) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function truncateForDisplay(v) {
  if (v === null || v === undefined) return '∅';
  const s = String(v);
  return s.length > 80 ? s.slice(0, 80) + '…' : s;
}
function renderHistoryFor(cardId, anchorEl) {
  const pop = document.getElementById('history-popover');
  if (!pop) return;
  // Same card clicked twice → toggle closed.
  if (pop.dataset.cardId === cardId && pop.style.display !== 'none') {
    closeHistoryPopover(); return;
  }
  const events = (data.events || [])
    .filter(e => e.card_id === cardId)
    .slice()
    .reverse(); // newest first
  const rows = events.length === 0
    ? `<div class="history-empty">No changes recorded yet.</div>`
    : events.map(e => `
        <div class="history-row">
          <div class="history-row-head">
            <span class="dev-avatar" style="background:${devColor(e.by)}">${initial(e.by)}</span>
            <span class="history-by">${escapeHTML(e.by || '(anonymous)')}</span>
            <span class="history-when">${escapeHTML(formatEventTime(e.at))}</span>
          </div>
          <div class="history-row-body">
            <span class="history-field">${escapeHTML(e.field || e.path)}</span>
            <span class="history-arrow">·</span>
            <span class="history-from">${escapeHTML(truncateForDisplay(e.from))}</span>
            <span class="history-arrow">→</span>
            <span class="history-to">${escapeHTML(truncateForDisplay(e.to))}</span>
          </div>
        </div>`).join('');
  pop.innerHTML = `
    <div class="history-head">
      <span class="history-title">Change history</span>
      <button class="history-close" type="button" aria-label="Close">×</button>
    </div>
    <div class="history-list">${rows}</div>`;
  pop.dataset.cardId = cardId;

  // Anchor to the card's bounding box, right-align, appear just below.
  const card = anchorEl.closest('.card') || anchorEl;
  const r = card.getBoundingClientRect();
  pop.style.display = 'block';
  const popW = 360;
  pop.style.width = popW + 'px';
  pop.style.left = Math.max(8, Math.min(r.right - popW, window.innerWidth - popW - 8)) + 'px';
  pop.style.top = (r.bottom + window.scrollY + 6) + 'px';

  pop.querySelector('.history-close').onclick = closeHistoryPopover;
}
function closeHistoryPopover() {
  const pop = document.getElementById('history-popover');
  if (!pop) return;
  pop.style.display = 'none';
  pop.dataset.cardId = '';
}
document.addEventListener('click', (e) => {
  const pop = document.getElementById('history-popover');
  if (!pop || pop.style.display === 'none') return;
  if (pop.contains(e.target)) return;
  if (e.target.closest('[data-history]')) return; // handled by delegated bind()
  closeHistoryPopover();
});

/* ─── Render helpers ──────────────────────────────────────────────── */
function devChipsHTML(list, path) {
  const chips = (list || []).map((d, i) => `
    <span class="dev-chip">
      <span class="dev-avatar" style="background:${devColor(d)}">${initial(d)}</span>
      ${devSelectHTML(d, `${path}.${i}`)}
      <span class="dev-x" data-devdel="${path}.${i}" title="Remove">×</span>
    </span>`).join('');
  const add = `<span class="dev-add" data-devadd="${path}">+ add</span>`;
  return chips + add;
}
function devSelectHTML(current, path) {
  const opts = (data.devs || SEED.devs).slice();
  if (current && !opts.includes(current)) opts.push(current);
  return `<select class="dev-select" data-devpath="${path}">${
    opts.map(o => `<option value="${escapeHTML(o)}"${o === current ? ' selected' : ''}>${escapeHTML(o)}</option>`).join('')
  }</select>`;
}

function renderDone() {
  const grid = document.getElementById('done-grid');
  grid.innerHTML = data.done.map((p, i) => `
    <div class="card done" data-cardid="${escapeHTML(p.id || '')}">
      <div class="card-title" data-path="done.${i}.portal">${escapeHTML(p.portal)}</div>
      <div class="devs">${devChipsHTML(p.devs, `done.${i}.devs`)}</div>
      <div class="ready-badge">✓ Verified — ready to test</div>
      <div class="card-note" data-path="done.${i}.note">${escapeHTML(p.note || '')}</div>
      <div class="card-actions">
        ${historyBtnHTML(p.id || '')}
        <span class="card-remove" data-del="done.${i}">× remove</span>
      </div>
    </div>
  `).join('') + `<button class="add-card-btn" data-add="done">+ Add shipped portal</button>`;
}

function renderProgress() {
  const grid = document.getElementById('progress-grid');
  grid.innerHTML = data.progress.map((p, i) => {
    const pct = Math.max(0, Math.min(100, p.pct || 0));
    const fillClass = pct === 100 ? 'done' : pct === 0 ? 'zero' : '';
    return `
      <div class="card" data-cardid="${escapeHTML(p.id || '')}">
        <div class="card-title" data-path="progress.${i}.portal">${escapeHTML(p.portal)}</div>
        <div class="devs">${devChipsHTML(p.devs, `progress.${i}.devs`)}</div>
        <div class="progress">
          <div class="progress-row">
            <span>Progress</span>
            <span class="pct" data-path="progress.${i}.pct">${pct}</span>
          </div>
          <div class="progress-track"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
        </div>
        <!-- Time estimate (Audun ask 2026-07-23, via Fatsees Reporter):
             each in-progress card carries a rough remaining-work
             estimate. Either or both fields are optional. In edit mode
             they render as free-text spans; state.json publishes the
             raw values so his automated report can track drift. -->
        <div class="estimate-row">
          <span class="estimate-label">Est.</span>
          <span class="estimate-days" data-path="progress.${i}.estimate_days">${escapeHTML(String(p.estimate_days ?? ''))}</span>
          <span class="estimate-unit">days</span>
          <span class="estimate-sep">·</span>
          <span class="estimate-target-label">target</span>
          <span class="estimate-target" data-path="progress.${i}.target_date">${escapeHTML(p.target_date || '')}</span>
        </div>
        <div class="pills">
          <span class="pill ${p.fe}" data-stpath="progress.${i}.fe"><span class="pill-key">FE</span>${STATUS_LABELS[p.fe] || p.fe}</span>
          <span class="pill ${p.be}" data-stpath="progress.${i}.be"><span class="pill-key">BE</span>${STATUS_LABELS[p.be] || p.be}</span>
        </div>
        <div class="card-note" data-path="progress.${i}.note">${escapeHTML(p.note || '')}</div>
        <div class="card-actions">
          <button class="verify-done-btn" data-verify="${i}" title="Requires end-to-end verification">→ Move to Done</button>
          ${historyBtnHTML(p.id || '')}
          <span class="card-remove" data-del="progress.${i}">× remove</span>
        </div>
      </div>
    `;
  }).join('') + `<button class="add-card-btn" data-add="progress">+ Add in-progress portal</button>`;
}

// Planned Next — visual cards (1 per dev per Audun's spec).
// Each card has: dev chip, "next" title, optional short note.
function renderPlanned() {
  const grid = document.getElementById('planned-grid');
  grid.innerHTML = data.planned.map((p, i) => `
    <div class="card planned" data-cardid="${escapeHTML(p.id || '')}">
      <div class="card-title" data-path="planned.${i}.next">${escapeHTML(p.next || 'New')}</div>
      <div class="devs">
        <span class="dev-chip">
          <span class="dev-avatar" style="background:${devColor(p.dev)}">${initial(p.dev)}</span>
          ${devSelectHTML(p.dev, `planned.${i}.dev`)}
        </span>
      </div>
      <div class="planned-badge">→ picks up after current</div>
      <div class="card-note" data-path="planned.${i}.note">${escapeHTML(p.note || '')}</div>
      <div class="card-actions">
        ${historyBtnHTML(p.id || '')}
        <span class="card-remove" data-del="planned.${i}">× remove</span>
      </div>
    </div>
  `).join('') + `<button class="add-card-btn" data-add="planned">+ Add planned next</button>`;
}

// Priority — visual cards, ranked. No dev (queued = nobody on it).
// Reorder via ↑↓ in edit mode.
function renderPriority() {
  const grid = document.getElementById('priority-grid');
  grid.innerHTML = data.priority.map((p, i) => `
    <div class="card priority" data-cardid="${escapeHTML(p.id || '')}">
      <div class="priority-rank-badge">${i + 1}</div>
      <div class="card-title" data-path="priority.${i}.item">${escapeHTML(p.item || 'New')}</div>
      <div class="card-note" data-path="priority.${i}.note">${escapeHTML(p.note || '')}</div>
      <div class="card-actions">
        <button data-up="${i}" title="Move up" class="rank-btn">↑</button>
        <button data-down="${i}" title="Move down" class="rank-btn">↓</button>
        ${historyBtnHTML(p.id || '')}
        <span class="card-remove" data-del="priority.${i}">× remove</span>
      </div>
    </div>
  `).join('') + `<button class="add-card-btn" data-add="priority">+ Add priority</button>`;
}

/* ─── Edit-gate: strictly toggle editability based on `editing` ────── */
function applyEditGates() {
  document.body.classList.toggle('editing', editing);
  document.getElementById('edit-btn').textContent = editing ? '✓ Done' : '✎ Edit';
  document.getElementById('edit-hint').textContent = editing ? 'Editing — click ✓ Done when finished' : 'Read-only';
  document.querySelectorAll('[data-path]').forEach(el => {
    if (editing) el.setAttribute('contenteditable', 'plaintext-only');
    else el.removeAttribute('contenteditable');
  });
  document.querySelectorAll('.dev-select').forEach(el => { el.disabled = !editing; });
}

/* ─── Bind (per-render event wiring) ──────────────────────────────── */
function bind() {
  document.querySelectorAll('[data-path]').forEach(el => {
    el.onblur = () => {
      if (!editing) return;
      const [o, k] = getRef(el.dataset.path);
      let v = el.innerText.trim();
      if (k === 'pct') v = Math.max(0, Math.min(100, parseInt(v) || 0));
      // Audun 2026-07-23 — estimate_days is numeric-or-null; empty
      // string clears the field so publish-state emits null instead
      // of "". target_date stays as a free-form ISO/date string —
      // the reporter handles empty as "no target".
      if (k === 'estimate_days') {
        v = v === '' ? null : Math.max(0, parseInt(v) || 0);
      }
      if (o[k] !== v) { o[k] = v; save(); }
      else if (k === 'pct') render();
    };
    el.onkeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
    };
  });

  document.querySelectorAll('.dev-select').forEach(el => {
    el.onchange = () => {
      if (!editing) return;
      const [o, k] = getRef(el.dataset.devpath);
      o[k] = el.value; save();
    };
  });

  document.querySelectorAll('[data-devdel]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const p = el.dataset.devdel.split('.');
      const arr = p.slice(0, -1).reduce((o, x) => o[x], data);
      arr.splice(+p[p.length - 1], 1);
      save();
    };
  });

  document.querySelectorAll('[data-devadd]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const [o, k] = getRef(el.dataset.devadd);
      o[k].push('Shafi'); save();
    };
  });

  document.querySelectorAll('[data-stpath]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const [o, k] = getRef(el.dataset.stpath);
      const cur = o[k] || 'todo';
      const idx = STATUS_STATES.indexOf(cur);
      o[k] = STATUS_STATES[(idx + 1) % STATUS_STATES.length];
      save();
    };
  });

  document.querySelectorAll('[data-del]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const p = el.dataset.del.split('.');
      const arr = p.slice(0, -1).reduce((o, x) => o[x], data);
      arr.splice(+p[p.length - 1], 1);
      save();
    };
  });

  document.querySelectorAll('[data-up]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const i = +el.dataset.up;
      if (i > 0) { [data.priority[i - 1], data.priority[i]] = [data.priority[i], data.priority[i - 1]]; save(); }
    };
  });
  document.querySelectorAll('[data-down]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const i = +el.dataset.down;
      if (i < data.priority.length - 1) { [data.priority[i + 1], data.priority[i]] = [data.priority[i], data.priority[i + 1]]; save(); }
    };
  });

  document.querySelectorAll('[data-add]').forEach(b => {
    b.onclick = () => {
      if (!editing) return;
      const s = b.dataset.add;
      if (s === 'done')     data.done.push({ id: newId(), portal: 'New portal', devs: ['Shafi'], note: '' });
      if (s === 'progress') data.progress.push({ id: newId(), portal: 'New portal', devs: ['Shafi'], pct: 0, fe: 'todo', be: 'todo', note: '' });
      if (s === 'planned')  data.planned.push({ id: newId(), dev: 'Shafi', next: 'New next task', note: '' });
      if (s === 'priority') data.priority.push({ id: newId(), item: 'New priority', note: '' });
      save();
    };
  });

  // Verify-and-move-to-Done (rule #5: Done means YOU verified it end-to-end)
  document.querySelectorAll('[data-verify]').forEach(b => {
    b.onclick = () => {
      if (!editing) return;
      const i = +b.dataset.verify;
      const p = data.progress[i];
      const ok = confirm(
        `Done means you verified it end-to-end as a real user.\n\n` +
        `Have you personally tested "${p.portal}" end-to-end as a real user?\n\n` +
        `OK moves it to Done. Cancel keeps it in In Progress.`
      );
      if (!ok) return;
      data.progress.splice(i, 1);
      data.done.push({ id: p.id || newId(), portal: p.portal, devs: p.devs.slice(), note: p.note || 'Verified end-to-end.' });
      save();
      document.getElementById('done').scrollIntoView({ behavior: 'smooth' });
    };
  });

  document.querySelectorAll('[data-history]').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      renderHistoryFor(btn.dataset.history, btn);
    };
  });

  // Stat-card jump on click
  document.querySelectorAll('[data-scroll]').forEach(el => {
    el.onclick = () => {
      const target = document.getElementById(el.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  });
}

/* ─── Edit-mode toggle ────────────────────────────────────────────── */
document.getElementById('edit-btn').onclick = () => {
  // Force a picked identity before entering edit mode. Read-only view
  // is fine anonymously; but as soon as they can mutate we need a `by`
  // for the event log.
  if (!editing && !getIdentity()) { showIdentityPicker(); return; }
  editing = !editing;
  applyEditGates();
};

/* ─── Change-identity chip click ──────────────────────────────────── */
document.getElementById('identity-chip').addEventListener('click', (e) => {
  if (e.target.classList.contains('identity-change')) showIdentityPicker();
});

/* ─── Boot ────────────────────────────────────────────────────────── */
render();
renderIdentityChip();
if (!getIdentity()) showIdentityPicker();
(async () => {
  await load();
  render();
  subscribeRealtime();
})();

// Deferred-render listener for save-protection. When the realtime
// handler merges a remote update while the user is typing, it skips
// render() (to preserve their cursor) and sets pendingRenderAfterBlur.
// As soon as focus leaves an editable, we run the deferred render so
// the merged remote fields show up. `focusout` bubbles (unlike `blur`).
document.addEventListener('focusout', (e) => {
  if (!pendingRenderAfterBlur) return;
  if (e.target && e.target.matches && e.target.matches('[contenteditable], input, select, textarea')) {
    // Defer one tick so focus can move to another editable (e.g. tabbing
    // between fields) without us re-rendering mid-transition.
    setTimeout(() => {
      const stillEditing = document.activeElement && document.activeElement.matches(
        '[contenteditable], input, select, textarea',
      );
      if (stillEditing) return;
      pendingRenderAfterBlur = false;
      render();
      toast('Merged remote changes');
    }, 0);
  }
});
