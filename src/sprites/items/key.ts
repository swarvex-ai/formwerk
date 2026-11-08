import { CLEAR, hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;

export const key = defineSprite({
  id: "key", category: "items",
  title: { de: "Schlüssel", en: "Key" },
  description: {
    de: "Ein Schlüssel als Pixel-Symbol für Türen, Truhen und Rätsel: Reide rund, eckig oder als Kleeblatt, ein bis drei Zähne, mit wanderndem Glanz. 16 × 16 Pixel.",
    en: "A key as a pixel icon for doors, chests and puzzles: a round, square or clover bow, one to three teeth, with a moving glint. 16 × 16 pixels.",
  },
  params: {
    bow: { type: "choice", options: ["round", "square", "clover"], default: "round", label: { de: "Reide", en: "Bow" },
      labels: { round: { de: "rund", en: "round" }, square: { de: "eckig", en: "square" }, clover: { de: "Kleeblatt", en: "clover" } },
      describe: { de: "Griff des Schlüssels: rund schlicht, eckig modern, Kleeblatt verziert wie ein alter Schlossschlüssel.", en: "Handle of the key: round and plain, square and modern, a clover ornate like an old castle key." } },
    teeth: { type: "integer", min: 1, max: 3, default: 2, label: { de: "Zähne", en: "Teeth" },
      describe: { de: "Zähne am Bart: 1 schlicht, 3 aufwendig.", en: "Teeth on the bit: 1 simple, 3 elaborate." } },
    length: { type: "integer", min: 5, max: 8, default: 7, label: { de: "Länge", en: "Length" },
      describe: { de: "Länge des Schafts in Pixeln.", en: "Length of the shaft in pixels." } },
    color: { type: "color", default: "#d4a93c", label: { de: "Metall", en: "Metal" },
      describe: { de: "Messing #d4a93c, Eisen #9aa3ad, Gold #f0c419, Rost #a0583a.", en: "Brass #d4a93c, iron #9aa3ad, gold #f0c419, rust #a0583a." } },
  },
  presets: {
    brass: { label: { de: "Messingschlüssel", en: "Brass key" }, values: { bow: "round", color: "#d4a93c" } },
    castle: { label: { de: "Schlossschlüssel", en: "Castle key" }, values: { bow: "clover", teeth: 3, length: 8, color: "#9aa3ad" } },
    golden: { label: { de: "Goldener Schlüssel", en: "Golden key" }, values: { bow: "square", teeth: 1, color: "#f0c419" } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "shine", frames: 4, fps: 8, loop: true }],
  grounded: false,
  build(p) {
    const m = ramp(p.color), weiss = hex("#ffffff"), ende = Math.min(14, 7 + p.length), y = 7;
    return (animation, _d, f) => {
      const b = new Pixels(W, H);
      // The bow on the left with a hole through it
      if (p.bow === "round") { b.ellipse(4, y + 0.5, 3, 3, m); b.rect(3, y - 1, 2, 2, CLEAR); }
      else if (p.bow === "square") { b.part(1, y - 3, 6, 7, m, true); b.rect(3, y - 1, 2, 2, CLEAR); }
      else { for (const [cx, cy] of [[4, y - 2], [3, y + 0.5], [4, y + 3]]) b.ellipse(cx, cy, 1.6, 1.6, m); b.set(4, y, m.base); b.set(3, y, CLEAR); }
      // The shaft, then the bit with its teeth hanging down
      b.rect(7, y, ende - 7, 1, m.light);
      b.rect(7, y + 1, ende - 7, 1, m.dark);
      for (let k = 0; k < p.teeth; k++) { const x = ende - 1 - k * 2; b.rect(x, y + 2, 1, k % 2 ? 2 : 3, m.base); }
      // A glint that runs along the shaft
      if (animation === "shine") b.set(8 + Math.round(((ende - 9) * f) / 3), y, weiss);
      return b;
    };
  },
});
