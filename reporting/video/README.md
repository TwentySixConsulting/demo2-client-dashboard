# Walkthrough clips

Five silent, captioned MP4s, one per dashboard area. No voiceover: the captions
carry the narration, so a copy change is a rerun rather than a re-record.

```
python3 ../pdf/build_fonts.py     # once; both this and the PDF pack need it
cd ..                             # repo root
npx vite build                    # the clips film dist/public, not the dev server
cd reporting/video
python3 record.py --audit         # every selector resolves? ~1 min
python3 record.py                 # all five, ~4 min
python3 record.py 04-organisation # just one
```

Output lands in `out/` with a `manifest.json` of durations and sizes.

## Editing

`shots.py` is the only file with content in it. A shot is a dict: url,
localStorage seed, caption, actions. `record.py` holds the machinery and no words.

Run `--audit` after any selector change. It navigates to each shot and resolves
every selector without filming, which is a minute against four.

## Things that will bite

- **Film the build, never `npm run dev`.** The dev server ships an HMR client and
  an error overlay.
- **`storage: "keep"`** is load-bearing in clip 4. The salary edited on
  `/organisation` reaches `/pay/role-details` through shared same-origin
  localStorage, so clearing between those two shots destroys the point of the clip.
- **One shot deliberately omits the tour suppression** so the tour fires on
  camera. That is `01-home/tour-fires`, and it seeds `AUTH` rather than `QUIET`.
- **A caption must match what the camera is pointing at.** Two shots originally
  described a section one scroll away from the one on screen. Target headings by
  `text=` rather than by section id: an id belongs to a whole group, and the thing
  worth showing is usually a single panel inside it.
- **`page.mouse.click` takes viewport coordinates**, so a target below the fold
  gets clicked in empty space. `cursor_to` scrolls it into view first and `click`
  raises rather than clicking nothing.
- **Recharts animates in JavaScript**, so CSS `animation: none` does not stop it.
  `settle()` polls screenshots until two match.
- **`clientConfig.sampleData` is build-time**, and it is baked into the vendored
  Pay bundle and the Benefits HTML. Changing it means a rebuild, not a flag. The
  "Illustrative sample data" chip is left visible on purpose: Brighton
  Technologies is a demo org and the chip is honest.
