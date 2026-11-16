// Writes a text file into tests/scene/out/ for the core tests (vitest's console output is not seen in the pipeline).
import { mkdirSync, writeFileSync } from "node:fs";

export function writeOut(name, text) {
  mkdirSync("tests/scene/out", { recursive: true });
  writeFileSync(`tests/scene/out/${name}`, text);
}
