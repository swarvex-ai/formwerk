import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const SCHAUM = ramp("#f4f0e0"), KORK = ramp("#a67c52"), DAMPF = ramp("#e8e8f0"), GLANZ = hex("#ffffff");

export const drinks = defineSprite({
  id: "drinks", category: "items",
  title: { de: "Getränke", en: "Drinks" },
  description: {
    de: "Ein Getränk als Pixel-Symbol für Inventar, Laden und Taverne: Humpen, Flasche, Kelch oder Tasse in zwei Größen, voll oder leer, mit Glanz, der über das Gefäß wandert. 16 × 16 Pixel.",
    en: "A drink as a pixel icon for inventories, shops and taverns: mug, bottle, goblet or cup in two sizes, full or empty, with a glint that moves across the vessel. 16 × 16 pixels.",
  },
  params: {
    kind: { type: "choice", options: ["mug", "bottle", "goblet", "cup"], default: "mug", label: { de: "Gefäß", en: "Kind" },
      labels: { mug: { de: "Humpen", en: "mug" }, bottle: { de: "Flasche", en: "bottle" }, goblet: { de: "Kelch", en: "goblet" }, cup: { de: "Tasse", en: "cup" } },
      describe: { de: "Was getrunken wird: ein hölzerner Humpen mit Henkel rechts und zwei Pixel hohem Schaum, eine hohe Flasche mit Hals und Korken (das Getränk sieht man durchs Glas bis zur Schulter), ein weiter Kelch auf Stiel und Fuß, eine kleine Tasse mit Untertasse und zwei Pixeln Dampf.", en: "What is drunk from: a wooden mug with a handle on the right and a foam head 2 pixels high, a tall bottle with a neck and a cork (the drink shows through the glass up to the shoulder), a wide goblet on a stem and a foot, a small cup with a saucer and two pixels of steam." } },
    vessel: { type: "color", default: "#8a5a32", label: { de: "Gefäßfarbe", en: "Vessel colour" },
      describe: { de: "Farbe des Gefäßes: Holz #8a5a32, grünes Glas #3a6a3a, Gold #c8a040, Porzellan #e8e8f0.", en: "Colour of the vessel: wood #8a5a32, green glass #3a6a3a, gold #c8a040, porcelain #e8e8f0." } },
    drink: { type: "color", default: "#c8902a", label: { de: "Getränkefarbe", en: "Drink colour" },
      describe: { de: "Farbe des Getränks: Bier #c8902a, Rotwein #6a1a2a, Kelchwein #8a1a2a, Tee #8a5a2a.", en: "Colour of the drink: ale #c8902a, red wine #6a1a2a, goblet wine #8a1a2a, tea #8a5a2a." } },
    full: { type: "boolean", default: true, label: { de: "Gefüllt", en: "Full" },
      describe: { de: "Aus: das Gefäß ist leer, ohne Schaum und ohne Dampf. An: gefüllt mit dem Getränk.", en: "Off: the vessel is empty, with no foam and no steam. On: filled with the drink." } },
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "small" }, large: { de: "groß", en: "large" } },
      describe: { de: "Wie viel vom Rahmen gefüllt ist: klein füllt etwa 9 Pixel, groß 12 Pixel wie bei einem großen Humpen.", en: "How much of the frame the drink fills: small about 9 pixels, large 12 like a big tankard." } },
  },
  presets: {
    ale: { label: { de: "Bier", en: "Ale" }, values: { kind: "mug", vessel: "#8a5a32", drink: "#c8902a" } },
    "wine-bottle": { label: { de: "Weinflasche", en: "Wine bottle" }, values: { kind: "bottle", vessel: "#3a6a3a", drink: "#6a1a2a" } },
    goblet: { label: { de: "Kelch", en: "Goblet" }, values: { kind: "goblet", vessel: "#c8a040", drink: "#8a1a2a" } },
    tea: { label: { de: "Tee", en: "Tea" }, values: { kind: "cup", vessel: "#e8e8f0", drink: "#8a5a2a" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const v = ramp(p.vessel), d = ramp(p.drink), gross = p.size === "large", n = gross ? 12 : 9, y0 = Math.round((H - n) / 2);
    return (animation, _dir, f) => {
      const b = new Pixels(W, H);
      // the box the glint runs through, upper left to lower right: [x0, y0, x1, y1]
      let box: [number, number, number, number];
      if (p.kind === "mug") {
        const bw = gross ? 8 : 6, x0 = Math.round((W - bw - 2) / 2);
        b.part(x0, y0, bw, n, v);
        for (const y of [y0 + 4, y0 + n - 3]) for (let x = x0; x < x0 + bw; x++) b.set(x, y, v.dark);
        // the handle on the right: a ring two pixels wide
        for (let y = y0 + 2; y <= y0 + n - 3; y++) {
          const rand = y === y0 + 2 || y === y0 + n - 3;
          b.set(x0 + bw + 1, y, v.dark);
          if (rand) b.set(x0 + bw, y, v.dark);
        }
        for (let x = x0 + 1; x < x0 + bw - 1; x++) b.set(x, y0, p.full ? SCHAUM.light : v.deep);
        if (p.full) {
          for (let x = x0; x < x0 + bw; x++) { b.set(x, y0, SCHAUM.light); b.set(x, y0 + 1, x === x0 + bw - 1 ? SCHAUM.dark : SCHAUM.base); }
          for (let x = x0 + 1; x < x0 + bw - 1; x++) b.set(x, y0 + 2, d.base);
        }
        box = [x0 + 1, y0 + 3, x0 + bw - 2, y0 + n - 2];
      } else if (p.kind === "bottle") {
        const c = gross ? 2 : 1, nk = gross ? 3 : 2, bh = n - c - nk - 1;
        b.rect(7, y0, 2, c, KORK.base); b.rect(8, y0, 1, c, KORK.dark); b.rect(7, y0, 2, 1, KORK.light);
        b.rect(7, y0 + c, 2, nk, v.light);
        const ys = y0 + c + nk;
        // the shoulder: the drink starts here
        for (let x = 6; x <= 9; x++) b.set(x, ys, x === 6 || x === 9 ? v.light : p.full ? d.dark : v.base);
        for (let j = 0; j < bh; j++) for (let x = 5; x <= 10; x++) {
          const wand = x === 5 || x === 10 || j === bh - 1;
          b.set(x, ys + 1 + j, wand ? v.light : p.full ? d.dark : v.base);
        }
        box = [6, y0 + c, 9, y0 + n - 2];
      } else if (p.kind === "goblet") {
        const bowl = gross ? [10, 10, 8, 8, 6, 4] : [8, 8, 6, 4], bh = bowl.length, fw = gross ? 8 : 6;
        bowl.forEach((w, j) => {
          const x0 = Math.round(8 - w / 2);
          for (let x = x0; x < x0 + w; x++) {
            const wand = x === x0 || x === x0 + w - 1;
            b.set(x, y0 + j, j === 0 ? v.light : j === bh - 1 ? v.dark : wand ? (x === x0 ? v.light : v.dark) : p.full ? d.base : v.deep);
          }
        });
        b.rect(7, y0 + bh, 2, n - bh - 2, v.base); b.rect(8, y0 + bh, 1, n - bh - 2, v.dark);
        b.rect(8 - fw / 2 + 1, y0 + n - 2, fw - 2, 1, v.base);
        b.rect(8 - fw / 2, y0 + n - 1, fw, 1, v.dark);
        box = [Math.round(8 - bowl[0] / 2) + 1, y0 + 1, Math.round(8 + bowl[0] / 2) - 2, y0 + bh - 2];
      } else {
        const cw = gross ? 8 : 6, ch = gross ? 7 : 5, x0 = Math.round((W - cw) / 2) - 1, yc = y0 + n - ch - (gross ? 2 : 1);
        b.part(x0, yc, cw, ch, v);
        for (let x = x0 + 1; x < x0 + cw - 1; x++) b.set(x, yc, p.full ? d.base : v.deep);
        // the handle: a small ring on the right
        for (let y = yc + 1; y <= yc + ch - 2; y++) {
          b.set(x0 + cw + 1, y, v.dark);
          if (y === yc + 1 || y === yc + ch - 2) b.set(x0 + cw, y, v.dark);
        }
        // the saucer
        const sw = cw + 4, sx = x0 - 2 + 0;
        b.rect(sx + 1, yc + ch, sw - 2, 1, v.light);
        b.rect(sx, yc + ch + (gross ? 1 : 0), sw, 1, v.dark);
        if (gross) b.rect(sx + 1, yc + ch + 1, sw - 2, 1, v.dark);
        if (p.full) { b.set(7, y0 + 1, DAMPF.base); b.set(8, y0, DAMPF.light); }
        box = [x0 + 1, yc + 1, x0 + cw - 2, yc + ch - 2];
      }
      // the glint: still in idle, moving one step to the lower right in the shine animation
      const g = animation === "shine" ? f : 0, t = g / 3;
      const gx = Math.round(box[0] + (box[2] - box[0]) * t), gy = Math.round(box[1] + (box[3] - box[1]) * t);
      if (b.alpha(gx, gy)) b.set(gx, gy, GLANZ);
      return b;
    };
  },
});
