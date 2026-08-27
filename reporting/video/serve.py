#!/usr/bin/env python3
"""Serve dist/public the way the real deployment does.

`python3 -m http.server` is not good enough: it 404s /pay/market-comparison,
because that file does not exist. The two static SPAs get their fallback from
vite.config.ts's dev middleware and from vercel.json's rewrites, neither of which
a plain file server replicates. Filming a 404 would be a silent, wasted run.

Also NOT the Vite dev server: that ships an HMR client and an error overlay, and
serves unminified code. Film the artefact you deploy.

Run: python3 serve.py [port]
"""
import functools
import http.server
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2] / "dist" / "public"
# Branded full-frame pages for the beats that have no user interface (pricing,
# how to start, the close). They live in the repo rather than in dist/public,
# which is gitignored and wiped by every build, so they get their own mount.
SLATES = Path(__file__).parent / "slates"
HAS_EXT = re.compile(r"/[^/]+\.[A-Za-z0-9]+$")
SURFACES = ("pay", "benefits")


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        p = path.split("?", 1)[0].split("#", 1)[0].lstrip("/")

        if p.startswith("__slate/"):
            name = p[len("__slate/"):]
            cand = SLATES / (name if name.endswith((".html", ".css", ".js", ".png")) else name + ".html")
            return str(cand)

        full = ROOT / p
        if full.is_dir() and (full / "index.html").exists():
            return str(full / "index.html")
        if full.is_file():
            return str(full)
        # A real asset that is genuinely missing should 404, not silently serve
        # HTML. Only extensionless paths are routes.
        if HAS_EXT.search("/" + p):
            return str(full)
        for s in SURFACES:
            if p == s or p.startswith(s + "/"):
                return str(ROOT / s / "index.html")
        return str(ROOT / "index.html")

    def log_message(self, *args) -> None:  # quiet
        pass

    def handle_one_request(self):
        # The browser drops connections mid-response routinely; the resulting
        # BrokenPipeError traceback is noise, not a failure.
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8788
    if not ROOT.exists():
        print(f"{ROOT} not found. Run `npx vite build` first.", file=sys.stderr)
        return 1
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"serving {ROOT} on http://127.0.0.1:{port}")
    srv.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
