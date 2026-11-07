import { CylinderGeometry } from "three";
import { material } from "../../materials";
import { defineAsset, Parts } from "../define";

export const table = defineAsset({
  id: "table", category: "furniture",
  title: { de: "Tisch", en: "Table" },
  description: { de: "Tisch mit eckiger, runder oder ovaler Platte und Beinen, Bock oder Säule.", en: "A table with a rectangular, round or oval top and legs, trestles or a pedestal." },
  params: {
    width: { type: "number", label: { de: "Breite", en: "Width" }, min: 0.5, max: 3, step: 0.01, default: 1.4, unit: "m" },
    depth: { type: "number", label: { de: "Tiefe", en: "Depth" }, min: 0.4, max: 1.6, step: 0.01, default: 0.8, unit: "m" },
    height: { type: "number", label: { de: "Höhe", en: "Height" }, min: 0.35, max: 1.1, step: 0.01, default: 0.75, unit: "m" },
    top: { type: "choice", label: { de: "Platte", en: "Top" }, options: ["rect", "round", "oval"], labels: { rect: { de: "eckig", en: "rectangular" }, round: { de: "rund", en: "round" }, oval: { de: "oval", en: "oval" } }, default: "rect" },
    thickness: { type: "number", label: { de: "Plattenstärke", en: "Top thickness" }, min: 0.015, max: 0.1, step: 0.005, default: 0.04, unit: "m" },
    base: { type: "choice", label: { de: "Gestell", en: "Base" }, options: ["legs", "trestle", "pedestal"], labels: { legs: { de: "vier Beine", en: "four legs" }, trestle: { de: "Böcke", en: "trestles" }, pedestal: { de: "Säule", en: "pedestal" } }, default: "legs" },
    inset: { type: "number", label: { de: "Einzug der Beine", en: "Leg inset" }, min: 0.02, max: 0.3, step: 0.01, default: 0.06, unit: "m" },
    material: { type: "choice", label: { de: "Material", en: "Material" }, options: ["wood", "metal", "paint", "stone"], labels: { wood: { de: "Holz", en: "Wood" }, metal: { de: "Metall", en: "Metal" }, paint: { de: "lackiert", en: "Painted" }, stone: { de: "Stein", en: "Stone" } }, default: "wood" },
    color: { type: "color", label: { de: "Farbe", en: "Colour" }, default: "#a0703f" },
  },
  budget: { triangles: 3000, drawCalls: 1 },
  build(p) {
    const m = material(p.material, p.color);
    const t = new Parts();
    const w = p.width, d = p.top === "round" ? p.width : p.depth, ht = p.height - p.thickness;
    if (p.top === "rect") t.box(m, w, p.thickness, d, 0, p.height - p.thickness / 2, 0);
    else {
      const g = new CylinderGeometry(w / 2, w / 2, p.thickness, 48);
      g.scale(1, 1, d / w);
      g.translate(0, p.height - p.thickness / 2, 0);
      t.add(m, g);
    }
    const ix = w / 2 - p.inset, iz = d / 2 - p.inset, rund = p.top !== "rect" ? Math.SQRT1_2 : 1;
    if (p.base === "legs") {
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) t.post(m, 0.03, ht, sx * Math.max(0.05, ix * rund), 0, sz * Math.max(0.05, iz * rund), 10, p.material !== "metal");
    } else if (p.base === "trestle") {
      for (const sx of [1, -1]) {
        const x = sx * Math.max(0.1, ix * rund);
        t.box(m, 0.05, ht, 0.05, x, ht / 2, 0).box(m, 0.06, 0.05, Math.max(0.2, d * 0.8), x, 0.025, 0).box(m, 0.06, 0.05, Math.max(0.2, d * 0.8), x, ht - 0.025, 0);
      }
      t.box(m, Math.max(0.1, 2 * ix * rund), 0.05, 0.04, 0, ht * 0.35, 0);
    } else {
      t.post(m, 0.06, ht, 0, 0, 0, 16);
      const fuss = new CylinderGeometry(Math.min(w, d) * 0.3, Math.min(w, d) * 0.33, 0.04, 32);
      fuss.translate(0, 0.02, 0);
      t.add(m, fuss);
    }
    return t.group();
  },
});
