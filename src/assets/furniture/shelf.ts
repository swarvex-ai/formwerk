import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const shelf = defineAsset({
  id: "shelf", category: "furniture",
  title: { de: "Regal", en: "Shelf" },
  description: { de: "Regal mit Fächern, Spalten und optionaler Rückwand.", en: "A shelf with compartments, columns and an optional back panel." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.3, max: 2.4, step: 0.01, default: 0.9, unit: "m",
      describe: { de: "Außenbreite des Regals.", en: "Outer width of the shelf." } },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.3, max: 2.6, step: 0.01, default: 1.8, unit: "m",
      describe: { de: "Außenhöhe; ein Bücherregal hat etwa 1,8 bis 2,2 m.", en: "Outer height; a bookcase is about 1.8 to 2.2 m." } },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.15, max: 0.7, step: 0.01, default: 0.35, unit: "m",
      describe: { de: "Tiefe der Böden: 0,3 m für Bücher, 0,35 m für Ordner, 0,5 m für Vorräte.", en: "Depth of the boards: 0.3 m for books, 0.35 m for files, 0.5 m for storage." } },
    rows: { type: "integer", label: { de: "Fächer übereinander", en: "Rows" }, min: 1, max: 10, default: 5,
      describe: { de: "Anzahl der Fächer übereinander (Böden = Fächer + 1).", en: "Number of compartments stacked (boards = rows + 1)." } },
    columns: { type: "integer", label: { de: "Spalten", en: "Columns" }, min: 1, max: 6, default: 1,
      describe: { de: "Anzahl der Spalten nebeneinander, getrennt durch senkrechte Wände.", en: "Number of columns side by side, separated by vertical dividers." } },
    thickness: { type: "number", label: { de: "Brettstärke", en: "Board thickness" }, min: 0.012, max: 0.05, step: 0.002, default: 0.02, unit: "m",
      describe: { de: "Stärke aller Bretter.", en: "Thickness of all boards." } },
    back: { type: "boolean", label: { de: "Rückwand", en: "Back panel" }, default: true,
      describe: { de: "Dünne Rückwand; ohne sie sieht man durch das Regal.", en: "A thin back panel; without it you can see through the shelf." } },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" } }, default: "wood",
      describe: { de: "Oberfläche aller Bretter.", en: "Surface of all boards." } },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#c49a6c",
      describe: { de: "Grundfarbe des Materials.", en: "Base colour of the material." } },
  },
  presets: {
    "cube-shelf": { label: { de: "Würfelregal", en: "Cube shelf" }, values: { width: 1.2, height: 1.2, depth: 0.4, rows: 3, columns: 3, material: "paint", color: "#e8e4dc" } },
    "storage-rack": { label: { de: "Lagerregal", en: "Storage rack" }, values: { width: 1, depth: 0.5, rows: 4, back: false, material: "metal", color: "#7d858f" } },
    "wall-board": { label: { de: "Wandbord", en: "Wall board" }, values: { width: 0.8, height: 0.3, depth: 0.2, rows: 1, back: false } },
  },
  physics: { body: "static", collider: "box" },
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
