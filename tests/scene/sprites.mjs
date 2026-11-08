// Reference sheets of the sprites: every sprite at its defaults (seed 1) as its sheet. Pixel art is drawn on the CPU,
// so the sheet must match its reference exactly; a changed pixel is a change someone has to look at. They live next
// to the other reference images (tests/scene/baseline/<id>.png). A missing reference is written and the test fails,
// so it gets committed on purpose. Results and diffs: tests/scene/out/.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const wurzel = fileURLToPath(new URL("../..", import.meta.url)), ordner = fileURLToPath(new URL(".", import.meta.url));
const laden = async (pfad) => (await runnerImport(pfad, { root: wurzel, configFile: false, logLevel: "error" })).module;
const { SPRITES } = await laden("/src/sprites/index.ts");
const { makeSheet } = await laden("/src/sprites/define.ts");
mkdirSync(`${ordner}out`, { recursive: true });
mkdirSync(`${ordner}baseline`, { recursive: true });
let fehler = 0;
for (const s of SPRITES) {
  const sheet = makeSheet(s), bild = new PNG({ width: sheet.image.w, height: sheet.image.h });
  bild.data.set(sheet.image.data);
  writeFileSync(`${ordner}out/${s.id}.png`, PNG.sync.write(bild));
  const basis = `${ordner}baseline/${s.id}.png`;
  if (!existsSync(basis)) {
    writeFileSync(basis, PNG.sync.write(bild));
    fehler++;
    console.log(`${s.id}: FAIL no reference sheet yet: written to tests/scene/baseline; look at it and commit it`);
    continue;
  }
  const soll = PNG.sync.read(readFileSync(basis));
  if (soll.width !== bild.width || soll.height !== bild.height) { fehler++; console.log(`${s.id}: FAIL the sheet is ${bild.width} × ${bild.height}, the reference ${soll.width} × ${soll.height}`); continue; }
  const diff = new PNG({ width: bild.width, height: bild.height });
  const n = pixelmatch(soll.data, bild.data, diff.data, bild.width, bild.height, { threshold: 0, includeAA: true });
  writeFileSync(`${ordner}out/${s.id}.diff.png`, PNG.sync.write(diff));
  if (n > 0) { fehler++; console.log(`${s.id}: FAIL ${n} pixels of the sheet changed, see tests/scene/out/${s.id}.png`); }
  else console.log(`${s.id}: sheet ok · same pixels as the reference`);
}
process.exit(fehler ? 1 : 0);
