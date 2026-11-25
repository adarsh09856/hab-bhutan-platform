#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd -- "$APP_ROOT"
for node_bin in /www/server/nodejs/*/bin; do
  if [[ -x "$node_bin/node" ]]; then
    export PATH="$node_bin:$PATH"
    exec "$node_bin/node" "$APP_ROOT/node_modules/tsx/dist/cli.mjs" "$APP_ROOT/scripts/weekly-product-link-check.ts"
  fi
done

echo "No aaPanel Node.js runtime found." >&2
exit 1
