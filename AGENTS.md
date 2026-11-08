# Formwerk: instructions for agents

Formwerk is the catalogue of game assets as code: parametric 3D models for three.js (r187, WebGPURenderer with WebGL 2
fallback, TSL materials), surfaces that tile (live TSL materials, baked into PNG maps of any size for other engines)
pixel sprites with Godot SpriteFrames, and sounds for any engine (48 kHz mono, WAV), voices included. Every asset is
one function of its parameters. No model, image or audio files, no generator credits. Speech in English comes from a
local voice model in the separate GPL package `speech/` (only the gallery's speech tab imports it; never import it
from `src/` outside `src/gallery/`). Music follows as its own kind; until then, a request for it goes to the lead.

## Requests from other projects come first

Formwerk is the shared asset catalogue of swarvex. When another project needs an asset ("a tank for our game", "a
market stall for the town"), its lead sends Formwerk a work request, and the task that answers it goes ahead of the
rest. Build it as a parametric asset like any other, not as a one-off for that project: the requesting project gets
it through the catalogue, and so does everyone after it. If a request needs something the contract lacks, say so in
your submission.

## Adding a model (the usual task)

1. One file `src/assets/<category>/<id>.ts` (categories: furniture, architecture, nature, vehicles, props) with
   `defineAsset({ id, category, title, description, params, presets, rig?, physics, budget, build })`.
   Copy the closest existing asset and change it.
2. One line in `src/assets/index.ts` (catalogue) and one in `src/index.ts` (library export).
3. `npm test`: the core tests build your asset at its defaults, every extreme, every preset and random values, and
   check the budget, that it stands on the floor, that it is deterministic, that movable parts stay above the floor
   at both ends of their range, and the physics data. The scene test writes `tests/scene/baseline/<id>.png`: look at
   `tests/scene/out/<id>.png`, then commit the baseline with the asset. Patterned assets are also baked and exported
   as .glb; `tests/scene/out/<id>.baked.png` and `<id>.glb.png` must look like the live render.

## Adding a surface

1. One file `src/surfaces/<category>/<id>.ts` (categories: stone, wood, metal) with
   `defineSurface({ id, category, title, description, params, presets, tile, depth, build })`. `build` returns a
   sampler `(q, resolution) => { height, color, roughness, metalness }` in TSL, where `q` is the position on the tile
   (0 to 1). Use the tiling building blocks of `src/surfaces/noise.ts` (`fbm`, `noise`, `voronoi`, `cell`, `wrap`,
   `ramp`): every pattern must repeat after one tile. Copy the closest surface and change it.
2. One line each in `src/surfaces/index.ts`, `src/surfaces/list.ts` and `src/index.ts`.
3. `npm test`: the scene test renders it live and writes `tests/scene/baseline/<id>.png` and `<id>.maps.png` (colour,
   normal, roughness, height); it checks that every map repeats after exactly one tile, that the bake is deterministic
   and that a plane with the baked PNG maps looks like the live material. Look at `tests/scene/out/`, then commit the
   baselines with the surface.

## Adding a sprite

1. One file `src/sprites/<category>/<id>.ts` (categories: characters, creatures, items) with
   `defineSprite({ id, category, title, description, params, presets, frame, directions, animations, grounded, build })`.
   `build` returns a function `(animation, direction, frame) => Pixels` that draws one frame with `src/core/pixels.ts`
   (`part`, `ellipse`, `rect`, `set`, `mirrored`, colours from `ramp()`). Leave the outermost ring of the frame empty:
   the contract draws the outline there. Left is usually `right.mirrored()`. Copy the closest sprite and change it.
2. One line each in `src/sprites/index.ts` and `src/sprites/lib.ts`.
3. `npm test`: the sprite tests draw it at its defaults, every extreme, every preset and random values, and check the
   sheet size, hard edges, the palette, the free outer ring, feet on the bottom row (grounded sprites), left as the
   mirror of right, that animations move, and determinism. `tests/scene/sprites.mjs` writes its sheet to
   `tests/scene/baseline/<id>.png`: look at it enlarged, then commit it with the sprite.

## Adding a sound

1. One file `src/sounds/<category>/<id>.ts` (categories: ui, impact, movement, effects, voice, ambience) with
   `defineSound({ id, category, title, description, params, presets, loop, maxSeconds, build })`. `build` returns the
   samples at `RATE` (48 kHz mono) from the building blocks of `src/core/audio.ts` (`Osc`, `Biquad`, `LowPass`,
   `envelope`, `grains`, `smooth`, `white`, `semitones`); voices use `voice()` from `src/core/voice.ts` with keyframes
   (pitch, mouth shape, voice, breath, hiss). Copy the closest existing sound and change it.
2. One line in `src/sounds/index.ts` (catalogue) and one in `src/sounds/lib.ts` (library export).
3. `npm test`: the sound tests build it at its defaults, every extreme, every preset and random values, and check the
   length budget, the level, no DC, clean edges (one-shots) or seam (loops), that it is audible, that it decays on its
   own and that it is deterministic. `tests/scene/sounds.mjs` writes its spectrogram to
   `tests/scene/baseline/<id>.png`: look at `tests/scene/out/<id>.png`, then commit it with the sound.
4. **Agents cannot listen.** Say in your submission what the sound should sound like and what you changed, in
   words a person can check by ear; the reviewers see the spectrogram, the lead listens in the preview before merging.

## Rules

- **Parametric means modifiable:** at least three parameters that change the shape (not only colour), with sensible
  ranges in real units (metres, degrees). Every combination inside the ranges must build a valid asset; the tests try
  the extremes.
- **Every parameter has `describe`:** one plain sentence in German and English on what it changes, with typical real
  values ("0.46 m at a dining table, 0.75 m at a bar"). Agents of other projects choose values from it (llms.txt).
- **Presets:** at least two named looks (`"bar-stool"`, `"fir"`), each setting only the values that make the look.
- **Physics:** `body` static (fixed in a level: shelves, stairs, trees) or dynamic (props that get pushed: chairs,
  crates); `collider` box, hull (convex shapes, stairs as a ramp) or cylinder (trunks; call `t.cylinder(r, h)`).
  Mass is estimated from the volume and the material; for things drawn solid that are hollow, pass an effective
  density to `material()`.
- **Movable parts** (lids, doors, gates, drawers): `t.moving(name, x, y, z)` returns parts whose hinge is at x, y, z;
  declare the same name in `rig` (rotate in degrees or slide in metres along an axis, 0 closed, positive opens).
  Pass `{ max }` when the range depends on the values (a small drawer slides out less).
- **Units and placement:** metres, y up, origin at the centre of the floor contact; the asset faces +z.
- **Materials** only from `src/materials` (`material(kind, colour, scale, density?)`); a new kind is its own task.
- **Budget:** one draw call per material and movable part (use `Parts`, it merges), triangles as low as the shape
  allows. The category limits in `tests/core/assets.test.ts` are protected.
- **Randomness** only from the `seed` argument (`rng(seed)`), never `Math.random()`: same values and seed, same asset.
- **Texts** in English and German (`title`, `description`, every label, option label, describe and preset label).
- **Sounds:** the finish (DC, edges or loop seam, level to −1 dBFS) belongs to the contract, not to `build`; loops
  render their length plus `LOOP_TAIL`. No recordings or audio files, and no melodies or sound-alikes of known games,
  films or songs.
- Style: `docs/style-guide.md`. Engine traps: https://github.com/swarvex-ai/swarvex/tree/main/lead/engine-reference/threejs

## Protected (only the lead changes these)

The parameter, asset, surface and sound contracts (`src/core/**`, `src/assets/define.ts`, `src/surfaces/define.ts`,
`src/surfaces/noise.ts`, `src/surfaces/bake.ts`, `src/sprites/define.ts`, `src/sounds/define.ts`), the catalogue format (`src/catalog.ts`,
`scripts/**`), the tests (`tests/core/**`, `tests/scene/run.mjs`,
`tests/scene/sounds.mjs`, `tests/scene/sprites.mjs`), the speech package (`speech/**`) and the dependencies. If an asset or a sound needs more from them, say so in your
submission.

## Commands

`npm run dev` (gallery), `npm test` (types, core tests, spectrograms, sprite sheets, build with catalogue, scene
tests), `npm run test:core` (fast, while working), `npm run test:sound` (spectrograms only), `npm run test:sprite`
(sprite sheets only). `npm run build` also writes `dist/catalog.json`, `dist/llms.txt`, every sound at its defaults
and presets as `dist/sounds/*.wav` and every sprite as `dist/sprites/*.png`, `.tres` and `.json`.
