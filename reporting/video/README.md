# Video

Two films, one pipeline.

| Film | Source | Output | Length |
|---|---|---|---|
| **Trailer** — one film for prospects | `trailer.py` | `out/Zigbert-Trailer.mp4` | ~2m57s |
| **Onboarding clips** — five, one per area | `shots.py` | `out/Zigbert-0N-*.mp4` | ~20-26s each |

```
python3 ../pdf/build_fonts.py          # once; the PDFs need it too
cd ../.. && npx vite build             # films dist/public, never the dev server
cd reporting/video
python3 record.py --trailer --pace     # reading speed of every caption
python3 record.py --trailer --audit    # every selector resolves, ~1 min
python3 record.py --trailer            # the trailer, ~5 min
python3 record.py                      # the five onboarding clips
python3 record.py 04-organisation      # just one
```

## Pacing is enforced, not advised

Comfortable subtitle speed is about 140 wpm. The first cut of the onboarding clips
ran **19 of 20 captions over 170, several at 280 to 400**, and it read as rushed.
So:

- **Hold time is derived** from each caption by `read_ms()` at 130 wpm. Do not add
  a hand-typed hold beside a caption; the read beat already holds the frame
  completely still for its full reading time.
- **`record.py` refuses to run** if any caption exceeds 13 words. That assertion is
  the point: it makes the 28-word caption impossible rather than discouraged.
- `--pace` prints words, derived hold and effective wpm for every caption and fails
  over 140. Run it before recording.

Long thoughts go in a `captions: [...]` list, not one long string. Each entry gets
its own read beat, and actions attach to a caption by index with `"after": n`.

## Two registers

The trailer alternates **slates** (`slates/*.html`, full-frame branded pages where
the words are the page's own typography) with **product footage** (words in the dark
caption bar). The viewer always knows whether they are being told something or shown
something, and it gives pricing, the data method and the close a place to live, none
of which has a screen to film.

Slates are served at `/__slate/<name>` by `serve.py` and filmed like any other page.
`slates/slate.js` exposes `window.__slate(i, t)` so the recorder steps each reveal
frame by frame; nothing animates on its own, so a frame is never caught mid-fade.

Slate type is sized for **video, not for a web page**: a trailer is routinely watched
in a 700px embed, so 21px body text becomes ~10px on screen. Everything is about
1.15x its web equivalent for that reason.

## The pointer

Headless Chrome renders no OS cursor, so it is drawn: a macOS-shaped arrow, with a
pointing hand over clickables and a text I-beam over inputs, chosen by reading the
target's computed `cursor` property so it cannot disagree with the app. A clay ring
ripples from the point of contact on click. The hotspot is the arrow's tip, so it
indicates the target rather than covering it.

## Things that will bite

- **Film the build, never `npm run dev`** (HMR client, error overlay, unminified).
- **`page.mouse.click` takes VIEWPORT coordinates**, so a target below the fold gets
  clicked in empty space while `bounding_box()` happily returns y beyond the
  viewport. `cursor_to` scrolls it into view first; `click` raises rather than
  clicking nothing.
- **A caption must match what the camera is pointing at.** The pay-review summary
  tiles sit below the fold on an 810px viewport, so the first cut promised "every
  figure moves" over a frame with no figures in it, and the payoff arrived eight
  seconds later under the export caption. Scroll to the thing you are talking about.
- **Target headings by `text=`, not by section id.** An id belongs to a whole group;
  the panel worth showing is usually inside it. And `scroll_to` resolves through a
  Playwright locator, so CSS-only selectors are not a constraint.
- **Two entrance animations are worth catching** and both need `"settle": False`:
  Home's 720ms `ts-anim-fade-up`, and `/pay/role-details`' staggered card wave.
  `settle()` waits for the viewport to stop changing, which is exactly what an
  entrance animation is, so the default silently discards them.
- **Recharts animates in JavaScript**, so CSS `animation: none` does not stop it.
- **Do not film** `Lower Quartile` on the pay review (all nine roles already sit
  above it, so it shows £0 and the cost chart unmounts), `Download report` (native
  print dialog hangs the recorder), or the PNG/CSV exports (no viewport feedback).
- **`Add a role` only renders in role mode**, so that shot must not inherit a
  `zigbert:pay-view-mode` of `person` from an earlier one.
- **`clientConfig.sampleData` is build-time** and baked into the vendored Pay bundle
  and the Benefits HTML. The "Illustrative sample data" chip is left visible on
  purpose: Brighton Technologies is a demo org and the chip is honest.

## Claims on screen

The trailer states pricing (**from £250 per month**, charity discount) which exists
in **no repo**: zigbert.co.uk's FAQ currently says the price is not public, the June
deck marks pricing "Beta / Draft / For Discussion", and `theme.ts` deliberately shows
no amounts. That was a client decision. The site FAQ and the Zigbot answer need
updating in the same week the video ships.

Deliberately careful elsewhere: **"over 1.5 million records"** is framed as our
curation input, never as a database the client browses; **monthly refresh** is stated
of the database only, because a client's dashboard is republished quarterly; data
handling is limited to **"private and secure"**, matching the site verbatim, because
no GDPR claim exists anywhere and the confidentiality note still has open
`[[TO CONFIRM]]` facts.
