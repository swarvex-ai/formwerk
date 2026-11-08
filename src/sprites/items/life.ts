import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const life = defineSprite({
  id: "life", category: "items",
  title: { de: "Herz (Leben)", en: "Heart (life)" },
  description: {
    de: "Ein Herz als Pixel-Symbol für Lebenspunkte und Heilung: voll, halb oder leer, mit Herzschlag. 16 × 16 Pixel.",
    en: "A heart as a pixel icon for life points and healing: full, half or empty, with a heartbeat. 16 × 16 pixels.",
  },
  params: {
    fill: { type: "choice", options: ["full", "half", "empty"], default: "full", label: { de: "Füllung", en: "Fill" },
      labels: { full: { de: "voll", en: "full" }, half: { de: "halb", en: "half" }, empty: { de: "leer", en: "empty" } },
      describe: { de: "Voll, halb (linke Hälfte) oder leer, für eine Lebensleiste aus Herzen.", en: "Full, half (left half) or empty, for a life bar made of hearts." } },
    color: { type: "color", default: "#e0304a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Rot #e0304a für Leben, Blau #3f78e0 für Schild, Gold #f0c419 für Bonus.", en: "Red #e0304a for life, blue #3f78e0 for shield, gold #f0c419 for bonus." } },
    size: { type: "integer", min: 5, max: 7, default: 6, label: { de: "Größe", en: "Size" },
      describe: { de: "Halbe Breite in Pixeln: 5 klein, 7 groß.", en: "Half the width in pixels: 5 small, 7 big." } },
  },
  presets: {
    full: { label: { de: "Voll", en: "Full" }, values: { fill: "full" } },
    half: { label: { de: "Halb", en: "Half" }, values: { fill: "half" } },
    empty: { label: { de: "Leer", en: "Empty" }, values: { fill: "empty" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "beat", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const c0 = ramp(p.color), leer = ramp("#4a3a4e"), weiss = hex("#ffffff");
    return (animation, _d, f) => {
      const b = new Pixels(W, H), s = Math.min(7, p.size + (animation === "beat" && f === 1 ? 1 : 0) - (animation === "beat" && f === 3 ? 1 : 0));
      // Two round lobes and a point below them, sampled at the pixel centres
      const a2 = s / 2, R = s / 2 + 0.4, c = 5.5, spitze = c + s + 1, breit = a2 + R * 0.95;
      for (let y = 1; y <= 14; y++) for (let x = 1; x <= 14; x++) {
        const px = x + 0.5, py = y + 0.5;
        const lappen = (px - (8 - a2)) ** 2 + (py - c) ** 2 <= R * R || (px - (8 + a2)) ** 2 + (py - c) ** 2 <= R * R;
        const unten = py >= c && Math.abs(px - 8) <= ((spitze - py) * breit) / (spitze - c);
        if (!lappen && !unten) continue;
        const voll = p.fill === "full" || (p.fill === "half" && x < 8), r = voll ? c0 : leer;
        const rand = (px - 8) * 0.55 + (py - c) * 0.75 > s * 0.62;
        b.set(x, y, rand ? r.dark : px < 8 - a2 + 0.5 && py < c + 0.5 ? r.light : r.base);
      }
      if (p.fill !== "empty") b.set(8 - Math.round(s * 0.6), 4, weiss);
      return b;
    };
  },
});
