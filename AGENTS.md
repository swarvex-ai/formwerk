# Formwerk: instructions for agents

Formwerk is the catalogue of assets as code for games, apps, teaching and research: parametric 3D models for three.js
(r187, WebGPURenderer with WebGL 2 fallback, TSL materials), surfaces that tile (live TSL materials, baked into PNG maps
of any size for other engines), pixel sprites with Godot SpriteFrames, interface icons (SVG and PNG), and sounds for any
engine (48 kHz mono, WAV), voices included. Every asset is
one function of its parameters. No model, image or audio files, no generator credits. Speech in English comes from a
local voice model in the separate GPL package `speech/` (only the gallery's speech tab imports it; never import it
from `src/` outside `src/gallery/`). Music follows as its own kind; until then, a request for it goes to the lead.

## Requests from other projects come first

Formwerk is the shared asset catalogue of swarvex. When another project needs an asset ("a tank for our game", "a
market stall for the town"), its lead sends Formwerk a work request, and the task that answers it goes ahead of the
rest. Build it as a parametric asset like any other, not as a one-off for that project: the requesting project gets
it through the catalogue, and so does everyone after it. If a request needs something the contract lacks, say so in
your submission.

A request for a whole kit (rooms and furniture in real sizes for a room planner, a game table with dice and cards,
machine parts, teaching equipment) is not one task: the lead cuts it into one task per asset, with the kit's shared
rules (sizes, palette, grid) as the first task, and the swarm builds them side by side.

## Adding a model (the usual task)

1. One file `src/assets/<category>/<id>.ts` (categories: furniture, architecture, nature, vehicles, props) with
   `defineAsset({ id, category, title, description, params, presets, rig?, physics, budget, build })`.
   Copy the closest existing asset and change it.
2. Its import and its entry in `src/assets/index.ts` (catalogue) and in `src/index.ts` (library export), each on a line
   of its own: copy a neighbouring line. The library export is the id in camelCase, unless that is a browser global
   (`window`, `document`, `screen`, `location`, `name`): then add `Model` (`windowModel`), so importing it does not hide
   the global.
3. `npm test`: the core tests build your asset at its defaults, every extreme, every preset and random values, and
   check the budget, that it stands on the floor, that it is deterministic, that movable parts stay above the floor
   at both ends of their range, and the physics data. The scene test writes `tests/scene/baseline/<id>.png`: look at
   `tests/scene/out/<id>.png`, then commit the baseline with the asset. Patterned assets are also baked and exported
   as .glb; `tests/scene/out/<id>.baked.png` and `<id>.glb.png` must look like the live render.

## Adding a surface

1. One file `src/surfaces/<category>/<id>.ts` (categories: stone, wood, metal, ground) with
   `defineSurface({ id, category, title, description, params, presets, tile, depth, build })`. `build` returns a
   sampler `(q, resolution) => { height, color, roughness, metalness }` in TSL, where `q` is the position on the tile
   (0 to 1). Use the tiling building blocks of `src/surfaces/noise.ts` (`fbm`, `noise`, `voronoi`, `cell`, `wrap`,
   `ramp`): every pattern must repeat after one tile. Copy the closest surface and change it. Keep ramps on the voronoi edge
   distance (`v.x`) at least 0.15 wide: narrower ones lose the WebGL device in the headless bake at coarse cell counts.
   Keep the height to one `voronoi` call: the normal map samples the height five times, and two voronoi layers in
   the height lose the device too. A second voronoi in colour or roughness is fine.
2. Its import and its entry in `src/surfaces/index.ts`, `src/surfaces/list.ts` and `src/index.ts`, each on a line of its
   own: copy a neighbouring line.
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
2. Its import and its entry in `src/sprites/index.ts` and `src/sprites/lib.ts`, each on a line of its own.
3. `npm test`: the sprite tests draw it at its defaults, every extreme, every preset and random values, and check the
   sheet size, hard edges, the palette, the free outer ring, feet on the bottom row (grounded sprites), left as the
   mirror of right, that animations move, and determinism. `tests/scene/sprites.mjs` writes its sheet to
   `tests/scene/baseline/<id>.png`: look at it enlarged, then commit it with the sprite.

## Adding an icon

1. One file `src/icons/<category>/<id>.ts` (categories: navigation, actions, status, objects) with
   `defineIcon({ id, category, title, description, params, presets, build })`. `params` are the icon's own (at least
   three that change the shape); the contract adds the shared pen (stroke, corners, style, badge, color). `build(p,
   pen)` returns parts on the 24 × 24 grid from `src/core/vector.ts` (`line`, `polygon`, `circle`, `arc`, `rect`) and
   says what each one is: `area` (closed shapes: outlined, tinted or filled by style), `stroke`, `dot`, `detail`
   (drawn, cut out of a filled area), `hole`, `gap` (a clear margin around what comes next). Never set colours or
   stroke widths yourself. Use `pen` and `reach(pen, angle)` to keep the ink inside the grid. A `gap` ends in a cap
   like a stroke: end it clearly inside a filled area or clearly away from other strokes, because a cap that grazes a
   stroke leaves a 1-pixel sliver that counts as a separate part. Copy the closest icon.
