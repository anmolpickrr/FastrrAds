#!/usr/bin/env python3
"""
Builds the two genuinely separate pages from a single source of truth.

src/master.html is the full-featured (internal/team) page, with two
kinds of marker blocks:

    <!-- PUBLIC:STRIP:START -->
    ...internal-only markup, removed from the public build...
    <!-- PUBLIC:STRIP:END -->

    <!-- TEAM:STRIP:START -->
    ...public-only markup (e.g. cold-lead copy), removed from the team build...
    <!-- TEAM:STRIP:END -->

Use TEAM:STRIP for spots where the two builds need different copy for
the same UI element (e.g. a CTA's subtext) — wrap the public-facing
version in PUBLIC:STRIP and the team-facing version in TEAM:STRIP,
placed back to back; each build keeps only the version meant for it.

Running this script produces:
  - teamfastrr/index.html — master.html with TEAM:STRIP blocks removed,
    PUBLIC:STRIP content kept, i.e. the internal build.
  - index.html            — master.html with PUBLIC:STRIP blocks
    removed, TEAM:STRIP content kept, i.e. the public build. Public
    visitors never receive internal-only markup/script over the
    network — it isn't just CSS-hidden.

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

MARKERS = [
    # (start, end) — content between these is removed for the build that
    # should NOT see it; kept (markers stripped) for the other build.
    ("<!-- PUBLIC:STRIP:START -->", "<!-- PUBLIC:STRIP:END -->"),  # internal-only
    ("<!-- TEAM:STRIP:START -->", "<!-- TEAM:STRIP:END -->"),  # public-only
]


def strip_block(html, start, end):
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end) + r"\n?", re.DOTALL)
    return pattern.subn("", html)


def drop_markers(html, start, end):
    return html.replace(start + "\n", "").replace(start, "").replace(end + "\n", "").replace(end, "")


def build():
    master = MASTER.read_text(encoding="utf-8")

    for start, end in MARKERS:
        starts, ends = master.count(start), master.count(end)
        if starts != ends:
            sys.exit(f"ERROR: unbalanced markers for {start!r} — {starts} START vs {ends} END")

    # Team build: strip TEAM:STRIP blocks (public-only content); keep
    # PUBLIC:STRIP content, just drop its markers.
    team_html = master
    team_html, n_team_stripped = strip_block(team_html, *MARKERS[1])
    team_html = drop_markers(team_html, *MARKERS[0])

    # Public build: strip PUBLIC:STRIP blocks (internal-only content);
    # keep TEAM:STRIP content, just drop its markers.
    public_html = master
    public_html, n_public_stripped = strip_block(public_html, *MARKERS[0])
    public_html = drop_markers(public_html, *MARKERS[1])

    PUBLIC_OUT.write_text(public_html, encoding="utf-8")
    TEAM_OUT.parent.mkdir(parents=True, exist_ok=True)
    TEAM_OUT.write_text(team_html, encoding="utf-8")

    print(f"Built {PUBLIC_OUT.relative_to(ROOT)} ({len(public_html)} bytes, {n_public_stripped} internal-only blocks removed)")
    print(f"Built {TEAM_OUT.relative_to(ROOT)} ({len(team_html)} bytes, {n_team_stripped} public-only blocks removed)")


if __name__ == "__main__":
    build()
