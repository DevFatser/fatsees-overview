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
};
const STATUS_STATES = ['todo', 'prog', 'done'];
const STATUS_LABELS = { todo: 'To do', prog: 'In prog', done: 'Done' };
const ROUTES = ['overview', 'done', 'progress', 'planned', 'priority'];
const ROUTE_TITLES = {
  overview: 'Overview',
  done: 'Done — ready to test',
  progress: 'In progress',
  planned: 'Planned next',
  priority: 'Priority queue',
};

/* ─── Seed data ───────────────────────────────────────────────────── */
const SEED = {
  updated: new Date().toISOString().slice(0, 16).replace('T', ' '),
  devs: ['Shafi', 'Victor', 'Apple', 'Nahid'],
  done: [
    { portal: 'Marketplace',       devs: ['Shafi'],  note: 'Shipped — buy/sell + escrow + fee reference path' },
    { portal: 'Community',         devs: ['Shafi'],  note: 'Shipped — Q&A threads; help surface still to add' },
    { portal: 'Social (/some)',    devs: ['Victor'], note: 'Fatsees Profile portal' },
    { portal: 'My Profile',        devs: ['Shafi'],  note: 'Shipped' },
    { portal: 'Motor',             devs: ['Apple'],  note: 'Shipped' },
    { portal: 'VideoPay',          devs: ['Apple'],  note: 'FE + BE done; testing ongoing by Shafi — ready to test' },
  ],
  progress: [
    { portal: 'Fat for life',                    devs: ['Victor'],          pct: 50, fe: 'prog', be: 'prog', note: 'Text chat done; LiveKit voice: scaffold + STT + TTS + Phase 4 streaming shipped (PRs #289/#297/#310). Adapter + agent swap + frontend hook next.' },
    { portal: 'Founders',                        devs: ['Nahid'],           pct: 90, fe: 'done', be: 'done', note: 'Wrapped; e2e punchlist to clear before Done.' },
    { portal: 'Dashboard / custom URL',          devs: ['Nahid'],           pct: 65, fe: 'prog', be: 'done', note: 'PR 4 (grace banner / audit log / SEO).' },
    { portal: 'Real Estate (/eiendom)',          devs: ['Shafi', 'Victor'], pct: 90, fe: 'done', be: 'done', note: 'On Dev; Fat AI integ = Victor.' },
    { portal: 'Rent Anything (/leie)',           devs: ['Shafi', 'Victor'], pct: 85, fe: 'done', be: 'done', note: 'Staging; Mollie + Fat AI + dispute (Shafi 2026-07-04) = Victor.' },
    { portal: 'Property Rental (/leie-eiendom)', devs: ['Shafi', 'Victor'], pct: 85, fe: 'done', be: 'done', note: 'Staging; Fat AI + Mollie checkout = Victor.' },
    { portal: 'fatsees-main — live prod server', devs: ['Shafi', 'Victor'], pct: 60, fe: 'todo', be: 'todo', note: 'Shafi: separate Vercel project (fatsees-main). Victor: Supabase Branching dev branch enabled today (~$9.68/mo, read-only replica later).' },
    { portal: 'Fat AI Integ + Mollie Checkout',  devs: ['Victor'],          pct: 0,  fe: 'prog', be: 'todo', note: 'Fat AI on (/eiendom) + (/leie) + (/leie-eiendom); Mollie checkout on /Marketplace, (/leie), (/leie-eiendom).' },
    { portal: 'Freja Identity Verification Test',devs: ['Apple'],           pct: 50, fe: 'prog', be: 'todo', note: 'Identified-tier local test pass per _docs/FREJA_LOCAL_SETUP_GUIDE.md.' },
  ],
  planned: [
    { dev: 'Shafi',  next: 'UIUX design pass + PR reviews + Founders + VideoPay testing + push Dev → main' },
    { dev: 'Victor', next: 'Supabase Branching + LiveKit Phase 4c-2 adapter + /leie /leie-eiendom /eiendom Mollie + Fat AI' },
    { dev: 'Apple',  next: 'Jobs + Motor (after Shafi redesign)' },
    { dev: 'Nahid',  next: 'Equity (/aksjer) — green-lit' },
  ],
  priority: [
    { item: 'Equity (/aksjer)',                                     st: 'todo', note: 'TOP priority — rides on Freja Identified + escrow + dual-check moderation gate.' },
    { item: 'Fat for life (/ai)',                                   st: 'prog', note: '~50% — text chat done; LiveKit voice is the gap.' },
    { item: 'Founders (/founders)',                                 st: 'prog', note: '~90% — e2e punchlist to close.' },
    { item: 'Dashboard + custom handles',                           st: 'prog', note: '~65% — bare-namespace fatsees.com/[name] → Dashboard.' },
    { item: 'Real Estate (/eiendom) + Motor (/motor)',              st: 'prog', note: 'Real Estate ~90% (Fat AI integ left); Motor shipped. Finn-parity, NL search.' },
    { item: 'Jobs (/jobs) + Work Marketplace (/services)',          st: 'todo', note: '' },
    { item: 'Suppliers (/suppliers)',                               st: 'todo', note: 'Works with zero inventory (Fat web-search).' },
    { item: 'Rent Anything (/leie) + Property Rental (/leie-eiendom)', st: 'prog', note: 'Both ~85% (Fat AI + Mollie integ left).' },
    { item: 'Apps (/apps) + Charity (/charity)',                    st: 'todo', note: '' },
    { item: 'World of Business (/world)',                           st: 'todo', note: '' },
  ],
};

