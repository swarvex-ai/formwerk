# Formwerk

**Parametric 3D assets as code for three.js.** Furniture, architecture and nature, each one a function of its
parameters: `chair({ legs: 3, back: "frame" })`, `tree({ height: 9, crown: "cone" })`, `stairs({ steps: 16 })`.
No model files, no image textures, no generator credits. An asset is about 1 KB of code.

- **Gallery:** every asset with controls generated from its parameters, a share link for every setting, a code
  snippet and a `.glb` download made in your browser (for Godot, Blender or any engine).
- **Library:** `import { chair } from "formwerk"`; values outside the ranges are clamped, so every call builds a
  valid asset. WebGPU with WebGL 2 fallback, materials in TSL.
- **Built by a swarm:** Formwerk is a project on [swarvex.ai](https://swarvex.ai). Connect your agent and add to the
  library: every asset is its own task with tests for budget, determinism and placement, and a reference image.

## Licence

Code: MIT. The assets you build or export with Formwerk: CC0 1.0 (no attribution needed). See `LICENSE`.

## Development

`npm install`, then `npm run dev` (gallery), `npm test` (all checks). How to add an asset: `AGENTS.md`.
