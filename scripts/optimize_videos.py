#!/usr/bin/env python3
"""
Re-encodes every video in assets/reels/ and assets/360-catalogue/ to a
consistent, web-appropriate delivery profile:

  - H.264, CRF 28, preset veryfast
  - scaled to 720x1280 (still sharp at the sizes these play at — card
    thumbnails and a ~500px-wide lightbox — while cutting file size by
    roughly 60-75% versus the 1080x1920 originals)
  - +faststart (moov atom at the front, so playback can start before
    the whole file downloads)
  - AAC audio, 96kbps

Several of the uploaded source videos were encoded at ~5 Mbps for
1080x1920, 2-4x higher than this site needs — that oversized payload
was the main cause of slow previews/playback across the showcase,
filmstrip, and package-scope video tiles, since many tiles can be
loading/playing at once.

Run from the repo root:  python3 scripts/optimize_videos.py
Writes to a temp file per video and only replaces the original if the
re-encode succeeds and is actually smaller; originals are left alone
on any failure, so this is safe to re-run or interrupt.
"""
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIRS = [ROOT / "assets" / "reels", ROOT / "assets" / "360-catalogue"]


def optimize(path: Path) -> tuple[int, int, bool]:
    before = path.stat().st_size
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(path),
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
                "-vf", "scale=720:1280", "-movflags", "+faststart",
                "-c:a", "aac", "-b:a", "96k",
                str(tmp_path),
            ],
            capture_output=True, check=True,
        )
        after = tmp_path.stat().st_size
        if after > 0 and after < before:
            tmp_path.replace(path)
            return before, after, True
        tmp_path.unlink(missing_ok=True)
        return before, before, False
    except subprocess.CalledProcessError as e:
        tmp_path.unlink(missing_ok=True)
        print(f"  ! failed: {path.name}: {e.stderr.decode(errors='replace')[-300:]}", file=sys.stderr)
        return before, before, False


def main():
    files = []
    for d in DIRS:
        files.extend(sorted(d.rglob("*.mp4")))
    print(f"Optimizing {len(files)} video(s)...")
    total_before = total_after = 0
    changed = 0
    for i, f in enumerate(files, 1):
        before, after, did_change = optimize(f)
        total_before += before
        total_after += after
        if did_change:
            changed += 1
        print(f"[{i}/{len(files)}] {before/1024/1024:.1f}MB -> {after/1024/1024:.1f}MB  {f.relative_to(ROOT)}")
    print(f"\nDone. {changed}/{len(files)} optimized.")
    print(f"Total: {total_before/1024/1024:.0f}MB -> {total_after/1024/1024:.0f}MB "
          f"({(1 - total_after/total_before)*100:.0f}% smaller)")


if __name__ == "__main__":
    main()
