"""Shot list for the Zigbert trailer. One film, ~2m20s. Single source of truth.

WHO IT IS FOR. Somebody who has never heard of Zigbert. That is a different job
from shots.py, whose five clips assume you already bought the thing.

TWO REGISTERS. The film alternates branded full-frame SLATES, where the words are
the page's own typography, with PRODUCT FOOTAGE, where the words are in the dark
caption bar. So the viewer always knows without being told whether they are being
told something or shown something. It also solves the problem that a third of the
content (pricing, how to start, the data method) has no screen to film.

PACING. Hold time is DERIVED from each caption by record.read_ms() at 130 wpm, and
record.check_captions() refuses to film anything over 13 words. The first cut of
the onboarding clips ran 19 of 20 captions over 170 wpm and read as rushed. Do not
add a hand-typed hold next to a caption; let the formula do it.

Captions are the narration: there is no voiceover. Write them as sentences.
"""

FPS = 30
VIEWPORT = (1440, 810)
SCALE = 2
OUTPUT = (1920, 1080)
PORT = 8788
ORIGIN = f"http://127.0.0.1:{PORT}"

RESET_KEYS = [
    "demo-client-dashboard:temp-auth",
    "demo-client-dashboard:org-roles",
    "demo-client-dashboard:org-benefits",
    "demo-client-dashboard:user-roles",
    "zigbert:role-overrides",
    "zigbert:benefit-overrides",
    "zigbert:people",
    "zigbert:pay-view-mode",
    "zigbert:tour",
    "zigbert:tour-done",
    "zigbert:tour-offered",
    "zigbert:tour-seen",
    "zigbert:tour-checklist-off",
]

AUTH = {"demo-client-dashboard:temp-auth": {"username": "brighton technologies"}}
_DONE = {"home": 1, "pay": 1, "benefits": 1, "organisation": 1, "account": 1}
# Signed in, tour silenced. A trailer never wants a coachmark over a shot.
QUIET = {
    **AUTH,
    "zigbert:tour-done": _DONE,
    "zigbert:tour-offered": _DONE,
    "zigbert:tour-checklist-off": "1",
}

S = "/__slate/"