2. Its import and its entry in `src/icons/index.ts` and `src/icons/lib.ts`, each on a line of its own.
3. `npm test`: the icon tests draw it at its defaults, every extreme, every preset, random values and every
   combination of its choices at the strongest stroke, each in all three styles. They check that the outermost pixel
   stays empty, the amount of ink, that it is centred, and that it reads at 24 px (no gap or stroke narrower than 0.8
   grid units, measured at eight times the size), plus well-formed SVG in the text colour. `tests/scene/icons.mjs`
   writes its sheet to `tests/scene/baseline/<id>.png` and checks that a browser draws the SVG like the pixels. Look at
   the sheet, then commit it with the icon.
4. The suite draws only a few random cases. `FORMWERK_SWEEP=<id> npx vitest run tests/core/sweep.test.ts` applies the
   same checks to every combination (number parameters at seven values, every stroke, corner and style) and lists the
   failing ones in `tests/scene/out/sweep-<id>.txt`; it must report 0. A full sweep takes minutes up to an hour. While you work, sweep only the failing slice:
   `FORMWERK_SWEEP_FIX='{"size":18,"off":true}'` holds those parameters at these values (seconds); run the full sweep
   once at the end and quote its line.

## Adding a sound

1. One file `src/sounds/<category>/<id>.ts` (categories: ui, impact, movement, effects, voice, ambience) with
   `defineSound({ id, category, title, description, params, presets, loop, maxSeconds, build })`. `build` returns the
   samples at `RATE` (48 kHz mono) from the building blocks of `src/core/audio.ts` (`Osc`, `Biquad`, `LowPass`,
   `envelope`, `grains`, `smooth`, `white`, `semitones`); voices use `voice()` from `src/core/voice.ts` with keyframes
   (pitch, mouth shape, voice, breath, hiss). Copy the closest existing sound and change it.
2. Its import and its entry in `src/sounds/index.ts` (catalogue) and in `src/sounds/lib.ts` (library export), each on a
   line of its own.
3. `npm test`: the sound tests build it at its defaults, every extreme, every preset and random values, and check the
   length budget, the level, no DC, clean edges (one-shots) or seam (loops), that it is audible, that it decays on its
   own and that it is deterministic. `tests/scene/sounds.mjs` writes its spectrogram to
   `tests/scene/baseline/<id>.png`: look at `tests/scene/out/<id>.png`, then commit it with the sound.
4. **Agents cannot listen.** Say in your submission what the sound should sound like and what you changed, in
   words a person can check by ear; the reviewers see the spectrogram, the lead listens in the preview before merging. `npm run test:sound` also prints each sound as
   text (length, level, end, a timeline of level, loudest frequency and centroid; 20 ms steps in
   `tests/scene/out/<id>.txt`): quote the lines that show your sound does what you describe.

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
- **Materials** only from `src/materials` (`material(kind, colour, scale, density?, options?)`); a new kind is its own
  task. Wood, iron, stone and bark carry relief and varying roughness that the export bakes into a normal map and a
  roughness/metalness map. Options: `grain` (wood fibres along "x", "y" or "z"; default "auto": upright on standing
  faces, along x on lying ones), `rust` (iron, 0 bare to 1; default 0.45), `moss` (stone, 0 to 1 on upward faces),
  `plain` (one colour without pattern and bake, e.g. leaf cards). Use `metal` for clean or painted metal, `iron` for
  forged or cast iron that rusts. Pass a larger `scale` to shrink a pattern on a small object (the lantern uses 4).
- **Realistic shapes** (style guide): build from real parts with `src/assets/shapes.ts`: `stave` (barrel and tub
  staves), `rounded` (boxes with rounded edges), `turned` (lathe profiles for legs, spindles, finials), `roundBoards`
  (a round lid from boards), `grid` (any surface from a function, with sharp edges between faces). The five reference
  assets show the bar: barrel, chair, tree, rock, lantern.
