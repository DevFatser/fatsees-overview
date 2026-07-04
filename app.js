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
const SECTIONS = ['overview-top', 'done', 'progress', 'planned', 'priority'];

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
    // Shafi — 4 atomic cards
    { dev: 'Shafi',  next: 'UIUX design pass across portals' },
    { dev: 'Shafi',  next: 'Founders (final e2e review)' },
    { dev: 'Shafi',  next: 'VideoPay (testing before ship)' },
    { dev: 'Shafi',  next: 'Push Dev → main' },
    // Victor — 4 atomic cards
    { dev: 'Victor', next: 'Supabase Branching' },
    { dev: 'Victor', next: 'LiveKit Phase 4c-2 adapter (Fat for life)' },
    { dev: 'Victor', next: 'Mollie checkout on /leie, /leie-eiendom, /eiendom' },
    { dev: 'Victor', next: 'Fat AI integration on /leie, /leie-eiendom, /eiendom' },
    // Apple — 2 atomic cards
    { dev: 'Apple',  next: 'Jobs' },
    { dev: 'Apple',  next: 'Motor (after Shafi redesign)' },
    // Nahid: next work is Equity (/aksjer), which lives in the Priority queue (#1).
  ],
  priority: [
    { item: 'Equity (/aksjer)',                                        st: 'todo', note: 'TOP priority — rides on Freja Identified + escrow + dual-check moderation gate.' },
    { item: 'Fat for life (/ai) + Founders (/founders)',               st: 'prog', note: 'Fat for life ~50% (LiveKit voice is the gap); Founders ~90% (e2e punchlist to close).' },
    { item: 'Dashboard + custom handles',                              st: 'prog', note: '~65% — bare-namespace fatsees.com/[name] → Dashboard.' },
    { item: 'Community (/community)',                                  st: 'done', note: 'Portal shipped; support / help surface still to add.' },
    { item: 'VideoPay (/video)',                                       st: 'prog', note: '~70% (PR E + e2e). FE + BE done; testing ongoing.' },
    { item: 'Real Estate (/eiendom) + Motor (/motor)',                 st: 'prog', note: 'Real Estate ~90% (Fat AI integ left); Motor shipped. Finn-parity, NL search.' },
    { item: 'Marketplace (/marketplace)',                              st: 'done', note: 'Shipped — the buy/sell + escrow + fee reference path other transactional portals reuse.' },
    { item: 'Jobs (/jobs)',                                            st: 'todo', note: '' },
    { item: 'Work Marketplace (/services)',                            st: 'todo', note: '' },
    { item: 'Suppliers (/suppliers)',                                  st: 'todo', note: 'Works with zero inventory (Fat web-search).' },
    { item: 'Rent Anything (/leie) + Property Rental (/leie-eiendom)', st: 'prog', note: 'Both ~85% (Fat AI + Mollie integ left).' },
    { item: 'Apps (/apps)',                                            st: 'todo', note: '' },
    { item: 'Charity (/charity)',                                      st: 'todo', note: '' },
    { item: 'World of Business (/world)',                              st: 'todo', note: '' },
  ],
};

/* ─── Supabase client ─────────────────────────────────────────────── */
const supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ─── App state ───────────────────────────────────────────────────── */
let data = structuredClone(SEED);
let editing = false;
let saveTimer = null;
let realtimeChannel = null;

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
      <div class="ready-badge">✓ Ready to test</div>
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
  // Audun's spec: priority = ranked queue of tasks nobody is working on right now.
  // Items that move to prog/done leave the queue. Underlying data is preserved —
  // toggling the status pill back to 'todo' brings them back into the visible queue.
  const queue = data.priority
    .map((p, i) => ({ p, i, st: p.st || 'todo' }))
    .filter(x => x.st === 'todo');
  const rowsHTML = queue.map(({ p, i }, displayIdx) => `
    <div class="priority-row">
      <div class="priority-rank">${displayIdx + 1}</div>
      <div class="priority-body">
        <div class="priority-item" data-path="priority.${i}.item">${escapeHTML(p.item)}</div>
        <div class="priority-note" data-path="priority.${i}.note">${escapeHTML(p.note || '')}</div>
      </div>
      <span class="priority-status todo" data-stpath="priority.${i}.st" title="Click in edit mode: mark 'In progress' to dequeue, or 'Done' if shipped">Not started</span>
      <div class="priority-arrows">
        <button data-up="${i}" title="Move up">↑</button>
        <button data-down="${i}" title="Move down">↓</button>
      </div>
      <span class="priority-remove" data-del="priority.${i}" title="Remove">×</span>
    </div>
  `).join('');
  const emptyHTML = queue.length ? '' :
    '<div class="empty-queue">Queue is empty — every priority item has been picked up. Add a new one, or unmark one in the data.</div>';
  list.innerHTML = rowsHTML + emptyHTML + `<button class="add-card-btn" data-add="priority">+ Add priority item</button>`;
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
      if (s === 'planned')  data.planned.push({ dev: 'Shafi', next: '' });
      if (s === 'priority') data.priority.push({ item: 'New priority', st: 'todo', note: '' });
      save();
    };
  });

  // Verify-and-move-to-Done (mechanism, not display)
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
}

/* ─── Sidebar + stat-card scroll nav ──────────────────────────────── */
document.querySelectorAll('[data-scroll]').forEach(el => {
  el.addEventListener('click', (e) => {
    const target = document.getElementById(el.dataset.scroll);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + el.dataset.scroll);
  });
});

/* ─── Scroll-spy: highlight the sidebar item for the visible section  */
function updateActiveNav() {
  const y = window.scrollY + 140;
  let current = 'overview-top';
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top + window.scrollY <= y) current = id;
  }
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.scroll === current);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });

/* ─── Edit-mode toggle ────────────────────────────────────────────── */
document.getElementById('edit-btn').onclick = () => {
  editing = !editing;
  applyEditGates();
};

/* ─── Boot ────────────────────────────────────────────────────────── */
render();
(async () => {
  await load();
  render();
  subscribeRealtime();
  updateActiveNav();
})();
