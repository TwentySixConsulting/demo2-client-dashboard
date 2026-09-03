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

# Screenshots are build INPUTS but assets/ is gitignored, so a fresh clone has
# the logo (copied above) and none of the dashboard captures. Chrome renders a
# missing <img> as an empty box and still exits 0, so without this check the
# first build after a clone produces a one-pager with holes in it and says
# nothing. capture_assets.py regenerates them from the built app.
missing_shot=""
missing_sig=""
for img in $(grep -ho 'assets/[a-z-]*\.png' "$HERE/../content"/*.md | sed 's|assets/||' | sort -u); do
  [ "$img" = "zigbert-logo.png" ] && continue
  [ -f "$HERE/assets/$img" ] && continue
  case "$img" in
    sig-*) missing_sig="$missing_sig $img" ;;
    *)     missing_shot="$missing_shot $img" ;;
  esac
done
if [ -n "$missing_shot" ]; then
  echo "Missing screenshot asset(s):$missing_shot" >&2
  echo "Run: npx vite build && python3 $HERE/capture_assets.py" >&2
fi
if [ -n "$missing_sig" ]; then
  echo "Missing signature asset(s):$missing_sig" >&2
  echo "Drop the scans in $HERE/signatures, then run:" >&2
  echo "  python3 $HERE/prep_signatures.py" >&2
fi
[ -n "$missing_shot$missing_sig" ] && exit 1

# --draft renders unconfirmed [[TO CONFIRM]] placeholders instead of refusing.
# Draft PDFs are named accordingly so an internal copy cannot be mistaken for a
# client one sitting in the same folder.
DRAFT=""
SUFFIX=""
SLUGS=""
for a in "$@"; do
  case "$a" in
    --draft) DRAFT="--draft"; SUFFIX="-DRAFT" ;;
    *) SLUGS="$SLUGS $a" ;;
  esac
done

echo "Rendering HTML..."
python3 "$HERE/render.py" $DRAFT $SLUGS

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
python3 - "$HERE" $SLUGS <<'PY' | while IFS='|' read -r slug out; do
import sys; sys.path.insert(0, sys.argv[1])
from manifest import DOCS
want = sys.argv[2:]
for d in DOCS:
    if not want or d["slug"] in want:
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

# The board paper ships twice: this worked-example PDF, and an editable .docx
# from the same markdown. Easy to forget the second one and send a client a
# template they cannot type into, so say so here rather than in a README.
if [ -z "$SLUGS" ] || printf '%s\n' $SLUGS | grep -qx "board-paper"; then
  echo
  echo "Reminder: the board paper also has a Word output the client edits."
  echo "  python3 ../docx/build_board_paper.py"
fi
