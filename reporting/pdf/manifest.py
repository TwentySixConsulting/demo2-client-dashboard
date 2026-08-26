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
}

# The one place the client's own name appears. reporting/draft/client.json holds
# the same thing for the app's draft-report path; this is the document side.
CLIENT = "Brighton Technologies"

DOCS = [
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
        "slug": "welcome-pack",
        "out": "Zigbert-Welcome-Pack.pdf",
        "doc_label": "Getting started",
        "eyebrow": "Welcome",
        "title": "Getting started with Zigbert",
        "lede": "What you have, what to look at first, what we need from you, "
                "and what happens next.",
        "sources": ["how_to_use.md", "next_steps_template.md"],
    },
]
