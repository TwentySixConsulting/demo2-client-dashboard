#!/usr/bin/env python3
"""reporting/content/board_paper.md  ->  Zigbert-Board-Paper-Template.docx

The one document in the pack the client is meant to TYPE INTO, so it cannot be a
PDF. Same markdown as the branded example PDF built by ../pdf/, and the same
figures imported from ../pdf/manifest.py, so a number cannot drift between the
two. The only difference between the outputs is the guidance:

    this file          KEEPS the blockquote notes, styled as instructions
    the example PDF    DROPS them (manifest's drop_guidance flag)

WHY NOT A FULL MARKDOWN PARSER. The source is one file whose shape we control,
and it uses six constructs: h2, paragraph, bold spans, blockquote, one pipe
table, and nothing else. Pulling in a converter to handle the other thirty would
be more code to keep working, not less. If board_paper.md grows a construct this
does not know, the parser below raises rather than silently dropping it.

Fonts are named, not embedded: Word substitutes if a machine lacks Poppins, and
a client's Word installing our fonts is not something to arrange in a template.
Inter and Poppins degrade to Calibri acceptably.

Run: python3 build_board_paper.py
"""
import re
import sys
from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Pt, RGBColor, Cm

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE.parent / "pdf"))
from manifest import CLIENT, FIGURES  # noqa: E402

SOURCE = HERE.parent / "content" / "board_paper.md"
OUT = HERE / "out" / "Zigbert-Board-Paper-Template.docx"

# Mirrors brand.css's variables. Kept as literals because python-docx wants
# RGBColor and there is no stylesheet to read.
INK = RGBColor(0x12, 0x1C, 0x2B)
MUTED = RGBColor(0x4B, 0x55, 0x63)
SUBTLE = RGBColor(0x8A, 0x93, 0xA2)
CLAY_DEEP = RGBColor(0xB0, 0x60, 0x3F)

BODY_FONT = "Inter"
HEAD_FONT = "Poppins"

TOKEN = re.compile(r"\{([a-z_]+)\}")
BOLD = re.compile(r"\*\*(.+?)\*\*")


def fill(text: str) -> str:
    """Same contract as pdf/render.py's fill(): unknown token is a hard error."""
    missing = {m for m in TOKEN.findall(text) if m not in FIGURES}
    if missing:
        raise SystemExit(
            f"Unknown token(s) {sorted(missing)}. Add them to pdf/manifest.py's "
            f"FIGURES with a comment naming what owns the value."
        )
    return TOKEN.sub(lambda m: FIGURES[m.group(1)], text)


def runs(par, text: str, *, size: float, colour, italic=False, font=BODY_FONT):
    """Write text into a paragraph, honouring **bold** spans."""
    for i, part in enumerate(BOLD.split(text)):
        if not part:
            continue
        r = par.add_run(part)
        r.font.name = font
        r.font.size = Pt(size)
        r.font.color.rgb = colour
        r.italic = italic
        # BOLD.split puts the captured group at every odd index.
        r.bold = i % 2 == 1


def blocks(md: str):
    """Markdown -> a list of (kind, payload). Raises on anything unexpected.

    Blank-line separated, which is all board_paper.md needs: no nested lists, no
    code fences, no images. A construct this does not recognise is a mistake
    worth stopping for, not one to guess at.
    """
    out = []
    for chunk in re.split(r"\n\s*\n", md.strip()):
        chunk = chunk.strip()
        if not chunk or re.fullmatch(r"<!--\s*page\s*-->", chunk):
            continue
        if chunk.startswith("## "):
            out.append(("h2", chunk[3:].strip()))
        elif all(ln.lstrip().startswith(">") for ln in chunk.splitlines()):
            body = " ".join(ln.lstrip().lstrip(">").strip()
                            for ln in chunk.splitlines())
            out.append(("guide", body.strip()))
        elif chunk.lstrip().startswith("|"):
            rows = [[c.strip() for c in ln.strip().strip("|").split("|")]
                    for ln in chunk.splitlines() if ln.strip().startswith("|")]
            # Drop markdown's |---|---| alignment row.
            rows = [r for r in rows
                    if not all(re.fullmatch(r":?-{2,}:?", c) for c in r)]
            out.append(("table", rows))
        elif chunk.startswith("#"):
            raise SystemExit(
                f"Unhandled heading level in {SOURCE.name}: {chunk[:60]!r}. "
                f"This builder only knows h2 (##)."
            )
        elif chunk.lstrip()[:2] in ("- ", "* ") or chunk.lstrip().startswith("<"):
            raise SystemExit(
                f"Unhandled construct in {SOURCE.name} ({chunk[:60]!r}). Add a "
                f"branch to blocks() rather than letting it render as a paragraph."
            )
        else:
            out.append(("p", " ".join(chunk.split())))
    return out


