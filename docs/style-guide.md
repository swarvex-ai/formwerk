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

## Sounds

- **Sound:** game-ready and clear rather than realistic in every detail: one recognisable event per sound (a hit, a
  step, a chime). Everything is synthesised from the building blocks in `src/core/audio.ts`; no recordings, no files.
- **Units:** frequencies in Hz, times in seconds, everything else 0 to 1 with a sentence on what 0, 0.5 and 1 sound
  like (`describe`). Ranges cover what makes sense in a game, not more.
- **Level:** the finish sets every sound to −1 dBFS; do not normalise in `build`. Balance the parts inside a sound
  (body against noise), not its overall level.
- **Variation:** use the seed for things that repeat (steps, hits, debris), so a game can alternate a few seeds.
  Interface sounds and tones are exact and need no seed.
- **Length:** as short as the event; one-shots end on their own (the tests check that the last 50 ms are at least
  10 dB below the loudest moment). Loops render their length plus `LOOP_TAIL`; the finish folds the tail into the
  start.
- **Tuning:** tonal sounds use notes (`semitones()`), chords or intervals, so they stay in tune with each other and
  with music.
- **No melodies of known games, films or songs**, not even rebuilt from notes: a melody is protected however it is
  synthesised. No sound-alikes of a famous sound either.
- **Presets:** two to four uses that differ clearly (`punch`, `heavy-thud`, `sword-clash`), named after what they are.
- **Budgets per category (seconds):** interface 4, impact 4, movement 1.5, effects 2.5, ambience loops 12.
