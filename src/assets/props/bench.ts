import { BoxGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const bench = defineAsset({
  id: "bench", category: "props",
  title: { de: "Bank", en: "Bench" },
  description: { de: "Eine Sitzbank aus Latten: Parkbank mit Lehne, Gartenbank mit Armlehnen oder schlichte Bank ohne Lehne.", en: "A slatted bench: a park bench with a backrest, a garden bench with armrests or a plain bench without a back." },
  params: {
    length: { type: "number", label: { de: "Länge", en: "Length" }, min: 0.8, max: 2.5, step: 0.05, default: 1.6, unit: "m",
      describe: { de: "Länge: 1,2 m für zwei, 1,6 m für drei, 2,4 m für eine lange Reihe.", en: "Length: 1.2 m for two, 1.6 m for three, 2.4 m for a long row." } },
    slats: { type: "integer", label: { de: "Sitzlatten", en: "Seat slats" }, min: 2, max: 6, default: 4,
      describe: { de: "Zahl der Latten der Sitzfläche: 2 grob, 4 üblich, 6 fein.", en: "Number of slats in the seat: 2 coarse, 4 usual, 6 fine." } },
    backrest: { type: "boolean", label: { de: "Lehne", en: "Backrest" }, default: true,
      describe: { de: "Eine leicht geneigte Rückenlehne aus zwei Latten.", en: "A slightly tilted backrest of two slats." } },
    armrests: { type: "boolean", label: { de: "Armlehnen", en: "Armrests" }, default: false,
      describe: { de: "Armlehnen an beiden Enden.", en: "Armrests at both ends." } },
    frame: { type: "choice", label: { de: "Gestell", en: "Frame" }, options: ["metal", "wood"], labels: { metal: { de: "Metall", en: "Metal" }, wood: { de: "Holz", en: "Wood" } }, default: "metal",
      describe: { de: "Gestell aus Metall wie im Park oder aus Holz wie im Garten.", en: "A metal frame like in a park or a wooden one like in a garden." } },
    color: { type: "color", label: { de: "Latten", en: "Slats" }, default: "#a87444",
      describe: { de: "Farbe der Latten.", en: "Colour of the slats." } },
    frameColor: { type: "color", label: { de: "Gestellfarbe", en: "Frame colour" }, default: "#2f3236",
      describe: { de: "Farbe des Gestells.", en: "Colour of the frame." } },
  },
  presets: {
    park: { label: { de: "Parkbank", en: "Park bench" }, values: { backrest: true, frame: "metal", slats: 4 } },
    garden: { label: { de: "Gartenbank", en: "Garden bench" }, values: { length: 1.3, backrest: true, armrests: true, frame: "wood", frameColor: "#7a5534", color: "#9a6a3e" } },
    plain: { label: { de: "Schlichte Bank", en: "Plain bench" }, values: { backrest: false, slats: 3, frame: "wood", frameColor: "#8a6440" } },
  },
  physics: { body: "static", collider: "box" },
  budget: { triangles: 1500, drawCalls: 2 },
  build(p) {
    const latte = material("wood", p.color), gestell = material(p.frame, p.frameColor), t = new Parts();
    const L = p.length, sitz = 0.45, tief = 0.42, dick = 0.03, spalt = 0.012;
    const lb = (tief - spalt * (p.slats - 1)) / p.slats;
    for (let i = 0; i < p.slats; i++) t.box(latte, L, dick, lb, 0, sitz - dick / 2, -tief / 2 + lb / 2 + i * (lb + spalt));
    // Side frames at both ends (and one in the middle of a long bench)
    const xs = L > 1.9 ? [-(L / 2 - 0.12), 0, L / 2 - 0.12] : [-(L / 2 - 0.12), L / 2 - 0.12], s = p.frame === "metal" ? 0.04 : 0.06;
    for (const x of xs) {
      for (const z of [tief / 2 - 0.05, -tief / 2 + 0.05]) t.box(gestell, s, sitz - dick, s, x, (sitz - dick) / 2, z);
      t.box(gestell, s, s, tief, x, sitz - dick - s / 2, 0);
      t.box(gestell, s, s * 0.8, tief - 0.1, x, 0.12, 0);
      if (p.backrest) {
        // The back post leans back by 12°
        const g = new BoxGeometry(s, 0.5, s).translate(0, 0.25, 0).rotateX(-0.21).translate(x, sitz - dick, -tief / 2 + 0.05);
        t.add(gestell, g);
      }
      if (p.armrests && x !== 0) {
        t.box(gestell, s, 0.22, s, x, sitz + 0.11, tief / 2 - 0.08);
        t.box(latte, 0.07, dick, tief, x, sitz + 0.22 + dick / 2, -0.01);
      }
    }
    if (p.backrest) for (const [hoehe, b] of [[0.17, 0.09], [0.36, 0.09]]) {
      const g = new BoxGeometry(L, b, dick).translate(0, hoehe, 0).rotateX(-0.21).translate(0, sitz - dick, -tief / 2 + 0.05 - s / 2 - dick / 2);
      t.add(latte, g);
    }
    return t.group();
  },
});
