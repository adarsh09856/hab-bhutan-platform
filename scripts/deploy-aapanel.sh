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

# aaPanel may own the checkout as www while deployment runs as root. Scope the
# exception to each Git command rather than changing server-wide Git config.

echo "HAB deployment: validating checkout and runtime"

if [[ "$(git -c safe.directory="$APP_ROOT" branch --show-current)" != "main" ]]; then
  echo "Error: deploy from the main branch only; no branch checkout is performed." >&2
  exit 1
fi
if ! git -c safe.directory="$APP_ROOT" diff --quiet || ! git -c safe.directory="$APP_ROOT" diff --cached --quiet; then
  echo "Error: tracked local changes exist. Commit or review them before deploying." >&2
  exit 1
fi

PREVIOUS_COMMIT="$(git -c safe.directory="$APP_ROOT" rev-parse HEAD)"
git -c safe.directory="$APP_ROOT" fetch origin main
git -c safe.directory="$APP_ROOT" pull --ff-only origin main

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
HAB_PM2_MANAGED=0
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  HAB_PM2_MANAGED=1
else
  # The existing aaPanel deployment may be a standalone `node server.js`
  # process. Adopt only the unique process whose cwd is this exact checkout.
  HAB_EXISTING_PIDS=()
  for proc_dir in /proc/[0-9]*; do
    [[ -r "$proc_dir/cmdline" ]] || continue
    proc_cmd="$(tr '\0' ' ' < "$proc_dir/cmdline" 2>/dev/null || true)"
    [[ "$proc_cmd" == *"node server.js"* ]] || continue
    proc_cwd="$(readlink -f "$proc_dir/cwd" 2>/dev/null || true)"
    [[ "$proc_cwd" == "$APP_ROOT" ]] && HAB_EXISTING_PIDS+=("${proc_dir##*/}")
  done
  if [[ "${#HAB_EXISTING_PIDS[@]}" -ne 1 ]]; then
    echo "Error: PM2 app '$APP_NAME' is absent and the exact existing HAB server process is not uniquely identifiable; no process was stopped." >&2
    exit 1
  fi
  HAB_EXISTING_PID="${HAB_EXISTING_PIDS[0]}"
  echo "Found standalone HAB server PID $HAB_EXISTING_PID; it will be adopted by PM2 after the build succeeds."
fi

APP_PORT="${PORT:-$(awk -F= '$1 == "PORT" { gsub(/["[:space:]]/, "", $2); print $2; exit }' .env)}"
APP_PORT="${APP_PORT:-3001}"

if ! git -c safe.directory="$APP_ROOT" diff --quiet "$PREVIOUS_COMMIT" HEAD -- package.json package-lock.json; then
  echo "Dependency manifests changed; installing dependencies without removing the active node_modules tree"
  npm install --legacy-peer-deps
else
  echo "Dependency manifests unchanged; keeping the active node_modules tree intact"
fi

echo "Generating Prisma Client and applying schema without data-loss override"
npx prisma generate
npx prisma db execute --file prisma/migrations/20261124010000_client_changes_brief/migration.sql --schema prisma/schema.prisma
npx prisma db execute --file prisma/migrations/20261125010000_repair_verified_catalog_and_event_fields/migration.sql --schema prisma/schema.prisma
npx prisma db execute --file prisma/migrations/20261125020000_repair_remaining_catalog_copy/migration.sql --schema prisma/schema.prisma
MIGRATION_STATUS="$(npx prisma migrate status 2>&1 || true)"
if ! grep -Eq '[0-9]+ migrations found|Database schema is up to date' <<<"$MIGRATION_STATUS"; then
  printf '%s\n' "$MIGRATION_STATUS"
  echo "Error: could not read Prisma migration status." >&2
  exit 1
fi
if grep -Fq '20261124010000_client_changes_brief' <<<"$MIGRATION_STATUS"; then
  npx prisma migrate resolve --applied 20261124010000_client_changes_brief
fi
if grep -Fq '20261125010000_repair_verified_catalog_and_event_fields' <<<"$MIGRATION_STATUS"; then
  npx prisma migrate resolve --applied 20261125010000_repair_verified_catalog_and_event_fields
fi
if grep -Fq '20261125020000_repair_remaining_catalog_copy' <<<"$MIGRATION_STATUS"; then
  npx prisma migrate resolve --applied 20261125020000_repair_remaining_catalog_copy
fi
if grep -Fq '20261126010000_add_product_slugs' <<<"$MIGRATION_STATUS"; then
  npx prisma db execute --file prisma/migrations/20261126010000_add_product_slugs/migration.sql --schema prisma/schema.prisma
  npx prisma migrate resolve --applied 20261126010000_add_product_slugs
fi
npx prisma db push --skip-generate

# Deliberately do not run seed/reset-admin here: deploys must preserve all existing
# database credentials and business records. First-time admin provisioning is interactive.

echo "Building production application"
npm run build

if [[ "$HAB_PM2_MANAGED" -eq 1 ]]; then
  echo "Restarting only $APP_NAME"
  pm2 restart "$APP_NAME" --update-env
else
  echo "Gracefully stopping the identified HAB process and adopting it into PM2"
  kill -TERM "$HAB_EXISTING_PID"
  for attempt in {1..15}; do
    if ! kill -0 "$HAB_EXISTING_PID" 2>/dev/null; then break; fi
    sleep 1
  done
  if kill -0 "$HAB_EXISTING_PID" 2>/dev/null; then
    echo "Error: identified HAB server did not stop gracefully; no replacement was started." >&2
    exit 1
  fi
  export NODE_ENV=production PORT="$APP_PORT"
  pm2 start "$APP_ROOT/server.js" --name "$APP_NAME" --cwd "$APP_ROOT" --time
  pm2 save
fi

echo "Waiting for database-backed public catalogue on port $APP_PORT"
for attempt in {1..60}; do
  if curl --silent --fail "http://127.0.0.1:${APP_PORT}/api/products" | grep -q '"success":true'; then
    echo "Deployment healthy at commit $(git -c safe.directory="$APP_ROOT" rev-parse --short HEAD)."
    pm2 status "$APP_NAME"
    exit 0
  fi
  sleep 1
done

echo "Error: health endpoint did not recover. PM2 status follows; no other process was killed." >&2
pm2 status "$APP_NAME" || true
exit 1
