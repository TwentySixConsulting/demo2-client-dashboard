# Video

Three films, one pipeline.

| Film | Source | Output | Length | For |
|---|---|---|---|---|
| **Showcase** | `showcase.py` | `out/Zigbert-Showcase.mp4` | ~67s | A website hero or LinkedIn. What the thing *is*. |
| **Trailer** | `trailer.py` | `out/Zigbert-Trailer.mp4` | ~2m57s | Someone who has asked how it works. |
| **Onboarding clips** — five, one per area | `shots.py` | `out/Zigbert-0N-*.mp4` | ~60-81s each | New clients at handover. |

The film is chosen by `--film <name>`, which imports `<name>.py` from this directory
and reads its `CLIPS`. `--trailer` is kept as an alias, and no flag means `shots`.

```
python3 ../pdf/build_fonts.py             # once; the PDFs need it too
cd ../.. && npx vite build                # films dist/public, never the dev server
cd reporting/video
python3 record.py --film showcase --pace  # reading speed of every caption
python3 record.py --film showcase --audit # every selector resolves, ~1 min
python3 record.py --film showcase         # ~3 min
python3 record.py --film trailer          # ~5 min
python3 record.py                         # the five onboarding clips
python3 record.py 04-organisation         # just one
```

## Showcase vs trailer

They are different films for different jobs, not two lengths of one film. The trailer
answers *how does it work, what does it cost, how do I start*, which makes it an
explainer; watched back, it reads as an onboarding tutorial. The showcase shows what
the product is and stops: Pay, Benefits, your own organisation, built round the two
interactions that landed best, searching and adding a role.

**Short does not mean fast.** The 130 wpm formula and the 13-word cap below are
identical in both. Length comes out of the **word count**: the showcase runs 5
captions of 5 to 7 words against the trailer's 9 of 9 to 11, so read beats cost 18s
instead of 48s and over half its runtime is the product moving. Its first cut came in
at 77s and got to 67 by cutting discretionary holds and deleting the one caption the
footage already said ("Search any role." over a box whose placeholder reads *Search a
role, e.g. Software Engineer*). Trimming a hold is safe; raising the reading rate is
the thing that produced the complaint in the first place.

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

Both films alternate **slates** (`slates/*.html`, full-frame branded pages where
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
- **The Home "Getting started" checklist fails silently.** Its mount is a bare
  `<div data-zigbert-tour-checklist>` that `tour.js` fills in, and
  `[data-zigbert-tour-checklist]:empty { display: none }` collapses it without a
  gap. So a wrong seed loses the beat with no error and no visible hole. It needs
  `zigbert:tour-checklist-off` **absent** and fewer than five truthy keys in
  `zigbert:tour-done` — the showcase's usual `QUIET` seed satisfies neither, which
  is why that one shot has its own `PARTIAL`. Give it ~1200ms of `pre_delay_ms`
  too; it renders after load.
- **Radix scroll-locks the body while a drawer is open** (`data-scroll-locked`), so
  `scroll` and `scroll_top` silently do nothing in a shot that has one open.
- **`clientConfig.sampleData` is build-time** and baked into the vendored Pay bundle
  and the Benefits HTML. The "Illustrative sample data" chip is left visible on
  purpose: Brighton Technologies is a demo org and the chip is honest.

## Claims on screen

Both films state pricing (**from £250 a month**; the trailer also names the charity
discount) which exists in **no repo**: zigbert.co.uk's FAQ currently says the price
is not public, the June deck marks pricing "Beta / Draft / For Discussion", and
`theme.ts` deliberately shows no amounts. That was a client decision. The site FAQ
and the Zigbot answer need updating in the same week either video ships.

Both close cards say **Live 24 September 2026**, matching the one-pager.
`zigbert-launch-plan` says Saturday the 26th. Still unresolved.

The showcase's support slate claims **"A short video for every area too."** Nothing
in the product or the marketing site says this; it is backed only by the five
onboarding clips in this directory, so those have to ship with it. What *is* already
true and already on screen is the tour system: the first-run card says verbatim
"Each area has its own short tour when you get there", and the Home checklist names
all five areas with their durations, which is why the caption over that frame says
**tutorial** rather than video.

Deliberately careful elsewhere: **"over 1.5 million records"** is framed as our
curation input, never as a database the client browses; **monthly refresh** is stated
of the database only, because a client's dashboard is republished quarterly; data
handling is limited to **"private and secure"**, matching the site verbatim, because
no GDPR claim exists anywhere and the confidentiality note still has open
`[[TO CONFIRM]]` facts.
