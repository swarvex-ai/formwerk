// The machine-readable catalogue (catalog.json) and the agent guide (llms.txt), both generated from the definitions
// at build time (scripts/catalog.mjs) and served next to the gallery, with every sound as a ready WAV file (defaults
// and presets). Agents of other projects find every parameter with its range and meaning, the presets, the movable
// parts, the physics hints and the files here, without a server.
import { ASSETS } from "./assets";
import { infoOf, make, measure, size, type AnyAsset } from "./assets/define";
import { metrics, toWav } from "./core/audio";
import type { Param } from "./core/params";
import { SOUNDS } from "./sounds";
import { makeSound, type AnySound } from "./sounds/define";
import { SURFACES } from "./surfaces";
import { MAPS, type AnySurface } from "./surfaces/define";
import { SIZES } from "./surfaces/bake";
import type { Pixels } from "./core/pixels";
import { SPRITES } from "./sprites";
import { DOWNLOAD_MB, MAX_CHARACTERS, MODEL, VOICES } from "../speech/src";
import { animationName, godotSpriteFrames, makeSheet, sheetJson, type AnySprite } from "./sprites/define";

export const GALLERY = "https://formwerk.swarvex.run";
export const REPOSITORY = "https://github.com/swarvex-ai/formwerk";

const funktion = (id: string) => id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

function eintrag(a: AnyAsset, base: string) {
  const o = make(a), info = infoOf(o)!, m = measure(o), s = size(o);
  return {
    id: a.id, category: a.category, title: a.title, description: a.description,
    function: funktion(a.id), gallery: `${base}/#${a.id}`,
    params: a.params as Record<string, Param>,
    presets: Object.fromEntries(Object.entries(a.presets).map(([name, p]) => [name, { ...p, gallery: `${base}/#${a.id}?preset=${name}` }])),
    rig: a.rig ?? {},
    physics: a.physics,
    budget: a.budget,
    atDefaults: { size: { width: s.width, height: s.height, depth: s.depth }, triangles: m.triangles, drawCalls: m.drawCalls, massKg: info.physics.massKg },
  };
}

function klangEintrag(s: AnySound, base: string) {
  const m = metrics(makeSound(s).samples);
  return {
    id: s.id, category: s.category, title: s.title, description: s.description,
    function: funktion(s.id), gallery: `${base}/#${s.id}`, file: `${base}/sounds/${s.id}.wav`,
    params: s.params as Record<string, Param>,
    presets: Object.fromEntries(Object.entries(s.presets).map(([name, p]) => [name, { ...p, gallery: `${base}/#${s.id}?preset=${name}`, file: `${base}/sounds/${s.id}.${name}.wav` }])),
    loop: s.loop, maxSeconds: s.maxSeconds,
    atDefaults: { seconds: m.seconds, rmsDb: m.rmsDb },
  };
}

function flaechenEintrag(f: AnySurface, base: string) {
  return {
    id: f.id, category: f.category, title: f.title, description: f.description,
    function: funktion(f.id), gallery: `${base}/#${f.id}`,
    params: f.params as Record<string, Param>,
    presets: Object.fromEntries(Object.entries(f.presets).map(([name, p]) => [name, { ...p, gallery: `${base}/#${f.id}?preset=${name}` }])),
    tileMetres: f.tile, reliefMetres: f.depth, maps: MAPS, sizes: [...SIZES],
  };
}

function spriteEintrag(s: AnySprite, base: string) {
  const datei = (name: string) => ({ png: `${base}/sprites/${name}.png`, godot: `${base}/sprites/${name}.tres`, json: `${base}/sprites/${name}.json` });
  return {
    id: s.id, category: s.category, title: s.title, description: s.description,
    function: funktion(s.id), gallery: `${base}/#${s.id}`, files: datei(s.id),
    params: s.params as Record<string, Param>,
    presets: Object.fromEntries(Object.entries(s.presets).map(([name, p]) => [name, { ...p, gallery: `${base}/#${s.id}?preset=${name}`, files: datei(`${s.id}.${name}`) }])),
    frame: s.frame, directions: s.directions, grounded: s.grounded,
    animations: s.animations.flatMap((a) => s.directions.map((d) => ({ name: animationName(s, a.name, d), frames: a.frames, fps: a.fps, loop: a.loop }))),
  };
}

