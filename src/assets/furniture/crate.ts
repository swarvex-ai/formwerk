import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const crate = defineAsset({
  id: "crate", category: "furniture",
  title: { de: "Kiste", en: "Crate" },
  description: { de: "Lattenkiste mit Eckpfosten, wählbarer Lattenzahl und aufklappbarem Deckel.", en: "A slatted crate with corner posts, a choice of slats and a hinged lid." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.2, max: 1.6, step: 0.01, default: 0.6, unit: "m",
      describe: { de: "Außenbreite von links nach rechts.", en: "Outer width from left to right." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.15, max: 1.2, step: 0.01, default: 0.4, unit: "m",
      describe: { de: "Außenhöhe ohne Deckel.", en: "Outer height without the lid." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.2, max: 1.6, step: 0.01, default: 0.4, unit: "m",
      describe: { de: "Außentiefe von vorn nach hinten.", en: "Outer depth from front to back." } },
    slats: { type: "integer", label: { de: "Latten je Seite", en: "Slats per side" }, min: 2, max: 8, default: 4,
      describe: { de: "Latten je Seitenwand übereinander; zugleich die Zahl der Deckelbretter.", en: "Slats stacked in each side wall; also the number of lid boards." } },
    gap: { type: "number", label: { de: "Spalt", en: "Gap" }, min: 0, max: 0.04, step: 0.002, default: 0.012, unit: "m",
      describe: { de: "Spalt zwischen den Latten; 0 ergibt geschlossene Wände.", en: "Gap between the slats; 0 makes closed walls." } },
    lid: { type: "boolean", label: { de: "Deckel", en: "Lid" }, default: false,
      describe: { de: "Deckel, an der Hinterkante angeschlagen und aufklappbar (bewegliches Teil „lid“).", en: "A lid hinged at the back edge that opens (movable part \"lid\")." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "plastic", "metal"], labels: { wood: { de: "Holz", en: "Wood" }, plastic: { de: "Kunststoff", en: "Plastic" }, metal: { de: "Metall", en: "Metal" } }, default: "wood",
      describe: { de: "Holz mit Maserung, Kunststoff oder Metall.", en: "Wood with grain, plastic or metal." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#b08050",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    "fruit-crate": { label: { de: "Obstkiste", en: "Fruit crate" }, values: { width: 0.5, height: 0.3, depth: 0.35, slats: 3, gap: 0.02 } },
    "shipping-crate": { label: { de: "Transportkiste", en: "Shipping crate" }, values: { width: 1.2, height: 0.8, depth: 0.8, slats: 6, gap: 0.004, lid: true, color: "#a87c4f" } },
    "storage-bin": { label: { de: "Lagerbox", en: "Storage bin" }, values: { slats: 3, gap: 0, lid: true, material: "plastic", color: "#3b6ea5" } },
  },
  rig: { lid: { label: { de: "Deckel", en: "Lid" }, type: "rotate", axis: [-1, 0, 0], min: 0, max: 110 } },
  physics: { body: "dynamic", collider: "box" },
  budget: { triangles: 2500, drawCalls: 2 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const w = p.width, h = p.height, d = p.depth, s = 0.015, pf = 0.04;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.box(m, pf, h, pf, sx * (w / 2 - pf / 2), h / 2, sz * (d / 2 - pf / 2));
    t.box(m, w - 0.01, s, d - 0.01, 0, s / 2, 0);
    const lh = Math.max(0.01, (h - s - p.gap * (p.slats - 1)) / p.slats);
    for (let i = 0; i < p.slats; i++) {
      const y = s + lh / 2 + i * (lh + p.gap);
      for (const sz of [-1, 1]) t.box(m, w - 2 * pf, lh, s, 0, y, sz * (d / 2 - s / 2));
      for (const sx of [-1, 1]) t.box(m, s, lh, d - 2 * pf, sx * (w / 2 - s / 2), y, 0);
    }
    if (p.lid) {
      // Scharnier an der hinteren Oberkante; die Bretter laufen quer, zusammengehalten von zwei Leisten
      const deckel = t.moving("lid", 0, h, -d / 2);
      const n = p.slats, b = (d - p.gap * (n - 1)) / n;
      for (let i = 0; i < n; i++) deckel.box(m, w, s, Math.max(0.01, b), 0, h + s / 2, -d / 2 + b / 2 + i * (b + p.gap));
      for (const sx of [-1, 1]) deckel.box(m, 0.04, s, d - 0.02, sx * (w / 2 - pf - 0.03), h + s * 1.5, 0);
    }
    return t.group();
  },
});
