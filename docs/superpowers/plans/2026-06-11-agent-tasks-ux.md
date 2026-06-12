# Agent Task UX Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three related UX gaps in the desktop agent tasks screen: hide the "Finding" quick-action on terminal tasks, add hover status-change buttons per task state, and add a filter bar (Hammasi / Faol / Bajarilgan / Bekor qilingan).

**Architecture:** One new Kestrel route in `LocalApiHost.cs` (`POST /api/tasks/{id}/status`) backed by the already-present `AgentService.ToggleTaskStatus()`. All UI changes live in the `loadTasks()` function and `SCREENS.tasks` screen definition in `app.js` — no new files.

**Tech Stack:** .NET 8 Kestrel (ASP.NET Core Minimal APIs), vanilla JS (no framework, no bundler), existing `filterBtn()` / `icon()` / `toast()` helpers already in `app.js`.

---

## File Map

| File | Change |
|---|---|
| `agent/src/Auditor.Agent.Desktop/LocalApi/LocalApiHost.cs` | Add `POST /api/tasks/{id}/status` route + `TaskStatusBody` record |
| `agent/src/Auditor.Agent.Desktop/wwwroot/app.js` | Add `activeTaskFilter` state, filter bar in `SCREENS.tasks`, refactor `loadTasks()` |

---

## Context & Business Rules

**Status machine (from `docs/04-workflows.md` + grill-me session):**
- States: `new`, `assigned`, `in_progress`/`inprogress`, `review`, `returned`, `done`, `approved`, `cancelled`, `blocked`
- Terminal states (no further transitions, no finding creation): `done`, `approved`, `cancelled`
- Transitions allowed from the agent (auditor t1 only):
  - `assigned` → `in_progress` (label "Boshlash")
  - `in_progress` / `inprogress` → `review` (label "Tekshiruvga")
  - `returned` → `in_progress` (label "Qayta boshlash")
- Offline status change: block with toast, do NOT queue locally

**Filter groups:**
- Faol = `new`, `assigned`, `in_progress`, `inprogress`, `review`, `returned`, `blocked`
- Bajarilgan = `done`, `approved`
- Bekor qilingan = `cancelled`

**Server endpoint:** `POST /api/v1/agent/tasks/{taskId}/status` — already implemented server-side (docs/07-audit-log-and-agent.md table row ✅). The local Kestrel API (`LocalApiHost.cs`) proxies to this via `AgentService.ToggleTaskStatus()` + `SyncAsync()`.

---

## Task 1: Backend — `POST /api/tasks/{id}/status`

**Files:**
- Modify: `agent/src/Auditor.Agent.Desktop/LocalApi/LocalApiHost.cs:120-128`

### Business logic

1. Ping the server — if offline, return `{ ok: false, error: "offline" }` immediately (no local queue)
2. If online, call `_svc.ToggleTaskStatus(id, b.ToStatus)` (enqueue to local store)
3. Trigger `_svc.SyncAsync()` so the status is pushed to the server in the same call
4. Return `{ ok: true }` on success

- [ ] **Step 1.1: Add the route handler**

Open `LocalApiHost.cs`. After the `app.MapGet("/api/tasks", …)` block (line ~128), insert:

```csharp
app.MapPost("/api/tasks/{id}/status", async (string id, HttpContext ctx) =>
{
    var b = await ctx.Request.ReadFromJsonAsync<TaskStatusBody>(Json);
    if (b is null || string.IsNullOrWhiteSpace(b.ToStatus)) return Results.BadRequest();
    var online = await _svc.PingAsync();
    if (!online) return Results.Json(new { ok = false, error = "offline" }, Json);
    _svc.ToggleTaskStatus(id, b.ToStatus);
    await _svc.SyncAsync();
    return Results.Json(new { ok = true }, Json);
});
```

- [ ] **Step 1.2: Add the request body record**

At the bottom of `LocalApiHost.cs`, in the private records block (around line 272–276), add:

```csharp
private record TaskStatusBody(string ToStatus);
```

The block currently reads:
```csharp
private record LoginBody(string Email, string Password);
private record TokenBody(string Token);
private record FindingBody(string TaskId, string Title, string Severity, double Cvss,
    string Cwe, string Asset, string Description);
private record SettingsBody(string? ServerUrl, int SyncInterval);
```

Becomes:
```csharp
private record LoginBody(string Email, string Password);
private record TokenBody(string Token);
private record FindingBody(string TaskId, string Title, string Severity, double Cvss,
    string Cwe, string Asset, string Description);
private record SettingsBody(string? ServerUrl, int SyncInterval);
private record TaskStatusBody(string ToStatus);
```

- [ ] **Step 1.3: Build and verify**

```powershell
cd "D:\MY PROJECTS\Auditor v6\Auditor-v2\agent\src\Auditor.Agent.Desktop"
dotnet build -c Release --no-restore 2>&1 | Select-String -Pattern "error|warning|Build succeeded"
```

