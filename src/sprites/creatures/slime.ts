import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 24, H = 24, BODEN = 22;
const AUGE = hex("#1a1424");

export const slime = defineSprite({
  id: "slime", category: "creatures",
  title: { de: "Schleim", en: "Slime" },
  description: {
    de: "Ein Schleimwesen aus Pixeln, das wabbelt und hüpft: Farbe, Größe und Blick frei wählbar. 24 × 24 Pixel pro Bild, liegt auf der untersten Zeile auf.",
    en: "A pixel slime that wobbles and hops: colour, size and look as you like. 24 × 24 pixels per frame, resting on the bottom row.",
  },
  params: {
    color: { type: "color", default: "#5fbf5a", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Farbe des Schleims: Grün für den ersten Gegner, Blau für Wasser, Rot für Feuer.", en: "Colour of the slime: green for the first enemy, blue for water, red for fire." } },
    size: { type: "number", min: 0.5, max: 1, step: 0.05, default: 0.8, label: { de: "Größe", en: "Size" },
      describe: { de: "Wie groß er im Bild ist: 0,5 ein kleiner Schleim, 1 füllt die Breite des Bildes.", en: "How big it is in the frame: 0.5 a small slime, 1 fills the width of the frame." } },
    eyes: { type: "choice", options: ["round", "angry", "sleepy"], default: "round", label: { de: "Blick", en: "Look" },
      labels: { round: { de: "rund", en: "round" }, angry: { de: "wütend", en: "angry" }, sleepy: { de: "verschlafen", en: "sleepy" } },
      describe: { de: "Ausdruck der Augen: rund und harmlos, wütend für Gegner, verschlafen für friedliche Wesen.", en: "Look of the eyes: round and harmless, angry for enemies, sleepy for peaceful creatures." } },
    shine: { type: "boolean", default: true, label: { de: "Glanz", en: "Shine" },
      describe: { de: "Ein heller Glanzpunkt oben links, der ihn feucht wirken lässt.", en: "A bright highlight at the top left that makes it look wet." } },
  },
  presets: {
    "water-slime": { label: { de: "Wasser", en: "Water" }, values: { color: "#4a8fd8", eyes: "round", size: 0.75 } },
    "fire-slime": { label: { de: "Feuer", en: "Fire" }, values: { color: "#e0562e", eyes: "angry", size: 0.9 } },
    "king-slime": { label: { de: "König", en: "King" }, values: { color: "#8a5ad0", eyes: "sleepy", size: 1 } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 4, fps: 6, loop: true }, { name: "hop", frames: 6, fps: 10, loop: true }],
  grounded: true,
  build(p) {
    const r = ramp(p.color);
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      // squash and stretch: wider when it lands, taller when it rises
      const hoch = animation === "hop" ? [0, 3, 5, 5, 3, 0][f] : 0;
      const dehnen = animation === "hop" ? [-0.12, 0.12, 0.06, 0, 0.06, -0.12][f] : [0, 0.04, 0.08, 0.04][f];
      const rx = 9.4 * p.size * (1 - dehnen * (animation === "hop" ? 1 : -1)), ry = 7.4 * p.size * (1 + dehnen * (animation === "hop" ? 1 : -1));
      const unten = BODEN - hoch, cy = unten + 1 - ry;
      const koerper = new Pixels(W, H);
      koerper.ellipse(11.5 + 0.5, cy, rx, ry, r);
      // flat underside: nothing below the ground line
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (koerper.alpha(x, y) && y <= unten) b.set(x, y, koerper.get(x, y));
      const ay = Math.round(cy - ry * 0.05), ax = Math.max(2, Math.round(rx * 0.38));
      for (const s of [-1, 1]) {
        const x = 12 + s * ax - (s > 0 ? 1 : 0);
        if (p.eyes === "sleepy") b.rect(x - 1, ay, 2, 1, AUGE);
        else { b.rect(x, ay - 1, 1, 2, AUGE); if (p.eyes === "angry") b.set(x - s, ay - 2, AUGE); }
      }
      if (p.shine) { b.rect(Math.round(12 - rx * 0.55), Math.round(cy - ry * 0.55), 2, 1, ramp(r.light).light); b.set(Math.round(12 - rx * 0.55), Math.round(cy - ry * 0.55) + 1, r.light); }
      return b;
    };
  },
});
