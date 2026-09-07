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
text(s, M + Inches(0.2), Inches(2.45), CW, Inches(0.3),
     [("PILOT ONBOARDING", 12, True, CLAY, DISPLAY, 0)])
text(s, M + Inches(0.2), Inches(2.90), Inches(10.4), Inches(1.5),
     [(f"{CLIENT} on Zigbert", 42, True, WHITE, DISPLAY, 0)])
text(s, M + Inches(0.2), Inches(4.25), Inches(9.6), Inches(1.0),
     [("Where we have got to, what happens next, and the three things we need "
       "from you.", 14.5, False, rgb("B9C1CC"), BODY, 0)], line_spacing=1.35)
text(s, M + Inches(0.2), Inches(6.30), Inches(8), Inches(0.3),
     [(f"TwentySix Consulting  ·  {WHEN}", 11, False, rgb("6E7A8A"), BODY, 0)])

# ═══════════════════════════════════════════════════ 2. Where we are
s = slide()
y = head(s, "Where we are", "You have given us everything we need",
         f"{REFERRER.capitalize()} sent over every {CLIENT} role with its full-time-equivalent "
         "salary and job level, which is the whole of what we need to build the dashboard. "
         "One thing to clarify on the levels, coming up in a moment.")
cw = (CW - Inches(0.5)) / 3
for i, (kick, title, lines, acc) in enumerate([
    ("Done", "Roles received",
     [f"Every {CLIENT} role, with FTE salary and job level.",
      "Nothing further needed to start."], GREEN),
    ("This week", "Benchmarking",
     ["Every role matched and benchmarked against the database.",
      "Then reviewed by hand, role by role."], CLAY),
    ("Next week", "Your dashboard",
     ["Built, reviewed and live.",
      "Pay for every role against its market range."], SLATE),
]):
    card(s, M + i * (cw + Inches(0.25)), y, cw, Inches(3.3),
         kick, title, lines, accent=acc)
footer(s)

# ═══════════════════════════════════════════════════ 3. The process
s = slide()
y = head(s, "What happens next", "What we do with your roles",
         "Three steps, all on our side. The output is a market range for every role you "
         "have sent us, and a clear read on where each one sits against it.")
cw = (CW - Inches(0.5)) / 3
for i, (kick, title, lines) in enumerate([
    ("Step one", "Match each role",
     ["On function, job level, industry and location.",
      "Job title on its own is not enough to go on."]),
    ("Step two", "Benchmark it",
     [f"Against over {FIGURES['salary_records']} UK salary records taken from live job adverts.",
      "The database is refreshed every month."]),
    ("Step three", "A specialist reviews it",
     ["One of our reward specialists checks the result by hand.",
      "Nothing reaches you that a person has not signed off."]),
]):
    card(s, M + i * (cw + Inches(0.25)), y, cw, Inches(2.6), kick, title, lines)

band = y + Inches(2.85)
rect(s, M, band, CW, Inches(1.28), fill=CLAY_TINT)
rect(s, M, band, Pt(4), Inches(1.28), fill=CLAY_DEEP)
text(s, M + Inches(0.32), band + Inches(0.20), Inches(11.6), Inches(0.3),
     [("What you end up with, for every single role", 14.5, True, INK, DISPLAY, 0)])
text(s, M + Inches(0.32), band + Inches(0.60), Inches(11.6), Inches(0.5),
     [("A lower quartile, a median and an upper quartile for the market, and where the "
       f"current {CLIENT} salary sits against them. All of it uploaded into the dashboard.",
       12, False, rgb("6B4436"), BODY, 0)], line_spacing=1.3)
footer(s)

# ═══════════════════════════════════════════════════ 4. The levels question
s = slide()
y = head(s, "One thing to pin down", "What do your levels 1 to 4 mean?",
         f"The {CLIENT} file has job levels 1, 2, 3 and 4 with no definitions attached. "
         "Job level is one of the four things we match on, and it moves the comparator group "
         "more than any of the others, so it is worth thirty seconds now.")

rect(s, M, y, Inches(6.05), Inches(3.45), fill=WHITE, line=BORDER)
rect(s, M, y, Inches(6.05), Pt(4), fill=SLATE)
text(s, M + Inches(0.28), y + Inches(0.26), Inches(5.5), Inches(0.3),
     [("HOW OUR NUMBERING RUNS", 9.5, True, SLATE, DISPLAY, 0)])
ly = y + Inches(0.66)
for lvl, label, example in [
    ("1", "Director", "most senior"),
    ("2", "Senior", ""),
    ("3", "Practitioner", ""),
    ("4", "Junior", "most junior"),
]:
    text(s, M + Inches(0.28), ly, Inches(0.4), Inches(0.28),
         [(lvl, 14, True, CLAY, DISPLAY, 0)])
    text(s, M + Inches(0.72), ly + Inches(0.02), Inches(2.2), Inches(0.28),
         [(label, 13, True, INK, BODY, 0)])
    if example:
        text(s, M + Inches(2.95), ly + Inches(0.04), Inches(2.8), Inches(0.28),
             [(example, 11.5, False, MUTED, BODY, 0)])
    ly += Inches(0.52)
text(s, M + Inches(0.28), ly + Inches(0.04), Inches(5.5), Inches(0.4),
     [("Ours counts down from the top. Many organisations count up from the bottom.",
       11, False, GREY, BODY, 0)], line_spacing=1.25)

