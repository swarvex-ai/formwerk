import { material } from "../../materials";
import { defineAsset, Parts } from "../define";
import { rounded } from "../shapes";

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
  budget: { triangles: 20000, drawCalls: 3 },
  build(p) {
    const wood = p.material === "wood";
    // Shelf boards and plinth lie level, sides, dividers and back stand upright; metal and paint use one material
    const lying = wood ? material("wood", p.color, 1, undefined, { grain: "level" }) : material(p.material, p.color);
    const up = wood ? material("wood", p.color) : lying;
    const t = new Parts();
    const metal = p.material === "metal", w = p.width, h = p.height, d = p.depth;
    const s = metal ? 0.003 : p.thickness, fuge = 0.0012, rk = Math.min(0.0025, s * 0.4);
    const kante = (m: typeof lying, bw: number, bh: number, bd: number, x: number, y: number, z: number) => t.add(m, rounded(bw, bh, bd, rk, x, y, z, 2));
    // Back panel set into the sides, 4 mm in from the rear edge; the boards end at its front face
    const zb = -d / 2 + 0.004, zv = zb + 0.003, tiefe = d / 2 - zv, zm = (d / 2 + zv) / 2;
    const sockel = metal ? 0.04 : Math.min(0.08, h * 0.1), innen = w - 2 * s;
    if (metal) {
      // Angle posts at the four corners: two flanges of 25 mm
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
        kante(up, 0.025, h, s, sx * (w / 2 - 0.0125), h / 2, sz * (d / 2 - s / 2));
        kante(up, s, h, 0.025, sx * (w / 2 - s / 2), h / 2, sz * (d / 2 - 0.0125));
      }
      if (p.back) kante(up, w - 2 * s, h - 0.01, s, 0, h / 2 + 0.005, -d / 2 + 1.5 * s);
    } else {
      for (const sx of [-1, 1]) kante(up, s, h, d, sx * (w / 2 - s / 2), h / 2, 0);
      if (p.back) kante(up, innen + 0.012, h - 0.012, 0.003, 0, h / 2, zb + 0.0015);
      // Plinth under the lowest shelf, set back from the front
      kante(lying, innen - 2 * fuge, sockel, 0.018, 0, sockel / 2, d / 2 - 0.045);
    }
    const bw = innen - 2 * fuge, ys: number[] = [];
    for (let i = 0; i <= p.rows; i++) {
      const y = sockel + s / 2 + (i * (h - sockel - s)) / p.rows;
      ys.push(y);
      kante(lying, bw, s, metal ? d - 2 * s : tiefe, 0, y, metal ? 0 : zm);
    }
    // Dividers fill each compartment between two boards
    for (let i = 0; i < p.rows; i++) for (let j = 1; j < p.columns; j++) {
      const y0 = ys[i] + s / 2 + fuge, y1 = ys[i + 1] - s / 2 - fuge;
      kante(up, s, y1 - y0, metal ? d - 2 * s : tiefe, -w / 2 + (j * w) / p.columns, (y0 + y1) / 2, metal ? 0 : zm);
    }
    return t.group();
  },
});