/* ─── Supabase client ─────────────────────────────────────────────── */
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── App state ───────────────────────────────────────────────────── */
let data = structuredClone(SEED);
let editing = false;
let saveTimer = null;
let realtimeChannel = null;
let currentRoute = 'overview';

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
  // TBD is for unassigned cards, never a roster member. Scrub it.
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

/* ─── Router (hash-based) ─────────────────────────────────────────── */
function parseHash() {
  const h = (location.hash || '').replace(/^#\/?/, '');
  return ROUTES.includes(h) ? h : 'overview';
}
function swapView(route) {
  currentRoute = route;
  document.querySelectorAll('.route').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route);
  });
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.route === route);
  });
  document.getElementById('page-title').textContent = ROUTE_TITLES[route];
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => swapView(parseHash()));

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
    setSyncStatus('', 'Connected');
  } catch (e) {
    console.error('load failed', e);
    setSyncStatus('error', 'Offline');
    toast('Could not load from server — showing seed', 'error');
    data = structuredClone(SEED);
  }
}

/* ─── Persist state (debounced) ───────────────────────────────────── */
function save(opts) {
  data.updated = stamp();
  document.getElementById('updated').textContent = data.updated;
  flashSaved();
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
function flashSaved() {
  const f = document.getElementById('saved-flash');
  f.classList.add('show');
  clearTimeout(flashSaved._t);
  flashSaved._t = setTimeout(() => f.classList.remove('show'), 1000);
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
        render();
        toast('Updated by another user');
      }
    })
    .subscribe();
}

/* ─── Render ──────────────────────────────────────────────────────── */
function render() {
  document.getElementById('updated').textContent = data.updated || '—';
  renderStats();
  renderDone();
  renderProgress();
  renderPlanned();
  renderPriority();
  renderTeamPanel();
  renderOverviewPanels();
  applyEditGates();
  bind();
}

function renderStats() {
  const dC = data.done.length, pC = data.progress.length, plC = data.planned.length, prC = data.priority.length;
  document.getElementById('stat-done').textContent = dC;
  document.getElementById('stat-progress').textContent = pC;
  document.getElementById('stat-planned').textContent = plC;
  document.getElementById('stat-priority').textContent = prC;
  document.getElementById('nav-count-total').textContent = dC + pC + plC + prC;
  document.getElementById('nav-count-done').textContent = dC;
  document.getElementById('nav-count-progress').textContent = pC;
  document.getElementById('nav-count-planned').textContent = plC;
  document.getElementById('nav-count-priority').textContent = prC;
}

