#!/usr/bin/env python3
"""Pilot kick-off deck: what happens between "we have your roles" and "here is
your dashboard".

NOT a pitch. By the time this is shown the client has already had the what-is-
Zigbert conversation and said yes, so the deck's only job is to set out the
process, ask the questions that actually block the build, and agree how they
want to receive the thing. Seven slides.

Parameterised by CLIENT below, because every pilot client gets this same
conversation. Change the four values at the top and rebuild.

House style is lifted from ~/zigbert-research/build_pptx.py so the two decks
look like they come from the same place: 16:9, cream ground, white cards with a
clay top rule, Poppins headings and Inter body. Its primitives are not
importable (that file builds its deck at module level), so the handful used here
are adapted rather than shared.

Figures come from ../pdf/manifest.py, so a number cannot say one thing in the
pack and another on a slide.

Run: python3 build_kickoff.py
"""
import subprocess
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.util import Emu, Inches, Pt

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "pdf"))
from manifest import FIGURES  # noqa: E402

CLIENT = "Sussex Emmaus"
REFERRER = "you"              # the deck is addressed to the person who referred them
WHEN = "September 2026"
OUT = HERE / f"Zigbert-Kickoff-{CLIENT.replace(' ', '-')}.pptx"

# Read off the LIVE build, not the source defaults: AuthContext falls back to
# demo/Demo26 only when VITE_DEMO_USERNAME and VITE_DEMO_PASSWORD are unset at
# build time, and the deployed bundle is the one that decides. Checked by
# pulling assets/index-*.js from the Pages URL and grepping for the pair.
DEMO_URL = "twentysixconsulting.github.io/demo2-client-dashboard"
DEMO_USER, DEMO_PASS = "demo", "Demo26"

DISPLAY, BODY = "Poppins", "Inter"


def rgb(h):
    return RGBColor.from_string(h)


# Matches ~/zigbert-research/data.py so the two decks share one palette. Note
# this is the DECK cream (F4F1EA), warmer than the documents' near-white.
CLAY, CLAY_DEEP, CLAY_TINT = rgb("C9785A"), rgb("B0603F"), rgb("E8D8CE")
SLATE, SLATE_TINT = rgb("7285A5"), rgb("DDE3EC")
INK, CREAM, WHITE = rgb("121C2B"), rgb("F4F1EA"), rgb("FFFFFF")
BORDER, GREY, MUTED = rgb("E7E0D4"), rgb("6B7280"), rgb("9AA1AC")
GREEN = rgb("2F7D5B")

SHELL = HERE.parents[1] / "client" / "public" / "shell"
ASSETS = HERE / "assets"
LOGO_DARK = ASSETS / "zigbert-logo.png"        # navy, for the cream slides
LOGO_LIGHT = ASSETS / "zigbert-logo-light.png"  # cream, for the ink title

W, H = Inches(13.333), Inches(7.5)
M = Inches(0.72)
CW = W - 2 * M

ASSETS.mkdir(exist_ok=True)
for name in ("zigbert-logo.png", "zigbert-logo-light.png"):
    src = SHELL / name
    if not src.exists():
        raise SystemExit(f"Missing {src}. The deck needs both the navy logo and "
                         f"the light one for the ink title slide.")
    (ASSETS / name).write_bytes(src.read_bytes())

prs = Presentation()
prs.slide_width, prs.slide_height = W, H
BLANK = prs.slide_layouts[6]
N = 0


# ─────────────────────────────────────────────────────── primitives

def slide(bg=CREAM):
    s = prs.slides.add_slide(BLANK)
    f = s.background.fill
    f.solid()
    f.fore_color.rgb = bg
    return s


def rect(s, x, y, w, h, fill=None, line=None, line_w=Pt(1), shape=MSO_SHAPE.RECTANGLE):
    sh = s.shapes.add_shape(shape, x, y, w, h)
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid()
        sh.fill.fore_color.rgb = fill
    if line is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line
        sh.line.width = line_w
    sh.shadow.inherit = False
    return sh


def text(s, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP,
         line_spacing=1.15):
    """runs: list of (text, pt, bold, colour, font, space_after_pt)"""
    tb = s.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = True
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = 0
    tf.margin_top = tf.margin_bottom = 0
    for i, (txt, size, bold, colour, font, space) in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = line_spacing
        p.space_after = Pt(space)
        r = p.add_run()
        r.text = txt
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.color.rgb = colour
        r.font.name = font
    return tb


