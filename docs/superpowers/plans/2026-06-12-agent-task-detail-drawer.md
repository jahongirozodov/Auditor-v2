# Agent Task Detail Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a slide-in drawer that opens when clicking a task card in the agent, showing task details, related findings, and quick actions.

**Architecture:** Add drawer CSS to `app.css`, add `openTaskDrawer(task)` / `closeTaskDrawer()` functions to `app.js`, wire card click in `renderTaskList()`. No new backend endpoints — uses cached data + existing `/api/findings` endpoint. Mirror both files to `publish/wwwroot/` after each edit.

**Tech Stack:** Vanilla JS, CSS custom properties (existing token system), no build step.

---

### Task 1: Drawer CSS

**Files:**
- Modify: `agent/src/Auditor.Agent.Desktop/wwwroot/app.css` (append after line 823)
- Mirror: `agent/publish/wwwroot/app.css`

- [ ] **Step 1: Append drawer + backdrop CSS to app.css source**

Append to end of `agent/src/Auditor.Agent.Desktop/wwwroot/app.css`:

```css
/* ── Task Drawer ────────────────────────────────────────────────── */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.42);
  z-index: 200;
  opacity: 0;
  transition: opacity .22s ease;
}
.drawer-backdrop.open { opacity: 1; }

.task-drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: min(420px, 100vw);
  background: var(--bg-surface);
  border-left: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  z-index: 201;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform .22s cubic-bezier(.16,1,.3,1);
  overflow: hidden;
}
.task-drawer.open { transform: translateX(0); }

@media (prefers-reduced-motion: reduce) {
  .drawer-backdrop, .task-drawer { transition-duration: .01ms !important; }
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.drawer-header-info { flex: 1; min-width: 0; }
.drawer-id {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .07em;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.drawer-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.35;
  margin-bottom: 8px;
  overflow-wrap: break-word;
}
.drawer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  margin-top: 6px;
}
.drawer-close {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; line-height: 1;
  flex-shrink: 0;
  transition: background .12s, color .12s;
}
.drawer-close:hover { background: var(--bg-hover); color: var(--text-primary); }

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.drawer-section {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-subtle);
}
.drawer-section:last-child { border-bottom: none; }
.drawer-section-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.drawer-finding-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  margin-bottom: 6px;
  background: var(--bg-surface-2);
  transition: border-color .12s;
}
.drawer-finding-row:last-child { margin-bottom: 0; }
.drawer-finding-row:hover { border-color: var(--border-strong); }
.drawer-finding-info { flex: 1; min-width: 0; }
.drawer-finding-title {
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.drawer-finding-meta { font-size: 11px; color: var(--text-muted); margin-top: 1px; }

.drawer-empty {
  padding: 28px 20px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12.5px;
}
.drawer-empty p { margin-bottom: 12px; }

.drawer-actions {
  padding: 14px 20px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  background: var(--bg-surface);
}
```

- [ ] **Step 2: Mirror app.css to publish**

Copy the updated file verbatim:
```
agent/src/Auditor.Agent.Desktop/wwwroot/app.css
  → agent/publish/wwwroot/app.css
```

---

### Task 2: Drawer JS — openTaskDrawer + closeTaskDrawer

**Files:**
- Modify: `agent/src/Auditor.Agent.Desktop/wwwroot/app.js`
  - Insert after line 876 (end of `renderTaskList()`) before the `// ── Sidebar` comment

- [ ] **Step 1: Insert drawer functions into app.js**

Insert the following block between the closing `}` of `renderTaskList()` (line 876) and the `// ── Sidebar theme toggle` comment (line 878):

