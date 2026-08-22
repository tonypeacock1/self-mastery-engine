#!/usr/bin/env bash
# Per-site product image uniquifier — avoids shared binary fingerprint across PSL sites.
# Usage: uniquify-product-image.sh <site-slug> <master-cover> <master-angle> <out-dir>
# Deterministic from slug: same slug → same variant; different slug → different binary.
set -euo pipefail
SLUG="${1:?site slug}"
MASTER_COVER="${2:?master cover path}"
MASTER_ANGLE="${3:?master angle path}"
OUT="${4:?output dir}"
mkdir -p "$OUT"

# Derive numeric seed from slug (stable hash)
SEED=$(printf '%s' "$SLUG" | cksum | awk '{print $1}')
# Parameters in sensible ranges (still looks like the same product)
CROP_X=$(( SEED % 17 ))          # 0-16 px horizontal crop offset
CROP_Y=$(( (SEED / 17) % 13 ))   # 0-12 px vertical
BRIGHT=$(( 95 + (SEED % 11) ))   # 95-105%
CONTRAST=$(( -2 + (SEED % 5) ))  # -2..+2
SHARPEN=$(awk -v s="$SEED" 'BEGIN{printf "%.2f", 0.3 + (s % 7) * 0.05}')
QUALITY=$(( 82 + (SEED % 8) ))   # 82-89
ROT=$(awk -v s="$SEED" 'BEGIN{printf "%.2f", -0.4 + (s % 9) * 0.1}')  # -0.4..0.4 deg
MODULATE_S=$(( 98 + (SEED % 7) )) # saturation 98-104

echo "slug=$SLUG seed=$SEED crop=${CROP_X}x${CROP_Y} bright=$BRIGHT contrast=$CONTRAST sharp=$SHARPEN q=$QUALITY rot=$ROT sat=$MODULATE_S"

# Cover: resize, slight rotate, crop offset, color jitter, strip EXIF, re-encode
convert "$MASTER_COVER" \
  -resize 820x \
  -background white -gravity center \
  -rotate "$ROT" \
  -crop "+${CROP_X}+${CROP_Y}" +repage \
  -resize 800x1280^ -gravity center -extent 800x1280 \
  -brightness-contrast "${BRIGHT}x${CONTRAST}" \
  -modulate "100,${MODULATE_S},100" \
  -unsharp "0x${SHARPEN}" \
  -strip \
  -quality "$QUALITY" \
  "$OUT/dianetics-hardcover.jpg"

convert "$OUT/dianetics-hardcover.jpg" -quality 80 "$OUT/dianetics-hardcover.webp"

# Angle shot with different seed-derived params
CROP2=$(( (SEED / 3) % 15 ))
convert "$MASTER_ANGLE" \
  -resize 1020x \
  -rotate "$(awk -v s="$SEED" 'BEGIN{printf "%.2f", 0.2 - (s % 5) * 0.08}')" \
  -crop "+${CROP2}+0" +repage \
  -resize 1000x \
  -brightness-contrast "$((100 + SEED % 5))x$((SEED % 3))" \
  -strip \
  -quality $((80 + SEED % 10)) \
  "$OUT/dianetics-hardcover-angle.jpg"

# OG 1200x630 from uniquified cover
convert "$OUT/dianetics-hardcover.jpg" \
  -resize 600x \
  -background white -gravity center -extent 1200x630 \
  -strip -quality 85 \
  "$OUT/og-book.jpg"

# Fingerprint report
echo "--- binaries ---"
md5sum "$OUT"/* 2>/dev/null || cksum "$OUT"/*
