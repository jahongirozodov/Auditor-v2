#!/usr/bin/env bash
# =============================================================================
# Auditor — ONE-TIME server setup (Ubuntu 22.04 LTS)
# Run once on a fresh server as root: bash setup-server.sh
# =============================================================================
set -euo pipefail

APP_USER="auditor"
APP_DIR="/opt/auditor/web"
PG_DB="auditor"
PG_USER="auditor"
NODE_MAJOR="22"

echo "==> [1/7] System packages"
apt-get update -y
apt-get install -y curl git unzip nginx postgresql postgresql-contrib ufw

# =============================================================================
# Node.js (NodeSource LTS)
# =============================================================================
echo "==> [2/7] Node.js $NODE_MAJOR"
curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
apt-get install -y nodejs
npm install -g pm2

# =============================================================================
# PostgreSQL
# =============================================================================
echo "==> [3/7] PostgreSQL user + database"
# Generate a random password; save it — you'll put it in .env.production
PG_PASS=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
echo "Generated PG password: $PG_PASS"
echo "$PG_PASS" > /root/pg_auditor_password.txt
chmod 600 /root/pg_auditor_password.txt

sudo -u postgres psql <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${PG_USER}') THEN
    CREATE ROLE ${PG_USER} LOGIN PASSWORD '${PG_PASS}';
  END IF;
END \$\$;
CREATE DATABASE ${PG_DB} OWNER ${PG_USER};
GRANT ALL PRIVILEGES ON DATABASE ${PG_DB} TO ${PG_USER};
SQL

# =============================================================================
# App system user
# =============================================================================
echo "==> [4/7] App user: $APP_USER"
id -u "$APP_USER" &>/dev/null || useradd -r -m -s /bin/bash "$APP_USER"
mkdir -p "$APP_DIR"
chown -R "$APP_USER:$APP_USER" /opt/auditor

# =============================================================================
# Nginx
# =============================================================================
echo "==> [5/7] Nginx config"
cat > /etc/nginx/sites-available/auditor <<'NGINX'
server {
    listen 80;
    server_name _;                  # replace with your domain or IP

    client_max_body_size 20M;       # match server action bodySizeLimit

    location / {
        proxy_pass          http://127.0.0.1:3000;
        proxy_http_version  1.1;
        proxy_set_header    Upgrade          $http_upgrade;
        proxy_set_header    Connection       "upgrade";
        proxy_set_header    Host             $host;
        proxy_set_header    X-Real-IP        $remote_addr;
        proxy_set_header    X-Forwarded-For  $proxy_add_x_forwarded_for;
        proxy_set_header    X-Forwarded-Proto $scheme;
        proxy_read_timeout  60s;
    }

    # Static assets — serve with long cache headers
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
NGINX

ln -sf /etc/nginx/sites-available/auditor /etc/nginx/sites-enabled/auditor
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx

# =============================================================================
# Firewall
# =============================================================================
echo "==> [6/7] UFW firewall"
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx HTTP'
# ufw allow 'Nginx HTTPS'   # uncomment after TLS setup

# =============================================================================
# PM2 systemd startup
# =============================================================================
echo "==> [7/7] PM2 systemd"
pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" | tail -1 | bash || true

echo ""
echo "================================================================="
echo " Setup complete!"
echo " PG password saved to: /root/pg_auditor_password.txt"
echo ""
echo " Next steps:"
echo "  1. Copy app code to $APP_DIR"
echo "  2. Create $APP_DIR/.env.production  (see .env.production.example)"
echo "  3. Run: bash deploy.sh  (as $APP_USER or root)"
echo "================================================================="
