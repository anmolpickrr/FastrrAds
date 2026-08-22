#!/usr/bin/env python3
"""
Builds the staging/preview pages from src/master-v2.html — a separate
redesign source, fully independent of src/master.html (the live
source). This exists so the redesign can be built and tested end to
end without ever touching the files the live site is built from.

Reuses the exact same PUBLIC:STRIP/TEAM:STRIP marker logic as
build_pages.py (imported from it, not duplicated) so the two build
scripts can never silently drift apart.

Running this script produces:
  - preview/index.html            — the public preview build.
  - preview/teamfastrr/index.html — the team/internal preview build.

Both preview pages keep the same <base href="/"> as the live pages,
so every asset reference (assets/app.js, assets/videos/..., etc.)
still resolves to the one shared /assets/ directory at the domain
root — nothing under assets/ needs to be duplicated for the preview
to work, and both preview builds share the exact same backend
(Firebase/Firestore config, order data, admin panel) as the live
site, since app.js/team.js themselves are untouched and shared.

Always edit src/master-v2.html, then run this script. Never hand-edit
preview/index.html or preview/teamfastrr/index.html directly.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_pages import MARKERS, strip_block, drop_markers  # noqa: E402

MASTER = ROOT / "src" / "master-v2.html"
PUBLIC_OUT = ROOT / "preview" / "index.html"
TEAM_OUT = ROOT / "preview" / "teamfastrr" / "index.html"


def build():
    if not MASTER.exists():
        sys.exit(f"ERROR: {MASTER.relative_to(ROOT)} does not exist yet — copy src/master.html to it first.")
    master = MASTER.read_text(encoding="utf-8")

    for start, end in MARKERS:
        starts, ends = master.count(start), master.count(end)
        if starts != ends:
            sys.exit(f"ERROR: unbalanced markers for {start!r} — {starts} START vs {ends} END")

    team_html = master
    team_html, n_team_stripped = strip_block(team_html, *MARKERS[1])
    team_html = drop_markers(team_html, *MARKERS[0])

    public_html = master
    public_html, n_public_stripped = strip_block(public_html, *MARKERS[0])
    public_html = drop_markers(public_html, *MARKERS[1])

    PUBLIC_OUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUT.write_text(public_html, encoding="utf-8")
    TEAM_OUT.parent.mkdir(parents=True, exist_ok=True)
    TEAM_OUT.write_text(team_html, encoding="utf-8")

    print(f"Built {PUBLIC_OUT.relative_to(ROOT)} ({len(public_html)} bytes, {n_public_stripped} internal-only blocks removed)")
    print(f"Built {TEAM_OUT.relative_to(ROOT)} ({len(team_html)} bytes, {n_team_stripped} public-only blocks removed)")


if __name__ == "__main__":
    build()
