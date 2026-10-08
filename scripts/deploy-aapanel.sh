#!/usr/bin/env bash
# Safe in-place aaPanel release. Preserves untracked server data and credentials.
set -Eeuo pipefail

APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="habbhutanplatform"
cd "$APP_ROOT"

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

echo "Building production application"
npm run build

echo "Restarting only $APP_NAME"
pm2 restart "$APP_NAME" --update-env

echo "Waiting for local health endpoint on port $APP_PORT"
for attempt in {1..30}; do
  if curl --silent --fail "http://127.0.0.1:${APP_PORT}/api/admin/health" >/dev/null; then
    echo "Deployment healthy at commit $(git rev-parse --short HEAD)."
    pm2 status "$APP_NAME"
    exit 0
  fi
  sleep 1
done

echo "Error: health endpoint did not recover. PM2 status follows; no other process was killed." >&2
pm2 status "$APP_NAME" || true
exit 1