/** The ready sprite files: every sprite at its defaults and every preset as sheet (.png), Godot SpriteFrames and JSON. */
export function spriteFiles(): ({ path: string; image: Pixels } | { path: string; text: string })[] {
  return SPRITES.flatMap((s) => [{ name: s.id, input: {} }, ...Object.keys(s.presets).map((preset) => ({ name: `${s.id}.${preset}`, input: { preset } }))].flatMap(({ name, input }) => {
    const sheet = makeSheet(s, input);
    return [
      { path: `sprites/${name}.png`, image: sheet.image },
      { path: `sprites/${name}.tres`, text: godotSpriteFrames(sheet, `${name}.png`) },
      { path: `sprites/${name}.json`, text: JSON.stringify(sheetJson(sheet, `${name}.png`), null, 1) + "\n" },
    ];
  }));
}

/** The ready sound files of the gallery: every sound at its defaults and at every preset, seed 1. */
export function soundFiles(): { path: string; bytes: Uint8Array<ArrayBuffer> }[] {
  return SOUNDS.flatMap((s) => [
    { path: `sounds/${s.id}.wav`, bytes: toWav(makeSound(s).samples) },
    ...Object.keys(s.presets).map((name) => ({ path: `sounds/${s.id}.${name}.wav`, bytes: toWav(makeSound(s, { preset: name }).samples) })),
  ]);
}

export function catalog(base = GALLERY) {
  return {
    name: "Formwerk",
    description: "Game assets as code: parametric 3D models and tiling surfaces for three.js (r187, WebGPU with WebGL 2 fallback, TSL materials), surfaces as PNG maps up to 8192 pixels, pixel sprites with Godot SpriteFrames and sounds for any engine (WAV, 48 kHz mono).",
    licence: { code: "MIT", assets: "CC0-1.0" },
    gallery: base, repository: REPOSITORY,
    conventions: {
      units: "metres; angles in degrees", up: "+y", front: "+z", origin: "centre of the floor contact",
      values: "values outside a range are clamped, unknown keys ignored; the same values and seed always build the same geometry",
      presets: "{ preset: \"<name>\" } sets the preset's values, explicit values win over it",
      rig: "movable parts are named child objects with their origin at the hinge; rotate = degrees around axis, slide = metres along axis, 0 is closed, positive opens",
      physics: "body static or dynamic; collider box (bounding box), hull (convex hull) or cylinder (trunk); massKg is an estimate",
      surfaces: "materials that tile without a seam; one tile is tileMetres metres. three.js: a live TSL material (no textures, sharp at any distance), repeat = tiles across the mesh's UVs. Other engines: PNG maps baked in the gallery at 512 to 8192 pixels per tile (larger sizes get finer detail): colour (sRGB), normal (OpenGL, green up, as Godot and Blender expect), roughness, metalness, height (linear; reliefMetres between black and white)",
      sprites: "pixel art with hard edges (alpha 0 or 255) and a one-pixel outline; a sheet per sprite: rows animation × direction, columns frames; grounded sprites have their feet on the bottom row of the frame. Godot: put the .png and .tres side by side, use the .tres as SpriteFrames of an AnimatedSprite2D or AnimatedSprite3D and set the texture filter to Nearest",
      sounds: "48 kHz mono, peak at −1 dBFS; one-shots start and end at zero, loops (loop: true) repeat without a seam; the same values and seed give the same samples, other seeds vary them (footsteps, hits)",
    },
    models: ASSETS.map((a) => eintrag(a, base)),
    surfaces: SURFACES.map((f) => flaechenEintrag(f, base)),
    sprites: SPRITES.map((s) => spriteEintrag(s, base)),
    speech: {
      gallery: `${base}/#speech`, language: "English", model: MODEL, downloadMB: DOWNLOAD_MB, maxCharacters: MAX_CHARACTERS,
      voices: Object.keys(VOICES), licence: "package speech/ GPL-3.0-or-later (eSpeak NG inside kokoro-js); spoken files CC0",
      note: "Any line of English text, spoken in the browser and finished as a Formwerk sound (48 kHz mono, -1 dBFS). The model comes from Hugging Face only after the person agrees. No German voice yet.",
    },
    sounds: SOUNDS.map((s) => klangEintrag(s, base)),
  };
}
export type Catalog = ReturnType<typeof catalog>;

