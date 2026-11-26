#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
TAG="# HAB_WEEKLY_PRODUCT_LINK_CHECK"
RUNNER="$APP_ROOT/scripts/run-weekly-product-link-check.sh"
CRON_ENTRY="0 9 * * * /bin/bash \"$APP_ROOT/scripts/run-weekly-product-link-check.sh\" >> \"$APP_ROOT/weekly-product-link-check.log\" 2>&1 $TAG"

case "${1:-}" in
  --print)
    printf '%s\n' "$CRON_ENTRY"
    ;;
  --install)
    command -v crontab >/dev/null 2>&1 || { echo "crontab is required to install the weekly check." >&2; exit 1; }
    current="$(crontab -l 2>/dev/null || true)"
    # Replace every HAB entry that invokes this exact runner, including older
    # untagged duplicates, while preserving unrelated server cron jobs.
    filtered="$(printf '%s\n' "$current" | awk -v tag="$TAG" -v runner="$RUNNER" 'index($0, tag) == 0 && index($0, runner) == 0')"
    {
      printf '%s\n' "$filtered" | sed '/^[[:space:]]*$/d'
      printf '%s\n' "$CRON_ENTRY"
    } | crontab -
    echo "Installed a daily HAB trader-expiry check; product-link reports run on Mondays."
    ;;
  --uninstall)
    command -v crontab >/dev/null 2>&1 || { echo "crontab is required to remove the weekly check." >&2; exit 1; }
    current="$(crontab -l 2>/dev/null || true)"
    printf '%s\n' "$current" | awk -v tag="$TAG" -v runner="$RUNNER" 'index($0, tag) == 0 && index($0, runner) == 0' | crontab -
    echo "Removed the HAB weekly product-link report schedule."
    ;;
  *)
    echo "Usage: $0 --print | --install | --uninstall" >&2
    exit 2
    ;;
esac
