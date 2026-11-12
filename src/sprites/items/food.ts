import { CLEAR, hex, Pixels, ramp, type RGBA, type Ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const BLATT = ramp("#5f9e3f"), STIEL = ramp("#7a5230"), KNOCHEN = ramp("#e8e0cf");

export const food = defineSprite({
  id: "food", category: "items",
  title: { de: "Lebensmittel", en: "Food" },
  description: {
    de: "Ein Nahrungsmittel als Pixel-Symbol für Leben und Inventar: Apfel, Brot, Käse oder Keule in zwei Größen, angerissen oder frisch, mit Glanz, der über das Stück wandert. 16 × 16 Pixel.",
    en: "A piece of food as a pixel icon for health and inventories: apple, bread, cheese or a drumstick in two sizes, whole or bitten, with a glint that moves across the piece. 16 × 16 pixels.",
  },
  params: {
    kind: { type: "choice", options: ["apple", "bread", "cheese", "meat"], default: "apple", label: { de: "Sorte", en: "Kind" },
      labels: { apple: { de: "Apfel", en: "apple" }, bread: { de: "Brot", en: "bread" }, cheese: { de: "Käse", en: "cheese" }, meat: { de: "Keule", en: "drumstick" } },
      describe: { de: "Was auf dem Teller liegt: ein runder Apfel mit Stiel und Blatt, ein ovaler Brotlaib mit drei schrägen Schnitten, ein Käsekeil mit drei runden Löchern, eine Keule mit Knochenende.", en: "What lies on the plate: a round apple with a stalk and a leaf, an oval bread loaf with three diagonal cuts, a cheese wedge with three round holes, a drumstick with a bone end." } },
    colour: { type: "color", default: "#c8372d", label: { de: "Farbe", en: "Colour" },
      describe: { de: "Grundfarbe des Lebensmittels: Apfel #c8372d, grüner Apfel #7fb03a, Brot #c48a45, Käse #e8c24a, Keule #a5503a.", en: "Base colour of the food: apple #c8372d, green apple #7fb03a, bread #c48a45, cheese #e8c24a, drumstick #a5503a." } },
    size: { type: "choice", options: ["small", "large"], default: "small", label: { de: "Größe", en: "Size" },
      labels: { small: { de: "klein", en: "small" }, large: { de: "groß", en: "large" } },
      describe: { de: "Wie viel vom Rahmen gefüllt ist: klein füllt etwa 9 Pixel, groß 12 Pixel wie bei einer großen Handvoll.", en: "How much of the frame the food fills: small about 9 pixels, large 12 like a handful." } },
    bitten: { type: "boolean", default: false, label: { de: "Angerissen", en: "Bitten" },
      describe: { de: "Ein runder Biss oben rechts aus dem Lebensmittel, für den Rest, den ein Charakter noch mit sich trägt.", en: "A round bite taken out of the top right, for the leftover a character still carries." } },
  },
  presets: {
    apple: { label: { de: "Apfel", en: "Apple" }, values: { kind: "apple", colour: "#c8372d" } },
    "green-apple": { label: { de: "Grüner Apfel", en: "Green apple" }, values: { kind: "apple", colour: "#7fb03a" } },
    bread: { label: { de: "Brot", en: "Bread" }, values: { kind: "bread", colour: "#c48a45" } },
    cheese: { label: { de: "Käse", en: "Cheese" }, values: { kind: "cheese", colour: "#e8c24a" } },
    meat: { label: { de: "Keule", en: "Meat" }, values: { kind: "meat", colour: "#a5503a" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const c = ramp(p.colour), weiss = hex("#ffffff"), groß = p.size === "large";
    return (animation, _d, f) => {
      const b = new Pixels(W, H), reihen = new Map<number, [number, number]>();
      // the body records its left and right pixel per row (the glint runs along its left edge), details do not
      const gueltig = (x: number, y: number) => x > 0 && y > 0 && x < W - 1 && y < H - 1;
      const punkt = (x: number, y: number, col: RGBA) => { if (gueltig(x, y)) b.set(x, y, col); };
      const koerper = (x: number, y: number, col: RGBA) => {
        if (!gueltig(x, y)) return;
        b.set(x, y, col);
        const r = reihen.get(y);
        if (r) { r[0] = Math.min(r[0], x); r[1] = Math.max(r[1], x); } else reihen.set(y, [x, x]);
      };
      const oval = (cx: number, cy: number, rx: number, ry: number, r: Ramp) => {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
          if (d > 1) continue;
          const seite = dx * 0.6 + dy * 0.8;
          koerper(x, y, d > 0.72 && seite > 0.2 ? r.dark : seite < -0.45 && d > 0.25 ? r.light : r.base);
        }
      };
      if (p.kind === "apple") oval(8, 9, groß ? 6 : 4.5, groß ? 5 : 4, c);
      else if (p.kind === "bread") oval(8, 9, groß ? 6 : 4.5, groß ? 4 : 3, c);
      else if (p.kind === "cheese") {
        // a wedge: narrow on top, wide at the bottom, the slanted right edge dark
        const [yOben, yUnten, hOben, hUnten] = groß ? [5, 13, 3.5, 6] : [6, 12, 2.5, 4.5];
        for (let y = yOben; y <= yUnten; y++) {
          const h = hOben + (hUnten - hOben) * ((y - yOben) / (yUnten - yOben));
          for (let x = Math.round(8 - h); x <= Math.round(8 + h) - 1; x++) koerper(x, y, y === yOben ? c.light : x >= Math.round(8 + h) - 1 || y === yUnten ? c.dark : c.base);
        }
      } else oval(7.5, 8, groß ? 5 : 3.5, groß ? 4.5 : 3.5, c);
      const oben = Math.min(...reihen.keys());
      // the details of each kind
      if (p.kind === "apple") {
        punkt(8, oben - 1, STIEL.base); punkt(8, oben - 2, STIEL.dark);
        punkt(7, oben - 1, BLATT.base); punkt(6, oben - 1, BLATT.dark); punkt(6, oben - 2, BLATT.light);
      } else if (p.kind === "bread") {
        for (const d of groß ? [-3, 0, 3] : [-2, 0, 2]) { punkt(8 + d - 1, 9, c.deep); punkt(8 + d, 8, c.deep); punkt(8 + d + 1, 7, c.deep); }
      } else if (p.kind === "cheese") {
        const rr = groß ? 1.7 : 1.3;
        for (const [hx, hy] of (groß ? [[6, 7], [10, 9], [7, 11]] : [[6, 8], [10, 9], [8, 11]]) as [number, number][]) {
          for (let y = Math.floor(hy - rr); y <= Math.ceil(hy + rr); y++) for (let x = Math.floor(hx - rr); x <= Math.ceil(hx + rr); x++) {
            const dx = x + 0.5 - hx, dy = y + 0.5 - hy;
            if (dx * dx + dy * dy <= rr * rr && b.alpha(x, y)) b.set(x, y, c.deep);
          }
        }
      } else {
        punkt(10, 10, KNOCHEN.base); punkt(11, 11, KNOCHEN.base); punkt(12, 12, KNOCHEN.base);
        punkt(12, 11, KNOCHEN.light); punkt(13, 11, KNOCHEN.base); punkt(13, 12, KNOCHEN.base);
        punkt(12, 13, KNOCHEN.dark); punkt(13, 13, KNOCHEN.dark);
      }
      // the bite: a round piece out of the top right corner of the body
      if (p.bitten) {
        const bx = Math.max(...Array.from(reihen.values(), ([, r]) => r)) - 1, r = groß ? 3 : 2.4;
        for (let y = oben - 1; y <= oben + Math.ceil(2 * r); y++) for (let x = Math.floor(bx - r); x <= bx + Math.ceil(r) + 1; x++) {
          const dx = x + 0.5 - bx, dy = y + 0.5 - (oben + 1);
          if (dx * dx + dy * dy <= r * r) b.set(x, y, CLEAR);
        }
      }
      // the glint: still in idle, moving one row down along the left edge in the shine animation
      const g = animation === "shine" ? f : 0, zeile = oben + 1 + g, lin = reihen.get(zeile);
      const gx = lin && b.alpha(lin[0] + 1, zeile) ? lin[0] + 1 : 8;
      if (b.alpha(gx, zeile)) b.set(gx, zeile, weiss);
      if (g < 3 && b.alpha(gx, zeile + 1)) b.set(gx, zeile + 1, c.light);
      return b;
    };
  },
});
