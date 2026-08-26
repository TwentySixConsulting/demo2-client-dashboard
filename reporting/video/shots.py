"""Shot list for the Zigbert client walkthrough. The single source of truth.

Five short clips, one per area, mirroring the five in-product tours in shape but
NOT in content: the tours teach where things are, and re-narrating their 19 steps
would be a waste of a video. These show what the dashboard is FOR.

The five are Home, Pay, Benefits, Your Organisation, and Trends with Methodology.
Account is deliberately not filmed: it is billing and preferences, and nobody
needs a video to find an invoice.

Captions carry the narration. There is no voiceover, so a caption is not a label
for something already said out loud, it IS the line. Write them as sentences.

Edit here and rerun record.py. The cut is reproducible: same input, same output.
"""

FPS = 30
VIEWPORT = (1440, 810)   # matches the 1440px design; content is max-w-6xl (1152px)
SCALE = 2                # capture 2880x1620, box-downscale for sharp 11px text
OUTPUT = (1920, 1080)
PORT = 8788
ORIGIN = f"http://127.0.0.1:{PORT}"

# Every key the app writes. Cleared before each shot unless storage is "keep",
# so a run never inherits state from the previous one.
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
# The usual seed: signed in, and the tour kept quiet so a coachmark never lands
# over a shot. One shot deliberately omits this to film the tour firing.
QUIET = {
    **AUTH,
    "zigbert:tour-done": _DONE,
    "zigbert:tour-offered": _DONE,
    "zigbert:tour-checklist-off": "1",
}

