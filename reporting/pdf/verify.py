#!/usr/bin/env python3
"""Guard the one silent failure in the fixed-page model.

`.page { height: 296.9mm; overflow: hidden }` is what makes the layout
deterministic. It is also what makes an over-long section disappear with no
warning: Chrome exits 0, the PDF opens, and the defect is only found when a
client reads it. So:

  verify.py overflow            checks every .page in build/*.html for content
                                taller than the page, naming the offender
  verify.py pages <pdf> <n>     checks the PDF has exactly n pages, catching
                                both a swallowed page and a spurious trailing one
  verify.py fonts <pdf>         reports embedded fonts, so a silent fallback to
                                a system face cannot ship unnoticed

Run: python3 verify.py overflow
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
BUILD = HERE / "build"


def check_pages(pdf: Path, expected: int) -> int:
    data = pdf.read_bytes()
    # /Type /Page not followed by 's', so /Pages (the tree node) is not counted.
    n = len(re.findall(rb"/Type\s*/Page(?![s])", data))
    if n != expected:
        print(f"FAIL {pdf.name}: {n} pages, expected {expected}", file=sys.stderr)
        return 1
    print(f"  {pdf.name}: {n} pages, {pdf.stat().st_size / 1024:.0f} KB")
    return 0


def check_fonts(pdf: Path) -> int:
    data = pdf.read_bytes()
    fonts = sorted(set(re.findall(rb"/BaseFont\s*/([A-Za-z0-9+\-_,.]+)", data)))
    names = [f.decode("latin-1") for f in fonts]
    print(f"  {pdf.name} fonts:")
    for n in names:
        # A subset prefix (six caps then +) proves Chrome embedded and subset the
        # face rather than falling back to something installed on the machine.
        mark = "embedded" if re.match(r"^[A-Z]{6}\+", n) else "NOT SUBSET"
        print(f"    {mark:<11} {n}")
    bad = [n for n in names if not re.match(r"^[A-Z]{6}\+", n)]
    generic = [n for n in names if re.search(r"Helvetica|Times|Courier|Arial", n)]
    if generic:
        print(f"FAIL {pdf.name}: system font fallback: {generic}", file=sys.stderr)
        return 1
    if bad:
        print(f"  warning: not subset-embedded: {bad}", file=sys.stderr)
    return 0


def check_overflow() -> int:
    """Measure every .page in the built HTML with a real browser."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("playwright not importable; skipping overflow check", file=sys.stderr)
        return 0

    files = sorted(BUILD.glob("*.html"))
    if not files:
        print(f"No built HTML in {BUILD}. Run render.py first.", file=sys.stderr)
        return 1

    rc = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 900, "height": 1400})
        for f in files:
            page.goto(f.as_uri())
            page.emulate_media(media="print")
            page.wait_for_function("document.fonts.ready.then(() => true)")
            bad = page.evaluate("""() =>
              [...document.querySelectorAll('.page')].map((p, i) => ({
                i: i + 1,
                over: p.scrollHeight - p.clientHeight,
                head: (p.querySelector('h1,h2,h3') || {}).textContent || '(no heading)',
              })).filter(x => x.over > 1)
            """)
            total = page.evaluate("document.querySelectorAll('.page').length")
            if bad:
                rc = 1
                print(f"FAIL {f.name}: {len(bad)} of {total} pages overflow",
                      file=sys.stderr)
                for b in bad:
                    print(f"    page {b['i']}: {b['over']}px over — "
                          f"\"{b['head'][:60].strip()}\"", file=sys.stderr)
            else:
                print(f"  {f.name}: {total} pages, none overflowing")
        browser.close()
    return rc


def main(argv: list[str]) -> int:
    if not argv:
        return check_overflow()
    cmd = argv[0]
    if cmd == "overflow":
        return check_overflow()
    if cmd == "pages":
        return check_pages(Path(argv[1]), int(argv[2]))
    if cmd == "fonts":
        return check_fonts(Path(argv[1]))
    print(__doc__, file=sys.stderr)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
