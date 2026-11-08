// Scene tests in headless Chromium: the build (dist/) is served locally, every asset of the catalogue is shown at its
// defaults in test mode (?test&asset=<id>), its draw calls and triangles are checked against its budget and its image
// against tests/scene/baseline/<id>.png. Assets with procedural patterns are then baked for the export and rendered
// again: the baked texture has to look like the live TSL material (tests/scene/out/<id>.baked.png).
// Surfaces get their own checks (tiling, bake against live), see below.
// No network, no GPU: WebGL 2 through SwiftShader. A missing baseline is written and the test fails, so it gets committed
// on purpose. Results and diffs: tests/scene/out/.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const ordner = new URL(".", import.meta.url).pathname;
const dist = join(ordner, "../../dist");
const viewport = { width: 320, height: 240 };
const browser = [process.env.CHROME_PATH, "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"].find((p) => p && existsSync(p));
if (!browser) { console.error("No Chromium found: set CHROME_PATH (the swarvex threejs environment has it)."); process.exit(2); }
if (!existsSync(join(dist, "index.html"))) { console.error("No build: run `npm run build` first."); process.exit(2); }

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".wasm": "application/wasm", ".glb": "model/gltf-binary" };
const server = createServer((req, res) => {
  const pfad = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const datei = join(dist, pfad.endsWith("/") ? pfad + "index.html" : pfad);
  if (!datei.startsWith(dist) || !existsSync(datei)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(datei)] ?? "application/octet-stream" }).end(readFileSync(datei));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const basis = `http://127.0.0.1:${server.address().port}/`;

