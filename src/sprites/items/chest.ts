import { hex, Pixels, ramp } from "../../core/pixels";
import { defineSprite } from "../define";

const W = 16, H = 16;
const GOLD = ramp("#f0c419"), GLANZ = hex("#fffbe6");

export const chest = defineSprite({
  id: "chest-sprite", category: "items",
  title: { de: "Truhe", en: "Chest" },
  description: {
    de: "Eine Truhe als Pixel-Symbol für Inventar und Beute: gewölbter oder flacher Deckel, Beschläge und Schloss frei, Gold im Inneren; im Open-Loop hebt sich der Deckel. 16 × 16 Pixel.",
    en: "A chest as a pixel icon for inventories and loot: arched or flat lid, fittings and lock as you like, gold inside; in the open loop the lid rises. 16 × 16 pixels.",
  },
  params: {
    lid: { type: "choice", options: ["arched", "flat"], default: "arched", label: { de: "Deckel", en: "Lid" },
      labels: { arched: { de: "gewölbt", en: "arched" }, flat: { de: "flach", en: "flat" } },
      describe: { de: "Form des Deckels: gewölbt wie eine Schatztruhe, flach wie eine Werkzeugkiste.", en: "Shape of the lid: arched like a treasure chest, flat like a tool chest." } },
    wood: { type: "color", default: "#8a5a33", label: { de: "Holz", en: "Wood" },
      describe: { de: "Farbe des Holzes: Eiche #8a5a33, dunkles Nussbaum #5d4126, helles Kiefer #c19263.", en: "Colour of the wood: oak #8a5a33, dark walnut #5d4126, light pine #c19263." } },
    metal: { type: "color", default: "#c9a548", label: { de: "Beschläge", en: "Fittings" },
      describe: { de: "Farbe der Bänder und des Schlosses: Messing #c9a548, Eisen #5b6068, Silber #c9ced6.", en: "Colour of the bands and the lock: brass #c9a548, iron #5b6068, silver #c9ced6." } },
    lock: { type: "boolean", default: true, label: { de: "Schloss", en: "Lock" },
      describe: { de: "Schloss mit Überfall in der Mitte; ohne bleibt die Vorderseite schlicht.", en: "A lock with a hasp in the middle; without it the front stays plain." } },
    gold: { type: "integer", min: 0, max: 3, default: 2, label: { de: "Gold", en: "Gold" },
      describe: { de: "Gold im Inneren, sichtbar sobald der Deckel steigt: 0 leer, 1 etwas, 3 bis zum Rand.", en: "Gold inside, seen as soon as the lid rises: 0 empty, 1 a little, 3 to the brim." } },
  },
  presets: {
    wooden: { label: { de: "Holztruhe", en: "Wooden" }, values: { lid: "flat", lock: false, wood: "#a2703f", metal: "#7a5c38" } },
    "iron-bound": { label: { de: "Eisern beschlagen", en: "Iron-bound" }, values: { wood: "#5d4126", metal: "#5b6068", gold: 0 } },
    golden: { label: { de: "Schatztruhe", en: "Golden" }, values: { wood: "#7a4a24", metal: "#f0c419", gold: 3 } },
  },
  frame: { w: W, h: H },
  directions: ["down"],
  animations: [{ name: "idle", frames: 1, fps: 1, loop: true }, { name: "open", frames: 4, fps: 6, loop: false }],
  grounded: false,
  build(p) {
    const h = ramp(p.wood), m = ramp(p.metal);
    // The lid from its top row down (x spans, both inside); closed its last row rests on the rim at row 9
    const brett: [number, number][] = p.lid === "arched" ? [[4, 11], [3, 12], [2, 13], [2, 13]] : [[2, 13], [2, 13], [2, 13], [2, 13]];
    return (animation, _d, f) => {
      const b = new Pixels(W, H), hub = animation === "open" ? f : 0;
      // The dark inside, free where the lid has risen, with the gold lying in it
      for (let y = 9 - hub; y <= 8; y++) b.rect(3, y, 10, 1, h.deep);
      const schichten = Math.min(p.gold, hub);
      for (let k = 0; k < schichten; k++) {
        const y = 8 - k, l = 4 + k, r = 11 - k, oben = k === schichten - 1;
        for (let x = l; x <= r; x++) b.set(x, y, x === r ? GOLD.dark : oben ? GOLD.light : GOLD.base);
      }
      if (schichten > 0) b.set(5 + schichten, 9 - schichten, GLANZ);
      // The box: the rim the lid rests on, planks with a seam, metal corners
      for (let x = 2; x <= 13; x++) b.set(x, 9, x === 2 ? m.light : x === 13 ? m.dark : m.base);
      for (let y = 10; y <= 14; y++) {
        b.set(2, y, y === 14 ? m.deep : y === 10 ? m.light : m.base);
        b.set(13, y, m.dark);
        for (let x = 3; x <= 12; x++) b.set(x, y, y === 14 || y === 12 || x === 12 ? h.dark : y === 10 ? h.light : h.base);
      }
      // The lid: wood with a metal strap, its edge bound like the corners of the box
      brett.forEach(([l, r], i) => {
        const y = 5 - hub + i, unten = i === brett.length - 1;
        for (let x = l; x <= r; x++) {
          const kante = x === l || x === r;
          b.set(x, y, i === 1 ? (kante ? (x === l ? m.light : m.dark) : m.base)
            : unten ? (hub ? h.deep : m.dark)
            : kante ? (x === l ? m.base : m.dark)
            : i === 0 ? h.light
            : x >= r - 1 ? h.dark : x <= l + 1 ? h.light : h.base);
        }
      });
      // The hasp rises with the lid, the plate stays on the front
      if (p.lock) {
        brett.forEach((_, i) => { const y = 5 - hub + i; b.set(7, y, i === 0 ? m.light : m.base); b.set(8, y, i === 0 ? m.base : m.dark); });
        for (let y = 10; y <= 13; y++) for (let x = 6; x <= 9; x++) b.set(x, y, y === 10 ? m.light : x === 9 || y === 13 ? m.dark : m.base);
        b.rect(7, 11, 2, 2, h.deep);
      }
      return b;
    };
  },
});
