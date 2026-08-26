#!/usr/bin/env bash
# Zigbert client documents. N HTML in, N PDF out, via headless Chrome.
#
# Adapted from the proven /Users/millieharrison/millhstudios-cv/source/build.sh,
# which produces A4 PDFs with real selectable text and subset-embedded fonts.
#
# Every flag below is verified present in the installed Chrome's switch list.
# --no-pdf-header-footer is all-or-nothing: drop it and Chrome stamps its own
# title/URL/date band on every page, which is unusable in a client document.
# Page numbers are therefore authored in render.py's template instead.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/out"

[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME" >&2; exit 1; }
mkdir -p "$OUT" "$HERE/assets"

# The logo travels with the build so the HTML has no dependency on the app's
# public dir. 646x194px: fine to 54.7mm at 300dpi, and brand.css keeps it well
# inside that.
cp -f "$HERE/../../client/public/shell/zigbert-logo.png" "$HERE/assets/" 2>/dev/null \
  || cp -f "$HERE/../../../zigbert-waitlist/public/zigbert-logo.png" "$HERE/assets/"

# --draft renders unconfirmed [[TO CONFIRM]] placeholders instead of refusing.
# Draft PDFs are named accordingly so an internal copy cannot be mistaken for a
# client one sitting in the same folder.
DRAFT=""
SUFFIX=""
if [ "${1:-}" = "--draft" ]; then DRAFT="--draft"; SUFFIX="-DRAFT"; fi

echo "Rendering HTML..."
python3 "$HERE/render.py" $DRAFT

echo "Checking for silent overflow..."
python3 "$HERE/verify.py" overflow

render() {  # render <slug> <output.pdf>
  "$CHROME" \
    --headless \
    --disable-gpu \
    --no-pdf-header-footer \
    --generate-pdf-document-outline \
    --hide-scrollbars \
    --force-color-profile=srgb \
    --run-all-compositor-stages-before-draw \
    --allow-file-access-from-files \
    --virtual-time-budget=20000 \
    --print-to-pdf="$OUT/$2" \
    "file://$HERE/build/$1.html" 2>/dev/null
}

echo "Printing PDFs..."
python3 - "$HERE" <<'PY' | while IFS='|' read -r slug out; do
import sys; sys.path.insert(0, sys.argv[1])
from manifest import DOCS
for d in DOCS:
    print(f"{d['slug']}|{d['out']}")
PY
  out="${out%.pdf}${SUFFIX}.pdf"
  render "$slug" "$out"
  n=$(python3 -c "import json,sys;print(json.load(open('$HERE/build/pagecounts.json'))['$slug'])")
  python3 "$HERE/verify.py" pages "$OUT/$out" "$n"
  python3 "$HERE/verify.py" fonts "$OUT/$out"
done

echo
echo "Done. PDFs in $OUT"
ls -lh "$OUT"/*.pdf | awk '{printf "  %-42s %s\n", $NF, $5}'