const chrome = await chromium.launch({ executablePath: browser, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--disable-dev-shm-usage"] });
const out = join(ordner, "out");
mkdirSync(out, { recursive: true });
mkdirSync(join(ordner, "baseline"), { recursive: true });
let fehler = 0;
// Gebacken gegen live: strenge Farbschwelle, sonst fällt eine falsch liegende Maserung nicht auf (gemessen: richtig
// höchstens 0,5 % der Pixel, gespiegelte Textur mindestens 2,5 %)
const BACKEN_SCHWELLE = 0.02, BACKEN_MAX = 1.5;
// Die Szenen sind die Assets des Katalogs, mit ihrem eigenen Budget
const katalog = await chrome.newPage({ viewport });
await katalog.goto(`${basis}?test`);
await katalog.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 60_000 });
const scenes = await katalog.evaluate(() => window.__formwerk.ids().map((id) => ({ name: id, query: `asset=${id}`, steps: 0, maxDiffPercent: 2, ...window.__formwerk.budget(id) })));
const flaechen = await katalog.evaluate(() => window.__formwerk.surfaces());
await katalog.close();
for (const s of scenes) {
  const page = await chrome.newPage({ viewport, deviceScaleFactor: 1 });
  const meldungen = [];
  page.on("pageerror", (e) => meldungen.push(`page error: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") meldungen.push(`console: ${m.text()}`); });
  const bericht = (text) => { console.log(`${s.name}: ${text}`); };
  try {
    await page.goto(`${basis}?test&${s.query ?? ""}`);
    await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 60_000 });
    const info = await page.evaluate((n) => window.__swarvex.step(n), s.steps ?? 1);
    // Budget des Assets selbst (der Renderer zählt einen Draw Call mehr: die Ausgabe auf den Bildschirm)
    const asset = await page.evaluate(() => window.__formwerk.measure());
    const bild = PNG.sync.read(await page.locator("canvas").screenshot());
    if (meldungen.length) { fehler++; bericht(`FAIL errors in the page\n  ${meldungen.join("\n  ")}`); }
    if (asset.drawCalls > s.drawCalls) { fehler++; bericht(`FAIL ${asset.drawCalls} draw calls, budget ${s.drawCalls}`); }
    if (asset.triangles > s.triangles) { fehler++; bericht(`FAIL ${asset.triangles} triangles, budget ${s.triangles}`); }
    writeFileSync(join(out, `${s.name}.png`), PNG.sync.write(bild));
    const basisDatei = join(ordner, "baseline", `${s.name}.png`);
    if (!existsSync(basisDatei)) {
      writeFileSync(basisDatei, PNG.sync.write(bild));
      fehler++;
      bericht("FAIL no baseline yet: written to tests/scene/baseline; check it and commit it");
    } else {
      const soll = PNG.sync.read(readFileSync(basisDatei));
      if (soll.width !== bild.width || soll.height !== bild.height) { fehler++; bericht("FAIL image size differs from the baseline"); }
      else {
        const diff = new PNG({ width: bild.width, height: bild.height });
        const n = pixelmatch(soll.data, bild.data, diff.data, bild.width, bild.height, { threshold: 0.15 });
        const prozent = (100 * n) / (bild.width * bild.height);
        writeFileSync(join(out, `${s.name}.diff.png`), PNG.sync.write(diff));
        if (prozent > (s.maxDiffPercent ?? 2)) { fehler++; bericht(`FAIL ${prozent.toFixed(2)} % of pixels differ from the baseline (allowed ${s.maxDiffPercent ?? 2} %), see tests/scene/out`); }
        else bericht(`ok · ${asset.drawCalls} draw calls · ${asset.triangles} triangles · ${prozent.toFixed(2)} % changed`);
      }
    }
    if (await page.evaluate(() => window.__formwerk.patterned())) {
      const b = await page.evaluate(() => window.__formwerk.bake());
      await page.evaluate(() => window.__swarvex.step(1));
      const gebacken = PNG.sync.read(await page.locator("canvas").screenshot());
      writeFileSync(join(out, `${s.name}.baked.png`), PNG.sync.write(gebacken));
      const n = pixelmatch(bild.data, gebacken.data, null, bild.width, bild.height, { threshold: BACKEN_SCHWELLE });
      const prozent = (100 * n) / (bild.width * bild.height);
      if (!b.textured) { fehler++; bericht("FAIL bake: no surface got the texture"); }
      else if (prozent > BACKEN_MAX) { fehler++; bericht(`FAIL bake: the baked texture differs from the live material in ${prozent.toFixed(2)} % of pixels (allowed ${BACKEN_MAX} %), see tests/scene/out/${s.name}.baked.png`); }
      else bericht(`baked ok · ${b.textured} textured meshes · ${b.ms} ms · ${prozent.toFixed(2)} % differ from the live material`);
      // Rundlauf: .glb exportieren, mit dem GLTFLoader laden, rendern; so sieht es in anderen Programmen aus
      const g = await page.evaluate(() => window.__formwerk.roundtrip());
      await page.evaluate(() => window.__swarvex.step(1));
      const geladen = PNG.sync.read(await page.locator("canvas").screenshot());
      writeFileSync(join(out, `${s.name}.glb.png`), PNG.sync.write(geladen));
      const m = pixelmatch(bild.data, geladen.data, null, bild.width, bild.height, { threshold: BACKEN_SCHWELLE });
      const p2 = (100 * m) / (bild.width * bild.height);
      if (!g.images || p2 > BACKEN_MAX) { fehler++; bericht(`FAIL glb round trip: ${g.images} textured meshes, ${p2.toFixed(2)} % of pixels differ from the live material (allowed ${BACKEN_MAX} %), see tests/scene/out/${s.name}.glb.png`); }
      else bericht(`glb ok · ${Math.round(g.bytes / 1024)} KB · ${p2.toFixed(2)} % differ after export and reload`);
    }
  } catch (e) {
    fehler++;
    bericht(`FAIL ${e.message}${meldungen.length ? `\n  ${meldungen.join("\n  ")}` : ""}`);
  }
  await page.close();
}

// Surfaces: one tile live (TSL) against its reference render, the maps at 256 pixels against their reference image,
// that they tile (baked half a tile further on = the same picture rolled by half), that the bake is deterministic, and
// that the plane with the baked PNG maps looks like the live material (texture filtering differs a little from the
// per-pixel shader, so a looser colour threshold than for models; a flipped or shifted map differs by far more).
const vergleichen = (bild, name, schwelle, erlaubt, bericht) => {
  writeFileSync(join(out, `${name}.png`), PNG.sync.write(bild));
  const basisDatei = join(ordner, "baseline", `${name}.png`);
  if (!existsSync(basisDatei)) { writeFileSync(basisDatei, PNG.sync.write(bild)); bericht(`FAIL no baseline yet for ${name}: written to tests/scene/baseline; check it and commit it`); return false; }
  const soll = PNG.sync.read(readFileSync(basisDatei));
  if (soll.width !== bild.width || soll.height !== bild.height) { bericht(`FAIL ${name}: image size differs from the baseline`); return false; }
  const diff = new PNG({ width: bild.width, height: bild.height });
  const prozent = (100 * pixelmatch(soll.data, bild.data, diff.data, bild.width, bild.height, { threshold: schwelle })) / (bild.width * bild.height);
  writeFileSync(join(out, `${name}.diff.png`), PNG.sync.write(diff));
  if (prozent > erlaubt) { bericht(`FAIL ${name}: ${prozent.toFixed(2)} % of pixels differ from the baseline (allowed ${erlaubt} %), see tests/scene/out`); return false; }
  bericht(`${name} ok · ${prozent.toFixed(2)} % changed`);
  return true;
};
const KACHEL_MAX = 0.001, LIVE_GEBACKEN_SCHWELLE = 0.1, LIVE_GEBACKEN_MAX = 2.5;
for (const id of flaechen) {
  const page = await chrome.newPage({ viewport, deviceScaleFactor: 1 });
  const meldungen = [];
  page.on("pageerror", (e) => meldungen.push(`page error: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") meldungen.push(`console: ${m.text()}`); });
  const bericht = (text) => { console.log(`${id}: ${text}`); };
  try {
    await page.goto(`${basis}?test&surface=${id}`);
    await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 120_000 });
    await page.evaluate(() => window.__swarvex.step(1));
    const live = PNG.sync.read(await page.locator("canvas").screenshot());
    if (!vergleichen(live, id, 0.15, 2, bericht)) fehler++;
    const k = await page.evaluate(() => window.__surface.maps(256));
    if (!vergleichen(PNG.sync.read(Buffer.from(k.image.split(",")[1], "base64")), `${id}.maps`, 0.1, 1, bericht)) fehler++;
    const farbe = k.stats.find((x) => x.map === "color"), hoehe = k.stats.find((x) => x.map === "height");
    if (farbe.mean < 0.04 || farbe.mean > 0.96) { fehler++; bericht(`FAIL colour map is almost black or white (mean ${farbe.mean.toFixed(2)})`); }
    if (hoehe.max - hoehe.min < 0.05) { fehler++; bericht("FAIL height map is flat: a surface needs relief for its normal map"); }
    const kacheln = await page.evaluate(() => window.__surface.tiles(128));
    const schlecht = Object.entries(kacheln).filter(([, v]) => v > KACHEL_MAX);
    if (schlecht.length) { fehler++; bericht(`FAIL does not tile: ${schlecht.map(([m, v]) => `${m} ${(100 * v).toFixed(2)} %`).join(", ")} of pixels differ when baked half a tile further on`); }
    else bericht("tiles ok · every map repeats after one tile");
    if (!(await page.evaluate(() => window.__surface.deterministic()))) { fehler++; bericht("FAIL the bake is not deterministic"); }
    const b = await page.evaluate(() => window.__surface.baked());
    await page.evaluate(() => window.__swarvex.step(1));
    const gebacken = PNG.sync.read(await page.locator("canvas").screenshot());
    writeFileSync(join(out, `${id}.baked.png`), PNG.sync.write(gebacken));
    const p = (100 * pixelmatch(live.data, gebacken.data, null, live.width, live.height, { threshold: LIVE_GEBACKEN_SCHWELLE })) / (live.width * live.height);
    if (p > LIVE_GEBACKEN_MAX) { fehler++; bericht(`FAIL bake: the plane with the PNG maps differs from the live material in ${p.toFixed(2)} % of pixels (allowed ${LIVE_GEBACKEN_MAX} %), see tests/scene/out/${id}.baked.png`); }
    else bericht(`baked ok · maps at 1024 in ${b.ms} ms · ${p.toFixed(2)} % differ from the live material`);
    if (meldungen.length) { fehler++; bericht(`FAIL errors in the page\n  ${meldungen.join("\n  ")}`); }
  } catch (e) {
    fehler++;
    bericht(`FAIL ${e.message}${meldungen.length ? `\n  ${meldungen.join("\n  ")}` : ""}`);
  }
  await page.close();
}

await chrome.close();
server.close();
process.exit(fehler ? 1 : 0);
