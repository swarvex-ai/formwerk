import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const shelf = defineAsset({
  id: "shelf", category: "furniture",
  title: { de: "Regal", en: "Shelf" },
  description: { de: "Regal mit Fächern, Spalten und optionaler Rückwand.", en: "A shelf with compartments, columns and an optional back panel." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.3, max: 2.4, step: 0.01, default: 0.9, unit: "m" },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 2.6, step: 0.01, default: 1.8, unit: "m" },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.15, max: 0.7, step: 0.01, default: 0.35, unit: "m" },
    rows: { type: "integer", label: { de: "Fächer übereinander", en: "Rows" }, min: 1, max: 10, default: 5 },
    columns: { type: "integer", label: { de: "Spalten", en: "Columns" }, min: 1, max: 6, default: 1 },
    thickness: { type: "number", label: { de: "Brettstärke", en: "Board thickness" }, min: 0.012, max: 0.05, step: 0.002, default: 0.02, unit: "m" },
    back: { type: "boolean", label: { de: "Rückwand", en: "Back panel" }, default: true },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" } }, default: "wood" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#c49a6c" },
  },
  budget: { triangles: 2000, drawCalls: 1 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const s = p.thickness, w = p.width, h = p.height, d = p.depth;
    for (const sx of [-1, 1]) t.box(m, s, h, d, sx * (w / 2 - s / 2), h / 2, 0);
    for (let i = 0; i <= p.rows; i++) t.box(m, w - 2 * s, s, d, 0, s / 2 + (i * (h - s)) / p.rows, 0);
    for (let j = 1; j < p.columns; j++) t.box(m, s, h - 2 * s, d, -w / 2 + (j * w) / p.columns, h / 2, 0);
    if (p.back) t.box(m, w, h, 0.006, 0, h / 2, -d / 2 + 0.003);
    return t.group();
  },
});
