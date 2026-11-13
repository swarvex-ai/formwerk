# Formwerk style guide

The catalogue should look like one set, whoever builds an asset.

- **Look:** clean, slightly stylised realism. Clear silhouettes, bevel-free boxes and low segment counts are fine;
  detail comes from proportions and materials, not from triangles.
- **Proportions:** real-world defaults (a chair seat at 0.46 m, a door at 2.0 m, a step rise of 0.17 m). Ranges cover
  what exists in reality, not more.
- **Colour:** muted, natural defaults; strong colours only as a parameter. Materials from `src/materials`.
- **Segments:** cylinders 8–16 around for furniture, 32 for turned or architectural parts; icosahedron detail 0–1 for
  foliage clusters.
- **Variation:** use the seed for natural things (trees, rocks, plants). Man-made things are exact and need no seed.
- **Names:** ids in kebab-case English (`server-rack`), parameters in camelCase English (`seatHeight`).
- **Budgets:** furniture up to 20,000 triangles, architecture 30,000, nature 150,000 at the extremes; most assets
  should stay far below at their defaults.
- **Descriptions (`describe`):** one sentence, what the parameter changes and which real values are typical; no
  marketing, no repetition of the label. Agents read them in llms.txt to choose values.
- **Presets:** two to four looks that differ clearly (a bar stool, a milking stool, a kitchen chair), named in
  kebab-case English after what they are, not after their values (`bar-stool`, not `tall-metal`).
- **Movable parts:** hinge where the real hinge is; 0 is closed, positive opens; doors and gates open to the front
  (+z), lids upwards. Rotations up to the real stop (a lid 110°, a door 120°).

## Surfaces

- **Tile:** one tile is a real size (`tile`, usually 1 m) and repeats without a seam: every pattern comes from the
  tiling building blocks with a whole number of cells per tile. The scene test bakes each map half a tile further on
  and compares; a single pixel that does not repeat fails it.
- **Relief:** `depth` is the real height between black and white in the height map (4 cm for cobbles, 1.2 cm for
  planks, 6 mm for riveted steel); the normal map follows from it, so do not exaggerate it for effect.
- **Colour:** linear values from `color("#hex")` (the bake stores sRGB). Natural materials stay muted; variation per
  stone or plank comes from the cell's random number, wear and dirt from fractal noise.
- **Detail follows the size:** pass the sampler's `resolution` to the noise of fine detail (pores, fibres), so a 4096
  bake gets finer detail than a 512 one; use a fixed resolution for large shapes (masks, warps), so they look the same
  at every size.
- **Cost:** a live surface runs per pixel and frame. Keep it to one Voronoi and a few fractal noises; the gallery and
  games with many surfaces show the baked maps.

## Sprites

- **Pixel art:** hard edges (no half-transparent pixels), whole pixels only, a one-pixel outline from the contract
  (a deep shade of the colour it touches). Shading with `ramp()`: light from the top left, three to four shades per
  material; shadows cooler, highlights warmer.
- **Sizes:** characters 24 × 32 pixels, creatures 24 × 24, items and icons 16 × 16. One pixel density for the whole
  set: a sprite is not drawn at a higher resolution than its neighbours.
- **Grounded sprites** stand with their feet on the bottom row in `idle`; jumps and hops may leave it.
- **Animations:** `idle` first (2–4 frames, slow), then movement (`walk` 4 frames at 8 fps). Names in lower case
  English; with several directions the files call them `walk_down`, `walk_left` …
- **Palette:** few colours (the tests allow 40 per sheet); colours that a game changes (skin, clothes, liquid) are
  parameters, the rest fixed.

## Icons

- **Grid:** 24 × 24 units, one pixel each at the design size. Ink stays inside the outermost unit; shapes fill the
  room up to about 2 units from the edge, like other icon sets, so icons sit together in a toolbar.
- **One pen:** stroke width, corners and style come from the contract, the same for every icon of a set. Draw centre
  lines; the stroke grows to both sides. Where a heavy stroke or a miter tip would leave the grid, use
  `reach(pen, angle)` and give way: fewer teeth, a smaller door, a symbol that moves, never a stroke of its own width.
- **Readable at 24 px:** gaps and strokes at least 0.8 units (the tests measure it); a detail that does not fit is
  left out rather than drawn as a smudge.
- **Simple shapes:** what the thing is, not how it looks in detail: a house is five corners and a door, a bell a dome,
  a rim and a clapper. Curves as `arc` or as a polygon with enough points (every 15–20 degrees).
- **Filled style:** what is an `area` becomes solid, a `detail` is cut out of it, a `hole` stays open. Plan the parts
  so the filled icon still says the same thing.
- **Presets** name what the icon means in an interface (`settings`, `warning`, `team`), not its values.

## Sounds

- **Sound:** game-ready and clear rather than realistic in every detail: one recognisable event per sound (a hit, a
  step, a chime). Everything is synthesised from the building blocks in `src/core/audio.ts`; no recordings, no files.
- **Units:** frequencies in Hz, times in seconds, everything else 0 to 1 with a sentence on what 0, 0.5 and 1 sound
  like (`describe`). Ranges cover what makes sense in a game, not more.
- **Level:** the finish sets every sound to −1 dBFS; do not normalise in `build`. Balance the parts inside a sound
  (body against noise), not its overall level.
- **Variation:** use the seed for things that repeat (steps, hits, debris), so a game can alternate a few seeds.
  Interface sounds and tones are exact and need no seed.
- **Interface sounds** say one thing each and work in pairs where an app needs both: on rises, off falls; send glides
  up, receive down; success is major or open fifths, an error a low buzz or a falling minor. Short (most under 0.3 s),
  never startling at −1 dBFS: soft attacks of a few milliseconds, nothing harsh unless it is an alarm.
- **Length:** as short as the event; one-shots end on their own (the tests check that the last 50 ms are at least
  10 dB below the loudest moment). Loops render their length plus `LOOP_TAIL`; the finish folds the tail into the
  start.
- **Tuning:** tonal sounds use notes (`semitones()`), chords or intervals, so they stay in tune with each other and
  with music.
- **No melodies of known games, films or songs**, not even rebuilt from notes: a melody is protected however it is
  synthesised. No sound-alikes of a famous sound either.
- **Presets:** two to four uses that differ clearly (`punch`, `heavy-thud`, `sword-clash`), named after what they are.
- **Voices** (`src/core/voice.ts`): a glottis, the formants of a mouth shape, breath and hiss, as keyframes that glide
  into each other. Efforts, cries, creatures and a made-up language, never words of a real one. `size` is the length
  of the vocal tract (a child 0.7, a giant 3): set it with the pitch, a deep voice in a small body sounds wrong.
  Every change of loudness glides over at least 10 ms; a jump in a key clicks. No imitation of a real person's voice
  or of a known character.
- **Budgets per category (seconds):** interface 4, impact 4, movement 1.5, effects 2.5, voices 4, ambience loops 12. A loop in any category (hoofbeats, an engine) may use up to 12.
