#!/usr/bin/env python3
"""
Regenerates the REELS and CATALOGUE arrays inside assets/creative-data.js
directly from the video files sitting in the category folders:

  assets/reels/Starter/*.mp4          -> REELS, band: "starter"
  assets/reels/Standard/*.mp4         -> REELS, band: "standard"
  assets/reels/Popular/*.mp4          -> REELS, band: "popular"
  assets/reels/Premium/*.mp4          -> REELS, band: "premium"
  assets/360-catalogue/Standard/*.mp4 -> CATALOGUE, band: "standard"
  assets/360-catalogue/Premium/*.mp4  -> CATALOGUE, band: "premium"

Workflow for adding/replacing videos: drop files into the right band
folder (any of .mp4/.mov/.webm), then run this script once, then run
the usual build_pages.py / build_preview.py. Nothing else needs
touching — REELS/CATALOGUE feed the package-scope showcase, the
homepage video strip, and the lightbox everywhere on both URLs from
this one array, so there's exactly one place to update.

A poster thumbnail is auto-extracted with ffmpeg into
assets/thumbs/auto/<slug>.jpg the first time a given filename is seen
(skipped on later runs if that thumbnail already exists, so hand-
picked frames aren't silently overwritten) and duration is read via
ffprobe. The display title is the filename, humanized (dashes/
underscores to spaces, title-cased) — rename the file before running
this script to change what shows anywhere a title is still used (the
lightbox heading only; video cards themselves show no title/filename,
see Section 4 of the layout spec).
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = ROOT / "assets" / "creative-data.js"
THUMB_DIR = ROOT / "assets" / "thumbs" / "auto"
VIDEO_EXTS = {".mp4", ".mov", ".webm"}

REEL_BANDS = ["Starter", "Standard", "Popular", "Premium"]
CATALOGUE_BANDS = ["Standard", "Premium"]


def humanize(stem):
    words = re.split(r"[-_]+", stem.strip())
    return " ".join(w if w.isupper() else w.capitalize() for w in words if w)


def ffprobe_duration(path):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
        return f"{round(float(out))}s"
    except Exception:
        return ""


def ensure_thumb(video_path, slug):
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    thumb_path = THUMB_DIR / f"{slug}.jpg"
    if thumb_path.exists():
        return f"assets/thumbs/auto/{slug}.jpg"
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-ss", "0.3", "-i", str(video_path),
             "-frames:v", "1", "-vf", "scale=640:-1", str(thumb_path)],
            capture_output=True, check=True,
        )
        return f"assets/thumbs/auto/{slug}.jpg"
    except Exception as e:
        print(f"  ! could not generate thumbnail for {video_path.name}: {e}", file=sys.stderr)
        return ""


def collect(base_dir, bands, type_label):
    items = []
    for band in bands:
        folder = base_dir / band
        if not folder.is_dir():
            continue
        for f in sorted(folder.iterdir()):
            if f.suffix.lower() not in VIDEO_EXTS:
                continue
            slug = f.stem
            rel_video = str(f.relative_to(ROOT)).replace("\\", "/")
            thumb = ensure_thumb(f, slug)
            item = {
                "cat": "video",
                "catlabel": type_label,
                "title": humanize(slug),
                "video": rel_video,
                "thumb": thumb,
                "dur": ffprobe_duration(f),
                "band": band.lower(),
            }
            items.append(item)
    return items


def replace_array(text, name, items):
    pattern = re.compile(rf"const {name} = \[.*?\];", re.DOTALL)
    replacement = f"const {name} = {json.dumps(items, ensure_ascii=False)};"
    if not pattern.search(text):
        raise SystemExit(f"Could not find `const {name} = [...]` in {DATA_FILE}")
    return pattern.sub(lambda _m: replacement, text, count=1)


def main():
    reels = collect(ROOT / "assets" / "reels", REEL_BANDS, "AI Reel")
    catalogue = collect(ROOT / "assets" / "360-catalogue", CATALOGUE_BANDS, "360° Catalogue Video")

    print(f"Found {len(reels)} AI Reel video(s), {len(catalogue)} 360° Catalogue video(s).")

    text = DATA_FILE.read_text()
    text = replace_array(text, "REELS", reels)
    text = replace_array(text, "CATALOGUE", catalogue)
    DATA_FILE.write_text(text)
    print(f"Updated {DATA_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