def head(s, kicker, title, sub=None):
    """Left clay edge, kicker, title, rule, optional standfirst."""
    rect(s, 0, 0, Inches(0.3), H, fill=CLAY)
    s.shapes.add_picture(str(LOGO_DARK), W - M - Inches(1.5), Inches(0.40),
                         width=Inches(1.5))
    text(s, M, Inches(0.44), CW, Inches(0.26),
         [(kicker.upper(), 11, True, CLAY_DEEP, DISPLAY, 0)])
    text(s, M, Inches(0.74), CW, Inches(0.5),
         [(title, 29, True, INK, DISPLAY, 0)])
    y = Inches(1.30)
    if sub:
        text(s, M, y, Inches(11.4), Inches(0.6),
             [(sub, 12.5, False, GREY, BODY, 0)], line_spacing=1.3)
        y += Inches(0.34) + Inches(0.24) * (len(sub) // 108)
    return y + Inches(0.24)


def card(s, x, y, w, h, kicker, title, lines, accent=CLAY, title_size=17):
    """A white card with a coloured top rule.

    The title's height is ESTIMATED rather than assumed. python-pptx cannot
    measure text, so an earlier version placed the body a fixed 0.44in below the
    title and any title that wrapped to two lines was written straight over it.
    Poppins bold averages about 0.55em a glyph, which is close enough to count
    lines from the card's inner width and shift the body down by the right
    number of them. Over-estimating is harmless, so the divisor is deliberately
    a little pessimistic.
    """
    rect(s, x, y, w, h, fill=WHITE, line=BORDER)
    rect(s, x, y, w, Pt(4), fill=accent)
    pad = Inches(0.26)
    cy = y + Inches(0.28)
    if kicker:
        text(s, x + pad, cy, w - 2 * pad, Inches(0.22),
             [(kicker.upper(), 9.5, True, accent, DISPLAY, 0)])
        cy += Inches(0.30)
    inner_pt = (w - 2 * pad) / Emu(1) / 12700.0        # Emu -> points
    per_line = max(8, int(inner_pt / (title_size * 0.55)))
    tlines = max(1, -(-len(title) // per_line))         # ceil
    title_h = Inches(0.30) * tlines
    text(s, x + pad, cy, w - 2 * pad, title_h + Inches(0.1),
         [(title, title_size, True, INK, DISPLAY, 0)], line_spacing=1.1)
    cy += title_h + Inches(0.14)
    runs = [(t, 11.5, False, GREY, BODY, 7) for t in lines]
    text(s, x + pad, cy, w - 2 * pad, h - (cy - y) - Inches(0.2), runs,
         line_spacing=1.28)


def numbered(s, x, y, w, items, size=12.5, gap=Inches(0.62)):
    """A numbered list with clay numerals, for a sequence rather than a set."""
    for i, (lead, body) in enumerate(items, start=1):
        text(s, x, y, Inches(0.34), Inches(0.3),
             [(str(i), 15, True, CLAY, DISPLAY, 0)])
        runs = [(lead + "  ", size, True, INK, BODY, 0)]
        tb = s.shapes.add_textbox(x + Inches(0.42), y - Inches(0.02),
                                  w - Inches(0.42), gap)
        tf = tb.text_frame
        tf.word_wrap = True
        tf.auto_size = MSO_AUTO_SIZE.NONE
        tf.margin_left = tf.margin_right = 0
        tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.line_spacing = 1.25
        for txt, sz, bold, col in ((lead + "  ", size, True, INK),
                                   (body, size, False, GREY)):
            r = p.add_run()
            r.text = txt
            r.font.size = Pt(sz)
            r.font.bold = bold
            r.font.color.rgb = col
            r.font.name = BODY
        y += gap
    return y


def track(s, x, y, w, stops, dot=Inches(0.22), title_size=15):
    """Horizontal timeline. Each stop draws the rule to its right, and the last
    draws none, so the line finishes exactly on the final dot however many
    stops there are. Same trick as the invitation flyer's CSS track."""
    n = len(stops)
    gap = Inches(0.34)
    colw = (w - gap * (n - 1)) / n
    for i, (when, title, dur, body, acc) in enumerate(stops):
        cx = x + i * (colw + gap)
        if i < n - 1:
            rect(s, cx + dot, y + dot / 2 - Emu(6350), colw + gap - dot,
                 Pt(1.5), fill=CLAY_TINT)
        rect(s, cx, y, dot, dot, fill=acc, shape=MSO_SHAPE.OVAL)
        text(s, cx, y + Inches(0.42), colw, Inches(0.24),
             [(when.upper(), 9.5, True, acc, DISPLAY, 0)])
        text(s, cx, y + Inches(0.70), colw, Inches(0.34),
             [(title, title_size + 1, True, INK, DISPLAY, 0)])
        # No placeholder dash when a stop has no duration: an em dash is
        # against house style and it read as a missing value.
        if dur:
            text(s, cx, y + Inches(1.06), colw, Inches(0.26),
                 [(dur, 10.5, True, CLAY_DEEP, DISPLAY, 0)])
        text(s, cx, y + Inches(1.44), colw, Inches(2.1),
             [(body, 10.5, False, GREY, BODY, 0)], line_spacing=1.32)


def footer(s):
    global N
    N += 1
    text(s, M, H - Inches(0.44), Inches(7), Inches(0.24),
         [(f"{CLIENT} · Zigbert · {WHEN}", 8.5, False, MUTED, BODY, 0)])
    text(s, W - M - Inches(1.0), H - Inches(0.44), Inches(1.0), Inches(0.24),
         [(str(N), 8.5, False, MUTED, BODY, 0)], align=PP_ALIGN.RIGHT)


# ═══════════════════════════════════════════════════ 1. Title
s = slide(INK)
rect(s, 0, 0, Inches(0.34), H, fill=CLAY)
s.shapes.add_picture(str(LOGO_LIGHT), M + Inches(0.2), Inches(0.85),
                     width=Inches(2.35))
text(s, M + Inches(0.2), Inches(2.75), CW, Inches(0.3),
     [("WHERE WE'RE UP TO", 12, True, CLAY, DISPLAY, 0)])
text(s, M + Inches(0.2), Inches(3.20), Inches(10.4), Inches(1.5),
     [(f"{CLIENT} on Zigbert", 42, True, WHITE, DISPLAY, 0)])
text(s, M + Inches(0.2), Inches(4.55), Inches(9.6), Inches(1.0),
     [("What happens between now and you having the dashboard.",
       14.5, False, rgb("B9C1CC"), BODY, 0)], line_spacing=1.35)
text(s, M + Inches(0.2), Inches(6.30), Inches(8), Inches(0.3),
     [(f"TwentySix Consulting  ·  {WHEN}", 11, False, rgb("6E7A8A"), BODY, 0)])

# ═══════════════════════════════════════════════════ 2. The timeline
s = slide()
y = head(s, "The plan", "Roles in, dashboard out, six weeks",
         "You've sent us everything we need, so the next bit is on us. "
         "Three short calls across the six weeks and that's it.")
track(s, M, y + Inches(0.34), CW, [
    ("Done", "Roles received", "",
     "FTE salary and level for every one.", GREEN),
    ("This week", "We benchmark", "",
     "Matched on function, level, industry and location, then checked by "
     "one of our specialists.", CLAY),
    ("Week 2 · 14 Sept", "First look", "30-45 min",
     "Your data's in by then. We watch how you use it without chipping in, "
     "then talk through anything that needs it.", SLATE),
    ("Week 3 or 4", "Check-in", "30 min",
     "How you've got on, any questions, and anything we can change to fit "
     "how you're using it.", SLATE),
    ("Week 5 or 6", "Final call", "30 min",
     "How it went, and what we should do differently.", INK),
])

# The timeline left the bottom third empty, and the one thing a client wants to
# know off a schedule is how much of their time it costs. Deliberately "on
# calls" rather than a total: the invitation flyer's three to four hours also
# counts the spreadsheet and a survey, and two different totals would clash.
bb = y + Inches(3.30)
rect(s, M, bb, CW, Inches(0.92), fill=WHITE, line=BORDER)
rect(s, M, bb, Pt(4), Inches(0.92), fill=CLAY)
text(s, M + Inches(0.32), bb + Inches(0.29), Inches(11.6), Inches(0.32),
     [("About an hour and a half on calls across the whole six weeks. "
       "Everything else is us.", 12.5, False, GREY, BODY, 0)])
footer(s)

# ═══════════════════════════════════════════════════ 3. The levels
s = slide()
y = head(s, "One thing we need", "Quick one on the levels",
         f"The {CLIENT} file has 1, 2, 3 and 4 with nothing attached to them. "
         "Level is one of the four things we match on, so it's worth pinning down.")

rect(s, M, y, Inches(5.3), Inches(3.0), fill=WHITE, line=BORDER)
rect(s, M, y, Inches(5.3), Pt(4), fill=SLATE)
text(s, M + Inches(0.28), y + Inches(0.26), Inches(4.7), Inches(0.3),
     [("OURS RUNS 1 AT THE TOP", 9.5, True, SLATE, DISPLAY, 0)])
ly = y + Inches(0.70)
for lvl, label, note in [("1", "Director", "most senior"), ("2", "Senior", ""),
                         ("3", "Practitioner", ""), ("4", "Junior", "most junior")]:
    text(s, M + Inches(0.28), ly, Inches(0.4), Inches(0.28),
         [(lvl, 14, True, CLAY, DISPLAY, 0)])
    text(s, M + Inches(0.72), ly + Inches(0.02), Inches(2.2), Inches(0.28),
         [(label, 13, True, INK, BODY, 0)])
    if note:
        text(s, M + Inches(2.9), ly + Inches(0.04), Inches(2.2), Inches(0.28),
             [(note, 11.5, False, MUTED, BODY, 0)])
    ly += Inches(0.52)

x2 = M + Inches(5.7)
rect(s, x2, y, Inches(6.19), Inches(3.0), fill=WHITE, line=BORDER)
rect(s, x2, y, Inches(6.19), Pt(4), fill=CLAY_DEEP)
text(s, x2 + Inches(0.28), y + Inches(0.26), Inches(5.6), Inches(0.3),
     [("WHY WE'RE ASKING", 9.5, True, CLAY_DEEP, DISPLAY, 0)])
text(s, x2 + Inches(0.28), y + Inches(0.66), Inches(5.6), Inches(2.1),
     [("Plenty of places number the other way up. If yours does, a level 4 "
       "would get benchmarked against director pay.", 13, True, INK, BODY, 9),
      ("On our own data that's about £27,000 against about £91,000 for the "
       "same person.", 12, False, GREY, BODY, 9),
      ("Just tell us whether 1 is the top or the bottom. Or send the job titles "
       "at each level and we'll sort it from those.", 12, False, GREY, BODY, 0)],
     line_spacing=1.3)
footer(s)

# ═══════════════════════════════════════════════════ 4. The demo
s = slide()
y = head(s, "In the meantime", "Have a poke around the demo",
         "Same dashboard, different company. Everything works, so click anything.")

rect(s, M, y + Inches(0.10), CW, Inches(1.5), fill=INK)
rect(s, M, y + Inches(0.10), Pt(5), Inches(1.5), fill=CLAY)
text(s, M + Inches(0.4), y + Inches(0.40), Inches(11.5), Inches(0.24),
     [("THE LINK", 9.5, True, CLAY, DISPLAY, 0)])
text(s, M + Inches(0.4), y + Inches(0.74), Inches(11.8), Inches(0.5),
     [(DEMO_URL, 19, True, WHITE, DISPLAY, 0)])

cw = (CW - Inches(0.4)) / 2
by = y + Inches(1.90)
for i, (k, v) in enumerate([("Username", DEMO_USER), ("Password", DEMO_PASS)]):
    x = M + i * (cw + Inches(0.4))
    rect(s, x, by, cw, Inches(1.05), fill=WHITE, line=BORDER)
    text(s, x + Inches(0.28), by + Inches(0.22), cw - Inches(0.5), Inches(0.24),
         [(k.upper(), 9.5, True, MUTED, DISPLAY, 0)])
    text(s, x + Inches(0.28), by + Inches(0.52), cw - Inches(0.5), Inches(0.34),
         [(v, 18, True, INK, DISPLAY, 0)])

text(s, M, by + Inches(1.35), CW, Inches(0.5),
     [("The numbers belong to a made-up company, so nothing in there is real pay "
       "data. It'll look the same with your roles in it.", 12, False, GREY, BODY, 0)],
     line_spacing=1.3)
footer(s)

# ═══════════════════════════════════════════════════ 5. Over to you
s = slide()
y = head(s, "Over to you", "Three things and we're away",
         "Only the levels hold anything up.")
cw = (CW - Inches(0.5)) / 3
for i, (kick, title, lines, acc) in enumerate([
    ("One", "The levels",
     ["Whether 1 is the top or the bottom, or the job titles at each level."], CLAY),
    ("Two", "Do the dates work",
     ["The 14th for the first session, then two shorter calls after."], SLATE),
    ("Three", "Benefits or not",
     [f"We can benchmark what {CLIENT} offer and put it in alongside pay, "
      "no extra cost. Yes or no is enough for now."], INK),
]):
    card(s, M + i * (cw + Inches(0.25)), y, cw, Inches(2.6), kick, title, lines, accent=acc)

fy = y + Inches(2.92)
rect(s, M, fy, CW, Inches(0.9), fill=CLAY_TINT)
rect(s, M, fy, Pt(4), Inches(0.9), fill=CLAY_DEEP)
text(s, M + Inches(0.32), fy + Inches(0.29), Inches(11.6), Inches(0.32),
     [("Anything else, just give me a shout.", 12.5, False, rgb("6B4436"), BODY, 0)])
footer(s)

prs.save(OUT)
print(f"  {OUT.name}: {N + 1} slides, {OUT.stat().st_size // 1024} KB")

# A PDF alongside, because a deck sent to a client should not depend on them
# having PowerPoint, and it is the version that renders identically everywhere.
SOFFICE = "/Applications/LibreOffice.app/Contents/MacOS/soffice"
if Path(SOFFICE).exists():
    subprocess.run([SOFFICE, "--headless", "--convert-to", "pdf",
                    "--outdir", str(HERE), str(OUT)],
                   check=True, capture_output=True)
    pdf = OUT.with_suffix(".pdf")
    print(f"  {pdf.name}: {pdf.stat().st_size // 1024} KB")
else:
    print("  (LibreOffice not found, so no PDF; the .pptx is the deliverable)")
