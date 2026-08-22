#!/usr/bin/env bash
# Build one PSL cloud site: HTML (if wave1) + per-slug unique product images.
#
# Usage:
#   ./scripts/build-cloud-site.sh <site-slug>
#   ./scripts/build-cloud-site.sh self-mastery-sa
#   ./scripts/build-cloud-site.sh jhb-exec-resilience
#   ./scripts/build-cloud-site.sh cape-town-self-mastery --deploy
#
# Steps:
#   1. uniquify product images into dist for that slug
#   2. for self-mastery-sa: also run npm run build:wave1 (HTML SILO)
#   3. optional --deploy → wrangler pages deploy to matching project name
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SLUG="${1:?Usage: $0 <site-slug> [--deploy]}"
DEPLOY=0
[[ "${2:-}" == "--deploy" ]] && DEPLOY=1

echo "=== build-cloud-site: $SLUG ==="

# 1) Unique product images
bash "$ROOT/scripts/uniquify-product-image.sh" "$SLUG"

# 2) HTML build for known SILO
case "$SLUG" in
  self-mastery-sa)
    if [[ -f package.json ]] && command -v npx >/dev/null; then
      echo "[build] running wave1 HTML builder..."
      npx tsx scripts/build-wave1-site.ts
      # re-apply uniquified images (builder may not touch images/)
      bash "$ROOT/scripts/uniquify-product-image.sh" "$SLUG" "$ROOT/dist-wave1/images"
    fi
    DIST="$ROOT/dist-wave1"
    CF_PROJECT="self-mastery-sa"
    ;;
  *)
    # Future: map slug → content pack. For now images-only scaffold.
    DIST="$ROOT/dist-${SLUG}"
    mkdir -p "$DIST"
    CF_PROJECT="$SLUG"
    echo "[build] HTML pack for '$SLUG' not yet wired — images ready in $DIST/images"
    ;;
esac

echo "[build] dist=$DIST"
ls -la "$DIST/images" 2>/dev/null || true

# 3) Optional deploy
if [[ "$DEPLOY" -eq 1 ]]; then
  if [[ ! -d "$DIST" ]] || [[ -z "$(ls -A "$DIST" 2>/dev/null | head -1)" ]]; then
    echo "ERROR: dist empty, cannot deploy" >&2
    exit 1
  fi
  if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    echo "ERROR: set CLOUDFLARE_API_TOKEN" >&2
    exit 1
  fi
  echo "[deploy] Cloudflare Pages project=$CF_PROJECT"
  npx wrangler pages deploy "$DIST" --project-name="$CF_PROJECT" --commit-dirty=true
fi

echo "=== done: $SLUG ==="
