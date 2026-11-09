import { CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const sofa = defineAsset({
  id: "sofa", category: "furniture",
  title: { de: "Sofa", en: "Sofa" },
  description: { de: "Ein Sofa mit einem bis vier Sitzkissen, Lehne, Armlehnen und Beinen; Breite und Polsterung folgen der Sitzplatzzahl.", en: "A sofa with one to four seat cushions, a backrest, armrests and legs; width and upholstery follow the number of seats." },
  params: {
    seats: { type: "integer", label: { de: "Sitzplätze", en: "Seats" }, min: 1, max: 4, default: 3,
      describe: { de: "Zahl der Sitzkissen; jedes ist 0,6 m breit, das Sofa wird damit 0,6 m pro Platz plus Armlehnen breit.", en: "Number of seat cushions; each is 0.6 m wide, so the sofa grows 0.6 m per seat plus the armrests." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.7, max: 1, step: 0.01, default: 0.85, unit: "m",
      describe: { de: "Tiefe von der Vorderkante bis zur Rückseite: 0,75 m knapp, 0,85 m üblich, 1 m zum Lümmeln.", en: "Depth from the front edge to the back: 0.75 m snug, 0.85 m usual, 1 m for lounging." } },
    seatHeight: { type: "number", label: { de: "Sitzhöhe", en: "Seat height" }, min: 0.38, max: 0.48, step: 0.01, default: 0.44, unit: "m",
      describe: { de: "Höhe der Sitzfläche über dem Boden: 0,38 m tief, 0,44 m üblich, 0,48 m hoch.", en: "Height of the seat above the floor: 0.38 m low, 0.44 m usual, 0.48 m high." } },
    backHeight: { type: "number", label: { de: "Lehnenhöhe", en: "Back height" }, min: 0.25, max: 0.7, step: 0.01, default: 0.5, unit: "m",
      describe: { de: "Höhe der Lehne über der Sitzfläche: 0,35 m niedrig, 0,5 m üblich, 0,7 m hoch.", en: "Height of the backrest above the seat: 0.35 m low, 0.5 m usual, 0.7 m high." } },
    arms: { type: "choice", label: { de: "Armlehnen", en: "Armrests" }, options: ["none", "low", "high"],
      labels: { none: { de: "keine", en: "none" }, low: { de: "niedrig", en: "low" }, high: { de: "hoch", en: "high" } }, default: "low",
      describe: { de: "Armlehnen: keine für eine Bank, niedrige zum Ablegen, hohe zum Anlehnen.", en: "Armrests: none for a bench, low to rest an arm, high to lean against." } },
    legs: { type: "choice", label: { de: "Beine", en: "Legs" }, options: ["block", "tapered", "none"],
      labels: { block: { de: "blockig", en: "block" }, tapered: { de: "konisch", en: "tapered" }, none: { de: "keine", en: "none" } }, default: "tapered",
      describe: { de: "Beine aus Holz: blockig, konisch oder keins, dann steht das Sofa auf dem Korpus.", en: "Wooden legs: block, tapered or none, then the sofa stands on its base." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#7d7468",
      describe: { de: "Farbe des Polsterstoffs.", en: "Colour of the upholstery." } },
  },
  presets: {
    loveseat: { label: { de: "Zweisitzer", en: "Loveseat" }, values: { seats: 2, arms: "high", depth: 0.9, color: "#8a6f5f" } },
    "three-seater": { label: { de: "Dreisitzer", en: "Three-seater" }, values: { seats: 3, arms: "low", legs: "tapered", color: "#6f7b82" } },
    "armless-bench": { label: { de: "Sofa ohne Armlehnen", en: "Armless sofa" }, values: { seats: 4, arms: "none", legs: "block", backHeight: 0.34, color: "#9a8a70" } },
  },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 4000, drawCalls: 2 },
  build(p) {
    const stoff = material("paint", p.color, 1, 250), holz = material("wood", "#6b4a2f", 1, 500), t = new Parts();
    const unit = 0.6, seatW = p.seats * unit, ct = 0.15, bd = 0.16, gap = 0.025;
    const sideT = p.arms === "none" ? 0.06 : 0.14, W = seatW + sideT * 2, D = p.depth;
    const legH = p.legs === "none" ? 0 : 0.12, frameH = p.seatHeight - ct - legH;
    t.box(stoff, W, frameH, D, 0, legH + frameH / 2, 0);
    const cz = (bd - 0.02) / 2, cd = D - 0.02 - bd;
    for (let i = 0; i < p.seats; i++) {
      const x = -seatW / 2 + unit / 2 + i * unit;
      t.box(stoff, unit - gap, ct, cd, x, p.seatHeight - ct / 2, cz);
    }
    const bh = p.backHeight + ct;
    t.box(stoff, W, bh, bd, 0, p.seatHeight - ct + bh / 2, -D / 2 + bd / 2);
    const ch = p.backHeight - 0.08, cth = 0.14;
    for (let i = 0; i < p.seats; i++) {
      const x = -seatW / 2 + unit / 2 + i * unit;
      t.box(stoff, unit - gap, ch, cth, x, p.seatHeight + ch / 2, -D / 2 + bd + cth / 2);
    }
    if (p.arms !== "none") {
      const armRise = p.arms === "low" ? 0.15 : 0.3, armH = armRise + ct;
      for (const s of [-1, 1]) t.box(stoff, 0.14, armH, D - 0.06, s * (seatW / 2 + 0.07), p.seatHeight - ct + armH / 2, 0);
    }
    if (p.legs !== "none") {
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        const x = sx * (W / 2 - 0.09), z = sz * (D / 2 - 0.09);
        if (p.legs === "block") t.box(holz, 0.07, legH, 0.07, x, legH / 2, z);
        else t.add(holz, new CylinderGeometry(0.037, 0.022, legH, 10).translate(x, legH / 2, z));
      }
    }
    return t.group();
  },
});
