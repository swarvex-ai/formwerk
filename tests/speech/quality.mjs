// Quality test of speech, on a developer machine with a GPU and network (not in CI: it downloads Kokoro and Whisper,
// about 170 MB, from Hugging Face; the browser profile in .cache/speech-test keeps them). Every voice speaks lines;
// Whisper writes back what it heard. Checks: the words match (word error rate), level at −1 dBFS, clean edges, a
// sensible speaking rate. Writes every line as WAV to tests/speech/out/ so a person can listen, and a summary.
// Run: npm run build && node tests/speech/quality.mjs
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { chromium } from "playwright-core";

const ordner = new URL(".", import.meta.url).pathname, dist = join(ordner, "../../dist"), out = join(ordner, "out");
mkdirSync(out, { recursive: true });
const browser = [process.env.CHROME_PATH, "/usr/bin/chromium", "/usr/bin/google-chrome"].find((p) => p && existsSync(p));
if (!browser) { console.error("No Chromium: set CHROME_PATH."); process.exit(2); }
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css" };
const server = createServer((req, res) => {
  const pfad = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const datei = join(dist, pfad.endsWith("/") ? pfad + "index.html" : pfad);
  if (!datei.startsWith(dist) || !existsSync(datei)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": TYPES[extname(datei)] ?? "application/octet-stream" }).end(readFileSync(datei));
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));

const ZEILEN = [
  "Halt! Who goes there? State your name and business.",
  "Welcome, traveller! Fresh bread, sharp swords, and potions for every ache.",
  "Mission complete. Returning to base in ten seconds.",
];
const STIMMEN = ["af_heart", "af_bella", "af_nicole", "am_michael", "am_fenrir", "am_puck", "bf_emma", "bm_george"];
const woerter = (t) => t.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").split(/\s+/).filter(Boolean).map((w) => ({ ten: "10", traveller: "traveler", holt: "halt" }[w] ?? w));
function wer(soll, ist) {
  const a = woerter(soll), b = woerter(ist), d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length] / a.length;
}

const profil = join(ordner, "../../.cache/speech-test");
const ctx = await chromium.launchPersistentContext(profil, { executablePath: browser, headless: true,
  args: ["--use-angle=vulkan", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-webgpu", "--enable-features=Vulkan,WebGPU"] });
const page = await ctx.newPage();
const fehlerSeite = [];
page.on("pageerror", (e) => fehlerSeite.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/?test&speech`);
await page.waitForFunction(() => document.body.dataset.ready === "1", null, { timeout: 600_000 });
let fehler = 0, n = 0;
const zeilen = [];
for (const stimme of STIMMEN) for (const [i, zeile] of ZEILEN.entries()) {
  if ((i + STIMMEN.indexOf(stimme)) % 2 && stimme !== "af_heart") continue; // every voice two or three lines, af_heart all
  const r = await page.evaluate(([t, v]) => window.__speech.speak(t, v, 1), [zeile, stimme]);
  writeFileSync(join(out, `${stimme}-${i + 1}.wav`), Buffer.from(r.wav, "base64"));
  const w = wer(zeile, r.heard), rate = woerter(zeile).length / r.seconds, probleme = [];
  if (w > 0.2) probleme.push(`word error rate ${(100 * w).toFixed(0)} %`);
  if (r.peakDb > -0.9 || r.peakDb < -1.1) probleme.push(`peak ${r.peakDb.toFixed(2)} dBFS`);
  if (Math.abs(r.first) + Math.abs(r.last) > 0.01) probleme.push("edges not at zero");
  if (rate < 1.2 || rate > 4.5) probleme.push(`${rate.toFixed(1)} words per second`);
  if (probleme.length) fehler++;
  n++;
  zeilen.push(`${probleme.length ? "FAIL" : "ok  "} ${stimme.padEnd(10)} ${r.seconds.toFixed(2)} s in ${(r.ms / 1000).toFixed(1)} s · WER ${(100 * w).toFixed(0)} % · heard: "${r.heard}"${probleme.length ? " · " + probleme.join(", ") : ""}`);
  console.log(zeilen.at(-1));
}
if (fehlerSeite.length) { fehler++; console.log("FAIL page errors:\n  " + fehlerSeite.join("\n  ")); }
writeFileSync(join(out, "summary.txt"), zeilen.join("\n") + "\n");
console.log(`${n - fehler} of ${n} lines ok · WAV files in tests/speech/out/`);
await ctx.close();
server.close();
process.exit(fehler ? 1 : 0);