Expected: `Build succeeded` with 0 errors.

- [ ] **Step 1.4: Commit**

```
git add agent/src/Auditor.Agent.Desktop/LocalApi/LocalApiHost.cs
git commit -m "feat(agent): POST /api/tasks/{id}/status endpoint with online guard"
```

---

## Task 2: Frontend — Filter bar + conditional buttons + status-change actions

**Files:**
- Modify: `agent/src/Auditor.Agent.Desktop/wwwroot/app.js`

This task rewrites three sections of `app.js`:
1. Add `activeTaskFilter` module-level variable (line ~18, near `cachedTasks`)
2. Update `SCREENS.tasks` HTML to include filter bar div (line ~350)
3. Rewrite `loadTasks()` (lines ~755–799)

### Step-by-step

- [ ] **Step 2.1: Add `activeTaskFilter` state variable**

Find this block at the top of `app.js` (~line 18):
```js
let cachedTasks = [];
let prevOnline  = null;
```

Replace with:
```js
let cachedTasks = [];
let prevOnline  = null;
let activeTaskFilter = 'all';
```

- [ ] **Step 2.2: Reset filter and add bar HTML in `SCREENS.tasks`**

Find the `async tasks()` screen definition (line ~349):
```js
  async tasks() {
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Mening vazifalarim</h1><p class="meta" id="t-sum"></p></div>
        <button id="t-sync" class="btn btn-soft">${icon('refresh')} Sinxronlash</button>
      </div>
      <div class="panel stagger" id="t-list"><div class="loading">Yuklanmoqda…</div></div>
    `;
