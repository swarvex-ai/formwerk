import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const STEIN = ramp("#7c7a74"), EISEN = ramp("#5b6068"), LOCH = hex("#1c1b20"), GLANZ = hex("#ffffff");

export const spikes = defineSprite({
  id: "spikes", category: "items",
  title: { de: "Stachelfalle", en: "Spike trap" },
  description: {
    de: "Eine Stachelfalle im Boden als Pixel-Symbol für Dungeons und Hindernisse: Zahl und Höhe der Stacheln und die Platte frei wählbar, mit einer Animation, in der die Stacheln aus den Löchern schnellen. 16 × 16 Pixel.",
    en: "A floor spike trap as a pixel icon for dungeons and obstacles: number and height of the spikes and the plate as you like, with an animation in which the spikes shoot out of their holes. 16 × 16 pixels.",
  },
  params: {
    count: { type: "integer", min: 2, max: 5, default: 4, label: { de: "Stacheln", en: "Spikes" },
      describe: { de: "Wie viele Stacheln in einer Reihe stehen: 2 eine schmale Falle, 4 üblich, 5 eine dichte Reihe.", en: "How many spikes stand in a row: 2 a narrow trap, 4 usual, 5 a dense row." } },
    height: { type: "integer", min: 3, max: 8, default: 6, label: { de: "Höhe", en: "Height" },
      describe: { de: "Wie hoch die Stacheln ausfahren, in Pixeln über der Platte: 3 kurze Dornen, 6 üblich, 8 lange Spieße.", en: "How far the spikes extend, in pixels above the plate: 3 short thorns, 6 usual, 8 long pikes." } },
    plate: { type: "choice", options: ["stone", "iron"], default: "stone", label: { de: "Platte", en: "Plate" },
      labels: { stone: { de: "Steinplatte", en: "stone slab" }, iron: { de: "Eisenrost", en: "iron grate" } },
      describe: { de: "Worin die Löcher sitzen: eine Steinplatte im Dungeonboden oder ein genieteter Eisenrost.", en: "What the holes sit in: a stone slab in a dungeon floor, or a riveted iron grate." } },
    metal: { type: "color", default: "#c9ccd2", label: { de: "Stacheln", en: "Spike colour" },
      describe: { de: "Farbe der Stacheln: Stahl #c9ccd2 blank, Rost #9a5a3a alt, Knochen #e8e0c8 für eine Gruft.", en: "Colour of the spikes: steel #c9ccd2 bright, rust #9a5a3a old, bone #e8e0c8 for a crypt." } },
  },
  presets: {
    dungeon: { label: { de: "Dungeonfalle", en: "Dungeon trap" }, values: { count: 4, height: 6, plate: "stone" } },
    rusty: { label: { de: "Rostige Falle", en: "Rusty trap" }, values: { count: 5, height: 5, plate: "iron", metal: "#9a5a3a" } },
    crypt: { label: { de: "Gruft", en: "Crypt" }, values: { count: 3, height: 8, metal: "#e8e0c8" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "spring", frames: 4, fps: 12, loop: false }],
  grounded: false,
  build(p) {
    const stahl = ramp(p.metal), py = 11;
    // Where the spikes stand: three pixels apart around the middle, at most from x 3 to x 12
    const weit = Math.min(9, 3 * (p.count - 1)), xs = Array.from({ length: p.count }, (_, k) => Math.round(7.5 - weit / 2 + (k * weit) / (p.count - 1)));
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      // The plate the spikes hide in, with a dark hole under every spike
      if (p.plate === "stone") b.part(2, py, 12, 3, STEIN);
      else { b.part(2, py, 12, 3, EISEN); b.set(3, py + 1, EISEN.light); b.set(12, py + 1, EISEN.light); }
      for (const x of xs) b.set(x, py, LOCH);
      // The spikes: hidden at rest; while springing they shoot up, bounce back a pixel and settle
      const aus = animation === "spring" ? [0.35, 1, 1, 1][f] : 0;
      const h = Math.round(p.height * aus) - (animation === "spring" && f === 2 ? 1 : 0);
      if (h > 0) xs.forEach((x, i) => {
        // every other spike stands lower, so the row ends in a jagged edge of points
        const hk = i % 2 ? Math.max(1, h - 2) : h;
        // a cone: three pixels wide at the foot (lit left, shaded right), one pixel up to the point
        for (let k = 1; k <= hk; k++) b.set(x, py - k, k === hk ? stahl.light : stahl.base);
        for (let k = 1; k <= Math.floor(hk * 0.4); k++) { b.set(x - 1, py - k, stahl.light); b.set(x + 1, py - k, stahl.dark); }
      });
      if (animation === "spring" && f === 3 && h > 1) b.set(xs[0], py - h, GLANZ);
      return b;
    };
  },
});
