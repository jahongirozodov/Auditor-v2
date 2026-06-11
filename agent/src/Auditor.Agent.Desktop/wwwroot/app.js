'use strict';

// ── State ──────────────────────────────────────────────────────────────
const S = {
  screen:    'loading',
  online:    false,
  audited:   false,
  email:     '',
  tokenMasked: '',
  auditCode: '',
  version:   '',
  serverUrl: '',
  syncInterval: 5,
  drafts:    0,
  pending:   0,
};

let cachedTasks = [];
let prevOnline  = null;

// ── DOM helpers ────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── API ────────────────────────────────────────────────────────────────
const api = {
  async get(path) {
    try { return await (await fetch(path)).json(); } catch { return {}; }
  },
  async post(path, body) {
    try {
      return await (await fetch(path, {
        method: 'POST',
        headers: body ? {'Content-Type':'application/json'} : {},
        body:    body ? JSON.stringify(body) : undefined,
      })).json();
    } catch { return { ok: false, error: 'network' }; }
  },
  async put(path, body) {
    try {
      return await (await fetch(path, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body:    JSON.stringify(body),
      })).json();
    } catch { return { ok: false }; }
  },
  async upload(path, fd) {
    try { return await (await fetch(path, { method: 'POST', body: fd })).json(); }
    catch { return { ok: false }; }
  },
};

// ── Theme ──────────────────────────────────────────────────────────────
function getTheme() { return document.documentElement.getAttribute('data-theme') || 'dark'; }

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
  const ic = $('theme-icon');
  if (ic) ic.innerHTML = t === 'dark' ? ICONS.moon : ICONS.sun;
}

function toggleTheme() { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); }

// ── Toast ──────────────────────────────────────────────────────────────
let _toastT;
function toast(msg, ms = 3200) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  t.offsetHeight;
  t.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 200);
  }, ms);
}

// ── Network banner ─────────────────────────────────────────────────────
let bannerTimer;
function showBanner(online) {
  const b = $('net-banner');
  if (!b) return;
  b.className = `net-banner ${online ? 'online' : 'offline'}`;
  b.innerHTML = online
    ? `${icon('wifi')} Server bilan aloqa tiklandi`
    : `${icon('wifiOff')} Server bilan aloqa uzildi — oflayn rejim`;
  b.classList.add('show');
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => b.classList.remove('show'), 4000);
}

// ── State sync ─────────────────────────────────────────────────────────
async function syncState() {
  const d = await api.get('/api/state');
  Object.assign(S, {
    audited:      d.audited      ?? false,
    email:        d.email        ?? '',
    tokenMasked:  d.tokenMasked  ?? '',
    auditCode:    d.auditCode    ?? '',
    version:      d.version      ?? '',
    serverUrl:    d.serverUrl    ?? '',
    syncInterval: d.syncInterval ?? 5,
    drafts:       d.drafts       ?? 0,
    pending:      d.pending      ?? 0,
  });
  const ping = await api.get('/api/ping');
  const wasOnline = S.online;
  S.online = ping.ok ?? false;
  if (prevOnline !== null && prevOnline !== S.online) showBanner(S.online);
  prevOnline = S.online;
}

// ── Shell ──────────────────────────────────────────────────────────────
function renderShell() {
  const sidebar   = $('sidebar');
  const statusbar = $('statusbar');

  if (!S.audited) {
    sidebar?.classList.add('hidden');
    statusbar?.classList.add('hidden');
    return;
  }

  sidebar?.classList.remove('hidden');
  statusbar?.classList.remove('hidden');

  const tc = $('nav-token');
  if (tc) {
    tc.innerHTML = `
      <div class="field-label" style="font-size:9.5px">AUDIT TOKEN</div>
      <div class="token-code">${esc(S.tokenMasked || S.auditCode)}</div>
      <div class="token-audit">${esc(S.auditCode)}</div>
    `;
  }

  const nl = $('nav-list');
  if (nl) {
    nl.innerHTML = [
      ni('tasks',    'tasks',    'Mening vazifalarim'),
      ni('findings', 'findings', 'Findinglar (lokal)', S.drafts),
      ni('files',    'files',    'Fayllar'),
      ni('sync',     'sync',     'Sinxronlash', S.pending),
      ni('log',      'log',      'Lokal log'),
      ni('settings', 'settings', 'Sozlamalar'),
    ].join('');
    nl.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => nav(el.dataset.screen));
    });
  }

  const ti = $('theme-icon');
  if (ti) ti.innerHTML = getTheme() === 'dark' ? ICONS.moon : ICONS.sun;

  const sb = $('statusbar');
  if (sb) {
    const dot = S.online
      ? '<span class="dot dot-online"></span>'
      : '<span class="dot dot-offline"></span>';
    sb.innerHTML = `
      <div class="status-left">
        ${dot}
        <span>${S.online ? 'Onlayn' : 'Oflayn'}</span>
        <span class="status-sep">·</span>
        <span>Qoralama: ${S.drafts}</span>
        <span>Yuborilmagan: ${S.pending}</span>
      </div>
      <div class="status-right">
        <span>${esc(S.email)}</span>
        <span>v${esc(S.version)}</span>
      </div>
    `;
  }
}