def build() -> int:
    md = fill(SOURCE.read_text(encoding="utf-8"))
    parsed = blocks(md)
    if not any(k == "guide" for k, _ in parsed):
        raise SystemExit(
            f"{SOURCE.name} has no blockquote guidance. The whole point of this "
            f"output over the example PDF is that it keeps the notes, so either "
            f"the source changed or the PDF's drop_guidance flag is now wrong."
        )

    doc = Document()
    s = doc.sections[0]
    s.top_margin = s.bottom_margin = Cm(2.2)
    s.left_margin = s.right_margin = Cm(2.4)

    normal = doc.styles["Normal"]
    normal.font.name = BODY_FONT
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = MUTED
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.25

    # A title, because a Word file that opens on "Pay review Q2 2026: decision
    # requested" gives no clue it is a template that wants editing.
    t = doc.add_paragraph()
    runs(t, "Pay review board paper", size=19, colour=INK, font=HEAD_FONT)
    t.runs[0].bold = True
    t.paragraph_format.space_after = Pt(2)

    sub = doc.add_paragraph()
    runs(sub, f"A template. Illustrative figures throughout, from the {CLIENT} "
              f"sample dashboard.", size=9, colour=SUBTLE, italic=True)
    sub.paragraph_format.space_after = Pt(16)

    for kind, payload in parsed:
        if kind == "h2":
            p = doc.add_paragraph()
            runs(p, payload, size=13, colour=INK, font=HEAD_FONT)
            for r in p.runs:
                r.bold = True
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True

        elif kind == "p":
            runs(doc.add_paragraph(), payload, size=10.5, colour=MUTED)

        elif kind == "guide":
            # Indented and italic so the client can see at a glance what is
            # instruction and what is theirs to keep. Word has no left-rule
            # equivalent worth the XML, so indent does that work.
            p = doc.add_paragraph()
            runs(p, payload, size=9, colour=CLAY_DEEP, italic=True)
            pf = p.paragraph_format
            pf.left_indent = Cm(0.6)
            pf.space_before = Pt(2)
            pf.space_after = Pt(10)

        elif kind == "table":
            head, *body = payload
            tbl = doc.add_table(rows=1, cols=len(head))
            tbl.style = "Table Grid"
            tbl.alignment = WD_TABLE_ALIGNMENT.LEFT
            for cell, text in zip(tbl.rows[0].cells, head):
                cell.paragraphs[0].clear()
                runs(cell.paragraphs[0], text, size=8.5, colour=INK,
                     font=HEAD_FONT)
                for r in cell.paragraphs[0].runs:
                    r.bold = True
            for row in body:
                cells = tbl.add_row().cells
                for cell, text in zip(cells, row):
                    cell.paragraphs[0].clear()
                    runs(cell.paragraphs[0], text, size=9.5, colour=MUTED)
            doc.add_paragraph().paragraph_format.space_after = Pt(2)

    foot = doc.add_paragraph()
    runs(foot, f"Market data from Zigbert, {FIGURES['report_period']}, published "
               f"{FIGURES['last_updated']}. Questions to "
               f"{FIGURES['support_email']}.", size=8.5, colour=SUBTLE)
    foot.paragraph_format.space_before = Pt(18)
    foot.alignment = WD_ALIGN_PARAGRAPH.LEFT

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    kinds = {}
    for k, _ in parsed:
        kinds[k] = kinds.get(k, 0) + 1
    print(f"  {OUT.name}: {OUT.stat().st_size // 1024} KB, "
          + ", ".join(f"{v} {k}" for k, v in sorted(kinds.items())))
    return 0


if __name__ == "__main__":
    raise SystemExit(build())
