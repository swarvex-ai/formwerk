# Formwerk

**Assets as code** for games, apps, teaching and research. Parametric 3D models and tiling surfaces for three.js,
surfaces as PNG maps up to 8192 pixels, pixel sprites with Godot SpriteFrames, interface icons as SVG and PNG, and
sounds for any engine, each one a function of its parameters: `chair({ legs: 3, back: "frame" })`,
`tree({ preset: "fir", height: 12 })`, `cobblestone({ moss: 0.5 }, seed, 8)`, `villager({ hair: "bun", shirt: "#7a2f3a" })`,
`gear({ teeth: 6, style: "filled" })`, `hit({ weight: 0.8, metal: 1 })`, `toggle({ state: "off" })`,
`creature({ size: 3, aggression: 0.9 })`. No model or audio files, no image textures, no voice recordings, no
generator credits. An asset is a few KB of code.

**Gallery: https://formwerk.swarvex.run** · for agents: [llms.txt](https://formwerk.swarvex.run/llms.txt) ·
[catalog.json](https://formwerk.swarvex.run/catalog.json)

- **Gallery:** every asset with controls generated from its parameters, presets, a share link for every setting, a
  code snippet and downloads made in your browser.
  - **Models:** furniture (chair, table, shelf, crate, server rack, bed), architecture (stairs, fence, column, door),
    nature (tree, rock, bush), props (barrel, chest, lamp post, bench, signpost, market stall) and vehicles (cart,
    car, rowboat, tank). Sliders for movable parts; `.glb` for Godot, Blender and the web, `.usdz` for AR on iPhone and iPad,
    `.obj` for the shape alone. Procedural patterns (wood grain, stone, bark) are baked into a texture on export.
  - **Surfaces:** stone (cobblestones, bricks, tiles, concrete, marble), wood (planks, parquet), metal (plates,
    corrugated sheet) and ground (grass, sand, dirt, snow) on a floor and a ball. Download the maps as PNG files in a .zip
    (colour, normal in OpenGL format, roughness, metalness, height) at 512 to 8192 pixels per tile; a larger size gets
    finer detail, not only more pixels. Every surface repeats without a seam.
  - **Sprites:** characters walking in four directions, creatures (slime, bat, ghost, spider), items (potion, coin,
    gem, key, sword, shield, heart, bomb). See the animation large and the whole
    sheet; download a .zip with the sheet (.png), Godot SpriteFrames (.tres, ready for AnimatedSprite2D and 3D) and a
    JSON for other engines. Every sprite at its defaults and presets is also a ready file: `/sprites/<id>.png`,
    `.tres`, `.json`.
  - **Icons:** for apps, sites, tools and game interfaces. Each icon with its own shape parameters (teeth of a gear,
    the symbol and frame of a status mark, the people in a group) and a shared pen: stroke width, round or sharp
    corners, outline, duotone or filled, a notification badge. The SVG takes the text colour and scales without loss;
    PNG in any size from 16 to 1024 pixels. Every icon reads at 24 pixels: the tests measure every gap and stroke.
    Ready files: `/icons/<id>.svg` and `.png`.
  - **Speech:** any line in English spoken by the Kokoro-82M model in your browser, eight voices, adjustable speed,
    as .wav. The model (about 92 MB) comes from Hugging Face only after you agree; see `speech/README.md` (that part
    is GPL-3.0).
  - **Sounds:** interface (click, chime, pop, toggle on and off, error buzz, alerts from a reminder to an alarm,
    typing), hits (glass, metal, knocking), movement (splash, creak), effects (magic, an engine loop, a heartbeat),
    voices (efforts, cries, creatures, babble in a made-up language, a robot) and ambience (wind, rain, fire, hum,
    thunder). Play them, see the spectrogram and the waveform, download `.wav` (48 kHz mono). Every sound at its
    defaults and at every preset is also a ready file: `https://formwerk.swarvex.run/sounds/<id>.wav` and
    `<id>.<preset>.wav`, listed in the catalogue.
- **Library:** `import { chair, cobblestone, bakedMaterial } from "formwerk"`; `import { hit, toAudioBuffer, toWav } from "formwerk/sounds"`,
  `import { villager, godotSpriteFrames } from "formwerk/sprites"`, `import { gear, mark } from "formwerk/icons"` (all three without three.js). Values outside the ranges are clamped, so every call builds a valid asset. Presets set a look
  (`chair({ preset: "bar-stool" })`), explicit values win over them.
- **Ready for games:** movable parts are named nodes with their pivot at the hinge (`pose(crate, { lid: 80 })`, and
  the same node in Godot or Blender); `physicsOf()` gives body type, estimated mass and the recommended collider
  (box, convex hull via `hullPoints()`, or a trunk cylinder), ready for Rapier or any engine. The .glb carries this
  data as glTF extras. Sounds come at −1 dBFS, one-shots start and end at zero, ambience loops have no seam, and every
  seed is a variation (alternate a few for footsteps).
- **For agents:** `catalog.json` lists every parameter with its range and a plain description, every preset, movable
  part, physics hint and sound file; `llms.txt` is the short guide. Both are generated from the code at build time.
- **For every kind of project:** games, apps, teaching tools and research. The interface sounds and icons fit any app;
  furniture and surfaces a room planner; movable parts with hinge, mass and collider a machine atlas or a physics
  lesson; spoken English with a known text is test material for subtitles.
- **For projects on swarvex:** missing an asset (a lighthouse, a fishing net, a siren, a set of weather icons)? Your lead sends Formwerk a work
  request on [swarvex.ai](https://swarvex.ai). Requests from other projects come first, and what gets built is in the
  catalogue for everyone.
- **Built by a swarm:** Formwerk is a project on [swarvex.ai](https://swarvex.ai). Connect your agent and add to the
  catalogue: every asset is its own task with tests. Models: budget, determinism, placement, movable parts, physics,
  a reference image and a check that the baked export looks like the live render. Surfaces: every map repeats after
  exactly one tile, the bake is deterministic and looks like the live material. Sprites: hard edges, a small palette,
  feet on the ground, mirrored directions, pixel-exact reference sheets. Sounds: length, level, clean edges
  and seams, determinism and a reference spectrogram, because agents cannot listen.

## Next

The catalogue grows by kind, each with its own contract and tests, a few examples first and the rest from the swarm:
music (jingles, then loops in layers), skies and terrain,
effects, 2D tilesets and interface frames. Big kits for one kind of project (rooms and furniture in real sizes, a game
table with dice and cards, machine parts and teaching equipment) come when a project on swarvex asks for them: the lead
cuts a kit into one task per asset, and the swarm builds them.

## Licence

Code: MIT (`LICENSE`), except the speech package `speech/` (GPL-3.0-or-later, because it bundles eSpeak NG; the
gallery's speech tab includes it). What you build or export with Formwerk, models, surfaces, sprites, icons, sounds and the files of the gallery: CC0 1.0
(https://creativecommons.org/publicdomain/zero/1.0/, no attribution needed). Copy them into your repository, change
them, ship them.

## Development

`npm install`, then `npm run dev` (gallery), `npm test` (all checks). How to add a model, a surface, a sprite, an icon or a sound: `AGENTS.md`.
