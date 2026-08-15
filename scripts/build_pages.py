#!/usr/bin/env python3
"""
Builds the two genuinely separate pages from a single source of truth.

src/master.html is the full-featured (internal/team) page, with
internal-only blocks wrapped in:

    <!-- PUBLIC:STRIP:START -->
    ...internal-only markup...
    <!-- PUBLIC:STRIP:END -->

Running this script produces:
  - teamfastrr/index.html — master.html unchanged (minus the marker
    comments themselves), i.e. the full internal build.
  - index.html            — master.html with every marked block
    removed entirely, i.e. the public build. Public visitors never
    receive this markup/script over the network — it isn't just
    CSS-hidden.

Always edit src/master.html, then run this script. Never hand-edit
index.html or teamfastrr/index.html directly — a future build will
overwrite those edits.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "src" / "master.html"
PUBLIC_OUT = ROOT / "index.html"
TEAM_OUT = ROOT / "teamfastrr" / "index.html"

START = "<!-- PUBLIC:STRIP:START -->"
END = "<!-- PUBLIC:STRIP:END -->"


def build():
    master = MASTER.read_text(encoding="utf-8")

    starts = master.count(START)
    ends = master.count(END)
    if starts != ends:
        sys.exit(f"ERROR: unbalanced strip markers — {starts} START vs {ends} END")

    # Team build: identical content, marker comments just removed (they're
    # noise once there's nothing to strip).
    team_html = master.replace(START + "\n", "").replace(START, "")
    team_html = team_html.replace(END + "\n", "").replace(END, "")

    # Public build: each marked block, including the markers themselves
    # and one trailing newline, removed entirely.
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.DOTALL)
    public_html, n = pattern.subn("", master)
    if n != starts:
        sys.exit(f"ERROR: expected to strip {starts} blocks, stripped {n}")

    PUBLIC_OUT.write_text(public_html, encoding="utf-8")
    TEAM_OUT.parent.mkdir(parents=True, exist_ok=True)
    TEAM_OUT.write_text(team_html, encoding="utf-8")

    print(f"Built {PUBLIC_OUT.relative_to(ROOT)} ({len(public_html)} bytes, {n} internal-only blocks removed)")
    print(f"Built {TEAM_OUT.relative_to(ROOT)} ({len(team_html)} bytes, full build)")


if __name__ == "__main__":
    build()