function ni(screen, iconName, label, badge) {
  const active = S.screen === screen ? 'active' : '';
  const b = (badge ?? 0) > 0 ? `<span class="badge">${badge}</span>` : '';
  return `<button class="nav-item ${active}" data-screen="${screen}" aria-current="${active ? 'page' : 'false'}">
    <span class="nav-icon">${icon(iconName)}</span>
    <span class="nav-label">${label}</span>${b}
  </button>`;
}

// ── Router ─────────────────────────────────────────────────────────────
async function nav(screen, params = {}) {
  S.screen = screen;
  renderShell();
  const c = $('content');
  if (c) {
    c.innerHTML = '';
    c.classList.remove('screen-enter');
    c.offsetHeight;
    c.classList.add('screen-enter');
  }
  const fn = SCREENS[screen];
  if (fn) await fn(params);
}

// ── Helpers ────────────────────────────────────────────────────────────
function humanSize(b) {
  b = Number(b) || 0;
  if (b >= 1048576) return (b/1048576).toFixed(1)+' MB';
  if (b >= 1024)    return (b/1024).toFixed(1)+' KB';
  return b+' B';
}

function statusOf(s) {
  const m = {
    done:       ['Bajarilgan', 'success'],
    in_progress:['Jarayonda',  'info'],
    blocked:    ['Bloklangan', 'danger'],
    review:     ['Tekshiruvda','info'],
    returned:   ['Qaytarilgan','ghost'],
  };
  const [label, kind] = m[s] ?? ['Yangi', 'ghost'];
  return { label, kind };
}

function stateKind(s) {
  return { synced:'success', syncing:'info', failed:'danger' }[String(s).toLowerCase()] ?? 'ghost';
}
function stateLabel(s) {
  return { synced:'Yuborildi', syncing:'Yuborilmoqda', failed:'Xato', pending:'Navbatda' }[String(s).toLowerCase()] ?? 'Navbatda';
}
function filterBtn(key, label, active) {
  return `<button class="filter-btn${active===key?' active':''}" data-filter="${key}">${label}</button>`;
}

// ── Severity pill selector ─────────────────────────────────────────────
function sevPicker(selected = 'high') {
  return `<div class="sev-picker" id="sev-picker">
    ${['critical','high','medium','low'].map(s =>
      `<button class="sev-pill${s===selected?' selected':''}" data-sev="${s}" type="button">${s.charAt(0).toUpperCase()+s.slice(1)}</button>`
    ).join('')}
  </div>`;
}
function bindSevPicker(onchange) {
  $('sev-picker')?.querySelectorAll('.sev-pill').forEach(b => {
    b.addEventListener('click', () => {
      $('sev-picker').querySelectorAll('.sev-pill').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      if (onchange) onchange(b.dataset.sev);
    });
  });
}

