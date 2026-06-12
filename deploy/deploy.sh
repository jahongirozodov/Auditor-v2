#!/usr/bin/env bash
# =============================================================================
# Auditor — deploy / update script
# Run on server: bash deploy.sh
# Works for both first deploy and subsequent updates.
# =============================================================================
set -euo pipefail

APP_DIR="/opt/auditor/web"
APP_USER="auditor"
ENV_FILE="$APP_DIR/.env.production"
PM2_APP="auditor"
REPO_URL="${REPO_URL:-}"        # set via env or edit here: e.g. git@github.com:org/auditor.git
GIT_BRANCH="${GIT_BRANCH:-main}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
log()  { echo -e "\n\033[1;34m==> $*\033[0m"; }
ok()   { echo -e "\033[0;32m    ✓ $*\033[0m"; }
die()  { echo -e "\033[0;31mERROR: $*\033[0m" >&2; exit 1; }

[[ -f "$ENV_FILE" ]] || die ".env.production not found at $ENV_FILE\nCopy deploy/.env.production.example there and fill in values."

# ---------------------------------------------------------------------------
# Pull latest code (skip if no REPO_URL — manual rsync/scp workflow)
# ---------------------------------------------------------------------------
if [[ -n "$REPO_URL" ]]; then
  log "Git pull ($GIT_BRANCH)"
  if [[ -d "$APP_DIR/.git" ]]; then
    git -C "$APP_DIR" fetch origin
    git -C "$APP_DIR" reset --hard "origin/$GIT_BRANCH"
  else
    git clone --branch "$GIT_BRANCH" --depth 1 "$REPO_URL" "$APP_DIR"
    chown -R "$APP_USER:$APP_USER" "$APP_DIR"
  fi
  ok "Code updated"
else
  log "Skipping git pull (REPO_URL not set — assuming code already in $APP_DIR)"
fi

# ---------------------------------------------------------------------------
# Node deps
# ---------------------------------------------------------------------------
log "npm ci (production deps)"
cd "$APP_DIR"
npm ci --omit=dev
ok "Dependencies installed"

# ---------------------------------------------------------------------------
# Prisma
# ---------------------------------------------------------------------------
log "Prisma generate + migrate"
# Load DATABASE_URL from .env.production for Prisma CLI
export $(grep -E '^(DATABASE_URL|DIRECT_URL)=' "$ENV_FILE" | xargs)
npx prisma generate
npx prisma migrate deploy
ok "Database schema up to date"

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
log "Next.js build"
# Load all env vars so next build can access public env
set -a; source "$ENV_FILE"; set +a
npm run build
ok "Build complete"

# ---------------------------------------------------------------------------
# (Re)start via PM2
# ---------------------------------------------------------------------------
log "PM2 start/reload"
set -a; source "$ENV_FILE"; set +a

if pm2 describe "$PM2_APP" &>/dev/null; then
  pm2 reload "$PM2_APP" --update-env
  ok "App reloaded (zero-downtime)"
else
  pm2 start npm \
    --name "$PM2_APP" \
    --cwd  "$APP_DIR" \
    -- start
  pm2 save
  ok "App started"
fi

# ---------------------------------------------------------------------------
# Smoke test
# ---------------------------------------------------------------------------
log "Smoke test"
sleep 3
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
if [[ "$HTTP" == "200" || "$HTTP" == "307" || "$HTTP" == "302" ]]; then
  ok "App responding (HTTP $HTTP)"
else
  die "App not responding correctly (HTTP $HTTP) — check: pm2 logs $PM2_APP"
fi

echo ""
echo "================================================================="
echo " Deploy done! $(date '+%Y-%m-%d %H:%M')"
echo " Logs:    pm2 logs $PM2_APP"
echo " Status:  pm2 status"
echo "================================================================="