```js
// ── Task Drawer ─────────────────────────────────────────────────────
function closeTaskDrawer() {
  const backdrop = document.getElementById('drawer-backdrop');
  const drawer   = document.getElementById('task-drawer');
  if (!backdrop || !drawer) return;
  backdrop.classList.remove('open');
  drawer.classList.remove('open');
  setTimeout(() => {
    backdrop.remove();
    drawer.remove();
  }, 230);
}

async function openTaskDrawer(task) {
  // Remove any existing drawer first
  document.getElementById('drawer-backdrop')?.remove();
  document.getElementById('task-drawer')?.remove();

  const STATUS_NEXT = {
    assigned:    { toStatus: 'in_progress', label: 'Boshlash' },
    in_progress: { toStatus: 'review',      label: 'Tekshiruvga' },
    inprogress:  { toStatus: 'review',      label: 'Tekshiruvga' },
    returned:    { toStatus: 'in_progress', label: 'Qayta boshlash' },
  };
  const TERMINAL = new Set(['done', 'approved', 'cancelled']);

  // Build backdrop
  const backdrop = document.createElement('div');
  backdrop.id = 'drawer-backdrop';
  backdrop.className = 'drawer-backdrop';
  backdrop.addEventListener('click', closeTaskDrawer);
  document.body.appendChild(backdrop);

  // Build drawer shell
  const drawer = document.createElement('div');
  drawer.id = 'task-drawer';
  drawer.className = 'task-drawer';

  const st = statusOf(task.status);
  const nextStep = STATUS_NEXT[task.status];
  const isTerminal = TERMINAL.has(task.status);

  drawer.innerHTML = `
    <div class="drawer-header">
      <div class="drawer-header-info">
        <div class="drawer-id">${esc(task.id)}</div>
        <div class="drawer-title">${esc(task.title)}</div>
        <div class="drawer-meta">
          <span id="drawer-status-badge" class="tag tag-${esc(st.kind)}">${esc(st.label)}</span>
          <span class="tag tag-ghost">${esc(task.priority)}</span>
          <span class="tag tag-ghost">${esc(task.type)}</span>
        </div>
        <div class="meta" style="margin-top:6px">Muddat: ${esc(task.due)}</div>
      </div>
      <button class="drawer-close" id="drawer-close-btn" aria-label="Yopish">×</button>
    </div>
    <div class="drawer-body">
      <div class="drawer-section">
        <div class="drawer-section-title">Findinglar</div>
        <div id="drawer-findings"><div class="loading" style="padding:16px 0">Yuklanmoqda…</div></div>
      </div>
    </div>
    <div class="drawer-actions" id="drawer-actions"></div>
  `;

  document.body.appendChild(drawer);

  // Trigger open animation next frame
  requestAnimationFrame(() => {
    backdrop.classList.add('open');
    drawer.classList.add('open');
  });

  // Wire close button
  document.getElementById('drawer-close-btn').addEventListener('click', closeTaskDrawer);

  // Render actions panel
  const actionsEl = document.getElementById('drawer-actions');
  if (!isTerminal) {
    actionsEl.innerHTML = `
      <button class="btn btn-soft" id="drawer-new-finding" style="width:100%">
        ${icon('plus')} Finding qo'shish
      </button>
      ${nextStep ? `
        <button class="btn btn-ghost" id="drawer-status-btn" style="width:100%"
                data-snext="${esc(nextStep.toStatus)}">
          ${nextStep.label} →
        </button>` : ''}
    `;
    document.getElementById('drawer-new-finding')?.addEventListener('click', () => {
      closeTaskDrawer();
      nav('new-finding', { taskId: task.id, taskTitle: task.title });
    });
    document.getElementById('drawer-status-btn')?.addEventListener('click', async e => {
      const btn = e.currentTarget;
      if (!S.online) { toast("Oflayn rejimda holat o'zgartirib bo'lmaydi"); return; }
      btn.disabled = true;
      const r = await api.post(`/api/tasks/${task.id}/status`, { toStatus: btn.dataset.snext });
      btn.disabled = false;
      if (r.ok) {
        // Update cached task and badge in-place
        const idx = cachedTasks.findIndex(t => t.id === task.id);
        if (idx !== -1) cachedTasks[idx] = { ...cachedTasks[idx], status: btn.dataset.snext };
        task = { ...task, status: btn.dataset.snext };
        const updSt = statusOf(task.status);
        const badge = document.getElementById('drawer-status-badge');
        if (badge) {
          badge.className = `tag tag-${updSt.kind}`;
          badge.textContent = updSt.label;
        }
        // Refresh actions (next step may have changed)
        btn.remove();
        const newNext = STATUS_NEXT[task.status];
        if (newNext) {
          const nb = document.createElement('button');
          nb.className = 'btn btn-ghost';
          nb.id = 'drawer-status-btn';
          nb.style.width = '100%';
          nb.dataset.snext = newNext.toStatus;
          nb.textContent = `${newNext.label} →`;
          actionsEl.appendChild(nb);
          nb.addEventListener('click', nb.onclick = async ev => {
            const b = ev.currentTarget;
            if (!S.online) { toast("Oflayn rejimda holat o'zgartirib bo'lmaydi"); return; }
            b.disabled = true;
            const res = await api.post(`/api/tasks/${task.id}/status`, { toStatus: b.dataset.snext });
            b.disabled = false;
            if (res.ok) { toast('Holat yangilandi'); renderTaskList(); }
            else toast("Holat yangilanmadi");
          });
        }
        toast('Vazifa holati yangilandi');
        renderTaskList();
      } else {
        toast("Holat yangilanmadi");
      }
    });
  }

  // Load findings for this task
  const findingsEl = document.getElementById('drawer-findings');
  const allFindings = await api.get('/api/findings');
  const taskFindings = Array.isArray(allFindings)
    ? allFindings.filter(f => f.taskId === task.id)
    : [];

  if (!findingsEl) return;

  if (!taskFindings.length) {
    findingsEl.innerHTML = `
      <div class="drawer-empty">
        <p>Bu vazifa uchun hali finding yo'q</p>
        ${!isTerminal ? `<button class="btn btn-soft" id="drawer-empty-finding">
          ${icon('plus')} Yangi finding qo'shish
        </button>` : ''}
      </div>
    `;
    document.getElementById('drawer-empty-finding')?.addEventListener('click', () => {
      closeTaskDrawer();
      nav('new-finding', { taskId: task.id, taskTitle: task.title });
    });
    return;
  }

  findingsEl.innerHTML = taskFindings.map(f => `
    <div class="drawer-finding-row">
      <span class="sev sev-${esc(f.severity)}">${esc(f.severity.toUpperCase())}</span>
      <div class="drawer-finding-info">
        <div class="drawer-finding-title">${esc(f.title)}</div>
        <div class="drawer-finding-meta">CVSS ${esc(String((f.cvss||0).toFixed(1)))}${f.cwe?' · '+esc(f.cwe):''}${f.asset?' · '+esc(f.asset):''}</div>
      </div>
      <span class="tag tag-${esc(f.stateKind)}">${esc(f.stateLabel)}</span>
    </div>
  `).join('');
}
```

