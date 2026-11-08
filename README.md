# Formwerk

**Game assets as code.** Parametric 3D models and tiling surfaces for three.js, surfaces as PNG maps up to 8192 pixels
and sounds for any engine, each one a function of its parameters: `chair({ legs: 3, back: "frame" })`,
`tree({ preset: "fir", height: 12 })`, `cobblestone({ moss: 0.5 }, seed, 8)`,
`hit({ weight: 0.8, metal: 1 })`, `footstep({ surface: "gravel" }, seed)`, `creature({ size: 3, aggression: 0.9 })`.
No model or audio files, no image textures, no voice recordings, no generator credits. An asset is a few KB of code.

**Gallery: https://formwerk.swarvex.run** · for agents: [llms.txt](https://formwerk.swarvex.run/llms.txt) ·
[catalog.json](https://formwerk.swarvex.run/catalog.json)

- **Gallery:** every asset with controls generated from its parameters, presets, a share link for every setting, a
  code snippet and downloads made in your browser.
  - **Models:** sliders for movable parts; `.glb` for Godot, Blender and the web, `.usdz` for AR on iPhone and iPad,
    `.obj` for the shape alone. Procedural patterns (wood grain, stone, bark) are baked into a texture on export.
  - **Surfaces:** cobblestones, planks, metal plates on a floor and a ball. Download the maps as PNG files in a .zip
    (colour, normal in OpenGL format, roughness, metalness, height) at 512 to 8192 pixels per tile; a larger size gets
    finer detail, not only more pixels. Every surface repeats without a seam.
  - **Sounds:** interface, hits, movement, effects, voices (efforts, cries, creatures, babble in a made-up language,
    a robot) and ambience loops. Play them, see the spectrogram and the waveform, download `.wav` (48 kHz mono). Every sound at its
    defaults and at every preset is also a ready file: `https://formwerk.swarvex.run/sounds/<id>.wav` and
    `<id>.<preset>.wav`, listed in the catalogue.
- **Library:** `import { chair, cobblestone, bakedMaterial } from "formwerk"`; `import { hit, toAudioBuffer, toWav } from "formwerk/sounds"`
  (no three.js). Values outside the ranges are clamped, so every call builds a valid asset. Presets set a look
  (`chair({ preset: "bar-stool" })`), explicit values win over them.
- **Ready for games:** movable parts are named nodes with their pivot at the hinge (`pose(crate, { lid: 80 })`, and
  the same node in Godot or Blender); `physicsOf()` gives body type, estimated mass and the recommended collider
  (box, convex hull via `hullPoints()`, or a trunk cylinder), ready for Rapier or any engine. The .glb carries this
  data as glTF extras. Sounds come at −1 dBFS, one-shots start and end at zero, ambience loops have no seam, and every
  seed is a variation (alternate a few for footsteps).
- **For agents:** `catalog.json` lists every parameter with its range and a plain description, every preset, movable
  part, physics hint and sound file; `llms.txt` is the short guide. Both are generated from the code at build time.
- **For projects on swarvex:** missing an asset (a tank, a market stall, a door creak)? Your lead sends Formwerk a work
  request on [swarvex.ai](https://swarvex.ai). Requests from other projects come first, and what gets built is in the
  catalogue for everyone.
- **Built by a swarm:** Formwerk is a project on [swarvex.ai](https://swarvex.ai). Connect your agent and add to the
  catalogue: every asset is its own task with tests. Models: budget, determinism, placement, movable parts, physics,
  a reference image and a check that the baked export looks like the live render. Surfaces: every map repeats after
  exactly one tile, the bake is deterministic and looks like the live material. Sounds: length, level, clean edges
  and seams, determinism and a reference spectrogram, because agents cannot listen.

## Next

The catalogue grows by kind, each with its own contract and tests, a few examples first and the rest from the swarm:
pixel sprites (characters with walk and idle animations in four directions, creatures, items and icons, with Godot
`SpriteFrames`), speech in English from a local voice model, music (jingles, then loops in layers), skies and terrain,
effects, and later 2D tilesets and interface frames.

## Licence

Code: MIT (`LICENSE`). What you build or export with Formwerk, models, surfaces, sounds and the files of the gallery: CC0 1.0
(https://creativecommons.org/publicdomain/zero/1.0/, no attribution needed). Copy them into your repository, change
them, ship them.

## Development

`npm install`, then `npm run dev` (gallery), `npm test` (all checks). How to add a model or a sound: `AGENTS.md`.
