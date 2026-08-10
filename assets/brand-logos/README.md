# Brand Logos

One file per brand — used in the "Trusted by" logo strip on the site.

## Uploading

- Any of PNG, JPG/JPEG, SVG, AVIF (or WebP/GIF) work fine.
- Name each file after the brand, e.g. `shesha-ayurveda.png`, `avimee-herbal.svg`.
- **Crop/trim each file to the logo itself before uploading** — as tight as
  you can get it, with no extra padding around the mark. The strip displays
  every logo at the same fixed height, so built-in whitespace in the source
  file directly throws off how big that logo looks next to the others; a
  tightly-cropped file is what actually gets consistent, aligned sizing.
- Transparent background (PNG/SVG/AVIF) looks cleanest since the strip
  applies its own monochrome treatment on top — a white/solid background
  baked into the file will show through as a box around the mark.

## Wiring a logo into the site

Uploading here doesn't do anything by itself — like the carousel folders,
there's no build step, so each logo still needs one entry added to the
`BRAND_LOGOS` array in `assets/creative-data.js`:

```js
{ "name": "Shesha Ayurveda", "src": "assets/brand-logos/shesha-ayurveda.png" }
```

`name` is used as the image's alt text only (for accessibility) — it isn't
displayed as a text label next to the logo. The strip is hidden entirely
until `BRAND_LOGOS` has at least one entry, so nothing shows until real
logos are wired in.
