// Reference spectrograms of the sounds: every sound at its defaults (seed 1) as an image, time to the right, frequency
// up, level as colour. They live next to the scene images of the models (tests/scene/baseline/<id>.png), so reviewers
// see what changed in a sound the same way they see a changed model: agents cannot listen. A missing reference is
// written and the test fails, so it gets committed on purpose. Results and diffs: tests/scene/out/.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const wurzel = fileURLToPath(new URL("../..", import.meta.url)), ordner = fileURLToPath(new URL(".", import.meta.url));
const laden = async (pfad) => (await runnerImport(pfad, { root: wurzel, configFile: false, logLevel: "error" })).module;
const { SOUNDS } = await laden("/src/sounds/index.ts");
const { makeSound } = await laden("/src/sounds/define.ts");
const { spectrogram } = await laden("/src/core/audio.ts");
const width = 384, height = 160, ERLAUBT = 0.5;
mkdirSync(`${ordner}out`, { recursive: true });
mkdirSync(`${ordner}baseline`, { recursive: true });
let fehler = 0;
for (const s of SOUNDS) {
  const bild = new PNG({ width, height });
  bild.data.set(spectrogram(makeSound(s).samples, width, height));
  writeFileSync(`${ordner}out/${s.id}.png`, PNG.sync.write(bild));
  const basis = `${ordner}baseline/${s.id}.png`;
  if (!existsSync(basis)) {
    writeFileSync(basis, PNG.sync.write(bild));
    fehler++;
    console.log(`${s.id}: FAIL no reference spectrogram yet: written to tests/scene/baseline; look at it and commit it`);
    continue;
  }
  const soll = PNG.sync.read(readFileSync(basis)), diff = new PNG({ width, height });
  const n = pixelmatch(soll.data, bild.data, diff.data, width, height, { threshold: 0.1 });
  writeFileSync(`${ordner}out/${s.id}.diff.png`, PNG.sync.write(diff));
  const prozent = (100 * n) / (width * height);
  if (prozent > ERLAUBT) { fehler++; console.log(`${s.id}: FAIL ${prozent.toFixed(2)} % of the spectrogram changed (allowed ${ERLAUBT} %), see tests/scene/out/${s.id}.png`); }
  else console.log(`${s.id}: spectrogram ok · ${prozent.toFixed(2)} % changed`);
}
process.exit(fehler ? 1 : 0);
