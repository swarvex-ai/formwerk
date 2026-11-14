// Writes dist/catalog.json, dist/llms.txt, the ready sound files dist/sounds/*.wav, sprite files dist/sprites/* and icon files dist/icons/* from the definitions
// (src/catalog.ts), after `vite build`. Vite's module runner loads the TypeScript source, the same way the tests do.
// With FORMWERK_ONLY (tests/only.mjs) the ready files are written only for those assets: catalog.json and llms.txt stay
// complete, so a test run for one asset does not render every sound, sprite and icon of the catalogue.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import { PNG } from "pngjs";
import { checked } from "../tests/only.mjs";

const wurzel = fileURLToPath(new URL("..", import.meta.url));
const { module } = await runnerImport("/src/catalog.ts", { root: wurzel, configFile: false, logLevel: "error" });
const k = module.catalog(process.env.FORMWERK_BASE ?? module.GALLERY);
writeFileSync(`${wurzel}/dist/catalog.json`, JSON.stringify(k, null, 1) + "\n");
writeFileSync(`${wurzel}/dist/llms.txt`, module.llmsTxt(k));
const dateien = module.soundFiles(checked);
mkdirSync(`${wurzel}/dist/sounds`, { recursive: true });
for (const f of dateien) writeFileSync(`${wurzel}/dist/${f.path}`, f.bytes);
const kb = Math.round(dateien.reduce((n, f) => n + f.bytes.length, 0) / 1024);
const sprites = module.spriteFiles(checked), icons = module.iconFiles(checked);
mkdirSync(`${wurzel}/dist/sprites`, { recursive: true });
mkdirSync(`${wurzel}/dist/icons`, { recursive: true });
for (const f of [...sprites, ...icons]) {
  if (f.text !== undefined) { writeFileSync(`${wurzel}/dist/${f.path}`, f.text); continue; }
  const png = new PNG({ width: f.image.w, height: f.image.h });
  png.data = Buffer.from(f.image.data.buffer, f.image.data.byteOffset, f.image.data.byteLength);
  writeFileSync(`${wurzel}/dist/${f.path}`, PNG.sync.write(png));
}
console.log(`catalog: ${k.models.length} models, ${k.surfaces.length} surfaces, ${k.sprites.length} sprites, ${k.icons.length} icons, ${k.sounds.length} sounds → dist/catalog.json, dist/llms.txt, ${dateien.length} files in dist/sounds (${kb} KB), ${sprites.length} in dist/sprites, ${icons.length} in dist/icons${process.env.FORMWERK_ONLY ? ` (only ${process.env.FORMWERK_ONLY}: FORMWERK_ONLY is set)` : ""}`);