```

Replace with:
```js
  async tasks() {
    activeTaskFilter = 'all';
    $('content').innerHTML = `
      <div class="page-header">
        <div><h1 class="h1">Mening vazifalarim</h1><p class="meta" id="t-sum"></p></div>
        <button id="t-sync" class="btn btn-soft">${icon('refresh')} Sinxronlash</button>
      </div>
      <div class="filter-bar" id="t-bar"></div>
      <div class="panel stagger" id="t-list"><div class="loading">Yuklanmoqda…</div></div>
    `;
```

- [ ] **Step 2.3: Rewrite `loadTasks()`**

Find the full `loadTasks()` function (lines ~755–799):
```js
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
```

Replace the entire function with:
```js
async function loadTasks() {
  const tasks = await api.get('/api/tasks');
  if (!Array.isArray(tasks)) {
    const list = $('t-list');
    if (list) list.innerHTML = `<div class="empty-state">Ma'lumot yuklanmadi</div>`;
    return;
  }
  cachedTasks = tasks;

  const ACTIVE   = new Set(['new', 'assigned', 'in_progress', 'inprogress', 'review', 'returned', 'blocked']);
  const DONE     = new Set(['done', 'approved']);
  const TERMINAL = new Set(['done', 'approved', 'cancelled']);
  const STATUS_NEXT = {
    assigned:    { toStatus: 'in_progress', label: 'Boshlash' },
    in_progress: { toStatus: 'review',      label: 'Tekshiruvga' },
    inprogress:  { toStatus: 'review',      label: 'Tekshiruvga' },
    returned:    { toStatus: 'in_progress', label: 'Qayta boshlash' },
  };

  const counts = {
    all:       tasks.length,
    active:    tasks.filter(t => ACTIVE.has(t.status)).length,
    done:      tasks.filter(t => DONE.has(t.status)).length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  const bar = $('t-bar');
  if (bar) {
    bar.innerHTML = [
      filterBtn('all',       `Hammasi (${counts.all})`,              activeTaskFilter),
      filterBtn('active',    `Faol (${counts.active})`,              activeTaskFilter),
      filterBtn('done',      `Bajarilgan (${counts.done})`,          activeTaskFilter),
      filterBtn('cancelled', `Bekor qilingan (${counts.cancelled})`, activeTaskFilter),
    ].join('');
    bar.querySelectorAll('.filter-btn').forEach(b => {
      b.addEventListener('click', () => { activeTaskFilter = b.dataset.filter; loadTasks(); });
    });
  }

  const sumEl = $('t-sum');
  if (sumEl) {
    const ip = tasks.filter(t => ACTIVE.has(t.status) && t.status !== 'new' && t.status !== 'assigned').length;
    const fr = tasks.filter(t => t.status === 'new').length;
    sumEl.textContent = `${tasks.length} ta vazifa · ${ip} jarayonda · ${fr} yangi`;
  }

  let visible = tasks;
  if (activeTaskFilter === 'active')    visible = tasks.filter(t => ACTIVE.has(t.status));
  if (activeTaskFilter === 'done')      visible = tasks.filter(t => DONE.has(t.status));
  if (activeTaskFilter === 'cancelled') visible = tasks.filter(t => t.status === 'cancelled');

  const list = $('t-list'); if (!list) return;
  if (!visible.length) { list.innerHTML = `<div class="empty-state">Vazifalar topilmadi</div>`; return; }

  list.innerHTML = visible.map(t => {
    const st      = statusOf(t.status);
    const nextStep = STATUS_NEXT[t.status];
    const findingBtn = TERMINAL.has(t.status) ? '' : `
      <button class="btn btn-soft" style="font-size:11px;padding:4px 10px"
              data-tid="${esc(t.id)}" data-ttitle="${esc(t.title)}">
        ${icon('plus')} Finding
      </button>`;
    const statusBtn = nextStep ? `
      <button class="btn btn-ghost" style="font-size:11px;padding:4px 10px"
              data-sid="${esc(t.id)}" data-snext="${esc(nextStep.toStatus)}">
        ${nextStep.label}
      </button>` : '';
    return `
      <div class="list-item" data-sev="${t.findings > 0 ? 'high' : ''}">
        <div class="list-item-main">
          <div class="list-item-info">
            <div class="list-item-title">${esc(t.title)}</div>
            <div class="meta">${esc(t.type)} · ${esc(t.priority)} · ${esc(t.due)}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          ${t.findings > 0 ? `<span class="meta">${t.findings} finding</span>` : ''}
          <span class="tag tag-${esc(st.kind)}">${esc(st.label)}</span>
          <div class="quick-actions">
            ${statusBtn}
            ${findingBtn}
          </div>
        </div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('[data-tid]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      nav('new-finding', { taskId: btn.dataset.tid, taskTitle: btn.dataset.ttitle });
    });
  });

  list.querySelectorAll('[data-sid]').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!S.online) {
        toast('Oflayn rejimda holat o\'zgartirib bo\'lmaydi');
        return;
      }
      btn.disabled = true;
      const r = await api.post(`/api/tasks/${btn.dataset.sid}/status`, { toStatus: btn.dataset.snext });
      if (r.ok) {
        toast('Vazifa holati yangilandi');
        await loadTasks();
      } else {
        const msgs = { offline: 'Oflayn rejimda holat o\'zgartirib bo\'lmaydi' };
        toast(msgs[r.error] ?? 'Holat yangilanmadi');
        btn.disabled = false;
      }
    });
  });
}
```

- [ ] **Step 2.4: Manual smoke-test checklist**

Run the agent (`dotnet run` or launch the EXE). Then verify:

| Scenario | Expected |
|---|---|
| Task with status `done` | No "Finding" button, no status button |
| Task with status `approved` | No "Finding" button, no status button |
| Task with status `cancelled` | No "Finding" button, no status button |
| Task with status `assigned` | "Finding" button visible, "Boshlash" button visible |
| Task with status `in_progress` | "Finding" button visible, "Tekshiruvga" button visible |
| Task with status `returned` | "Finding" button visible, "Qayta boshlash" button visible |
| Task with status `new` | "Finding" button visible, no status button |
| Click "Boshlash" when offline | Toast: "Oflayn rejimda holat o'zgartirib bo'lmaydi" |
| Click "Boshlash" when online | Toast: "Vazifa holati yangilandi", list refreshes |
| Filter "Faol" | Shows only non-terminal tasks |
| Filter "Bajarilgan" | Shows only `done`/`approved` tasks |
| Filter "Bekor qilingan" | Shows only `cancelled` tasks |
| Filter "Hammasi" | Shows all tasks |

- [ ] **Step 2.5: Commit**

```
git add agent/src/Auditor.Agent.Desktop/wwwroot/app.js
git commit -m "feat(agent): task filter bar, conditional Finding button, status-change quick-actions"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered by |
|---|---|
| Finding button hidden on `done`/`approved`/`cancelled` | Task 2 — `TERMINAL.has(t.status)` guard |
| Status-change buttons per valid transition | Task 2 — `STATUS_NEXT` map + `[data-sid]` handlers |
| Offline status change → error toast, no queue | Task 2 — `if (!S.online)` check before API call; Task 1 — server-side ping guard |
| Filter bar: Hammasi / Faol / Bajarilgan / Bekor | Task 2 — filter bar in `loadTasks()` |
| Filter resets to "Hammasi" on screen nav | Task 2 — `activeTaskFilter = 'all'` in `SCREENS.tasks` |
| Backend route for status change | Task 1 — `POST /api/tasks/{id}/status` |

**Placeholder scan:** none found — all steps have exact code.

**Type consistency:**
- `activeTaskFilter` declared in Step 2.1, read/written in Steps 2.2–2.3 ✅
- `TaskStatusBody` declared in Step 1.2, used by Step 1.1 route ✅
- `data-sid` / `data-snext` set in Step 2.3 template, read in Step 2.3 `[data-sid]` handler ✅
- `data-tid` / `data-ttitle` unchanged from original — consistent ✅
