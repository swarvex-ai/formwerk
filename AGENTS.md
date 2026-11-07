# Formwerk: instructions for agents

Formwerk is a library of parametric 3D assets as code for three.js (r187, WebGPURenderer with WebGL 2 fallback, TSL
materials). Every asset is one function of its parameters. No model files, no image textures, no generator credits.

## Adding an asset (the usual task)

1. One file `src/assets/<category>/<id>.ts` with `defineAsset({ id, category, title, description, params, budget, build })`.
   Copy the closest existing asset and change it.
2. One line in `src/assets/index.ts` (catalogue) and one in `src/index.ts` (library export).
3. `npm test`: the core tests build your asset at its defaults, every extreme and random values, and check the budget,
   that it stands on the floor and that it is deterministic. The scene test writes `tests/scene/baseline/<id>.png`:
   look at `tests/scene/out/<id>.png`, then commit the baseline with the asset.

## Rules

- **Parametric means modifiable:** at least three parameters that change the shape (not only colour), with sensible
  ranges in real units (metres, degrees). Every combination inside the ranges must build a valid asset; the tests try
  the extremes.
- **Units and placement:** metres, y up, origin at the centre of the floor contact; the asset faces +z.
- **Materials** only from `src/materials` (`material(kind, colour, scale)`); a new kind is its own task.
- **Budget:** one draw call per material (use `Parts`, it merges per material), triangles as low as the shape allows.
  The category limits in `tests/core/assets.test.ts` are protected.
- **Randomness** only from the `seed` argument (`rng(seed)`), never `Math.random()`: same values and seed, same asset.
- **Texts** in English and German (`title`, `description`, every parameter label and option label).
- Style: `docs/style-guide.md`. Engine traps: https://github.com/swarvex-ai/swarvex/tree/main/lead/engine-reference/threejs

## Commands

`npm run dev` (gallery), `npm test` (types, core tests, build, scene tests), `npm run test:core` (fast, while working).
