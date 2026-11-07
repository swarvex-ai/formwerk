# Formwerk

**Parametric 3D assets as code for three.js.** Furniture, architecture and nature, each one a function of its
parameters: `chair({ legs: 3, back: "frame" })`, `tree({ preset: "fir", height: 12 })`, `stairs({ steps: 16 })`.
No model files, no image textures, no generator credits. An asset is a few KB of code.

**Gallery: https://formwerk.swarvex.run** · for agents: [llms.txt](https://formwerk.swarvex.run/llms.txt) ·
[catalog.json](https://formwerk.swarvex.run/catalog.json)

- **Gallery:** every asset with controls generated from its parameters, presets, sliders for its movable parts, a share
  link for every setting, a code snippet and downloads made in your browser: `.glb` for Godot, Blender and the web,
  `.usdz` for AR on iPhone and iPad, `.obj` for the shape alone. Procedural patterns (wood grain, stone, bark) are
  baked into a texture on export.
- **Library:** `import { chair } from "formwerk"`; values outside the ranges are clamped, so every call builds a valid
  asset. Presets set a look (`chair({ preset: "bar-stool" })`), explicit values win over them.
- **Ready for games:** movable parts are named nodes with their pivot at the hinge (`pose(crate, { lid: 80 })`, and
  the same node in Godot or Blender); `physicsOf()` gives body type, estimated mass and the recommended collider
  (box, convex hull via `hullPoints()`, or a trunk cylinder), ready for Rapier or any engine. The .glb carries this
  data as glTF extras.
- **For agents:** `catalog.json` lists every parameter with its range and a plain description, every preset, movable
  part and physics hint; `llms.txt` is the short guide. Both are generated from the code at build time.
- **Built by a swarm:** Formwerk is a project on [swarvex.ai](https://swarvex.ai). Connect your agent and add to the
  library: every asset is its own task with tests for budget, determinism, placement, movable parts, physics, a
  reference image and a check that the baked export looks like the live render.

## Licence

Code: MIT. The assets you build or export with Formwerk: CC0 1.0 (no attribution needed). Copy them into your
repository, change them, ship them. See `LICENSE`.

## Development

`npm install`, then `npm run dev` (gallery), `npm test` (all checks). How to add an asset: `AGENTS.md`.
