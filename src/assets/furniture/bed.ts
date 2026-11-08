import { SphereGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const bed = defineAsset({
  id: "bed", category: "furniture",
  title: { de: "Bett", en: "Bed" },
  description: { de: "Ein Bett mit Holzrahmen, Matratze, Decke und Kissen: Einzel- oder Doppelbett, mit Kopf- und auf Wunsch Fußteil.", en: "A bed with a wooden frame, mattress, blanket and pillows: single or double, with a headboard and, if you like, a footboard." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.9, max: 2, step: 0.05, default: 1.4, unit: "m",
      describe: { de: "Breite der Matratze: 0,9 m ein Einzelbett, 1,4 m breit, 1,8 m ein Doppelbett.", en: "Width of the mattress: 0.9 m a single bed, 1.4 m wide, 1.8 m a double bed." } },
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 1.9, max: 2.2, step: 0.05, default: 2, unit: "m",
      describe: { de: "Länge der Matratze: 2 m üblich, 2,2 m für große Menschen.", en: "Length of the mattress: 2 m usual, 2.2 m for tall people." } },
    height: { type: "number", label: { de: "Liegehöhe", en: "Height" }, min: 0.35, max: 0.7, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Höhe der Liegefläche: 0,4 m niedrig, 0,5 m üblich, 0,65 m bequem zum Aufstehen.", en: "Height of the sleeping surface: 0.4 m low, 0.5 m usual, 0.65 m easy to get up from." } },
    headboard: { type: "number", label: { de: "Kopfteil", en: "Headboard" }, min: 0, max: 0.9, step: 0.01, default: 0.45, unit: "m",
      describe: { de: "Höhe des Kopfteils über der Matratze: 0 keins, 0,45 m üblich, 0,8 m hoch.", en: "Height of the headboard above the mattress: 0 none, 0.45 m usual, 0.8 m tall." } },
    footboard: { type: "boolean", label: { de: "Fußteil", en: "Footboard" }, default: false,
      describe: { de: "Ein niedriges Brett am Fußende.", en: "A low board at the foot end." } },
    pillows: { type: "integer", label: { de: "Kissen", en: "Pillows" }, min: 0, max: 2, default: 2,
      describe: { de: "Zahl der Kissen am Kopfende.", en: "Number of pillows at the head end." } },
    color: { type: "color", label: { de: "Holz", en: "Wood" }, default: "#9b7653",
      describe: { de: "Farbe des Rahmens.", en: "Colour of the frame." } },
    sheet: { type: "color", label: { de: "Laken", en: "Sheet" }, default: "#f0ede6",
      describe: { de: "Farbe von Laken und Kissen.", en: "Colour of the sheet and pillows." } },
    blanket: { type: "color", label: { de: "Decke", en: "Blanket" }, default: "#5a7fa8",
      describe: { de: "Farbe der Decke.", en: "Colour of the blanket." } },
  },
  presets: {
    single: { label: { de: "Einzelbett", en: "Single bed" }, values: { width: 0.9, pillows: 1 } },
    double: { label: { de: "Doppelbett", en: "Double bed" }, values: { width: 1.8, pillows: 2, headboard: 0.6 } },
    guest: { label: { de: "Gästebett", en: "Guest bed" }, values: { width: 1.4, footboard: true, blanket: "#9b4a3c", color: "#6e4a2c" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 3000, drawCalls: 3 },
  build(p) {
    const holz = material("wood", p.color, 1, 450), laken = material("paint", p.sheet, 1, 200), decke = material("paint", p.blanket, 1, 200), t = new Parts();
    const W = p.width, L = p.length, h = p.height, mat = 0.18, rahmen = 0.16, yr = h - mat;
    // Frame with legs, the mattress on it
    t.box(holz, W + 0.06, rahmen, L + 0.06, 0, yr - rahmen / 2, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.box(holz, 0.07, yr - rahmen, 0.07, sx * (W / 2 - 0.02), (yr - rahmen) / 2, sz * (L / 2 - 0.02));
    t.box(laken, W, mat, L, 0, yr + mat / 2, 0);
    if (p.headboard > 0.02) t.box(holz, W + 0.1, h + p.headboard, 0.05, 0, (h + p.headboard) / 2, -L / 2 - 0.055);
    if (p.footboard) t.box(holz, W + 0.1, h + 0.12, 0.05, 0, (h + 0.12) / 2, L / 2 + 0.055);
    // The blanket covers the foot end and hangs over the sides, folded back at the top
    const lang = L * 0.68;
    t.box(decke, W + 0.04, 0.04, lang, 0, h + 0.02, L / 2 - lang / 2);
    for (const sx of [-1, 1]) t.box(decke, 0.02, mat * 0.8, lang, sx * (W / 2 + 0.03), h - mat * 0.4 + 0.02, L / 2 - lang / 2);
    t.box(laken, W + 0.04, 0.05, 0.22, 0, h + 0.045, L / 2 - lang + 0.11);
    // Pillows: flattened ellipsoids
    const breite = p.pillows === 2 ? Math.min(0.32, W / 4 - 0.02) : Math.min(0.36, W / 2 - 0.06);
    for (let i = 0; i < p.pillows; i++) {
      const x = p.pillows === 2 ? (i ? 1 : -1) * W / 4 : 0;
      t.add(laken, new SphereGeometry(1, 14, 8).scale(breite, 0.07, 0.19).translate(x, h + 0.07, -L / 2 + 0.25));
    }
    return t.group();
  },
});
