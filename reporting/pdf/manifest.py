"""What documents exist, what goes in them, and what the covers say.

Content lives in reporting/content/*.md and NOTHING in this file duplicates it.
Same discipline as zigbert-research/data.py: one place for the words, one place
for the structure, a builder that holds neither.

PAGINATION. The fixed-page model means page breaks are authored, not computed.
Put `<!-- page -->` in the markdown wherever a new page should start. It is an
HTML comment, so it is invisible to any markdown renderer and harmless in the
raw text that reporting/loadDraftReport.ts serves at GET /api/report/draft.

FIGURES. Never hardcode a number that the app derives. client/src/lib/theme.ts
owns REPORT_PERIOD, LAST_UPDATED, PAY_META and BENEFITS_META, and
client/src/pages/Methodology.tsx interpolates every one of them rather than
typing it, so that a date cannot go stale on one surface only. The same rule
applies here: put the value in FIGURES below, sourced from theme.ts, and
reference it from the markdown as {token}.
"""

# Mirrors client/src/lib/theme.ts. If that file changes, change this and rerun.
# Kept as one small block rather than scattered through the prose for exactly
# the reason the Methodology page gives: two copies of a figure drift, and a
# client who sees two numbers for one thing stops trusting both.
FIGURES = {
    "report_period": "Q2 2026",          # theme.ts REPORT_PERIOD
    "last_updated": "16 Jun 2026",       # theme.ts LAST_UPDATED
    "benefits_updated": "May 2026",      # theme.ts BENEFITS_LAST_UPDATED
    "pay_employers": "47",               # theme.ts PAY_META.comparatorEmployers
    "pay_basis": "London and the South East",  # theme.ts PAY_META.comparatorBasis
    "benefit_employers": "287",          # theme.ts BENEFITS_META.employersInDataset
    "benefit_coverage": "76",            # theme.ts BENEFITS_META.coverage
    "roles": "25",                       # lib/roster.ts BASE_ROSTER.length
    "benefits": "14",                    # lib/orgData.ts ESTABLISHED_BENEFITS.length
    "categories": "6",                   # lib/orgData.ts BENEFIT_CATEGORIES.length
    "salary_records": "1.5 million",
    "turnaround": "48 hours",
    "support_email": "hello@twentysixconsulting.co.uk",

    # The board paper's worked example. These are NOT invented: they replicate
    # payReview.ts computeReview() + targetSalary() over data.ts marketData at
    # PrepPayReview's own default scope, which is "roles below the median,
    # targeting median". Recompute if BASE_ROSTER or marketData changes.
    #
    # Cross-checks that all pass: salary_bill matches the £1.37M "Total salary
    # bill" KPI, below_median matches "9 of 25 roles sit below market", and
    # uplift_uq matches the £59.9k the long trailer films. uplift_lq is £0
    # because no role sits below its lower quartile, which is also why
    # video/README.md warns against filming the LQ target.
    "salary_bill": "£1,365,100",
    "below_median": "9",
    "uplift_lq": "£0",
    "uplift_median": "£15,400",
    "uplift_median_pct": "1.1",
    "uplift_uq": "£59,900",
    "uplift_uq_pct": "4.4",
}

# NOT tokenised, deliberately: the overall market position. Pay shows +0.7% and
# Home shows +0.4% for the same claim, because insights.ts getVerdict() takes a
# ratio of means while Home takes a mean of ratios. Both are defensible, they
# disagree, and until the product picks one the board paper makes the structural
# point ("at about the median overall, with nine roles below it") rather than
# quoting a figure a client could contradict from their own screen.

# The one place the client's own name appears. reporting/draft/client.json holds
# the same thing for the app's draft-report path; this is the document side.
CLIENT = "Brighton Technologies"

DOCS = [
    {
        # A single designed side of A4. "bare" means render_py emits one page with
        # no cover, no running header and no page number: a one-pager that says
        # "Page 1 of 1" is telling the reader something they can see.
        "slug": "one-pager",
        "out": "Zigbert-One-Pager.pdf",
        "bare": True,
        "doc_label": "One pager",
        "eyebrow": "",
        "title": "Zigbert one-pager",
        "lede": "",
        "sources": ["one_pager.md"],
    },
    {
        "slug": "confidentiality",
        "out": "Zigbert-Your-Data.pdf",
        "doc_label": "Your data",
        "eyebrow": "Confidentiality",
        "title": "Your data, and how we look after it",
        "lede": "What we hold, where it is held, who sees it, and how long we keep it.",
        "sources": ["confidentiality.md"],
    },
    {
        "slug": "how-to-read-this",
        "out": "Zigbert-How-To-Read-This.pdf",
        "doc_label": "How to read this",
        "eyebrow": "A short guide",
        "title": "How to read your dashboard",
        "lede": "What the numbers mean, what the labels mean, and the two or three "
                "things that trip everyone up the first time.",
        "sources": ["pay_ranges_explainer.md"],
    },
    {
        # A two-page board paper, no cover: a cover on a two-page paper is a
        # third of the document spent on its own title. board_paper.md therefore
        # does NOT open with <!-- page -->, so render.py gives page one a running
        # header instead of the cover treatment.
        #
        # drop_guidance strips the markdown blockquotes, which carry the "replace
        # this with your own figure" instructions. The PDF is the worked example
        # and reads clean without them; docx/build_board_paper.py keeps them,
        # because that is the file the client types into. One source, two
        # audiences, no second copy of the prose to drift.
        "slug": "board-paper",
        "out": "Zigbert-Board-Paper-Example.pdf",
        "drop_guidance": True,
        "doc_label": "Board paper",
        "eyebrow": "Template",
        "title": "A pay review board paper",
        "lede": "",
        "sources": ["board_paper.md"],
    },
    {
        # Source ORDER is the page order, because render.py joins sources with a
        # page break. pack_contents.md is first and carries the leading
        # <!-- page --> that produces the cover; how_to_use.md used to own that
        # marker and no longer does. Do not give a second source a leading
        # marker: two in a row make an empty chunk, which renders as a silent
        # blank page.
        "slug": "welcome-pack",
        "out": "Zigbert-Welcome-Pack.pdf",
        "doc_label": "Getting started",
        "eyebrow": "Welcome",
        "title": "Getting started with Zigbert",
        "lede": "What is in this pack, how the process works, what to look at "
                "first, and what we need from you.",
        "sources": ["pack_contents.md", "how_this_works.md",
                    "how_to_use.md", "next_steps_template.md"],
    },
]
