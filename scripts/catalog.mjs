// Writes dist/catalog.json, dist/llms.txt and the ready sound files dist/sounds/*.wav from the definitions
// (src/catalog.ts), after `vite build`. Vite's module runner loads the TypeScript source, the same way the tests do.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";

const wurzel = fileURLToPath(new URL("..", import.meta.url));
const { module } = await runnerImport("/src/catalog.ts", { root: wurzel, configFile: false, logLevel: "error" });
const k = module.catalog(process.env.FORMWERK_BASE ?? module.GALLERY);
writeFileSync(`${wurzel}/dist/catalog.json`, JSON.stringify(k, null, 1) + "\n");
writeFileSync(`${wurzel}/dist/llms.txt`, module.llmsTxt(k));
const dateien = module.soundFiles();
mkdirSync(`${wurzel}/dist/sounds`, { recursive: true });
for (const f of dateien) writeFileSync(`${wurzel}/dist/${f.path}`, f.bytes);
const kb = Math.round(dateien.reduce((n, f) => n + f.bytes.length, 0) / 1024);
console.log(`catalog: ${k.models.length} models, ${k.surfaces.length} surfaces, ${k.sounds.length} sounds → dist/catalog.json, dist/llms.txt, ${dateien.length} files in dist/sounds (${kb} KB)`);
