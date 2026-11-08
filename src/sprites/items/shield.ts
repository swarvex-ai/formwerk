import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const shield = defineSprite({
  id: "shield", category: "items",
  title: { de: "Schild", en: "Shield" },
  description: {
    de: "Ein Schild als Pixel-Symbol für Rüstung und Verteidigung: Rundschild, Wappenschild oder Drachenschild, mit Wappen und Metallrand. 16 × 16 Pixel.",
    en: "A shield as a pixel icon for armour and defence: a round shield, a heater or a kite shield, with an emblem and a metal rim. 16 × 16 pixels.",
  },
  params: {
    shape: { type: "choice", options: ["heater", "round", "kite"], default: "heater", label: { de: "Form", en: "Shape" },
      labels: { heater: { de: "Wappenschild", en: "heater" }, round: { de: "rund", en: "round" }, kite: { de: "Drachenschild", en: "kite" } },
      describe: { de: "Wappenschild mit Spitze unten, runder Schild, langer Drachenschild.", en: "A heater with a point at the bottom, a round shield, a long kite shield." } },
    color: { type: "color", default: "#3a5fa8", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe der Schildfläche.", en: "Colour of the shield's face." } },
    emblem: { type: "choice", options: ["cross", "stripe", "dot", "none"], default: "cross", label: { de: "Wappen", en: "Emblem" },
      labels: { cross: { de: "Kreuz", en: "cross" }, stripe: { de: "Schrägbalken", en: "bend" }, dot: { de: "Buckel", en: "boss" }, none: { de: "keins", en: "none" } },
      describe: { de: "Kreuz, Schrägbalken, ein Buckel in der Mitte oder schlicht.", en: "A cross, a diagonal band, a boss in the middle, or plain." } },
    emblemColor: { type: "color", default: "#e8c547", label: { de: "Wappenfarbe", en: "Emblem colour" },
      describe: { de: "Farbe von Wappen und Rand.", en: "Colour of the emblem and the rim." } },
  },
  presets: {
    knight: { label: { de: "Ritter", en: "Knight" }, values: { shape: "heater", emblem: "cross" } },
    viking: { label: { de: "Rundschild", en: "Round shield" }, values: { shape: "round", emblem: "dot", color: "#8a5a33", emblemColor: "#9aa3ad" } },
    guard: { label: { de: "Wache", en: "Guard" }, values: { shape: "kite", emblem: "stripe", color: "#a83a3a", emblemColor: "#f1e6d0" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const f = ramp(p.color), e = ramp(p.emblemColor), weiss = hex("#ffffff");
    // Half width of the shield per row (rows 1 to 14), centred between pixels 7 and 8
    const breite = (y: number): number => {
      if (p.shape === "round") { const dy = y + 0.5 - 8; return Math.sqrt(Math.max(0, 6.6 * 6.6 - dy * dy)); }
      if (p.shape === "heater") return y < 2 ? 0 : y <= 8 ? 6 : 6 * Math.cos(((y - 8) / 6.5) * (Math.PI / 2)) ** 0.8;
      return y < 1 ? 0 : y <= 5 ? 4 + (y - 1) * 0.4 : 5.6 * (1 - (y - 5) / 10);
    };
    return (animation, _d, n) => {
      const b = new Pixels(W, H);
      for (let y = 1; y <= 14; y++) {
        const w = Math.round(breite(y));
        if (w < 1) continue;
        for (let x = 8 - w; x < 8 + w; x++) {
          const rand = x === 8 - w || x === 8 + w - 1 || Math.round(breite(y - 1)) < Math.abs(x + 0.5 - 8) + 0.5 || Math.round(breite(y + 1)) < Math.abs(x + 0.5 - 8) + 0.5;
          let c = rand ? e.dark : x < 8 - w + 2 ? f.light : x >= 8 + w - 2 ? f.dark : f.base;
          if (!rand) {
            if (p.emblem === "cross" && (x === 7 || x === 8 || y === 6 || y === 7)) c = e.base;
            if (p.emblem === "stripe" && Math.abs(x - y + 1) <= 1) c = e.base;
            if (p.emblem === "dot" && (x + 0.5 - 8) ** 2 + (y + 0.5 - 8) ** 2 < 5) c = (x + 0.5 - 8) + (y + 0.5 - 8) < -1 ? e.light : e.base;
          }
          b.set(x, y, c);
        }
      }
      // A glint sweeping across the top left of the face
      if (animation === "shine") { const x = 4 + n, y = 3 + n; if (b.alpha(x, y)) b.set(x, y, weiss); }
      else b.set(4, 3, f.light);
      return b;
    };
  },
});
