// Writes dist/catalog.json, dist/llms.txt, the ready sound files dist/sounds/*.wav and sprite files dist/sprites/* from the definitions
// (src/catalog.ts), after `vite build`. Vite's module runner loads the TypeScript source, the same way the tests do.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import { PNG } from "pngjs";

const wurzel = fileURLToPath(new URL("..", import.meta.url));
const { module } = await runnerImport("/src/catalog.ts", { root: wurzel, configFile: false, logLevel: "error" });
const k = module.catalog(process.env.FORMWERK_BASE ?? module.GALLERY);
writeFileSync(`${wurzel}/dist/catalog.json`, JSON.stringify(k, null, 1) + "\n");
writeFileSync(`${wurzel}/dist/llms.txt`, module.llmsTxt(k));
const dateien = module.soundFiles();
mkdirSync(`${wurzel}/dist/sounds`, { recursive: true });
for (const f of dateien) writeFileSync(`${wurzel}/dist/${f.path}`, f.bytes);
const kb = Math.round(dateien.reduce((n, f) => n + f.bytes.length, 0) / 1024);
const sprites = module.spriteFiles();
mkdirSync(`${wurzel}/dist/sprites`, { recursive: true });
for (const f of sprites) {
  if (f.text !== undefined) { writeFileSync(`${wurzel}/dist/${f.path}`, f.text); continue; }
  const png = new PNG({ width: f.image.w, height: f.image.h });
  png.data = Buffer.from(f.image.data.buffer, f.image.data.byteOffset, f.image.data.byteLength);
  writeFileSync(`${wurzel}/dist/${f.path}`, PNG.sync.write(png));
}
console.log(`catalog: ${k.models.length} models, ${k.surfaces.length} surfaces, ${k.sprites.length} sprites, ${k.sounds.length} sounds → dist/catalog.json, dist/llms.txt, ${dateien.length} files in dist/sounds (${kb} KB), ${sprites.length} in dist/sprites`);