- [ ] **Step 2: Verify insertion point in app.js**

Confirm the block is inserted between the `}` closing `renderTaskList()` (was line 876) and `// ── Sidebar theme toggle wire-up` comment. File should now have ~1000+ lines. `renderTaskList` must still end with its own `}`.

---

### Task 3: Wire card click in renderTaskList

**Files:**
- Modify: `agent/src/Auditor.Agent.Desktop/wwwroot/app.js` — inside `renderTaskList()`

- [ ] **Step 1: Add cursor style to task cards**

In `renderTaskList()`, find the line building `list.innerHTML` (the `.map(t => \`...\`` block). In the returned template string, change:

```js
      <div class="list-item" data-sev="${t.findings > 0 ? 'high' : ''}">
```

to:

```js
      <div class="list-item" data-sev="${t.findings > 0 ? 'high' : ''}" style="cursor:pointer" data-taskid="${esc(t.id)}">
```

- [ ] **Step 2: Add card click handler after existing `[data-sid]` handler**

After the closing `});` of `list.querySelectorAll('[data-sid]').forEach(...)` (currently the last statement in `renderTaskList()`), add:

```js
  list.querySelectorAll('.list-item[data-taskid]').forEach(row => {
    row.addEventListener('click', () => {
      const t = cachedTasks.find(x => x.id === row.dataset.taskid);
      if (t) openTaskDrawer(t);
    });
  });
```

---

### Task 4: Mirror to publish + smoke test

**Files:**
- Mirror: `agent/src/Auditor.Agent.Desktop/wwwroot/app.js` → `agent/publish/wwwroot/app.js`
- Mirror: `agent/src/Auditor.Agent.Desktop/wwwroot/app.css` → `agent/publish/wwwroot/app.css`

- [ ] **Step 1: Copy updated files to publish directory**

```bash
cp agent/src/Auditor.Agent.Desktop/wwwroot/app.js agent/publish/wwwroot/app.js
cp agent/src/Auditor.Agent.Desktop/wwwroot/app.css agent/publish/wwwroot/app.css
```

- [ ] **Step 2: Verify agent local API is running (already started)**

```bash
curl -s http://127.0.0.1:60096/api/state
```
Expected: JSON with `loggedIn`, `audited` fields.

- [ ] **Step 3: Screenshot tasks page from running agent**

Take a screenshot of `http://127.0.0.1:60096/` to confirm the tasks list renders. Click a task card and confirm the drawer opens with:
- Header: task id, title, status badge, priority, type, due
- Findings section: list or empty state
- Actions: "Finding qo'shish" button, status change button if applicable
- Backdrop click closes drawer

- [ ] **Step 4: Commit**

```bash
git add agent/src/Auditor.Agent.Desktop/wwwroot/app.js \
        agent/src/Auditor.Agent.Desktop/wwwroot/app.css \
        agent/publish/wwwroot/app.js \
        agent/publish/wwwroot/app.css \
        docs/superpowers/specs/2026-06-12-agent-task-detail-drawer-design.md \
        docs/superpowers/plans/2026-06-12-agent-task-detail-drawer.md
git commit -m "feat(agent): task detail slide-in drawer with findings + quick actions"
```
