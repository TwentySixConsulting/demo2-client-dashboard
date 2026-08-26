#!/usr/bin/env python3
"""Fetch the brand webfonts once and emit them as a self-contained fonts.css.

WHY EMBED RATHER THAN LINK. A PDF that links Google Fonts renders with a system
fallback whenever the machine is offline, and it does so silently: no error, just
a client document in the wrong typeface. Even online it is a race that Chrome's
--virtual-time-budget only usually wins. And the Google Fonts CSS response is
User-Agent dependent, so the same URL yields different files on different days.

Embedding as woff2 data URIs fixes all three. Latin subset only, which is what
takes this from megabytes to ~106 KB: the reference implementation in
millhstudios-cv/source/fonts.css is 2.2 MB because it embeds full TTFs.

Output is CHECKED IN. It is a build input, not a build artefact: regenerating it
needs the network, and the PDF build must not.

Run: python3 build_fonts.py
"""
import base64
import re
import sys
from pathlib import Path

import requests

HERE = Path(__file__).parent
OUT = HERE / "fonts.css"
CACHE = HERE.parent / "video" / "fontcache"

# A modern Chrome UA is required or Google serves TTF instead of woff2.
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36")

# The exact families and weights zigbertdesign.md specifies.
CSS_URL = ("https://fonts.googleapis.com/css2"
           "?family=Inter:wght@400;500;600;700"
           "&family=Poppins:wght@500;600;700;800"
           "&display=swap")

BLOCK = re.compile(r"/\*\s*([\w-]+)\s*\*/\s*(@font-face\s*\{[^}]*\})", re.S)
FIELD = lambda name, css: (re.search(rf"{name}:\s*([^;]+);", css) or [None, ""])[1].strip()
URL = re.compile(r"url\((https://[^)]+\.woff2)\)")


def _instance(woff2_bytes: bytes, weight: int) -> bytes:
    """Snapshot a variable woff2 as a static instance at one weight."""
    import io

    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer

    f = TTFont(io.BytesIO(woff2_bytes), fontNumber=0)
    instancer.instantiateVariableFont(f, {"wght": weight}, inplace=True, updateFontNames=True)
    buf = io.BytesIO()
    f.flavor = "woff2"
    f.save(buf)
    return buf.getvalue()


def main() -> int:
    print(f"GET {CSS_URL}")
    css = requests.get(CSS_URL, headers={"User-Agent": UA}, timeout=30).text

    # Group by URL, not by declared weight. Inter ships ONE variable woff2 that
    # Google references from four separate @font-face rules, so emitting a face
    # per rule embeds the same 48 KB payload four times. Collapsing them to one
    # face with a weight RANGE takes the output from ~302 KB to ~106 KB, and a
    # variable font is exactly what a range is for.
    byurl: dict[str, dict] = {}
    for subset, face in BLOCK.findall(css):
        # Latin only. latin-ext costs another ~107 KB and UK client names do not
        # need it; add it here if one ever does.
        if subset != "latin":
            continue
        m = URL.search(face)
        if not m:
            continue
        url = m.group(1)
        if url not in byurl:
            print(f"  fetch {url.rsplit('/', 1)[-1]}", end="", flush=True)
            raw = requests.get(url, headers={"User-Agent": UA}, timeout=30).content
            print(f"  {len(raw):,} B")
            CACHE.mkdir(parents=True, exist_ok=True)
            (CACHE / url.rsplit("/", 1)[-1]).write_bytes(raw)
            byurl[url] = {
                "family": FIELD("font-family", face),
                "style": FIELD("font-style", face) or "normal",
                "weights": [],
                "raw": raw,
                "b64": base64.b64encode(raw).decode("ascii"),
            }
        w = FIELD("font-weight", face) or "400"
        byurl[url]["weights"].extend(int(x) for x in w.split())

    faces = []
    for f in byurl.values():
        lo, hi = min(f["weights"]), max(f["weights"])
        if lo == hi:
            f["weight"] = str(lo)
            faces.append(f)
            continue
        # A VARIABLE font, and Chrome will not embed one into a PDF. Verified:
        # a document whose body was Inter 400-700 printed with only the Poppins
        # static faces in /BaseFont and no FontFile for Inter at all, so the body
        # text silently fell back. Snapshot static instances instead, one per
        # weight actually used. Costs ~4x the bytes for that family and is the
        # only thing that gets real, selectable Inter into the PDF.
        for w in sorted(set(f["weights"])):
            raw = _instance(f["raw"], w)
            faces.append({
                "family": f["family"],
                "style": f["style"],
                "weight": str(w),
                "raw": raw,
                "b64": base64.b64encode(raw).decode("ascii"),
            })
        print(f"  instanced {f['family']} at {sorted(set(f['weights']))} "
              f"(variable fonts do not embed in PDFs)")

    if not faces:
        print("No latin faces found. Has the Google Fonts response format changed?",
              file=sys.stderr)
        return 1

    lines = [
        "/* GENERATED by build_fonts.py. Do not edit by hand.",
        " * Brand webfonts as self-contained woff2 data URIs, latin subset.",
        " * Checked in deliberately: the PDF build must not need the network.",
        " */",
    ]
    for f in faces:
        lines += [
            "@font-face {",
            f"  font-family: {f['family']};",
            f"  font-style: {f['style']};",
            f"  font-weight: {f['weight']};",
            "  font-display: block;",  # block, not swap: a FOUT would be printed
            f"  src: url(data:font/woff2;charset=utf-8;base64,{f['b64']}) format('woff2');",
            "}",
        ]
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")

    raw_total = sum(len(f["raw"]) for f in faces)
    print(f"\n{OUT.name}: {len(faces)} faces, {raw_total:,} B raw "
          f"-> {OUT.stat().st_size:,} B css")
    for f in faces:
        print(f"  {f['family']:<10} {f['weight']:<9} {len(f['raw']):>7,} B")
    print(f"woff2 also cached for the video pipeline in {CACHE}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