CLIPS = [{
    "id": "trailer",
    "out": "Zigbert-Trailer.mp4",
    "shots": [

        # ── 1. Meet Zigbert ─────────────────────────────────────────────
        {
            "id": "meet",
            "url": S + "meet",
            "storage": QUIET,
            "slate": True,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 900},
                {"do": "reveal", "n": 1, "hold": 1500},
                {"do": "reveal", "n": 2, "hold": 2400},
            ],
        },

        # ── 2. Where you stand ──────────────────────────────────────────
        {
            "id": "home",
            "url": "/",
            "storage": QUIET,
            # settle False so the app's own 720ms ts-anim-fade-up plays on
            # camera instead of being settled away, which is what happened to
            # it in every previous cut.
            "settle": False,
            "pre_delay_ms": 400,
            "wipe_ms": 400,
            "captions": ["One sentence tells you where your pay sits against the market."],
            "actions": [
                {"after": 0, "do": "scroll", "to": "[data-tour='attention']", "ms": 2200},
                {"after": 0, "do": "hold", "ms": 1600},
            ],
        },

        # ── 3. Role by role, or person by person ────────────────────────
        {
            "id": "role-range",
            "url": "/pay/role-details",
            "storage": QUIET,
            # Catches the staggered animate-slide-up wave: 0.6s per card with
            # delays cycling 0.06 to 0.30s. Never once been on camera.
            "settle": False,
            "pre_delay_ms": 250,
            "wipe_ms": 400,
            "captions": [
                "Every role sits on its own market range, with your pay marked.",
                "Or switch to people, each with their own FTE.",
            ],
            # No extra hold after a caption: the read beat already holds the frame
            # completely still for the caption's full reading time, so a hold here
            # was dead air on top of dead air.
            "actions": [
                {"after": 0, "do": "cursor", "sel": "[data-testid='role-card-11']", "ms": 700},
                {"after": 1, "do": "click", "sel": "button[aria-pressed='false']:has-text('By person')"},
                {"after": 1, "do": "hold", "ms": 1200},
            ],
        },

        # ── 4. Preparing a pay review. The centrepiece. ─────────────────
        # The page ARRIVES pre-loaded: nine below-median roles as chips, target
        # Median, Total uplift £15.4k. So the shot changes something rather than
        # building a scenario. Median -> Upper Quartile moves six figures at
        # once. Do NOT use Lower Quartile: all nine roles already sit above it,
        # so it shows £0 and the cost chart unmounts entirely.
        {
            "id": "pay-review",
            "url": "/pay/pay-review",
            "storage": QUIET,
            "wipe_ms": 400,
            "captions": [
                "Planning a pay review? Model the cost before you commit.",
                "Change the target, and every figure moves with it.",
                "Then pop any of it out for your board.",
            ],
            "actions": [
                {"after": 1, "do": "click",
                 "sel": "button[role='radio']:has-text('Upper Quartile')"},
                # A beat to register that the pill moved, THEN travel to the
                # figures. The summary tiles sit below the fold on an 810px
                # viewport, so without this scroll the caption promises figures
                # the viewer cannot see and the payoff lands eight seconds later
                # under the wrong caption.
                {"after": 1, "do": "hold", "ms": 700},
                {"after": 1, "do": "scroll", "to": "text=Total uplift cost", "ms": 1500,
                 "offset": 300},
                # Three full seconds, completely still, on the changed figures.
                {"after": 1, "do": "hold", "ms": 3000},
                # Trace the export row without pressing: two would start a
                # download and Download report opens a native print dialog that
                # would hang the recorder.
                {"after": 2, "do": "cursor", "sel": "button:has-text('Export image')", "ms": 900},
            ],
        },

        # ── 5. Benefits, and the market ─────────────────────────────────
        {
            "id": "benefits",
            "url": "/benefits/#action-plan",
            "storage": QUIET,
            "wipe_ms": 400,
            "captions": ["Benefits benchmarked the same way. Match the market, or lead it."],
            "actions": [
                {"after": 0, "do": "click", "sel": "[data-amb='uq']"},
                {"after": 0, "do": "hold", "ms": 2200},
            ],
        },
        {
            "id": "trends",
            "url": "/trends",
            "storage": QUIET,
            "offset": 132,   # matches Trends.tsx's own sticky-rail LINE
            "wipe_ms": 400,
            "captions": ["Plus where pay pressure is building, role by role."],
            "actions": [
                # One long scroll, far enough that the rail's clay tick actually
                # hops between links. Previous cuts never left the first group.
                {"after": 0, "do": "scroll", "to": "text=Pay pressure by role", "ms": 2400,
                 "offset": 150},
                {"after": 0, "do": "hold", "ms": 1600},
            ],
        },

        # ── 6. What people use it for ───────────────────────────────────
        {
            "id": "usedfor",
            "url": S + "usedfor",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 700},
                {"do": "reveal", "n": 1, "hold": 3200},
                {"do": "reveal", "n": 2, "hold": 3200},
                {"do": "reveal", "n": 3, "hold": 3400},
            ],
        },

        # ── 7. How the numbers are made ─────────────────────────────────
        # Framed as OUR curation input, never as a database the client browses.
        # And the monthly refresh is deliberately absent: the database refreshes
        # monthly but a client's dashboard is republished quarterly, so saying
        # "refreshed monthly" over product footage would mislead.
        {
            "id": "data",
            "url": S + "data",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 700},
                {"do": "reveal", "n": 1, "hold": 1500},
                {"do": "reveal", "n": 2, "hold": 2600},
            ],
        },
        {
            "id": "dataflow",
            "url": S + "dataflow",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 320,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 1900},
                {"do": "reveal", "n": 1, "hold": 2600},
                {"do": "reveal", "n": 2, "hold": 2400},
            ],
        },
        {
            "id": "positioning",
            "url": S + "positioning",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [{"do": "reveal", "n": 0, "hold": 3000}],
        },

        # ── 8. How to start ─────────────────────────────────────────────
        {
            "id": "start",
            "url": S + "start",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 600},
                {"do": "reveal", "n": 1, "hold": 1600},
                {"do": "reveal", "n": 2, "hold": 800},
                {"do": "reveal", "n": 3, "hold": 800},
                {"do": "reveal", "n": 4, "hold": 1400},
                {"do": "reveal", "n": 5, "hold": 2600},
            ],
        },
        {
            "id": "reviewed",
            "url": S + "reviewed",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 320,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 600},
                {"do": "reveal", "n": 1, "hold": 2600},
                {"do": "reveal", "n": 2, "hold": 2600},
            ],
        },
        # The payoff: the amber panel does not exist on the page until something
        # is awaiting, so it genuinely materialises. And it carries the 48 hours
        # ON SCREEN, in the product, which is proof rather than claim.
        {
            "id": "add-role",
            "url": "/organisation",
            "storage": QUIET,   # role mode: Add a role only renders when !isPerson
            "wipe_ms": 400,
            "captions": ["Add a role any time. Your consultant is notified."],
            "actions": [
                {"after": 0, "do": "click", "sel": "[data-tour='add-role']"},
                {"after": 0, "do": "hold", "ms": 500},
                {"after": 0, "do": "type",
                 "sel": "[role='dialog'] input[placeholder='e.g. Senior Product Manager']",
                 "text": "Data Engineer", "cps": 7, "audit_skip": True},
                {"after": 0, "do": "click",
                 "sel": "[role='dialog'] button[role='combobox'] >> nth=0", "audit_skip": True},
                {"after": 0, "do": "click", "sel": "[role='option']:has-text('Data')",
                 "audit_skip": True},
                {"after": 0, "do": "click",
                 "sel": "[role='dialog'] button[role='combobox'] >> nth=1", "audit_skip": True},
                {"after": 0, "do": "click", "sel": "[role='option']:has-text('Mid-level')",
                 "audit_skip": True},
                {"after": 0, "do": "type",
                 "sel": "[role='dialog'] input[placeholder='62000']",
                 "text": "58000", "cps": 8, "audit_skip": True},
                {"after": 0, "do": "click",
                 "sel": "[role='dialog'] button:has-text('Submit for benchmark')",
                 "audit_skip": True},
                {"after": 0, "do": "scroll_top", "ms": 300},
                {"after": 0, "do": "hold", "ms": 2600},
            ],
        },

        # ── 9. Pricing ──────────────────────────────────────────────────
        {
            "id": "pricing",
            "url": S + "pricing",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 600},
                {"do": "reveal", "n": 1, "hold": 1800},
                {"do": "reveal", "n": 2, "hold": 2400},
                {"do": "reveal", "n": 3, "hold": 2600},
            ],
        },

        # ── 10. Close ───────────────────────────────────────────────────
        {
            "id": "close",
            "url": S + "close",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 900},
                {"do": "reveal", "n": 1, "hold": 2200},
                {"do": "reveal", "n": 2, "hold": 1100},
                {"do": "reveal", "n": 3, "hold": 3200},
            ],
        },
    ],
}]
