#!/usr/bin/env python3
"""reporting/content/*.md + manifest.py  ->  reporting/pdf/build/*.html

Markdown in, print-ready fixed-page HTML out. Holds no content and no styling:
words live in reporting/content, styling lives in brand.css.

Run via build.sh, or directly: python3 render.py
"""
import json
import re
import shutil
import sys
from pathlib import Path

import markdown
from jinja2 import Template

sys.path.insert(0, str(Path(__file__).parent))
from manifest import CLIENT, DOCS, FIGURES  # noqa: E402

HERE = Path(__file__).parent
CONTENT = HERE.parent / "content"
BUILD = HERE / "build"
ASSETS = HERE / "assets"

PAGE_BREAK = re.compile(r"^\s*<!--\s*page\s*-->\s*$", re.M)
TOCONFIRM = re.compile(r"\[\[TO CONFIRM:([^\]]*)\]\]")
TOKEN = re.compile(r"\{([a-z_]+)\}")

DOC = Template("""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<title>{{ doc.title }} · Zigbert</title>
<link rel="stylesheet" href="../fonts.css">
<link rel="stylesheet" href="../brand.css">
</head>
<body>
{%- for page in pages %}
<section class="page{{ ' cover' if loop.first and page.cover else '' }}">
  {%- if loop.first and page.cover %}
  <img class="logo-lg" src="../assets/zigbert-logo.png" alt="Zigbert">
  <div class="spacer"></div>
  <p class="eyebrow">{{ doc.eyebrow }}</p>
  <h1>{{ doc.title }}</h1>
  <p class="lede">{{ doc.lede }}</p>
  <div class="meta">
    <span>{{ client }}</span><span>·</span>
    <span>{{ figures.report_period }}</span><span>·</span>
    <span>Prepared by TwentySix Consulting</span>
  </div>
  <div class="spacer"></div>
  <div class="pfoot">
    <span>Zigbert · Pay &amp; Benefits Intelligence</span>
    <span>Page <b class="pno"></b> of <b class="ptot"></b></span>
  </div>
  {%- else %}
  <header class="phead">
    <img src="../assets/zigbert-logo.png" alt="Zigbert">
    <span class="doc">{{ doc.doc_label }}</span>
  </header>
  <div class="pbody">
{{ page.html }}
  </div>
  <div class="pfoot">
    <span>{{ client }} · {{ figures.report_period }}</span>
    <span>Page <b class="pno"></b> of <b class="ptot"></b></span>
  </div>
  {%- endif %}
</section>
{%- endfor %}
<script>
  /* Page numbers, authored rather than delegated. Chrome's CLI has no
     --print-to-pdf-header-template, and CSS @page margin boxes are parsed and
     silently ignored by Chrome, so counter(page) does nothing. Filling them
     here costs four lines, keeps full brand control of the footer, and
     self-corrects when a page is added. --virtual-time-budget guarantees this
     runs before print. */
  const P = document.querySelectorAll('.page');
  P.forEach((p, i) => {
    p.querySelector('.pno').textContent = i + 1;
    p.querySelector('.ptot').textContent = P.length;
  });
</script>
</body>
</html>
""")


def fill(text: str) -> str:
    """Replace {token} from FIGURES, and fail loudly on an unknown one."""
    missing = {m for m in TOKEN.findall(text) if m not in FIGURES}
    if missing:
        raise SystemExit(
            f"Unknown token(s) {sorted(missing)}. Add them to manifest.FIGURES "
            f"with a comment naming the file in client/src that owns the value."
        )
    return TOKEN.sub(lambda m: FIGURES[m.group(1)], text)


def main(draft: bool = False) -> int:
    """draft=True renders unconfirmed placeholders instead of refusing to build."""
    if BUILD.exists():
        shutil.rmtree(BUILD)
    BUILD.mkdir(parents=True)

    counts: dict[str, int] = {}
    md = markdown.Markdown(extensions=["tables", "attr_list", "md_in_html", "sane_lists"])

    for doc in DOCS:
        raw = []
        for name in doc["sources"]:
            p = CONTENT / name
            if not p.exists():
                raise SystemExit(f"Missing content file: {p}")
            body = p.read_text(encoding="utf-8").strip()
            if not body:
                raise SystemExit(f"Empty content file: {p}")
            raw.append(body)
        text = fill("\n\n<!-- page -->\n\n".join(raw))

        # A [[TO CONFIRM: ...]] marker is a fact only the client-facing side of
        # the business can supply (hosting region, retention period, what
        # certifications we are willing to claim). These MUST NOT reach a
        # client, so an unresolved one fails the build. Pass --draft to render
        # them for internal review.
        todo = [t.strip() for t in TOCONFIRM.findall(text)]
        if todo and not draft:
            print(f"\n{doc['slug']}: {len(todo)} unconfirmed placeholder(s):",
                  file=sys.stderr)
            for t in todo:
                print(f"    {t}", file=sys.stderr)
            raise SystemExit(
                "Refusing to build. Fill these in the content file, or run "
                "with --draft to produce an internal review copy."
            )
        if todo:
            text = TOCONFIRM.sub(
                lambda m: f'<span class="todo">TO CONFIRM: {m.group(1).strip()}</span>',
                text)

        chunks = [c.strip() for c in PAGE_BREAK.split(text)]
        pages = []
        for i, chunk in enumerate(chunks):
            md.reset()
            pages.append({"html": md.convert(chunk), "cover": i == 0 and not chunk})
        # A leading empty chunk means the author opened with <!-- page -->, i.e.
        # asked for a cover. Otherwise page one is content and gets the header.
        if pages and not chunks[0]:
            pages[0]["cover"] = True
            pages[0]["html"] = ""

        out = BUILD / f"{doc['slug']}.html"
        out.write_text(
            DOC.render(doc=doc, pages=pages, client=CLIENT, figures=FIGURES),
            encoding="utf-8",
        )
        print(f"  {out.name}: {len(pages)} pages")
        counts[doc["slug"]] = len(pages)

    # Page counts go to disk so build.sh can assert the PDF matches the HTML.
    # This is what catches Chrome's occasional spurious trailing blank page,
    # which no other check would notice.
    (BUILD / "pagecounts.json").write_text(json.dumps(counts, indent=2))

    if not ASSETS.exists():
        raise SystemExit(f"Missing {ASSETS} — run build.sh, which copies the logo in.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(draft="--draft" in sys.argv))
