/* ─── Supabase config ─────────────────────────────────────────────────
   Anon key is safe to expose (public by design; RLS controls access). */
const SUPABASE_URL = 'https://cgfrvzhnkxrhuqjgsfgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnZnJ2emhua3hyaHVxamdzZmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNjI4NTMsImV4cCI6MjA5ODczODg1M30.ob3Pq_baRN7zOQeM8y8dOdPQOVAaLwQHngbNBAvmB1g';
const STATE_ROW_ID = 'main';

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
let data = structuredClone(SEED);
let editing = false;
let saveTimer = null;
let realtimeChannel = null;

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
  const collect = (a, b, path) => {
    if (a === b) return;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      changes.push({ at, by: who, path, from: a, to: b });
      return;
    }
    if (Array.isArray(a) || Array.isArray(b)) {
      // Arrays diffed shallowly by JSON so add/remove/reorder land as
      // one summary event rather than exploding into per-index noise.
      const aj = JSON.stringify(a), bj = JSON.stringify(b);
      if (aj !== bj) changes.push({ at, by: who, path, from: aj.slice(0, 200), to: bj.slice(0, 200) });
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
function migrate(d) {
  if (!d) return null;
  if (!d.devs) d.devs = SEED.devs.slice();
  d.devs = d.devs.filter(n => n !== 'TBD');
  if (!d.done) d.done = [];
  if (!d.progress) d.progress = [];
  if (!d.planned) d.planned = [];
  if (!d.priority) d.priority = [];
  return d;
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
      .select('data')
      .eq('id', STATE_ROW_ID)
      .maybeSingle();
    if (error) throw error;
    if (rows && rows.data) {
      data = migrate(rows.data);
    } else {
      data = structuredClone(SEED);
      await supa.from('overview_state').upsert({ id: STATE_ROW_ID, data, updated_at: new Date().toISOString() });
    }
    prevSnapshot = snap();
    setSyncStatus('', 'Connected');
  } catch (e) {
    console.error('load failed', e);
    setSyncStatus('error', 'Offline');
    toast('Could not load from server — showing seed', 'error');
    data = structuredClone(SEED);
    prevSnapshot = snap();
  }
}

/* ─── Persist state (debounced) ───────────────────────────────────── */
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
    setSyncStatus('saving', 'Saving…');
    try {
      const { error } = await supa
        .from('overview_state')
        .upsert({ id: STATE_ROW_ID, data, updated_at: new Date().toISOString() });
      if (error) throw error;
      setSyncStatus('', 'Connected');
    } catch (e) {
      console.error('save failed', e);
      setSyncStatus('error', 'Save failed');
      toast('Save failed — check console', 'error');
    }
  }, opts && opts.immediate ? 0 : 400);
}
/* ─── Real-time subscription ──────────────────────────────────────── */
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
      if (editing && document.activeElement && document.activeElement.matches('[contenteditable], input, select')) return;
      if (payload.new && payload.new.data) {
        data = migrate(payload.new.data);
        // Reset the diff baseline so our next local save doesn't
        // regenerate events for whatever the remote user just changed.
        prevSnapshot = snap();
        render();
        const who = payload.new.data.updated_by ? ` by ${payload.new.data.updated_by}` : '';
        toast(`Updated${who}`);
      }
    })
    .subscribe();
}

/* ─── Render ──────────────────────────────────────────────────────── */
function render() {
  renderDone();
  renderProgress();
  renderPlanned();
  renderPriority();
  applyEditGates();
  bind();
}

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
    <div class="card done">
      <div class="card-title" data-path="done.${i}.portal">${escapeHTML(p.portal)}</div>
      <div class="devs">${devChipsHTML(p.devs, `done.${i}.devs`)}</div>
      <div class="ready-badge">✓ Verified — ready to test</div>
      <div class="card-note" data-path="done.${i}.note">${escapeHTML(p.note || '')}</div>
      <div class="card-actions">
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
      <div class="card">
        <div class="card-title" data-path="progress.${i}.portal">${escapeHTML(p.portal)}</div>
        <div class="devs">${devChipsHTML(p.devs, `progress.${i}.devs`)}</div>
        <div class="progress">
          <div class="progress-row">
            <span>Progress</span>
            <span class="pct" data-path="progress.${i}.pct">${pct}</span>
          </div>
          <div class="progress-track"><div class="progress-fill ${fillClass}" style="width:${pct}%"></div></div>
        </div>
        <div class="pills">
          <span class="pill ${p.fe}" data-stpath="progress.${i}.fe"><span class="pill-key">FE</span>${STATUS_LABELS[p.fe] || p.fe}</span>
          <span class="pill ${p.be}" data-stpath="progress.${i}.be"><span class="pill-key">BE</span>${STATUS_LABELS[p.be] || p.be}</span>
        </div>
        <div class="card-note" data-path="progress.${i}.note">${escapeHTML(p.note || '')}</div>
        <div class="card-actions">
          <button class="verify-done-btn" data-verify="${i}" title="Requires end-to-end verification">→ Move to Done</button>
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
    <div class="card planned">
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
    <div class="card priority">
      <div class="priority-rank-badge">${i + 1}</div>
      <div class="card-title" data-path="priority.${i}.item">${escapeHTML(p.item || 'New')}</div>
      <div class="card-note" data-path="priority.${i}.note">${escapeHTML(p.note || '')}</div>
      <div class="card-actions">
        <button data-up="${i}" title="Move up" class="rank-btn">↑</button>
        <button data-down="${i}" title="Move down" class="rank-btn">↓</button>
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
      if (s === 'done')     data.done.push({ portal: 'New portal', devs: ['Shafi'], note: '' });
      if (s === 'progress') data.progress.push({ portal: 'New portal', devs: ['Shafi'], pct: 0, fe: 'todo', be: 'todo', note: '' });
      if (s === 'planned')  data.planned.push({ dev: 'Shafi', next: 'New next task', note: '' });
      if (s === 'priority') data.priority.push({ item: 'New priority', note: '' });
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
      data.done.push({ portal: p.portal, devs: p.devs.slice(), note: p.note || 'Verified end-to-end.' });
      save();
      document.getElementById('done').scrollIntoView({ behavior: 'smooth' });
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