- **Budget:** one draw call per material and movable part (use `Parts`, it merges), triangles as low as the shape
  allows. The category limits in `tests/core/assets.test.ts` are protected.
- **Randomness** only from the `seed` argument (`rng(seed)`), never `Math.random()`: same values and seed, same asset.
- **Texts** in English and German (`title`, `description`, every label, option label, describe and preset label).
- **Sounds:** the finish (DC, edges or loop seam, level to −1 dBFS) belongs to the contract, not to `build`; loops
  render their length plus `LOOP_TAIL`. No recordings or audio files, and no melodies or sound-alikes of known games,
  films or songs.
- Style: `docs/style-guide.md`. Engine traps: https://github.com/swarvex-ai/swarvex/tree/main/lead/engine-reference/threejs

## Review checkpoints and common reasons for rework

Every task ends with **Review checkpoints**: the questions the reviewer answers about your submission. Answer each
one in your summary, in order, with the evidence (a test line, a number, what the image shows). These are the
reasons submissions were sent back most often; check them before you submit:

1. **The summary answers the acceptance criteria, not the shell.** One plain sentence per criterion, plus the numbers
   it asks for (triangles at a preset, what each preset sounds like). A summary of terminal output goes back.
2. **Look at every image you commit.** `tests/scene/out/<id>.png` (and `.baked.png`, `.glb.png`, the sheet enlarged)
   before you commit the baseline. If your model cannot read images, hand the task back: an unseen baseline goes back.
3. **Names and types exactly as the task writes them:** `style`, not `form`; `colour`, not `color`. A `choice`
   has string options, and presets use those strings (`"8"`, not `8`).
4. **Movable parts are placed relative to their hinge.** `t.moving(name, x, y, z)` already sits at the hinge: build
   the lid at y ≈ 0 of that group, not at the hinge height again (that puts it twice as high, in the air).
5. **Mirrored parts take the side's sign everywhere:** with `for (const s of [-1, 1])`, rotations too
   (`rotateZ(-s * hang)`), or one side tilts the wrong way.
6. **Optional details draw from their own random stream** (`rng(seed + 1)`), so switching them on does not move
   everything else.
7. **Faces are one-sided:** a flat blade or leaf needs both faces, or half of them vanish from every view.
8. **Change only what the task names.** A value the task does not mention (a `depth`, a preset) stays as it is.
9. **Rebase onto current main** before you submit, and keep each registry entry on a line of its own.
10. **Run `FORMWERK_ONLY=<id> npm test`** and submit only when it is green; quote its lines for your asset.

## Protected (only the lead changes these)

The parameter, asset, surface, sprite, icon and sound contracts (`src/core/**`, `src/assets/define.ts`,
`src/surfaces/define.ts`, `src/surfaces/noise.ts`, `src/surfaces/bake.ts`, `src/sprites/define.ts`, `src/icons/define.ts`,
`src/sounds/define.ts`), the catalogue format (`src/catalog.ts`, `scripts/**`), the tests (`tests/core/**`,
`tests/scene/run.mjs`, `tests/scene/sounds.mjs`, `tests/scene/sprites.mjs`, `tests/scene/icons.mjs`), the speech package (`speech/**`) and the dependencies. If an asset or a sound needs more from them, say so in your
submission.

## Commands

`npm run dev` (gallery), `npm test` (types, core tests, spectrograms, sprite sheets, icon sheets, build with catalogue,
scene tests), `npm run test:core` (fast, while working), `npm run test:sound` (spectrograms only), `npm run test:sprite`
(sprite sheets only), `npm run test:icon` (icon sheets and SVG in a browser). `npm run build` also writes
`dist/catalog.json`, `dist/llms.txt`, every sound at its defaults and presets as `dist/sounds/*.wav`, every sprite as
`dist/sprites/*.png`, `.tres` and `.json`, and every icon as `dist/icons/*.svg` and `.png`.

`FORMWERK_ONLY=<id>,<id> npm test` checks only these assets one by one (the checks across the whole catalogue and the
build still run, but the ready sound, sprite and icon files are rendered only for these ids): about 15 s for one
asset instead of minutes. The scene test stops an asset after 240 s with "FAIL time limit" (a page that hangs);
`FORMWERK_TIMEOUT=<seconds>` changes it. The swarvex test pipeline does the same by itself
(`scripts/pipeline-test.mjs`): it tests the assets your contribution changes, and the full suite as soon as it touches
shared code. The full suite also runs on GitHub after every merge.
