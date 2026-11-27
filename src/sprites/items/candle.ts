import { hex, Pixels, ramp } from "../../core/pixels";
import { rng } from "../../core/rng";
import { defineSprite } from "../define";

const W = 16, H = 16;
const ZINN = ramp("#9aa0aa"), DOCHT = hex("#2a2026"), RAUCH = ramp("#c4c2cc"), GLUT = hex("#fff6d0");

export const candle = defineSprite({
  id: "candle", category: "items",
  title: { de: "Kerze", en: "Candle" },
  description: {
    de: "Eine Wachskerze als Pixel-Symbol für Inventar, Tische, Schreine und Apotheken: Höhe, Dicke, Halter und Wachstropfen frei wählbar; brennend flackert die Flamme im Idle-Loop, gelöscht steigt ein Rauchfaden auf. 16 × 16 Pixel.",
    en: "A wax candle as a pixel icon for inventories, tables, shrines and apothecaries: height, girth, holder and drips as you like; lit, the flame flickers in the idle loop, snuffed, a wisp of smoke rises. 16 × 16 pixels.",
  },
  params: {
    height: { type: "integer", min: 3, max: 8, default: 6, label: { de: "Höhe", en: "Height" },
      describe: { de: "Höhe des Wachses in Pixelzeilen: 3 ein heruntergebrannter Stummel, 6 üblich, 8 eine frische, hohe Kerze.", en: "Height of the wax in pixel rows: 3 a stub burnt down, 6 usual, 8 a fresh tall candle." } },
    girth: { type: "choice", options: ["taper", "pillar"], default: "taper", label: { de: "Dicke", en: "Girth" },
      labels: { taper: { de: "schlanke Stabkerze", en: "taper" }, pillar: { de: "Stumpenkerze", en: "pillar" } },
      describe: { de: "Dicke der Kerze: eine schlanke Stabkerze (2 Pixel breit) für Leuchter, oder eine dicke Stumpenkerze (4 Pixel) für Schreine und Tische.", en: "Girth of the candle: a slim taper (2 pixels wide) for candlesticks, or a thick pillar (4 pixels) for shrines and tables." } },
    holder: { type: "choice", options: ["none", "dish", "chamberstick"], default: "dish", label: { de: "Halter", en: "Holder" },
      labels: { none: { de: "ohne", en: "none" }, dish: { de: "Teller", en: "dish" }, chamberstick: { de: "Kerzenhalter mit Griff", en: "chamberstick" } },
      describe: { de: "Worauf die Kerze steht: ohne Halter, auf einem Zinnteller (10 Pixel breit), oder in einem Kerzenhalter mit Ringgriff zum Tragen.", en: "What the candle stands on: no holder, a pewter dish (10 pixels wide), or a chamberstick with a ring handle for carrying." } },
    drips: { type: "integer", min: 0, max: 3, default: 1, label: { de: "Tropfen", en: "Drips" },
      describe: { de: "Wachsläufe an den Seiten, je 1 bis 3 Pixel lang: 0 eine neue Kerze, 1 üblich, 3 eine lange gebrannte.", en: "Runs of wax down the sides, 1 to 3 pixels long each: 0 a new candle, 1 usual, 3 one that has burnt for long." } },
    lit: { type: "boolean", default: true, label: { de: "Brennt", en: "Lit" },
      describe: { de: "An: eine flackernde Flamme über dem Docht. Aus: gelöscht, ein dünner Rauchfaden steigt auf.", en: "On: a flickering flame above the wick. Off: snuffed, a thin wisp of smoke rises." } },
    wax: { type: "color", default: "#efe6cf", label: { de: "Wachs", en: "Wax" },
      describe: { de: "Farbe des Wachses: Elfenbein #efe6cf, Bienenwachs #d9a441, Rot #b0302a.", en: "Colour of the wax: ivory #efe6cf, beeswax #d9a441, red #b0302a." } },
    fire: { type: "color", default: "#ff9a2a", label: { de: "Feuer", en: "Fire" },
      describe: { de: "Farbe der Flamme: Orange #ff9a2a für Feuer, Blau #3f8cff für Magie, Grün #4fd35a für Geister.", en: "Colour of the flame: orange #ff9a2a for fire, blue #3f8cff for magic, green #4fd35a for ghosts." } },
  },
  presets: {
    taper: { label: { de: "Stabkerze", en: "Taper" }, values: { height: 8, holder: "none", drips: 0 } },
    chamberstick: { label: { de: "Kerzenhalter", en: "Chamberstick" }, values: { holder: "chamberstick", height: 4, drips: 2 } },
    pillar: { label: { de: "Stumpenkerze", en: "Pillar" }, values: { girth: "pillar", height: 6, wax: "#d9a441" } },
    snuffed: { label: { de: "Gelöscht", en: "Snuffed" }, values: { lit: false } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p, seed) {
    const wachs = ramp(p.wax), feuer = ramp(p.fire);
    const links = p.girth === "pillar" ? 6 : 7, breit = p.girth === "pillar" ? 4 : 2, rechts = links + breit - 1;
    const unten = p.holder === "none" ? 14 : 12, oben = unten - p.height + 1, docht = oben - 1, dx = 8;
    // drips: alternating sides, start and length from the seed, never below the wax
    const r = rng(seed), seite0 = r() < 0.5 ? 0 : 1;
    const laeufe = Array.from({ length: p.drips }, (_, i) => {
      const x = (i + seite0) % 2 === 0 ? links - 1 : rechts + 1, y = oben + Math.floor(r() * Math.min(3, p.height - 1));
      return { x, y, n: Math.min(1 + Math.floor(r() * 3), unten - y + 1) };
    });
    return (_a, _d, f) => {
      const b = new Pixels(W, H);
      // the holder: a pewter dish, and for the chamberstick a ring handle on the right
      if (p.holder !== "none") {
        b.rect(3, 13, 10, 1, ZINN.light); b.set(3, 13, ZINN.base); b.set(12, 13, ZINN.dark);
        b.rect(4, 14, 8, 1, ZINN.dark);
        if (p.holder === "chamberstick") { b.set(13, 13, ZINN.base); b.set(14, 12, ZINN.base); b.set(13, 11, ZINN.light); }
      }
      // the wax: light column on the left, dark on the right, a melted pool on top while lit
      for (let y = oben; y <= unten; y++) for (let x = links; x <= rechts; x++)
        b.set(x, y, x === links ? wachs.light : x === rechts && breit > 2 ? wachs.dark : wachs.base);
      if (p.lit) for (let x = links + 1; x <= rechts - (breit > 2 ? 1 : 0); x++) b.set(x, oben, wachs.dark);
      for (const l of laeufe) b.rect(l.x, l.y, 1, l.n, l.x < links ? wachs.light : wachs.base);
      b.set(dx, docht, DOCHT);
      if (p.lit) {
        // the flame: hottest at the base, the tip sways by a pixel, every other frame one row shorter; never on row 0
        const hoch = Math.min(4 - (f % 2), docht - 1), schwanken = [0, 1, 0, -1][f];
        for (let k = 0; k < hoch; k++) {
          const y = docht - 1 - k;
          if (k === hoch - 1 && hoch > 1) b.set(dx + schwanken, y, feuer.base);
          else if (k === 0) { b.set(dx - 1, y, feuer.light); b.set(dx, y, GLUT); b.set(dx + 1, y, feuer.light); }
          else if (k === 1) { b.set(dx - 1, y, feuer.base); b.set(dx, y, feuer.light); b.set(dx + 1, y, feuer.dark); }
          else b.set(dx, y, feuer.light);
        }
      } else {
        // the smoke: three grey pixels rising from the wick, the top one swaying to either side, lifted every other frame; clipped at row 1
        for (let k = 0; k < 3; k++) {
          const y = docht - 1 - k - (f % 2), x = dx + (k === 2 ? (f < 2 ? 1 : -1) : 0);
          if (y >= 1) b.set(x, y, k === 0 ? RAUCH.dark : k === 1 ? RAUCH.base : RAUCH.light);
        }
      }
      return b;
    };
  },
});
