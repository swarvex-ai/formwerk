// Reference sheets of the icons, and the SVG against the pixels. Every icon at its defaults and presets in the three
// styles (96 px, with a 24 px copy beside each) is drawn on the CPU, so its sheet must match its reference exactly
// (tests/scene/baseline/<id>.png). Then headless Chromium draws the SVG text of the same drawings: a browser has to see
// the same icon as the PNG files (masks, caps, joins, even-odd fill), up to the edges of anti-aliasing. A missing
// reference is written and the test fails, so it gets committed on purpose. Results and diffs: tests/scene/out/.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { runnerImport } from "vite";
import { chromium } from "playwright-core";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { only } from "../only.mjs";

const wurzel = fileURLToPath(new URL("../..", import.meta.url)), ordner = fileURLToPath(new URL(".", import.meta.url));
const laden = async (pfad) => (await runnerImport(pfad, { root: wurzel, configFile: false, logLevel: "error" })).module;
const { ICONS } = await laden("/src/icons/index.ts");
const { makeIcon } = await laden("/src/icons/define.ts");
const browser = [process.env.CHROME_PATH, "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"].find((p) => p && existsSync(p));
if (!browser) { console.error("No Chromium found: set CHROME_PATH (the swarvex threejs environment has it)."); process.exit(2); }
mkdirSync(`${ordner}out`, { recursive: true });
mkdirSync(`${ordner}baseline`, { recursive: true });

const STILE = ["outline", "duotone", "filled"], G = 96, K = 24, ZELLE = G + K + 12;
// Over white: the colour of a pixel is 255 minus its coverage
const aufWeiss = (bild, px, ox, oy) => {
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) {
    const [r, g, b, a] = px.get(x, y), i = ((oy + y) * bild.width + ox + x) * 4;
    bild.data[i] = Math.round(255 + (r - 255) * a / 255); bild.data[i + 1] = Math.round(255 + (g - 255) * a / 255); bild.data[i + 2] = Math.round(255 + (b - 255) * a / 255); bild.data[i + 3] = 255;
  }
};

const chrome = await chromium.launch({ executablePath: browser, args: ["--disable-dev-shm-usage"] });
let fehler = 0;
for (const icon of only(ICONS)) {
  const zeilen = [{}, ...Object.keys(icon.presets).map((preset) => ({ preset }))];
  // The reference sheet: one row per look, one column per style
  const blatt = new PNG({ width: STILE.length * ZELLE, height: zeilen.length * (G + 8) });
  blatt.data.fill(255);
  zeilen.forEach((werte, z) => STILE.forEach((style, s) => {
    const m = makeIcon(icon, { ...werte, style, color: "#000000" });
    aufWeiss(blatt, m.pixels(G), s * ZELLE + 4, z * (G + 8) + 4);
    aufWeiss(blatt, m.pixels(K), s * ZELLE + G + 8, z * (G + 8) + 4);
  }));
  writeFileSync(`${ordner}out/${icon.id}.png`, PNG.sync.write(blatt));
  const basis = `${ordner}baseline/${icon.id}.png`;
  if (!existsSync(basis)) {
    writeFileSync(basis, PNG.sync.write(blatt));
    fehler++;
    console.log(`${icon.id}: FAIL no reference sheet yet: written to tests/scene/baseline; look at it and commit it`);
  } else {
    const soll = PNG.sync.read(readFileSync(basis));
    if (soll.width !== blatt.width || soll.height !== blatt.height) { fehler++; console.log(`${icon.id}: FAIL the sheet is ${blatt.width} × ${blatt.height}, the reference ${soll.width} × ${soll.height}`); }
    else {
      const diff = new PNG({ width: blatt.width, height: blatt.height });
      const n = pixelmatch(soll.data, blatt.data, diff.data, blatt.width, blatt.height, { threshold: 0, includeAA: true });
      writeFileSync(`${ordner}out/${icon.id}.diff.png`, PNG.sync.write(diff));
      if (n > 0) { fehler++; console.log(`${icon.id}: FAIL ${n} pixels of the sheet changed, see tests/scene/out/${icon.id}.png`); }
      else console.log(`${icon.id}: sheet ok · same pixels as the reference`);
    }
  }

  // The SVG in a browser against the pixels: every style with round and sharp corners, at defaults and presets
  const faelle = zeilen.flatMap((w) => STILE.flatMap((style) => ["round", "sharp"].map((corners) => ({ ...w, style, corners, color: "#000000" }))));
  const page = await chrome.newPage({ viewport: { width: faelle.length * G, height: G }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><body style="margin:0;background:#fff;color:#000;display:flex">${faelle.map((w) => `<div style="width:${G}px;height:${G}px">${makeIcon(icon, w).svg(G)}</div>`).join("")}</body>`);
  const gesehen = PNG.sync.read(await page.screenshot());
  await page.close();
  const erwartet = new PNG({ width: gesehen.width, height: G });
  erwartet.data.fill(255);
  faelle.forEach((w, i) => aufWeiss(erwartet, makeIcon(icon, w).pixels(G), i * G, 0));
  const diff = new PNG({ width: gesehen.width, height: G });
  // Anti-aliasing differs at the edges; a wrong mask, cap or join changes whole areas
  const n = pixelmatch(erwartet.data, gesehen.data, diff.data, gesehen.width, G, { threshold: 0.3 });
  writeFileSync(`${ordner}out/${icon.id}.svg.png`, PNG.sync.write(gesehen));
  writeFileSync(`${ordner}out/${icon.id}.svg.diff.png`, PNG.sync.write(diff));
  const anteil = (n / (gesehen.width * G)) * 100;
  if (anteil > 0.5) { fehler++; console.log(`${icon.id}: FAIL the browser draws the SVG differently: ${anteil.toFixed(2)} % of the pixels, see tests/scene/out/${icon.id}.svg.png`); }
  else console.log(`${icon.id}: svg ok · the browser draws what the pixels show (${anteil.toFixed(2)} % differ at the edges)`);
}
await chrome.close();
process.exit(fehler ? 1 : 0);
