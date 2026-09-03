#!/usr/bin/env python3
"""Screenshots for the one-pagers, captured from the built app.

WHY THIS EXISTS. assets/ is gitignored, because build.sh copies the logo into
it and a build output does not belong in the tree. But the two dashboard
screenshots in there are build INPUTS, and they were untracked, so a fresh
clone had no way to produce them and the one-pagers would have rendered with
broken images. Same reasoning that keeps pdf/fonts.css checked in and
build_fonts.py around to regenerate it: an input you cannot rebuild is a
liability. This is that regenerator.

It also fixes what it replaces. The old hero-home.png was 3540x819, a 4.3:1
band of the home page, which at the 78mm the flyer gives it came out ~18mm
tall with every figure illegible. Screenshots for print need to be chosen for
what survives being small, which means one card with large type, not a wide
strip of a whole page.

Reuses ../video/serve.py: `python3 -m http.server` 404s the vendored SPAs'
client-side routes, and the Vite dev server ships an HMR client and unminified
code. Screenshot the artefact you deploy.

Needs: npx vite build first, then `python3 capture_assets.py`.
"""
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
ASSETS = HERE / "assets"
SERVE = HERE.parent / "video" / "serve.py"
DIST = HERE.parents[1] / "dist" / "public"
PORT = 8791
ORIGIN = f"http://127.0.0.1:{PORT}"

# The Pay page's inline auth gate redirects before a post-navigation seed can
# land, so this has to go in via add_init_script. Learned the hard way filming.
AUTH = {"demo-client-dashboard:temp-auth": {"username": "brighton technologies"}}
# Silence the first-run tour offer and the Home checklist: a coachmark over a
# screenshot in a client document reads as an unfinished page.
_ALL = {"home": 1, "pay": 1, "benefits": 1, "organisation": 1, "account": 1}
SEED = {**AUTH, "zigbert:tour-done": _ALL, "zigbert:tour-offered": _ALL,
        "zigbert:tour-checklist-off": "1"}

# VIEWPORT IS AN ASPECT-RATIO CONTROL, which is the non-obvious part. The same
# card measures 1074x274 (3.92:1) at 1440 wide and 734x287 (2.55:1) at 1100. In
# a 78mm column that is 31mm tall rather than 20mm, so the type is half again
# as big for identical content. Do not push it further: at 1040 the ratio
# improves to 1.82 but the view toggle wraps under the heading and the card
# starts to look squeezed. 1100 is the last width where everything still sits
# where it was designed to.
SHOTS = [
    {
        # The pilot flyer's screenshot. The "Today" card is the most
        # representative single view in the product: the generated verdict
        # sentence plus all four headline figures.
        "out": "hero-today.png",
        "url": "/pay/",
        "width": 1100,
        "sel": "[data-testid='kpi-overall']",
        "climb": 2,          # kpi cell -> row -> the card that frames it
    },
    {
        # One role against its market range, for the main one-pager. Data
        # Systems Engineer deliberately: it sits LQ to Median, so the picture
        # shows a gap rather than a role that is already fine.
        "out": "hero-role.png",
        "url": "/pay/role-details",
        "width": 1440,
        "sel": "div.rounded-xl.border:has-text('Data Systems Engineer')",
        "climb": 0,
    },
    {
        # The home snapshot, for the main one-pager's full-width band, where a
        # wide crop is right because it spans the whole 146mm.
        "out": "hero-home.png",
        "url": "/",
        "width": 1440,
        "sel": "[data-tour='hero']",
        "climb": 0,
    },
]


def main() -> int:
    if not DIST.exists():
        raise SystemExit(f"No build at {DIST}. Run: npx vite build")
    ASSETS.mkdir(parents=True, exist_ok=True)
    srv = subprocess.Popen([sys.executable, str(SERVE), str(PORT)])
    try:
        time.sleep(1.5)
        with sync_playwright() as p:
            b = p.chromium.launch()
            for shot in SHOTS:
                ctx = b.new_context(
                    viewport={"width": shot["width"], "height": 900},
                    device_scale_factor=3)  # 300dpi at print size
                ctx.add_init_script(
                    "(() => { const s = %s; Object.entries(s).forEach(([k, v]) "
                    "=> localStorage.setItem(k, typeof v === 'string' ? v : "
                    "JSON.stringify(v))); })()" % _json(SEED)
                )
                page = ctx.new_page()
                page.goto(ORIGIN + shot["url"], wait_until="domcontentloaded")
                page.wait_for_timeout(1800)   # charts animate in JS, not CSS
                el = page.locator(shot["sel"]).first
                el.wait_for(state="visible", timeout=8000)
                for _ in range(shot["climb"]):
                    el = el.locator("xpath=..")
                el.screenshot(path=str(ASSETS / shot["out"]))
                px = _size(ASSETS / shot["out"])
                print(f"  {shot['out']}: {px[0]}x{px[1]}  "
                      f"ratio {px[0] / px[1]:.2f}")
                ctx.close()
            b.close()
    finally:
        srv.terminate()
    return 0


def _json(o) -> str:
    import json
    return json.dumps(o)


def _size(p: Path):
    from PIL import Image
    with Image.open(p) as im:
        return im.size


if __name__ == "__main__":
    raise SystemExit(main())
