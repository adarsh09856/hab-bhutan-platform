#!/usr/bin/env bash
# Safe in-place aaPanel release. Preserves untracked server data and credentials.
set -Eeuo pipefail

APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="habbhutanplatform"
cd "$APP_ROOT"

# aaPanel installs Node/PM2 outside the non-interactive SSH PATH. Prefer the
# installed versioned Node runtime without starting a login shell (which can
# block on shell profile prompts or network initialization).
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1 || ! command -v pm2 >/dev/null 2>&1; then
  for node_bin in /www/server/nodejs/*/bin; do
    if [[ -x "$node_bin/node" && -x "$node_bin/npm" && -x "$node_bin/pm2" ]]; then
      export PATH="$node_bin:$PATH"
      break
    fi
  done
fi

# aaPanel may own the checkout as www while deployment runs as root. Keep the
# exception scoped to this repository and this deployment process.
export GIT_CONFIG_COUNT=1
export GIT_CONFIG_KEY_0=safe.directory
export GIT_CONFIG_VALUE_0="$APP_ROOT"

echo "HAB deployment: validating checkout and runtime"

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Error: deploy from the main branch only; no branch checkout is performed." >&2
  exit 1
fi
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Error: tracked local changes exist. Commit or review them before deploying." >&2
  exit 1
fi

PREVIOUS_COMMIT="$(git rev-parse HEAD)"
git fetch origin main
git pull --ff-only origin main

if [[ ! -f .env ]]; then
  echo "Error: production .env is missing. Create/configure it through the server's secret manager." >&2
  exit 1
fi
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Error: Node.js and npm must be available in PATH." >&2
  exit 1
fi
if ! command -v pm2 >/dev/null 2>&1; then
  echo "Error: PM2 is not in PATH; no process was stopped or started." >&2
  exit 1
fi
if ! pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "Error: expected PM2 process '$APP_NAME' was not found; refusing to start a second service." >&2
  exit 1
fi

APP_PORT="${PORT:-$(awk -F= '$1 == "PORT" { gsub(/["[:space:]]/, "", $2); print $2; exit }' .env)}"
APP_PORT="${APP_PORT:-3001}"

if ! git diff --quiet "$PREVIOUS_COMMIT" HEAD -- package.json package-lock.json; then
  echo "Dependency manifests changed; installing dependencies without removing the active node_modules tree"
  npm install --legacy-peer-deps
else
  echo "Dependency manifests unchanged; keeping the active node_modules tree intact"
fi

echo "Generating Prisma Client and applying schema without data-loss override"
npx prisma generate
npx prisma db push --skip-generate

# Deliberately do not run seed/reset-admin here: deploys must preserve all existing
# database credentials and business records. First-time admin provisioning is interactive.

echo "Building production application"
npm run build

echo "Restarting only $APP_NAME"
pm2 restart "$APP_NAME" --update-env

echo "Waiting for database-backed public catalogue on port $APP_PORT"
for attempt in {1..30}; do
  if curl --silent --fail "http://127.0.0.1:${APP_PORT}/api/products" | grep -q '"success":true'; then
    echo "Deployment healthy at commit $(git rev-parse --short HEAD)."
    pm2 status "$APP_NAME"
    exit 0
  fi
  sleep 1
done

echo "Error: health endpoint did not recover. PM2 status follows; no other process was killed." >&2
pm2 status "$APP_NAME" || true
exit 1