// ── SCREENS ────────────────────────────────────────────────────────────
const SCREENS = {

  async login() {
    $('content').innerHTML = `
      <div class="login-hero">
        <div class="auth-card">
          <div class="brand-icon">${icon('shield')}</div>
          <h1 class="auth-title">Auditor Agent</h1>
          <p class="auth-sub">Lokal akkaunt bilan kiring</p>

          <div class="field-group">
            <label class="field-label" for="l-email">LOGIN</label>
            <input id="l-email" class="input" type="email" value="${esc(S.email)}" placeholder="email@domain.uz" autocomplete="username">
          </div>
          <div class="field-group">
            <label class="field-label" for="l-pass">PAROL</label>
            <input id="l-pass" class="input" type="password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <div id="l-err" class="error-msg hidden"></div>
          <button id="l-btn" class="btn btn-primary" style="margin-top:20px;width:100%">Kirish</button>
        </div>
      </div>
    `;

    const btn = $('l-btn'), emailIn = $('l-email'), passIn = $('l-pass'), errEl = $('l-err');

    async function doLogin() {
      const e = emailIn.value.trim(), p = passIn.value;
      if (!e || !p) { errEl.textContent = 'Login va parolni kiriting'; errEl.classList.remove('hidden'); return; }
      btn.disabled = true; btn.textContent = 'Kirilmoqda…';
      const res = await api.post('/api/login', { email: e, password: p });
      btn.disabled = false; btn.textContent = 'Kirish';
      if (res.ok) {
        S.email = e;
        await syncState(); renderShell();
        await nav(S.audited ? 'tasks' : 'token');
      } else {
        const msgs = {
          invalid_credentials: 'Login yoki parol notoʿgʿri',
          locked:              'Hisob vaqtincha bloklangan',
          offline_no_credential: 'Serverga ulanib boʿlmadi — sozlamalardagi manzilni tekshiring',
        };
        errEl.textContent = msgs[res.error] ?? 'Kirishda xatolik';
        errEl.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', doLogin);
    passIn.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
    emailIn.focus();
  },

  async token() {
    $('content').innerHTML = `
      <div class="login-hero">
        <div class="auth-card">
          <button id="t-back" class="btn btn-ghost" style="align-self:flex-start;margin-bottom:16px">
            ${icon('chevronLeft')} Orqaga
          </button>
          <h2 class="auth-title" style="font-size:20px">Audit tokenini kiriting</h2>
          <p class="auth-sub">Server tomonidan berilgan bir martalik token</p>
          <div class="field-group">
            <label class="field-label" for="t-tok">AUDIT TOKENI</label>
            <input id="t-tok" class="input mono" placeholder="tok-xxxxxxxxxxxxxxxx">
          </div>
          <div id="t-err" class="error-msg hidden"></div>
          <button id="t-btn" class="btn btn-primary" style="margin-top:20px;width:100%">Tasdiqlash</button>
        </div>
      </div>
    `;

    $('t-back').addEventListener('click', () => nav('login'));
    const btn = $('t-btn'), tokIn = $('t-tok'), errEl = $('t-err');

    async function doValidate() {
      const t = tokIn.value.trim();
      if (!t) { errEl.textContent = 'Tokenni kiriting'; errEl.classList.remove('hidden'); return; }
      btn.disabled = true; btn.textContent = 'Tekshirilmoqda…';
      const res = await api.post('/api/token/validate', { token: t });
      btn.disabled = false; btn.textContent = 'Tasdiqlash';
      if (res.ok) { await syncState(); renderShell(); await nav('tasks'); }
      else {
        const msgs = { not_found:'Token topilmadi', expired:'Token muddati tugagan', token_inactive:'Token faol emas' };
        errEl.textContent = msgs[res.error] ?? 'Token tekshirilmadi';
        errEl.classList.remove('hidden');
      }
    }

    btn.addEventListener('click', doValidate);
    tokIn.addEventListener('keydown', e => { if (e.key === 'Enter') doValidate(); });
    tokIn.focus();
  },

  async tasks() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Mening vazifalarim</h1><p class="meta" id="t-sum"></p></div>
        <button id="t-sync" class="btn btn-soft">${icon('refresh')} Sinxronlash</button>
      </div>
      <div class="panel stagger" id="t-list"><div class="loading">Yuklanmoqda…</div></div>
    `;
    $('t-sync').addEventListener('click', async () => {
      $('t-sync').disabled = true;
      const r = await api.post('/api/sync');
      const tsyncBtn = $('t-sync');
      if (tsyncBtn) tsyncBtn.disabled = false;
      if (r.requiresReauth) { toast('Audit tokeni yaroqsiz. Qayta kiriting.'); await nav('token'); return; }
      toast(r.online ? `Sync: ${r.created} yuborildi` : 'Server oflayn');
      await syncState(); renderShell(); await loadTasks();
    });
    await loadTasks();
  },

  async findings() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Findinglar (lokal)</h1><p class="meta" id="f-sum"></p></div>
        <button id="f-new" class="btn btn-primary">${icon('plus')} Yangi finding</button>
      </div>
      <div class="filter-bar" id="f-bar"></div>
      <div class="panel stagger" id="f-list"><div class="loading">Yuklanmoqda…</div></div>
    `;
    $('f-new').addEventListener('click', async () => {
      if (!cachedTasks.length) cachedTasks = await api.get('/api/tasks');
      const t = cachedTasks[0];
      if (t) await nav('new-finding', { taskId: t.id, taskTitle: t.title });
      else toast('Avval vazifalar yuklanishi kerak');
    });
    let active = 'all';
    await loadFindings();

    async function loadFindings() {
      const list = await api.get('/api/findings');
      if (!Array.isArray(list)) {
        const fl = $('f-list');
        if (fl) fl.innerHTML = `<div class="empty-state">Ma'lumot yuklanmadi</div>`;
        return;
      }
      const counts = {
        all:     list.length,
        draft:   list.filter(f => f.state === 'draft').length,
        syncing: list.filter(f => f.state === 'syncing').length,
        sent:    list.filter(f => f.state === 'sent').length,
        error:   list.filter(f => f.state === 'error').length,
      };
      const sumEl = $('f-sum'); if (sumEl) sumEl.textContent = `${counts.all} ta finding`;
      const bar = $('f-bar');
      if (bar) {
        bar.innerHTML = [
          filterBtn('all',     `Hammasi (${counts.all})`,       active),
          filterBtn('draft',   `Qoralama (${counts.draft})`,    active),
          filterBtn('syncing', `Sinxronda (${counts.syncing})`, active),
          filterBtn('sent',    `Yuborilgan (${counts.sent})`,   active),
          filterBtn('error',   `Xato (${counts.error})`,        active),
        ].join('');
        bar.querySelectorAll('.filter-btn').forEach(b => {
          b.addEventListener('click', () => { active = b.dataset.filter; loadFindings(); });
        });
      }
      const visible = active === 'all' ? list : list.filter(f => f.state === active);
      const fl = $('f-list'); if (!fl) return;
      if (!visible.length) { fl.innerHTML = `<div class="empty-state">Finding topilmadi</div>`; return; }
      fl.innerHTML = visible.map(f => `
        <div class="list-item" data-sev="${esc(f.severity)}">
          <div class="list-item-main">
            <span class="sev sev-${esc(f.severity)}">${esc(f.severity.toUpperCase())}</span>
            <div class="list-item-info">
              <div class="list-item-title">${esc(f.title)}</div>
              <div class="meta">CVSS ${esc(String((f.cvss||0).toFixed(1)))}${f.cwe?' · '+esc(f.cwe):''}${f.asset?' · '+esc(f.asset):''} · ${esc(f.taskId)}${f.evidenceCount?` · ${f.evidenceCount} dalil`:''}</div>
            </div>
          </div>
          <span class="tag tag-${esc(f.stateKind)}">${esc(f.stateLabel)}</span>
        </div>
      `).join('');
    }
  },

  async 'new-finding'({ taskId = '', taskTitle = '' } = {}) {
    if (!cachedTasks.length) cachedTasks = await api.get('/api/tasks');
    const opts = cachedTasks.map(t =>
      `<option value="${esc(t.id)}" ${t.id === taskId ? 'selected' : ''}>${esc(t.title)}</option>`
    ).join('');

    $('content').innerHTML = `
      <div class="form-page">
        <div class="page-header">
          <div><h1 class="h1">Yangi finding</h1><p class="meta">${esc(taskId)}${taskTitle?' · '+esc(taskTitle):''}</p></div>
          <span class="tag tag-warning">Lokal qoralama</span>
        </div>

        <div class="form-section">
          <div class="form-section-title">Asosiy ma'lumot</div>
          <label class="field-label" for="nf-task">VAZIFA *</label>
          <select id="nf-task" class="input">${opts}</select>
          <div class="field-group">
            <label class="field-label" for="nf-title">SARLAVHA *</label>
            <input id="nf-title" class="input" placeholder="Topilma nomini yozing">
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Texnik tafsilotlar</div>
          <label class="field-label">XAVf DARAJASI</label>
          ${sevPicker('high')}
          <div class="form-row" style="margin-top:14px">
            <div>
              <label class="field-label" for="nf-cvss">CVSS 3.1</label>
              <input id="nf-cvss" class="input mono" type="number" min="0" max="10" step="0.1" value="5.0">
            </div>
            <div>
              <label class="field-label" for="nf-cwe">CWE</label>
              <input id="nf-cwe" class="input mono" placeholder="CWE-284">
            </div>
            <div>
              <label class="field-label" for="nf-asset">ASSET</label>
              <input id="nf-asset" class="input mono" placeholder="FW-CORE-01">
            </div>
          </div>
          <div class="field-group">
            <label class="field-label" for="nf-desc">TAVSIF</label>
            <textarea id="nf-desc" class="input" rows="4" placeholder="Topilma tavsifi, ta'siri va tekshirish qadamlari"></textarea>
          </div>
        </div>

        <div class="form-section">
          <div class="form-section-title">Dalillar</div>
          <div class="drop-zone" id="nf-dropzone">
            ${icon('upload')}
            <p style="margin-bottom:8px">Fayllarni bu yerga tashlang yoki tanlang</p>
            <input id="nf-ev" type="file" multiple style="display:none">
            <button class="btn btn-soft" type="button" id="nf-pick">Biriktirish</button>
          </div>
          <div id="nf-chips" class="chips" style="margin-top:8px"></div>
        </div>

        <div id="nf-err" class="error-msg hidden"></div>
        <div class="form-actions">
          <button id="nf-cancel" class="btn btn-ghost">Bekor</button>
          <button id="nf-save"   class="btn btn-soft">Lokal saqlash</button>
          <button id="nf-send"   class="btn btn-primary">Yuborish</button>
        </div>
      </div>
    `;

    let selSev = 'high';
    bindSevPicker(s => { selSev = s; });

    $('nf-pick').addEventListener('click', e => { e.stopPropagation(); $('nf-ev').click(); });

    const ev = [];
    $('nf-ev').addEventListener('change', e => {
      Array.from(e.target.files).forEach(f => { if (!ev.find(x => x.name === f.name)) ev.push(f); });
      renderChips();
    });
    $('nf-dropzone').addEventListener('click', e => {
      if (e.target === $('nf-dropzone') || e.target.tagName === 'P' || e.target.tagName === 'SPAN') $('nf-ev').click();
    });
    $('nf-dropzone').addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--brand)'; });
    $('nf-dropzone').addEventListener('dragleave', e => { e.currentTarget.style.borderColor = ''; });
    $('nf-dropzone').addEventListener('drop', e => {
      e.preventDefault(); e.currentTarget.style.borderColor = '';
      Array.from(e.dataTransfer.files).forEach(f => { if (!ev.find(x => x.name === f.name)) ev.push(f); });
      renderChips();
    });

    function renderChips() {
      $('nf-chips').innerHTML = ev.map((f, i) => `
        <div class="chip">
          <span>${esc(f.name)}</span>
          <span class="chip-size">${humanSize(f.size)}</span>
          <button class="chip-remove" data-i="${i}" type="button">×</button>
        </div>
      `).join('');
      $('nf-chips').querySelectorAll('.chip-remove').forEach(b => {
        b.addEventListener('click', () => { ev.splice(+b.dataset.i, 1); renderChips(); });
      });
    }

    function validate() {
      const t = $('nf-title').value.trim();
      const c = parseFloat($('nf-cvss').value);
      const e = $('nf-err');
      if (t.length < 3) { e.textContent = 'Sarlavha kamida 3 ta belgi'; e.classList.remove('hidden'); return false; }
      if (isNaN(c)||c<0||c>10) { e.textContent = 'CVSS 0–10 oraligʿida'; e.classList.remove('hidden'); return false; }
      e.classList.add('hidden'); return true;
    }

    async function persist() {
      const body = {
        taskId:      $('nf-task').value,
        title:       $('nf-title').value.trim(),
        severity:    selSev,
        cvss:        parseFloat($('nf-cvss').value) || 5.0,
        cwe:         $('nf-cwe').value.trim() || 'CWE-284',
        asset:       $('nf-asset').value.trim(),
        description: $('nf-desc').value.trim(),
      };
      const res = await api.post('/api/findings', body);
      if (res.ok) {
        for (const file of ev) {
          const fd = new FormData(); fd.append('file', file); fd.append('findingKey', res.key);
          await api.upload('/api/evidence', fd);
        }
      }
      return res;
    }

    $('nf-cancel').addEventListener('click', () => nav('findings'));
    $('nf-save').addEventListener('click', async () => {
      if (!validate()) return;
      $('nf-save').disabled = true;
      const res = await persist();
      $('nf-save').disabled = false;
      if (res.ok) { toast('Finding lokal saqlandi'); await syncState(); await nav('findings'); }
    });
    $('nf-send').addEventListener('click', async () => {
      if (!validate()) return;
      $('nf-send').disabled = true; $('nf-send').textContent = 'Yuborilmoqda…';
      const res = await persist();
      if (res.ok) {
        const sync = await api.post('/api/sync');
        toast(sync.online ? `Finding yuborildi (${sync.created})` : 'Lokal saqlandi — server oflayn');
        await syncState(); await nav('findings');
      }
      const btn2 = $('nf-send');
      if (btn2) { btn2.disabled = false; btn2.textContent = 'Yuborish'; }
    });
  },

  async files() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Lokal dalillar</h1><p class="meta">Barcha biriktirma fayllar</p></div>
        <label class="btn btn-soft" style="cursor:pointer">
          ${icon('upload')} Fayl biriktirish
          <input id="g-ev" type="file" multiple style="display:none">
        </label>
      </div>
      <div id="files-grid" class="files-grid stagger"><div class="loading">Yuklanmoqda…</div></div>
    `;
    $('g-ev').addEventListener('change', async e => {
      for (const f of e.target.files) {
        const fd = new FormData(); fd.append('file', f);
        await api.upload('/api/evidence', fd);
      }
      toast(`${e.target.files.length} fayl biriktiridi`);
      await loadFiles();
    });
    async function loadFiles() {
      const list = await api.get('/api/evidence');
      const grid = $('files-grid'); if (!grid) return;
      if (!list.length) { grid.innerHTML = `<div class="empty-state">Fayl topilmadi</div>`; return; }
      const fileIcon = ext => /png|jpg|jpeg|gif/.test(ext)?icon('files'):/pcap/.test(ext)?icon('sync'):/csv/.test(ext)?icon('log'):icon('files');
      grid.innerHTML = list.map(f => {
        const ext = (f.filename||'').split('.').pop()?.toLowerCase()||'';
        return `
          <div class="file-tile">
            <div class="file-icon">${fileIcon(ext)}</div>
            <div class="file-name">${esc(f.filename)}</div>
            <div class="meta">${humanSize(f.sizeBytes)}</div>
            <span class="tag tag-${esc(stateKind(f.state))}">${esc(stateLabel(f.state))}</span>
          </div>
        `;
      }).join('');
    }
    await loadFiles();
  },

  async sync() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Sinxronlash</h1><p class="meta">Server bilan ma'lumotlarni almashtirish navbati</p></div>
        <button id="s-now" class="btn btn-primary">${icon('refresh')} Hozir sinxronla</button>
      </div>
      <div id="s-banner" class="banner"></div>
      <div class="panel" style="margin-bottom:14px">
        <div class="panel-header">Yuborish navbati</div>
        <div id="s-queue" class="stagger"></div>
      </div>
      <div class="field-label" style="margin-bottom:6px">Oxirgi sinxronlash loglari</div>
      <textarea id="s-logs" class="input mono" rows="8" readonly style="resize:none"></textarea>
    `;
    async function loadSync() {
      const [ping, findings, evidence, logs] = await Promise.all([
        api.get('/api/ping'), api.get('/api/findings'),
        api.get('/api/evidence'), api.get('/api/logs'),
      ]);
      const safeFindings = Array.isArray(findings) ? findings : [];
      const safeEvidence = Array.isArray(evidence) ? evidence : [];
      const safeLogs     = Array.isArray(logs)     ? logs     : [];
      const online = ping.ok ?? false;
      const banner = $('s-banner');
      if (banner) banner.innerHTML = online
        ? `<div class="banner-success">${icon('check')} Onlayn · server bilan aloqada</div>`
        : `<div class="banner-warning">${icon('wifiOff')} Oflayn · server bilan aloqa yoʿq</div>`;
      const queue = [
        ...safeFindings.filter(f=>f.state==='draft').map(f=>({ item:`Finding — ${f.title}`, size:'—' })),
        ...safeEvidence.filter(e=>String(e.state).toLowerCase()==='pending').map(e=>({ item:e.filename, size:humanSize(e.sizeBytes) })),
      ];
      const sq = $('s-queue');
      if (sq) sq.innerHTML = queue.length
        ? queue.map(q=>`<div class="list-item"><span>${esc(q.item)}</span><div><span class="meta">${esc(q.size)}</span> <span class="tag tag-ghost" style="margin-left:6px">Navbatda</span></div></div>`).join('')
        : `<div class="empty-state" style="padding:14px">Navbat boʿsh</div>`;
      const sl = $('s-logs');
      if (sl) { sl.value = safeLogs.slice(-40).map(l=>`[${l.ts}] ${String(l.level).padEnd(5)} ${l.message}`).join('\n'); sl.scrollTop=sl.scrollHeight; }
    }
    $('s-now').addEventListener('click', async () => {
      $('s-now').disabled=true; $('s-now').innerHTML=`${icon('refresh')} Sinxronlanmoqda…`;
      const r = await api.post('/api/sync');
      const snowBtn = $('s-now');
      if (snowBtn) { snowBtn.disabled=false; snowBtn.innerHTML=`${icon('refresh')} Hozir sinxronla`; }
      if (r.requiresReauth) { toast('Audit tokeni yaroqsiz.'); await nav('token'); return; }
      toast(r.online?`${r.created} finding, ${r.evidenceSent} fayl yuborildi`:'Server oflayn — keyinroq');
      await syncState(); renderShell(); await loadSync();
    });
    await loadSync();
  },

  async log() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Lokal log</h1><p class="meta">Soʿnggi 200 ta yozuv</p></div>
        <button id="lg-ref" class="btn btn-ghost">${icon('refresh')} Yangilash</button>
      </div>
      <div id="lg-box" class="log-box">Yuklanmoqda…</div>
    `;
    async function load() {
      const logs = await api.get('/api/logs');
      const box = $('lg-box'); if (!box) return;
      box.innerHTML = logs.map(l => {
        const cls = l.level==='ERROR'?'log-error':l.level==='WARN'?'log-warn':'';
        return `<div class="log-line ${cls}"><span class="log-ts">${esc(l.ts)}</span><span class="log-lvl">${esc(l.level)}</span><span>${esc(l.message)}</span></div>`;
      }).join('');
      box.scrollTop = box.scrollHeight;
    }
    $('lg-ref').addEventListener('click', load);
    await load();
  },

  async settings() {
    const cfg = await api.get('/api/settings');
    $('content').innerHTML = `
      <div style="max-width:560px">
        <div class="page-header"><div><h1 class="h1">Sozlamalar</h1></div></div>

        <div class="panel" style="margin-bottom:12px">
          <div class="panel-header">Server ulanishi</div>
          <div style="padding:16px">
            <label class="field-label" for="cfg-url">SERVER MANZILI</label>
            <input id="cfg-url" class="input mono" value="${esc(cfg.serverUrl??'')}" placeholder="https://auditor.example.com">
            <div class="field-group">
              <label class="field-label" for="cfg-int">AUTO-SYNC INTERVALI (DAQIQA)</label>
              <input id="cfg-int" class="input" type="number" min="1" max="60" value="${esc(String(cfg.syncInterval??5))}">
            </div>
            <button id="cfg-save" class="btn btn-primary" style="margin-top:16px">Saqlash</button>
          </div>
        </div>

        <div class="panel" style="margin-bottom:12px">
          <div class="panel-header">Tizim ma'lumotlari</div>
          <div class="settings-row"><span class="meta">Shifrlash</span><span class="mono" style="color:var(--text-secondary);font-size:11px">${esc(cfg.encryption??'')}</span></div>
          <div class="settings-row"><span class="meta">Versiya</span><span class="mono" style="color:var(--text-secondary)">v${esc(cfg.version??'')}</span></div>
          <div style="padding:12px 16px">
            <button id="cfg-upd" class="btn btn-ghost">Yangilanishni tekshirish</button>
            <p id="cfg-upd-msg" class="meta" style="margin-top:8px"></p>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">Sessiya</div>
          <div style="padding:16px">
            <p class="meta" style="margin-bottom:12px">Chiqishda lokal sessiya oʿchadi.</p>
            <button id="cfg-logout" class="btn btn-danger">Chiqish</button>
          </div>
        </div>
      </div>
    `;
    $('cfg-save').addEventListener('click', async () => {
      $('cfg-save').disabled=true;
      await api.put('/api/settings', { serverUrl:$('cfg-url').value.trim(), syncInterval:parseInt($('cfg-int').value)||5 });
      const saveBtn = $('cfg-save');
      if (saveBtn) saveBtn.disabled=false;
      toast('Sozlamalar saqlandi');
    });
    $('cfg-upd').addEventListener('click', async () => {
      $('cfg-upd').disabled=true;
      const r = await api.post('/api/update-check');
      const updBtn = $('cfg-upd');
      if (updBtn) updBtn.disabled=false;
      const updMsg = $('cfg-upd-msg');
      if (updMsg) updMsg.textContent = r.available?`Yangi versiya mavjud: v${r.latest}`:'Eng soʿnggi versiya oʿrnatilgan';
    });
    $('cfg-logout').addEventListener('click', async () => {
      await api.post('/api/logout'); S.audited=false; S.email=''; await nav('login');
    });
  },
};

// ── Tasks loader (shared) ──────────────────────────────────────────────
async function loadTasks() {
  const tasks = await api.get('/api/tasks');
  if (!Array.isArray(tasks)) {
    const list = $('t-list');
    if (list) list.innerHTML = `<div class="empty-state">Ma'lumot yuklanmadi</div>`;
    return;
  }
  cachedTasks = tasks;
  const sumEl = $('t-sum');
  if (sumEl) {
    const ip = tasks.filter(t=>t.status==='in_progress').length;
    const fr = tasks.filter(t=>t.status==='new').length;
    sumEl.textContent = `${tasks.length} ta vazifa · ${ip} jarayonda · ${fr} yangi`;
  }
  const list = $('t-list'); if (!list) return;
  if (!tasks.length) { list.innerHTML=`<div class="empty-state">Vazifalar topilmadi</div>`; return; }
  list.innerHTML = tasks.map(t => {
    const st = statusOf(t.status);
    return `
      <div class="list-item" data-sev="${t.findings>0?'high':''}">
        <div class="list-item-main">
          <div class="list-item-info">
            <div class="list-item-title">${esc(t.title)}</div>
            <div class="meta">${esc(t.type)} · ${esc(t.priority)} · ${esc(t.due)}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          ${t.findings>0?`<span class="meta">${t.findings} finding</span>`:''}
          <span class="tag tag-${esc(st.kind)}">${esc(st.label)}</span>
          <div class="quick-actions">
            <button class="btn btn-soft" style="font-size:11px;padding:4px 10px" data-tid="${esc(t.id)}" data-ttitle="${esc(t.title)}">
              ${icon('plus')} Finding
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  list.querySelectorAll('[data-tid]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      nav('new-finding', { taskId:btn.dataset.tid, taskTitle:btn.dataset.ttitle });
    });
  });
}

// ── Sidebar theme toggle wire-up ───────────────────────────────────────
function wireSidebarAndTheme() {
  $('theme-btn')?.addEventListener('click', () => {
    toggleTheme();
    const ti = $('theme-icon');
    if (ti) ti.innerHTML = getTheme()==='dark' ? ICONS.moon : ICONS.sun;
  });
}

// ── Background ping ────────────────────────────────────────────────────
setInterval(async () => {
  const was = S.online;
  const r = await api.get('/api/ping');
  S.online = r.ok ?? false;
  if (S.online !== was) {
    if (prevOnline !== null) showBanner(S.online);
    prevOnline = S.online;
    if (S.audited) renderShell();
  }
}, 12000);

// ── Init ───────────────────────────────────────────────────────────────
(async () => {
  wireSidebarAndTheme();
  await syncState();
  if (S.audited) await nav('tasks');
  else await nav('login');
})();
