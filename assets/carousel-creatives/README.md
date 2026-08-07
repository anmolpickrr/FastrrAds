# Carousel Creatives

One subfolder per delivered carousel. Each carousel is 4–5 slides, and the
complete set belongs together in a single folder — that folder becomes
**one** "Carousel Creative" card in the site's Showcase panel, not several
separate image cards.

## Structure

```
assets/carousel-creatives/
  <carousel-name>/
    slide-1.jpg
    slide-2.jpg
    slide-3.jpg
    slide-4.jpg
    slide-5.jpg   (if the set has 5)
```

- One folder per carousel, named for the brand/campaign (e.g. `mindesa-bags-launch`).
- Slides named sequentially (`slide-1`, `slide-2`, …) in the order they should
  play in the carousel.
- `.jpg` or `.png`, whichever the source file is — no conversion needed.

## Wiring a new carousel into the site

Uploading files here doesn't do anything by itself — the site has no build
step or server-side folder listing, so each carousel folder still needs one
corresponding entry added to the `CAROUSELS` array in
`assets/creative-data.js`, the same way real AI Reels/360° Catalogue videos
are wired up by file path rather than embedded as data:

```js
{
  "cat": "fashion",                       // matches the existing category keys used elsewhere (fashion, beauty, etc.)
  "catlabel": "Fashion & Apparel",        // display label shown on the card
  "title": "Mindesa Bags — Launch Carousel",
  "hook": "Short one-line description of the angle/hook",
  "type": "carousel",
  "slides": [
    "assets/carousel-creatives/mindesa-bags-launch/slide-1.jpg",
    "assets/carousel-creatives/mindesa-bags-launch/slide-2.jpg",
    "assets/carousel-creatives/mindesa-bags-launch/slide-3.jpg",
    "assets/carousel-creatives/mindesa-bags-launch/slide-4.jpg"
  ]
}
```

The first slide (`slides[0]`) is used automatically as the card's thumbnail
in the showcase grid — no separate thumb image needed. Once real carousels
are added this way, replace/remove the placeholder demo entry already in
`CAROUSELS`.
