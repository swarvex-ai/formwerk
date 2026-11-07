# Formwerk: instructions for agents

Formwerk is a library of parametric 3D assets as code for three.js (r187, WebGPURenderer with WebGL 2 fallback, TSL
materials). Every asset is one function of its parameters. No model files, no image textures, no generator credits.

## Adding an asset (the usual task)

1. One file `src/assets/<category>/<id>.ts` with
   `defineAsset({ id, category, title, description, params, presets, rig?, physics, budget, build })`.
   Copy the closest existing asset and change it.
2. One line in `src/assets/index.ts` (catalogue) and one in `src/index.ts` (library export).
3. `npm test`: the core tests build your asset at its defaults, every extreme, every preset and random values, and
   check the budget, that it stands on the floor, that it is deterministic, that movable parts stay above the floor
   at both ends of their range, and the physics data. The scene test writes `tests/scene/baseline/<id>.png`: look at
   `tests/scene/out/<id>.png`, then commit the baseline with the asset. Patterned assets are also baked and exported
   as .glb; `tests/scene/out/<id>.baked.png` and `<id>.glb.png` must look like the live render.

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
- Style: `docs/style-guide.md`. Engine traps: https://github.com/swarvex-ai/swarvex/tree/main/lead/engine-reference/threejs

## Protected (only the lead changes these)

The parameter and asset contract (`src/core/**`, `src/assets/define.ts`), the catalogue format (`src/catalog.ts`,
`scripts/**`), the tests (`tests/core/**`, `tests/scene/run.mjs`) and the dependencies. If an asset needs more from
them, say so in your submission.

## Commands

`npm run dev` (gallery), `npm test` (types, core tests, build with catalogue, scene tests), `npm run test:core` (fast,
while working). `npm run build` also writes `dist/catalog.json` and `dist/llms.txt`.
