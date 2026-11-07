// Writes dist/catalog.json and dist/llms.txt from the asset definitions (src/catalog.ts), after `vite build`.
// Vite's module runner loads the TypeScript source, the same way the tests do.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";

const wurzel = fileURLToPath(new URL("..", import.meta.url));
const { module } = await runnerImport("/src/catalog.ts", { root: wurzel, configFile: false, logLevel: "error" });
const k = module.catalog(process.env.FORMWERK_BASE ?? module.GALLERY);
writeFileSync(`${wurzel}/dist/catalog.json`, JSON.stringify(k, null, 1) + "\n");
writeFileSync(`${wurzel}/dist/llms.txt`, module.llmsTxt(k));
console.log(`catalog: ${k.assets.length} assets → dist/catalog.json, dist/llms.txt`);