const wert = (v: unknown) => (typeof v === "string" ? `"${v}"` : String(v));
function paramZeile(name: string, p: Param): string {
  const art = p.type === "number" ? `number ${p.min}–${p.max}${p.unit ? " " + p.unit : ""}` : p.type === "integer" ? `integer ${p.min}–${p.max}`
    : p.type === "choice" ? p.options.map((o) => `"${o}"`).join(" | ") : p.type === "color" ? "colour #rrggbb" : "boolean";
  return `  - \`${name}\` (${art}, default ${wert(p.default)}): ${p.describe.en}`;
}

/** The agent guide, after https://llmstxt.org: what Formwerk is, how to use it, and every asset in short. */
export function llmsTxt(k: Catalog): string {
  const teile = [
    `# Formwerk`,
    ``,
    `> ${k.description} Every asset is a function of typed parameters. Code MIT, assets CC0: copy, change and ship them anywhere, no attribution needed.`,
    ``,
    `- Gallery with controls, share links and downloads (.glb with baked patterns, .usdz, .obj, PNG maps of surfaces, .wav): ${k.gallery}`,
    `- Full catalogue with every parameter, preset, movable part, physics hint and sound file: ${k.gallery}/catalog.json`,
    `- Source: ${k.repository} (TypeScript; copy \`src/\` into your project or add the repository as a git dependency)`,
    ``,
    `## Use: models`,
    ``,
    "```ts",
    `import { chair, pose, physicsOf, hullPoints, toGLB } from "formwerk";`,
    `const object = chair({ preset: "bar-stool", color: "#334455" }, 1); // values, seed`,
    `scene.add(object);`,
    `pose(crateObject, { lid: 80 });            // movable parts by name`,
    `const p = physicsOf(object);                // body, massKg, collider, center, halfExtents`,
    `const glb = await toGLB(object, { bake: true }); // patterns baked into a texture`,
    "```",
    ``,
    `Conventions: ${Object.entries(k.conventions).map(([a, b]) => `${a}: ${b}`).join("; ")}.`,
    ``,
    `Missing an asset? Projects on swarvex.ai can send Formwerk a work request; everyone else opens an issue.`,
    ``,
    `## Use: surfaces`,
    ``,
    "```ts",
    `import { cobblestone, bakeSurface, makeSurface, SURFACES } from "formwerk";`,
    `floor.material = cobblestone({ preset: "old-town", moss: 0.3 }, 1, 8); // values, seed, tiles across the UVs (an 8 m floor, 1 m tiles)`,
    `const maps = await bakeSurface(makeSurface(SURFACES[0]), 2048); // PNG-ready maps in the browser: colour, normal, roughness, metalness, height`,
    "```",
    ``,
    `Godot, Blender and other engines: set the values in the gallery and download the PNG maps (512 to 8192 pixels per tile, .zip).`,
    ``,
    `## Use: sprites`,
    ``,
    "```ts",
    `import { villager, sheetJson, godotSpriteFrames } from "formwerk/sprites"; // no three.js`,
    `const sheet = villager({ preset: "merchant", shirt: "#335577" }); // RGBA pixels and frame rectangles`,
    `const tres = godotSpriteFrames(sheet, "merchant.png");             // Godot SpriteFrames next to the PNG`,
    "```",
    ``,
    `Godot and other engines: download the sheet with its SpriteFrames (.tres) and JSON (listed below, or with your values from the gallery). Set the texture filter to Nearest.`,
    ``,
    `## Use: sounds`,
    ``,
    "```ts",
    `import { hit, footstep, toAudioBuffer, toWav } from "formwerk/sounds"; // no three.js`,
    `const samples = hit({ preset: "sword-clash" }, 2);       // Float32Array, 48 kHz mono, −1 dBFS`,
    `const buffer = toAudioBuffer(audioContext, samples);    // or toWav(samples) for a file`,
    `const steps = [1, 2, 3, 4].map((seed) => footstep({ surface: "gravel" }, seed)); // every seed a different step`,
    "```",
    ``,
    `Godot and other engines: download the WAV files (every sound at its defaults and every preset, listed below), or set values in the gallery and download them there. CC0, copy them into your repository.`,
    ``,
    `## Models`,
  ];
  for (const a of k.models) {
    teile.push(``, `### ${a.function}() · ${a.title.en} (${a.category})`, ``, a.description.en, ``, `- Gallery: ${a.gallery}`);
    teile.push(`- Parameters:`, ...Object.entries(a.params).map(([n, p]) => paramZeile(n, p)));
    teile.push(`- Presets: ${Object.entries(a.presets).map(([n, p]) => `\`${n}\` (${p.label.en})`).join(", ")}`);
    const rig = Object.entries(a.rig);
    if (rig.length) teile.push(`- Movable parts: ${rig.map(([n, r]) => `\`${n}\` (${r.type} ${r.min}–${r.max}${r.type === "rotate" ? "°" : " m"})`).join(", ")}`);
    teile.push(`- Physics: ${a.physics.body}, collider ${a.physics.collider}; at defaults ${a.atDefaults.size.width} × ${a.atDefaults.size.height} × ${a.atDefaults.size.depth} m, about ${a.atDefaults.massKg} kg, ${a.atDefaults.triangles} triangles`);
  }
  teile.push(``, `## Surfaces`);
  for (const f of k.surfaces) {
    teile.push(``, `### ${f.function}() · ${f.title.en} (${f.category}, one tile ${f.tileMetres} m)`, ``, f.description.en, ``, `- Gallery: ${f.gallery}`);
    teile.push(`- Parameters:`, ...Object.entries(f.params).map(([n, p]) => paramZeile(n, p)));
    teile.push(`- Presets: ${Object.entries(f.presets).map(([n, p]) => `\`${n}\` (${p.label.en})`).join(", ")}`);
  }
  teile.push(``, `## Sprites`);
  for (const s of k.sprites) {
    teile.push(``, `### ${s.function}() · ${s.title.en} (${s.category}, ${s.frame.w} × ${s.frame.h} pixels, ${s.directions.length} direction${s.directions.length > 1 ? "s" : ""})`, ``, s.description.en, ``, `- Gallery: ${s.gallery}`);
    teile.push(`- Files at the defaults: ${s.files.png}, ${s.files.godot}, ${s.files.json}`);
    teile.push(`- Animations: ${s.animations.map((a) => `\`${a.name}\` (${a.frames} frames, ${a.fps} fps)`).join(", ")}`);
    teile.push(`- Parameters:`, ...Object.entries(s.params).map(([n, p]) => paramZeile(n, p)));
    teile.push(`- Presets: ${Object.entries(s.presets).map(([n, p]) => `\`${n}\` (${p.label.en})`).join(", ")}`);
  }
  teile.push(``, `## Speech (English)`, ``, `${k.speech.note} Gallery: ${k.speech.gallery}. Voices: ${k.speech.voices.map((v) => `\`${v}\``).join(", ")}. Licence: ${k.speech.licence}.`);
  teile.push(``, `## Sounds`);
  for (const s of k.sounds) {
    teile.push(``, `### ${s.function}() · ${s.title.en} (${s.category}, ${s.loop ? "seamless loop" : "one-shot"})`, ``, s.description.en, ``, `- Gallery: ${s.gallery}`);
    teile.push(`- File at the defaults: ${s.file} (${s.atDefaults.seconds} s)`);
    teile.push(`- Parameters:`, ...Object.entries(s.params).map(([n, p]) => paramZeile(n, p)));
    teile.push(`- Presets: ${Object.entries(s.presets).map(([n, p]) => `\`${n}\` (${p.label.en}, ${p.file})`).join(", ")}`);
  }
  return teile.join("\n") + "\n";
}
