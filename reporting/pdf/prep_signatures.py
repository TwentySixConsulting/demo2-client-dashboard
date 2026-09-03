#!/usr/bin/env python3
"""Signature scans -> transparent PNGs for the invitation's sign-off.

A scanned signature carries its paper with it. Rachel's is blue ink on white,
which mostly gets away with it; Millie's is black ink on a textured grey stock,
and dropped straight into the document that texture reads as a grey rectangle
sitting on the page. Both need the paper turned into alpha.

HOW. Luminance drives the alpha channel, not a hard cut. A binary threshold on
handwriting eats the thin strokes and leaves the thick ones with hard jagged
edges, because a pen line's edge IS a gradient. So:

    alpha = 0   at or above PAPER   (nothing shows)
    alpha = 255 at or below INK     (fully opaque)
    linear in between               (keeps the antialiased edge)

PAPER sits a little BELOW the true paper luminance so the stock's texture and
any scanner vignette fall entirely in the transparent band. Everything then gets
recoloured to one flat ink colour, because a scan's "black" is a muddy range and
a document wants one deliberate tone.

Run: python3 prep_signatures.py            (uses signatures/ as the drop folder)
     python3 prep_signatures.py --check    (report only, writes nothing)
"""
import sys
from pathlib import Path

from PIL import Image, ImageChops

HERE = Path(__file__).parent
SRC = HERE / "signatures"      # drop the scans here, any common format
ASSETS = HERE / "assets"

# Ink colours are chosen, not sampled. Rachel signs in blue and that is part of
# how the signature reads, so it stays blue but a cleaner one than the scan.
# Millie's goes to the document's ink navy rather than pure black, matching every
# other mark on the page.
JOBS = [
    {
        "out": "sig-rachel.png",
        "stems": ("rachel", "crafts", "sig1", "signature1"),
        "ink": (43, 57, 144),        # a clean blue, close to the scan
        # Measured: 92% of this scan sits above 230 and the corners are pure
        # white, so the cut can sit high and keep the light edge of the stroke.
        "paper": 225,
        "ink_at": 100,
    },
    {
        "out": "sig-millie.png",
        "stems": ("millie", "harrison", "sig2", "signature2"),
        "ink": (18, 28, 43),         # brand.css --ink
        # Measured on this scan rather than guessed, which is the only way to
        # get a textured stock clean. Sampling the outer margins, where there is
        # no ink, the paper runs 175-205 at the 1st-99th percentile and never
        # goes below 166. The ink core sits at 43-90. So a cut at 166 puts ALL
        # of the grain in the transparent band with nothing left to speckle,
        # and everything darker is stroke.
        "paper": 166,
        "ink_at": 95,
    },
]

EXTS = (".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff", ".heic")


def find(stems) -> Path | None:
    if not SRC.exists():
        return None
    for p in sorted(SRC.iterdir()):
        if p.suffix.lower() in EXTS and any(s in p.stem.lower() for s in stems):
            return p
    return None


def cut(src: Path, ink: tuple[int, int, int], paper: int, ink_at: int) -> Image.Image:
    raw = Image.open(src)
    if raw.mode in ("RGBA", "LA", "P"):
        raw = raw.convert("RGBA")
        flat_bg = Image.new("RGB", raw.size, (255, 255, 255))
        flat_bg.paste(raw, (0, 0), raw)
        im = flat_bg
    else:
        im = raw.convert("RGB")
    lum = im.convert("L")

    # Trim the scan to the ink before anything else, so the output has no dead
    # margin and the layout controls its own spacing.
    inverted = ImageChops.invert(lum)
    box = inverted.point(lambda v: 255 if v > (255 - paper) else 0).getbbox()
    if box:
        pad = max(2, int(min(im.size) * 0.01))
        box = (max(0, box[0] - pad), max(0, box[1] - pad),
               min(im.width, box[2] + pad), min(im.height, box[3] + pad))
        im, lum = im.crop(box), lum.crop(box)

    span = max(1, paper - ink_at)
    alpha = lum.point(
        lambda v: 255 if v <= ink_at else (0 if v >= paper
                                          else int(round((paper - v) / span * 255)))
    )
    flat = Image.new("RGBA", im.size, ink + (255,))
    flat.putalpha(alpha)
    return flat


def main(check: bool) -> int:
    ASSETS.mkdir(parents=True, exist_ok=True)
    SRC.mkdir(parents=True, exist_ok=True)
    missing = []
    for job in JOBS:
        src = find(job["stems"])
        if not src:
            missing.append(job)
            print(f"  {job['out']}: no source found. Drop a scan in {SRC} with "
                  f"one of {job['stems']} in the filename.")
            continue
        if check:
            im = Image.open(src)
            print(f"  {job['out']} <- {src.name}  {im.size[0]}x{im.size[1]}")
            continue
        out = cut(src, job["ink"], job["paper"], job["ink_at"])
        out.save(ASSETS / job["out"])
        hist = out.getchannel("A").histogram()
        opaque = sum(hist[9:])
        pct = opaque / (out.width * out.height) * 100
        print(f"  {job['out']}: {out.width}x{out.height}  "
              f"ratio {out.width / out.height:.2f}  ink covers {pct:.1f}%")
        # A signature that covers almost none of its box, or nearly all of it,
        # means the paper cut is wrong rather than the scan being unusual.
        if not 2 <= pct <= 45:
            print(f"     WARNING: {pct:.1f}% ink is out of the sane 2-45% range. "
                  f"Adjust 'paper' or 'ink_at' for this job and rerun.",
                  file=sys.stderr)
    return 1 if missing and not check else 0


if __name__ == "__main__":
    raise SystemExit(main("--check" in sys.argv))
