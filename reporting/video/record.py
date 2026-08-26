#!/usr/bin/env python3
"""Record the Zigbert walkthrough clips. Holds no content: see shots.py.

    python3 record.py                 # all clips
    python3 record.py 02-pay          # one clip
    python3 record.py --audit         # check every selector resolves, film nothing

HOW IT WORKS, and why not the obvious way.

Playwright's built-in record_video_dir is not used. It is hardcoded to 25 fps,
builds from ack-flow-controlled CDP screencast frames so it DROPS frames exactly
when the page is busy (during scrolls and chart animation, i.e. the two things
that most need to look smooth), pads short frames with a grey border, and encodes
VP8 at 1 Mbps, which is visibly soft on 11px dashboard text. It also cannot
produce MP4: Playwright's bundled ffmpeg is built --disable-everything with only
the webm and image2 muxers, VP8, and the pad/crop/scale filters. No H.264, and no
drawtext or overlay filter either, which is why captions are burned in by the
browser rather than composited afterwards.

So: screenshot per frame at 2880x1620, box-downscale to 1920x1080, and encode
H.264 through cv2.VideoWriter, which rides on the full FFmpeg 7.1.1 with libx264
that ships inside opencv-python-headless. Held frames are screenshotted ONCE and
written N times, which the encoder turns into near-free P-frames, so only motion
costs a capture.
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

# NB: OPENCV_FFMPEG_WRITER_OPTIONS is NOT set here, because this build of
# opencv-python-headless ignores it. Tested every documented spelling
# (crf;18|g;60, crf;18|keyint;60, crf=18,g=60) against an unset control, and the
# encoded stream reported x264's defaults every time: crf 23.0, keyint 250.
# Those defaults are fine for this material. 1080p screen content at crf 23
# comes to roughly 1.5 MB per 20-second clip and the 11px UI text stays sharp,
# which was checked by extracting frames rather than assumed.
#
# If finer control is ever needed, the route is the bundled Playwright ffmpeg
# (image2pipe/mjpeg -> VP8 webm) then VLC to transcode to H.264, where the flags
# genuinely do apply. That is three moving parts instead of one, so it is not
# worth it until the quality is actually the problem.

import cv2  # noqa: E402
import numpy as np  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

sys.path.insert(0, str(Path(__file__).parent))
from shots import CLIPS, FPS, ORIGIN, OUTPUT, PORT, RESET_KEYS, SCALE, VIEWPORT  # noqa: E402

HERE = Path(__file__).parent
OUT = HERE / "out"
FONTCACHE = HERE / "fontcache"
FONTS_CSS = HERE.parent / "pdf" / "fonts.css"

# Cubic in-out. Motion that starts and stops softly reads as deliberate; linear
# motion reads as a machine driving the page, which is what this is.
def ease(t: float) -> float:
    return 4 * t**3 if t < 0.5 else 1 - ((-2 * t + 2) ** 3) / 2


def frames_for(ms: int) -> int:
    return max(1, round(ms / 1000 * FPS))


class Camera:
    """Screenshot -> downscale -> encode. One instance per clip."""

    def __init__(self, path: Path):
        self.path = path
        self.n = 0
        self.w = cv2.VideoWriter(
            str(path), cv2.VideoWriter_fourcc(*"avc1"), FPS, OUTPUT
        )
        if not self.w.isOpened():
            # VideoToolbox via AVFoundation is the first fallback; see the module
            # docstring for the ffmpeg+VLC chain behind that.
            self.w = cv2.VideoWriter(
                str(path), cv2.CAP_AVFOUNDATION,
                cv2.VideoWriter_fourcc(*"avc1"), FPS, OUTPUT,
            )
        if not self.w.isOpened():
            raise SystemExit(
                "No H.264 encoder available. Try:\n"
                "  python3 -c \"import cv2;print(cv2.getBuildInformation())\" | grep FFMPEG"
            )

    def grab(self, page, repeat: int = 1) -> None:
        buf = page.screenshot(type="jpeg", quality=96)
        img = cv2.imdecode(np.frombuffer(buf, np.uint8), cv2.IMREAD_COLOR)
        if (img.shape[1], img.shape[0]) != OUTPUT:
            img = cv2.resize(img, OUTPUT, interpolation=cv2.INTER_AREA)
        for _ in range(repeat):
            self.w.write(img)
        self.n += repeat

    def hold(self, page, ms: int) -> None:
        """One screenshot, N identical frames. A 2.5s hold costs one capture."""
        self.grab(page, frames_for(ms))

    def close(self) -> None:
        self.w.release()


def settle(page, timeout_ms: int = 6000) -> None:
    """Wait until the viewport stops changing.

    Recharts animates in JavaScript via react-smooth, so CSS `animation: none`
    and prefers-reduced-motion do NOT stop it. Comparing consecutive screenshots
    is the only reliable way to know a chart has finished, and it doubles as the
    idempotence primitive for the whole run.
    """
    page.wait_for_function("document.fonts.ready.then(() => true)")
    try:
        page.wait_for_load_state("networkidle", timeout=3000)
    except Exception:
        pass
    last, stable, deadline = None, 0, time.time() + timeout_ms / 1000
    while time.time() < deadline:
        cur = page.screenshot(type="jpeg", quality=40)
        if cur == last:
            stable += 1
            if stable >= 2:
                return
        else:
            stable = 0
        last = cur
        page.wait_for_timeout(120)


def rect_of(page, selector: str) -> dict:
    el = page.wait_for_selector(selector, state="attached", timeout=8000)
    page.wait_for_timeout(60)
    box = el.bounding_box()
    if not box:
        raise RuntimeError(f"{selector} has no box (display:none?)")
    return box


# ── motion primitives ─────────────────────────────────────────────────────

def scroll_to(page, cam, selector: str, ms: int, offset: int = 84) -> None:
    """Eased scroll, one frame at a time.

    `offset` clears the fixed 60px Shell plus air. Use 132 on /trends, which is
    the same LINE constant its own sticky rail measures against.
    """
    # Resolve through a Playwright locator, not document.querySelector: that
    # only understands CSS, and these shots also target headings by text, which
    # is far more stable than an id when the id belongs to a whole section.
    box = rect_of(page, selector)
    y_from = page.evaluate("window.scrollY")
    y_to = page.evaluate(
        "y => Math.max(0, Math.min(y, document.documentElement.scrollHeight"
        " - window.innerHeight))",
        box["y"] + y_from - offset,
    )
    if abs(y_to - y_from) < 2:
        return
    n = frames_for(ms)
    for i in range(1, n + 1):
        page.evaluate("y => window.scrollTo(0, y)",
                      y_from + (y_to - y_from) * ease(i / n))
        cam.grab(page)


def ensure_visible(page, cam, selector: str, offset: int = 84) -> None:
    """Animate a scroll if the target is not comfortably in view.

    page.mouse.click() takes VIEWPORT coordinates, so clicking an element below
    the fold silently clicks empty space instead. bounding_box() happily returns
    y > viewport height, which is how that goes unnoticed.
    """
    vh = page.evaluate("window.innerHeight")
    box = rect_of(page, selector)
    top, bottom = box["y"], box["y"] + box["height"]
    if top >= offset and bottom <= vh - 60:
        return
    scroll_to(page, cam, selector, 620, offset=max(offset, int(vh * 0.38)))


def cursor_to(page, cam, selector: str, ms: int = 420) -> tuple[float, float]:
    ensure_visible(page, cam, selector)
    box = rect_of(page, selector)
    x, y = box["x"] + box["width"] / 2, box["y"] + min(box["height"] / 2, 26)
    start = page.evaluate("window.__zbCur || [null, null]")
    n = frames_for(ms)
    x0 = start[0] if start[0] is not None else x
    y0 = start[1] if start[1] is not None else y - 120
    for i in range(1, n + 1):
        t = ease(i / n)
        cx, cy = x0 + (x - x0) * t, y0 + (y - y0) * t
        page.mouse.move(cx, cy)  # so real :hover transitions fire
        page.evaluate("([x, y]) => { window.__cur(x, y, 1, false); window.__zbCur = [x, y]; }",
                      [cx, cy])
        cam.grab(page)
    return x, y


def click(page, cam, selector: str) -> None:
    x, y = cursor_to(page, cam, selector)
    vh = page.evaluate("window.innerHeight")
    vw = page.evaluate("window.innerWidth")
    if not (0 <= x <= vw and 0 <= y <= vh):
        raise RuntimeError(
            f"{selector} is at ({x:.0f},{y:.0f}), outside the {vw}x{vh} viewport. "
            f"A mouse click there would hit nothing."
        )
    page.evaluate("([x, y]) => window.__cur(x, y, 1, true)", [x, y])
    cam.grab(page, 3)
    page.mouse.click(x, y)
    cam.grab(page, 2)
    page.evaluate("([x, y]) => window.__cur(x, y, 1, false)", [x, y])
    cam.grab(page, 3)


def caption(page, cam, text: str, fade_ms: int = 220, pos: str = "bottom") -> None:
    n = frames_for(fade_ms)
    page.evaluate("a => window.__cap(a[0], 0, a[1])", [text, pos])
    for i in range(1, n + 1):
        page.evaluate("o => window.__cap(null, o)", ease(i / n))
        cam.grab(page)


def caption_out(page, cam, fade_ms: int = 180) -> None:
    n = frames_for(fade_ms)
    for i in range(1, n + 1):
        page.evaluate("o => window.__cap(null, o)", 1 - ease(i / n))
        cam.grab(page)


def fade_wipe(page, cam, to: float, ms: int) -> None:
    n = frames_for(ms)
    frm = 1.0 - to
    for i in range(1, n + 1):
        page.evaluate("o => window.__wipe(o)", frm + (to - frm) * ease(i / n))
        cam.grab(page)


def chapter(page, cam, eyebrow: str, title: str, sub: str, ms: int) -> None:
    page.evaluate("a => window.__chapter(a[0], a[1], a[2], 0)", [eyebrow, title, sub])
    fade = frames_for(260)
    for i in range(1, fade + 1):
        page.evaluate("o => window.__chapter(null, null, null, o)", ease(i / fade))
        cam.grab(page)
    cam.hold(page, ms)
    for i in range(1, fade + 1):
        page.evaluate("o => window.__chapter(null, null, null, o)", 1 - ease(i / fade))
        cam.grab(page)


# ── storage ───────────────────────────────────────────────────────────────

def seed(page, storage) -> None:
    """Reset then seed localStorage. "keep" leaves it alone.

    Cross-surface state is shared same-origin localStorage, so the clip that
    edits a salary on /organisation and then shows the changed number in /pay/
    depends on NOT clearing between those two shots.
    """
    if storage == "keep":
        return
    page.evaluate(
        """([keys, seedObj]) => {
             keys.forEach(k => localStorage.removeItem(k));
             Object.entries(seedObj).forEach(([k, v]) => localStorage.setItem(
               k, typeof v === 'string' ? v : JSON.stringify(v)));
           }""",
        [RESET_KEYS, storage or {}],
    )


# ── the action dispatch table ─────────────────────────────────────────────

def run_action(page, cam, a: dict, offset: int) -> None:
    do = a["do"]
    if do == "hold":
        cam.hold(page, a["ms"])
    elif do == "settle":
        settle(page)
    elif do == "scroll":
        scroll_to(page, cam, a["to"], a.get("ms", 900), a.get("offset", offset))
    elif do == "scroll_top":
        page.evaluate("window.scrollTo(0, 0)")
        cam.hold(page, a.get("ms", 200))
    elif do == "cursor":
        cursor_to(page, cam, a["sel"], a.get("ms", 420))
    elif do == "click":
        click(page, cam, a["sel"])
        if a.get("settle", True):
            settle(page)
    elif do == "hover":
        cursor_to(page, cam, a["sel"], a.get("ms", 420))
        page.hover(a["sel"])
        settle(page, 2500)
        cam.hold(page, a.get("ms_hold", 900))
    elif do == "type":
        x, y = cursor_to(page, cam, a["sel"], a.get("ms", 380))
        page.click(a["sel"])
        page.evaluate("([x, y]) => window.__cur(x, y, 1, true)", [x, y])
        cam.grab(page, 2)
        page.evaluate("([x, y]) => window.__cur(x, y, 1, false)", [x, y])
        page.fill(a["sel"], "")
        cam.grab(page, 3)
        # Character by character: a value that appears all at once reads as a
        # scripted jump rather than someone typing.
        per = max(1, round(FPS / a.get("cps", 9)))
        for i in range(1, len(a["text"]) + 1):
            page.fill(a["sel"], a["text"][:i])
            cam.grab(page, per)
        cam.hold(page, a.get("ms_hold", 500))
    elif do == "caption":
        caption_out(page, cam)
        caption(page, cam, a["text"], pos=a.get("pos", "bottom"))
    else:
        raise SystemExit(f"Unknown action: {do}")


def audit(page, clips) -> int:
    """Resolve every selector without filming. Cheap insurance before a run."""
    bad = 0
    for clip in clips:
        for shot in clip["shots"]:
            page.goto(ORIGIN + shot["url"], wait_until="domcontentloaded")
            seed(page, shot.get("storage", {}))
            page.reload(wait_until="domcontentloaded")
            settle(page, 4000)
            # Selectors marked audit_skip only exist after an earlier action in
            # the same shot (a dialog field, a toggle's opposite state), so they
            # cannot be resolved against the initial page.
            sels = [a[k] for a in shot.get("actions", [])
                    if not a.get("audit_skip")
                    for k in ("sel", "to") if k in a]
            deferred = sum(1 for a in shot.get("actions", []) if a.get("audit_skip"))
            if deferred:
                print(f"  skipped  {clip['id']}/{shot['id']}: "
                      f"{deferred} selector(s) that appear only mid-shot")
            for s in sels:
                n = page.locator(s).count()
                if n == 0:
                    print(f"  MISSING  {clip['id']}/{shot['id']}: {s}", file=sys.stderr)
                    bad += 1
                else:
                    print(f"  ok({n})   {clip['id']}/{shot['id']}: {s}")
    return bad


def main() -> int:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    do_audit = "--audit" in sys.argv
    clips = [c for c in CLIPS if not args or c["id"] in args]
    if not clips:
        print(f"No clip matches {args}. Have: {[c['id'] for c in CLIPS]}", file=sys.stderr)
        return 1

    OUT.mkdir(exist_ok=True)
    if not FONTS_CSS.exists():
        print(f"{FONTS_CSS} missing. Run reporting/pdf/build_fonts.py first.",
              file=sys.stderr)
        return 1

    srv = subprocess.Popen([sys.executable, str(HERE / "serve.py"), str(PORT)])
    time.sleep(1.2)
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(args=[
                "--hide-scrollbars",
                "--force-color-profile=srgb",
                "--font-render-hinting=none",
                "--disable-backgrounding-occluded-windows",
            ])
            ctx = browser.new_context(
                viewport={"width": VIEWPORT[0], "height": VIEWPORT[1]},
                device_scale_factor=SCALE,
                reduced_motion="no-preference",
            )

            # Fonts from disk, so a caption is never caught mid-FOUT and two runs
            # are identical. index.css pulls Google Fonts via a serial @import,
            # which is the slowest possible path and the FOUT source.
            css = FONTS_CSS.read_text()
            ctx.route("**/__overlay-fonts.css",
                      lambda r: r.fulfill(status=200, content_type="text/css", body=css))

            def font_route(route):
                name = route.request.url.rsplit("/", 1)[-1].split("?")[0]
                local = FONTCACHE / name
                if local.exists():
                    route.fulfill(status=200, content_type="font/woff2",
                                  body=local.read_bytes())
                else:
                    route.fulfill(status=200, content_type="text/css", body=css)

            ctx.route("**://fonts.googleapis.com/**", font_route)
            ctx.route("**://fonts.gstatic.com/**", font_route)

            ctx.add_init_script((HERE / "overlay.js").read_text())
            page = ctx.new_page()

            if do_audit:
                page.goto(ORIGIN + "/", wait_until="domcontentloaded")
                rc = audit(page, clips)
                browser.close()
                print("\naudit:", "FAILED" if rc else "all selectors resolve")
                return 1 if rc else 0

            manifest = {}
            for clip in clips:
                path = OUT / clip["out"]
                cam = Camera(path)
                print(f"\n{clip['id']} -> {clip['out']}")
                for shot in clip["shots"]:
                    print(f"  {shot['id']}", end="", flush=True)
                    page.goto(ORIGIN + shot["url"], wait_until="domcontentloaded")
                    st = shot.get("storage", {})
                    if st != "keep":
                        seed(page, st)
                        page.reload(wait_until="domcontentloaded")
                    page.wait_for_function("window.__zbReady === true")
                    if shot.get("pre_delay_ms"):
                        page.wait_for_timeout(shot["pre_delay_ms"])
                    if shot.get("settle", True):
                        settle(page)
                    page.evaluate("window.__cur(null, null, 0, false)")

                    if shot.get("chapter"):
                        c = shot["chapter"]
                        page.evaluate("window.__wipe(0)")
                        chapter(page, cam, c.get("eyebrow", ""), c["title"],
                                c.get("sub", ""), c.get("ms", 1500))
                    else:
                        fade_wipe(page, cam, 0.0, shot.get("wipe_ms", 260))

                    if shot.get("caption"):
                        caption(page, cam, shot["caption"],
                                pos=shot.get("caption_pos", "bottom"))
                    offset = shot.get("offset", 84)
                    for a in shot.get("actions", []):
                        run_action(page, cam, a, offset)
                    if shot.get("caption"):
                        caption_out(page, cam)
                    fade_wipe(page, cam, 1.0, 200)
                    print(f"  ({cam.n} frames)")

                cam.close()
                secs = cam.n / FPS
                kb = path.stat().st_size / 1024
                manifest[clip["id"]] = {
                    "file": clip["out"], "frames": cam.n,
                    "seconds": round(secs, 1), "kb": round(kb),
                }
                print(f"  = {secs:.1f}s, {kb:.0f} KB")

            browser.close()
            (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2))
            total = sum(v["seconds"] for v in manifest.values())
            print(f"\n{len(manifest)} clip(s), {total:.0f}s total, in {OUT}")
    finally:
        srv.terminate()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
