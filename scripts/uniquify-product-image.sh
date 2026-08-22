#!/usr/bin/env bash
# Per-site product image uniquifier — avoids shared binary fingerprint across PSL sites.
#
# Usage:
#   ./scripts/uniquify-product-image.sh <site-slug> [out-dir] [master-cover] [master-angle]
#
# Defaults:
#   out-dir       = dist-wave1/images (self-mastery-sa) or dist-<slug>/images
#   master-cover  = assets/product-masters/cover.png|.jpg
#   master-angle  = assets/product-masters/angle.jpg
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="${1:?Usage: $0 <site-slug> [out-dir] [master-cover] [master-angle]}"

if [[ "$SLUG" == "self-mastery-sa" ]]; then
  DEFAULT_OUT="$ROOT/dist-wave1/images"
else
  DEFAULT_OUT="$ROOT/dist-${SLUG}/images"
fi
OUT="${2:-$DEFAULT_OUT}"

if [[ -n "${3:-}" ]]; then MASTER_COVER="$3"
elif [[ -f "$ROOT/assets/product-masters/cover.png" ]]; then MASTER_COVER="$ROOT/assets/product-masters/cover.png"
elif [[ -f "$ROOT/assets/product-masters/cover.jpg" ]]; then MASTER_COVER="$ROOT/assets/product-masters/cover.jpg"
else echo "ERROR: master cover missing in assets/product-masters/" >&2; exit 1
fi

if [[ -n "${4:-}" ]]; then MASTER_ANGLE="$4"
elif [[ -f "$ROOT/assets/product-masters/angle.jpg" ]]; then MASTER_ANGLE="$ROOT/assets/product-masters/angle.jpg"
else echo "ERROR: master angle missing" >&2; exit 1
fi

mkdir -p "$OUT"
command -v convert >/dev/null || { echo "ERROR: ImageMagick convert required" >&2; exit 1; }

SEED=$(printf '%s' "$SLUG" | cksum | awk '{print $1}')
# All jitter in safe visual ranges (ImageMagick brightness-contrast is -100..100)
CROP_X=$(( SEED % 17 ))
CROP_Y=$(( (SEED / 17) % 13 ))
BRIGHT=$(( -3 + (SEED % 7) ))          # -3..+3
CONTRAST=$(( -2 + (SEED % 5) ))        # -2..+2
SHARPEN=$(awk -v s="$SEED" 'BEGIN{printf "%.2f", 0.25 + (s % 7) * 0.05}')
QUALITY=$(( 82 + (SEED % 8) ))         # 82-89
ROT=$(awk -v s="$SEED" 'BEGIN{printf "%.2f", -0.35 + (s % 8) * 0.1}')  # ~-0.35..0.35
SAT=$(( 97 + (SEED % 7) ))             # 97-103 modulate saturation
CROP2=$(( (SEED / 3) % 15 ))
ROT2=$(awk -v s="$SEED" 'BEGIN{printf "%.2f", -0.25 + (s % 6) * 0.1}')
Q2=$(( 80 + SEED % 10 ))
BRIGHT2=$(( -2 + (SEED / 5) % 5 ))
CONTRAST2=$(( -1 + (SEED / 7) % 3 ))

echo "[uniquify] slug=$SLUG seed=$SEED → out=$OUT"
echo "[uniquify] jitter crop=${CROP_X},${CROP_Y} bright=$BRIGHT contrast=$CONTRAST rot=$ROT sat=$SAT q=$QUALITY"

convert "$MASTER_COVER" \
  -colorspace sRGB \
  -resize 820x \
  -background white -gravity center \
  -rotate "$ROT" \
  -crop "+${CROP_X}+${CROP_Y}" +repage \
  -resize "800x1280^" -gravity center -extent 800x1280 \
  -brightness-contrast "${BRIGHT}x${CONTRAST}" \
  -modulate "100,${SAT},100" \
  -unsharp "0x${SHARPEN}" \
  -strip \
  -quality "$QUALITY" \
  "$OUT/dianetics-hardcover.jpg"

convert "$OUT/dianetics-hardcover.jpg" -colorspace sRGB -quality 80 "$OUT/dianetics-hardcover.webp"

convert "$MASTER_ANGLE" \
  -colorspace sRGB \
  -resize 1020x \
  -rotate "$ROT2" \
  -crop "+${CROP2}+0" +repage \
  -resize 1000x \
  -brightness-contrast "${BRIGHT2}x${CONTRAST2}" \
  -strip \
  -quality "$Q2" \
  "$OUT/dianetics-hardcover-angle.jpg"

convert "$OUT/dianetics-hardcover.jpg" \
  -colorspace sRGB \
  -resize 600x \
  -background white -gravity center -extent 1200x630 \
  -strip -quality 85 \
  "$OUT/og-book.jpg"

# Aliases used by live HTML (softcover product framing)
cp -f "$OUT/dianetics-hardcover.jpg" "$OUT/dianetics-softcover.jpg"
cp -f "$OUT/dianetics-hardcover.webp" "$OUT/dianetics-softcover.webp"
cp -f "$OUT/dianetics-hardcover-angle.jpg" "$OUT/dianetics-softcover-angle.jpg"

echo "[uniquify] fingerprints:"
identify "$OUT/dianetics-hardcover.jpg" "$OUT/dianetics-hardcover-angle.jpg" "$OUT/og-book.jpg"
cksum "$OUT/dianetics-hardcover.jpg" "$OUT/dianetics-hardcover.webp" "$OUT/dianetics-hardcover-angle.jpg" "$OUT/og-book.jpg"