CLIPS = [
    # ── 01 Home ──────────────────────────────────────────────────────────
    {
        "id": "01-home",
        "out": "Zigbert-01-Home.mp4",
        "shots": [
            {
                "id": "chapter",
                "url": "/",
                "storage": QUIET,
                "chapter": {
                    "eyebrow": "Zigbert",
                    "title": "Home",
                    "sub": "Where you stand, and what to do about it",
                    "ms": 1400,
                },
            },
            {
                "id": "verdict",
                "url": "/",
                "storage": QUIET,
                # The entrance animation is worth having on camera, so don't
                # settle it away before the first frame.
                "settle": False,
                "pre_delay_ms": 400,
                # One shot, two facts. A separate shot for the roles split showed
                # an identical frame, so the caption promised a move the camera
                # never made.
                "caption": "Every time you sign in, one sentence tells you where you stand, "
                           "with your roles split against the market beside it. "
                           "Both are generated from your own data.",
                "actions": [{"do": "hold", "ms": 4200}],
            },
            {
                "id": "areas",
                "url": "/",
                "storage": QUIET,
                "caption": "Three areas, each showing a preview of what is inside.",
                "actions": [
                    {"do": "scroll", "to": "[data-tour='explore']", "ms": 1100},
                    {"do": "hold", "ms": 2400},
                ],
            },
            {
                "id": "attention",
                "url": "/",
                "storage": QUIET,
                "caption": "Then the part most people start with: what needs attention, "
                           "ranked from your data rather than chosen by us.",
                "actions": [
                    {"do": "scroll", "to": "[data-tour='attention']", "ms": 1000},
                    {"do": "hold", "ms": 3200},
                ],
            },
            {
                "id": "tour-fires",
                "url": "/",
                # ONLY auth, so tour.js's 900ms maybeOffer fires on camera. This
                # is the one shot that wants the coachmark.
                "storage": AUTH,
                "settle": False,
                "pre_delay_ms": 1600,   # 900 offer + 260 placement + air
                # Caption goes to the top: the tour's own nudge card is
                # bottom-right and the two would crowd each other.
                "caption_pos": "top",
                "caption": "The first time you arrive anywhere, a short tour offers itself.",
                "actions": [{"do": "hold", "ms": 3000}],
            },
        ],
    },

    # ── 02 Pay ───────────────────────────────────────────────────────────
    {
        "id": "02-pay",
        "out": "Zigbert-02-Pay.mp4",
        "shots": [
            {
                "id": "chapter",
                "url": "/pay/",
                "storage": QUIET,
                "chapter": {
                    "eyebrow": "Zigbert",
                    "title": "Pay",
                    "sub": "Role by role, against your market",
                    "ms": 1400,
                },
            },
            {
                "id": "today",
                "url": "/pay/",
                "storage": QUIET,
                "caption": "Your overall position, the roles below market, "
                           "and what your pay bill comes to.",
                "actions": [{"do": "hold", "ms": 3000}],
            },
            {
                "id": "search",
                "url": "/pay/",
                "storage": QUIET,
                "caption": "Search any job title to see exactly where its pay "
                           "sits inside the market range.",
                "actions": [
                    {"do": "cursor", "sel": "[data-testid='today-search']"},
                    {"do": "hold", "ms": 2400},
                ],
            },
            {
                "id": "role-by-role",
                "url": "/pay/role-details",
                "storage": QUIET,
                "caption": "Every role on its own range, with a marker showing "
                           "where you sit. Lower quartile, median, upper quartile.",
                "actions": [{"do": "hold", "ms": 3400}],
            },
            {
                "id": "pay-review",
                "url": "/pay/pay-review",
                "storage": QUIET,
                # Top: Step 2's lower quartile / median / upper quartile buttons
                # are bottom-centre and they are what the caption is describing.
                "caption_pos": "top",
                "caption": "And the part worth the subscription: model what it "
                           "would cost to move roles to market, before you commit to a budget.",
                "actions": [{"do": "hold", "ms": 3800}],
            },
        ],
    },

    # ── 03 Benefits ──────────────────────────────────────────────────────
    {
        "id": "03-benefits",
        "out": "Zigbert-03-Benefits.mp4",
        "shots": [
            {
                "id": "chapter",
                "url": "/benefits/",
                "storage": QUIET,
                "chapter": {
                    "eyebrow": "Zigbert",
                    "title": "Benefits",
                    "sub": "Category by category, against the same market",
                    "ms": 1400,
                },
            },
            {
                "id": "verdict",
                "url": "/benefits/",
                "storage": QUIET,
                "caption": "How competitive your benefits offer is overall, "
                           "and where the gaps are.",
                "actions": [{"do": "hold", "ms": 3000}],
            },
            {
                "id": "scorecard",
                "url": "/benefits/",
                "storage": QUIET,
                "caption": "A scorecard across all six categories, then the detail "
                           "behind each one down the left.",
                "actions": [
                    {"do": "scroll", "to": "#bx-scorecard", "ms": 1000},
                    {"do": "hold", "ms": 2800},
                ],
            },
            {
                "id": "category",
                "url": "/benefits/",
                "storage": QUIET,
                "caption": "Each benefit against the market quartiles, "
                           "with the reasoning rather than just a score.",
                "actions": [
                    {"do": "click", "sel": ".navlink[data-page='health']"},
                    {"do": "hold", "ms": 3000},
                ],
            },
            {
                "id": "action-plan",
                "url": "/benefits/",
                "storage": QUIET,
                "caption": "The action plan re-ranks itself depending on whether "
                           "you want to match the market or lead it.",
                "actions": [
                    {"do": "click", "sel": ".navlink[data-page='action-plan']"},
                    {"do": "hold", "ms": 1800},
                    {"do": "click", "sel": "[data-amb='uq']"},
                    {"do": "hold", "ms": 3000},
                ],
            },
        ],
    },

    # ── 04 Your Organisation ─────────────────────────────────────────────
    # The money shot: change a salary here, then show the Pay dashboard already
    # knows. It is what proves this is a product and not a PDF. Mechanically it
    # works because zigbert:role-overrides is shared same-origin localStorage,
    # which is why the follow-on shots carry "keep".
    {
        "id": "04-organisation",
        "out": "Zigbert-04-Organisation.mp4",
        "shots": [
            {
                "id": "chapter",
                "url": "/organisation",
                "storage": QUIET,
                "chapter": {
                    "eyebrow": "Zigbert",
                    "title": "Your Organisation",
                    "sub": "The one page where you are the authority",
                    "ms": 1400,
                },
            },
            {
                "id": "summary",
                "url": "/organisation",
                "storage": QUIET,
                "caption": "Your roles, your people, your benefits, and anything "
                           "currently with us to benchmark.",
                "actions": [{"do": "hold", "ms": 3000}],
            },
            {
                "id": "by-person",
                "url": "/organisation",
                "storage": "keep",
                "caption": "Switch to people when several share a job title, or "
                           "when anyone works part time. Their FTE salary is what gets compared.",
                "actions": [
                    {"do": "scroll", "to": "[aria-label='View by role or by person']", "ms": 900},
                    # Actually press it. A caption that says "switch" over a shot
                    # that never switches is the kind of thing a client notices.
                    {"do": "click", "sel": "button[aria-pressed='false']:has-text('By person')"},
                    {"do": "hold", "ms": 3000},
                ],
            },
            {
                "id": "edit",
                # Fresh seed rather than "keep": this shot needs role mode, and
                # the previous one deliberately left the toggle on people. It is
                # also the shot that CREATES the override, so it has nothing to
                # inherit. Only the shot after this one must keep.
                "url": "/organisation",
                "storage": QUIET,
                # The salary is genuinely changed here, through the dialog, so
                # the next shot is showing a real consequence rather than a
                # staged one. Software Engineer is 55,000 in the seed roster.
                "caption": "Change a salary here and it does not stay here.",
                "actions": [
                    {"do": "scroll", "to": "[data-tour='roles-table']", "ms": 900},
                    {"do": "click", "sel": "[aria-label='Edit Software Engineer']"},
                    {"do": "hold", "ms": 1200},
                    # The dialog has TWO number inputs, salary and headcount, and
                    # its Labels carry no htmlFor, so neither get_by_label nor a
                    # bare type selector is safe. Position it is.
                    {"do": "type", "sel": "[role='dialog'] input[type='number'] >> nth=0",
                     "text": "61500", "cps": 7, "audit_skip": True},
                    {"do": "click", "sel": "[role='dialog'] button:has-text('Save changes')",
                     "audit_skip": True},
                    {"do": "hold", "ms": 2400},
                ],
            },
            {
                "id": "flows-through",
                "url": "/pay/role-details",
                "storage": "keep",   # MUST keep: the edit above lives in localStorage
                # Top: the card's own CURRENT salary figure sits bottom-centre,
                # and that figure is the whole point of the shot.
                "caption_pos": "top",
                "caption": "The Pay dashboard already knows. One number, changed once, "
                           "everywhere it matters.",
                "actions": [
                    # Filter to Engineering, or the payoff frame shows the
                    # Commercial group and the changed role is off-screen. A
                    # caption claiming the number moved has to show the number.
                    {"do": "click", "sel": "button:has-text('Engineering') >> nth=0"},
                    {"do": "hold", "ms": 3600},
                ],
            },
        ],
    },

    # ── 05 Trends and Methodology ────────────────────────────────────────
    {
        "id": "05-context",
        "out": "Zigbert-05-Context.mp4",
        "shots": [
            {
                "id": "chapter",
                "url": "/trends",
                "storage": QUIET,
                "chapter": {
                    "eyebrow": "Zigbert",
                    "title": "Context",
                    "sub": "What the market is doing, and where the numbers come from",
                    "ms": 1400,
                },
            },
            {
                "id": "economy",
                "url": "/trends",
                "storage": QUIET,
                "offset": 132,   # /trends has its own sticky rail; matches its LINE
                "caption": "Inflation, unemployment and the wage floors, so your own "
                           "figures can be read against what is moving them.",
                "actions": [{"do": "hold", "ms": 3200}],
            },
            {
                "id": "floor",
                "url": "/trends",
                "storage": QUIET,
                "offset": 132,
                "caption": "Including the one that is specific to you: whether the "
                           "incoming statutory floor overtakes your lowest-paid role.",
                "actions": [
                    # By heading text, not by section id: #pay is the START of the
                    # pay group, and this callout is the END of the economy one.
                    {"do": "scroll", "to": "text=The floor against your lowest-paid role",
                     "ms": 1400, "offset": 300},
                    {"do": "hold", "ms": 3200},
                ],
            },
            {
                "id": "pressure",
                "url": "/trends",
                "storage": QUIET,
                "offset": 132,
                "caption": "Then where pay pressure is building by role, "
                           "so you know which gaps get more expensive if you wait.",
                "actions": [
                    {"do": "scroll", "to": "text=Pay pressure by role",
                     "ms": 1800, "offset": 150},
                    {"do": "hold", "ms": 3200},
                ],
            },
            {
                "id": "methodology",
                "url": "/methodology",
                "storage": QUIET,
                "caption": "And no black box. Where every number comes from, "
                           "why your comparator group is 47 employers and not 1.5 million, "
                           "and who reviewed it before you saw it.",
                "actions": [
                    {"do": "hold", "ms": 3000},
                    # On /methodology, #benefits is section 5, which is where the
                    # 47-versus-1.5-million question actually gets answered. Same
                    # id means a different thing on /trends.
                    {"do": "scroll", "to": "#benefits", "ms": 1400, "offset": 90},
                    {"do": "hold", "ms": 3400},
                ],
            },
        ],
    },
]