/* ─── Render helpers ──────────────────────────────────────────────── */
function devChipsHTML(list, path) {
  const chips = (list || []).map((d, i) => {
    const rm = `<span class="dev-x" data-devdel="${path}.${i}" title="Remove">×</span>`;
    return `<span class="dev-chip">
      <span class="dev-avatar" style="background:${devColor(d)}">${initial(d)}</span>
      ${devSelectHTML(d, `${path}.${i}`)}
      ${rm}
    </span>`;
  }).join('');
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

function renderPlanned() {
  const list = document.getElementById('planned-list');
  list.innerHTML = data.planned.map((p, i) => `
    <div class="planned-row">
      <div class="planned-who">
        <span class="avatar" style="background:${devColor(p.dev)}">${initial(p.dev)}</span>
        ${devSelectHTML(p.dev, `planned.${i}.dev`)}
      </div>
      <span class="planned-arrow">→</span>
      <span class="planned-next" data-path="planned.${i}.next">${escapeHTML(p.next || '')}</span>
      <span class="card-remove" data-del="planned.${i}">× remove</span>
    </div>
  `).join('') + `<button class="add-card-btn" data-add="planned">+ Add developer plan</button>`;
}

function renderPriority() {
  const list = document.getElementById('priority-list');
  list.innerHTML = data.priority.map((p, i) => {
    const st = p.st || 'todo';
    const isNow = st !== 'done';
    return `
      <div class="priority-row${isNow ? ' priority-now' : ''}">
        ${isNow ? '<span class="priority-now-tag">⚡ NOW</span>' : ''}
        <div class="priority-rank">${i + 1}</div>
        <div class="priority-body">
          <div class="priority-item" data-path="priority.${i}.item">${escapeHTML(p.item)}</div>
          <div class="priority-note" data-path="priority.${i}.note">${escapeHTML(p.note || '')}</div>
          ${isNow ? '<div class="priority-deadline">Fix first — before other work</div>' : ''}
        </div>
        <span class="priority-status ${st}" data-stpath="priority.${i}.st">${st === 'done' ? 'Done' : st === 'prog' ? 'In progress' : 'Not started'}</span>
        <div class="priority-arrows">
          <button data-up="${i}" title="Move up">↑</button>
          <button data-down="${i}" title="Move down">↓</button>
        </div>
        <span class="priority-remove" data-del="priority.${i}" title="Remove">×</span>
      </div>
    `;
  }).join('') + `<button class="add-card-btn" data-add="priority">+ Add priority item</button>`;
}

function renderTeamPanel() {
  const list = document.getElementById('team-list');
  const devs = (data.devs || SEED.devs).filter(d => d !== 'TBD');
  list.innerHTML = devs.map(d => `
    <div class="team-dev">
      <span class="avatar" style="background:${devColor(d)}">${initial(d)}</span>
      <span>${escapeHTML(d)}</span>
    </div>
  `).join('');
}

function renderOverviewPanels() {
  const prio = document.getElementById('overview-priority');
  const topPrio = data.priority.filter(p => (p.st || 'todo') !== 'done').slice(0, 3);
  prio.innerHTML = topPrio.length ? topPrio.map(p => `
    <div class="overview-row">
      <span class="overview-rank">${data.priority.indexOf(p) + 1}</span>
      <div class="overview-body">
        <div class="overview-title">${escapeHTML(p.item)}</div>
        <div class="overview-sub">${escapeHTML(p.note || 'No note yet')}</div>
      </div>
      <span class="priority-status ${p.st || 'todo'}">${(p.st || 'todo') === 'prog' ? 'In progress' : 'Not started'}</span>
    </div>
  `).join('') : '<div class="empty">All priority items are Done. Add more.</div>';

  const prog = document.getElementById('overview-progress');
  const activeProg = data.progress.filter(p => (p.pct || 0) < 100).slice(0, 4);
  prog.innerHTML = activeProg.length ? activeProg.map(p => {
    const pct = Math.max(0, Math.min(100, p.pct || 0));
    return `
      <div class="overview-row">
        <div class="overview-body">
          <div class="overview-title">${escapeHTML(p.portal)}</div>
          <div class="overview-sub">${(p.devs || []).map(d => `<span class="mini-chip" style="background:${devColor(d)}22;color:${devColor(d)}">${escapeHTML(d)}</span>`).join(' ')}</div>
        </div>
        <div class="overview-progress-mini">
          <div class="mini-track"><div class="mini-fill" style="width:${pct}%;background:${pct===100?'var(--success)':'var(--warning)'}"></div></div>
          <span class="mini-pct">${pct}%</span>
        </div>
      </div>
    `;
  }).join('') : '<div class="empty">Nothing in progress.</div>';
}

/* ─── Edit-gate: strictly toggle editability based on `editing` ────── */
function applyEditGates() {
  document.body.classList.toggle('editing', editing);
  document.getElementById('edit-btn').textContent = editing ? '✓ Done' : '✎ Edit';
  document.getElementById('edit-hint').textContent = editing ? 'Editing — click ✓ Done when finished' : 'Read-only';
  // Text nodes: only contenteditable in edit mode
  document.querySelectorAll('[data-path]').forEach(el => {
    if (editing) el.setAttribute('contenteditable', 'plaintext-only');
    else el.removeAttribute('contenteditable');
  });
  // Dropdowns: disabled outside edit mode
  document.querySelectorAll('.dev-select').forEach(el => { el.disabled = !editing; });
}

/* ─── Bind (per-render event wiring) ──────────────────────────────── */
function bind() {
  // Editable text
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

  // Dev dropdown
  document.querySelectorAll('.dev-select').forEach(el => {
    el.onchange = () => {
      if (!editing) return;
      const [o, k] = getRef(el.dataset.devpath);
      o[k] = el.value; save();
    };
  });

  // Dev × remove
  document.querySelectorAll('[data-devdel]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const p = el.dataset.devdel.split('.');
      const arr = p.slice(0, -1).reduce((o, x) => o[x], data);
      arr.splice(+p[p.length - 1], 1);
      save();
    };
  });

  // Dev + add
  document.querySelectorAll('[data-devadd]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const [o, k] = getRef(el.dataset.devadd);
      o[k].push('Shafi'); save();
    };
  });

  // Pill toggle
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

  // Card / row remove
  document.querySelectorAll('[data-del]').forEach(el => {
    el.onclick = () => {
      if (!editing) return;
      const p = el.dataset.del.split('.');
      const arr = p.slice(0, -1).reduce((o, x) => o[x], data);
      arr.splice(+p[p.length - 1], 1);
      save();
    };
  });

  // Priority reorder
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

  // Add card / row buttons
  document.querySelectorAll('[data-add]').forEach(b => {
    b.onclick = () => {
      if (!editing) return;
      const s = b.dataset.add;
      if (s === 'done')     data.done.push({ portal: 'New portal', devs: ['Shafi'], note: '' });
      if (s === 'progress') data.progress.push({ portal: 'New portal', devs: ['Shafi'], pct: 0, fe: 'todo', be: 'todo', note: '' });
      if (s === 'planned')  data.planned.push({ dev: 'Shafi', next: '' });
      if (s === 'priority') data.priority.push({ item: 'New priority', st: 'todo', note: '' });
      save();
    };
  });

  // Verify-and-move-to-Done (Audun rule #5)
  document.querySelectorAll('[data-verify]').forEach(b => {
    b.onclick = () => {
      if (!editing) return;
      const i = +b.dataset.verify;
      const p = data.progress[i];
      const ok = confirm(
        `Audun's rule: "Done means YOU verified it — end-to-end, tested as a real user."\n\n` +
        `Have you personally tested "${p.portal}" end-to-end as a real user?\n\n` +
        `Click OK only if yes. Cancel keeps it in In Progress.`
      );
      if (!ok) return;
      data.progress.splice(i, 1);
      data.done.push({ portal: p.portal, devs: p.devs.slice(), note: p.note || 'Verified end-to-end.' });
      save();
      location.hash = '#/done';
    };
  });

  // Stat-card jump on Overview
  document.querySelectorAll('[data-jump]').forEach(el => {
    el.onclick = () => { location.hash = '#/' + el.dataset.jump; };
  });
}

/* ─── Edit-mode toggle ────────────────────────────────────────────── */
document.getElementById('edit-btn').onclick = () => {
  editing = !editing;
  applyEditGates();
};

/* ─── Boot ────────────────────────────────────────────────────────── */
if (!location.hash) location.hash = '#/overview';
swapView(parseHash());
render();
(async () => {
  await load();
  render();
  subscribeRealtime();
})();
