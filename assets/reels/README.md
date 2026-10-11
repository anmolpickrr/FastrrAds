# AI Reel videos

Drop finished reel videos (`.mp4`, `.mov`, or `.webm`) into the folder
matching their style tier — nothing else needs editing:

- `Starter/`
- `Standard/`
- `Popular/`
- `Premium/`

To replace an existing video, delete the old file from its folder and
add the new one (same folder or a different one, if its tier changed).

## After adding/removing/moving files

Run, from the repo root:

```
python3 scripts/generate_creative_manifest.py
```

This rewrites `assets/creative-data.js` (the `REELS` array) from
whatever is currently in these folders — poster thumbnails are
auto-generated the first time a filename is seen, and the display
title is the filename itself, humanized (so name the file what you
want the video's internal label to read as — it's never shown on the
card itself, only used internally).

Then run the usual build step for whichever branch you're updating
(`python3 scripts/build_pages.py` for the live site, or
`python3 scripts/build_preview.py` for the preview). The new videos
then appear automatically everywhere `REELS` is used — the Services
showcase, the homepage video strip, and the package-scope Reels
modal — with nothing to update by hand in any of those places.
