"""Shot list for the Zigbert showcase: one minute, a trailer rather than a lesson.

WHY THIS EXISTS ALONGSIDE trailer.py. The long cut answers how it works, what it
costs and how to start, which makes it an explainer, and it read as an onboarding
tutorial: long static read beats, captions that teach, and slates that stop the
film to explain method. This one shows what the thing IS and gets out.

HOW IT IS SHORT WITHOUT BEING RUSHED. Not by reading faster. READ_WPM and the
13-word cap in record.py are untouched. Captions here are 5 to 7 words instead of
9 to 11, and there are 5 of them rather than 9, so the read beats cost 18s instead
of 48s and more than half the runtime is the product moving.

The first cut of this ran 77s against a 63s target. It came back to 66s by cutting
discretionary holds and by deleting one caption ("Search any role.") that the
footage already said: the box's own placeholder reads "Search a role, e.g.
Software Engineer" and the dropdown filters live under the keystrokes. That also
bought the film an uncaptioned typing stretch, which is more trailer than tutorial.

If you add to this file, add motion, not words.
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
_ALL = {"home": 1, "pay": 1, "benefits": 1, "organisation": 1, "account": 1}
QUIET = {
    **AUTH,
    "zigbert:tour-done": _ALL,
    "zigbert:tour-offered": _ALL,
    "zigbert:tour-checklist-off": "1",
}
# Two areas toured, three not, and the checklist NOT dismissed. That makes the
# "Getting started" panel render as "2 of 5 areas" with a 40% bar, Home and Pay
# ticked, and Benefits/Organisation/Account showing 40s/35s/20s. The product
# listing its own tutorials is better proof than a slate claiming they exist.
# If tour-checklist-off is set the mount renders EMPTY and the beat is lost
# silently, because it is a bare div.
PARTIAL = {**AUTH, "zigbert:tour-done": {"home": 1, "pay": 1},
           "zigbert:tour-offered": _ALL}

S = "/__slate/"

CLIPS = [{
    "id": "showcase",
    "out": "Zigbert-Showcase.mp4",
    "shots": [

        # ── 1. Title ────────────────────────────────────────────────────
        {
            "id": "title",
            "url": S + "meet",
            "storage": QUIET,
            "slate": True,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 300},
                {"do": "reveal", "n": 1, "hold": 700},
                {"do": "reveal", "n": 2, "hold": 1200},
            ],
        },

        # ── 2. Pay: search, then the answer ─────────────────────────────
        # "data" rather than "software": it returns five roles across TWO
        # different market positions (Median to UQ and LQ to Median), so the
        # dropdown visibly discriminates instead of repeating one label.
        {
            "id": "pay-search",
            "url": "/pay/",
            "storage": QUIET,
            "wipe_ms": 400,
            "captions": [
                "See exactly where you sit.",
                "Checked by a reward specialist.",
            ],
            "actions": [
                {"after": 0, "do": "type", "sel": "[data-testid='today-search']",
                 "text": "data", "cps": 6, "ms_hold": 900},
                # The result click clears the query, so the dropdown disappears
                # as the drawer arrives: a 500ms Radix Sheet sliding in from the
                # right with the backdrop fading behind it.
                {"after": 0, "do": "click",
                 "sel": "[data-testid='today-search'] ~ div.absolute.z-20 > button >> nth=0",
                 "audit_skip": True},
                {"after": 0, "do": "hold", "ms": 900},
                {"after": 1, "do": "hold", "ms": 500},
            ],
        },

        # ── 3. Benefits ─────────────────────────────────────────────────
        {
            "id": "benefits",
            "url": "/benefits/#action-plan",
            "storage": QUIET,
            "wipe_ms": 400,
            "captions": ["Benefits, benchmarked the same way."],
            "actions": [
                {"after": 0, "do": "click", "sel": "[data-amb='uq']"},
                {"after": 0, "do": "hold", "ms": 1600},
            ],
        },

        # ── 4. Your organisation: add a role ────────────────────────────
        # The payoff is the amber panel, which does not exist on the page until
        # something is awaiting, so it genuinely materialises. It also carries
        # "Typical turnaround is 48 hours" ON SCREEN, which is why the caption
        # does not need to claim it.
        {
            "id": "add-role",
            "url": "/organisation",
            "storage": QUIET,   # role mode: Add a role only renders when !isPerson
            "wipe_ms": 400,
            "captions": ["Add a role, we benchmark it."],
            "actions": [
                {"after": 0, "do": "click", "sel": "[data-tour='add-role']"},
                {"after": 0, "do": "hold", "ms": 250},
                {"after": 0, "do": "type",
                 "sel": "[role='dialog'] input[placeholder='e.g. Senior Product Manager']",
                 "text": "Data Engineer", "cps": 11, "audit_skip": True},
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
                 "text": "58000", "cps": 12, "audit_skip": True},
                {"after": 0, "do": "click",
                 "sel": "[role='dialog'] button:has-text('Submit for benchmark')",
                 "audit_skip": True},
                {"after": 0, "do": "scroll_top", "ms": 300},
                {"after": 0, "do": "hold", "ms": 1900},
            ],
        },

        # ── 5. You are not on your own ──────────────────────────────────
        {
            "id": "tutorials",
            "url": "/",
            "storage": PARTIAL,
            "settle": False,
            "pre_delay_ms": 1200,   # tour.js renders the checklist after load
            "wipe_ms": 400,
            "captions": ["Every area has a tutorial built in."],
            "actions": [{"after": 0, "do": "hold", "ms": 800}],
        },

        # ── 6. Support ──────────────────────────────────────────────────
        {
            "id": "support",
            "url": S + "support",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 400},
                {"do": "reveal", "n": 1, "hold": 1900},
                {"do": "reveal", "n": 2, "hold": 2300},
            ],
        },

        # ── 7. Close ────────────────────────────────────────────────────
        {
            "id": "close",
            "url": S + "closing",
            "storage": QUIET,
            "slate": True,
            "wipe_ms": 400,
            "actions": [
                {"do": "reveal", "n": 0, "hold": 500},
                {"do": "reveal", "n": 1, "hold": 1200},
                {"do": "reveal", "n": 2, "hold": 900},
                {"do": "reveal", "n": 3, "hold": 700},
                {"do": "reveal", "n": 4, "hold": 2600},
            ],
        },
    ],
}]