x2 = M + Inches(6.45)
rect(s, x2, y, Inches(5.44), Inches(3.45), fill=WHITE, line=BORDER)
rect(s, x2, y, Inches(5.44), Pt(4), fill=CLAY_DEEP)
text(s, x2 + Inches(0.28), y + Inches(0.26), Inches(4.9), Inches(0.3),
     [("WHY IT MATTERS", 9.5, True, CLAY_DEEP, DISPLAY, 0)])
text(s, x2 + Inches(0.28), y + Inches(0.62), Inches(4.9), Inches(2.2),
     [("Read the wrong way round, a level 4 role would be compared against "
       "director pay and a level 1 against junior pay.", 12.5, True, INK, BODY, 8),
      ("On our own data that is the difference between a market median of about "
       "£27,000 and about £91,000 for the same person.", 12, False, GREY, BODY, 8),
      ("A one-line description of each level is plenty, or just tell us whether "
       "1 is the top or the bottom.", 12, False, GREY, BODY, 0)],
     line_spacing=1.3)
text(s, M, y + Inches(3.72), CW, Inches(0.4),
     [("If it is easier, send us the job titles that sit at each level and we will work it "
       "out from those.", 12, False, GREY, BODY, 0)], line_spacing=1.3)
footer(s)

# ═══════════════════════════════════════════════════ 5. How you want it
s = slide()
y = head(s, "Next week", "How would you like to go through it?",
         "The dashboard will be ready next week. Either way works for us, so it is "
         "whichever suits you better.")
cw = (CW - Inches(0.5)) / 2
card(s, M, y, cw, Inches(2.75), "Option A", "We send it over first",
     ["You get the link and have a look in your own time.",
      "Then we meet to go through whatever stood out, with your questions already formed."],
     accent=CLAY)
card(s, M + cw + Inches(0.5), y, cw, Inches(2.75), "Option B", "We walk through it together",
     ["We meet first and go through it live, so nothing needs decoding on your own.",
      "You explore it properly afterwards."],
     accent=SLATE)

nb = y + Inches(3.05)
rect(s, M, nb, CW, Inches(1.15), fill=WHITE, line=BORDER)
rect(s, M, nb, Pt(4), Inches(1.15), fill=INK)
text(s, M + Inches(0.32), nb + Inches(0.20), Inches(11.5), Inches(0.28),
     [("Want a look before then?", 13.5, True, INK, DISPLAY, 0)])
text(s, M + Inches(0.32), nb + Inches(0.55), Inches(11.5), Inches(0.34),
     [("We can open the demo dashboard now and click through it, or I can send you the "
       "link afterwards so you can get familiar before yours lands.",
       11.5, False, GREY, BODY, 0)], line_spacing=1.28)
footer(s)

# ═══════════════════════════════════════════════════ 6. Benefits
s = slide()
y = head(s, "Also available", "Benefits, if you want them included",
         f"We were asked to do pay. Benefits can go in alongside it at no extra cost, and "
         f"it is entirely up to {CLIENT} whether they bother.")
cw = (CW - Inches(0.5)) / 3
for i, (kick, title, lines, acc) in enumerate([
    ("No cost", "Included either way",
     ["Benefits benchmarking is part of the package, not an add-on we charge for."], CLAY),
    ("What we need", "A list of what they offer",
     ["Pension, leave, sick pay, and whatever else they provide.",
      "No particular format needed."], SLATE),
    ("Worth knowing", "A different method",
     ["Benefits come from survey and audit evidence rather than job adverts.",
      "So they run a cycle behind pay."], INK),
]):
    card(s, M + i * (cw + Inches(0.25)), y, cw, Inches(3.1), kick, title, lines, accent=acc)
text(s, M, y + Inches(3.38), CW, Inches(0.4),
     [("There is no deadline on this. Benefits can be added after the dashboard is live "
       "without rebuilding anything.", 12, False, GREY, BODY, 0)], line_spacing=1.3)
footer(s)

# ═══════════════════════════════════════════════════ 7. The asks
# Cards rather than the numbered list this started as. The list left the bottom
# third of the slide empty, and three cards match every other slide in the deck.
s = slide()
y = head(s, "To take away", "Three things from you",
         "Everything else is on our side. None of it is urgent enough to hold up the "
         "build except the first one.")
cw = (CW - Inches(0.5)) / 3
for i, (kick, title, lines, acc) in enumerate([
    ("One", "What levels 1 to 4 mean",
     ["A line each, or just whether 1 is the most senior or the most junior.",
      "This is the only one that holds up the build."], CLAY),
    ("Two", "Sent over, or walked through",
     ["Whether you would rather have the dashboard first and meet after, or meet and "
      "go through it together."], SLATE),
    ("Three", f"Whether {CLIENT} want benefits",
     ["A yes or no is enough for now.",
      "We can chase the detail once the pay side is live."], INK),
]):
    card(s, M + i * (cw + Inches(0.25)), y, cw, Inches(3.1), kick, title, lines, accent=acc)

fy = y + Inches(3.42)
rect(s, M, fy, CW, Inches(0.92), fill=CLAY_TINT)
rect(s, M, fy, Pt(4), Inches(0.92), fill=CLAY_DEEP)
text(s, M + Inches(0.32), fy + Inches(0.30), Inches(11.6), Inches(0.32),
     [("Anything else, just email ", 12.5, False, rgb("6B4436"), BODY, 0)])
text(s, M + Inches(2.42), fy + Inches(0.30), Inches(6), Inches(0.32),
     [(FIGURES["support_email"], 12.5, True, CLAY_DEEP, BODY, 0)])
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
